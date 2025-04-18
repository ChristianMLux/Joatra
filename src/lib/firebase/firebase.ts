import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
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
  limit,
} from "firebase/firestore";
import {
  Job,
  Recruiter,
  UserProfile,
  CVTemplate,
  GeneratedCV,
  CoverLetterTemplate,
  GeneratedCoverLetter,
} from "../types";

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

// --- Auth Functions ---
export const loginWithEmail = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const registerWithEmail = async (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const logout = async () => {
  return signOut(auth);
};

// --- Job Functions ---
export const addJob = async (
  userId: string,
  jobData: Omit<Job, "id" | "userId" | "createdAt" | "updatedAt">
) => {
  return addDoc(collection(db, "jobs"), {
    ...jobData,
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
    jobs.push({ id: doc.id, ...doc.data() } as Job);
  });
  return jobs;
};

export const updateJob = async (
  jobId: string,
  jobData: Partial<Omit<Job, "id" | "userId" | "createdAt" | "updatedAt">>
) => {
  const jobRef = doc(db, "jobs", jobId);
  return updateDoc(jobRef, {
    ...jobData,
    updatedAt: serverTimestamp(),
  });
};

export const deleteJob = async (jobId: string) => {
  const jobRef = doc(db, "jobs", jobId);
  return deleteDoc(jobRef);
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
    jobs.push({ id: doc.id, ...doc.data() } as Job);
  });
  return jobs;
};

// --- Recruiter Functions ---
export const addRecruiter = async (
  userId: string,
  recruiterData: Omit<Recruiter, "id" | "userId" | "createdAt" | "updatedAt">
) => {
  return addDoc(collection(db, "recruiters"), {
    ...recruiterData,
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
    recruiters.push({ id: doc.id, ...doc.data() } as Recruiter);
  });
  return recruiters;
};

export const getRecruiter = async (
  recruiterId: string
): Promise<Recruiter | null> => {
  const recruiterRef = doc(db, "recruiters", recruiterId);
  const recruiterSnap = await getDoc(recruiterRef);
  if (recruiterSnap.exists()) {
    return { id: recruiterSnap.id, ...recruiterSnap.data() } as Recruiter;
  }
  return null;
};

export const updateRecruiter = async (
  recruiterId: string,
  recruiterData: Partial<
    Omit<Recruiter, "id" | "userId" | "createdAt" | "updatedAt">
  >
) => {
  const recruiterRef = doc(db, "recruiters", recruiterId);
  return updateDoc(recruiterRef, {
    ...recruiterData,
    updatedAt: serverTimestamp(),
  });
};

export const deleteRecruiter = async (recruiterId: string) => {
  const recruiterRef = doc(db, "recruiters", recruiterId);
  return deleteDoc(recruiterRef);
};

// --- Profile Functions ---
export const createUserProfile = async (
  userId: string,
  profileData: Omit<UserProfile, "id" | "userId" | "createdAt" | "updatedAt">
) => {
  return addDoc(collection(db, "profiles"), {
    ...profileData,
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
  const profileData = profileDoc.data();
  return { id: profileDoc.id, ...profileData } as UserProfile;
};

export const updateUserProfile = async (
  profileId: string,
  profileData: Partial<
    Omit<UserProfile, "id" | "userId" | "createdAt" | "updatedAt">
  >
) => {
  const profileRef = doc(db, "profiles", profileId);
  return updateDoc(profileRef, {
    ...profileData,
    updatedAt: serverTimestamp(),
  });
};

// --- CV Template Functions ---
export const getCVTemplates = async (): Promise<CVTemplate[]> => {
  const q = query(collection(db, "cvTemplates"));
  const querySnapshot = await getDocs(q);
  const templates: CVTemplate[] = [];
  querySnapshot.forEach((doc) => {
    templates.push({ id: doc.id, ...doc.data() } as CVTemplate);
  });
  return templates;
};

export const getCVTemplate = async (
  templateId: string
): Promise<CVTemplate | null> => {
  const templateRef = doc(db, "cvTemplates", templateId);
  const templateSnap = await getDoc(templateRef);
  if (templateSnap.exists()) {
    return { id: templateSnap.id, ...templateSnap.data() } as CVTemplate;
  }
  return null;
};

// --- Generated CV Functions ---
export const createGeneratedCV = async (
  userId: string,
  cvData: Omit<GeneratedCV, "id" | "userId" | "createdAt" | "updatedAt">
) => {
  return addDoc(collection(db, "generatedCVs"), {
    ...cvData,
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
    cvs.push({ id: doc.id, ...doc.data() } as GeneratedCV);
  });
  return cvs;
};
export const getGeneratedCV = async (
  cvId: string
): Promise<GeneratedCV | null> => {
  const cvRef = doc(db, "generatedCVs", cvId);
  const cvSnap = await getDoc(cvRef);
  if (cvSnap.exists()) {
    return { id: cvSnap.id, ...cvSnap.data() } as GeneratedCV;
  }
  return null;
};
export const updateGeneratedCV = async (
  cvId: string,
  cvData: Partial<
    Omit<GeneratedCV, "id" | "userId" | "createdAt" | "updatedAt">
  >
) => {
  const cvRef = doc(db, "generatedCVs", cvId);
  return updateDoc(cvRef, { ...cvData, updatedAt: serverTimestamp() });
};
export const deleteGeneratedCV = async (cvId: string) => {
  const cvRef = doc(db, "generatedCVs", cvId);
  return deleteDoc(cvRef);
};

// --- Cover Letter Template Functions ---
export const getCoverLetterTemplates = async (): Promise<
  CoverLetterTemplate[]
> => {
  const q = query(collection(db, "coverLetterTemplates"));
  const querySnapshot = await getDocs(q);
  const templates: CoverLetterTemplate[] = [];
  querySnapshot.forEach((doc) => {
    templates.push({ id: doc.id, ...doc.data() } as CoverLetterTemplate);
  });
  if (templates.length === 0) {
    console.warn("No cover letter templates found in Firestore!");
  }
  return templates;
};
export const getCoverLetterTemplate = async (
  templateId: string
): Promise<CoverLetterTemplate | null> => {
  const templateRef = doc(db, "coverLetterTemplates", templateId);
  const templateSnap = await getDoc(templateRef);
  if (templateSnap.exists()) {
    return {
      id: templateSnap.id,
      ...templateSnap.data(),
    } as CoverLetterTemplate;
  }
  return null;
};

// --- Generated Cover Letter Functions ---
export const createGeneratedCoverLetter = async (
  userId: string,
  coverLetterData: Omit<
    GeneratedCoverLetter,
    "id" | "userId" | "createdAt" | "updatedAt"
  >
) => {
  return addDoc(collection(db, "generatedCoverLetters"), {
    ...coverLetterData,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};
export const getGeneratedCoverLetters = async (
  userId: string
): Promise<GeneratedCoverLetter[]> => {
  const q = query(
    collection(db, "generatedCoverLetters"),
    where("userId", "==", userId)
  );
  const querySnapshot = await getDocs(q);
  const coverLetters: GeneratedCoverLetter[] = [];
  querySnapshot.forEach((doc) => {
    coverLetters.push({ id: doc.id, ...doc.data() } as GeneratedCoverLetter);
  });
  return coverLetters;
};
export const getGeneratedCoverLetter = async (
  coverLetterId: string
): Promise<GeneratedCoverLetter | null> => {
  const coverLetterRef = doc(db, "generatedCoverLetters", coverLetterId);
  const coverLetterSnap = await getDoc(coverLetterRef);
  if (coverLetterSnap.exists()) {
    return {
      id: coverLetterSnap.id,
      ...coverLetterSnap.data(),
    } as GeneratedCoverLetter;
  }
  return null;
};
export const updateGeneratedCoverLetter = async (
  coverLetterId: string,
  coverLetterData: Partial<
    Omit<GeneratedCoverLetter, "id" | "userId" | "createdAt" | "updatedAt">
  >
) => {
  const coverLetterRef = doc(db, "generatedCoverLetters", coverLetterId);
  return updateDoc(coverLetterRef, {
    ...coverLetterData,
    updatedAt: serverTimestamp(),
  });
};
export const deleteGeneratedCoverLetter = async (coverLetterId: string) => {
  const coverLetterRef = doc(db, "generatedCoverLetters", coverLetterId);
  return deleteDoc(coverLetterRef);
};

export { auth, db };
