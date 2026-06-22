import { useEffect, useRef, useState, useCallback } from 'react';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useStore } from '../store/useStore';
import { getNextEpisode } from '../data/episodes';

// ─── Tip ──────────────────────────────────────────────────────────────────────
export interface WatchProgress {
  episodeId: string;
  season: number;
  episode: number;
  currentTime: number;
  duration: number;
  percentage: number;
  lastWatched: string;
  completed: boolean;
}

// ─── Eski yapıdan yeni yapıya migrasyon (bir kez çalışır) ────────────────────
async function migrateIfNeeded(uid: string): Promise<void> {
  try {
    const oldRef = doc(db, 'user_progress', uid);
    const oldSnap = await getDoc(oldRef);
    if (!oldSnap.exists()) return;

    const oldData = oldSnap.data().progress as Record<string, WatchProgress> | undefined;
    if (!oldData || Object.keys(oldData).length === 0) return;

    const progressCol = collection(db, 'users', uid, 'progress');
    const writes = Object.values(oldData).map((p) =>
      setDoc(doc(progressCol, p.episodeId), p)
    );
    await Promise.all(writes);

    await setDoc(oldRef, { progress: {}, migrated: true }, { merge: true });

  } catch (err) {
    console.error('[Progress] Migrasyon hatası:', err);
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useFirebaseProgress() {
  const { user, setSubtitleLanguage } = useStore();
  const [allProgress, setAllProgress] = useState<Record<string, WatchProgress>>({});
  const [loading, setLoading] = useState(true);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Gerçek zamanlı progress dinleyici + altyazı tercihi yükleme ───────────
  useEffect(() => {
    if (!user) {
      setAllProgress({});
      setLoading(false);
      return;
    }

    setLoading(true);

    migrateIfNeeded(user.uid).then(() => {
      // Altyazı tercihini Firebase'den yükle, store'a yaz
      const prefRef = doc(db, 'users', user.uid, 'preferences', 'subtitle');
      getDoc(prefRef).then((snap) => {
        if (snap.exists()) {
          const lang = (snap.data().subtitleLanguage as 'tr' | 'en' | 'off') ?? 'tr';
          setSubtitleLanguage(lang);
        }
      }).catch((err) => console.warn('[Subtitle] Yükleme hatası:', err));

      // Progress dinleyici
      const progressCol = collection(db, 'users', user.uid, 'progress');
      const unsubscribe = onSnapshot(
        progressCol,
        (snap) => {
          const data: Record<string, WatchProgress> = {};
          snap.forEach((d) => {
            data[d.id] = d.data() as WatchProgress;
          });

          setAllProgress(data);
          setLoading(false);
        },
        (err) => {
          console.error('[Progress] Dinleyici hatası (AdBlock olabilir):', err);
          setLoading(false);
        }
      );

      return unsubscribe;
    });
  }, [user?.uid]);

  // ── Altyazı tercihini Firebase'e kaydet ───────────────────────────────────
  // users/{uid}/preferences/subtitle — sadece dil değiştiğinde çağrılır, debounce yok
  const saveSubtitleLanguage = useCallback(async (lang: 'tr' | 'en' | 'off') => {
    if (!user) return;
    try {
      const prefRef = doc(db, 'users', user.uid, 'preferences', 'subtitle');
      await setDoc(prefRef, { subtitleLanguage: lang }, { merge: true });
    } catch (err) {
      console.error('[Subtitle] Kayıt hatası:', err);
    }
  }, [user]);

  // ── İlerleme kaydet (debounced) ────────────────────────────────────────────
  const saveProgress = useCallback((
    episodeId: string,
    season: number,
    episode: number,
    currentTime: number,
    duration: number,
    forceCompleted?: boolean
  ) => {
    if (!user) return;

    const percentage = duration > 0 ? (currentTime / duration) * 100 : 0;
    const completed = forceCompleted || percentage >= 90;

    const progressData: WatchProgress = {
      episodeId,
      season,
      episode,
      currentTime,
      duration,
      percentage,
      lastWatched: new Date().toISOString(),
      completed,
    };

    // UI'ı anında güncelle
    setAllProgress((prev) => ({ ...prev, [episodeId]: progressData }));

    // Firebase'e yazmayı debounce et — seek patlamasını önler
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const episodeRef = doc(db, 'users', user.uid, 'progress', episodeId);
        const existingSnap = await getDoc(episodeRef);

        // Firestore'daki veriyi karşılaştır — stale allProgress yerine gerçek server data
        if (existingSnap.exists()) {
          const existing = existingSnap.data() as WatchProgress;
          if (existing.percentage >= percentage) return;
        }

        await setDoc(episodeRef, progressData);
      } catch (err) {
        console.error('[Progress] Kayıt hatası:', err);
      }
    }, 3000);
  }, [user]);

  // ── Okuma yardımcıları ─────────────────────────────────────────────────────
  const getProgress = useCallback(
    (episodeId: string): WatchProgress | null => allProgress[episodeId] ?? null,
    [allProgress]
  );

  const getLastWatched = useCallback((): WatchProgress | null => {
    if (Object.keys(allProgress).length === 0) return null;

    const filtered = Object.values(allProgress).filter((p) => p.percentage > 3);
    if (filtered.length === 0) return null;
    const sorted = filtered.sort((a, b) =>
      new Date(b.lastWatched).getTime() - new Date(a.lastWatched).getTime()
    );

    const latest = sorted[0];

    if (latest.completed) {
      const next = getNextEpisode(latest.season, latest.episode);
      if (next) {
        return {
          episodeId: next.id,
          season: next.season,
          episode: next.episode,
          currentTime: 0,
          duration: 0,
          percentage: 0,
          lastWatched: latest.lastWatched,
          completed: false
        };
      }
    }

    return latest;
  }, [allProgress]);

  const getSeasonProgress = useCallback((seasonNumber: number) => {
    const seasonEpisodeCounts: Record<number, number> = {
      1: 13, 2: 13, 3: 13, 4: 13, 5: 13, 6: 21,
    };
    const total = seasonEpisodeCounts[seasonNumber] ?? 13;
    const completed = Object.values(allProgress).filter(
      (p) => p.season === seasonNumber && p.completed
    ).length;

    return {
      watched: completed,
      total,
      percentage: total > 0 ? (completed / total) * 100 : 0,
    };
  }, [allProgress]);

  return {
    allProgress,
    loading,
    saveProgress,
    saveSubtitleLanguage,
    getProgress,
    getLastWatched,
    getSeasonProgress,
  };
}

// ─── Format helper ─────────────────────────────────────────────────────────────
export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}