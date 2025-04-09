"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { addRecruiter, updateRecruiter, db } from "@/lib/firebase/firebase";
import { useAuth } from "@/providers/AuthProvider";
import { doc, getDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { RecruiterFormProps, Recruiter } from "@/lib/types";
import LoadingSpinner from "@/components/layout/LoadingSpinner";
import Button from "@/components/ui/Button";
import Title from "@/components/ui/Title";
import { useRecruiters } from "@/providers/RecruitersProvider";

export default function RecruiterForm({ recruiterId }: RecruiterFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { refresh } = useRecruiters();
  const [loading, setLoading] = useState(false);
  const [loadingRecruiter, setLoadingRecruiter] = useState(!!recruiterId);

  const [formData, setFormData] = useState<Partial<Recruiter>>({
    name: "",
    company: "",
    notes: "",
  });

  useEffect(() => {
    const fetchRecruiter = async () => {
      if (recruiterId && user) {
        try {
          const recruiterRef = doc(db, "recruiters", recruiterId);
          const recruiterSnap = await getDoc(recruiterRef);

          if (recruiterSnap.exists()) {
            const recruiterData = recruiterSnap.data() as Recruiter;

            if (recruiterData.userId !== user.uid) {
              toast.error("Du hast keinen Zugriff auf diesen Vermittler");
              router.push("/recruiters");
              return;
            }

            setFormData(recruiterData);
          } else {
            toast.error("Vermittler nicht gefunden");
            router.push("/recruiters");
          }
        } catch (error) {
          console.error("Fehler beim Laden des Vermittlers:", error);
          toast.error("Fehler beim Laden des Vermittlers");
        } finally {
          setLoadingRecruiter(false);
        }
      }
    };

    fetchRecruiter();
  }, [recruiterId, user, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (recruiterId) {
        await updateRecruiter(recruiterId, formData);
        toast.success("Vermittler erfolgreich aktualisiert");
      } else if (user) {
        await addRecruiter(
          user.uid,
          formData as Omit<
            Recruiter,
            "id" | "userId" | "createdAt" | "updatedAt"
          >
        );
        toast.success("Vermittler erfolgreich hinzugefügt");
      }

      await refresh();
      router.push("/recruiters");
    } catch (error) {
      console.error("Fehler beim Speichern des Vermittlers:", error);
      toast.error("Fehler beim Speichern des Vermittlers");
    } finally {
      setLoading(false);
    }
  };

  if (loadingRecruiter) {
    return <LoadingSpinner message="Vermittler wird geladen..." />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Title
        text={
          recruiterId ? "Vermittler bearbeiten" : "Neuen Vermittler hinzufügen"
        }
        size="lg"
        className="mb-6"
      />

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
      >
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Allgemeine Informationen
          </h2>

          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Name des Vermittlers *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="input-field"
              placeholder="Vor- und Nachname"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="company" className="form-label">
              Unternehmen
            </label>
            <input
              id="company"
              name="company"
              type="text"
              value={formData.company}
              onChange={handleChange}
              className="input-field"
              placeholder="Firma des Vermittlers (optional)"
            />
          </div>
        </div>

        <div className="mb-6 border-t border-gray-200 pt-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Notizen</h2>

          <div className="form-group">
            <textarea
              id="notes"
              name="notes"
              value={formData.notes || ""}
              onChange={handleChange}
              className="input-field min-h-[120px]"
              placeholder="Weitere Informationen zum Vermittler..."
            ></textarea>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Abbrechen
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            {recruiterId ? "Aktualisieren" : "Hinzufügen"}
          </Button>
        </div>
      </form>
    </div>
  );
}
