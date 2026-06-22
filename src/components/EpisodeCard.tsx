import { Link } from 'react-router-dom';
import type { Episode } from '../data/episodes';
import { useFirebaseProgress, formatTime } from '../hooks/useFirebaseProgress';
import { PlayCircle } from 'lucide-react';

interface EpisodeCardProps {
  episode: Episode;
  index?: number;
  isCurrent?: boolean;
}

export default function EpisodeCard({ episode, index = 0, isCurrent = false }: EpisodeCardProps) {
  const { getProgress } = useFirebaseProgress();
  const progress = getProgress(episode.id);

  const isCompleted = progress?.completed;
  const isInProgress = progress && !progress.completed && progress.currentTime > 30;
  const percentage = progress?.percentage || 0;

  return (
    <Link
      to={`/watch/${episode.season}/${episode.episode}`}
      className="group block animate-fade-in-up opacity-0"
      style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards' }}
    >
      <div className="flex flex-col gap-3 group-hover:-translate-y-1 transition-transform duration-300">
        
        {/* Web Player Thumbnail */}
        <div className={`relative aspect-video bg-[#111] rounded-xl overflow-hidden transition-all ${
          isCurrent 
            ? 'ring-2 ring-red-600 shadow-[0_0_25px_rgba(220,38,38,0.4)] scale-100 group-hover:scale-105' 
            : 'shadow-lg ring-1 ring-white/10 group-hover:ring-red-600/50'
        }`}>
          
           {/* Fallback Abstract Background for Episodes missing thumbnails */}
           <div className="absolute inset-0 bg-gradient-to-tr from-[#1a1a1a] to-[#0a0a0a]" />
           <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')]" />

           {/* Actual Thumbnail Image */}
           <img 
             src={`/images/thumbnails/Season ${episode.season}/S${String(episode.season).padStart(2,'0')}E${String(episode.episode).padStart(2,'0')}.jpg`}
             alt={episode.title}
             className="absolute inset-0 w-full h-full object-cover z-10 transition-transform duration-700 group-hover:scale-105"
             onError={(e) => {
               (e.target as HTMLImageElement).style.opacity = '0';
               (e.target as HTMLImageElement).style.zIndex = '-1';
             }}
           />

          {/* Episode Number Centered */}
          <div className="absolute inset-0 flex items-center justify-center">
             <span className="font-serif text-5xl font-bold text-white/10 group-hover:text-red-500/20 transition-colors pointer-events-none select-none">
               E{episode.episode}
             </span>
          </div>

          {/* Play Hover Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 backdrop-blur-[2px]">
            <PlayCircle size={48} className="text-white drop-shadow-2xl opacity-90 group-hover:scale-110 transition-transform duration-300" />
          </div>

            {/* Top Badges */}
            <div className="absolute top-2 right-2 flex flex-col gap-1 items-end z-20">
              {isCurrent && (
                <div className="bg-red-600 text-white text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded shadow-[0_0_10px_rgba(220,38,38,0.6)] animate-pulse">
                  ► ŞU AN İZLENEN
                </div>
              )}
              {isCompleted && !isCurrent && (
                <div className="bg-green-600/90 backdrop-blur text-white text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded shadow-md">
                  ✓ İzlendi
                </div>
              )}
              {isInProgress && !isCurrent && (
                <div className="bg-orange-600/90 backdrop-blur text-white text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded shadow-md">
                  KALAN: {formatTime(progress.duration - progress.currentTime)}
                </div>
              )}
            </div>

          {/* Progress Bar (Netflix style) */}
          {percentage > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
              <div
                className="h-full bg-red-600"
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          )}
        </div>

        {/* Text Area */}
        <div className="px-1">
          <div className="flex items-center gap-2 mb-1">
             <span className="text-xs font-mono font-medium text-gray-500">
               {String(episode.episode).padStart(2, '0')}.
             </span>
             <h3 className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors truncate">
               {episode.title}
             </h3>
          </div>
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {episode.description}
          </p>
        </div>

      </div>
    </Link>
  );
}
