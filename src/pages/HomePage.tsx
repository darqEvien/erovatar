import { Link } from 'react-router-dom';
import { seasons, totalEpisodes } from '../data/episodes';
import { useFirebaseProgress } from '../hooks/useFirebaseProgress';
import { Play } from 'lucide-react';

export default function HomePage() {
  const { getSeasonProgress, getLastWatched, loading } = useFirebaseProgress();
  const lastWatched = getLastWatched();
  const hasContinue = !loading && lastWatched && !lastWatched.completed;

  // Son izlenen bölümün detaylarını bul
  let remainingMinutes = 0;
  if (hasContinue) {
    const remSec = (lastWatched.duration || 0) - (lastWatched.currentTime || 0);
    remainingMinutes = Math.max(1, Math.floor(remSec / 60));
  }

  return (
    <div className="w-full bg-black text-white mix-blend-normal">

      {/* 
        HERO SECTION
        A strictly responsive hero layout mimicking HBO Max. 
        It scales beautifully from mobile to ultra-wide without absolute positioning overlaps.
      */}
      <section className="relative w-full min-h-[70vh] flex flex-col justify-end pt-32 pb-16 overflow-hidden">

        {/* Background Visual Layer */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0 bg-cover bg-top opacity-80"
            style={{ backgroundImage: `url('/images/hero-bg.jpg')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-10" />
          {/* Subtle red tint */}
          <div className="absolute top-0 right-0 w-2/3 h-full bg-[radial-gradient(ellipse_at_top_right,_rgba(185,28,28,0.2)_0%,_transparent_60%)] z-0" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay z-0" />
        </div>

        {/* Hero Content bounded inside a perfectly centered container */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
          <div className="max-w-4xl animate-fade-in-up">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-red-500 py-1 border-l-2 border-red-600 pl-3">
                HBO Orijinal Yapımı
              </span>
              <span className="text-gray-400 font-mono text-xs font-semibold">1999 • {totalEpisodes} Bölüm</span>
            </div>

            <div className="mb-6 relative">
              <img
                src="/images/logo.png"
                alt="The Sopranos"
                className="w-full max-w-[300px] sm:max-w-[400px] h-auto object-contain drop-shadow-2xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  document.getElementById('fallback-text-logo')?.classList.remove('hidden');
                }}
              />
              <h1 id="fallback-text-logo" className="hidden font-serif text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-white drop-shadow-2xl">
                The <span className="text-red-600">Sopranos</span>
              </h1>
            </div>

            <p className="max-w-2xl text-gray-300 text-sm sm:text-lg leading-relaxed mb-8 text-shadow-md">
              New Jersey mafya patronu Tony Soprano,
              kendi ailesi ve yeraltı suç ailesi arasındaki sarsıcı dengeyi korumaya çalışırken, gizlice psikiyatrik tedavi almak zorunda kalır. Televizyon tarihinin en prestijli suçu.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {hasContinue ? (
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                  <Link
                    to={`/watch/${lastWatched.season}/${lastWatched.episode}`}
                    className="group relative flex items-center gap-3 bg-white hover:bg-gray-200 text-black px-8 py-3.5 rounded-sm font-bold text-base transition-all overflow-hidden"
                  >
                    <Play fill="currentColor" size={20} className="group-hover:scale-110 transition-transform" />
                    <span className="flex flex-col items-start leading-tight">
                      <span>Devam Et</span>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">
                        S{String(lastWatched.season).padStart(2,'0')} B{String(lastWatched.episode).padStart(2,'0')} • {remainingMinutes} DK KALDI
                      </span>
                    </span>
                    
                    {/* Minimal Progress Bar */}
                    <div className="absolute bottom-0 left-0 h-1 bg-black/10 w-full">
                      <div 
                        className="h-full bg-red-600 transition-all duration-500" 
                        style={{ width: `${Math.min(lastWatched.percentage || 0, 100)}%` }} 
                      />
                    </div>
                  </Link>
                </div>
              ) : (
                <Link
                  to={`/watch/1/1`}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-200 px-8 py-3.5 rounded-sm font-bold text-base transition-all"
                >
                  <Play fill="currentColor" size={20} />
                  İlk Bölümü İzle
                </Link>
              )}
              <a href="#seasons" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#222]/80 hover:bg-[#333] text-white px-8 py-3.5 rounded-sm font-bold text-base backdrop-blur-sm transition-all border border-white/5 shadow-xl">
                Tüm Sezonlar
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 
        SEASONS GRID 
        A perfectly responsive, cleanly spaced grid standard across streaming apps.
      */}
      <section id="seasons" className="relative z-20 bg-black pt-12">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
          <h2 className="text-2xl font-bold text-white tracking-tight mb-6 flex items-center gap-2">
            Sezonlar
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {seasons.map((season) => {
              const progress = getSeasonProgress(season.number);

              return (
                <Link
                  key={season.number}
                  to={`/season/${season.number}`}
                  className="group relative flex flex-col gap-3 rounded-md transition-all hover:z-10"
                >
                  {/* Visual Thumbnail for Season */}
                  <div className={`relative aspect-[2/3] w-full rounded-md overflow-hidden bg-[#111] transition-all duration-300 border ${
                    lastWatched?.season === season.number 
                      ? 'border-red-600 ring-1 ring-red-600 shadow-[0_0_20px_rgba(220,38,38,0.3)] scale-[1.02] group-hover:scale-[1.04]' 
                      : 'border-[#222] group-hover:border-red-600/50 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(220,38,38,0.2)]'
                  }`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />

                    {/* Big Stylized Number representing the Poster */}
                    <img
                      src={`/images/posters/season-${season.number}.jpg`}
                      alt={`Sopranos Season ${season.number}`}
                      className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        const fallback = document.getElementById(`fallback-s${season.number}`);
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    <div
                      id={`fallback-s${season.number}`}
                      className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-10 transition-opacity"
                      style={{ display: 'none' }}
                    >
                      <span className="font-serif text-[180px] font-black text-white/50 leading-none">
                        {season.number}
                      </span>
                    </div>

                    {/* Badges / Micro Info */}
                    <div className="absolute top-2 right-2 z-20 flex flex-col items-end gap-1.5">
                      {lastWatched?.season === season.number && (
                        <span className="bg-red-600 text-white px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(220,38,38,0.6)] animate-pulse">
                          ► ŞU AN İZLENİYOR
                        </span>
                      )}
                      <span className="bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-bold text-gray-300 border border-white/10 uppercase tracking-widest">
                        {season.year}
                      </span>
                    </div>

                    {/* Play Overlay */}
                    <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity duration-300">
                      <div className="bg-black/50 border border-white/20 rounded-full p-4 backdrop-blur-sm transform scale-90 group-hover:scale-100 transition-all">
                        <Play fill="white" size={24} className="text-white ml-1" />
                      </div>
                    </div>

                    {/* Progress Line */}
                    {progress.percentage > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#222] z-20">
                        <div
                          className="h-full bg-red-600"
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Season Metadata */}
                  <div>
                    <h3 className="text-white font-bold text-base leading-none mb-1 group-hover:text-red-500 transition-colors">
                      Sezon {season.number}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                      <span>{season.episodeCount} Bölüm</span>
                      {progress.percentage > 0 && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-gray-500" />
                          <span>{progress.watched} İzlendi</span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer Buffer */}
      <div className="h-24 bg-black" />
    </div>
  );
}
