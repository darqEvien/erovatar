import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { getEpisode, getSeasonByNumber, getNextEpisode, getPreviousEpisode } from '../data/episodes';
import VideoPlayer from '../components/VideoPlayer';
import { useFirebaseProgress } from '../hooks/useFirebaseProgress';
import { ArrowLeft, ArrowRight, ListVideo, Home, X, PlayCircle, CheckCircle, Monitor, MonitorOff, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Link } from 'react-router-dom';
import EpisodeComments from '../components/EpisodeComments';

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

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsPlaylistOpen(false);
    setSelectedSeasonDrawer(season);
  }, [episode?.id, season]);

  if (!episode) return <Navigate to="/" />;

  // Büyüme/küçülme hızını ve dinamiğini Apple (Dynamic Island) gibi yapmak için özel bezier
  const springTransition = "all 0.85s cubic-bezier(0.34, 1.56, 0.64, 1)";

  const PlaylistContent = ({ isDrawer = false }: { isDrawer?: boolean }) => (
    <div className={`flex flex-col h-full ${!isDrawer && 'bg-[#0a0a0a] rounded-2xl border border-white/5 shadow-xl overflow-hidden'}`}>
      <div className={`p-4 border-b border-white/5 shrink-0 flex flex-col gap-3 ${!isDrawer && 'bg-[#111]/50'}`}>
        {isDrawer && (
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg text-white tracking-tight">Oynatma Listesi</h3>
            <button onClick={() => setIsPlaylistOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
        )}
        <div className="flex items-center gap-3">
          <select
            value={selectedSeasonDrawer}
            onChange={(e) => setSelectedSeasonDrawer(parseInt(e.target.value))}
            className="flex-1 bg-[#1a1a1a] border border-white/10 text-white text-sm font-bold p-3 rounded-lg outline-none focus:border-red-500 transition-colors appearance-none cursor-pointer"
          >
            {[1, 2, 3, 4, 5, 6].map(s => (
              <option key={s} value={s}>Sezon {s}</option>
            ))}
          </select>

          {/* Toggle with sliding knob */}
          <button
            onClick={() => setAutoPlayNext(!autoPlayNext)}
            className={`shrink-0 flex flex-col justify-center items-center px-3 py-1.5 rounded-lg border transition-all duration-300 ${autoPlayNext ? 'bg-red-900/10 border-red-500/30' : 'bg-[#1a1a1a] border-white/10 hover:border-white/20'}`}
          >
            <span className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 transition-colors duration-300 ${autoPlayNext ? 'text-red-500' : 'text-gray-500'}`}>
              Oto Geçiş
            </span>
            <div className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${autoPlayNext ? 'bg-red-600' : 'bg-gray-700'}`}>
              <div
                className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-md"
                style={{
                  left: autoPlayNext ? 'calc(100% - 18px)' : '2px',
                  transition: 'left 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              />
            </div>
          </button>
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar ${!isDrawer && 'max-h-[600px]'}`}>
        {getSeasonByNumber(selectedSeasonDrawer)?.episodes.map((ep) => {
          const isCurrent = ep.id === episode.id;
          const epProg = getProgress(ep.id);
          const isCompleted = epProg?.completed;
          return (
            <button
              key={ep.id}
              onClick={() => navigate(`/watch/${ep.season}/${ep.episode}`)}
              className={`w-full group flex gap-3 p-2.5 rounded-xl transition-all text-left border ${isCurrent ? 'bg-red-900/10 border-red-500/30 ring-1 ring-red-500/50' : 'hover:bg-[#1a1a1a] border-transparent'}`}
            >
              <div className="relative w-24 h-14 shrink-0 bg-black rounded-md overflow-hidden ring-1 ring-white/10">
                <img
                  src={`/images/thumbnails/Season ${ep.season}/S${String(ep.season).padStart(2, '0')}E${String(ep.episode).padStart(2, '0')}.jpg`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                  alt={ep.title}
                />
                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  <PlayCircle size={20} className={isCurrent ? "text-red-500" : "text-white"} />
                </div>
                {epProg && epProg.percentage > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                    <div className="h-full bg-red-600" style={{ width: `${Math.min(epProg.percentage, 100)}%` }} />
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-center flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isCurrent ? 'text-red-500' : 'text-gray-500'}`}>Bölüm {ep.episode}</span>
                  {isCompleted && <CheckCircle size={12} className="text-green-500" />}
                </div>
                <h4 className={`text-sm font-semibold truncate ${isCurrent ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>{ep.title}</h4>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-red-600 font-sans overflow-x-hidden">

      {/* ── Üst Navigasyon Barı ── */}
      <div
        className="fixed top-0 left-0 right-0 z-50 p-4 lg:px-8 flex items-center justify-between"
        style={{
          background: mode === 'sinematik'
            ? 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)'
            : 'rgba(5,5,5,0.9)',
          backdropFilter: mode === 'sinematik' ? 'none' : 'blur(12px)',
          borderBottom: mode === 'sinematik' ? 'none' : '1px solid rgba(255,255,255,0.05)',
          transition: 'all 0.85s ease',
        }}
      >
        <div className="pointer-events-auto flex items-center gap-4">
          <button onClick={() => navigate('/')} className="bg-black/60 p-2.5 rounded-full border border-white/10 hover:bg-white/20 transition-all shadow-lg">
            <Home size={18} />
          </button>
          <button onClick={() => navigate(`/season/${season}`)} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
            <div className="bg-black/40 p-2 rounded-full border border-white/10"><ArrowLeft size={16} /></div>
            <span className="font-semibold text-sm">Sezon {season}</span>
          </button>
        </div>

        <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-center hidden md:block" style={{
          opacity: mode === 'sinematik' ? 1 : 0,
          transform: `translate(-50%, ${mode === 'sinematik' ? '0' : '-10px'}) scale(${mode === 'sinematik' ? 1 : 0.95})`,
          transition: springTransition
        }}>
          <h1 className="font-serif text-xl font-bold tracking-tight text-white drop-shadow-lg">S{String(season).padStart(2, '0')} E{String(epNum).padStart(2, '0')}</h1>
          <p className="text-xs font-medium text-gray-300">{episode.title}</p>
        </div>

        <div className="pointer-events-auto flex items-center gap-3">
          <button
            onClick={() => setMode(mode === 'sinematik' ? 'normal' : 'sinematik')}
            className="bg-black/60 p-2.5 rounded-full border border-white/10 hover:border-red-500/50 hover:bg-white/10 transition-all group"
            title={mode === 'sinematik' ? 'Normal Mod' : 'Sinematik Mod'}
          >
            {mode === 'sinematik'
              ? <Monitor size={18} className="group-hover:text-red-500 transition-colors" />
              : <MonitorOff size={18} className="group-hover:text-red-500 transition-colors" />
            }
          </button>

          {user && (
            <Link to={`/profile/${user.displayName}`} className="bg-black/60 p-2 rounded-full border border-white/10 hover:border-red-500/50 transition-all">
              {user.photoURL
                ? <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full object-cover" />
                : <div className="w-8 h-8 flex items-center justify-center"><User size={18} className="text-gray-400" /></div>}
            </Link>
          )}

          <div className="overflow-hidden whitespace-nowrap" style={{
            width: mode === 'sinematik' ? '120px' : '0px',
            opacity: mode === 'sinematik' ? 1 : 0,
            marginLeft: mode === 'sinematik' ? '8px' : '0px',
            transition: springTransition
          }}>
            <button
              onClick={() => setIsPlaylistOpen(!isPlaylistOpen)}
              className="bg-black/60 px-4 py-2 rounded-full border border-white/10 hover:border-red-500/50 hover:bg-white/10 transition-all flex items-center gap-2 group w-full"
            >
              <ListVideo size={18} className="group-hover:text-red-500" />
              <span className="font-bold text-xs uppercase tracking-widest hidden sm:inline">Bölümler</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── BİRLEŞTİRİLMİŞ DİNAMİK ANA İÇERİK ALANI ── */}
      <div 
        className="mx-auto flex flex-col lg:flex-row relative"
        style={{
          maxWidth: mode === 'sinematik' ? '100%' : '1700px',
          gap: mode === 'sinematik' ? '0px' : '32px',
          padding: mode === 'sinematik' ? '0px' : '24px',
          paddingTop: mode === 'sinematik' ? '0px' : '100px',
          transition: springTransition
        }}
      >
        
        {/* SOL TARAF: VİDEO VE BİLGİLER */}
        <div className="flex-1 flex flex-col w-full min-w-0" style={{ transition: springTransition }}>
          
          {/* VİDEO KUTUSU */}
          <div 
            className="w-full flex items-center justify-center"
            style={{
              minHeight: mode === 'sinematik' ? '100vh' : 'auto',
              background: mode === 'sinematik' ? '#000' : 'transparent',
              transition: springTransition
            }}
          >
            <div
              className="overflow-hidden relative origin-center"
              style={{
                width: mode === 'sinematik' ? (isPlaylistOpen ? '75%' : '92%') : '100%',
                borderRadius: mode === 'sinematik' ? (isPlaylistOpen ? '2.5rem' : '1.5rem') : '1rem',
                transform: mode === 'sinematik' && isPlaylistOpen ? 'translateX(-12vw)' : 'translateX(0)',
                boxShadow: mode === 'sinematik' ? '0 20px 50px rgba(0,0,0,0.5)' : 'none',
                border: mode === 'sinematik' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(255,255,255,0.05)',
                aspectRatio: '16 / 9',
                transition: springTransition,
                willChange: 'width, border-radius, transform'
              }}
            >
              <div className="absolute inset-0 w-full h-full bg-black">
                <VideoPlayer key={episode.id} episode={episode} />
              </div>
            </div>
          </div>

          {/* ORTAK ALT BİLGİ BÖLÜMÜ */}
          <div
            className="w-full mx-auto"
            style={{
              maxWidth: mode === 'sinematik' ? '1152px' : '100%', // 1152px = max-w-6xl
              padding: mode === 'sinematik' ? '64px 16px' : '24px 0px 0px 0px',
              transition: springTransition
            }}
          >
            <div className={`flex flex-col sm:flex-row justify-between gap-4 mb-2 ${mode === 'sinematik' ? 'sm:items-center mb-4' : 'sm:items-start'}`}>
              <h2 className="font-serif font-bold tracking-tight text-white" style={{
                fontSize: mode === 'sinematik' ? '2.25rem' : '1.875rem',
                lineHeight: mode === 'sinematik' ? '2.5rem' : '2.25rem',
                transition: springTransition
              }}>
                {episode.title}
              </h2>
              <div className="flex items-center gap-2 shrink-0">
                {prevEpisode && (
                  <button onClick={() => navigate(`/watch/${prevEpisode.season}/${prevEpisode.episode}`)} className={`flex items-center gap-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10 font-semibold ${mode === 'sinematik' ? 'px-5 py-2.5' : 'px-4 py-2 text-sm'}`}>
                    <ArrowLeft size={mode === 'sinematik' ? 18 : 16} /> Önceki Bölüm
                  </button>
                )}
                {nextEpisode && (
                  <button onClick={() => navigate(`/watch/${nextEpisode.season}/${nextEpisode.episode}`)} className={`flex items-center gap-2 bg-red-600/80 hover:bg-red-600 rounded-lg transition-colors border border-red-500/50 text-white font-semibold shadow-lg shadow-red-900/20 ${mode === 'sinematik' ? 'px-5 py-2.5' : 'px-4 py-2 text-sm'}`}>
                    Sonraki Bölüm <ArrowRight size={mode === 'sinematik' ? 18 : 16} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 overflow-hidden" style={{
              height: mode === 'sinematik' ? '0px' : '32px',
              opacity: mode === 'sinematik' ? 0 : 1,
              marginBottom: mode === 'sinematik' ? '0px' : '24px',
              transition: springTransition
            }}>
              <span className="bg-white/10 text-white px-3 py-1 rounded-md text-xs font-bold uppercase border border-white/5 whitespace-nowrap">
                S{String(season).padStart(2, '0')} E{String(epNum).padStart(2, '0')}
              </span>
              <span className="text-gray-400 text-sm font-medium whitespace-nowrap">{episode.airDate}</span>
            </div>

            <div style={{
              maxWidth: mode === 'sinematik' ? '768px' : '896px', // 3xl vs 4xl
              background: mode === 'sinematik' ? 'transparent' : '#0a0a0a',
              padding: mode === 'sinematik' ? '0px' : '24px',
              borderRadius: mode === 'sinematik' ? '0px' : '1rem',
              border: mode === 'sinematik' ? 'none' : '1px solid rgba(255,255,255,0.05)',
              marginBottom: '48px',
              transition: springTransition
            }}>
              <p className="text-gray-300 leading-relaxed" style={{
                fontSize: mode === 'sinematik' ? '1.125rem' : '1rem',
                transition: springTransition
              }}>
                {episode.description}
              </p>
            </div>

            <EpisodeComments episodeId={episode.id} />
          </div>
        </div>

        {/* SAĞ TARAF: OYNATMA LİSTESİ (NORMAL MOD) */}
        <div className="overflow-hidden shrink-0" style={{
          width: mode === 'normal' ? '400px' : '0px',
          opacity: mode === 'normal' ? 1 : 0,
          transition: springTransition
        }}>
          <div className="w-[400px]">
            <PlaylistContent />
          </div>
        </div>

      </div>

      {/* ── Sinematik Mod: Sağ Çekmece ── */}
      <div 
        className="fixed inset-y-0 right-0 z-[100] w-full sm:w-96 bg-[#0a0a0a]/95 backdrop-blur-3xl border-l border-white/10 shadow-2xl"
        style={{
          transform: mode === 'sinematik' && isPlaylistOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: springTransition
        }}
      >
        <PlaylistContent isDrawer={true} />
      </div>

    </div>
  );
}