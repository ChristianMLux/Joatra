"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { addJob, updateJob, db } from "@/lib/firebase/firebase";
import { useAuth } from "@/providers/AuthProvider";
import { doc, getDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { JobFormProps, Job } from "@/lib/types";
import LoadingSpinner from "@/components/layout/LoadingSpinner";

export default function JobForm({ jobId }: JobFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingJob, setLoadingJob] = useState(!!jobId);
  const [formData, setFormData] = useState<
    Omit<Job, "id" | "userId" | "createdAt" | "updatedAt">
  >({
    company: "",
    jobTitle: "",
    jobUrl: "",
    applicationDate: new Date().toISOString().split("T")[0],
    status: "Beworben",
    notes: "",
  });

  useEffect(() => {
    const fetchJob = async () => {
      if (jobId && user) {
        try {
          const jobRef = doc(db, "jobs", jobId);
          const jobSnap = await getDoc(jobRef);

          if (jobSnap.exists()) {
            const jobData = jobSnap.data() as Job;

            if (jobData.userId !== user.uid) {
              toast.error("Du hast keinen Zugriff auf diese Bewerbung");
              router.push("/");
              return;
            }

            let formattedDate = "";
            if (jobData.applicationDate) {
              if (
                typeof jobData.applicationDate === "object" &&
                jobData.applicationDate !== null
              ) {
                if ("toDate" in jobData.applicationDate) {
                  formattedDate = jobData.applicationDate
                    .toDate()
                    .toISOString()
                    .split("T")[0];
                } else if (jobData.applicationDate instanceof Date) {
                  formattedDate = jobData.applicationDate
                    .toISOString()
                    .split("T")[0];
                }
              } else if (typeof jobData.applicationDate === "string") {
                formattedDate = jobData.applicationDate;
              }
            }

            setFormData({
              company: jobData.company,
              jobTitle: jobData.jobTitle,
              jobUrl: jobData.jobUrl || "",
              applicationDate:
                formattedDate || new Date().toISOString().split("T")[0],
              status: jobData.status,
              notes: jobData.notes || "",
            });
          } else {
            toast.error("Bewerbung nicht gefunden");
            router.push("/");
          }
        } catch (error) {
          console.error("Fehler beim Laden der Bewerbung:", error);
          toast.error("Fehler beim Laden der Bewerbung");
        } finally {
          setLoadingJob(false);
        }
      }
    };

    fetchJob();
  }, [jobId, user, router]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (jobId) {
        await updateJob(jobId, formData);
        toast.success("Bewerbung erfolgreich aktualisiert");
      } else if (user) {
        await addJob(user.uid, formData);
        toast.success("Bewerbung erfolgreich hinzugefügt");
      }

      router.push("/");
    } catch (error) {
      console.error("Fehler beim Speichern der Bewerbung:", error);
      toast.error("Fehler beim Speichern der Bewerbung");
    } finally {
      setLoading(false);
    }
  };

  if (loadingJob) {
    return <LoadingSpinner message="Bewerbung wird geladen..." />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {jobId ? "Bewerbung bearbeiten" : "Neue Bewerbung hinzufügen"}
      </h1>

      <form onSubmit={handleSubmit} className="card">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="form-group md:col-span-1">
            <label htmlFor="company" className="form-label">
              Unternehmen *
            </label>
            <input
              id="company"
              name="company"
              type="text"
              value={formData.company}
              onChange={handleChange}
              className="input-field"
              placeholder="Firmenname"
              required
            />
          </div>

          <div className="form-group md:col-span-1">
            <label htmlFor="jobTitle" className="form-label">
              Stellenbezeichnung *
            </label>
            <input
              id="jobTitle"
              name="jobTitle"
              type="text"
              value={formData.jobTitle}
              onChange={handleChange}
              className="input-field"
              placeholder="z.B. Frontend Entwickler"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="jobUrl" className="form-label">
            Stellenanzeige URL
          </label>
          <input
            id="jobUrl"
            name="jobUrl"
            type="url"
            value={formData.jobUrl}
            onChange={handleChange}
            className="input-field"
            placeholder="https://example.com/job"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="form-group md:col-span-1">
            <label htmlFor="applicationDate" className="form-label">
              Bewerbungsdatum *
            </label>
            <input
              id="applicationDate"
              name="applicationDate"
              type="date"
              value={
                typeof formData.applicationDate === "string"
                  ? formData.applicationDate
                  : ""
              }
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <div className="form-group md:col-span-1">
            <label htmlFor="status" className="form-label">
              Status *
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="Beworben">Beworben</option>
              <option value="Interview">Interview</option>
              <option value="Abgelehnt">Abgelehnt</option>
              <option value="Angenommen">Angenommen</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="notes" className="form-label">
            Notizen
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="input-field min-h-[100px]"
            placeholder="Weitere Informationen zur Bewerbung..."
          ></textarea>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
          >
            Abbrechen
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading
              ? "Wird gespeichert..."
              : jobId
                ? "Aktualisieren"
                : "Hinzufügen"}
          </button>
        </div>
      </form>
    </div>
  );
}
