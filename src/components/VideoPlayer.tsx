import { useEffect, useRef, useState, useCallback } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import type Player from 'video.js/dist/types/player';
import { type Episode, getVideoUrl, getSubtitleUrl, getNextEpisode } from '../data/episodes';
import { useStore } from '../store/useStore';
import { parseSrt, srtToVttBlob, detectIntroGap } from '../lib/srtParser';
import { useFirebaseProgress } from '../hooks/useFirebaseProgress';
import { useNavigate } from 'react-router-dom';
import { introTimings } from '../data/introTimings';
import { outroTimings } from '../data/outroTimings';

interface VideoPlayerProps {
  episode: Episode;
  mini?: boolean;
}
const timeToSeconds = (timeStr: string | number): number => {
  if (!timeStr || timeStr === "00:00") return 0;
  if (typeof timeStr === 'number') return timeStr;
  const parts = timeStr.toString().split(':').map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
};

export default function VideoPlayer({ episode, mini = false }: VideoPlayerProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const saveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigate = useNavigate();
  const { user, subtitleLanguage, autoPlayNext } = useStore();
  const { saveProgress, getProgress, loading } = useFirebaseProgress();

  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [showNextEpisode, setShowNextEpisode] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [playerReady, setPlayerReady] = useState(false);
  const [isAutoSkipCancelled, setIsAutoSkipCancelled] = useState(false);
  const nextEpisodeTriggeredRef = useRef(false);
  const skippedIntroRef = useRef(false);
  const [, setDynamicIntro] = useState<{ start: number, end: number } | null>(null);

  const nextEpisode = getNextEpisode(episode.season, episode.episode);

  const handleSaveProgress = useCallback((forceCompleted?: boolean) => {
    const player = playerRef.current;
    if (!player || player.isDisposed() || !user) return;
    const currentTime = player.currentTime() || 0;
    const duration = player.duration() || 0;
    if (currentTime > 5 && duration > 0) {
      saveProgress(episode.id, episode.season, episode.episode, currentTime, duration, forceCompleted);
    }
  }, [episode, user, saveProgress]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const textTracks = player.textTracks();
    if (!textTracks) return;

    for (let i = 0; i < textTracks.length; i++) {
      const t = (textTracks as any)[i];
      if (t.kind !== 'subtitles') continue;

      const shouldShow = t.language === subtitleLanguage;
      if (shouldShow && t.mode !== 'showing') {
        t.mode = 'showing';
      } else if (!shouldShow && t.mode === 'showing') {
        t.mode = 'disabled';
      }
    }
  }, [subtitleLanguage]);


  const goToNextEpisode = useCallback(() => {
    if (nextEpisode) {
      navigate(`/watch/${nextEpisode.season}/${nextEpisode.episode}`);
    }
  }, [nextEpisode, navigate]);
  const enterFullScreenAndRotate = async () => {
    // Sadece ekran genişliği 768px'den küçükse (mobil cihazlar) çalışsın
    // Masaüstünde introyu atlayan adamı zorla tam ekrana almayalım :)
    if (window.innerWidth < 768) {
      const player = playerRef.current;
      if (!player) return;

      try {
        // 1. Tam ekrana geç
        if (!player.isFullscreen()) {
          await player.requestFullscreen();
        }
        // 2. Telefonu yan (landscape) çevirmeye zorla
        if (window.screen && window.screen.orientation && (window.screen.orientation as any).lock) {
          await (window.screen.orientation as any).lock('landscape');
        }
      } catch (err) {
        console.warn("Tam ekran veya döndürme başarısız oldu:", err);
      }
    }
  };
  const skipIntro = useCallback(() => {
    const player = playerRef.current;
    if (player && !player.isDisposed()) {
      const epKey = `S${String(episode.season).padStart(2, '0')}E${String(episode.episode).padStart(2, '0')}`;
      const timingObj = introTimings[epKey];
      const parsedEnd = timingObj && timingObj.end !== "00:00" ? timeToSeconds(timingObj.end) : episode.introEnd;
      const skipTo = parsedEnd > 0 ? parsedEnd - 1.5 : 0;

      if (skipTo > 0) {
        skippedIntroRef.current = true;
        player.currentTime(skipTo);
        setShowSkipIntro(false);

        // İŞTE BURAYA EKLİYORUZ: İntro atlandığında mobildeyse tam ekrana geç ve yan çevir
        enterFullScreenAndRotate();
      }
    }
  }, [episode.introEnd, episode.season, episode.episode]);
  useEffect(() => {
    if (showNextEpisode && countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => Math.max(0, prev - 1)), 1000);
      return () => clearTimeout(timer);
    } else if (showNextEpisode && countdown === 0) {
      goToNextEpisode();
    }
  }, [showNextEpisode, countdown, goToNextEpisode]);

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
    const startTime = savedProgress && !savedProgress.completed ? savedProgress.currentTime : 0;

    const playerOptions = {
      autoplay: true,
      controls: true,
      playsinline: true,
      crossorigin: 'anonymous', // Safari CORS sorunları için kritik
      responsive: true,
      fluid: false,
      fill: true,
      preload: 'metadata',
      playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
      html5: {
        vhs: {
          overrideNative: !videojs.browser.IS_SAFARI,
        },
        nativeVideoTracks: videojs.browser.IS_SAFARI,
        nativeAudioTracks: videojs.browser.IS_SAFARI,
        nativeTextTracks: videojs.browser.IS_SAFARI,
      },
      sources: [{ src: videoUrl, type: 'video/mp4' }],
      ...(mini && {
        controlBar: {
          pictureInPictureToggle: false,
          fullscreenToggle: false,
          volumePanel: { inline: false },
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

    const trSubtitleUrl = getSubtitleUrl(episode, 'tr');
    const enSubtitleUrl = getSubtitleUrl(episode, 'en');


    // Altyazı dosyasını indir, VTT'ye çevir ve player'a ekle (default ASLA true verilmez)
    const fetchAndAddTrack = async (url: string, lang: 'tr' | 'en', label: string, parseForIntro: boolean) => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`${label} subtitles not found`);
        const buf = await res.arrayBuffer();

        let srtText = "";
        try {
          srtText = new TextDecoder('utf-8', { fatal: true }).decode(buf);
        } catch (e) {
          srtText = new TextDecoder('windows-1254').decode(buf);
        }

        if (parseForIntro) {
          const blocks = parseSrt(srtText);
          const detectedIntro = detectIntroGap(blocks);
          if (detectedIntro) {

            setDynamicIntro(detectedIntro);
          }
        }

        const vttBlobUrl = srtToVttBlob(srtText);

        // default: false — track modunu biz kontrol edeceğiz, tarayıcı değil
        player.addRemoteTextTrack({
          kind: 'subtitles',
          src: vttBlobUrl,
          srclang: lang,
          label: label,
          default: false,
        }, false);
      } catch (err: any) {
        console.warn(`${label} altyazı hatası:`, err.message);
      }
    };

    let isDisposing = false;
    let trackChangeListener: (() => void) | null = null;
    let cachedTracks: any = null;

    // İki altyazıyı da paralel indir, ikisi de bitince modları ayarla
    Promise.all([
      fetchAndAddTrack(trSubtitleUrl, 'tr', 'Türkçe', true),
      fetchAndAddTrack(enSubtitleUrl, 'en', 'English', false)
    ]).then(() => {
      if (isDisposing || !player || player.isDisposed()) return;

      const textTracks = player.textTracks();
      cachedTracks = textTracks;

      // Kullanıcının store'daki tercihine göre SADECE bir tanesini aç
      const preferredLang = useStore.getState().subtitleLanguage;

      for (let i = 0; i < textTracks.length; i++) {
        const t = (textTracks as any)[i];
        if (t.kind !== 'subtitles') continue;
        t.mode = (t.language === preferredLang) ? 'showing' : 'disabled';
      }

      // Kullanıcı Video.js menüsünden dil değiştirdiğinde store'a kaydet
      trackChangeListener = () => {
        if (isDisposing) return;

        let activeLang: 'tr' | 'en' | 'off' = 'off';
        for (let i = 0; i < textTracks.length; i++) {
          const t = (textTracks as any)[i];
          if (t.kind === 'subtitles' && t.mode === 'showing') {
            if (t.language === 'tr' || t.language === 'en') {
              activeLang = t.language as 'tr' | 'en';
              break;
            }
          }
        }

        const currentStoreLang = useStore.getState().subtitleLanguage;
        if (activeLang !== currentStoreLang) {
          useStore.getState().setSubtitleLanguage(activeLang);
        }

        if (activeLang !== 'off') {
          // Diğer tüm altyazıları kapat (güvenlik önlemi)
          for (let i = 0; i < textTracks.length; i++) {
            const t = (textTracks as any)[i];
            if (t.kind === 'subtitles' && t.mode === 'showing' && t.language !== activeLang) {
              t.mode = 'disabled';
            }
          }
        }
      };

      textTracks.addEventListener('change', trackChangeListener);
    });

    player.on('loadedmetadata', () => {
      setPlayerReady(true);
      if (startTime > 10) player.currentTime(startTime);

      // Autoplay engellenebileceği için yakalama
      player.play().catch((err: any) => {
        console.warn('Autoplay tarayıcı tarafından engellendi.', err);
      });
    });
    // Çift tıklama mantığını Video.js elementine bağlama
    const videoElementNode = player.el();
    let lastTapTime = 0;

    videoElementNode.addEventListener('touchstart', (e: TouchEvent) => {
      // Kontrol çubuğuna (vjs-control-bar) dokunuluyorsa yoksay
      const target = e.target as HTMLElement;
      if (target.closest('.vjs-control-bar')) {
        return;
      }

      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTapTime;

      if (tapLength < 300 && tapLength > 0) {
        // Çift tıklama algılandı
        if (player && !player.isDisposed()) {
          const rect = videoElementNode.getBoundingClientRect();
          const touchX = e.changedTouches[0].clientX - rect.left;

          if (touchX > rect.width / 2) {
            player.currentTime(Math.min(player.duration() || 0, (player.currentTime() || 0) + 10));
          } else {
            player.currentTime(Math.max(0, (player.currentTime() || 0) - 10));
          }
          // Sadece çift tıklamada varsayılan davranışı engelle (opsiyonel, gerekirse kaldırılabilir)
          // e.preventDefault(); 
        }
      }
      lastTapTime = currentTime;
    }, { passive: false }); // passive: false, e.preventDefault() kullanımına izin verir
    player.on('fullscreenchange', async () => {
      if (player.isFullscreen()) {
        try {
          // (window.screen.orientation as any) kullanarak TS'i kandırıyoruz
          if (window.screen.orientation && (window.screen.orientation as any).lock) {
            await (window.screen.orientation as any).lock('landscape');
          }
        } catch (error) {
          console.warn("Ekran döndürme desteklenmiyor.", error);
        }
      } else {
        try {
          if (window.screen.orientation && (window.screen.orientation as any).unlock) {
            (window.screen.orientation as any).unlock();
          }
        } catch (error) {
          console.warn("Ekran kilidi açılamadı.", error);
        }
      }
    });

    player.on('timeupdate', () => {
      const currentTime = player.currentTime() || 0;
      const duration = player.duration() || 0;

      const epKey = `S${String(episode.season).padStart(2, '0')}E${String(episode.episode).padStart(2, '0')}`;
      const timingObj = introTimings[epKey];
      const activeIntroStart = timingObj && timingObj.start !== "00:00" ? timeToSeconds(timingObj.start) : episode.introStart;
      const activeIntroEnd = timingObj && timingObj.end !== "00:00" ? timeToSeconds(timingObj.end) : episode.introEnd;

      if (activeIntroStart >= 0 && activeIntroEnd > 0 && currentTime >= activeIntroStart && currentTime < activeIntroEnd) {
        if (!skippedIntroRef.current) {
          setShowSkipIntro(true);
        }
      } else {
        setShowSkipIntro(false);
        // Reset skipped status if we are completely out of the intro boundaries
        if (currentTime < activeIntroStart || currentTime > activeIntroEnd) {
          skippedIntroRef.current = false;
        }
      }

      const outroTimingObj = outroTimings[epKey];
      const parsedOutro = outroTimingObj && outroTimingObj.start !== "00:00" ? timeToSeconds(outroTimingObj.start) : 0;
      const activeOutro = parsedOutro > 0 ? parsedOutro : duration - 60;

      if (autoPlayNext && duration > 0 && currentTime >= activeOutro && nextEpisode && !isAutoSkipCancelled) {
        if (!nextEpisodeTriggeredRef.current) {
          nextEpisodeTriggeredRef.current = true;
          setShowNextEpisode(true);
          setCountdown(5);
          handleSaveProgress(true); // Forced completed!
        }
      } else if (currentTime < activeOutro || !autoPlayNext) {
        if (nextEpisodeTriggeredRef.current) {
          nextEpisodeTriggeredRef.current = false;
          setShowNextEpisode(false);
        }
      }
    });

    player.on('ended', () => {
      handleSaveProgress();
      if (nextEpisode) goToNextEpisode();
    });

    player.on('error', () => {
      const err = player.error();
      if (err) {
        console.error('VideoJS Error:', err);
        const customErrorDiv = document.createElement('div');
        customErrorDiv.className = "absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/95 text-center px-4";
        customErrorDiv.innerHTML = `
          <div class="border border-white/10 bg-[#111]/80 backdrop-blur p-8 rounded-xl max-w-lg shadow-2xl">
            <span class="text-red-500 font-bold tracking-widest text-xs uppercase mb-2 block">Bağlantı Hatası (Kod: ${err.code})</span>
            <h2 class="text-2xl font-serif text-white font-bold mb-4">Medya Dosyası Bulunamadı</h2>
            <p class="text-gray-400 text-sm mb-6 leading-relaxed">
              Bu bölümün <strong>(S${String(episode.season).padStart(2, '0')}E${String(episode.episode).padStart(2, '0')}.mp4)</strong> dosyası henüz yerel klasörlerde <i>(/public/videos/Season ${episode.season}/)</i> veya sunucuda mevcut değil.
            </p>
          </div>
        `;
        videoRef.current?.appendChild(customErrorDiv);
      }
    });

    saveIntervalRef.current = setInterval(() => handleSaveProgress(), 15000);

    const handleBeforeUnload = () => handleSaveProgress();
    window.addEventListener('beforeunload', handleBeforeUnload);

    const handleKeydown = (e: KeyboardEvent) => {
      if (!player || player.isDisposed()) return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          player.currentTime(Math.max(0, (player.currentTime() || 0) - 10));
          break;
        case 'ArrowRight':
          e.preventDefault();
          player.currentTime(Math.min(player.duration() || 0, (player.currentTime() || 0) + 10));
          break;
        case ' ': // space
          e.preventDefault();
          if (player.paused()) player.play().catch(console.warn);
          else player.pause();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          player.muted(!player.muted());
          break;
        case 'f':
        case 'F':
          if (mini) return; // Disable fullscreen in mini
          e.preventDefault();
          if (player.isFullscreen()) player.exitFullscreen();
          else player.requestFullscreen();
          break;
        case 'n':
        case 'N':
          if (nextEpisode) goToNextEpisode();
          break;
      }
    };

    // Use capture: true to intercept before VideoJS consumes it
    window.addEventListener('keydown', handleKeydown, { capture: true });

    return () => {
      isDisposing = true;
      handleSaveProgress();
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('keydown', handleKeydown, { capture: true });
      if (cachedTracks && trackChangeListener) {
        try { cachedTracks.removeEventListener('change', trackChangeListener); } catch (_) { }
      }
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [episode.id, loading, isAutoSkipCancelled, mini]);

  if (loading) {
    return <div className="w-full h-full flex items-center justify-center bg-black"><div className="text-white">Player Yükleniyor...</div></div>;
  }

  const showOverlays = !mini;

  return (
    <div className={`group relative w-full aspect-video sm:h-full bg-black mx-auto ${mini ? 'vjs-mini-player rounded-full overflow-hidden' : ''}`}>
      <div ref={videoRef} className="w-full h-full absolute inset-0" />



      {showOverlays && showSkipIntro && playerReady && (
        <button
          onClick={skipIntro}
          className="absolute bottom-16 sm:bottom-24 right-4 sm:right-8 z-[100] bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20 px-5 sm:px-6 py-3 sm:py-2.5 rounded-full sm:rounded shadow-lg font-bold tracking-widest text-xs sm:text-sm uppercase transition-all active:scale-95 sm:hover:scale-105"
        >
          İntroyu Atla →
        </button>
      )}
      {showOverlays && showNextEpisode && nextEpisode && playerReady && (
        <div className="absolute bottom-20 sm:bottom-28 right-4 sm:right-8 left-4 sm:left-auto z-[100] animate-fade-in-up">
          <div className="bg-black/80 sm:bg-black/90 border border-white/10 rounded-2xl sm:rounded-xl p-4 sm:p-5 backdrop-blur-xl relative flex items-center gap-4 max-w-sm mx-auto sm:mx-0 shadow-2xl">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsAutoSkipCancelled(true);
                setShowNextEpisode(false);
              }}
              className="absolute -top-3 -right-3 bg-gray-800 border border-white/20 text-gray-400 hover:text-white hover:bg-red-600 rounded-full w-8 h-8 flex items-center justify-center transition-all shadow-lg z-10"
              title="İptal Et"
            >
              ×
            </button>
            <button onClick={goToNextEpisode} className="flex items-center gap-4 text-left group w-full">
              <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" className="stroke-white/10" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="16" fill="none"
                    className="stroke-red-600 transition-all duration-1000 linear"
                    strokeWidth="3"
                    strokeDasharray="100"
                    strokeDashoffset={100 - (countdown * 20)}
                  />
                </svg>
                <div className="absolute font-bold text-lg text-white">
                  {countdown}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                  {nextEpisode.season > episode.season ? "YENİ SEZON BAŞLIYOR" : "Otomatik Geçişe Az Kaldı"}
                </span>
                <span className="text-white font-bold text-base leading-tight group-hover:text-red-500 transition-colors">
                  {nextEpisode.season > episode.season
                    ? `Sezon ${nextEpisode.season} Bölüm ${nextEpisode.episode}`
                    : nextEpisode.title}
                </span>
                <span className="text-red-600 text-xs font-bold mt-1 uppercase">Hemen Geç →</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
