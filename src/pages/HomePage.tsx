import { Link } from 'react-router-dom';
import { seasons, totalEpisodes } from '../data/episodes';
import { useFirebaseProgress } from '../hooks/useFirebaseProgress';
import { Play } from 'lucide-react';

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

export default function HomePage() {
  const { getSeasonProgress, getLastWatched, loading } = useFirebaseProgress();
  const lastWatched = getLastWatched();
  const hasContinue = !loading && lastWatched && !lastWatched.completed;

  let remainingMinutes = 0;
  if (hasContinue) {
    const remSec = (lastWatched.duration || 0) - (lastWatched.currentTime || 0);
    remainingMinutes = Math.max(1, Math.floor(remSec / 60));
  }

  return (
    <div className="w-full min-h-screen" style={{ background: 'var(--night)', color: 'var(--parchment)' }}>

      {/* ── HERO ── */}
      <section className="relative w-full min-h-[75vh] flex flex-col justify-end pt-32 pb-20 overflow-hidden">

        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('/images/hero-bg.png')`,
              opacity: 0.55,
            }}
          />
          {/* Layered gradients for depth */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--night) 0%, rgba(7,13,26,0.7) 40%, transparent 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, var(--night) 0%, rgba(7,13,26,0.4) 50%, transparent 100%)' }} />
          {/* Water element glow top-right */}
          <div className="absolute top-0 right-0 w-2/3 h-full" style={{ background: 'radial-gradient(ellipse at top right, rgba(74,158,202,0.18) 0%, transparent 60%)' }} />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
          <div className="max-w-3xl animate-fade-in-up">
  {/* Logo / Title */}
            <div className="mb-6">
              <img
                src="/images/logo.png"
                alt="Avatar: The Last Airbender"
                className="w-full max-w-[380px] h-auto object-contain drop-shadow-2xl"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <h1 className="avatar-title-decorative text-5xl sm:text-7xl font-bold tracking-tight hidden"
                style={{ color: 'var(--parchment)', textShadow: '0 0 40px rgba(74,158,202,0.4)' }}
              >
                AVATAR
              </h1>
            </div>
            {/* Eyebrow */}
            <div className="flex items-center gap-4 mb-5">
              <div className="h-px w-8" style={{ background: 'var(--water-light)' }} />
              <span
                className="avatar-title text-[10px] font-bold tracking-[0.25em] uppercase"
                style={{ color: 'var(--water-light)' }}
              >
                Nickelodeon • {totalEpisodes} Bölüm
              </span>
            </div>

          

            <p className="text-sm sm:text-base leading-relaxed mb-8 max-w-xl" style={{ color: 'var(--stone)' }}>
              Su, Toprak, Ateş ve Hava — dört element birden bükebilen tek kişi olan Avatar, kaybolduğu yüz yılın ardından geri döner. Dünyayı dengede tutmak için zamanı azalmaktadır.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {hasContinue ? (
                <Link
                  to={`/watch/${lastWatched.season}/${lastWatched.episode}`}
                  className="group relative flex items-center gap-3 px-8 py-3.5 rounded-sm font-bold text-sm uppercase tracking-wider avatar-title overflow-hidden"
                  style={{ background: 'var(--water-light)', color: 'var(--night)' }}
                >
                  <Play fill="currentColor" size={18} className="group-hover:scale-110 transition-transform" />
                  <span className="flex flex-col items-start leading-tight">
                    <span>Devam Et</span>
                    <span className="text-[9px] font-bold tracking-widest mt-0.5 opacity-70">
                      K{lastWatched.season} B{String(lastWatched.episode).padStart(2,'0')} • {remainingMinutes} DK KALDI
                    </span>
                  </span>
                  <div className="absolute bottom-0 left-0 h-0.5 w-full" style={{ background: 'rgba(0,0,0,0.2)' }}>
                    <div
                      className="h-full transition-all duration-500"
                      style={{ width: `${Math.min(lastWatched.percentage || 0, 100)}%`, background: 'rgba(0,0,0,0.4)' }}
                    />
                  </div>
                </Link>
              ) : (
                <Link
                  to="/watch/1/1"
                  className="flex items-center gap-2 px-8 py-3.5 rounded-sm font-bold text-sm uppercase tracking-wider avatar-title"
                  style={{ background: 'var(--water-light)', color: 'var(--night)' }}
                >
                  <Play fill="currentColor" size={18} />
                  Baştan İzle
                </Link>
              )}
              <a
                href="#seasons"
                className="flex items-center gap-2 px-8 py-3.5 rounded-sm font-bold text-sm uppercase tracking-wider avatar-title transition-all"
                style={{ background: 'rgba(74,158,202,0.08)', color: 'var(--stone)', border: '1px solid var(--border-soft)' }}
                onMouseEnter={e => { (e.currentTarget.style.borderColor = 'var(--border-glow)'); (e.currentTarget.style.color = 'var(--parchment)'); }}
                onMouseLeave={e => { (e.currentTarget.style.borderColor = 'var(--border-soft)'); (e.currentTarget.style.color = 'var(--stone)'); }}
              >
                Tüm Kitaplar
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── SEASONS GRID ── */}
      <section id="seasons" className="relative z-10 pt-12 pb-24">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">

          <div className="flex items-center gap-4 mb-8">
            <div className="h-px w-6" style={{ background: 'var(--water-light)' }} />
            <h2 className="avatar-title text-base font-bold tracking-[0.2em] uppercase" style={{ color: 'var(--water-light)' }}>
              Üç Kitap
            </h2>
            <div className="h-px flex-1" style={{ background: 'var(--border-soft)' }} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {seasons.map((season) => {
              const progress = getSeasonProgress(season.number);
              const elementColor = ELEMENT_COLORS[season.number];
              const isCurrent = lastWatched?.season === season.number;

              return (
                <Link
                  key={season.number}
                  to={`/season/${season.number}`}
                  className="group relative flex flex-col gap-4 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Poster */}
                  <div
                    className="relative aspect-[2/3] w-full rounded-xl overflow-hidden"
                    style={{
                      background: 'var(--water-mid)',
                      border: isCurrent
                        ? `2px solid ${elementColor}`
                        : '1px solid var(--border-soft)',
                      boxShadow: isCurrent ? `0 0 30px ${elementColor}33` : 'none',
                      transition: 'border-color 0.3s, box-shadow 0.3s',
                    }}
                    onMouseEnter={e => {
                      if (!isCurrent) {
                        (e.currentTarget as HTMLElement).style.borderColor = elementColor;
                        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${elementColor}22`;
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isCurrent) {
                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-soft)';
                        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                      }
                    }}
                  >
                    {/* Background gradients based on element */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: season.number === 1
                          ? 'linear-gradient(135deg, #0d1f3c 0%, #0a2a4a 50%, #0d3356 100%)'
                          : season.number === 2
                          ? 'linear-gradient(135deg, #1a2a0d 0%, #2a3a1a 50%, #1e3010 100%)'
                          : 'linear-gradient(135deg, #3c0d0d 0%, #4a1a0a 50%, #5c1a0a 100%)',
                      }}
                    />

                    <img
                      src={`/images/posters/season-${season.number}.jpg`}
                      alt={season.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:opacity-90 transition-opacity duration-500"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(7,13,26,0.9) 0%, transparent 60%)' }} />

                    {/* Element badge top-left */}
                    <div className="absolute top-3 left-3 z-10">
                      <div
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full avatar-title text-[10px] font-bold tracking-widest uppercase"
                        style={{ background: `${elementColor}22`, color: elementColor, border: `1px solid ${elementColor}44` }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: elementColor }} />
                        {ELEMENT_LABELS[season.number]}
                      </div>
                    </div>

                    {/* Currently watching badge */}
                    {isCurrent && (
                      <div className="absolute top-3 right-3 z-10">
                        <span
                          className="avatar-title text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded"
                          style={{ background: elementColor, color: 'var(--night)' }}
                        >
                          ► İzleniyor
                        </span>
                      </div>
                    )}

                    {/* Play overlay */}
                    <div
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"
                      style={{ background: 'rgba(7,13,26,0.4)' }}
                    >
                      <div
                        className="rounded-full p-5 transform scale-90 group-hover:scale-100 transition-all"
                        style={{ background: `${elementColor}33`, border: `2px solid ${elementColor}`, boxShadow: `0 0 20px ${elementColor}44` }}
                      >
                        <Play fill="white" size={24} className="text-white ml-0.5" />
                      </div>
                    </div>

                    {/* Progress bar */}
                    {progress.percentage > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 z-10" style={{ background: 'rgba(7,13,26,0.5)' }}>
                        <div className="h-full transition-all" style={{ width: `${progress.percentage}%`, background: elementColor }} />
                      </div>
                    )}

                    {/* Title bottom overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                      <p className="avatar-title text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: elementColor }}>
                        {season.year}
                      </p>
                      <h3 className="avatar-title text-sm font-bold" style={{ color: 'var(--parchment)' }}>
                        {season.title}
                      </h3>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="px-1">
                    <div className="flex items-center justify-between">
                      <span className="avatar-title text-xs font-semibold tracking-wider" style={{ color: 'var(--stone)' }}>
                        {season.episodeCount} Bölüm
                      </span>
                      {progress.percentage > 0 && (
                        <span className="text-xs font-semibold" style={{ color: elementColor }}>
                          {progress.watched}/{progress.total} İzlendi
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-1 leading-relaxed line-clamp-2" style={{ color: 'var(--stone)' }}>
                      {season.description.slice(0, 80)}…
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}