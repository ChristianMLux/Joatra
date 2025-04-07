'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { getJobs } from '../firebase/firebase';
import { useAuth } from '@/providers/AuthProvider';
import { Job, JobsContextType } from '../types';

const JobsContext = createContext<JobsContextType>({
  jobs: [],
  setJobs: () => {},
  loading: true,
});

export function JobsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      if (user) {
        try {
          const jobsData = await getJobs(user.uid);
          setJobs(jobsData);
        } catch (error) {
          console.error('Fehler beim Laden der Jobs:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setJobs([]);
        setLoading(false);
      }
    }

    fetchJobs();
  }, [user]);

  return (
    <JobsContext.Provider value={{ jobs, setJobs, loading }}>
      {children}
    </JobsContext.Provider>
  );
}

export function useJobs() {
  return useContext(JobsContext);
}