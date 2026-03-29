import { ref, set, onValue, serverTimestamp } from 'firebase/database';
import { rtdb } from './config';

export const realtimeService = {
  async setUserPresence(userId: string, isOnline: boolean) {
    try {
      const presenceRef = ref(rtdb, `presence/${userId}`);
      await set(presenceRef, {
        isOnline,
        lastSeen: serverTimestamp(),
      });
    } catch (error) {
      console.error('Presence error:', error);
    }
  },

  onUserPresence(userId: string, callback: (isOnline: boolean) => void) {
    const presenceRef = ref(rtdb, `presence/${userId}`);
    return onValue(presenceRef, (snapshot) => {
      const data = snapshot.val();
      callback(data?.isOnline ?? false);
    });
  },

  async setTypingStatus(roomId: string, userId: string, isTyping: boolean) {
    try {
      const typingRef = ref(rtdb, `typing/${roomId}/${userId}`);
      if (isTyping) {
        await set(typingRef, {
          userId,
          timestamp: serverTimestamp(),
        });
      } else {
        await set(typingRef, null);
      }
    } catch (error) {
      console.error('Typing status error:', error);
    }
  },

  onTypingStatus(roomId: string, callback: (typers: Record<string, any>) => void) {
    const typingRef = ref(rtdb, `typing/${roomId}`);
    return onValue(typingRef, (snapshot) => {
      const data = snapshot.val();
      callback(data || {});
    });
  },
};
