import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  orderBy, 
  serverTimestamp, 
  Timestamp 
} from 'firebase/firestore';
import { Job } from '../types';

// Firebase-Konfiguration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Firebase initialisieren
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

// Authentifizierungsfunktionen
export const loginWithEmail = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const registerWithEmail = async (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const logout = async () => {
  return signOut(auth);
};

// Firestore Funktionen für Jobs
export const addJob = async (userId: string, jobData: Omit<Job, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
  return addDoc(collection(db, 'jobs'), {
    ...jobData,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

export const getJobs = async (userId: string): Promise<Job[]> => {
  const q = query(
    collection(db, 'jobs'), 
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  const jobs: Job[] = [];
  
  querySnapshot.forEach((doc) => {
    jobs.push({
      id: doc.id,
      ...doc.data()
    } as Job);
  });
  
  return jobs;
};

export const updateJob = async (jobId: string, jobData: Partial<Omit<Job, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => {
  const jobRef = doc(db, 'jobs', jobId);
  return updateDoc(jobRef, {
    ...jobData,
    updatedAt: serverTimestamp()
  });
};

export const deleteJob = async (jobId: string) => {
  const jobRef = doc(db, 'jobs', jobId);
  return deleteDoc(jobRef);
};

// Auth Status
export { auth };
export { db };