import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white pt-24 pb-16 px-4 font-sans relative">
      <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

      <div className="max-w-2xl mx-auto relative z-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Geri
        </button>

        <div className="bg-[#111] border border-white/10 rounded-3xl shadow-2xl p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-900" />

          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight mb-8 text-white">
            Hangi Arzın Talebi?
          </h1>

          <div className="space-y-6 text-gray-300 leading-relaxed text-base sm:text-lg font-medium">
            <p>
              Bu projenin amacı şu an Sopranos'u izleyebileceğimiz güzel bir platform olmadığından bölümleri indirip kendim bir site geliştirdim.
            </p>
            <p>
              Açıkcası tek istediğim hangi bölümde kaldığımı hatırlayıp yemek yerken de telefondan izleyebilmekti, madem yapıyorum biraz daha tam olsun diye ekstralar koydum.
            </p>
            <p className="pt-4 border-t border-white/10 text-gray-400 text-sm">
              Herhangi bir öneriniz, isteğiniz veya sıkıntısı varsa numaram vardır herhalde WhatsApp'tan yazabilirsiniz keyfime göre ayarlayabiliriz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
