import { getDatabase, ref, set, onValue, serverTimestamp } from 'firebase/database';
import { app } from './config';

const db = getDatabase(app);

export const realtimeService = {
  async setUserPresence(userId: string, isOnline: boolean) {
    try {
      const presenceRef = ref(db, `presence/${userId}`);
      await set(presenceRef, {
        isOnline,
        lastSeen: serverTimestamp(),
      });
    } catch (error) {
      console.error('Presence error:', error);
    }
  },

  onUserPresence(userId: string, callback: (isOnline: boolean) => void) {
    const presenceRef = ref(db, `presence/${userId}`);
    return onValue(presenceRef, (snapshot) => {
      const data = snapshot.val();
      callback(data?.isOnline ?? false);
    });
  },
};
