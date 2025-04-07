import { User } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';

export interface Job {
  id?: string;
  company: string;
  jobTitle: string;
  jobUrl: string;
  applicationDate: string | Date | Timestamp;
  status: 'Beworben' | 'Interview' | 'Abgelehnt' | 'Angenommen';
  notes?: string;
  userId: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
}

export interface JobsContextType {
  jobs: Job[];
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
  loading: boolean;
}

export interface JobFormProps {
  jobId?: string;
}

export interface JobCardProps {
  job: Job;
  onJobUpdate: () => void;
}

export interface StatusBadgeProps {
  status: Job['status'];
}

export interface LoadingSpinnerProps {
  message?: string;
}

export interface AuthCheckProps {
  children: React.ReactNode;
}