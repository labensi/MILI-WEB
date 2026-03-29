import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCVSoFlmPusyN5JZ40if3uA7A0e9RLTxK8",
  authDomain: "mili-web-59a63.firebaseapp.com",
  projectId: "mili-web-59a63",
  storageBucket: "mili-web-59a63.firebasestorage.app",
  messagingSenderId: "396494363839",
  appId: "1:396494363839:web:06709683774435a33c3a0a",
  measurementId: "G-G9HJD20ESE"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const rtdb = getDatabase(app);
