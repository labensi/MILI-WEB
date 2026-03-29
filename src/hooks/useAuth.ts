import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { auth, db } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export const useAuth = () => {
  const { user, isLoading, setUser, setLoading } = useAuthStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as any);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
      setInitialized(true);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  return { user, isLoading, initialized };
};
