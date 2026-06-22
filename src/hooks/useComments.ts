import { useState, useCallback, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, limit, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, setDoc, collectionGroup } from 'firebase/firestore';
import { useStore } from '../store/useStore';

export interface Comment {
  id: string;
  episodeId: string;
  userId: string;
  userName: string | null;
  userPhoto: string | null;
  text: string;
  rating: number; // 1-5
  createdAt: any;
}

export function useComments(episodeId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useStore();

  useEffect(() => {
    if (!episodeId) return;

    const q = query(
      collectionGroup(db, 'comments'),
      where('episodeId', '==', episodeId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: Comment[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        fetched.push({
          id: doc.id,
          ...data,
          // Tarih null ise veya Timestamp ise güvenli bir şekilde objeye çevir
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date()
        } as Comment);
      });
      setComments(fetched);
      setLoading(false);
    }, (error) => {
      console.warn("Hata:", error.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [episodeId]);

  const updateComment = useCallback(async (commentId: string, newText: string, newRating: number) => {
    if (!user) return;
    try {
      const commentRef = doc(db, 'users', user.uid, 'comments', commentId);
      await setDoc(commentRef, {
        text: newText.trim(),
        rating: newRating,
        updatedAt: serverTimestamp() // Düzenleme tarihini tutabilirsin
      }, { merge: true });
    } catch (error) {
      console.error("Güncelleme hatası:", error);
      throw error;
    }
  }, [user]);
  const addComment = useCallback(async (text: string, rating: number) => {
    if (!user) throw new Error("Giriş yapmalısın.");

    try {
      const commentsCol = collection(db, 'users', user.uid, 'comments');
      await addDoc(commentsCol, {
        episodeId: episodeId, // Her zaman string olarak kaydet
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0],
        userPhoto: user.photoURL,
        text: text.trim(),
        rating,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Ekleme hatası:", error);
    }
  }, [episodeId, user]);
  const deleteComment = useCallback(async (commentId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'comments', commentId));
    } catch (error) {
      console.error("Yorum silme hatası:", error);
      throw error;
    }
  }, [user]);

  return {
    comments,
    loading,
    addComment,
    deleteComment,
    updateComment
  };
}
