import { useState } from 'react';
import { useComments } from '../hooks/useComments';
import { useStore } from '../store/useStore';
import { Link } from 'react-router-dom';
import { Star, Trash2, Send, Edit3, X, Check, MessageSquare, Clock } from 'lucide-react';
import { formatSecondsAsTag, renderTextWithTimestamps } from '../lib/timestampTags';

// ── ATLA renkleri (form panel arkaplanı için) ──
const W_DEEP = 'var(--water-deep)';      // #0d1f3c — Baş Köy su tonu

// Yıldız üzerine gelince/seçilince gösterilen kısa geri bildirim metinleri
const RATING_LABELS = ['Zayıf', 'Vasat', 'İdare Eder', 'İyi', 'Efsanevi'];

interface EpisodeCommentsProps {
  episodeId: string;
  // Yorum içindeki "@12:53" gibi bir zaman damgasına tıklanınca çağrılır —
  // WatchPage bunu video oynatıcıyı o saniyeye sardırmak için kullanır.
  onSeek?: (seconds: number) => void;
  // "Şu anı ekle" butonu için oynatıcının o anki saniyesini okur.
  getCurrentTime?: () => number;
}

export default function EpisodeComments({ episodeId, onSeek, getCurrentTime }: EpisodeCommentsProps) {
  const { comments, loading, error, addComment, deleteComment, updateComment } = useComments(episodeId);
  const { user } = useStore();

  const [text, setText] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editRating, setEditRating] = useState(5);
  const [hoverEditRating, setHoverEditRating] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;
    try {
      setIsSubmitting(true);
      await addComment(text, rating);
      setText('');
      setRating(0);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Yorum eklenirken hata oluştu.';
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── "Şu Anı Ekle": video'nun o anki saniyesini "@mm:ss" olarak metne ekler ──
  const insertCurrentTimestamp = () => {
    if (!getCurrentTime) return;
    const tag = formatSecondsAsTag(getCurrentTime());
    setText((prev) => (prev.trim() ? `${prev.trim()} ${tag} ` : `${tag} `));
  };

  const insertCurrentTimestampInEdit = () => {
    if (!getCurrentTime) return;
    const tag = formatSecondsAsTag(getCurrentTime());
    setEditText((prev) => (prev.trim() ? `${prev.trim()} ${tag} ` : `${tag} `));
  };

  const handleUpdate = async (commentId: string) => {
    if (!editText.trim()) return;
    try {
      await updateComment(commentId, editText, editRating);
      setEditingId(null);
    } catch {
      alert("Güncelleme yapılamadı.");
    }
  };

  const formatDate = (timestamp: unknown): string => {
    type FirestoreTimestampLike = { toDate: () => Date };
    if (!timestamp) return 'Az önce';
    const date = (timestamp as FirestoreTimestampLike)?.toDate
      ? (timestamp as FirestoreTimestampLike).toDate()
      : new Date(timestamp as string | number | Date);
    if (isNaN(date.getTime())) return 'Az önce';
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  return (
      <div className="w-full max-w-5xl mx-auto py-8 px-4 sm:px-6">


      {/* ── Başlık ── */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(74,158,202,0.12)', border: '1px solid rgba(74,158,202,0.25)' }}>
            <MessageSquare size={16} className="element-water" />
          </div>
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white leading-none">
              Bölüm Yorumları
            </h2>
          </div>
        </div>
        {comments.length > 0 && (
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1">
            <span className="text-xs font-semibold text-white/60">{comments.length} not</span>
          </div>
        )}
      </div>

      {/* ── Yorum Formu (Baş Köy — su temalı panel) ── */}
      <div className="border border-[var(--border-soft)] rounded-3xl p-6 mb-8 shadow-2xl relative overflow-hidden" style={{ background: W_DEEP }}>

        {/* ince mavi üst çizgi (su tapınağı mum ışığı) */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--border-glow)] to-transparent" />


        {user ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              {user.photoURL && user.photoURL.startsWith('/profilePics/') ? (
                <img src={user.photoURL} alt="Profil"
                  className="w-11 h-11 rounded-xl object-cover border border-white/10 shrink-0" />
              ) : (
                <div className="w-11 h-11 rounded-xl bg-white/5 text-white flex items-center justify-center font-bold border border-white/10 shrink-0 text-sm">
                  {user.email?.[0].toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-1.5">
                  Puanınız <span className="normal-case font-normal text-white/25">(isteğe bağlı)</span>
                </p>
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button"
                        onClick={() => setRating(rating === star ? 0 : star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="focus:outline-none transition-transform hover:scale-125">
                        <Star size={19}
                          className={`transition-colors ${
                            (hoverRating || rating) >= star
                              ? 'fill-amber text-amber'
                              : 'fill-transparent text-white/20'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {(hoverRating || rating) > 0 && (
                    <span className="text-xs font-semibold text-amber/80 font-serif italic">
                      {RATING_LABELS[(hoverRating || rating) - 1]}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Bu bölüm hakkında ne düşünüyorsunuz?"
                maxLength={800}
                className="w-full border border-white/[0.08] text-white rounded-xl p-4 min-h-[100px] focus:outline-none focus:border-[var(--border-glow)] focus:ring-1 focus:ring-[var(--water-light)] transition-colors resize-none text-sm placeholder-white/20"
                required
              />
              <div className="flex items-center justify-between gap-3 mt-3">
                {getCurrentTime ? (
                  <button
                    type="button"
                    onClick={insertCurrentTimestamp}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all active:scale-95 shrink-0"
                    style={{ background: 'rgba(74,158,202,0.1)', color: 'var(--water-light)', border: '1px solid rgba(74,158,202,0.3)' }}
                    title="Videonun şu anki dakikasını yoruma ekle"
                  >
                    <Clock size={13} /> <span className="hidden sm:inline">Şu Anı Ekle</span>
                  </button>
                ) : <span />}

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-white/20 tabular-nums hidden sm:inline">{text.length}/800</span>
                  <button
                    type="submit"
                    disabled={isSubmitting || !text.trim()}
                    className="element-fire-bg hover:element-fire-bg/80 disabled:opacity-30 disabled:grayscale text-white py-2.5 px-5 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-lg active:scale-95">
                    {isSubmitting ? 'Gönderiliyor...' : 'Gönder'}
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="py-8 flex flex-col items-center justify-center text-center gap-3">
            <p className="text-white/30 text-sm">Yorum yazmak ve puan vermek için masaya oturmanız gerekiyor.</p>
            <Link to="/auth"
              className="text-xs font-bold uppercase tracking-widest element-earth hover:text-amber border border-amber/30 bg-amber/10 px-4 py-2 rounded-lg transition-colors">
              Giriş Yap
            </Link>
          </div>
        )}
      </div>

      {/* ── Yorum Listesi ── */}
      <div className="flex flex-col gap-3">
        {error && (
          <div
            className="flex items-start gap-3 rounded-2xl p-4 text-sm"
            style={{ background: 'rgba(196,90,58,0.1)', border: '1px solid rgba(196,90,58,0.35)', color: 'var(--parchment)' }}
          >
            <span className="element-fire font-bold shrink-0">!</span>
            <div>
              <p className="font-semibold mb-0.5">Yorumlar yüklenemedi.</p>
              <p className="text-xs opacity-70 break-words">{error}</p>
            </div>
          </div>
        )}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 element-water border-t-transparent rounded-full animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-white/[0.07] rounded-2xl">
            <MessageSquare size={28} className="text-white/10 mx-auto mb-3" />
            <p className="text-white/20 font-serif italic text-base">Bu bölüme henüz kimse not bırakmamış.</p>
            <p className="text-white/10 text-sm mt-1">İlk yazan sen ol.</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="group relative rounded-3xl p-5 sm:p-6 transition-all border"
              style={{
                background: 'linear-gradient(155deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))',
                borderColor: 'rgba(255,255,255,0.08)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-glow)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            >
              {/* köşedeki ince alıntı işareti — parşömen/tapınak hissi */}
              <span
                className="absolute top-4 right-5 font-serif text-4xl leading-none select-none pointer-events-none"
                style={{ color: 'rgba(232,213,163,0.06)' }}
              >
                "
              </span>

              <div className="flex gap-4 items-start relative">
                {/* Avatar */}
                <Link to={`/profile/${comment.userName}`} className="shrink-0 mt-0.5">
                  {comment.userPhoto && comment.userPhoto.startsWith('/profilePics/') ? (
                    <img
                      src={comment.userPhoto}
                      alt={comment.userName || 'Kullanıcı'}
                      className="w-10 h-10 rounded-xl object-cover border border-white/[0.08] hover:border-[var(--border-glow)] transition-colors"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center text-white/40 border border-white/[0.06] hover:border-[var(--border-glow)] transition-colors font-bold uppercase text-sm">
                      {comment.userName ? comment.userName[0] : '?'}
                    </div>
                  )}
                </Link>

                {/* İçerik */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2.5 gap-3 flex-wrap">
                    <div className="flex items-center gap-2.5">
                      <Link
                        to={`/profile/${comment.userName}`}
                        className="text-sm font-bold text-white hover:text-amber transition-colors tracking-wide"
                      >
                        {comment.userName}
                      </Link>
                      <span className="text-white/20 text-xs">·</span>
                      <span className="text-white/25 text-xs">{formatDate(comment.createdAt)}</span>
                    </div>

                    {/* Yıldızlar — düzenlenirken her zaman, aksi halde sadece puan verilmişse */}
                    {(editingId === comment.id || Number(comment.rating) > 0) && (
                      <div className="flex items-center gap-0.5 shrink-0 rounded-full px-2 py-1" style={{ background: editingId === comment.id ? 'transparent' : 'rgba(196,129,58,0.08)' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            disabled={editingId !== comment.id}
                            onClick={() => setEditRating(star)}
                            onMouseEnter={() => editingId === comment.id && setHoverEditRating(star)}
                            onMouseLeave={() => editingId === comment.id && setHoverEditRating(0)}
                            className={
                              editingId === comment.id
                                ? 'cursor-pointer hover:scale-125 transition-transform'
                                : 'cursor-default'
                            }
                          >
                            <Star
                              size={13}
                              className={`transition-colors ${
                                (editingId === comment.id
                                  ? (hoverEditRating || editRating)
                                  : Number(comment.rating) || 0) >= star
                                  ? 'fill-amber text-amber'
                                  : 'fill-transparent text-white/10'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {editingId === comment.id ? (
                    <div>
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full border border-white/10 text-white rounded-lg p-3 text-sm focus:outline-none focus:border-[var(--border-glow)] min-h-[80px] resize-none"
                        autoFocus
                      />
                      <div className="flex items-center justify-between gap-2 mt-2">
                        {getCurrentTime && (
                          <button
                            type="button"
                            onClick={insertCurrentTimestampInEdit}
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all active:scale-95"
                            style={{ background: 'rgba(74,158,202,0.1)', color: 'var(--water-light)', border: '1px solid rgba(74,158,202,0.3)' }}
                            title="Videonun şu anki dakikasını yoruma ekle"
                          >
                            <Clock size={13} /> Şu Anı Ekle
                          </button>
                        )}
                        <div className="flex gap-2 ml-auto">
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-2 text-white/30 hover:text-white transition-colors"
                          >
                            <X size={15} />
                          </button>
                          <button
                            onClick={() => handleUpdate(comment.id)}
                            className="p-2 element-fire-bg hover:element-fire-bg/80 text-white rounded-lg transition-colors"
                          >
                            <Check size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-white/60 leading-relaxed text-sm whitespace-pre-wrap break-words">
                      {renderTextWithTimestamps(comment.text, onSeek)}
                    </p>
                  )}
                </div>
              </div>

              {/* Düzenle / Sil (sadece sahip) */}
              {user && user.uid === comment.userId && editingId !== comment.id && (
                <div className="absolute bottom-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={() => {
                      setEditingId(comment.id);
                      setEditText(comment.text);
                      setEditRating(comment.rating);
                    }}
                    className="p-2 text-white/20 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                    title="Düzenle"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          'Bu yorumunuzu silmek istediğinize emin misiniz?'
                        )
                      ) {
                        deleteComment(comment.id);
                      }
                    }}
                    className="p-2 text-white/20 hover:text-amber hover:bg-amber/10 rounded-lg transition-all"
                    title="Yorumu Sil"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}