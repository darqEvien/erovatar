import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import type Player from 'video.js/dist/types/player';
import { type Episode, getVideoUrl, getSubtitleUrl, getNextEpisode } from '../data/episodes';
import { useStore } from '../store/useStore';
import { srtToVttBlob } from '../lib/srtParser';
import { useFirebaseProgress } from '../hooks/useFirebaseProgress';

interface VideoPlayerProps {
  episode: Episode;
  mini?: boolean;
  onGoNext?: () => void;
  // Yorumlardaki zaman damgası linklerinden (örn. profil sayfasından "@12:53"
  // tıklanarak) gelindiğinde, kayıtlı izleme ilerlemesi yerine bu saniyeden
  // başlatmak için kullanılır. Verilmezse normal kayıtlı ilerleme uygulanır.
  startTimeOverride?: number;
  // startTimeOverride gerçekten oynatıcıya uygulandıktan sonra çağrılır.
  // WatchPage bunu, ?t= URL parametresini güvenli bir zamanda temizlemek için kullanır.
  onReady?: () => void;
}

// WatchPage gibi üst bileşenlerin (örn. yorumlardaki zaman damgalarına
// tıklandığında) player'ı dışarıdan kontrol edebilmesi için dışa açılan arayüz.
export interface VideoPlayerHandle {
  seekTo: (seconds: number) => void;
  getCurrentTime: () => number;
}

// Thumbnail URL: /s1/e1/thumbnails.jpg
// Thumbnail VTT: /s1/e1/thumbnails.vtt
// NOT: video ve altyazı URL'leriyle aynı kök (getVideoUrl/getSubtitleUrl'deki gibi
// R2_BASE + /s{season}/e{episode}/...) — önceden burada fazladan bir "videos/"
// segmenti vardı ve bucket'taki gerçek yapıyla eşleşmediği için VTT hiç yüklenmiyordu.
function getThumbnailVttUrl(episode: Episode): string {
  const R2_BASE = (import.meta.env.VITE_R2_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? '';
  return `${R2_BASE}/s${episode.season}/e${episode.episode}/thumbnails.vtt`;
}

// ── Sprite thumbnail (scrub-bar hover preview) ───────────────────────────────
interface ThumbCue { start: number; end: number; url: string; x: number; y: number; w: number; h: number; }

// Basit bir WebVTT sprite-thumbnail ayrıştırıcısı.
// Beklenen format:
//   00:00:00.000 --> 00:00:10.000
//   thumbnails.jpg#xywh=0,0,160,90
function parseThumbnailVtt(text: string, vttUrl: string): ThumbCue[] {
  const base = vttUrl.slice(0, vttUrl.lastIndexOf('/') + 1);
  const timeRe = /(\d{2}):(\d{2}):(\d{2})[.,](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[.,](\d{3})/;
  const toSec = (h: string, m: string, s: string, ms: string) => (+h) * 3600 + (+m) * 60 + (+s) + (+ms) / 1000;
  const lines = text.split(/\r?\n/);
  const cues: ThumbCue[] = [];

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(timeRe);
    if (!m) continue;
    const start = toSec(m[1], m[2], m[3], m[4]);
    const end = toSec(m[5], m[6], m[7], m[8]);
    const dataLine = (lines[i + 1] || '').trim();
    if (!dataLine) continue;

    const [file, frag] = dataLine.split('#xywh=');
    const url = /^https?:\/\//.test(file) ? file : base + file;
    if (frag) {
      const [x, y, w, h] = frag.split(',').map(Number);
      cues.push({ start, end, url, x, y, w, h });
    } else {
      cues.push({ start, end, url, x: 0, y: 0, w: 0, h: 0 });
    }
  }
  return cues;
}

function formatScrubTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Video.js'in progress bar'ı üzerine YouTube benzeri bir scrub-thumbnail önizlemesi
// bağlar. video.js çekirdeği VTT sprite cue'larını otomatik render etmiyor, bu yüzden
// imperative olarak kendi DOM elemanlarımızı oluşturup mousemove ile besliyoruz.
function attachScrubThumbnailPreview(player: Player, rootEl: HTMLElement, cues: ThumbCue[]): (() => void) | null {
  const progressControl = rootEl.querySelector('.vjs-progress-control') as HTMLElement | null;
  if (!progressControl) return null;

  if (!progressControl.style.position) progressControl.style.position = 'relative';

  const preview = document.createElement('div');
  preview.className = 'vjs-scrub-thumb-preview';
  Object.assign(preview.style, {
    position: 'absolute',
    bottom: '26px',
    left: '0px',
    pointerEvents: 'none',
    opacity: '0',
    transform: 'translateX(-50%)',
    transition: 'opacity 0.12s ease',
    zIndex: '70',
  } as CSSStyleDeclaration);

  const frame = document.createElement('div');
  Object.assign(frame.style, {
    borderRadius: '8px',
    border: '2px solid var(--player-accent, var(--water-light))',
    boxShadow: '0 10px 28px rgba(0,0,0,0.65)',
    backgroundColor: '#000',
    backgroundRepeat: 'no-repeat',
    overflow: 'hidden',
  } as CSSStyleDeclaration);

  const timeLabel = document.createElement('div');
  Object.assign(timeLabel.style, {
    textAlign: 'center',
    marginTop: '4px',
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--parchment)',
    fontFamily: "'Cinzel', serif",
    letterSpacing: '0.04em',
    textShadow: '0 1px 4px rgba(0,0,0,0.85)',
  } as CSSStyleDeclaration);

  preview.appendChild(frame);
  preview.appendChild(timeLabel);
  progressControl.appendChild(preview);

  const findCue = (time: number): ThumbCue | null => {
    if (!cues.length) return null;
    // Cue'lar sıralı: doğrusal aramak yeterince hızlı (bölüm başına genelde birkaç yüz cue)
    for (const c of cues) {
      if (time >= c.start && time < c.end) return c;
    }
    return time >= cues[cues.length - 1].end ? cues[cues.length - 1] : cues[0];
  };

  const handleMove = (clientX: number) => {
    const duration = player.duration() || 0;
    if (!duration) return;
    const rect = progressControl.getBoundingClientRect();
    if (rect.width === 0) return;
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const hoverTime = ratio * duration;
    const cue = findCue(hoverTime);
    if (!cue) return;

    if (cue.w && cue.h) {
      frame.style.width = `${cue.w}px`;
      frame.style.height = `${cue.h}px`;
      frame.style.backgroundImage = `url("${cue.url}")`;
      frame.style.backgroundPosition = `-${cue.x}px -${cue.y}px`;
    }
    timeLabel.textContent = formatScrubTime(hoverTime);

    const previewWidth = cue.w || 160;
    const clampedLeft = Math.min(
      Math.max(clientX - rect.left, previewWidth / 2 + 4),
      rect.width - previewWidth / 2 - 4
    );
    preview.style.left = `${clampedLeft}px`;
    preview.style.opacity = '1';
  };

  const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
  const onMouseLeave = () => { preview.style.opacity = '0'; };
  const onTouchMove = (e: TouchEvent) => { if (e.touches[0]) handleMove(e.touches[0].clientX); };
  const onTouchEnd = () => { preview.style.opacity = '0'; };

  progressControl.addEventListener('mousemove', onMouseMove);
  progressControl.addEventListener('mouseleave', onMouseLeave);
  progressControl.addEventListener('touchmove', onTouchMove, { passive: true });
  progressControl.addEventListener('touchend', onTouchEnd);

  return () => {
    progressControl.removeEventListener('mousemove', onMouseMove);
    progressControl.removeEventListener('mouseleave', onMouseLeave);
    progressControl.removeEventListener('touchmove', onTouchMove);
    progressControl.removeEventListener('touchend', onTouchEnd);
    preview.remove();
  };
}

const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(function VideoPlayer({ episode, mini = false, onGoNext, startTimeOverride, onReady }, ref) {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const saveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { user, subtitleLanguage, autoPlayNext, subtitleSettings } = useStore();
  const { saveProgress, getProgress, loading } = useFirebaseProgress();

  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [showNextEpisode, setShowNextEpisode] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [playerReady, setPlayerReady] = useState(false);
  const [isAutoSkipCancelled, setIsAutoSkipCancelled] = useState(false);
  const nextEpisodeTriggeredRef = useRef(false);
  const skippedIntroRef = useRef(false);

  // ── Zaman damgası "göz atma" (peek) modu ────────────────────────────────────
  // Bir yorumdaki "@12:53" linkine tıklanarak (ya da ?t= ile sayfaya doğrudan
  // gelinerek) ileri sıçranınca, o konum HEMEN "gerçek izleme ilerlemesi"
  // sayılmasın. Kullanıcı sıçradığı yerden kesintisiz GRACE_SECONDS kadar
  // gerçekten izlerse, o zaman normal ilerleme kaydına geri dönülür. Aksi
  // halde (hemen çıkarsa) eski kayıtlı ilerlemesi korunur.
  const GRACE_SECONDS = 20;
  const externalSeekGraceRef = useRef(false);
  const graceWatchedRef = useRef(0);
  const lastGraceTimeRef = useRef(0);

  const nextEpisode = getNextEpisode(episode.season, episode.episode);

  // ── Dışa açılan kontrol (yorumlardaki zaman damgası tıklamaları için) ───────
  useImperativeHandle(ref, () => ({
    seekTo: (seconds: number) => {
      const player = playerRef.current;
      if (player && !player.isDisposed()) {
        externalSeekGraceRef.current = true;
        graceWatchedRef.current = 0;
        lastGraceTimeRef.current = seconds;
        player.currentTime(Math.max(0, seconds));
player.play()?.catch(() => {});
      }
    },
    getCurrentTime: () => {
      const player = playerRef.current;
      return player && !player.isDisposed() ? (player.currentTime() || 0) : 0;
    },
  }), []);

  // ── Save progress ──────────────────────────────────────────────────────────
  const handleSaveProgress = useCallback((forceCompleted?: boolean) => {
    const player = playerRef.current;
    if (!player || player.isDisposed() || !user) return;
    // Göz atma modundayken (bir zaman damgasına daha yeni sıçrandıysa) henüz
    // yeterince organik izleme birikmedi — bu anlık pozisyonu "gerçek ilerleme"
    // diye kaydetmeyelim (aksi halde 15sn'lik otomatik kayıt ya da sekmeyi
    // kapatma, sadece göz attığınız noktayı kalıcı ilerleme yapardı).
    // forceCompleted=true (video gerçekten bittiğinde) bu korumayı by-pass eder.
    if (externalSeekGraceRef.current && !forceCompleted) return;
    const currentTime = player.currentTime() || 0;
    const duration = player.duration() || 0;
    if (currentTime > 5 && duration > 0) {
      saveProgress(episode.id, episode.season, episode.episode, currentTime, duration, forceCompleted);
    }
  }, [episode, user, saveProgress]);

  // ── Subtitle language change ───────────────────────────────────────────────
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const textTracks = player.textTracks();
    if (!textTracks) return;
    for (let i = 0; i < textTracks.length; i++) {
      const t = (textTracks as unknown as Record<number, { kind: string; language: string; mode: string }>)[i];
      if (t.kind !== 'subtitles') continue;
      t.mode = t.language === subtitleLanguage ? 'showing' : 'disabled';
    }
  }, [subtitleLanguage]);

  // ── Altyazı görsel ayarları (yazı boyutu/renk/arkaplan vb.) değişince ──────
  // Örn. Firebase'den tercih geç yüklendiğinde, hâlihazırda çalışan player'a uygula.
  useEffect(() => {
    const player = playerRef.current;
    if (!player || player.isDisposed()) return;
    const tts = (player as any).textTrackSettings;
    if (!tts || !subtitleSettings || !Object.keys(subtitleSettings).length) return;
    try {
      tts.setValues(subtitleSettings);
      tts.updateDisplay();
    } catch (err) {
      console.warn('Altyazı ayarları uygulanamadı:', err);
    }
  }, [subtitleSettings]);

  // ── Next episode countdown ─────────────────────────────────────────────────
  const goToNextEpisode = useCallback(() => {
    if (nextEpisode) onGoNext?.();
  }, [nextEpisode, onGoNext]);

  useEffect(() => {
    if (showNextEpisode && countdown > 0) {
      const timer = setTimeout(() => setCountdown(prev => Math.max(0, prev - 1)), 1000);
      return () => clearTimeout(timer);
    } else if (showNextEpisode && countdown === 0) {
      goToNextEpisode();
    }
  }, [showNextEpisode, countdown, goToNextEpisode]);

  // ── Main player setup ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!videoRef.current || loading) return;

    const videoElement = document.createElement('video-js');
    videoElement.classList.add(mini ? 'vjs-mini-player' : 'vjs-big-play-centered');
    videoRef.current.appendChild(videoElement);

    setIsAutoSkipCancelled(false);
    nextEpisodeTriggeredRef.current = false;
    skippedIntroRef.current = false;

    const videoUrl = getVideoUrl(episode);
    const savedProgress = getProgress(episode.id);
    const startTime = startTimeOverride != null
      ? startTimeOverride
      : (savedProgress && !savedProgress.completed ? savedProgress.currentTime : 0);
    const cacheBusterUrl = `${videoUrl}${videoUrl.includes('?') ? '&' : '?'}_cb=${Date.now()}`;
const playerOptions = {
  autoplay: true,
  controls: true,
  playsinline: true,
  crossorigin: 'anonymous',
  responsive: true,
  fluid: false,
  fill: true,
  liveui: false,
  preload: 'auto',
  // SVG ikonlar: eski, bulanık icon-font yerine keskin, currentColor ile
  // temalandırılabilen modern ikonlar (video.js 8'de opt-in bir özellik).
  experimentalSvgIcons: true,
  persistTextTrackSettings: true,

playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
  html5: {
    vhs: {
      overrideNative: !videojs.browser.IS_SAFARI,
      useBandwidthFromLocalStorage: true,
    },
    nativeVideoTracks: videojs.browser.IS_SAFARI,
    nativeAudioTracks: videojs.browser.IS_SAFARI,
    nativeTextTracks: videojs.browser.IS_SAFARI,
  },
  // DEĞİŞEN KISIM: cacheBusterUrl kullanıyoruz
  sources: [{ src: cacheBusterUrl, type: 'application/x-mpegURL' }],


      ...(mini && {
        controlBar: {
          pictureInPictureToggle: false,
          fullscreenToggle: false,
          volumePanel: { inline: true },
          playToggle: true,
          currentTimeDisplay: true,
          timeDivider: true,
          durationDisplay: true,
          remainingTimeDisplay: false,
          progressControl: true,
        }
      })
    } as Parameters<typeof videojs>[1];

    const player = (videojs as any)(videoElement, playerOptions);
    playerRef.current = player;


    const tts = (player as any).textTrackSettings;
    if (tts) {
      const savedSettings = useStore.getState().subtitleSettings;
      if (savedSettings && Object.keys(savedSettings).length) {
        try {
          tts.setValues(savedSettings);
          tts.updateDisplay();
        } catch (err) {
          console.warn('Altyazı ayarları uygulanamadı:', err);
        }
      }

      // "Altyazı Ayarları" modalı kapanınca (Uygula / X / dışına tıklama / Sıfırla + kapat)
      // video.js zaten güncel değerleri kendi localStorage'ına yazıyor; biz aynı anda
      // Firebase'e de yazarak diğer cihazlarda da aynı tercihin görünmesini sağlıyoruz.
      const originalClose = tts.close.bind(tts);
      tts.close = (...args: unknown[]) => {
        originalClose(...args);
        try {
          const values = tts.getValues();
          useStore.getState().setSubtitleSettings(values);
        } catch (err) {
          console.warn('Altyazı ayarları kaydedilemedi:', err);
        }
      };
    }

    let isDisposing = false;

    // ── Subtitles ─────────────────────────────────────────────────────────────
    const fetchAndAddTrack = async (url: string, lang: 'tr' | 'en', label: string) => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`${label} not found`);
        const buf = await res.arrayBuffer();
        let srtText = '';
        try {
          srtText = new TextDecoder('utf-8', { fatal: true }).decode(buf);
        } catch {
          srtText = new TextDecoder('windows-1254').decode(buf);
        }
        const vttBlobUrl = srtToVttBlob(srtText);
        player.addRemoteTextTrack({ kind: 'subtitles', src: vttBlobUrl, srclang: lang, label, default: false }, false);
      } catch (err: any) {
        console.warn(`${label} subtitle error:`, err.message);
      }
    };

    let trackChangeListener: (() => void) | null = null;
    let cachedTracks: any = null;

    Promise.all([
      fetchAndAddTrack(getSubtitleUrl(episode, 'tr'), 'tr', 'Türkçe'),
      fetchAndAddTrack(getSubtitleUrl(episode, 'en'), 'en', 'English'),
    ]).then(() => {
      if (isDisposing || !player || player.isDisposed()) return;

      const textTracks = player.textTracks();
      cachedTracks = textTracks;
      const preferredLang = useStore.getState().subtitleLanguage;

      for (let i = 0; i < textTracks.length; i++) {
        const t = (textTracks as any)[i];
        if (t.kind !== 'subtitles') continue;
        t.mode = t.language === preferredLang ? 'showing' : 'disabled';
      }

      trackChangeListener = () => {
        if (isDisposing) return;
        let activeLang: 'tr' | 'en' | 'off' = 'off';
        for (let i = 0; i < textTracks.length; i++) {
          const t = (textTracks as any)[i];
          if (t.kind === 'subtitles' && t.mode === 'showing') {
            if (t.language === 'tr' || t.language === 'en') { activeLang = t.language as 'tr' | 'en'; break; }
          }
        }
        const currentLang = useStore.getState().subtitleLanguage;
        if (activeLang !== currentLang) useStore.getState().setSubtitleLanguage(activeLang);
        if (activeLang !== 'off') {
          for (let i = 0; i < textTracks.length; i++) {
            const t = (textTracks as any)[i];
            if (t.kind === 'subtitles' && t.mode === 'showing' && t.language !== activeLang) t.mode = 'disabled';
          }
        }
      };
      textTracks.addEventListener('change', trackChangeListener);
    });

    // ── loadedmetadata ─────────────────────────────────────────────────────────
    player.on('loadedmetadata', () => {
      setPlayerReady(true);
      if (startTimeOverride != null || startTime > 10) player.currentTime(startTime);
      if (startTimeOverride != null) {
        // Sayfaya doğrudan bir zaman damgası linkiyle (?t=773) gelindi —
        // bu da bir "sıçrama", organik izleme değil. Aynı göz atma korumasını uygula.
        externalSeekGraceRef.current = true;
        graceWatchedRef.current = 0;
        lastGraceTimeRef.current = startTimeOverride;
      }
      player.play().catch((err: any) => console.warn('Autoplay blocked:', err));
      // startTimeOverride (varsa) artık uygulandı — WatchPage'e haber veriyoruz
      // ki ?t= URL parametresini ancak ŞİMDİ, güvenle temizleyebilsin.
      onReady?.();
    });

    // ── Intro skip (90s window) ────────────────────────────────────────────────
    const INTRO_START = episode.introStart || 0;
    const INTRO_END = episode.introEnd || 90;

    // ── Double tap mobile ──────────────────────────────────────────────────────
    const videoElementNode = player.el();

    // ── Thumbnail VTT (sprite preview on hover) ──────────────────────────────
    let thumbCleanup: (() => void) | null = null;
    if (!mini) {
      const thumbVttUrl = getThumbnailVttUrl(episode);
      fetch(thumbVttUrl)
        .then(res => { if (!res.ok) throw new Error(`thumbnails.vtt bulunamadı (${res.status})`); return res.text(); })
        .then(text => {
          if (isDisposing) return;
          const cues = parseThumbnailVtt(text, thumbVttUrl);
          if (!cues.length) return;
          thumbCleanup = attachScrubThumbnailPreview(player, videoElementNode, cues);
        })
        .catch(err => console.warn('Thumbnail VTT yüklenemedi:', err.message));
    }

    let lastTapTime = 0;
    videoElementNode.addEventListener('touchstart', (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.vjs-control-bar')) return;
      const now = Date.now();
      if (now - lastTapTime < 300 && now - lastTapTime > 0) {
        if (player && !player.isDisposed()) {
          const rect = videoElementNode.getBoundingClientRect();
          const touchX = e.changedTouches[0].clientX - rect.left;
          player.currentTime(touchX > rect.width / 2
            ? Math.min(player.duration() || 0, (player.currentTime() || 0) + 10)
            : Math.max(0, (player.currentTime() || 0) - 10));
        }
      }
      lastTapTime = now;
    }, { passive: false });

    // ── Fullscreen + rotate ────────────────────────────────────────────────────
    player.on('fullscreenchange', async () => {
      if (player.isFullscreen()) {
        try { if ((window.screen.orientation as any)?.lock) await (window.screen.orientation as any).lock('landscape'); } catch {}
      } else {
        try { if ((window.screen.orientation as any)?.unlock) (window.screen.orientation as any).unlock(); } catch {}
      }
    });

    // ── timeupdate ─────────────────────────────────────────────────────────────
    player.on('timeupdate', () => {
      const currentTime = player.currentTime() || 0;
      const duration = player.duration() || 0;

      // Göz atma modundaysak: sadece kesintisiz/organik ilerlemeyi say (ör.
      // 0.25sn'lik normal timeupdate artışları). Yeni bir sıçrama ya da
      // duraklatma sayılmasın; delta 0'dan küçük ya da anormal büyükse
      // (ör. tekrar bir yere atlandıysa) sayaç sıfırlanmasın ama artmasın da.
      if (externalSeekGraceRef.current) {
        const delta = currentTime - lastGraceTimeRef.current;
        if (delta > 0 && delta < 1.5) {
          graceWatchedRef.current += delta;
        }
        lastGraceTimeRef.current = currentTime;
        if (graceWatchedRef.current >= GRACE_SECONDS) {
          // Kullanıcı sıçradığı yerden gerçekten yeterince izledi —
          // artık bu, gerçek ilerleme sayılır.
          externalSeekGraceRef.current = false;
        }
      }

      // Intro skip button
      if (currentTime >= INTRO_START && currentTime < INTRO_END && !skippedIntroRef.current) {
        setShowSkipIntro(true);
      } else {
        setShowSkipIntro(false);
        if (currentTime < INTRO_START || currentTime > INTRO_END) skippedIntroRef.current = false;
      }

      // Next episode countdown
      const outroStart = duration > 0 ? duration - 60 : 9999;
      if (autoPlayNext && duration > 0 && currentTime >= outroStart && nextEpisode && !isAutoSkipCancelled) {
        if (!nextEpisodeTriggeredRef.current) {
          nextEpisodeTriggeredRef.current = true;
          setShowNextEpisode(true);
          setCountdown(5);
          handleSaveProgress(true);
        }
      } else if (currentTime < outroStart || !autoPlayNext) {
        if (nextEpisodeTriggeredRef.current) {
          nextEpisodeTriggeredRef.current = false;
          setShowNextEpisode(false);
        }
      }
    });

    player.on('ended', () => { handleSaveProgress(true); if (nextEpisode) goToNextEpisode(); });

    player.on('error', () => {
      const err = player.error();
      if (err) console.error('VideoJS Error:', err);
    });

    saveIntervalRef.current = setInterval(() => handleSaveProgress(), 15000);

    const handleBeforeUnload = () => handleSaveProgress();
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Keyboard shortcuts
    const handleKeydown = (e: KeyboardEvent) => {
      if (!player || player.isDisposed()) return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      switch (e.key) {
        case 'ArrowLeft':  e.preventDefault(); player.currentTime(Math.max(0, (player.currentTime() || 0) - 10)); break;
        case 'ArrowRight': e.preventDefault(); player.currentTime(Math.min(player.duration() || 0, (player.currentTime() || 0) + 10)); break;
        case ' ': e.preventDefault(); player.paused() ? player.play().catch(console.warn) : player.pause(); break;
        case 'm': case 'M': e.preventDefault(); player.muted(!player.muted()); break;
        case 'f': case 'F':
          if (!mini) { e.preventDefault(); player.isFullscreen() ? player.exitFullscreen() : player.requestFullscreen(); }
          break;
        case 'n': case 'N': if (nextEpisode) goToNextEpisode(); break;
      }
    };
    window.addEventListener('keydown', handleKeydown, { capture: true });

    return () => {
      isDisposing = true;
      handleSaveProgress();
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('keydown', handleKeydown, { capture: true });
      if (cachedTracks && trackChangeListener) {
        try { cachedTracks.removeEventListener('change', trackChangeListener); } catch {}
      }
      if (thumbCleanup) thumbCleanup();
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [episode.id, loading, isAutoSkipCancelled, mini]);

  const skipIntro = useCallback(() => {
    const player = playerRef.current;
    if (player && !player.isDisposed()) {
      skippedIntroRef.current = true;
      player.currentTime(episode.introEnd - 1);
      setShowSkipIntro(false);
      // Mobile: fullscreen + rotate on intro skip
      if (window.innerWidth < 768) {
        (async () => {
          try {
            if (!player.isFullscreen()) await player.requestFullscreen();
            if ((window.screen.orientation as any)?.lock) await (window.screen.orientation as any).lock('landscape');
          } catch {}
        })();
      }
    }
  }, [episode.introEnd]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--night)' }}>
        <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--player-accent, var(--water-light))', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className={`group relative w-full aspect-video sm:h-full bg-black mx-auto ${mini ? 'rounded-full overflow-hidden' : ''}`}>
      <div ref={videoRef} className="w-full h-full absolute inset-0" />

      {/* ── Intro Skip Button ── */}
      {!mini && showSkipIntro && playerReady && (
        <button
          onClick={skipIntro}
          className="absolute bottom-16 sm:bottom-24 right-4 sm:right-8 z-[100] font-bold uppercase tracking-wider text-xs sm:text-sm avatar-title px-5 py-2.5 rounded transition-all active:scale-95 sm:hover:scale-105"
          style={{
            background: 'rgba(74,158,202,0.15)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(74,158,202,0.4)',
            color: 'var(--parchment)',
            boxShadow: '0 0 20px rgba(74,158,202,0.2)',
          }}
        >
          İntroyu Atla →
        </button>
      )}

      {/* ── Next Episode Countdown ── */}
      {!mini && showNextEpisode && nextEpisode && playerReady && (
        <div className="absolute bottom-20 sm:bottom-28 right-4 sm:right-8 left-4 sm:left-auto z-[100] animate-fade-in-up">
          <div
            className="relative flex items-center gap-4 p-4 sm:p-5 rounded-2xl max-w-sm mx-auto sm:mx-0 shadow-2xl"
            style={{
              background: 'rgba(7,13,26,0.92)',
              backdropFilter: 'blur(16px)',
              border: '1px solid var(--border-soft)',
            }}
          >
            <button
              onClick={e => { e.stopPropagation(); setIsAutoSkipCancelled(true); setShowNextEpisode(false); }}
              className="absolute -top-3 -right-3 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
              style={{ background: 'var(--water-mid)', border: '1px solid var(--border-soft)', color: 'var(--stone)' }}
            >
              ×
            </button>
            <button onClick={goToNextEpisode} className="flex items-center gap-4 text-left group w-full">
              {/* Countdown ring */}
              <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(74,158,202,0.15)" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="16" fill="none"
                    stroke="var(--player-accent, var(--water-light))"
                    strokeWidth="3"
                    strokeDasharray="100"
                    strokeDashoffset={100 - countdown * 20}
                    className="transition-all duration-1000 linear"
                  />
                </svg>
                <span className="absolute font-bold text-base" style={{ color: 'var(--parchment)' }}>{countdown}</span>
              </div>

              <div>
                <span className="avatar-title text-[9px] uppercase tracking-widest mb-1 block" style={{ color: 'var(--stone)' }}>
                  {nextEpisode.season > episode.season ? 'Yeni Kitap Başlıyor' : 'Sonraki Bölüm'}
                </span>
                <span className="avatar-title text-sm font-bold leading-tight block group-hover:text-white transition-colors" style={{ color: 'var(--parchment)' }}>
                  {nextEpisode.title}
                </span>
                <span className="avatar-title text-[10px] font-bold uppercase tracking-wider mt-1 block" style={{ color: 'var(--player-accent, var(--water-light))' }}>
                  Hemen Geç →
                </span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default VideoPlayer;