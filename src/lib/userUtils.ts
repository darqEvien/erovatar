import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { updateProfile, type User } from 'firebase/auth';

// Kullanıcı adı uygunluğunu kontrol et
// currentUid verilirse kendi mevcut adını değiştirirken false pozitif vermesin
export const checkUsernameAvailable = async (
  username: string,
  currentUid?: string
): Promise<boolean> => {
  if (!username || username.trim().length < 3) return false;
  const usernameLower = username.trim().toLowerCase();

  try {
    const docSnap = await getDoc(doc(db, 'usernames', usernameLower));
    if (!docSnap.exists()) return true;
    // Kendi mevcut adıysa uygun say
    if (currentUid && docSnap.data().uid === currentUid) return true;
    return false;
  } catch (error) {
    console.error("Username check error", error);
    return false;
  }
};

// İlk kayıt veya Google ile girişte profili tamamla
export const completeUserProfile = async (
  user: User,
  username: string,
  photoPath: string | null  // null = resimsiz, '/profilePics/xxx.jpg' = avatar
): Promise<void> => {
  const usernameLower = username.trim().toLowerCase();
  const cleanUsername = username.trim();

  const isAvailable = await checkUsernameAvailable(username);
  if (!isAvailable) throw new Error("Bu kullanıcı adı daha önce alınmış.");

  await updateProfile(user, {
    displayName: cleanUsername,
    photoURL: photoPath ?? null,
  });

  await setDoc(doc(db, 'usernames', usernameLower), {
    uid: user.uid,
    original: cleanUsername,
    createdAt: new Date().toISOString(),
  });

  await setDoc(doc(db, 'users', user.uid), {
    username: cleanUsername,
    email: user.email,
    photoURL: photoPath ?? null,
    createdAt: new Date().toISOString(),
  }, { merge: true });
};

// Nick değiştirildiğinde eski nick'i usernames'den sil
export const releaseOldUsername = async (oldUsername: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'usernames', oldUsername.trim().toLowerCase()));
  } catch (error) {
    console.error("Eski username silinemedi:", error);
  }
};