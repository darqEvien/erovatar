import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { type Comment } from './useComments';
import { useStore } from '../store/useStore';

export function useUserComments() {
  const [userComments, setUserComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const { user } = useStore();

  useEffect(() => {
    if (!user) {
      setUserComments([]);
      setLoadingComments(false);
      return;
    }

    const q = query(
      collection(db, 'users', user.uid, 'comments'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: Comment[] = [];
      snapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() } as Comment);
      });
      setUserComments(fetched);
      setLoadingComments(false);
    }, (error) => {
      console.warn("Profil yorumları çekilirken hata (Index hatası olabilir):", error.message);
      setLoadingComments(false);
    });

    return () => unsubscribe();
  }, [user]);

  const removeComment = useCallback(async (commentId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'comments', commentId));
    } catch (error) {
      console.error("Yorum silme hatası:", error);
      throw error;
    }
  }, [user]);

  const editComment = useCallback(async (commentId: string, newText: string, newRating: number) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid, 'comments', commentId), {
        text: newText.trim(),
        rating: newRating
      });
    } catch (error) {
      console.error("Yorum güncelleme hatası:", error);
      throw error;
    }
  }, [user]);

  return {
    userComments,
    loadingComments,
    removeComment,
    editComment
  };
}
