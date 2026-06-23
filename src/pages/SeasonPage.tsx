import { useParams, Link } from 'react-router-dom';
import { getSeasonByNumber } from '../data/episodes';
import { useFirebaseProgress } from '../hooks/useFirebaseProgress';
import EpisodeCard from '../components/EpisodeCard';
import { ArrowLeft } from 'lucide-react';

const ELEMENT_COLORS: Record<number, string> = {
  1: 'var(--element-water)',
  2: 'var(--element-earth)',
  3: 'var(--element-fire)',
};

export default function SeasonPage() {
  const { seasonNumber } = useParams<{ seasonNumber: string }>();
  const num = parseInt(seasonNumber || '1', 10);
  const season = getSeasonByNumber(num);
  const { getSeasonProgress, getLastWatched, loading } = useFirebaseProgress();
  const lastWatched = getLastWatched();

  if (!season) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center text-center px-4" style={{ background: 'var(--night)' }}>
        <div>
          <h1 className="avatar-title text-4xl font-bold mb-4" style={{ color: 'var(--water-light)' }}>
            Kitap Bulunamadı
          </h1>
          <Link to="/" className="avatar-title text-sm tracking-wider" style={{ color: 'var(--stone)' }}>← Ana Sayfaya Dön</Link>
        </div>
      </div>
    );
  }

  const progress = getSeasonProgress(season.number);
  const elementColor = ELEMENT_COLORS[season.number];

  return (
    <div className="w-full min-h-screen" style={{ background: 'var(--night)', color: 'var(--parchment)' }}>

      {/* Header */}
      <div className="relative pt-32 pb-16 overflow-hidden">

        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at top right, ${elementColor}18 0%, transparent 60%)` }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--night) 0%, transparent 100%)' }} />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
          <Link
            to="/"
            className="inline-flex items-center gap-2 avatar-title text-[10px] font-bold uppercase tracking-[0.15em] mb-8 transition-colors"
            style={{ color: 'var(--stone)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--parchment)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--stone)')}
          >
            <ArrowLeft size={14} /> Tüm Kitaplar
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="animate-fade-in-up flex-1">
              {/* Element badge */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="avatar-title text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full"
                  style={{ background: `${elementColor}18`, color: elementColor, border: `1px solid ${elementColor}33` }}
                >
                  ● {season.element}
                </div>
                <span className="avatar-title text-[10px] font-semibold tracking-widest uppercase" style={{ color: 'var(--stone)' }}>
                  {season.year}
                </span>
              </div>

              <h1 className="avatar-title font-bold tracking-wide mb-4" style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', color: 'var(--parchment)', lineHeight: 1.1 }}>
                {season.title}
              </h1>

              <p className="text-sm sm:text-base leading-relaxed max-w-2xl" style={{ color: 'var(--stone)' }}>
                {season.description}
              </p>
            </div>

            {/* Progress */}
            {!loading && (
              <div
                className="animate-fade-in-up shrink-0 w-full md:w-64 p-5 rounded-xl"
                style={{ background: 'var(--water-mid)', border: '1px solid var(--border-soft)' }}
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="avatar-title text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--stone)' }}>
                    İlerleme
                  </span>
                  <span className="avatar-title text-sm font-bold" style={{ color: 'var(--parchment)' }}>
                    {progress.watched} <span style={{ color: 'var(--stone)', fontWeight: 400 }}>/ {progress.total}</span>
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'rgba(74,158,202,0.1)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress.percentage}%`, background: elementColor }}
                  />
                </div>
                <p className="avatar-title text-[10px] tracking-wider mt-2" style={{ color: 'var(--stone)' }}>
                  {season.episodeCount} bölüm
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Episode Grid */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px w-4" style={{ background: elementColor }} />
          <h2 className="avatar-title text-xs font-bold tracking-[0.2em] uppercase" style={{ color: elementColor }}>
            Bölümler
          </h2>
          <div className="h-px flex-1" style={{ background: 'var(--border-soft)' }} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-5 gap-y-10">
          {season.episodes.map((ep, idx) => (
            <EpisodeCard
              key={ep.id}
              episode={ep}
              index={idx}
              isCurrent={lastWatched?.episodeId === ep.id}
              elementColor={elementColor}
            />
          ))}
        </div>
      </div>

      <div className="h-24" />
    </div>
  );
}