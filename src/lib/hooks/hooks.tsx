"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react";
import { getJobs } from "../firebase/firebase";
import { useAuth } from "@/providers/AuthProvider";
import { Job, JobsContextType } from "../types";

const JobsContext = createContext<JobsContextType>({
  jobs: [],
  setJobs: () => {},
  loading: true,
  refresh: async () => {},
});

export function JobsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = useCallback(async () => {
    if (user) {
      try {
        setLoading(true);
        const jobsData = await getJobs(user.uid);
        setJobs(jobsData);
      } catch (error) {
        console.error("Fehler beim Laden der Jobs:", error);
      } finally {
        setLoading(false);
      }
    } else {
      setJobs([]);
      setLoading(false);
    }
  }, [user]);

  const refresh = useCallback(async () => {
    await fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return (
    <JobsContext.Provider value={{ jobs, setJobs, loading, refresh }}>
      {children}
    </JobsContext.Provider>
  );
}

export function useJobs() {
  return useContext(JobsContext);
}
