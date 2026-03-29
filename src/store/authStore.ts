import { create } from 'zustand';
import { User } from '../types';
import { auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ isLoading: loading }),
  logout: () => set({ user: null }),
}));

// Listen to auth state changes
onAuthStateChanged(auth, async (firebaseUser) => {
  if (firebaseUser) {
    const { db } = await import('../firebase/firestore');
    const { doc, getDoc } = await import('firebase/firestore');
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (userDoc.exists()) {
      useAuthStore.getState().setUser(userDoc.data() as User);
    }
  } else {
    useAuthStore.getState().setUser(null);
  }
  useAuthStore.getState().setLoading(false);
});
