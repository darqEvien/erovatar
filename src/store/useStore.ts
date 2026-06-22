import { create } from 'zustand';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface StoreState {
  user: User | null;
  authLoading: boolean;
  theme: 'dark' | 'light';

  // Actions
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  setUser: (user: User | null) => void; // Profil güncellemesi sonrası anlık refresh için
  setSubtitleLanguage: (lang: 'tr' | 'en' | 'off') => void;
  subtitleLanguage: 'tr' | 'en' | 'off';
  autoPlayNext: boolean;
  setAutoPlayNext: (val: boolean) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  user: null,
  authLoading: true,
  theme: 'dark',
  subtitleLanguage: (localStorage.getItem('subtitleLanguage') as 'tr' | 'en' | 'off') || 'off',
  autoPlayNext: localStorage.getItem('autoPlayNext') !== 'false',

  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  setUser: (user) => set({ user }),
  setSubtitleLanguage: async (lang) => {
    localStorage.setItem('subtitleLanguage', lang);
    set({ subtitleLanguage: lang });
    
    // Firebase senkronizasyonu
    const user = get().user;
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { subtitleLanguage: lang }, { merge: true });
      } catch (err) {
        console.error("Altyazı tercihi Firebase'e kaydedilemedi:", err);
      }
    }
  },
  setAutoPlayNext: async (val) => {
    localStorage.setItem('autoPlayNext', val ? 'true' : 'false');
    set({ autoPlayNext: val });
    
    const user = get().user;
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { autoPlayNext: val }, { merge: true });
      } catch (err) {
        console.error("Oto oynatma tercihi Firebase'e kaydedilemedi:", err);
      }
    }
  },
}));

// Firebase Auth dinleyicisi — global duruma(user) otomatik yansıtır
onAuthStateChanged(auth, async (user) => {
  useStore.setState({ user, authLoading: false });
  
  if (user) {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        if (data.subtitleLanguage) {
          const lang = data.subtitleLanguage as 'tr' | 'en' | 'off';
          localStorage.setItem('subtitleLanguage', lang);
          useStore.setState({ subtitleLanguage: lang });
        }
        if (data.autoPlayNext !== undefined) {
          const autoPlayNext = data.autoPlayNext as boolean;
          localStorage.setItem('autoPlayNext', autoPlayNext ? 'true' : 'false');
          useStore.setState({ autoPlayNext });
        }
      }
    } catch (err) {
      console.error("Tercihler Firebase'den alınamadı:", err);
    }
  }
});