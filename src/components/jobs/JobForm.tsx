"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addJob, updateJob, db, getRecruiter } from "@/lib/firebase/firebase";
import { useAuth } from "@/providers/AuthProvider";
import { doc, getDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { JobFormProps, Job } from "@/lib/types";
import LoadingSpinner from "@/components/layout/LoadingSpinner";
import Button from "@/components/ui/Button";
import Title from "@/components/ui/Title";
import { useJobs } from "@/lib/hooks/hooks";
import { useRecruiters } from "@/providers/RecruitersProvider";

export default function JobForm({ jobId }: JobFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { refresh } = useJobs();
  const { recruiters } = useRecruiters();
  const [loading, setLoading] = useState(false);
  const [loadingJob, setLoadingJob] = useState(!!jobId);
  const [techInput, setTechInput] = useState("");

  const [formData, setFormData] = useState<Partial<Job>>({
    company: "",
    jobTitle: "",
    jobUrl: "",
    applicationDate: new Date().toISOString().split("T")[0],
    status: "Beworben",
    notes: "",
    location: "",
    salary: { min: undefined, max: undefined, currency: "EUR" },
    techStack: [],
    contactPerson: { name: "", email: "", phone: "", position: "" },
    rejectionReason: "",
    recruiterId: "",
    recruiterName: "",
  });

  useEffect(() => {
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
          console.error("Fehler beim Laden des Vermittlers:", error);
        }
      };

      fetchRecruiterName();
    }
  }, []);

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
                "toDate" in jobData.applicationDate
              ) {
                formattedDate = jobData.applicationDate
                  .toDate()
                  .toISOString()
                  .split("T")[0];
              } else if (typeof jobData.applicationDate === "string") {
                formattedDate = jobData.applicationDate;
              } else if (jobData.applicationDate instanceof Date) {
                formattedDate = jobData.applicationDate
                  .toISOString()
                  .split("T")[0];
              }
            }

            const formattedJob = {
              ...jobData,
              applicationDate:
                formattedDate || new Date().toISOString().split("T")[0],
              location: jobData.location || "",
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
            };
            if (jobData.recruiterId) {
              formattedJob.recruiterId = jobData.recruiterId;
              formattedJob.recruiterName = jobData.recruiterName || "";
            }

            setFormData(formattedJob);
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

  const handleNestedChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    parent: "salary" | "contactPerson"
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [name]:
          parent === "salary" && (name === "min" || name === "max")
            ? value === ""
              ? undefined
              : Number(value)
            : value,
      },
    }));
  };

  const handleAddTech = () => {
    if (techInput.trim() === "") return;

    setFormData((prev) => ({
      ...prev,
      techStack: [...(prev.techStack || []), techInput.trim()],
    }));

    setTechInput("");
  };

  const handleRemoveTech = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      techStack: prev.techStack?.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (jobId) {
        await updateJob(jobId, formData);
        toast.success("Bewerbung erfolgreich aktualisiert");
      } else if (user) {
        await addJob(
          user.uid,
          formData as Omit<Job, "id" | "userId" | "createdAt" | "updatedAt">
        );
        toast.success("Bewerbung erfolgreich hinzugefügt");
      }

      await refresh();
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
      <Title
        text={jobId ? "Bewerbung bearbeiten" : "Neue Bewerbung hinzufügen"}
        size="lg"
        className="mb-6"
      />

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
      >
        {/* Hauptsektion */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Allgemeine Informationen
          </h2>

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

          <div className="mb-6 border-t border-gray-200 pt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Vermittler (optional)
            </h2>

            <div className="form-group">
              <label htmlFor="recruiterId" className="form-label">
                Wurde dir diese Stelle von einem Vermittler angeboten?
              </label>
              <select
                id="recruiterId"
                name="recruiterId"
                value={formData.recruiterId || ""}
                onChange={(e) => {
                  const recruiterId = e.target.value;
                  const selectedRecruiter = recruiters.find(
                    (r) => r.id === recruiterId
                  );
                  setFormData((prev) => ({
                    ...prev,
                    recruiterId,
                    recruiterName: selectedRecruiter
                      ? selectedRecruiter.name
                      : "",
                  }));
                }}
                className="input-field"
              >
                <option value="">Keinem Vermittler zugeordnet</option>
                {recruiters.map((recruiter) => (
                  <option key={recruiter.id} value={recruiter.id}>
                    {recruiter.name}{" "}
                    {recruiter.company ? `(${recruiter.company})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-2 text-sm">
              <Link
                href="/recruiters/add"
                className="text-blue-600 hover:underline"
              >
                Neuen Vermittler hinzufügen
              </Link>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="form-group md:col-span-1">
              <label htmlFor="location" className="form-label">
                Ort
              </label>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                className="input-field"
                placeholder="z.B. Berlin oder Remote"
              />
            </div>

            <div className="form-group md:col-span-1">
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
          </div>

          <div className="grid gap-4 md:grid-cols-3">
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
        </div>

        <div className="mb-6 border-t border-gray-200 pt-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Gehaltsdetails
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="form-group md:col-span-1">
              <label htmlFor="min" className="form-label">
                Gehalt von
              </label>
              <input
                id="min"
                name="min"
                type="number"
                value={formData.salary?.min || ""}
                onChange={(e) => handleNestedChange(e, "salary")}
                className="input-field"
                placeholder="z.B. 50000"
                min="0"
              />
            </div>

            <div className="form-group md:col-span-1">
              <label htmlFor="max" className="form-label">
                Gehalt bis
              </label>
              <input
                id="max"
                name="max"
                type="number"
                value={formData.salary?.max || ""}
                onChange={(e) => handleNestedChange(e, "salary")}
                className="input-field"
                placeholder="z.B. 70000"
                min={formData.salary?.min || 0}
              />
            </div>

            <div className="form-group md:col-span-1">
              <label htmlFor="currency" className="form-label">
                Währung
              </label>
              <select
                id="currency"
                name="currency"
                value={formData.salary?.currency || "EUR"}
                onChange={(e) => handleNestedChange(e, "salary")}
                className="input-field"
              >
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="CHF">CHF</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mb-6 border-t border-gray-200 pt-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Ansprechpartner
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="form-group md:col-span-1">
              <label htmlFor="name" className="form-label">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.contactPerson?.name || ""}
                onChange={(e) => handleNestedChange(e, "contactPerson")}
                className="input-field"
                placeholder="Vor- und Nachname"
              />
            </div>

            <div className="form-group md:col-span-1">
              <label htmlFor="position" className="form-label">
                Position
              </label>
              <input
                id="position"
                name="position"
                type="text"
                value={formData.contactPerson?.position || ""}
                onChange={(e) => handleNestedChange(e, "contactPerson")}
                className="input-field"
                placeholder="z.B. HR Manager"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="form-group md:col-span-1">
              <label htmlFor="email" className="form-label">
                E-Mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.contactPerson?.email || ""}
                onChange={(e) => handleNestedChange(e, "contactPerson")}
                className="input-field"
                placeholder="beispiel@firma.de"
              />
            </div>

            <div className="form-group md:col-span-1">
              <label htmlFor="phone" className="form-label">
                Telefon
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.contactPerson?.phone || ""}
                onChange={(e) => handleNestedChange(e, "contactPerson")}
                className="input-field"
                placeholder="+49 123 456789"
              />
            </div>
          </div>
        </div>

        <div className="mb-6 border-t border-gray-200 pt-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Tech Stack</h2>

          <div className="flex space-x-2 mb-3">
            <input
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              className="input-field"
              placeholder="z.B. React, TypeScript, Node.js"
            />
            <Button type="button" variant="secondary" onClick={handleAddTech}>
              Hinzufügen
            </Button>
          </div>

          {formData.techStack && formData.techStack.length > 0 ? (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.techStack.map((tech, index) => (
                <div
                  key={index}
                  className="inline-flex items-center rounded-full bg-blue-100 text-blue-800 px-3 py-1 text-sm"
                >
                  {tech}
                  <button
                    type="button"
                    className="ml-1 text-blue-600 hover:text-blue-800"
                    onClick={() => handleRemoveTech(index)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Noch keine Technologien hinzugefügt.
            </p>
          )}
        </div>

        {formData.status === "Abgelehnt" && (
          <div className="mb-6 border-t border-gray-200 pt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Ablehnungsgrund
            </h2>

            <div className="form-group">
              <textarea
                id="rejectionReason"
                name="rejectionReason"
                value={formData.rejectionReason || ""}
                onChange={handleChange}
                className="input-field min-h-[80px]"
                placeholder="Grund für die Ablehnung (falls bekannt)"
              ></textarea>
            </div>
          </div>
        )}

        <div className="mb-6 border-t border-gray-200 pt-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Notizen</h2>

          <div className="form-group">
            <textarea
              id="notes"
              name="notes"
              value={formData.notes || ""}
              onChange={handleChange}
              className="input-field min-h-[120px]"
              placeholder="Weitere Informationen zur Bewerbung..."
            ></textarea>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Abbrechen
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            {jobId ? "Aktualisieren" : "Hinzufügen"}
          </Button>
        </div>
      </form>
    </div>
  );
}
