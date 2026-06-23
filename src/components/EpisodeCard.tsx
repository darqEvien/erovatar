import { Link } from 'react-router-dom';
import type { Episode } from '../data/episodes';
import { useFirebaseProgress, formatTime } from '../hooks/useFirebaseProgress';
import { PlayCircle } from 'lucide-react';
import ImageWithOverlay from './ImageWithOverlay';

interface EpisodeCardProps {
  episode: Episode;
  index?: number;
  isCurrent?: boolean;
  elementColor?: string;
}

export default function EpisodeCard({ episode, index = 0, isCurrent = false, elementColor = 'var(--water-light)' }: EpisodeCardProps) {
  const { getProgress } = useFirebaseProgress();
  const progress = getProgress(episode.id);

  const isCompleted = progress?.completed;
  const isInProgress = progress && !progress.completed && progress.currentTime > 30;
  const percentage = progress?.percentage || 0;

  return (
    <Link
      to={`/watch/${episode.season}/${episode.episode}`}
      className="group block animate-fade-in-up opacity-0"
      style={{ animationDelay: `${index * 0.04}s`, animationFillMode: 'forwards' }}
    >
      <div className="flex flex-col gap-3 group-hover:-translate-y-1 transition-transform duration-300">

        {/* Thumbnail */}
        <div
          className="relative aspect-video rounded-xl overflow-hidden transition-all duration-300"
          style={{
            background: 'var(--water-mid)',
            border: isCurrent
              ? `2px solid ${elementColor}`
              : '1px solid var(--border-soft)',
            boxShadow: isCurrent ? `0 0 20px ${elementColor}44` : 'none',
          }}
        >
          {/* Background gradient */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, var(--water-deep) 0%, var(--water-mid) 100%)' }} />

          {/* Thumbnail image */}
<ImageWithOverlay
 src={`/images/thumbnails/Season ${episode.season}/e${episode.episode}.webp`}
  alt={episode.title}
  title={episode.title}
  subtitle={`Season ${episode.season} • Episode ${episode.episode}`}
  className="absolute inset-0 w-full h-full object-cover z-10 transition-transform duration-700 group-hover:scale-105"
  onError={(e) => {
    (e.target as HTMLImageElement).style.opacity = '0';
  }}
/>

          {/* Episode number ghost */}
          <div className="absolute inset-0 flex items-center justify-center z-5">
            <span
              className="avatar-title font-bold text-4xl pointer-events-none select-none"
              style={{ color: `${elementColor}18` }}
            >
              {String(episode.episode).padStart(2, '0')}
            </span>
          </div>

          {/* Play hover overlay */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"
            style={{ background: 'rgba(7,13,26,0.55)', backdropFilter: 'blur(2px)' }}
          >
            <PlayCircle size={44} className="text-white drop-shadow-2xl opacity-90 group-hover:scale-110 transition-transform" />
          </div>

          {/* Badges */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 items-end z-30">
            {isCurrent && (
              <div
                className="avatar-title text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded animate-pulse"
                style={{ background: elementColor, color: 'var(--night)' }}
              >
                ► İzleniyor
              </div>
            )}
            {isCompleted && !isCurrent && (
              <div
                className="avatar-title text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded"
                style={{ background: 'rgba(74,158,202,0.2)', color: 'var(--water-light)', border: '1px solid rgba(74,158,202,0.3)' }}
              >
                ✓ İzlendi
              </div>
            )}
            {isInProgress && !isCurrent && (
              <div
                className="avatar-title text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded"
                style={{ background: 'rgba(196,129,58,0.2)', color: 'var(--amber)', border: '1px solid rgba(196,129,58,0.3)' }}
              >
                {formatTime(progress!.duration - progress!.currentTime)} kaldı
              </div>
            )}
          </div>

          {/* Progress bar */}
          {percentage > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 z-30" style={{ background: 'rgba(7,13,26,0.5)' }}>
              <div className="h-full" style={{ width: `${Math.min(percentage, 100)}%`, background: elementColor }} />
            </div>
          )}
        </div>

        {/* Text */}
        <div className="px-0.5">
          <div className="flex items-center gap-2 mb-1">
            <span className="avatar-title text-[10px] font-bold tracking-widest" style={{ color: elementColor }}>
              {String(episode.episode).padStart(2, '0')}
            </span>
            <h3 className="text-xs font-semibold truncate transition-colors group-hover:text-white" style={{ color: 'var(--stone)' }}>
              {episode.title}
            </h3>
          </div>
          <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: 'rgba(138,155,181,0.7)' }}>
            {episode.description}
          </p>
        </div>

      </div>
    </Link>
  );
}