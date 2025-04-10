import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  orderBy,
  serverTimestamp,
  Timestamp,
  limit,
} from "firebase/firestore";
import { Job, Recruiter, UserProfile, CVTemplate, GeneratedCV } from "../types";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

export const loginWithEmail = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const registerWithEmail = async (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const logout = async () => {
  return signOut(auth);
};

export const addJob = async (
  userId: string,
  jobData: Omit<Job, "id" | "userId" | "createdAt" | "updatedAt">
) => {
  const sanitizeData = (obj: any): any => {
    if (obj === undefined) return null;
    if (obj === null || typeof obj !== "object") return obj;

    if (Array.isArray(obj)) {
      return obj.map((item) => sanitizeData(item));
    }

    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeData(value);
    }

    return sanitized;
  };

  const sanitizedJobData = sanitizeData(jobData);

  return addDoc(collection(db, "jobs"), {
    ...sanitizedJobData,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const getJobs = async (userId: string): Promise<Job[]> => {
  const q = query(
    collection(db, "jobs"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  const querySnapshot = await getDocs(q);
  const jobs: Job[] = [];

  querySnapshot.forEach((doc) => {
    jobs.push({
      id: doc.id,
      ...doc.data(),
    } as Job);
  });

  return jobs;
};

const sanitizeData = (obj: any): any => {
  if (obj === undefined) return null;
  if (obj === null || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeData(item));
  }

  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeData(value);
  }

  return sanitized;
};

export const updateJob = async (
  jobId: string,
  jobData: Partial<Omit<Job, "id" | "userId" | "createdAt" | "updatedAt">>
) => {
  const sanitizedJobData = sanitizeData(jobData);

  const jobRef = doc(db, "jobs", jobId);
  return updateDoc(jobRef, {
    ...sanitizedJobData,
    updatedAt: serverTimestamp(),
  });
};

export const deleteJob = async (jobId: string) => {
  const jobRef = doc(db, "jobs", jobId);
  return deleteDoc(jobRef);
};

export const addRecruiter = async (
  userId: string,
  recruiterData: Omit<Recruiter, "id" | "userId" | "createdAt" | "updatedAt">
) => {
  const sanitizedData = sanitizeData(recruiterData);

  return addDoc(collection(db, "recruiters"), {
    ...sanitizedData,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const getRecruiters = async (userId: string): Promise<Recruiter[]> => {
  const q = query(
    collection(db, "recruiters"),
    where("userId", "==", userId),
    orderBy("name", "asc")
  );

  const querySnapshot = await getDocs(q);
  const recruiters: Recruiter[] = [];

  querySnapshot.forEach((doc) => {
    recruiters.push({
      id: doc.id,
      ...doc.data(),
    } as Recruiter);
  });

  return recruiters;
};

export const getRecruiter = async (
  recruiterId: string
): Promise<Recruiter | null> => {
  const recruiterRef = doc(db, "recruiters", recruiterId);
  const recruiterSnap = await getDoc(recruiterRef);

  if (recruiterSnap.exists()) {
    return {
      id: recruiterSnap.id,
      ...recruiterSnap.data(),
    } as Recruiter;
  }

  return null;
};

export const updateRecruiter = async (
  recruiterId: string,
  recruiterData: Partial<
    Omit<Recruiter, "id" | "userId" | "createdAt" | "updatedAt">
  >
) => {
  const sanitizedData = sanitizeData(recruiterData);

  const recruiterRef = doc(db, "recruiters", recruiterId);
  return updateDoc(recruiterRef, {
    ...sanitizedData,
    updatedAt: serverTimestamp(),
  });
};

export const deleteRecruiter = async (recruiterId: string) => {
  const recruiterRef = doc(db, "recruiters", recruiterId);
  return deleteDoc(recruiterRef);
};

export const getJobsByRecruiter = async (
  userId: string,
  recruiterId: string
): Promise<Job[]> => {
  const q = query(
    collection(db, "jobs"),
    where("userId", "==", userId),
    where("recruiterId", "==", recruiterId),
    orderBy("applicationDate", "desc")
  );

  const querySnapshot = await getDocs(q);
  const jobs: Job[] = [];

  querySnapshot.forEach((doc) => {
    jobs.push({
      id: doc.id,
      ...doc.data(),
    } as Job);
  });

  return jobs;
};

export const createUserProfile = async (
  userId: string,
  profileData: Omit<UserProfile, "id" | "userId" | "createdAt" | "updatedAt">
) => {
  const sanitizedData = sanitizeData(profileData);

  return addDoc(collection(db, "profiles"), {
    ...sanitizedData,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const getUserProfile = async (
  userId: string
): Promise<UserProfile | null> => {
  const q = query(
    collection(db, "profiles"),
    where("userId", "==", userId),
    limit(1)
  );

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const profileDoc = querySnapshot.docs[0];

  return {
    id: profileDoc.id,
    ...profileDoc.data(),
  } as UserProfile;
};

export const updateUserProfile = async (
  profileId: string,
  profileData: Partial<
    Omit<UserProfile, "id" | "userId" | "createdAt" | "updatedAt">
  >
) => {
  const sanitizedData = sanitizeData(profileData);

  const profileRef = doc(db, "profiles", profileId);
  return updateDoc(profileRef, {
    ...sanitizedData,
    updatedAt: serverTimestamp(),
  });
};

// CV-Templates

export const getCVTemplates = async (): Promise<CVTemplate[]> => {
  const q = query(collection(db, "cvTemplates"));
  const querySnapshot = await getDocs(q);

  const templates: CVTemplate[] = [];

  querySnapshot.forEach((doc) => {
    templates.push({
      id: doc.id,
      ...doc.data(),
    } as CVTemplate);
  });

  return templates;
};

export const getCVTemplate = async (
  templateId: string
): Promise<CVTemplate | null> => {
  const templateRef = doc(db, "cvTemplates", templateId);
  const templateSnap = await getDoc(templateRef);

  if (templateSnap.exists()) {
    return {
      id: templateSnap.id,
      ...templateSnap.data(),
    } as CVTemplate;
  }

  return null;
};

// Generierte CVs

export const createGeneratedCV = async (
  userId: string,
  cvData: Omit<GeneratedCV, "id" | "userId" | "createdAt" | "updatedAt">
) => {
  const sanitizedData = sanitizeData(cvData);

  return addDoc(collection(db, "generatedCVs"), {
    ...sanitizedData,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const getGeneratedCVs = async (
  userId: string
): Promise<GeneratedCV[]> => {
  const q = query(
    collection(db, "generatedCVs"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  const querySnapshot = await getDocs(q);
  const cvs: GeneratedCV[] = [];

  querySnapshot.forEach((doc) => {
    cvs.push({
      id: doc.id,
      ...doc.data(),
    } as GeneratedCV);
  });

  return cvs;
};

export const getGeneratedCV = async (
  cvId: string
): Promise<GeneratedCV | null> => {
  const cvRef = doc(db, "generatedCVs", cvId);
  const cvSnap = await getDoc(cvRef);

  if (cvSnap.exists()) {
    return {
      id: cvSnap.id,
      ...cvSnap.data(),
    } as GeneratedCV;
  }

  return null;
};

export const updateGeneratedCV = async (
  cvId: string,
  cvData: Partial<
    Omit<GeneratedCV, "id" | "userId" | "createdAt" | "updatedAt">
  >
) => {
  const sanitizedData = sanitizeData(cvData);

  const cvRef = doc(db, "generatedCVs", cvId);
  return updateDoc(cvRef, {
    ...sanitizedData,
    updatedAt: serverTimestamp(),
  });
};

export const deleteGeneratedCV = async (cvId: string) => {
  const cvRef = doc(db, "generatedCVs", cvId);
  return deleteDoc(cvRef);
};

export { auth };
export { db };
