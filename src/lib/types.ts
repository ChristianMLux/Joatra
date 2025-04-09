import { User } from "firebase/auth";
import { Timestamp } from "firebase/firestore";

export interface Job {
  id?: string;
  company: string;
  jobTitle: string;
  jobUrl: string;
  applicationDate: string | Date | Timestamp;
  status: "Beworben" | "Interview" | "Abgelehnt" | "Angenommen";
  notes?: string;
  userId: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  location?: string;
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  techStack?: string[];
  contactPerson?: {
    name: string;
    email?: string;
    phone?: string;
    position?: string;
  };
  rejectionReason?: string;
  recruiterId?: string;
  recruiterName?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
}

export interface RecruitersContextType {
  recruiters: Recruiter[];
  setRecruiters: React.Dispatch<React.SetStateAction<Recruiter[]>>;
  loading: boolean;
  refresh: () => Promise<void>;
}

export interface JobsContextType {
  jobs: Job[];
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
  loading: boolean;
  refresh: () => Promise<void>;
}

export interface JobFormProps {
  jobId?: string;
}

export interface JobCardProps {
  job: Job;
  onJobUpdate: () => void;
  viewMode: "full" | "compact";
}

export interface StatusBadgeProps {
  status: Job["status"];
}

export interface LoadingSpinnerProps {
  message?: string;
}

export interface AuthCheckProps {
  children: React.ReactNode;
}

export interface ViewToggleProps {
  currentView: "full" | "compact";
  onViewChange: (view: "full" | "compact") => void;
}

export interface FilterTabsProps {
  statusCounts: Record<string, number>;
  totalCount: number;
}

export interface RecruiterFormProps {
  recruiterId?: string;
}

export interface RecruiterCardProps {
  recruiter: Recruiter;
  onRecruiterUpdate: () => void;
  jobCount?: number;
}

export interface RecruiterDetailProps {
  recruiterId: string;
}

export interface Recruiter {
  id?: string;
  name: string;
  company?: string;
  notes?: string;
  userId: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
