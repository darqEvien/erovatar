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
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--night)' }}>
      <div className="w-8 h-8 border-2 element-water border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (profileNotFound) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4" style={{ background: 'var(--night)' }}>
      <User size={48} style={{ color: 'var(--stone)', opacity: 0.5 }} className="mb-4" />
      <h2 className="avatar-title text-2xl font-bold mb-2" style={{ color: 'var(--parchment)' }}>Kullanıcı Bulunamadı</h2>
      <p className="mb-6" style={{ color: 'var(--stone)' }}><span style={{ color: 'var(--parchment)' }}>@{paramUsername}</span> adlı kullanıcı mevcut değil.</p>
      <button
        onClick={() => navigate('/')}
        className="avatar-title px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all"
        style={{ background: 'rgba(74,158,202,0.08)', color: 'var(--parchment)', border: '1px solid var(--border-soft)' }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-glow)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-soft)')}
      >
        Ana Sayfaya Dön
      </button>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen w-full font-sans relative pt-24 pb-16 px-4" style={{ background: 'var(--night)', color: 'var(--parchment)' }}>
      <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
      {/* Su elementi ışıltısı — HomePage/WatchPage ile aynı atmosfer */}
      <div className="absolute top-0 right-0 w-2/3 h-[60vh] pointer-events-none" style={{ background: 'radial-gradient(ellipse at top right, rgba(74,158,202,0.12) 0%, transparent 60%)' }} />

      <div className="max-w-2xl mx-auto relative z-10">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-8 transition-colors group avatar-title text-xs font-bold uppercase tracking-widest"
          style={{ color: 'var(--stone)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--parchment)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--stone)')}
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Geri
        </button>

        {/* ── Profil Kartı ── */}
        <div className="rounded-3xl shadow-2xl overflow-hidden" style={{ background: 'var(--water-mid)', border: '1px solid var(--border-soft)' }}>

          <div className="h-20 relative overflow-hidden">
            {/* Üç element (su/toprak/ateş) — kişisel profil tek bir kitaba ait olmadığı için hepsini temsil eder */}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, var(--element-water) 0%, var(--element-earth) 50%, var(--element-fire) 100%)', opacity: 0.22 }} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent, var(--water-mid))' }} />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />
          </div>

          <div className="px-6 sm:px-10 pb-6 -mt-10 flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
            <div className="relative shrink-0">
              {hasValidPhoto ? (
                <img src={displayPhoto!} alt={displayName}
                  className="w-20 h-20 rounded-2xl object-cover shadow-2xl"
                  style={{ border: '4px solid var(--water-mid)' }} />
              ) : (
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl"
                  style={{ background: 'var(--water-deep)', border: '4px solid var(--water-mid)' }}>
                  <User size={32} style={{ color: 'var(--stone)' }} />
                </div>
              )}
              {viewingOwnProfile && selectedAvatar && `/profilePics/${selectedAvatar}` !== displayPhoto && (
                <div className="absolute -bottom-1 -right-1">
                  <img src={`/profilePics/${selectedAvatar}`} alt="Yeni"
                    className="w-8 h-8 rounded-full object-cover"
                    style={{ border: '2px solid var(--element-water)' }} />
                </div>
              )}
            </div>

            <div className="flex-1 pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="avatar-title text-2xl sm:text-3xl font-bold tracking-wide" style={{ color: 'var(--parchment)' }}>{displayName}</h1>
                {viewingOwnProfile && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber border border-amber/30 bg-amber/10 px-2 py-0.5 rounded-full">Sen</span>
                )}
              </div>
              <p className="text-xs mt-1.5 flex items-center gap-1.5" style={{ color: 'var(--stone)' }}>
                <MessageSquare size={11} />
                {commentsLoading ? '...' : `${comments.length} yorum`}
              </p>
            </div>
          </div>

          {/* Sekmeler */}
          <div className="flex" style={{ borderTop: '1px solid var(--border-soft)' }}>
            <button
              onClick={() => setActiveTab('comments')}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-all border-b-2"
              style={{
                color: activeTab === 'comments' ? 'var(--parchment)' : 'var(--stone)',
                borderColor: activeTab === 'comments' ? 'var(--amber)' : 'transparent',
              }}
            >
              <MessageSquare size={15} /> Yorumlar
            </button>
            {viewingOwnProfile && (
              <button
                onClick={() => setActiveTab('settings')}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-all border-b-2"
                style={{
                  color: activeTab === 'settings' ? 'var(--parchment)' : 'var(--stone)',
                  borderColor: activeTab === 'settings' ? 'var(--amber)' : 'transparent',
                }}
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
              <div className="rounded-2xl p-12 text-center" style={{ background: 'var(--water-mid)', border: '1px solid var(--border-soft)' }}>
                <MessageSquare size={32} className="mx-auto mb-3" style={{ color: 'var(--stone)', opacity: 0.5 }} />
                <p className="font-medium" style={{ color: 'var(--stone)' }}>
                  {viewingOwnProfile ? 'Henüz yorum yapmadınız.' : 'Henüz yorum yapılmamış.'}
                </p>
                {viewingOwnProfile && <p className="text-sm mt-1" style={{ color: 'var(--stone)', opacity: 0.6 }}>Bir bölüm izle ve düşüncelerini paylaş!</p>}
              </div>
            ) : (
              comments.map((c) => {
                const parsed = parseEpisodeId(c.episodeId);
                const ep = parsed ? getEpisode(parsed.season, parsed.episode) : null;
                return (
                  <div key={c.id} className="group relative rounded-2xl p-5 transition-all avatar-card">
                    {parsed && (
                      <Link to={`/watch/${parsed.season}/${parsed.episode}`} className="inline-flex mb-3">
                        <div
                          className="flex items-center gap-2 rounded-lg px-3 py-1.5 transition-all"
                          style={{ background: 'rgba(74,158,202,0.06)', border: '1px solid var(--border-soft)' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(74,158,202,0.12)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(74,158,202,0.06)')}
                        >
                          <Tv size={12} className="element-water shrink-0" />
                          <span className="text-xs font-medium" style={{ color: 'var(--parchment)' }}>
                            Sezon {parsed.season} · Bölüm {parsed.episode} {ep ? `- ${ep.title}` : ''}
                          </span>
                          <ChevronRight size={11} className="transition-colors" style={{ color: 'var(--stone)' }} />
                        </div>
                      </Link>
                    )}
                    {!parsed && c.episodeId && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-2 rounded-lg px-3 py-1.5" style={{ background: 'rgba(74,158,202,0.06)', border: '1px solid var(--border-soft)' }}>
                          <Tv size={12} className="element-water shrink-0" />
                          <span className="text-xs font-medium" style={{ color: 'var(--stone)' }}>{c.episodeId}</span>
                        </div>
                      </div>
                    )}
                    {viewingOwnProfile && editingId !== c.id && (
                      <div className="flex gap-2 absolute top-5 right-5">
                        <button
                          onClick={() => { setEditingId(c.id); setEditText(c.text); setEditRating(c.rating || 5); }}
                          className="p-2 transition-colors"
                          style={{ color: 'var(--stone)' }}
                          onMouseEnter={e => (e.currentTarget.style.color = 'var(--parchment)')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'var(--stone)')}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button onClick={() => handleDeleteComment(c.id)} className="p-2 text-amber transition-colors" style={{ opacity: 0.7 }}
                          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                          onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}

                    {editingId === c.id ? (
                      <div className="mt-2">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full text-white rounded-lg p-3 text-sm focus:outline-none focus:border-[var(--border-glow)] min-h-[80px] resize-none"
                          style={{ background: 'var(--water-deep)', border: '1px solid var(--border-soft)' }}
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
                          <button onClick={() => setEditingId(null)} className="p-2 transition-colors" style={{ color: 'var(--stone)' }}
                            onMouseEnter={e => (e.currentTarget.style.color = 'var(--parchment)')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--stone)')}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                          </button>
                          <button onClick={() => handleUpdateComment(c.id)} className="p-2 element-fire-bg text-white rounded-md transition-opacity hover:opacity-80">
                            <Check size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--parchment)', opacity: 0.85 }}>{c.text}</p>
                        <p className="text-xs mt-3" style={{ color: 'var(--stone)', opacity: 0.6 }}>{formatDate(c.createdAt)}</p>
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
          <div className="mt-4 p-6 sm:p-10 rounded-3xl shadow-2xl" style={{ background: 'var(--water-mid)', border: '1px solid var(--border-soft)' }}>
            {error && (
              <div className="text-sm p-4 rounded-xl mb-6" style={{ background: 'rgba(196,90,58,0.12)', border: '1px solid rgba(196,90,58,0.4)', color: 'var(--parchment)' }}>
                {error}
              </div>
            )}
            {success && (
              <div className="text-sm p-4 rounded-xl mb-6 flex items-center gap-2" style={{ background: 'rgba(74,158,202,0.1)', border: '1px solid rgba(74,158,202,0.35)', color: 'var(--parchment)' }}>
                <CheckCircle size={16} style={{ color: 'var(--water-light)' }} /> {success}
              </div>
            )}
            <form onSubmit={handleUpdateProfile} className="space-y-8">

              {/* Nick */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="avatar-title block text-[10px] font-bold uppercase tracking-widest ml-1" style={{ color: 'var(--stone)' }}>Kullanıcı Adı</label>
                  {nickStatus && <span className={`text-[11px] font-semibold ${nickStatus.color}`}>{nickStatus.msg}</span>}
                </div>
                <input
                  type="text"
                  required
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--border-glow)] focus:ring-1 focus:ring-[var(--water-light)] transition-all font-medium"
                  style={{ background: 'var(--water-deep)', border: '1px solid var(--border-soft)' }}
                />
              </div>

              {/* Avatar */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="avatar-title block text-[10px] font-bold uppercase tracking-widest ml-1" style={{ color: 'var(--stone)' }}>Karakter Seç</label>
                  {selectedAvatar && (
                    <button type="button" onClick={() => setSelectedAvatar(null)}
                      className="text-[10px] text-amber uppercase tracking-widest transition-colors hover:opacity-75">
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
                        className="group relative aspect-square rounded-2xl overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--water-light)]">
                        <ImageWithOverlay 
                          src={`/profilePics/${av}`} 
                          alt={characterName}
                          overlayTexts={[characterName]}
                          className={`w-full h-full object-cover transition-all duration-300 ${isSelected ? 'scale-105 brightness-100' : 'brightness-50 grayscale group-hover:brightness-90 group-hover:grayscale-0 group-hover:scale-105'}`} />
                        <div
                          className="absolute inset-0 rounded-2xl border-2 transition-all duration-200"
                          style={{ borderColor: isSelected ? 'var(--water-light)' : 'transparent' }}
                        />
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center shadow-lg" style={{ background: 'var(--water-light)' }}>
                            <Check size={11} style={{ color: 'var(--night)' }} strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                {selectedAvatar && (
                  <p className="text-xs mt-3 ml-1" style={{ color: 'var(--stone)' }}>
                    Seçilen: <span className="font-medium" style={{ color: 'var(--parchment)' }}>
                      {selectedAvatar.replace(/\.[^.]+$/, '').replace(/_/g, ' ').replace(/%2C/g, ',')}
                    </span>
                  </p>
                )}
              </div>

              <button type="submit" disabled={loading || (formUsername !== user?.displayName && !usernameAvailable)}
                className="avatar-title w-full active:scale-[0.98] font-bold uppercase tracking-wider text-sm py-4 rounded-xl transition-all shadow-xl disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'var(--water-light)', color: 'var(--night)' }}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-[var(--night)]/30 border-t-[var(--night)] rounded-full animate-spin" />
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
                className="avatar-title w-full font-bold uppercase tracking-wider text-xs py-3 rounded-xl transition-all active:scale-[0.98] hover:opacity-80"
                style={{ background: 'rgba(196,90,58,0.1)', color: 'var(--parchment)', border: '1px solid rgba(196,90,58,0.3)' }}
              >
                İlerlemeyi Sıfırla
              </button>
              <p className="text-xs mt-2 ml-1" style={{ color: 'var(--stone)', opacity: 0.6 }}>Bu buton sadece izleme ilerlemesini sıfırlar. Yorumlarını silmez.</p>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}