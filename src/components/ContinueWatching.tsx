import { Link } from 'react-router-dom';
import { useFirebaseProgress, formatTime } from '../hooks/useFirebaseProgress';
import { getEpisode } from '../data/episodes';
import { Play } from 'lucide-react';

export default function ContinueWatching() {
  const { getLastWatched, loading } = useFirebaseProgress();
  
  if (loading) return null;

  const lastWatched = getLastWatched();
  if (!lastWatched || lastWatched.completed) return null;

  const episode = getEpisode(lastWatched.season, lastWatched.episode);
  if (!episode) return null;

  const remainingTime = lastWatched.duration - lastWatched.currentTime;

  return (
    <div className="animate-fade-in-up mt-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1.5 h-6 bg-[var(--accent-red)] rounded-full"></div>
        <h2 className="sopranos-title text-2xl sm:text-3xl font-bold text-primary">
          Kaldığın Yerden Devam Et
        </h2>
      </div>

      <Link
        to={`/watch/${episode.season}/${episode.episode}`}
        className="group block"
      >
        <div className="bg-card rounded-2xl overflow-hidden border border-[var(--accent-red)]/30 transition-all duration-300 hover:border-[var(--accent-red)] hover:shadow-2xl hover:shadow-[var(--accent-red)]/10">
          <div className="flex flex-col sm:flex-row">
            
            {/* Visual Header - Left Side */}
            <div className="relative sm:w-80 aspect-video sm:aspect-auto bg-[var(--bg-secondary)] flex items-center justify-center overflow-hidden shrink-0 border-r border-themed/20">
              <span className="sopranos-title text-8xl font-black text-[var(--accent-red)]/5 select-none tracking-widest">
                S{episode.season}
              </span>

              {/* Play Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-16 h-16 rounded-full bg-[var(--accent-red)] flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                  <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
                </div>
              </div>

              {/* Bottom Progress Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[var(--bg-primary)]">
                <div
                  className="h-full bg-[var(--accent-red)] transition-all shadow-[0_0_10px_rgba(220,38,38,0.5)]"
                  style={{ width: `${lastWatched.percentage}%` }}
                />
              </div>
            </div>

            {/* Content - Right Side */}
            <div className="p-5 sm:p-8 flex flex-col justify-center flex-1 min-w-0 bg-gradient-to-br from-card to-[var(--bg-secondary)]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono font-bold text-white bg-[var(--accent-red)] px-2.5 py-1 rounded shadow-sm">
                  S{String(episode.season).padStart(2, '0')}E{String(episode.episode).padStart(2, '0')}
                </span>
                <span className="text-sm font-semibold tracking-wide text-secondary uppercase sopranos-title">
                  Sezon {episode.season}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-primary group-hover:text-[var(--accent-red)] transition-colors mb-2 truncate sopranos-title tracking-wide">
                {episode.title}
              </h3>

              <p className="text-sm text-secondary line-clamp-2 mb-4 leading-relaxed">
                {episode.description}
              </p>

              <div className="grid grid-cols-3 gap-4 text-xs font-semibold py-3 border-t border-themed">
                <div className="flex flex-col gap-1">
                  <span className="text-dim uppercase tracking-wider text-[10px]">İzlenen</span>
                  <span className="text-primary">{formatTime(lastWatched.currentTime)}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-dim uppercase tracking-wider text-[10px]">Kalan</span>
                  <span className="text-primary">{formatTime(remainingTime)}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[var(--accent-red)] uppercase tracking-wider text-[10px]">Durum</span>
                  <span className="text-[var(--accent-red)] font-bold">%{Math.round(lastWatched.percentage)} BİTTİ</span>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </Link>
    </div>
  );
}
