import { useParams, Link } from 'react-router-dom';
import { getSeasonByNumber } from '../data/episodes';
import { useFirebaseProgress } from '../hooks/useFirebaseProgress';
import EpisodeCard from '../components/EpisodeCard';
import { ArrowLeft, PlaySquare } from 'lucide-react';

export default function SeasonPage() {
  const { seasonNumber } = useParams<{ seasonNumber: string }>();
  const num = parseInt(seasonNumber || '1', 10);
  const season = getSeasonByNumber(num);
  const { getSeasonProgress, getLastWatched, loading } = useFirebaseProgress();
  const lastWatched = getLastWatched();

  if (!season) {
    return (
      <div className="w-full bg-black min-h-screen flex items-center justify-center text-center px-4">
         <div>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold text-red-600 mb-4 tracking-tight">
            Sezon Bulunamadı
          </h1>
          <Link to="/" className="text-white hover:text-red-500 transition-colors font-medium">
            ← Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  const progress = getSeasonProgress(season.number);

  return (
    <div className="w-full min-h-screen bg-black text-white font-sans">
      
      {/* Header Area */}
      <div className="relative pt-32 pb-16 overflow-hidden">
        
        {/* Cinematic Backdrop */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-10" />
        <div className="absolute top-0 right-0 w-3/4 h-full bg-[radial-gradient(ellipse_at_top_right,_rgba(220,38,38,0.15)_0%,_transparent_60%)] pointer-events-none z-0" />
        
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
          <Link to="/" className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-[0.1em] text-gray-400 hover:text-white transition-colors mb-8">
            <ArrowLeft size={16} /> Tüm Sezonlar
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 md:gap-16">
            <div className="animate-fade-in-up flex-1">
              
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-[#222] text-white px-2 py-0.5 rounded text-xs font-bold tracking-widest uppercase">
                  {season.year}
                </span>
                <span className="text-sm font-bold text-red-500 flex items-center gap-1.5 uppercase tracking-widest">
                  <PlaySquare size={14} /> {season.episodeCount} Bölüm
                </span>
              </div>

              <h1 className="font-serif text-5xl sm:text-7xl font-bold text-white tracking-tight mb-6 drop-shadow-lg leading-none">
                Sezon {season.number}
              </h1>

              <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-3xl">
                {season.description}
              </p>
            </div>

            {/* Micro Progress Bar */}
            {!loading && (
              <div className="animate-fade-in-up shrink-0 w-full md:w-64 bg-[#111] p-5 rounded-md border border-[#222]">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    Sezon İlerlemesi
                  </span>
                  <span className="text-sm font-bold text-white">
                    {progress.watched} <span className="text-gray-600 font-normal">/ {progress.total}</span>
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[#222] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-600 transition-all duration-500"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid Area */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-8">
        <h2 className="text-xl font-bold text-white tracking-tight mb-6">Bölümler</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {season.episodes.map((ep, idx) => (
            <EpisodeCard 
              key={ep.id} 
              episode={ep} 
              index={idx} 
              isCurrent={lastWatched?.episodeId === ep.id} 
            />
          ))}
        </div>
      </div>

      {/* Footer Buffer */}
      <div className="h-24 bg-black" />
    </div>
  );
}
