import { useState, useEffect, useCallback, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  serverTimestamp,
  Timestamp,
  FieldValue,
} from "firebase/firestore";
import toast from "react-hot-toast";
import { db, addJob, updateJob, getRecruiter } from "@/lib/firebase/firebase";
import { useAuth } from "@/providers/AuthProvider";
import { useJobs } from "@/lib/hooks/hooks";
import { useRecruiters } from "@/providers/RecruitersProvider";
import { Job } from "@/lib/types";

interface UseJobFormReturn {
  formData: Partial<Job>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Job>>>;
  loadingJob: boolean;
  isSubmitting: boolean;
  techInput: string;
  setTechInput: React.Dispatch<React.SetStateAction<string>>;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  handleNestedChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
    parent: "salary" | "contactPerson"
  ) => void;
  handleAddTech: () => void;
  handleRemoveTech: (indexToRemove: number) => void;
  handleSubmit: (e: FormEvent) => Promise<void>;
}

export function useJobForm(jobId?: string): UseJobFormReturn {
  const { user } = useAuth();
  const router = useRouter();
  const { refresh: refreshJobs } = useJobs();
  const { recruiters } = useRecruiters();
  const [loadingJob, setLoadingJob] = useState(!!jobId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [techInput, setTechInput] = useState("");

  const [formData, setFormData] = useState<Partial<Job>>({
    company: "",
    jobTitle: "",
    jobUrl: "",
    applicationDate: new Date().toISOString().split("T")[0],
    status: "Beworben",
    notes: "",
    location: "",
    companyStreet: "",
    companyPostalCode: "",
    companyCity: "",
    salary: { min: undefined, max: undefined, currency: "EUR" },
    techStack: [],
    contactPerson: { name: "", email: "", phone: "", position: "" },
    rejectionReason: "",
    recruiterId: "",
    recruiterName: "",
  });

  // Effekt zum Laden der Recruiter-ID aus URL Parametern
  useEffect(() => {
    if (typeof window !== "undefined" && !jobId) {
      const searchParams = new URLSearchParams(window.location.search);
      const recruiterId = searchParams.get("recruiterId");
      if (recruiterId) {
        const fetchRecruiterName = async () => {
          try {
            const recruiter = await getRecruiter(recruiterId);
            if (recruiter) {
              setFormData((prev) => ({
                ...prev,
                recruiterId,
                recruiterName: recruiter.name,
              }));
            }
          } catch (error) {
            console.error("Fehler beim Laden des Vermittlers (Hook):", error);
          }
        };
        fetchRecruiterName();
      }
    }
  }, [jobId]);

  // Effekt zum Laden der Job-Daten
  useEffect(() => {
    const fetchJob = async () => {
      if (jobId && user) {
        setLoadingJob(true);
        try {
          const jobRef = doc(db, "jobs", jobId);
          const jobSnap = await getDoc(jobRef);
          if (jobSnap.exists()) {
            const jobData = jobSnap.data() as Job;
            if (jobData.userId !== user.uid) {
              toast.error("Zugriff verweigert.");
              router.push("/");
              return;
            }

            let formattedDate = "";
            const appDate = jobData.applicationDate;
            if (appDate) {
              if (
                typeof appDate === "object" &&
                appDate !== null &&
                "toDate" in appDate &&
                typeof (appDate as any).toDate === "function"
              ) {
                formattedDate = (appDate as Timestamp)
                  .toDate()
                  .toISOString()
                  .split("T")[0];
              } else if (appDate instanceof Date) {
                formattedDate = appDate.toISOString().split("T")[0];
              } else if (typeof appDate === "string") {
                if (/^\d{4}-\d{2}-\d{2}$/.test(appDate)) {
                  formattedDate = appDate;
                } else {
                  const parsedDate = new Date(appDate);
                  if (!isNaN(parsedDate.getTime())) {
                    formattedDate = parsedDate.toISOString().split("T")[0];
                  }
                }
              }
            }
            setFormData({
              ...jobData,
              applicationDate:
                formattedDate || new Date().toISOString().split("T")[0],
              location: jobData.location || "",
              companyStreet: jobData.companyStreet || "",
              companyPostalCode: jobData.companyPostalCode || "",
              companyCity: jobData.companyCity || "",
              salary: jobData.salary || {
                min: undefined,
                max: undefined,
                currency: "EUR",
              },
              techStack: jobData.techStack || [],
              contactPerson: jobData.contactPerson || {
                name: "",
                email: "",
                phone: "",
                position: "",
              },
              rejectionReason: jobData.rejectionReason || "",
              recruiterId: jobData.recruiterId || "",
              recruiterName: jobData.recruiterName || "",
            });
          } else {
            toast.error("Bewerbung nicht gefunden.");
            router.push("/");
          }
        } catch (error) {
          console.error("Fehler beim Laden der Bewerbung (Hook):", error);
          toast.error("Fehler beim Laden der Bewerbung.");
        } finally {
          setLoadingJob(false);
        }
      } else {
        setLoadingJob(false);
      }
    };
    fetchJob();
  }, [jobId, user, router]);

  // Handler Funktionen
  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleNestedChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
      parent: "salary" | "contactPerson"
    ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent] as object),
          [name]:
            parent === "salary" && (name === "min" || name === "max")
              ? value === ""
                ? undefined
                : Number(value)
              : value,
        },
      }));
    },
    []
  );

  const handleAddTech = useCallback(() => {
    if (techInput.trim() === "") return;
    const newTechs = techInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t !== "");
    if (newTechs.length === 0) return;
    setFormData((prev) => ({
      ...prev,
      techStack: [...new Set([...(prev.techStack || []), ...newTechs])],
    }));
    setTechInput("");
  }, [techInput]);

  const handleRemoveTech = useCallback((indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      techStack: prev.techStack?.filter((_, index) => index !== indexToRemove),
    }));
  }, []);

  // Submit Funktion
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!user) {
        toast.error("Authentifizierung erforderlich.");
        return;
      }
      setIsSubmitting(true);
      try {
        let finalApplicationDate: Date | FieldValue;
        if (
          formData.applicationDate &&
          typeof formData.applicationDate === "string"
        ) {
          const parsedDate = new Date(formData.applicationDate);
          if (!isNaN(parsedDate.getTime())) {
            finalApplicationDate = parsedDate;
          } else {
            console.warn(
              "Ungültiges Bewerbungsdatum (Hook):",
              formData.applicationDate
            );
            finalApplicationDate = serverTimestamp();
          }
        } else {
          finalApplicationDate = serverTimestamp();
        }

        const dataToSave = {
          ...formData,
          applicationDate: finalApplicationDate,
        };
        if (!dataToSave.recruiterId) {
          delete dataToSave.recruiterName;
        }

        const cleanDataToSave = Object.entries(dataToSave).reduce(
          (acc, [key, value]) => {
            if (value !== undefined) {
              (acc as any)[key] = value;
            }
            return acc;
          },
          {} as Partial<Job> & { applicationDate: Date | FieldValue }
        );

        if (jobId) {
          const { updatedAt, ...updateData } = cleanDataToSave;
          await updateJob(jobId, updateData);
          toast.success("Bewerbung erfolgreich aktualisiert");
        } else {
          await addJob(
            user.uid,
            cleanDataToSave as Omit<
              Job,
              "id" | "userId" | "createdAt" | "updatedAt"
            >
          );
          toast.success("Bewerbung erfolgreich hinzugefügt");
        }
        await refreshJobs();
        router.push("/");
      } catch (error) {
        console.error("Fehler beim Speichern (Hook):", error);
        toast.error("Fehler beim Speichern der Bewerbung");
      } finally {
        setIsSubmitting(false);
      }
    },
    [user, formData, jobId, router, refreshJobs]
  );

  return {
    formData,
    setFormData,
    loadingJob,
    isSubmitting,
    techInput,
    setTechInput,
    handleChange,
    handleNestedChange,
    handleAddTech,
    handleRemoveTech,
    handleSubmit,
  };
}
