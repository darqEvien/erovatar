import { useEffect, useRef, useState } from 'react';
import { auth, db } from '../lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { checkUsernameAvailable, completeUserProfile } from '../lib/userUtils';
import { AVATARS } from '../data/avatars';
import ImageWithOverlay from '../components/ImageWithOverlay';

function formatCharacterName(filename: string): string {
  return filename
    .replace(/\.[^.]+$/, '')
    .replace(/_/g, ' ')
    .replace(/%2C/g, ',')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

const ELEMENTS = [
  {
    key: 'air',
    icon: '/elements/element-air.png',
    label: 'Hava',
    color: '#6dcfcf',
    glow: 'rgba(109,207,207,0.35)',
    bg: 'rgba(109,207,207,0.07)',
  },
  {
    key: 'water',
    icon: '/elements/element-water.png',
    label: 'Su',
    color: '#3a5fc0',
    glow: 'rgba(58,95,192,0.4)',
    bg: 'rgba(58,95,192,0.08)',
  },
  {
    key: 'earth',
    icon: '/elements/element-earth.png',
    label: 'Toprak',
    color: '#3a8c3f',
    glow: 'rgba(58,140,63,0.35)',
    bg: 'rgba(58,140,63,0.07)',
  },
  {
    key: 'fire',
    icon: '/elements/element-fire.png',
    label: 'Ateş',
    color: '#e02020',
    glow: 'rgba(224,32,32,0.4)',
    bg: 'rgba(224,32,32,0.08)',
  },
];

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [requireProfileCompletion, setRequireProfileCompletion] = useState(false);
  const [tempGoogleUser, setTempGoogleUser] = useState<any>(null);
  const [activeElement, setActiveElement] = useState(0);

  const googleFlowActive = useRef(false);
  const navigate = useNavigate();
  const { user } = useStore();

  // Cycle through elements subtly
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveElement((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user || googleFlowActive.current) return;
    getDoc(doc(db, 'users', user.uid)).then((snap) => {
      if (snap.exists() && snap.data()?.username) navigate('/');
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!username || username.trim().length < 3) {
      setUsernameAvailable(null);
      return;
    }
    setCheckingUsername(true);
    const timer = setTimeout(async () => {
      const available = await checkUsernameAvailable(username);
      setUsernameAvailable(available);
      setCheckingUsername(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/');
      } else {
        if (!username || username.trim().length < 3) throw new Error('Kullanıcı adı en az 3 karakter olmalı.');
        if (!usernameAvailable) throw new Error('Bu kullanıcı adı başkası tarafından alınmış!');
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const photoPath = selectedAvatar ? `/profilePics/${selectedAvatar}` : null;
        await completeUserProfile(cred.user, username, photoPath);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    googleFlowActive.current = true;
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const docSnap = await getDoc(doc(db, 'users', cred.user.uid));
      if (docSnap.exists() && docSnap.data()?.username) {
        navigate('/');
      } else {
        setTempGoogleUser(cred.user);
        setRequireProfileCompletion(true);
      }
    } catch (err: any) {
      setError(err.message || 'Google girişi başarısız.');
      googleFlowActive.current = false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (!username || username.trim().length < 3) throw new Error('Kullanıcı adı en az 3 karakter olmalı.');
      if (!usernameAvailable) throw new Error('Bu kullanıcı adı başkası tarafından alınmış!');
      const photoPath = selectedAvatar ? `/profilePics/${selectedAvatar}` : null;
      await completeUserProfile(tempGoogleUser, username, photoPath);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Profil güncellenemedi.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAvatar = (av: string) => setSelectedAvatar((prev) => (prev === av ? null : av));

  const getUsernameStatus = () => {
    if (!username || username.trim().length < 3) return null;
    if (checkingUsername) return { color: '#8db87a', msg: 'Kontrol ediliyor...' };
    if (usernameAvailable === true) return { color: '#8db87a', msg: '✓ Kullanılabilir' };
    if (usernameAvailable === false) return { color: '#c0502a', msg: '✗ Bu nick alınmış' };
    return null;
  };
  const status = getUsernameStatus();

  const el = ELEMENTS[activeElement];

  const AvatarPicker = () => (
    <div>
      <label
        style={{ color: '#6a8fa8', fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}
      >
        Profil Resmi{' '}
        <span style={{ color: '#3a5870', fontWeight: 400, letterSpacing: 0, textTransform: 'none' }}>(isteğe bağlı)</span>
      </label>
      <p style={{ color: '#3a5870', fontSize: 11, marginBottom: 12 }}>Sonradan profil ayarlarından değiştirebilirsin.</p>
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 10, paddingTop: 4 }}>
        {AVATARS.map((av) => {
          const characterName = formatCharacterName(av);
          const isSelected = selectedAvatar === av;
          return (
            <button
              key={av}
              type="button"
              onClick={() => toggleAvatar(av)}
              style={{
                flexShrink: 0,
                borderRadius: 12,
                overflow: 'hidden',
                width: 56,
                height: 56,
                border: isSelected ? `2px solid ${el.color}` : '2px solid transparent',
                boxShadow: isSelected ? `0 0 12px ${el.glow}` : 'none',
                transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                filter: isSelected ? 'none' : 'grayscale(0.6) brightness(0.7)',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                padding: 0,
                background: 'none',
              }}
            >
              <ImageWithOverlay
                src={`/profilePics/${av}`}
                alt={characterName}
                overlayTexts={[]}
                className="w-full h-full object-cover"
              />
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: '#060c14',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        padding: '40px 16px',
        overflowY: 'auto',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* ── Atmosfer katmanı ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {/* Dalgalı su yansıması — alt */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '45%',
            background: 'linear-gradient(to top, rgba(18,52,80,0.55) 0%, transparent 100%)',
          }}
        />
        {/* Aktif element renk nefesi */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: el.glow.replace('0.4', '0.12').replace('0.35', '0.10'),
            filter: 'blur(100px)',
            transition: 'background 1.2s ease',
          }}
        />
        {/* Köşe aksan */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: 'rgba(26,74,110,0.18)',
            filter: 'blur(80px)',
          }}
        />
        {/* İnce yatay çizgiler — eski parşömen */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(74,120,158,0.03) 40px, rgba(74,120,158,0.03) 41px)',
          }}
        />
        {/* Köşegen arka plan element sembolleri */}
        {ELEMENTS.map((e, i) => (
          <img
            key={e.key}
            src={e.icon}
            alt={e.label}
            style={{
              position: 'absolute',
              width: 160,
              height: 160,
              objectFit: 'contain',
              opacity: activeElement === i ? 0.07 : 0.025,
              transition: 'opacity 1.2s ease',
              userSelect: 'none',
              pointerEvents: 'none',
              filter: `brightness(0) saturate(100%) ${i === 0 ? 'invert(75%) sepia(40%) saturate(400%) hue-rotate(145deg)' : i === 1 ? 'invert(20%) sepia(80%) saturate(500%) hue-rotate(200deg)' : i === 2 ? 'invert(35%) sepia(60%) saturate(400%) hue-rotate(90deg)' : 'invert(15%) sepia(100%) saturate(700%) hue-rotate(0deg)'}`,
              ...(i === 0 ? { top: '6%', left: '4%' } : {}),
              ...(i === 1 ? { top: '12%', right: '5%' } : {}),
              ...(i === 2 ? { bottom: '18%', left: '5%' } : {}),
              ...(i === 3 ? { bottom: '10%', right: '4%' } : {}),
            }}
          />
        ))}
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: 420,
          position: 'relative',
          zIndex: 10,
          animation: 'fadeUp 0.5s ease forwards',
        }}
      >
        <style>{`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(16px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes spinSlow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .atla-input {
            width: 100%;
            background: rgba(10,24,38,0.8);
            border: 1px solid rgba(74,158,202,0.15);
            border-radius: 10px;
            padding: 12px 16px;
            color: #c8dde8;
            font-size: 14px;
            font-family: inherit;
            transition: border-color 0.2s, box-shadow 0.2s;
            box-sizing: border-box;
          }
          .atla-input::placeholder { color: rgba(74,158,202,0.25); }
          .atla-input:focus {
            outline: none;
            border-color: rgba(74,158,202,0.5);
            box-shadow: 0 0 0 3px rgba(74,158,202,0.08);
          }
          .atla-scrollbar::-webkit-scrollbar { height: 3px; }
          .atla-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .atla-scrollbar::-webkit-scrollbar-thumb { background: rgba(74,158,202,0.2); border-radius: 2px; }
        `}</style>

        {/* ── Logo & başlık ── */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          {/* Element döngüsü rozetleri */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 20 }}>
            {ELEMENTS.map((e, i) => (
              <button
                key={e.key}
                type="button"
                onClick={() => setActiveElement(i)}
                title={e.label}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  border: `1.5px solid ${activeElement === i ? e.color : 'rgba(74,158,202,0.1)'}`,
                  background: activeElement === i ? e.bg : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: activeElement === i ? `0 0 14px ${e.glow}` : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 8,
                }}
                aria-label={e.label}
              >
                <img
                  src={e.icon}
                  alt={e.label}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    opacity: activeElement === i ? 1 : 0.3,
                    transition: 'opacity 0.3s ease',
                    filter: activeElement === i ? 'none' : 'grayscale(1) brightness(1.5)',
                  }}
                />
              </button>
            ))}
          </div>

          <h1
            style={{
              fontFamily: "'Palatino Linotype', 'Palatino', 'Book Antiqua', serif",
              fontSize: 40,
              fontWeight: 700,
              lineHeight: 1.1,
              margin: 0,
              color: '#c8dde8',
              letterSpacing: '-0.5px',
            }}
          >
            Avatar
          </h1>
          <p
            style={{
              fontFamily: "'Palatino Linotype', 'Palatino', 'Book Antiqua', serif",
              fontSize: 13,
              color: el.color,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              marginTop: 4,
              marginBottom: 0,
              transition: 'color 1.2s ease',
            }}
          >
            The Last Airbender
          </p>

          {/* Ince ayraç */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, rgba(74,158,202,0.15))' }} />
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(74,158,202,0.3)',
              }}
            >
              {requireProfileCompletion ? 'Profilini Tamamla' : isLogin ? 'Yaptığım Şey Legal Değil' : 'Çokta Sikimde'}
            </span>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, rgba(74,158,202,0.15))' }} />
          </div>
        </div>

        {/* ── Kart ── */}
        <div
          style={{
            background: 'rgba(8,18,30,0.92)',
            border: '1px solid rgba(74,158,202,0.1)',
            borderRadius: 18,
            boxShadow: '0 12px 60px rgba(0,0,0,0.6)',
            padding: 32,
          }}
        >
          {/* Üst dekoratif çizgi */}
          <div
            style={{
              height: 2,
              borderRadius: 1,
              background: `linear-gradient(to right, transparent, ${el.color}60, transparent)`,
              marginBottom: 28,
              transition: 'background 1.2s ease',
            }}
          />

          {error && (
            <div
              style={{
                background: 'rgba(192,80,42,0.12)',
                border: '1px solid rgba(192,80,42,0.3)',
                color: '#e8907a',
                fontSize: 13,
                padding: '12px 16px',
                borderRadius: 10,
                marginBottom: 20,
                textAlign: 'center',
              }}
            >
              {error}
            </div>
          )}

          {requireProfileCompletion ? (
            <form onSubmit={handleProfileCompletion} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <UsernameField
                username={username}
                setUsername={setUsername}
                status={status}
              />
              <AvatarPicker />
              <SubmitButton isLoading={isLoading} disabled={isLoading || !usernameAvailable} elColor={el.color} elGlow={el.glow}>
                {isLoading ? 'Kaydediliyor...' : 'Devam Et →'}
              </SubmitButton>
            </form>
          ) : (
            <>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {!isLogin && (
                  <>
                    <UsernameField username={username} setUsername={setUsername} status={status} />
                    <AvatarPicker />
                  </>
                )}
                <FieldWrapper label="E-posta">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="atla-input"
                    placeholder="aang@avatarstate.com"
                  />
                </FieldWrapper>
                <FieldWrapper label="Şifre">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="atla-input"
                    placeholder="••••••••"
                  />
                </FieldWrapper>

                <SubmitButton
                  isLoading={isLoading}
                  disabled={isLoading || (!isLogin && !usernameAvailable)}
                  elColor={el.color}
                  elGlow={el.glow}
                  style={{ marginTop: 4 }}
                >
                  {isLoading ? 'İşleniyor...' : isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
                </SubmitButton>
              </form>

              {/* ── Ayraç ── */}
              <div style={{ position: 'relative', margin: '24px 0' }}>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: '100%', borderTop: '1px solid rgba(74,158,202,0.07)' }} />
                </div>
                <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                  <span
                    style={{
                      background: 'rgba(8,18,30,0.92)',
                      padding: '0 16px',
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      color: 'rgba(74,158,202,0.2)',
                    }}
                  >
                    veya
                  </span>
                </div>
              </div>

              {/* ── Google butonu ── */}
              <button
                onClick={handleGoogleSignIn}
                type="button"
                disabled={isLoading}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(74,158,202,0.1)',
                  color: 'rgba(200,221,232,0.6)',
                  fontWeight: 600,
                  padding: '12px 16px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  fontSize: 14,
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                  opacity: isLoading ? 0.4 : 1,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)';
                  (e.currentTarget as HTMLButtonElement).style.color = '#c8dde8';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'rgba(200,221,232,0.6)';
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                  <path fill="#4285F4" fillRule="evenodd" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" fillRule="evenodd" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" fillRule="evenodd" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" fillRule="evenodd" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google ile Giriş Yap
              </button>

              {/* ── Geçiş ── */}
              <div style={{ marginTop: 24, textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setSelectedAvatar(null);
                    setUsername('');
                    setUsernameAvailable(null);
                    setIsLogin(!isLogin);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'rgba(74,158,202,0.35)',
                    transition: 'color 0.2s',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(74,158,202,0.7)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(74,158,202,0.35)'; }}
                >
                  {isLogin ? 'Hesabın yok mu? Kayıt Ol' : 'Zaten hesabın var mı? Giriş Yap'}
                </button>
              </div>
            </>
          )}

          {/* Alt dekoratif çizgi */}
          <div
            style={{
              height: 1,
              borderRadius: 1,
              background: `linear-gradient(to right, transparent, ${el.color}30, transparent)`,
              marginTop: 28,
              transition: 'background 1.2s ease',
            }}
          />
        </div>

        {/* ── Alt not ── */}
        <p
          style={{
            textAlign: 'center',
            fontSize: 10,
            color: 'rgba(74,158,202,0.15)',
            marginTop: 20,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            fontWeight: 700,
          }}
        >
          Avatar: The Last Airbender Fan Site
        </p>
      </div>
    </div>
  );
}

/* ── Küçük yardımcı bileşenler ── */

function FieldWrapper({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label
        style={{
          display: 'block',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'rgba(74,158,202,0.4)',
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function UsernameField({
  username,
  setUsername,
  status,
}: {
  username: string;
  setUsername: (v: string) => void;
  status: { color: string; msg: string } | null;
}) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <label
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(74,158,202,0.4)',
          }}
        >
          Kullanıcı Adı
        </label>
        {status && (
          <span style={{ fontSize: 11, fontWeight: 600, color: status.color }}>{status.msg}</span>
        )}
      </div>
      <input
        type="text"
        required
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="atla-input"
        placeholder="sokka_boomerang"
      />
    </div>
  );
}

function SubmitButton({
  children,
  disabled,
  elColor,
  elGlow,
  style,
  ...props
}: {
  children: React.ReactNode;
  disabled?: boolean;
  isLoading?: boolean;
  elColor: string;
  elGlow: string;
  style?: React.CSSProperties;
  [key: string]: any;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      style={{
        width: '100%',
        background: `linear-gradient(135deg, ${elColor}22, ${elColor}14)`,
        border: `1px solid ${elColor}50`,
        color: elColor,
        fontWeight: 700,
        padding: '14px 16px',
        borderRadius: 10,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: 14,
        letterSpacing: '0.06em',
        transition: 'all 0.2s',
        fontFamily: 'inherit',
        opacity: disabled ? 0.4 : 1,
        boxShadow: disabled ? 'none' : `0 0 20px ${elGlow.replace('0.4', '0.12').replace('0.35', '0.10')}`,
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}