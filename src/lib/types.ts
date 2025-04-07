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
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
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
