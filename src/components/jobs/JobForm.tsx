"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/layout/MuiLoadingSpinner";
import MuiButton from "@/components/ui/Button";
import Title from "@/components/ui/Title";
import FormTextField from "@/components/ui/FormTextField";
import FormTextAreaField from "@/components/ui/FormTextAreaField";
import FormSelectField from "@/components/ui/FormSelectField";
import { useJobForm } from "@/hooks/useJobForm";
import { useRecruiters } from "@/providers/RecruitersProvider";
import { Box, Chip } from "@mui/material";

interface JobFormProps {
  jobId?: string;
}

export default function JobForm({ jobId }: JobFormProps) {
  const router = useRouter();
  const { recruiters } = useRecruiters();

  const {
    formData,
    loadingJob,
    isSubmitting,
    techInput,
    setTechInput,
    handleChange,
    handleNestedChange,
    handleAddTech,
    handleRemoveTech,
    handleSubmit,
  } = useJobForm(jobId);

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
        className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 space-y-6"
      >
        {/* Allgemeine Informationen */}
        <section>
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Allgemeine Informationen
          </h2>
          <div className="grid gap-x-4 gap-y-1 md:grid-cols-2">
            <FormTextField
              label="Unternehmen *"
              name="company"
              required
              margin="dense"
              value={formData.company || ""}
              onChange={handleChange}
              placeholder="Firmenname"
            />
            <FormTextField
              label="Stellenbezeichnung *"
              name="jobTitle"
              required
              margin="dense"
              value={formData.jobTitle || ""}
              onChange={handleChange}
              placeholder="z.B. Frontend Entwickler"
            />
            <FormTextField
              label="Ort"
              name="location"
              margin="dense"
              value={formData.location || ""}
              onChange={handleChange}
              placeholder="z.B. Berlin oder Remote"
            />
            <FormTextField
              label="Straße"
              name="companyStreet"
              margin="dense"
              value={formData.companyStreet || ""}
              onChange={handleChange}
              placeholder="z.B. Musterstraße 42"
            />
            <FormTextField
              label="Postleitzahl"
              name="companyPostalCode"
              margin="dense"
              value={formData.companyPostalCode || ""}
              onChange={handleChange}
              placeholder="z.B. 707070"
            />
            <FormTextField
              label="Stadt"
              name="companyCity"
              margin="dense"
              value={formData.companyCity || ""}
              onChange={handleChange}
              placeholder="z.B. Musterhausen"
            />
            <FormTextField
              label="Stellenanzeige URL"
              name="jobUrl"
              type="url"
              margin="dense"
              value={formData.jobUrl || ""}
              onChange={handleChange}
              placeholder="https://example.com/job"
              className="md:col-span-2"
            />
            <FormTextField
              label="Bewerbungsdatum *"
              name="applicationDate"
              type="date"
              required
              margin="dense"
              value={formData.applicationDate || ""}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
            <FormSelectField
              label="Status *"
              name="status"
              required
              margin="dense"
              value={formData.status || "Beworben"}
              onChange={handleChange}
            >
              <option value="Beworben">Beworben</option>{" "}
              <option value="Interview">Interview</option>{" "}
              <option value="Abgelehnt">Abgelehnt</option>{" "}
              <option value="Angenommen">Angenommen</option>
            </FormSelectField>
          </div>
        </section>

        {/* Vermittler */}
        <section className="border-t border-gray-200 pt-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Vermittler (optional)
          </h2>
          <FormSelectField
            label="Wurde dir diese Stelle von einem Vermittler angeboten?"
            name="recruiterId"
            margin="dense"
            value={formData.recruiterId || ""}
            onChange={handleChange}
          >
            <option value="">Keinem Vermittler zugeordnet</option>
            {recruiters.map((recruiter) => (
              <option key={recruiter.id} value={recruiter.id}>
                {recruiter.name}{" "}
                {recruiter.company ? `(${recruiter.company})` : ""}
              </option>
            ))}
          </FormSelectField>
          <div className="mt-2 text-sm">
            <Link
              href="/recruiters/add"
              className="text-blue-600 hover:underline"
            >
              Neuen Vermittler hinzufügen
            </Link>
          </div>
        </section>

        {/* Gehaltsdetails */}
        <section className="border-t border-gray-200 pt-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Gehaltsdetails
          </h2>
          <div className="grid gap-x-4 gap-y-1 md:grid-cols-3">
            <FormTextField
              label="Gehalt von"
              name="min"
              type="number"
              margin="dense"
              value={formData.salary?.min ?? ""}
              onChange={(e) => handleNestedChange(e, "salary")}
              placeholder="z.B. 50000"
              inputProps={{ min: "0" }}
            />
            <FormTextField
              label="Gehalt bis"
              name="max"
              type="number"
              margin="dense"
              value={formData.salary?.max ?? ""}
              onChange={(e) => handleNestedChange(e, "salary")}
              placeholder="z.B. 70000"
              inputProps={{ min: formData.salary?.min || "0" }}
            />
            <FormSelectField
              label="Währung"
              name="currency"
              margin="dense"
              value={formData.salary?.currency || "EUR"}
              onChange={(e) => handleNestedChange(e, "salary")}
            >
              <option value="EUR">EUR</option> <option value="USD">USD</option>{" "}
              <option value="GBP">GBP</option> <option value="CHF">CHF</option>
            </FormSelectField>
          </div>
        </section>

        {/* Ansprechpartner */}
        <section className="border-t border-gray-200 pt-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Ansprechpartner
          </h2>
          <div className="grid gap-x-4 gap-y-1 md:grid-cols-2">
            <FormTextField
              label="Name"
              name="name"
              margin="dense"
              value={formData.contactPerson?.name || ""}
              onChange={(e) => handleNestedChange(e, "contactPerson")}
              placeholder="Vor- und Nachname"
            />
            <FormTextField
              label="Position"
              name="position"
              margin="dense"
              value={formData.contactPerson?.position || ""}
              onChange={(e) => handleNestedChange(e, "contactPerson")}
              placeholder="z.B. HR Manager"
            />
            <FormTextField
              label="E-Mail"
              name="email"
              type="email"
              margin="dense"
              value={formData.contactPerson?.email || ""}
              onChange={(e) => handleNestedChange(e, "contactPerson")}
              placeholder="beispiel@firma.de"
            />
            <FormTextField
              label="Telefon"
              name="phone"
              type="tel"
              margin="dense"
              value={formData.contactPerson?.phone || ""}
              onChange={(e) => handleNestedChange(e, "contactPerson")}
              placeholder="+49 123 456789"
            />
          </div>
        </section>

        {/* Tech Stack */}
        <section className="border-t border-gray-200 pt-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Tech Stack</h2>
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <FormTextField
              label="Technologien hinzufügen"
              value={techInput}
              margin="dense"
              onChange={(e) => setTechInput(e.target.value)}
              placeholder="z.B. React, TypeScript (Komma-getrennt)"
              sx={{ flexGrow: 1 }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTech();
                }
              }}
            />
            <MuiButton
              type="button"
              variant="secondary"
              onClick={handleAddTech}
              sx={{ height: "fit-content", alignSelf: "center", mt: "8px" }}
            >
              Hinzufügen
            </MuiButton>
          </Box>
          {formData.techStack && formData.techStack.length > 0 ? (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {formData.techStack.map((tech, index) => (
                <Chip
                  key={index}
                  label={tech}
                  onDelete={() => handleRemoveTech(index)}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          ) : (
            <p className="text-sm text-gray-500">
              Noch keine Technologien hinzugefügt.
            </p>
          )}
        </section>

        {/* Ablehnungsgrund (konditional) */}
        {formData.status === "Abgelehnt" && (
          <section className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Ablehnungsgrund
            </h2>
            <FormTextAreaField
              label="Ablehnungsgrund"
              name="rejectionReason"
              minRows={3}
              value={formData.rejectionReason || ""}
              onChange={handleChange}
              placeholder="Grund für die Ablehnung (falls bekannt)"
            />
          </section>
        )}

        {/* Notizen */}
        <section className="border-t border-gray-200 pt-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Notizen</h2>
          <FormTextAreaField
            label="Notizen"
            name="notes"
            minRows={4}
            value={formData.notes || ""}
            onChange={handleChange}
            placeholder="Weitere Informationen zur Bewerbung..."
          />
        </section>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
          <MuiButton
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Abbrechen
          </MuiButton>
          <MuiButton type="submit" variant="primary" isLoading={isSubmitting}>
            {jobId ? "Aktualisieren" : "Hinzufügen"}
          </MuiButton>
        </div>
      </form>
    </div>
  );
}
