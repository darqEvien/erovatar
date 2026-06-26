import { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc, collection, query, limit, onSnapshot, getDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { useStore } from '../store/useStore';
import { checkUsernameAvailable, releaseOldUsername } from '../lib/userUtils';
import { AVATARS } from '../data/avatars';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Check, User, MessageSquare, Tv, ChevronRight, Settings, Star, Trash2 } from 'lucide-react';
import { getEpisode } from '../data/episodes';
import ImageWithOverlay from '../components/ImageWithOverlay';

// ─── Tipler ───────────────────────────────────────────────────────────────────
interface Comment {
  id: string;
  text: string;
  episodeId: string;
  userId: string;
  userName: string | null;
  userPhoto: string | null;
  rating: number;
  createdAt: string;
}

interface PublicProfile {
  uid: string;
  username: string;
  photoURL: string | null;
}

function parseEpisodeId(episodeId: string): { season: number; episode: number } | null {
  const match = episodeId.match(/S(\d+)E(\d+)/i);
  if (!match) return null;
  return { season: parseInt(match[1]), episode: parseInt(match[2]) };
}

function formatCharacterName(filename: string): string {
  return filename
    .replace(/\.[^.]+$/, '') // Remove extension
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/%2C/g, ',') // Handle encoded commas
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
}

// ══════════════════════════════════════════════════════════════════════════════
export default function ProfilePage() {
  const { user, setUser } = useStore();
  const navigate = useNavigate();
  const { username: paramUsername } = useParams<{ username?: string }>();

  const viewingOwnProfile = !paramUsername || paramUsername === user?.displayName;

  // ── State ──────────────────────────────────────────────────────────────────
  const [targetUid, setTargetUid] = useState<string>('');
  const [publicProfile, setPublicProfile] = useState<PublicProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileNotFound, setProfileNotFound] = useState(false);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  const [formUsername, setFormUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'comments' | 'settings'>('comments');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editRating, setEditRating] = useState(5);
  const [hoverEditRating, setHoverEditRating] = useState(0);

  // ── Kendi profil init ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!user && !paramUsername) { navigate('/auth'); return; }
    if (viewingOwnProfile && user) {
      setFormUsername(user.displayName || '');
      setTargetUid(user.uid);
      if (user.photoURL?.includes('/profilePics/')) {
        const parts = user.photoURL.split('/');
        setSelectedAvatar(parts[parts.length - 1]);
      } else {
        setSelectedAvatar(null);
      }
    }
  }, [user, navigate, viewingOwnProfile, paramUsername]);

  // ── Nick değişince uygunluk kontrolü (debounce) ────────────────────────────
  useEffect(() => {
    if (!formUsername || formUsername.trim().length < 3 || formUsername === user?.displayName) {
      setUsernameAvailable(null);
      return;
    }
    setCheckingUsername(true);
    const timer = setTimeout(async () => {
      const available = await checkUsernameAvailable(formUsername, user?.uid);
      setUsernameAvailable(available);
      setCheckingUsername(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [formUsername, user]);

  // ── Başka kullanıcı lookup ─────────────────────────────────────────────────
  useEffect(() => {
    if (viewingOwnProfile || !paramUsername) return;
    const lookupUser = async () => {
      setProfileLoading(true);
      setProfileNotFound(false);
      try {
        const usernameSnap = await getDoc(doc(db, 'usernames', paramUsername.toLowerCase()));
        if (!usernameSnap.exists()) { setProfileNotFound(true); return; }

        const uid = usernameSnap.data().uid as string;
        setTargetUid(uid);

        const userSnap = await getDoc(doc(db, 'users', uid));
        if (userSnap.exists()) {
          const d = userSnap.data();
          setPublicProfile({
            uid,
            username: d.username || paramUsername,
            photoURL: d.photoURL || null,
          });
        }
      } catch (e) {
        console.error(e);
        setProfileNotFound(true);
      } finally {
        setProfileLoading(false);
      }
    };
    lookupUser();
  }, [paramUsername, viewingOwnProfile]);

  // ── Yorumları çek ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!targetUid) return;
    const q = query(
      collection(db, 'users', targetUid, 'comments'),
      limit(50)
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      let fetched = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now())
        } as unknown as Comment;
      });
      fetched.sort((a, b) => {
        const tA = (a.createdAt as any) instanceof Date ? (a.createdAt as any).getTime() : new Date(a.createdAt).getTime();
        const tB = (b.createdAt as any) instanceof Date ? (b.createdAt as any).getTime() : new Date(b.createdAt).getTime();
        return tB - tA;
      });
      setComments(fetched);
      setCommentsLoading(false);
    }, (e) => {
      console.error('Comments error:', e);
      setCommentsLoading(false);
    });
    return unsubscribe;
  }, [targetUid]);

  // ── Profil güncelle ────────────────────────────────────────────────────────
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      if (!user) throw new Error("Kullanıcı bulunamadı.");
      if (!formUsername || formUsername.trim().length < 3) throw new Error("Kullanıcı adı en az 3 karakter olmalı.");

      const cleanUsername = formUsername.trim();
      const needsUsernameUpdate = cleanUsername !== user.displayName;

      if (needsUsernameUpdate) {
        if (!usernameAvailable) throw new Error("Bu kullanıcı adı başkası tarafından alınmış!");
      }

      const photoPath = selectedAvatar ? `/profilePics/${selectedAvatar}` : null;

      await updateProfile(user, {
        displayName: cleanUsername,
        photoURL: photoPath,
      });

      await auth.currentUser?.reload();
      if (auth.currentUser) setUser({ ...auth.currentUser } as typeof auth.currentUser);

      if (needsUsernameUpdate) {
        // Eski nick'i serbest bırak
        if (user.displayName) await releaseOldUsername(user.displayName);

        // Yeni nick'i kaydet
        await setDoc(doc(db, 'usernames', cleanUsername.toLowerCase()), {
          uid: user.uid, original: cleanUsername, updatedAt: new Date().toISOString()
        });
        await setDoc(doc(db, 'users', user.uid), {
          username: cleanUsername, photoURL: photoPath,
        }, { merge: true });
      } else {
        await setDoc(doc(db, 'users', user.uid), { photoURL: photoPath }, { merge: true });
      }

      setSuccess("Profil başarıyla güncellendi.");
      if (needsUsernameUpdate) navigate(`/profile/${cleanUsername}`, { replace: true });
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') setError("Güncelleme için yeniden giriş yapmalısınız.");
      else setError(err.message || "Güncelleme sırasında hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const formatDate = (dateInput: any) => {
    if (!dateInput) return "Az önce";
    try {
      if (dateInput?.seconds) {
        return new Date(dateInput.seconds * 1000).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
      }
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) return "Tarih belirsiz";
      return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch { return "Tarih belirsiz"; }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("Bu yorumu silmek istediğine emin misin?")) return;
    try {
      await deleteDoc(doc(db, 'users', targetUid, 'comments', commentId));
    } catch { alert("Silme sırasında hata oluştu."); }
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editText.trim()) return;
    try {
      await setDoc(doc(db, 'users', targetUid, 'comments', commentId), { text: editText.trim(), rating: editRating }, { merge: true });
      setEditingId(null);
    } catch { alert("Güncelleme sırasında hata oluştu."); }
  };

  const displayName = viewingOwnProfile ? (user?.displayName || 'Kullanıcı') : (publicProfile?.username || paramUsername || '...');
  const displayPhoto = viewingOwnProfile ? user?.photoURL : publicProfile?.photoURL;
  const hasValidPhoto = !!displayPhoto && displayPhoto.startsWith('/profilePics/');

  const getUsernameStatus = () => {
    if (!formUsername || formUsername.trim().length < 3 || formUsername === user?.displayName) return null;
    if (checkingUsername) return { color: 'text-gray-400', msg: 'Kontrol ediliyor...' };
    if (usernameAvailable === true) return { color: 'text-green-400', msg: '✓ Kullanılabilir' };
    if (usernameAvailable === false) return { color: 'text-red-400', msg: '✗ Bu nick alınmış' };
    return null;
  };
  const nickStatus = getUsernameStatus();

  // ── Guard'lar ──────────────────────────────────────────────────────────────
  if (!user && !paramUsername) return null;

  if (profileLoading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-8 h-8 border-2 element-water border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (profileNotFound) return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-center px-4">
      <User size={48} className="text-gray-700 mb-4" />
      <h2 className="text-2xl font-serif font-bold text-white mb-2">Kullanıcı Bulunamadı</h2>
      <p className="text-gray-500 mb-6"><span className="text-gray-300">@{paramUsername}</span> adlı kullanıcı mevcut değil.</p>
      <button onClick={() => navigate('/')} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium transition-all">
        Ana Sayfaya Dön
      </button>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen w-full bg-[#050505] text-white pt-24 pb-16 px-4 font-sans relative">
      <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

      <div className="max-w-2xl mx-auto relative z-10">

        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Geri
        </button>

        {/* ── Profil Kartı ── */}
        <div className="bg-[#111] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">

          <div className="h-20 relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />
          </div>

          <div className="px-6 sm:px-10 pb-6 -mt-10 flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
            <div className="relative shrink-0">
              {hasValidPhoto ? (
                <img src={displayPhoto!} alt={displayName}
                  className="w-20 h-20 rounded-2xl object-cover border-4 border-[#111] shadow-2xl" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-white/5 border-4 border-[#111] flex items-center justify-center shadow-2xl">
                  <User size={32} className="text-gray-500" />
                </div>
              )}
              {viewingOwnProfile && selectedAvatar && `/profilePics/${selectedAvatar}` !== displayPhoto && (
                <div className="absolute -bottom-1 -right-1">
                  <img src={`/profilePics/${selectedAvatar}`} alt="Yeni"
                    className="w-8 h-8 rounded-full object-cover border-2 element-water" />
                </div>
              )}
            </div>

            <div className="flex-1 pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">{displayName}</h1>
                {viewingOwnProfile && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber border-amber/30 bg-amber/10 px-2 py-0.5 rounded-full">Sen</span>
                )}
              </div>
              <p className="text-gray-600 text-xs mt-1.5 flex items-center gap-1.5">
                <MessageSquare size={11} />
                {commentsLoading ? '...' : `${comments.length} yorum`}
              </p>
            </div>
          </div>

          {/* Sekmeler */}
          <div className="flex border-t border-white/10">
            <button
              onClick={() => setActiveTab('comments')}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-all border-b-2 ${activeTab === 'comments' ? 'text-white border-amber' : 'text-gray-500 hover:text-gray-300 border-transparent'}`}
            >
              <MessageSquare size={15} /> Yorumlar
            </button>
            {viewingOwnProfile && (
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-all border-b-2 ${activeTab === 'settings' ? 'text-white border-amber' : 'text-gray-500 hover:text-gray-300 border-transparent'}`}
              >
                <Settings size={15} /> Ayarlar
              </button>
            )}
          </div>
        </div>

        {/* ══ YORUMLAR ══════════════════════════════════════════════════════ */}
        {activeTab === 'comments' && (
          <div className="mt-4 space-y-3">
            {commentsLoading ? (
              <div className="flex justify-center py-16">
                <div className="w-7 h-7 border-2 element-water border-t-transparent rounded-full animate-spin" />
              </div>
            ) : comments.length === 0 ? (
              <div className="bg-[#111] border border-white/10 rounded-2xl p-12 text-center">
                <MessageSquare size={32} className="text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">
                  {viewingOwnProfile ? 'Henüz yorum yapmadınız.' : 'Henüz yorum yapılmamış.'}
                </p>
                {viewingOwnProfile && <p className="text-gray-600 text-sm mt-1">Bir bölüm izle ve düşüncelerini paylaş!</p>}
              </div>
            ) : (
              comments.map((c) => {
                const parsed = parseEpisodeId(c.episodeId);
                const ep = parsed ? getEpisode(parsed.season, parsed.episode) : null;
                return (
                  <div key={c.id} className="group relative bg-[#111] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
                    {parsed && (
                      <Link to={`/watch/${parsed.season}/${parsed.episode}`} className="inline-flex mb-3">
                        <div className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 transition-all">
                          <Tv size={12} className="element-water shrink-0" />
                          <span className="text-xs text-gray-300 font-medium">
                            Sezon {parsed.season} · Bölüm {parsed.episode} {ep ? `- ${ep.title}` : ''}
                          </span>
                          <ChevronRight size={11} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
                        </div>
                      </Link>
                    )}
                    {!parsed && c.episodeId && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                          <Tv size={12} className="element-water shrink-0" />
                          <span className="text-xs text-gray-400 font-medium">{c.episodeId}</span>
                        </div>
                      </div>
                    )}
                    {viewingOwnProfile && editingId !== c.id && (
                      <div className="flex gap-2 absolute top-5 right-5">
                        <button
                          onClick={() => { setEditingId(c.id); setEditText(c.text); setEditRating(c.rating || 5); }}
                          className="p-2 text-gray-500 hover:text-white transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button onClick={() => handleDeleteComment(c.id)} className="p-2 text-gray-500 hover:text-amber transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}

                    {editingId === c.id ? (
                      <div className="mt-2">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full bg-black border border-white/10 text-white rounded-lg p-3 text-sm focus:outline-none focus:border-[var(--border-glow)] min-h-[80px] resize-none"
                          autoFocus
                        />
                        <div className="flex items-center gap-1 mt-2 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} onClick={() => setEditRating(star)}
                              onMouseEnter={() => setHoverEditRating(star)}
                              onMouseLeave={() => setHoverEditRating(0)}
                              className="focus:outline-none hover:scale-125 transition-transform">
                              <Star size={16} className={`transition-colors ${(hoverEditRating || editRating) >= star ? 'fill-amber text-amber' : 'text-white/10 fill-white/5'}`} />
                            </button>
                          ))}
                        </div>
                        <div className="flex justify-end gap-2 mt-2">
                          <button onClick={() => setEditingId(null)} className="p-2 text-gray-400 hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                          </button>
                          <button onClick={() => handleUpdateComment(c.id)} className="p-2 element-fire-bg text-white rounded-md hover:element-fire-bg/80 transition-colors">
                            <Check size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{c.text}</p>
                        <p className="text-gray-600 text-xs mt-3">{formatDate(c.createdAt)}</p>
                        <div className="flex items-center gap-0.5 mt-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} size={14} className={(Number(c.rating) || 0) >= star ? 'fill-amber text-amber' : 'text-white/10 fill-white/5'} />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ══ AYARLAR ══════════════════════════════════════════════════════ */}
        {activeTab === 'settings' && viewingOwnProfile && (
          <div className="mt-4 bg-[#111] border border-white/10 p-6 sm:p-10 rounded-3xl shadow-2xl">
            {error && <div className="bg-red-900/40 border border-red-500/50 text-red-200 text-sm p-4 rounded-xl mb-6">{error}</div>}
            {success && (
              <div className="bg-green-900/40 border border-green-500/50 text-green-200 text-sm p-4 rounded-xl mb-6 flex items-center gap-2">
                <CheckCircle size={16} /> {success}
              </div>
            )}
            <form onSubmit={handleUpdateProfile} className="space-y-8">

              {/* Nick */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Kullanıcı Adı</label>
                  {nickStatus && <span className={`text-[11px] font-semibold ${nickStatus.color}`}>{nickStatus.msg}</span>}
                </div>
                <input
                  type="text"
                  required
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--border-glow)] focus:ring-1 focus:ring-[var(--water-light)] transition-all font-medium"
                />
              </div>

              {/* Avatar */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Karakter Seç</label>
                  {selectedAvatar && (
                    <button type="button" onClick={() => setSelectedAvatar(null)}
                      className="text-[10px] text-gray-500 hover:text-amber uppercase tracking-widest transition-colors">
                      Seçimi Kaldır
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 sm:gap-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                  {AVATARS.map((av) => {
                    const isSelected = selectedAvatar === av;
                    const characterName = formatCharacterName(av);
                    return (
                      <button key={av} type="button"
                        onClick={() => setSelectedAvatar(prev => prev === av ? null : av)}
                        className="group relative aspect-square rounded-2xl overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
                        <ImageWithOverlay 
                          src={`/profilePics/${av}`} 
                          alt={characterName}
                          overlayTexts={[characterName]}
                          className={`w-full h-full object-cover transition-all duration-300 ${isSelected ? 'scale-105 brightness-100' : 'brightness-50 grayscale group-hover:brightness-90 group-hover:grayscale-0 group-hover:scale-105'}`} />
                        <div className={`absolute inset-0 rounded-2xl border-2 transition-all duration-200 ${isSelected ? 'border-red-500' : 'border-transparent group-hover:border-white/30'}`} />
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                            <Check size={11} className="text-white" strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                {selectedAvatar && (
                  <p className="text-xs text-gray-500 mt-3 ml-1">
                    Seçilen: <span className="text-gray-300 font-medium">
                      {selectedAvatar.replace(/\.[^.]+$/, '').replace(/_/g, ' ').replace(/%2C/g, ',')}
                    </span>
                  </p>
                )}
              </div>

              <button type="submit" disabled={loading || (formUsername !== user?.displayName && !usernameAvailable)}
                className="w-full bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-bold py-4 rounded-xl transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Güncelleniyor...
                  </span>
                ) : 'Değişiklikleri Kaydet'}
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (!confirm('Tüm izleme ilerleyişiniz sıfırlansın mı?')) return;
                  try {
                    const progressCol = collection(db, 'users', user!.uid, 'progress');
                    const snap = await getDocs(progressCol);
                    await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
                    setSuccess('İlerleme başarıyla sıfırlandı!');
                  } catch { setError('Sıfırlama sırasında hata oluştu.'); }
                }}
                className="w-full bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold py-3 rounded-xl transition-all border border-gray-600/50 active:scale-[0.98]"
              >
                İlerlemeyi Sıfırla
              </button>
              <p className="text-xs text-gray-600 mt-2 ml-1">Bu buton sadece izleme ilerlemesini sıfırlar. Yorumlarını silmez.</p>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}