"use client";

import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/layout/MuiLoadingSpinner";
import MuiButton from "@/components/ui/Button";
import Title from "@/components/ui/Title";
import { Box, Divider, Typography, IconButton, Chip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import FormTextField from "@/components/ui/FormTextField";
import FormTextAreaField from "@/components/ui/FormTextAreaField";
import FormSelectField from "@/components/ui/FormSelectField";
import { useProfileForm } from "@/hooks/useProfileForm";
import { Language, Education, Experience, Skill } from "@/lib/types";

export default function ProfileForm() {
  const router = useRouter();

  const {
    profile,
    loading,
    saving,
    newSkill,
    setNewSkill,
    newLanguage,
    setNewLanguage,
    newInterest,
    setNewInterest,
    handleChange,
    handlePersonalChange,
    addEducation,
    updateEducation,
    removeEducation,
    addExperience,
    updateExperience,
    removeExperience,
    addSkill,
    removeSkill,
    addLanguage,
    removeLanguage,
    addInterest,
    removeInterest,
    handleSubmit,
  } = useProfileForm();

  if (loading) {
    return <LoadingSpinner message="Profil wird geladen..." />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Title
        text={profile.id ? "Profil bearbeiten" : "Profil erstellen"}
        size="lg"
        className="mb-6"
      />
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Persönliche Daten */}
        <Box className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <Typography
            variant="h6"
            component="h2"
            className="font-semibold mb-4"
          >
            Persönliche Daten
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
            <FormTextField
              label="Vorname"
              name="firstName"
              required
              margin="dense"
              value={profile.personalDetails.firstName || ""}
              onChange={handlePersonalChange}
            />
            <FormTextField
              label="Nachname"
              name="lastName"
              required
              margin="dense"
              value={profile.personalDetails.lastName || ""}
              onChange={handlePersonalChange}
            />
            <FormTextField
              label="E-Mail"
              name="email"
              type="email"
              required
              margin="dense"
              value={profile.personalDetails.email || ""}
              onChange={handlePersonalChange}
            />
            <FormTextField
              label="Telefon"
              name="phone"
              margin="dense"
              value={profile.personalDetails.phone || ""}
              onChange={handlePersonalChange}
            />
            <FormTextField
              label="Adresse"
              name="address"
              margin="dense"
              value={profile.personalDetails.address || ""}
              onChange={handlePersonalChange}
            />
            <FormTextField
              label="Stadt"
              name="city"
              margin="dense"
              value={profile.personalDetails.city || ""}
              onChange={handlePersonalChange}
            />
            <FormTextField
              label="PLZ"
              name="postalCode"
              margin="dense"
              value={profile.personalDetails.postalCode || ""}
              onChange={handlePersonalChange}
            />
            <FormTextField
              label="Land"
              name="country"
              margin="dense"
              value={profile.personalDetails.country || ""}
              onChange={handlePersonalChange}
            />
          </div>
          <Box mt={2}>
            <FormTextAreaField
              label="Zusammenfassung/Profil"
              name="summary"
              margin="dense"
              value={profile.summary || ""}
              onChange={handleChange}
              minRows={3}
              placeholder="Kurze Beschreibung deiner Qualifikationen und Karriereziele"
            />
          </Box>
        </Box>

        {/* Ausbildung */}
        <Box className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6" component="h2" className="font-semibold">
              Ausbildung
            </Typography>
            <MuiButton
              variant="outline"
              size="sm"
              onClick={addEducation}
              startIcon={<AddIcon />}
            >
              Hinzufügen
            </MuiButton>
          </Box>
          {profile.education.length === 0 ? (
            <Typography
              color="textSecondary"
              className="italic text-center my-4"
            >
              Keine Ausbildung hinzugefügt
            </Typography>
          ) : (
            profile.education.map((edu: Education, index: number) => (
              <Box
                key={`edu-${index}`}
                mb={3}
                pb={3}
                borderBottom={
                  index < profile.education.length - 1
                    ? "1px solid #e0e0e0"
                    : undefined
                }
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1}
                >
                  <Typography
                    variant="subtitle1"
                    component="h3"
                    className="font-medium"
                  >
                    Ausbildung {index + 1}
                  </Typography>
                  <IconButton
                    onClick={() => removeEducation(index)}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                  <FormTextField
                    label="Bildungseinrichtung"
                    required
                    margin="dense"
                    value={edu.institution || ""}
                    onChange={(e) =>
                      updateEducation(index, "institution", e.target.value)
                    }
                  />
                  <FormTextField
                    label="Abschluss"
                    required
                    margin="dense"
                    value={edu.degree || ""}
                    onChange={(e) =>
                      updateEducation(index, "degree", e.target.value)
                    }
                  />
                  <FormTextField
                    label="Fachrichtung"
                    required
                    margin="dense"
                    value={edu.field || ""}
                    onChange={(e) =>
                      updateEducation(index, "field", e.target.value)
                    }
                  />
                  <FormTextField
                    label="Ort"
                    margin="dense"
                    value={edu.location || ""}
                    onChange={(e) =>
                      updateEducation(index, "location", e.target.value)
                    }
                  />
                  <FormTextField
                    label="Beginn"
                    type="date"
                    required
                    margin="dense"
                    value={edu.startDate || ""}
                    onChange={(e) =>
                      updateEducation(index, "startDate", e.target.value)
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                  <div className="flex items-center mt-2">
                    <FormTextField
                      label="Ende"
                      type="date"
                      margin="dense"
                      value={edu.endDate || ""}
                      onChange={(e) =>
                        updateEducation(index, "endDate", e.target.value)
                      }
                      InputLabelProps={{ shrink: true }}
                      disabled={edu.ongoing}
                      sx={{ flexGrow: 1 }}
                    />
                    <div className="ml-4 flex items-center pt-2">
                      <input
                        type="checkbox"
                        id={`ongoing-edu-${index}`}
                        checked={!!edu.ongoing}
                        onChange={(e) =>
                          updateEducation(index, "ongoing", e.target.checked)
                        }
                        className="mr-1 h-4 w-4"
                      />
                      <label
                        htmlFor={`ongoing-edu-${index}`}
                        className="text-sm"
                      >
                        Aktuell
                      </label>
                    </div>
                  </div>
                </div>
                <FormTextAreaField
                  label="Beschreibung"
                  margin="dense"
                  minRows={2}
                  value={edu.description || ""}
                  onChange={(e) =>
                    updateEducation(index, "description", e.target.value)
                  }
                  className="mt-2"
                />
              </Box>
            ))
          )}
        </Box>

        {/* Berufserfahrung */}
        <Box className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6" component="h2" className="font-semibold">
              Berufserfahrung
            </Typography>
            <MuiButton
              variant="outline"
              size="sm"
              onClick={addExperience}
              startIcon={<AddIcon />}
            >
              Hinzufügen
            </MuiButton>
          </Box>
          {profile.experience.length === 0 ? (
            <Typography
              color="textSecondary"
              className="italic text-center my-4"
            >
              Keine Berufserfahrung hinzugefügt
            </Typography>
          ) : (
            profile.experience.map((exp: Experience, index: number) => (
              <Box
                key={`exp-${index}`}
                mb={3}
                pb={3}
                borderBottom={
                  index < profile.experience.length - 1
                    ? "1px solid #e0e0e0"
                    : undefined
                }
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1}
                >
                  <Typography
                    variant="subtitle1"
                    component="h3"
                    className="font-medium"
                  >
                    Erfahrung {index + 1}
                  </Typography>
                  <IconButton
                    onClick={() => removeExperience(index)}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                  <FormTextField
                    label="Unternehmen"
                    required
                    margin="dense"
                    value={exp.company || ""}
                    onChange={(e) =>
                      updateExperience(index, "company", e.target.value)
                    }
                  />
                  <FormTextField
                    label="Position"
                    required
                    margin="dense"
                    value={exp.position || ""}
                    onChange={(e) =>
                      updateExperience(index, "position", e.target.value)
                    }
                  />
                  <FormTextField
                    label="Ort"
                    margin="dense"
                    value={exp.location || ""}
                    onChange={(e) =>
                      updateExperience(index, "location", e.target.value)
                    }
                  />
                  <div className="md:col-span-2"></div>
                  <FormTextField
                    label="Beginn"
                    type="date"
                    required
                    margin="dense"
                    value={exp.startDate || ""}
                    onChange={(e) =>
                      updateExperience(index, "startDate", e.target.value)
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                  <div className="flex items-center mt-2">
                    <FormTextField
                      label="Ende"
                      type="date"
                      margin="dense"
                      value={exp.endDate || ""}
                      onChange={(e) =>
                        updateExperience(index, "endDate", e.target.value)
                      }
                      InputLabelProps={{ shrink: true }}
                      disabled={exp.ongoing}
                      sx={{ flexGrow: 1 }}
                    />
                    <div className="ml-4 flex items-center pt-2">
                      <input
                        type="checkbox"
                        id={`ongoing-exp-${index}`}
                        checked={!!exp.ongoing}
                        onChange={(e) =>
                          updateExperience(index, "ongoing", e.target.checked)
                        }
                        className="mr-1 h-4 w-4"
                      />
                      <label
                        htmlFor={`ongoing-exp-${index}`}
                        className="text-sm"
                      >
                        Aktuell
                      </label>
                    </div>
                  </div>
                </div>
                <FormTextAreaField
                  label="Beschreibung/Erfolge"
                  margin="dense"
                  minRows={3}
                  value={exp.description || ""}
                  onChange={(e) =>
                    updateExperience(index, "description", e.target.value)
                  }
                  className="mt-2"
                  placeholder="Beschreibe deine Tätigkeiten und Erfolge (jede Zeile wird ein Stichpunkt im CV)..."
                />
              </Box>
            ))
          )}
        </Box>

        {/* Fähigkeiten */}
        <Box className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <Typography
            variant="h6"
            component="h2"
            className="font-semibold mb-3"
          >
            Fähigkeiten
          </Typography>
          <Box display="flex" gap={1} mb={2}>
            <FormTextField
              label="Neue Fähigkeit"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              margin="dense"
              sx={{ flexGrow: 1 }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill();
                }
              }}
            />
            <MuiButton
              variant="primary"
              size="sm"
              onClick={addSkill}
              disabled={!newSkill.trim()}
              sx={{ height: "fit-content", alignSelf: "center", mt: "8px" }}
            >
              Hinzufügen
            </MuiButton>
          </Box>
          {profile.skills.length === 0 ? (
            <Typography
              color="textSecondary"
              className="italic text-center my-4"
            >
              Keine Fähigkeiten hinzugefügt
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {profile.skills.map((skill: Skill, index: number) => (
                <Chip
                  key={`skill-${index}`}
                  label={skill.name}
                  onDelete={() => removeSkill(index)}
                  size="small"
                />
              ))}
            </Box>
          )}
        </Box>

        {/* Sprachen */}
        <Box className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <Typography
            variant="h6"
            component="h2"
            className="font-semibold mb-3"
          >
            Sprachen
          </Typography>
          <Box display="flex" gap={1} mb={2} alignItems="flex-start">
            <FormTextField
              label="Sprache"
              value={newLanguage.name}
              onChange={(e) =>
                setNewLanguage({ ...newLanguage, name: e.target.value })
              }
              margin="dense"
              sx={{ flexGrow: 1 }}
            />
            <FormSelectField
              label="Niveau"
              value={newLanguage.level}
              onChange={(e) =>
                setNewLanguage({
                  ...newLanguage,
                  level: e.target.value as Language["level"],
                })
              }
              margin="dense"
              sx={{ minWidth: 180 }}
            >
              <option value="A1">A1 - Anfänger</option>{" "}
              <option value="A2">A2 - Grundlegende Kenntnisse</option>{" "}
              <option value="B1">B1 - Fortgeschrittene Kenntnisse</option>{" "}
              <option value="B2">B2 - Selbständige Sprachverwendung</option>{" "}
              <option value="C1">C1 - Fachkundige Sprachkenntnisse</option>{" "}
              <option value="C2">
                C2 - Annähernd muttersprachliche Kenntnisse
              </option>{" "}
              <option value="Muttersprache">Muttersprache</option>
            </FormSelectField>
            <MuiButton
              variant="primary"
              size="sm"
              onClick={addLanguage}
              disabled={!newLanguage.name.trim()}
              sx={{ height: "fit-content", alignSelf: "center", mt: "8px" }}
            >
              Hinzufügen
            </MuiButton>
          </Box>
          {profile.languages.length === 0 ? (
            <Typography
              color="textSecondary"
              className="italic text-center my-4"
            >
              Keine Sprachen hinzugefügt
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {profile.languages.map((language: Language, index: number) => (
                <Chip
                  key={`lang-${index}`}
                  label={`${language.name} (${language.level})`}
                  onDelete={() => removeLanguage(index)}
                  size="small"
                />
              ))}
            </Box>
          )}
        </Box>

        {/* Interessen */}
        <Box className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <Typography
            variant="h6"
            component="h2"
            className="font-semibold mb-3"
          >
            Interessen (Optional)
          </Typography>
          <Box display="flex" gap={1} mb={2}>
            <FormTextField
              label="Neues Interesse"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              margin="dense"
              sx={{ flexGrow: 1 }}
              placeholder="z.B. Fotografie, Wandern..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addInterest();
                }
              }}
            />
            <MuiButton
              variant="primary"
              size="sm"
              onClick={addInterest}
              disabled={!newInterest.trim()}
              sx={{ height: "fit-content", alignSelf: "center", mt: "8px" }}
            >
              Hinzufügen
            </MuiButton>
          </Box>
          {!profile.interests || profile.interests.length === 0 ? (
            <Typography
              color="textSecondary"
              className="italic text-center my-4"
            >
              Keine Interessen hinzugefügt
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {profile.interests.map((interest: string, index: number) => (
                <Chip
                  key={`interest-${index}`}
                  label={interest}
                  onDelete={() => removeInterest(index)}
                  size="small"
                />
              ))}
            </Box>
          )}
        </Box>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <MuiButton
            type="button"
            variant="outline"
            onClick={() => router.push("/profile")}
          >
            Abbrechen
          </MuiButton>
          <MuiButton type="submit" variant="primary" isLoading={saving}>
            {profile.id ? "Profil aktualisieren" : "Profil erstellen"}
          </MuiButton>
        </div>
      </form>
    </div>
  );
}
