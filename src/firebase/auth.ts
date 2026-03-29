import { 
  auth, 
  db 
} from './config';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateEmail,
  updatePassword,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { User } from '../types';

export const registerUser = async (email: string, password: string, username: string, displayName: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const userData: User = {
      uid: user.uid,
      email,
      username,
      displayName,
      photoURL: null,
      bannerURL: null,
      bio: null,
      accentColor: '#ff6b9d',
      fontStyle: 'classic',
      fontColor: '#ffffff',
      fontAnimation: 'none',
      avatarFrame: 1,
      profileEffect: 1,
      theme: 'spring',
      darkMode: false,
      soundVolume: 0,
      isAdmin: email === 'admin@milichat.com',
      isBanned: false,
      createdAt: new Date(),
      lastSeen: new Date(),
    };
    
    await setDoc(doc(db, 'users', user.uid), userData);
    return { success: true, user: userData };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      return { success: false, error: 'User data not found' };
    }
    
    const userData = userDoc.data() as User;
    if (userData.isBanned) {
      await signOut(auth);
      return { success: false, error: 'Account has been banned' };
    }
    
    await updateDoc(doc(db, 'users', user.uid), {
      lastSeen: new Date()
    });
    
    return { success: true, user: userData };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updateUserEmail = async (newEmail: string) => {
  try {
    const user = auth.currentUser;
    if (user) {
      await updateEmail(user, newEmail);
      await updateDoc(doc(db, 'users', user.uid), { email: newEmail });
      return { success: true };
    }
    return { success: false, error: 'No user logged in' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updateUserPassword = async (newPassword: string) => {
  try {
    const user = auth.currentUser;
    if (user) {
      await updatePassword(user, newPassword);
      return { success: true };
    }
    return { success: false, error: 'No user logged in' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const isAdminUser = (user: FirebaseUser | null): boolean => {
  return user?.email === 'admin@milichat.com';
};
