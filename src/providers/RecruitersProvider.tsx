"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react";
import { getRecruiters } from "@/lib/firebase/firebase";
import { useAuth } from "@/providers/AuthProvider";
import { Recruiter, RecruitersContextType } from "@/lib/types";

const RecruitersContext = createContext<RecruitersContextType>({
  recruiters: [],
  setRecruiters: () => {},
  loading: true,
  refresh: async () => {},
});

export function RecruitersProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecruiters = useCallback(async () => {
    if (user) {
      try {
        setLoading(true);
        const recruitersData = await getRecruiters(user.uid);
        setRecruiters(recruitersData);
      } catch (error) {
        console.error("Fehler beim Laden der Vermittler:", error);
      } finally {
        setLoading(false);
      }
    } else {
      setRecruiters([]);
      setLoading(false);
    }
  }, [user]);

  const refresh = useCallback(async () => {
    await fetchRecruiters();
  }, [fetchRecruiters]);

  useEffect(() => {
    fetchRecruiters();
  }, [fetchRecruiters]);

  return (
    <RecruitersContext.Provider
      value={{ recruiters, setRecruiters, loading, refresh }}
    >
      {children}
    </RecruitersContext.Provider>
  );
}

export function useRecruiters() {
  return useContext(RecruitersContext);
}
