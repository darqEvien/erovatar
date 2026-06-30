import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { getEpisode, getSeasonByNumber, getNextEpisode, getPreviousEpisode } from '../data/episodes';
import VideoPlayer from '../components/VideoPlayer';
import { useFirebaseProgress } from '../hooks/useFirebaseProgress';
import { ArrowLeft, ArrowRight, ListVideo, Home, X, PlayCircle, CheckCircle, Monitor, MonitorOff, User } from 'lucide-react';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Link } from 'react-router-dom';
import EpisodeComments from '../components/EpisodeComments';

const ELEMENT_COLORS: Record<number, string> = {
  1: 'var(--element-water)',
  2: 'var(--element-earth)',
  3: 'var(--element-fire)',
};

const ELEMENT_LABELS: Record<number, string> = {
  1: 'Su',
  2: 'Toprak',
  3: 'Ateş',
};

export default function WatchPage() {
  const { seasonNumber, episodeNumber } = useParams<{ seasonNumber: string; episodeNumber: string }>();
  const navigate = useNavigate();

  const season = parseInt(seasonNumber || '1', 10);
  const epNum = parseInt(episodeNumber || '1', 10);

  const episode = getEpisode(season, epNum);
  const nextEpisode = getNextEpisode(season, epNum);
  const prevEpisode = getPreviousEpisode(season, epNum);

  const { getProgress } = useFirebaseProgress();
  const { user, autoPlayNext, setAutoPlayNext } = useStore();

  const [mode, setMode] = useState<'sinematik' | 'normal'>('normal');
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [selectedSeasonDrawer, setSelectedSeasonDrawer] = useState(season);

  // ── Smooth oto-geçiş overlay ────────────────────────────────────────────────
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(0);
  const fadeOutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (fadeOutTimer.current) clearTimeout(fadeOutTimer.current);
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  const FADE_OUT_MS = 420; // siyaha kararma süresi
  const FADE_IN_MS = 480;  // yeni bölümden geri dönüş süresi

  const smoothNavigateToNext = useCallback(() => {
    if (!nextEpisode || isTransitioning) return;
    // Phase 1: ekranı element rengine yakın bir tonla kararta kararta siyaha söndür
    setIsTransitioning(true);
    setOverlayOpacity(1);

    if (fadeOutTimer.current) clearTimeout(fadeOutTimer.current);
    fadeOutTimer.current = setTimeout(() => {
      // Phase 2: tamamen siyahken sayfayı değiştir (kullanıcı sıçramayı görmez)
      navigate(`/watch/${nextEpisode.season}/${nextEpisode.episode}`);
      // Yeni bölüm DOM'a yerleşsin diye bir frame bekleyip geri açıyoruz
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setOverlayOpacity(0));
      });
      // Phase 3: fade-in bitince kilidi kaldır, bir sonraki oto-geçişe izin ver
      if (resetTimer.current) clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => setIsTransitioning(false), FADE_IN_MS + 60);
    }, FADE_OUT_MS);
  }, [nextEpisode, isTransitioning, navigate]);

  const elementColor = ELEMENT_COLORS[season];

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsPlaylistOpen(false);
    setSelectedSeasonDrawer(season);
  }, [episode?.id, season]);

  if (!episode) return <Navigate to="/" />;

  // Layout değişiklikleri (genişlik, padding, opacity) için doğal, sönümlü bir eğri —
  // zıplama yok, göz yormuyor. Video kutusunun "sinematik zoom" hissi ayrı tutuluyor.
  const layoutTransition = 'all 0.6s cubic-bezier(0.65, 0, 0.35, 1)';
  const springTransition = 'all 0.75s cubic-bezier(0.22, 1, 0.36, 1)';

  // ── Playlist Panel ──────────────────────────────────────────────────────────
  const PlaylistContent = ({ isDrawer = false }: { isDrawer?: boolean }) => (
    <div className="flex flex-col h-full" style={{ background: isDrawer ? 'var(--water-deep)' : 'var(--water-deep)', borderRadius: isDrawer ? 0 : '1rem', border: isDrawer ? 'none' : '1px solid var(--border-soft)', overflow: 'hidden' }}>

      {/* Header */}
      <div className="p-4 shrink-0 flex flex-col gap-3" style={{ borderBottom: '1px solid var(--border-soft)', background: 'rgba(7,13,26,0.4)' }}>
        {isDrawer && (
          <div className="flex items-center justify-between mb-2">
            <h3 className="avatar-title font-bold text-base tracking-wider" style={{ color: 'var(--parchment)' }}>Oynatma Listesi</h3>
            <button onClick={() => setIsPlaylistOpen(false)} className="p-2 rounded-full transition-colors" style={{ color: 'var(--stone)' }}>
              <X size={20} />
            </button>
          </div>
        )}

        <div className="flex items-center gap-3">
          {/* Season select */}
          <select
            value={selectedSeasonDrawer}
            onChange={e => setSelectedSeasonDrawer(parseInt(e.target.value))}
            className="flex-1 text-xs font-bold p-3 rounded-lg outline-none transition-colors appearance-none cursor-pointer avatar-title"
            style={{ background: 'var(--water-mid)', border: '1px solid var(--border-soft)', color: 'var(--parchment)' }}
          >
            {[1, 2, 3].map(s => (
              <option key={s} value={s}>Kitap {s}: {ELEMENT_LABELS[s]}</option>
            ))}
          </select>

          {/* Auto-play toggle */}
          <button
            onClick={() => setAutoPlayNext(!autoPlayNext)}
            className="shrink-0 flex flex-col justify-center items-center px-3 py-1.5 rounded-lg transition-all"
            style={{
              background: autoPlayNext ? 'rgba(74,158,202,0.08)' : 'var(--water-mid)',
              border: `1px solid ${autoPlayNext ? 'rgba(74,158,202,0.3)' : 'var(--border-soft)'}`,
            }}
          >
            <span className="avatar-title text-[9px] font-bold uppercase tracking-wider mb-1.5" style={{ color: autoPlayNext ? 'var(--water-light)' : 'var(--stone)' }}>
              Oto Geçiş
            </span>
            <div className="relative w-10 h-5 rounded-full transition-colors duration-300" style={{ background: autoPlayNext ? 'var(--water-light)' : 'rgba(74,158,202,0.15)' }}>
              <div
                className="absolute top-0.5 w-4 h-4 rounded-full shadow-md"
                style={{
                  left: autoPlayNext ? 'calc(100% - 18px)' : '2px',
                  background: 'var(--parchment)',
                  transition: 'left 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Episode list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar" style={{ maxHeight: isDrawer ? undefined : '600px' }}>
        {getSeasonByNumber(selectedSeasonDrawer)?.episodes.map(ep => {
          const isCurrent = ep.id === episode.id;
          const epProg = getProgress(ep.id);
          const isCompleted = epProg?.completed;
          const epColor = ELEMENT_COLORS[selectedSeasonDrawer];

          return (
            <button
              key={ep.id}
              onClick={() => navigate(`/watch/${ep.season}/${ep.episode}`)}
              className="w-full group flex gap-3 p-2.5 rounded-xl transition-all text-left"
              style={{
                background: isCurrent ? `${epColor}12` : 'transparent',
                border: `1px solid ${isCurrent ? `${epColor}44` : 'transparent'}`,
                boxShadow: isCurrent ? `0 0 12px ${epColor}18` : 'none',
              }}
              onMouseEnter={e => { if (!isCurrent) (e.currentTarget.style.background = 'rgba(74,158,202,0.05)' ) }}
              onMouseLeave={e => { if (!isCurrent) (e.currentTarget.style.background = 'transparent' ) }}
            >
              {/* Thumbnail */}
              <div
                className="relative w-24 h-14 shrink-0 rounded-lg overflow-hidden border border-solid"
                style={{ background: 'var(--water-mid)', borderColor: 'var(--border-soft)' }}
              >
                {/* ImageWithOverlay: YouTube benzeri kart hissi */}
                <div className="absolute inset-0">
                  {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
                  <img
                    src={`/images/thumbnails/Season ${ep.season}/e${ep.episode}.webp`}
                    alt={ep.title}
                    className="w-full h-full object-cover"
                    onError={e => (e.currentTarget.style.display = 'none')}
                  />
                  {/* overlay */}
                  <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                  <div className="absolute bottom-0 left-0 right-0 z-20 px-2 pb-1 pointer-events-none">
                    <p className="text-white/70 text-[9px] font-bold tracking-widest uppercase mb-0.5" style={{ opacity: 0.95 }}>
                      Bölüm {ep.episode}
                    </p>
                    <p
                      className="text-white font-bold text-[10px] leading-tight"
                      style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                    >
                      {ep.title}
                    </p>
                  </div>
                </div>

                <div
                  className={`absolute inset-0 flex items-center justify-center transition-opacity ${isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                  style={{ background: 'rgba(7,13,26,0.5)' }}
                >
                  <PlayCircle size={18} style={{ color: isCurrent ? epColor : 'white' }} />
                </div>

                {epProg && epProg.percentage > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: 'rgba(7,13,26,0.6)' }}>
                    <div className="h-full" style={{ width: `${Math.min(epProg.percentage, 100)}%`, background: epColor }} />
                  </div>
                )}
              </div>


              {/* Info */}
              <div className="flex flex-col justify-center flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="avatar-title text-[10px] font-bold uppercase tracking-wider" style={{ color: isCurrent ? epColor : 'var(--stone)' }}>
                    Bölüm {ep.episode}
                  </span>
                  {isCompleted && <CheckCircle size={12} style={{ color: 'var(--water-light)' }} />}
                </div>
                <h4 className="text-xs font-semibold truncate transition-colors" style={{ color: isCurrent ? 'var(--parchment)' : 'var(--stone)' }}>
                  {ep.title}
                </h4>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen text-white selection:bg-sky-600 font-sans overflow-x-hidden" style={{ background: 'var(--night)' }}>

      {/* ── Oto-geçiş fade overlay ──────────────────────────────────────────── */}
      <div
        className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center"
        style={{
          background: 'var(--night)',
          opacity: overlayOpacity,
          transition: `opacity ${overlayOpacity ? FADE_OUT_MS : FADE_IN_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        }}
      >
        <div
          className="flex flex-col items-center gap-3"
          style={{
            opacity: overlayOpacity,
            transform: `scale(${overlayOpacity ? 1 : 0.94})`,
            transition: `opacity 0.35s ease ${overlayOpacity ? '0.1s' : '0s'}, transform 0.35s ease ${overlayOpacity ? '0.1s' : '0s'}`,
          }}
        >
          <div
            className="w-9 h-9 rounded-full border-2 animate-spin"
            style={{ borderColor: `${elementColor}33`, borderTopColor: elementColor }}
          />
          {nextEpisode && (
            <p className="avatar-title text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: 'var(--stone)' }}>
              Sonraki Bölüme Geçiliyor
            </p>
          )}
        </div>
      </div>

      {/* ── Top Nav ── */}
      <div
        className="fixed top-0 left-0 right-0 z-50 p-4 lg:px-8 flex items-center justify-between"
        style={{
          background: mode === 'sinematik'
            ? 'linear-gradient(to bottom, rgba(7,13,26,0.85), transparent)'
            : 'rgba(7,13,26,0.96)',
          backdropFilter: mode === 'sinematik' ? 'none' : 'blur(16px)',
          borderBottom: mode === 'sinematik' ? 'none' : '1px solid var(--border-soft)',
          transition: 'all 0.85s ease',
        }}
      >
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2.5 rounded-full transition-all"
            style={{ background: 'rgba(7,13,26,0.7)', border: '1px solid var(--border-soft)', color: 'var(--stone)' }}
            onMouseEnter={e => { (e.currentTarget.style.color = 'var(--parchment)'); (e.currentTarget.style.borderColor = 'var(--border-glow)'); }}
            onMouseLeave={e => { (e.currentTarget.style.color = 'var(--stone)'); (e.currentTarget.style.borderColor = 'var(--border-soft)'); }}
          >
            <Home size={18} />
          </button>
          <button
            onClick={() => navigate(`/season/${season}`)}
            className="flex items-center gap-2 transition-colors"
            style={{ color: 'var(--stone)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--parchment)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--stone)')}
          >
            <div className="p-2 rounded-full" style={{ background: 'rgba(7,13,26,0.7)', border: '1px solid var(--border-soft)' }}>
              <ArrowLeft size={16} />
            </div>
            <span className="avatar-title text-xs font-bold tracking-wider hidden sm:block">Kitap {season}</span>
          </button>
        </div>

        {/* Center — only in sinematik */}
        <div
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-center hidden md:block"
          style={{
            opacity: mode === 'sinematik' ? 1 : 0,
            transform: `translate(-50%, ${mode === 'sinematik' ? '0' : '-8px'})`,
            transition: layoutTransition,
          }}
        >
          <p className="avatar-title text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: elementColor }}>
            Kitap {season}: {ELEMENT_LABELS[season]}
          </p>
          <h1 className="avatar-title text-base font-bold" style={{ color: 'var(--parchment)' }}>
            {episode.title}
          </h1>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMode(mode === 'sinematik' ? 'normal' : 'sinematik')}
            className="p-2.5 rounded-full transition-all group"
            style={{ background: 'rgba(7,13,26,0.7)', border: '1px solid var(--border-soft)', color: 'var(--stone)' }}
            onMouseEnter={e => { (e.currentTarget.style.borderColor = elementColor); (e.currentTarget.style.color = elementColor); }}
            onMouseLeave={e => { (e.currentTarget.style.borderColor = 'var(--border-soft)'); (e.currentTarget.style.color = 'var(--stone)'); }}
            title={mode === 'sinematik' ? 'Normal Mod' : 'Sinematik Mod'}
          >
            {mode === 'sinematik' ? <Monitor size={18} /> : <MonitorOff size={18} />}
          </button>

          {user && (
            <Link to={`/profile/${user.displayName}`} className="rounded-full overflow-hidden transition-all" style={{ border: `2px solid var(--border-soft)` }}>
              {user.photoURL
                ? <img src={user.photoURL} alt="" className="w-8 h-8 object-cover" />
                : <div className="w-8 h-8 flex items-center justify-center" style={{ background: 'var(--water-mid)' }}><User size={16} style={{ color: 'var(--stone)' }} /></div>}
            </Link>
          )}

          {/* Sinematik mod: Playlist button */}
          <div
            className="overflow-hidden whitespace-nowrap"
            style={{ width: mode === 'sinematik' ? '130px' : '0px', opacity: mode === 'sinematik' ? 1 : 0, marginLeft: mode === 'sinematik' ? '4px' : '0px', transition: layoutTransition }}
          >
            <button
              onClick={() => setIsPlaylistOpen(!isPlaylistOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-full transition-all avatar-title text-xs font-bold uppercase tracking-wider w-full"
              style={{ background: 'rgba(7,13,26,0.7)', border: '1px solid var(--border-soft)', color: 'var(--stone)' }}
              onMouseEnter={e => { (e.currentTarget.style.borderColor = elementColor); (e.currentTarget.style.color = elementColor); }}
              onMouseLeave={e => { (e.currentTarget.style.borderColor = 'var(--border-soft)'); (e.currentTarget.style.color = 'var(--stone)'); }}
            >
              <ListVideo size={16} />
              Bölümler
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div
        className="mx-auto flex flex-col lg:flex-row relative"
        style={{
          maxWidth: mode === 'sinematik' ? '100%' : '1700px',
          gap: mode === 'sinematik' ? '0' : '32px',
          padding: mode === 'sinematik' ? '0' : '24px',
          paddingTop: mode === 'sinematik' ? '0' : '100px',
          transition: layoutTransition,
        }}
      >

        {/* ── Left: Video + Info ── */}
        <div className="flex-1 flex flex-col w-full min-w-0">

          {/* Video box */}
          <div
            className="w-full flex items-center justify-center"
            style={{
              minHeight: mode === 'sinematik' ? '100vh' : 'auto',
              background: mode === 'sinematik' ? '#000' : 'transparent',
              transition: layoutTransition,
            }}
          >
            <div
              className="overflow-hidden relative origin-center"
              style={{
                width: mode === 'sinematik' ? (isPlaylistOpen ? '72%' : '90%') : '100%',
                borderRadius: mode === 'sinematik' ? (isPlaylistOpen ? '2.5rem' : '1.5rem') : '0.75rem',
                transform: mode === 'sinematik' && isPlaylistOpen ? 'translateX(-14vw)' : 'translateX(0)',
                boxShadow: mode === 'sinematik' ? `0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px var(--border-soft)` : 'none',
                aspectRatio: '16 / 9',
                transition: springTransition,
              }}
            >
              <div className="absolute inset-0 w-full h-full bg-black">
                <VideoPlayer key={episode.id} episode={episode} onGoNext={smoothNavigateToNext} />
              </div>
            </div>
          </div>

          {/* Info section */}
          <div
            className="w-full mx-auto"
            style={{
              maxWidth: mode === 'sinematik' ? '1100px' : '100%',
              padding: mode === 'sinematik' ? '60px 16px' : '24px 0 0 0',
              transition: layoutTransition,
            }}
          >
            {/* Title + nav */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
              <div>
                {/* Element + episode label */}
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className="avatar-title text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                    style={{ background: `${elementColor}18`, color: elementColor, border: `1px solid ${elementColor}33` }}
                  >
                    Kitap {season} · {ELEMENT_LABELS[season]}
                  </span>
                  <span
                    className="avatar-title text-[9px] font-bold uppercase tracking-widest"
                    style={{
                      opacity: mode === 'sinematik' ? 0 : 1,
                      height: mode === 'sinematik' ? 0 : 'auto',
                      color: 'var(--stone)',
                      transition: layoutTransition,
                    }}
                  >
                    Bölüm {epNum}
                  </span>
                </div>

                <h2
                  className="avatar-title font-bold tracking-wide"
                  style={{
                    fontSize: mode === 'sinematik' ? '2rem' : '1.5rem',
                    color: 'var(--parchment)',
                    lineHeight: 1.2,
                    transition: layoutTransition,
                  }}
                >
                  {episode.title}
                </h2>
              </div>

              {/* Prev / Next */}
              <div className="flex items-center gap-2 shrink-0">
                {prevEpisode && (
                  <button
                    onClick={() => navigate(`/watch/${prevEpisode.season}/${prevEpisode.episode}`)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all avatar-title text-xs font-bold uppercase tracking-wider"
                    style={{ background: 'var(--water-mid)', border: '1px solid var(--border-soft)', color: 'var(--stone)' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-glow)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-soft)')}
                  >
                    <ArrowLeft size={14} /> Önceki
                  </button>
                )}
                {nextEpisode && (
                  <button
                    onClick={() => navigate(`/watch/${nextEpisode.season}/${nextEpisode.episode}`)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all avatar-title text-xs font-bold uppercase tracking-wider"
                    style={{ background: elementColor, color: 'var(--night)', border: `1px solid ${elementColor}` }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >
                    Sonraki <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Description */}
            <div
              className="rounded-xl p-5 mb-12"
              style={{
                background: mode === 'sinematik' ? 'transparent' : 'var(--water-mid)',
                border: mode === 'sinematik' ? 'none' : '1px solid var(--border-soft)',
                transition: layoutTransition,
                maxWidth: mode === 'sinematik' ? '700px' : '100%',
              }}
            >
              <p className="text-sm leading-relaxed" style={{ color: 'var(--stone)' }}>
                {episode.description}
              </p>
            </div>

            {/* Comments */}
            <EpisodeComments episodeId={episode.id} />
          </div>
        </div>

        {/* ── Right: Playlist (normal mode) ── */}
        <div
          className="overflow-hidden shrink-0"
          style={{ width: mode === 'normal' ? '380px' : '0px', opacity: mode === 'normal' ? 1 : 0, transition: layoutTransition }}
        >
          <div className="w-[380px]">
            <PlaylistContent />
          </div>
        </div>
      </div>

      {/* ── Sinematik: Drawer ── */}
      <div
        className="fixed inset-y-0 right-0 z-[100] w-full sm:w-96 shadow-2xl"
        style={{
          background: 'rgba(7,13,26,0.97)',
          backdropFilter: 'blur(24px)',
          borderLeft: '1px solid var(--border-soft)',
          transform: mode === 'sinematik' && isPlaylistOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: springTransition,
        }}
      >
        <PlaylistContent isDrawer />
      </div>
    </div>
  );
}