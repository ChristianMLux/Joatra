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

export interface Education {
  id?: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string | number;
  endDate?: string | number;
  location?: string;
  description?: string;
  ongoing?: boolean;
}

export interface Experience {
  id?: string;
  company: string;
  position: string;
  startDate: string | number;
  endDate?: string | number;
  location?: string;
  description?: string;
  highlights?: string[];
  ongoing?: boolean;
}

export interface Skill {
  id?: string;
  name: string;
  level?: "Grundkenntnisse" | "Gut" | "Sehr gut" | "Experte";
  category?: "Technical" | "Soft" | "Language" | "Other";
}

export interface Language {
  name: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | "Muttersprache";
}

export interface Certificate {
  id?: string;
  name: string;
  issuer: string;
  date: string | Date | Timestamp;
  description?: string;
}

export interface PersonalDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  birthDate?: string | Date | Timestamp;
  birthPlace?: string;
  nationality?: string;
  photo?: string;
  website?: string;
  linkedin?: string;
  xing?: string;
  github?: string;
}

export interface UserProfile {
  id?: string;
  userId: string;
  personalDetails: PersonalDetails;
  summary?: string;
  education: Education[];
  experience: Experience[];
  skills: Skill[];
  languages: Language[];
  certificates?: Certificate[];
  interests?: string[];
  additionalInfo?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface CVTemplate {
  id: string;
  name: string;
  description: string;
  language: "de" | "en";
  type: "standard" | "modern" | "academic" | "creative";
  atsOptimized: boolean;
  photoIncluded: boolean;
}

export interface GeneratedCV {
  id?: string;
  userId: string;
  jobId?: string;
  profileId: string;
  templateId: string;
  content: any;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface CVGeneratorProps {
  jobId?: string;
  templateId?: string;
}

export interface CVTemplatePreviewProps {
  template: CVTemplate;
  profile: UserProfile;
  job?: Job;
  selected: boolean;
  onSelect: (templateId: string) => void;
}

export interface CVFormProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
}

export interface CVPreviewProps {
  cv: GeneratedCV;
  profile: UserProfile;
  job?: Job;
  template: CVTemplate;
  onEdit: () => void;
  onDownload: () => void;
}
