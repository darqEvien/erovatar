import { useState } from 'react';
import { useComments } from '../hooks/useComments';
import { useStore } from '../store/useStore';
import { Link } from 'react-router-dom';
import { Star, Trash2, Send, Edit3, X, Check, MessageSquare } from 'lucide-react';

// ── ATLA renkleri (form panel arkaplanı için) ──
const W_DEEP = 'var(--water-deep)';      // #0d1f3c — Baş Köy su tonu

export default function EpisodeComments({ episodeId }: { episodeId: string }) {
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
        <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Bölüm Yorumları
        </h2>
        {comments.length > 0 && (
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1">
            <MessageSquare size={12} className="element-water" />
                <span className="text-xs font-semibold text-white/60">{comments.length}</span>

          </div>
        )}
      </div>

      {/* ── Yorum Formu (Baş Köy — su temalı panel) ── */}
      <div className="border border-[var(--border-soft)] rounded-3xl p-6 mb-8 shadow-2xl relative overflow-hidden" style={{ background: W_DEEP }}>

        {/* ince mavi üst çizgi (su tapınağı mum ışığı) */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--border-glow)] to-transparent" />


        {user ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              {user.photoURL && user.photoURL.startsWith('/profilePics/') ? (
                <img src={user.photoURL} alt="Profil"
                  className="w-9 h-9 rounded-xl object-cover border border-white/10 shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-white/5 text-white flex items-center justify-center font-bold border border-white/10 shrink-0 text-sm">
                  {user.email?.[0].toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-1.5">Puanınız</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="focus:outline-none transition-transform hover:scale-110">
                      <Star size={18}
                        className={`transition-colors ${
                          (hoverRating || rating) >= star
                            ? 'fill-amber text-amber'
                            : 'fill-transparent text-white/20'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Bu bölüm hakkında ne düşünüyorsunuz?"
                className="w-full border border-white/[0.08] text-white rounded-xl p-4 pb-14 min-h-[110px] focus:outline-none focus:border-[var(--border-glow)] focus:ring-1 focus:ring-[var(--water-light)] transition-colors resize-none text-sm placeholder-white/20"
                required
              />
              <button
                type="submit"
                disabled={isSubmitting || !text.trim() || rating === 0}
                className="absolute bottom-3 right-3 element-fire-bg hover:element-fire-bg/80 disabled:opacity-30 disabled:grayscale text-white py-2 px-4 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-lg active:scale-95">

                {rating === 0 ? 'Puan Seçin' : isSubmitting ? 'Gönderiliyor...' : 'Gönder'}
                <Send size={14} />
              </button>
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
              className="group relative bg-[#111] border border-white/10 hover:border-white/20 rounded-3xl p-5 sm:p-6 transition-all"
            >
              <div className="flex gap-4 items-start">
                {/* Avatar */}
                <Link to={`/profile/${comment.userName}`} className="shrink-0 mt-0.5">
                  {comment.userPhoto && comment.userPhoto.startsWith('/profilePics/') ? (
                    <img
                      src={comment.userPhoto}
                      alt={comment.userName || 'Kullanıcı'}
                      className="w-10 h-10 rounded-xl object-cover border border-white/[0.08] hover:border-white/20 transition-colors"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center text-white/40 border border-white/[0.06] hover:border-white/20 transition-colors font-bold uppercase text-sm">
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

                    {/* Yıldızlar */}
                    <div className="flex items-center gap-0.5">
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
                            size={15}
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
                  </div>

                  {editingId === comment.id ? (
                    <div>
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full border border-white/10 text-white rounded-lg p-3 text-sm focus:outline-none focus:border-[var(--border-glow)] min-h-[80px] resize-none"
                        autoFocus
                      />
                      <div className="flex justify-end gap-2 mt-2">
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
                  ) : (
                    <p className="text-white/60 leading-relaxed text-sm whitespace-pre-wrap break-words">
                      {comment.text}
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