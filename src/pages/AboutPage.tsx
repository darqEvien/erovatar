import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen w-full pt-24 pb-16 px-4 font-sans relative"
      style={{ background: 'var(--night)', color: 'var(--parchment)' }}
    >
      {/* Subtle water glow background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top right, rgba(74,158,202,0.08) 0%, transparent 60%)' }}
      />

      <div className="max-w-2xl mx-auto relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-8 transition-colors group avatar-title text-xs font-bold tracking-widest uppercase"
          style={{ color: 'var(--stone)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--parchment)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--stone)')}
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Geri
        </button>

        <div
          className="rounded-2xl shadow-2xl p-8 sm:p-12 relative overflow-hidden"
          style={{ background: 'var(--water-mid)', border: '1px solid var(--border-soft)' }}
        >
          {/* Top accent line */}
          <div
            className="absolute top-0 left-0 w-full h-px"
            style={{ background: 'linear-gradient(90deg, transparent, var(--water-light), var(--amber), var(--water-light), transparent)' }}
          />

          {/* Avatar symbol decorative */}
          <div
            className="absolute top-6 right-8 avatar-title-decorative text-7xl font-black pointer-events-none select-none"
            style={{ color: 'rgba(74,158,202,0.06)', lineHeight: 1 }}
          >
            氣
          </div>

          <h1 className="avatar-title text-2xl sm:text-3xl font-bold tracking-wide mb-8" style={{ color: 'var(--parchment)' }}>
            Neden Bu Site?
          </h1>

          <div className="space-y-6 text-sm sm:text-base leading-relaxed" style={{ color: 'var(--stone)' }}>
            <p>
              Avatar: Son Hava Bükücü'yü izlemek canım çekti. Madem sopranos'a yaptık buna da yapabiliriz dedim.
            </p>
            <p>
              Tek istediğim hangi bölümde kaldığımı hatırlayıp yemek yerken telefondan da izleyebilmekti. Madem yapıyorum diye biraz daha tam yapalım dedim; yorum sistemi, ilerleme takibi ve avatar temasına döndürdüm.
            </p>

            {/* Element divider */}
            <div className="flex items-center gap-4 py-2">
              <div className="h-px flex-1" style={{ background: 'var(--border-soft)' }} />
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--element-water)' }} />
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--element-earth)' }} />
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--element-fire)' }} />
              </div>
              <div className="h-px flex-1" style={{ background: 'var(--border-soft)' }} />
            </div>

            <p className="text-xs" style={{ color: 'rgba(138,155,181,0.6)' }}>
              Öneri, istek veya bir sorun varsa WhatsApp'tan yazabilirsiniz — keyfime göre ayarlayabiliriz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}