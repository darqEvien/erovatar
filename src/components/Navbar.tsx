import { Link, useLocation } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { LogOut, Menu, X, PlaySquare, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';

const SEASON_ELEMENTS = ['Su', 'Toprak', 'Ateş'];

export default function Navbar() {
  const location = useLocation();
  const { user } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'py-3 shadow-2xl'
          : 'py-5 bg-transparent'
      }`}
      style={{
        background: scrolled
          ? 'rgba(7,13,26,0.97)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(74,158,202,0.12)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <img
              src="/images/logo.png"
              alt="Avatar"
              className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
            <Link
              to="/"
              className="avatar-title text-xs font-semibold tracking-widest uppercase transition-all"
              style={{ color: isActive('/') ? 'var(--water-light)' : 'var(--stone)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--parchment)')}
              onMouseLeave={e => (e.currentTarget.style.color = isActive('/') ? 'var(--water-light)' : 'var(--stone)')}
            >
              Ana Sayfa
            </Link>

            {/* Seasons Dropdown */}
            <div className="group relative py-2">
              <span
                className="avatar-title text-xs font-semibold tracking-widest uppercase cursor-pointer transition-colors"
                style={{ color: location.pathname.includes('/season') ? 'var(--water-light)' : 'var(--stone)' }}
              >
                Kitaplar
              </span>

              <div
                className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden"
                style={{ background: 'var(--water-deep)', border: '1px solid var(--border-soft)' }}
              >
                {[1, 2, 3].map((s) => (
                  <Link
                    key={s}
                    to={`/season/${s}`}
                    className="flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-white/5"
                    style={{ color: location.pathname === `/season/${s}` ? 'var(--water-light)' : 'var(--stone)' }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        background: s === 1 ? 'var(--element-water)' : s === 2 ? 'var(--element-earth)' : 'var(--element-fire)'
                      }}
                    />
                    <span className="avatar-title text-xs tracking-wider">Kitap {s}: {SEASON_ELEMENTS[s-1]}</span>
                  </Link>
                ))}
              </div>
            </div>

            <Link
              to="/about"
              className="avatar-title text-xs font-semibold tracking-widest uppercase transition-all"
              style={{ color: isActive('/about') ? 'var(--water-light)' : 'var(--stone)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--parchment)')}
              onMouseLeave={e => (e.currentTarget.style.color = isActive('/about') ? 'var(--water-light)' : 'var(--stone)')}
            >
              Hakkında
            </Link>
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <Link
              to="/profile"
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-full transition-all"
              style={{ background: isActive('/profile') ? 'rgba(74,158,202,0.1)' : 'transparent' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(74,158,202,0.1)')}
              onMouseLeave={e => (e.currentTarget.style.background = isActive('/profile') ? 'rgba(74,158,202,0.1)' : 'transparent')}
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profil" className="w-8 h-8 rounded-full object-cover" style={{ border: '2px solid var(--water-light)' }} />
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--water-mid)', border: '2px solid var(--border-soft)' }}>
                  <User size={14} style={{ color: 'var(--stone)' }} />
                </div>
              )}
              <span className="text-sm font-semibold" style={{ color: 'var(--stone)' }}>
                {user?.displayName || 'Profil'}
              </span>
            </Link>

            <button
              onClick={() => signOut(auth)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-full transition-all avatar-title"
              style={{ color: 'var(--stone)' }}
              onMouseEnter={e => { (e.currentTarget.style.color = 'var(--element-fire)'); (e.currentTarget.style.background = 'rgba(196,90,58,0.1)'); }}
              onMouseLeave={e => { (e.currentTarget.style.color = 'var(--stone)'); (e.currentTarget.style.background = 'transparent'); }}
            >
              <LogOut size={14} />
              Çıkış
            </button>
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center gap-3 shrink-0">
            <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profil" className="w-8 h-8 rounded-full object-cover" style={{ border: '2px solid var(--water-light)' }} />
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--water-mid)', border: '2px solid var(--border-soft)' }}>
                  <User size={14} style={{ color: 'var(--stone)' }} />
                </div>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 transition-colors"
              style={{ color: 'var(--stone)' }}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className="md:hidden absolute top-full left-0 right-0 shadow-2xl animate-fade-in"
          style={{ background: 'rgba(7,13,26,0.98)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border-soft)' }}
        >
          <div className="px-4 py-6 space-y-2">
            <Link to="/profile" onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors"
              style={{ color: 'var(--parchment)', background: 'rgba(74,158,202,0.08)' }}
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profil" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--water-mid)' }}>
                  <User size={14} />
                </div>
              )}
              {user?.displayName || 'Profil'}
            </Link>

            <Link to="/" onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-xl text-base font-semibold avatar-title tracking-wider transition-colors"
              style={{ color: isActive('/') ? 'var(--water-light)' : 'var(--stone)', background: isActive('/') ? 'rgba(74,158,202,0.1)' : 'transparent' }}
            >
              Ana Sayfa
            </Link>

            <div className="pt-3 pb-1">
              <p className="px-4 text-[10px] font-bold uppercase tracking-widest avatar-title" style={{ color: 'var(--stone)' }}>
                Kitaplar
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 px-2">
              {[1, 2, 3].map((s) => (
                <Link key={s} to={`/season/${s}`} onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                  style={{
                    color: location.pathname === `/season/${s}` ? 'var(--water-light)' : 'var(--stone)',
                    background: location.pathname === `/season/${s}` ? 'rgba(74,158,202,0.1)' : 'transparent'
                  }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: s === 1 ? 'var(--element-water)' : s === 2 ? 'var(--element-earth)' : 'var(--element-fire)' }} />
                  <PlaySquare size={14} />
                  <span className="avatar-title tracking-wider">Kitap {s}: {SEASON_ELEMENTS[s-1]}</span>
                </Link>
              ))}
            </div>

            <Link to="/about" onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 mt-2 rounded-xl text-base font-semibold avatar-title tracking-wider transition-colors"
              style={{ color: isActive('/about') ? 'var(--water-light)' : 'var(--stone)' }}
            >
              Hakkında
            </Link>

            <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-soft)' }}>
              <button
                onClick={() => { setMobileMenuOpen(false); signOut(auth); }}
                className="w-full flex justify-center items-center gap-2 px-4 py-3 font-semibold rounded-xl transition-colors avatar-title tracking-wider text-sm"
                style={{ color: 'var(--element-fire)' }}
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