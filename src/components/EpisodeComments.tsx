import { useState } from 'react';
import { useComments } from '../hooks/useComments';
import { useStore } from '../store/useStore';
import { Link } from 'react-router-dom';
import { Star, Trash2, Send, Edit3, X, Check } from 'lucide-react';

const ELEMENT_COLORS: Record<number, string> = {
  1: 'var(--element-water)',
  2: 'var(--element-earth)',
  3: 'var(--element-fire)',
};

function parseEpisodeSeason(episodeId: string): number {
  const match = episodeId.match(/S(\d+)E(\d+)/i);
  if (!match) return 1;
  const season = Number(match[1]);
  return Number.isFinite(season) ? season : 1;
}

export default function EpisodeComments({ episodeId }: { episodeId: string }) {
  // useComments hook'una updateComment eklendiğini varsayıyoruz
  const { comments, loading, addComment, deleteComment, updateComment } = useComments(episodeId);
  const { user } = useStore();

  const season = parseEpisodeSeason(episodeId);
  const elementColor = ELEMENT_COLORS[season] || 'var(--element-water)';
  void elementColor;


  // Form State
  const [text, setText] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Düzenleme State'leri
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
      setRating(5);
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
    } catch (error) {
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
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-12 px-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-serif font-bold tracking-tight" style={{ color: 'var(--parchment)' }}>Bölüm Yorumları</h2>
        <div className="font-bold px-4 py-1.5 rounded-full text-sm" style={{ background: 'rgba(74,158,202,0.10)', border: '1px solid rgba(74,158,202,0.25)', color: 'var(--water-light)' }}>
          {comments.length} Yorum
        </div>
      </div>

      {/* Yorum Ekleme Formu */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-6 mb-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-[rgba(74,158,202,0.9)] to-transparent opacity-50" />

        {user ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex items-center gap-4 mb-2">
              {user.photoURL && user.photoURL !== 'default' ? (
                <img src={user.photoURL} alt="Profil" className="w-10 h-10 rounded-full border border-white/20" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center font-bold border border-red-500/30">
                  {user.email?.[0].toUpperCase()}
                </div>
              )}

              <div className="flex flex-col">
                <span className="text-white text-sm font-semibold">Puanınız</span>
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        size={20}
                        className={`transition-colors ${(hoverRating || rating) >= star ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
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
                className="w-full bg-black/50 border border-white/10 text-white rounded-xl p-4 min-h-[100px] pb-14 focus:outline-none focus:border-red-500 transition-colors resize-none"
                required
              />
              <button
                type="submit"
                disabled={isSubmitting || !text.trim() || rating === 0} // Puan seçilmediyse basılamaz
                className="absolute bottom-3 right-3 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:hover:bg-red-600 disabled:grayscale text-white p-2 px-4 rounded-lg font-bold text-sm tracking-wide flex items-center gap-2 transition-all shadow-lg shadow-red-900/20"
              >
                {rating === 0 ? 'Puan Seçin' : isSubmitting ? 'Gönderiliyor...' : 'Gönder'}
                <Send size={16} />
              </button>
            </div>
          </form>
        ) : (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <p className="text-gray-400 mb-4">Bir şeyler yazabilmek ve puan verebilmek için masaya oturmanız gerekiyor.</p>
            <div className="px-6 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-semibold">
              Yorum yapmak için giriş yapın
            </div>
          </div>
        )}
      </div>

      {/* Yorumlar Listesi */}
      <div className="flex flex-col gap-6">
        {loading ? (
          <div className="text-gray-500 flex justify-center py-10 animate-pulse">Yorumlar yükleniyor...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl">
            <p className="text-gray-500 font-serif italic text-lg">Bu bölüme henüz kimse not bırakmamış.</p>
            <p className="text-gray-600 text-sm mt-2">İlk yazan sen ol.</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="group relative bg-[#0a0a0a] border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all">

              <div className="flex gap-4 items-start">
                <div className="shrink-0 mt-1">
                  <Link to={`/profile/${comment.userName}`}>
                    {comment.userPhoto && comment.userPhoto !== 'default' ? (
                      <img src={comment.userPhoto} alt={comment.userName || 'Kullanıcı'} className="w-12 h-12 rounded-full border border-white/10 hover:border-red-500 transition-colors" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center text-gray-400 border border-white/5 hover:border-red-500 transition-colors font-bold uppercase">
                        {comment.userName ? comment.userName[0] : '?'}
                      </div>
                    )}
                  </Link>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Link to={`/profile/${comment.userName}`} className="text-white hover:text-red-500 transition-colors font-bold text-sm tracking-wide">
                        {comment.userName}
                      </Link>
                      <span className="text-gray-600 text-xs">• {formatDate(comment.createdAt)}</span>
                    </div>

                    {/* Yıldızlar (Düzenleme modunda değiştirilebilir) */}
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          disabled={editingId !== comment.id}
                          onClick={() => setEditRating(star)}
                          onMouseEnter={() => editingId === comment.id && setHoverEditRating(star)}
                          onMouseLeave={() => editingId === comment.id && setHoverEditRating(0)}
                          className={`${editingId === comment.id ? 'cursor-pointer hover:scale-125 transition-transform' : 'cursor-default'}`}
                        >
                          <Star
                            size={20}
                            className={`transition-colors ${
                              (editingId === comment.id 
                                ? (hoverEditRating || editRating) 
                                : Number(comment.rating) || 0
                              ) >= star 
                                ? 'fill-red-500 text-red-500' 
                                : 'text-white/10 fill-white/5'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {editingId === comment.id ? (
                    <div className="mt-2">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full bg-black border border-red-500/50 text-white rounded-lg p-3 text-sm focus:outline-none min-h-[80px] resize-none"
                        autoFocus
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-2 text-gray-400 hover:text-white transition-colors"
                        >
                          <X size={16} />
                        </button>
                        <button
                          onClick={() => handleUpdate(comment.id)}
                          className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                          <Check size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-300 leading-relaxed text-sm/6 break-words whitespace-pre-wrap">
                      {comment.text}
                    </p>
                  )}
                </div>
              </div>

              {/* İşlem Butonları (Sadece sahibi için) */}
              {user && user.uid === comment.userId && editingId !== comment.id && (
                <div className="absolute bottom-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={() => {
                      setEditingId(comment.id);
                      setEditText(comment.text);
                      setEditRating(comment.rating);
                    }}
                    className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                    title="Düzenle"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm("Bu yorumunuzu silmek istediğinize emin misiniz?")) {
                        deleteComment(comment.id);
                      }
                    }}
                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                    title="Yorumu Sil"
                  >
                    <Trash2 size={16} />
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