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

  // Google popup açıkken onAuthStateChanged erken navigate etmesin
  const googleFlowActive = useRef(false);

  const navigate = useNavigate();
  const { user } = useStore();

  // Sayfa ilk yüklendiğinde zaten giriş yapmış kullanıcıyı yönlendir
  // Google flow sırasında bu çalışmasın — her flow kendi navigate'ini yapıyor
  useEffect(() => {
    if (!user || googleFlowActive.current) return;
    getDoc(doc(db, 'users', user.uid)).then((snap) => {
      if (snap.exists() && snap.data()?.username) navigate('/');
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Nick uygunluk kontrolü — 500ms debounce
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
        if (!username || username.trim().length < 3) throw new Error("Kullanıcı adı en az 3 karakter olmalı.");
        if (!usernameAvailable) throw new Error("Bu kullanıcı adı başkası tarafından alınmış!");
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
    googleFlowActive.current = true; // useEffect navigate etmesin
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
      if (!username || username.trim().length < 3) throw new Error("Kullanıcı adı en az 3 karakter olmalı.");
      if (!usernameAvailable) throw new Error("Bu kullanıcı adı başkası tarafından alınmış!");
      const photoPath = selectedAvatar ? `/profilePics/${selectedAvatar}` : null;
      await completeUserProfile(tempGoogleUser, username, photoPath);
      navigate('/');
    } catch (err: any) {
      setError(err.message || "Profil güncellenemedi.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAvatar = (av: string) => setSelectedAvatar(prev => prev === av ? null : av);

  const getUsernameStatus = () => {
    if (!username || username.trim().length < 3) return null;
    if (checkingUsername) return { color: 'text-gray-400', msg: 'Kontrol ediliyor...' };
    if (usernameAvailable === true) return { color: 'text-green-400', msg: '✓ Kullanılabilir' };
    if (usernameAvailable === false) return { color: 'text-red-400', msg: '✗ Bu nick alınmış' };
    return null;
  };
  const status = getUsernameStatus();

  const AvatarPicker = () => (
    <div>
      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">
        Profil Fotoğrafı <span className="text-gray-600 normal-case tracking-normal font-normal">(isteğe bağlı)</span>
      </label>
      <p className="text-[11px] text-gray-600 ml-1 mb-2">Sonradan profil ayarlarından değiştirebilirsin.</p>
      <div className="flex gap-3 overflow-x-auto pb-4 pt-1 snap-x custom-scrollbar">
        {AVATARS.map((av) => (
          <button key={av} type="button" onClick={() => toggleAvatar(av)}
            className={`relative shrink-0 snap-center rounded-full overflow-hidden w-16 h-16 border-2 transition-all ${selectedAvatar === av
                ? 'border-red-500 scale-110 shadow-lg shadow-red-900/30'
                : 'border-transparent hover:border-white/30 filter grayscale hover:grayscale-0'
              }`}>
            <img src={`/profilePics/${av}`} alt="Avatar" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#050505] text-white relative px-4 py-8 overflow-y-auto font-sans">
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 right-0 w-3/4 h-full bg-[radial-gradient(ellipse_at_top_right,_rgba(153,27,27,0.25)_0%,_transparent_70%)]" />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black via-black/80 to-transparent" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="w-full max-w-md z-10 bg-[#111]/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-8 sm:p-10 animate-fade-in-up my-auto">
        <div className="text-center mb-8">
          <h1 className="font-serif text-5xl font-bold text-white mb-2 tracking-tight drop-shadow-md">
            Sopranos<span className="text-red-600">.</span>
          </h1>
          <p className="text-gray-400 text-sm font-medium tracking-wide">
            {requireProfileCompletion ? "Hoş Geldin. Profilini Tamamla."
              : (isLogin ? "Ailene Hoş Geldin" : "Eski Kurallara Yeni Kan")}
          </p>
        </div>

        {error && (
          <div className="bg-red-900/40 border border-red-500/50 text-red-200 text-sm p-4 rounded-xl mb-6 text-center font-medium">
            {error}
          </div>
        )}

        {requireProfileCompletion ? (
          <form onSubmit={handleProfileCompletion} className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Kullanıcı Adı (Zorunlu)
                </label>
                {status && <span className={`text-[11px] font-semibold ${status.color}`}>{status.msg}</span>}
              </div>
              <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-medium text-sm"
                placeholder="pauliewalnuts" />
            </div>
            <AvatarPicker />
            <button type="submit" disabled={isLoading || !usernameAvailable}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-xl active:scale-[0.98] disabled:opacity-50">
              {isLoading ? 'Kaydediliyor...' : 'Devam Et'}
            </button>
          </form>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Kullanıcı Adı</label>
                      {status && <span className={`text-[11px] font-semibold ${status.color}`}>{status.msg}</span>}
                    </div>
                    <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-medium text-sm"
                      placeholder="pauliewalnuts" />
                  </div>
                  <AvatarPicker />
                </>
              )}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">E-posta</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-medium text-sm"
                  placeholder="isim@ornek.com" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Şifre</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-medium text-sm"
                  placeholder="••••••••" />
              </div>
              <button type="submit" disabled={isLoading || (!isLogin && !usernameAvailable)}
                className="w-full bg-white text-black hover:bg-gray-200 font-bold py-3.5 rounded-xl transition-all shadow-xl active:scale-[0.98] disabled:opacity-50">
                {isLoading ? 'İşleniyor...' : (isLogin ? 'Giriş Yap' : 'Kayıt Ol')}
              </button>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
                <div className="relative flex justify-center text-xs font-semibold uppercase tracking-widest">
                  <span className="bg-[#111] px-4 text-gray-500">veya</span>
                </div>
              </div>
              <button onClick={handleGoogleSignIn} type="button" disabled={isLoading}
                className="mt-6 w-full bg-[#151515] hover:bg-[#222] border border-white/10 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-3 text-sm disabled:opacity-50">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" fillRule="evenodd" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" fillRule="evenodd" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" fillRule="evenodd" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" fillRule="evenodd" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google ile Giriş Yap
              </button>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => { setError(''); setSelectedAvatar(null); setUsername(''); setUsernameAvailable(null); setIsLogin(!isLogin); }}
                className="text-xs font-semibold text-gray-400 hover:text-white transition-colors uppercase tracking-wide">
                {isLogin ? "Hesabın yok mu? Kayıt Ol" : "Zaten hesabın var mı? Giriş Yap"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}