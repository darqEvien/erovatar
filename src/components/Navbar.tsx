import { Link, useLocation } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { LogOut, Menu, X, PlaySquare, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';

export default function Navbar() {
  const location = useLocation();
  const { user } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-500 ${scrolled
        ? 'bg-[#050505]/95 backdrop-blur-xl border-white/5 py-3 shadow-2xl'
        : 'bg-transparent border-white/0 py-6'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <img src="/images/logo.png" alt="The Sopranos" className="h-8 w-auto object-contain transition-transform group-hover:scale-105" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 absolute left-1/2 transform -translate-x-1/2">
            <Link
              to="/"
              className={`text-sm font-semibold transition-all ${isActive('/') ? 'text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Ana Sayfa
            </Link>

            <div className="group relative py-2">
              <span className={`text-sm font-semibold text-gray-400 hover:text-white cursor-pointer transition-colors ${location.pathname.includes('/season') ? 'text-white' : ''}`}>
                Sezonlar
              </span>

              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-[#111] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden">
                {[1, 2, 3, 4, 5, 6].map((s) => (
                  <Link
                    key={s}
                    to={`/season/${s}`}
                    className={`block px-4 py-2.5 text-sm transition-colors hover:bg-white/5 ${location.pathname === `/season/${s}` ? 'text-red-500 font-bold bg-white/5' : 'text-gray-300'}`}
                  >
                    Sezon {s}
                  </Link>
                ))}
              </div>
            </div>

            <Link
              to="/about"
              className={`text-sm font-semibold transition-all ${isActive('/about') ? 'text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Hakkında
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {/* Profil Avatarı + Linki */}
            <Link
              to="/profile"
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full transition-all hover:bg-white/10 ${isActive('/profile') ? 'bg-white/10' : ''}`}
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profil"
                  className="w-8 h-8 rounded-full object-cover border-2 border-white/20 hover:border-red-500 transition-all"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/10 border-2 border-white/20 hover:border-red-500 transition-all flex items-center justify-center">
                  <User size={14} className="text-gray-400" />
                </div>
              )}
              <span className="text-sm font-semibold text-gray-300 hover:text-white transition-colors">
                {user?.displayName || 'Profil'}
              </span>
            </Link>

            <button
              onClick={() => signOut(auth)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-all"
            >
              <LogOut size={16} className="text-red-500" />
              Çıkış
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3 shrink-0">
            {/* Mobile avatar */}
            <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profil"
                  className="w-8 h-8 rounded-full object-cover border-2 border-white/20"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center">
                  <User size={14} className="text-gray-400" />
                </div>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-300 hover:text-white transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur-3xl border-b border-white/10 shadow-2xl animate-fade-in">
          <div className="px-4 py-6 space-y-2">

            {/* Mobile Profil Satırı */}
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-colors ${isActive('/profile') ? 'bg-white/10 text-white' : 'text-gray-200 hover:bg-white/5'}`}
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profil" className="w-8 h-8 rounded-full object-cover border border-white/20" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                  <User size={14} className="text-gray-400" />
                </div>
              )}
              {user?.displayName || 'Profil Ayarları'}
            </Link>

            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-3 rounded-xl text-base font-semibold transition-colors ${isActive('/') ? 'bg-red-600 text-white' : 'text-gray-200 hover:bg-white/5'}`}
            >
              Ana Sayfa
            </Link>

            <div className="pt-4 pb-2">
              <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Tüm Sezonlar</p>
            </div>

            <div className="grid grid-cols-2 gap-2 px-2">
              {[1, 2, 3, 4, 5, 6].map((s) => (
                <Link
                  key={s}
                  to={`/season/${s}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${location.pathname === `/season/${s}` ? 'bg-white/10 text-red-400 border border-white/10' : 'text-gray-300 hover:bg-white/5 border border-transparent'}`}
                >
                  <PlaySquare size={14} className={location.pathname === `/season/${s}` ? 'text-red-500' : 'text-gray-500'} />
                  Sezon {s}
                </Link>
              ))}
            </div>

            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-3 mt-4 rounded-xl text-base font-semibold transition-colors ${isActive('/about') ? 'bg-red-600 text-white' : 'text-gray-200 hover:bg-white/5'}`}
            >
              Hakkında
            </Link>

            <div className="mt-4 pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut(auth);
                }}
                className="w-full flex justify-center items-center gap-2 px-4 py-3 text-red-500 hover:bg-red-500/10 font-semibold rounded-xl transition-colors"
              >
                <LogOut size={18} />
                Oturumu Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}