"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/providers/AuthProvider";
import {
  createUserProfile,
  updateUserProfile,
  getUserProfile,
} from "@/lib/firebase/firebase";
import MuiButton from "@/components/ui/Button";
import Title from "@/components/ui/Title";
import LoadingSpinner from "@/components/layout/MuiLoadingSpinner";
import {
  UserProfile,
  Education,
  Experience,
  Skill,
  Language,
  Certificate,
} from "@/lib/types";
import { Box, Divider, Typography, TextField, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

const emptyProfile: UserProfile = {
  userId: "",
  personalDetails: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Deutschland",
  },
  summary: "",
  education: [],
  experience: [],
  skills: [],
  languages: [],
  certificates: [],
  interests: [],
};

export default function ProfileForm() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [newLanguage, setNewLanguage] = useState({
    name: "",
    level: "B2" as Language["level"],
  });
  const [newInterest, setNewInterest] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userProfile = await getUserProfile(user.uid);
        if (userProfile) {
          setProfile(userProfile);
        } else {
          setProfile({ ...emptyProfile, userId: user.uid });
        }
      } catch (error) {
        console.error("Fehler beim Laden des Profils:", error);
        toast.error("Profil konnte nicht geladen werden");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handlePersonalChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      personalDetails: {
        ...prev.personalDetails,
        [name]: value,
      },
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addEducation = () => {
    const newEducation: Education = {
      institution: "",
      degree: "",
      field: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      location: "",
      description: "",
      ongoing: false,
    };

    setProfile((prev) => ({
      ...prev,
      education: [...prev.education, newEducation],
    }));
  };

  const updateEducation = (
    index: number,
    field: keyof Education,
    value: any
  ) => {
    setProfile((prev) => {
      const updatedEducation = [...prev.education];
      updatedEducation[index] = {
        ...updatedEducation[index],
        [field]: value,
      };

      if (field === "ongoing" && value === true) {
        updatedEducation[index].endDate = "";
      }

      return {
        ...prev,
        education: updatedEducation,
      };
    });
  };

  const removeEducation = (index: number) => {
    setProfile((prev) => {
      const updatedEducation = [...prev.education];
      updatedEducation.splice(index, 1);
      return {
        ...prev,
        education: updatedEducation,
      };
    });
  };

  const addExperience = () => {
    const newExperience: Experience = {
      company: "",
      position: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      location: "",
      description: "",
      highlights: [],
      ongoing: false,
    };

    setProfile((prev) => ({
      ...prev,
      experience: [...prev.experience, newExperience],
    }));
  };

  const updateExperience = (
    index: number,
    field: keyof Experience,
    value: any
  ) => {
    setProfile((prev) => {
      const updatedExperience = [...prev.experience];
      updatedExperience[index] = {
        ...updatedExperience[index],
        [field]: value,
      };

      if (field === "ongoing" && value === true) {
        updatedExperience[index].endDate = "";
      }

      return {
        ...prev,
        experience: updatedExperience,
      };
    });
  };

  const removeExperience = (index: number) => {
    setProfile((prev) => {
      const updatedExperience = [...prev.experience];
      updatedExperience.splice(index, 1);
      return {
        ...prev,
        experience: updatedExperience,
      };
    });
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;

    const skill: Skill = {
      name: newSkill,
      level: "Gut",
      category: "Technical",
    };

    setProfile((prev) => ({
      ...prev,
      skills: [...prev.skills, skill],
    }));

    setNewSkill("");
  };

  const removeSkill = (index: number) => {
    setProfile((prev) => {
      const updatedSkills = [...prev.skills];
      updatedSkills.splice(index, 1);
      return {
        ...prev,
        skills: updatedSkills,
      };
    });
  };

  const addLanguage = () => {
    if (!newLanguage.name.trim()) return;

    setProfile((prev) => ({
      ...prev,
      languages: [...prev.languages, newLanguage],
    }));

    setNewLanguage({ name: "", level: "B2" });
  };

  const removeLanguage = (index: number) => {
    setProfile((prev) => {
      const updatedLanguages = [...prev.languages];
      updatedLanguages.splice(index, 1);
      return {
        ...prev,
        languages: updatedLanguages,
      };
    });
  };

  const addInterest = () => {
    if (!newInterest.trim()) return;

    setProfile((prev) => ({
      ...prev,
      interests: [...(prev.interests || []), newInterest],
    }));

    setNewInterest("");
  };

  const removeInterest = (index: number) => {
    setProfile((prev) => {
      const updatedInterests = [...(prev.interests || [])];
      updatedInterests.splice(index, 1);
      return {
        ...prev,
        interests: updatedInterests,
      };
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Du musst eingeloggt sein, um dein Profil zu speichern");
      return;
    }

    setSaving(true);

    try {
      if (profile.id) {
        await updateUserProfile(profile.id, profile);
        toast.success("Profil erfolgreich aktualisiert");
      } else {
        await createUserProfile(user.uid, profile);
        toast.success("Profil erfolgreich erstellt");
      }

      router.push("/profile");
    } catch (error) {
      console.error("Fehler beim Speichern des Profils:", error);
      toast.error("Profil konnte nicht gespeichert werden");
    } finally {
      setSaving(false);
    }
  };

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
            variant="h2"
            component="h2"
            className="text-xl font-semibold mb-4"
          >
            Persönliche Daten
          </Typography>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label="Vorname"
              name="firstName"
              value={profile.personalDetails.firstName}
              onChange={handlePersonalChange}
              fullWidth
              required
            />
            <TextField
              label="Nachname"
              name="lastName"
              value={profile.personalDetails.lastName}
              onChange={handlePersonalChange}
              fullWidth
              required
            />
            <TextField
              label="E-Mail"
              name="email"
              type="email"
              value={profile.personalDetails.email}
              onChange={handlePersonalChange}
              fullWidth
              required
            />
            <TextField
              label="Telefon"
              name="phone"
              value={profile.personalDetails.phone}
              onChange={handlePersonalChange}
              fullWidth
            />
            <TextField
              label="Adresse"
              name="address"
              value={profile.personalDetails.address}
              onChange={handlePersonalChange}
              fullWidth
            />
            <TextField
              label="Stadt"
              name="city"
              value={profile.personalDetails.city}
              onChange={handlePersonalChange}
              fullWidth
            />
            <TextField
              label="PLZ"
              name="postalCode"
              value={profile.personalDetails.postalCode}
              onChange={handlePersonalChange}
              fullWidth
            />
            <TextField
              label="Land"
              name="country"
              value={profile.personalDetails.country}
              onChange={handlePersonalChange}
              fullWidth
            />
          </div>

          <Box mt={4}>
            <TextField
              label="Zusammenfassung/Profil"
              name="summary"
              value={profile.summary}
              onChange={handleChange}
              fullWidth
              multiline
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
            <Typography
              variant="h2"
              component="h2"
              className="text-xl font-semibold"
            >
              Ausbildung
            </Typography>
            <MuiButton
              variant="outline"
              size="sm"
              onClick={addEducation}
              startIcon={<AddIcon />}
            >
              Ausbildung hinzufügen
            </MuiButton>
          </Box>

          {profile.education.length === 0 ? (
            <Typography
              color="textSecondary"
              className="italic text-center my-4"
            >
              Noch keine Ausbildung hinzugefügt
            </Typography>
          ) : (
            profile.education.map((edu, index) => (
              <Box
                key={index}
                mb={4}
                pb={4}
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
                  mb={2}
                >
                  <Typography variant="h6" component="h3">
                    Ausbildung {index + 1}
                  </Typography>
                  <IconButton
                    onClick={() => removeEducation(index)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField
                    label="Bildungseinrichtung"
                    value={edu.institution}
                    onChange={(e) =>
                      updateEducation(index, "institution", e.target.value)
                    }
                    fullWidth
                    required
                  />
                  <TextField
                    label="Abschluss"
                    value={edu.degree}
                    onChange={(e) =>
                      updateEducation(index, "degree", e.target.value)
                    }
                    fullWidth
                    required
                  />
                  <TextField
                    label="Fachrichtung"
                    value={edu.field}
                    onChange={(e) =>
                      updateEducation(index, "field", e.target.value)
                    }
                    fullWidth
                    required
                  />
                  <TextField
                    label="Ort"
                    value={edu.location}
                    onChange={(e) =>
                      updateEducation(index, "location", e.target.value)
                    }
                    fullWidth
                  />
                  <TextField
                    label="Beginn"
                    type="date"
                    value={
                      typeof edu.startDate === "string"
                        ? edu.startDate.split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      updateEducation(index, "startDate", e.target.value)
                    }
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                  <div className="flex items-center">
                    <TextField
                      label="Ende"
                      type="date"
                      value={
                        edu.endDate
                          ? typeof edu.endDate === "string"
                            ? edu.endDate.split("T")[0]
                            : ""
                          : ""
                      }
                      onChange={(e) =>
                        updateEducation(index, "endDate", e.target.value)
                      }
                      fullWidth
                      disabled={edu.ongoing}
                      InputLabelProps={{ shrink: true }}
                    />
                    <div className="ml-4 flex items-center">
                      <input
                        type="checkbox"
                        id={`ongoing-edu-${index}`}
                        checked={edu.ongoing}
                        onChange={(e) =>
                          updateEducation(index, "ongoing", e.target.checked)
                        }
                        className="mr-2"
                      />
                      <label htmlFor={`ongoing-edu-${index}`}>Aktuell</label>
                    </div>
                  </div>
                </div>
                <TextField
                  label="Beschreibung"
                  value={edu.description}
                  onChange={(e) =>
                    updateEducation(index, "description", e.target.value)
                  }
                  fullWidth
                  multiline
                  minRows={2}
                  className="mt-4"
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
            <Typography
              variant="h2"
              component="h2"
              className="text-xl font-semibold"
            >
              Berufserfahrung
            </Typography>
            <MuiButton
              variant="outline"
              size="sm"
              onClick={addExperience}
              startIcon={<AddIcon />}
            >
              Erfahrung hinzufügen
            </MuiButton>
          </Box>

          {profile.experience.length === 0 ? (
            <Typography
              color="textSecondary"
              className="italic text-center my-4"
            >
              Noch keine Berufserfahrung hinzugefügt
            </Typography>
          ) : (
            profile.experience.map((exp, index) => (
              <Box
                key={index}
                mb={4}
                pb={4}
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
                  mb={2}
                >
                  <Typography variant="h6" component="h3">
                    Berufserfahrung {index + 1}
                  </Typography>
                  <IconButton
                    onClick={() => removeExperience(index)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField
                    label="Unternehmen"
                    value={exp.company}
                    onChange={(e) =>
                      updateExperience(index, "company", e.target.value)
                    }
                    fullWidth
                    required
                  />
                  <TextField
                    label="Position"
                    value={exp.position}
                    onChange={(e) =>
                      updateExperience(index, "position", e.target.value)
                    }
                    fullWidth
                    required
                  />
                  <TextField
                    label="Ort"
                    value={exp.location}
                    onChange={(e) =>
                      updateExperience(index, "location", e.target.value)
                    }
                    fullWidth
                  />
                  <div className="col-span-2"></div>
                  <TextField
                    label="Beginn"
                    type="date"
                    value={
                      typeof exp.startDate === "string"
                        ? exp.startDate.split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      updateExperience(index, "startDate", e.target.value)
                    }
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                  <div className="flex items-center">
                    <TextField
                      label="Ende"
                      type="date"
                      value={
                        exp.endDate
                          ? typeof exp.endDate === "string"
                            ? exp.endDate.split("T")[0]
                            : ""
                          : ""
                      }
                      onChange={(e) =>
                        updateExperience(index, "endDate", e.target.value)
                      }
                      fullWidth
                      disabled={exp.ongoing}
                      InputLabelProps={{ shrink: true }}
                    />
                    <div className="ml-4 flex items-center">
                      <input
                        type="checkbox"
                        id={`ongoing-exp-${index}`}
                        checked={exp.ongoing}
                        onChange={(e) =>
                          updateExperience(index, "ongoing", e.target.checked)
                        }
                        className="mr-2"
                      />
                      <label htmlFor={`ongoing-exp-${index}`}>Aktuell</label>
                    </div>
                  </div>
                </div>
                <TextField
                  label="Beschreibung"
                  value={exp.description}
                  onChange={(e) =>
                    updateExperience(index, "description", e.target.value)
                  }
                  fullWidth
                  multiline
                  minRows={3}
                  className="mt-4"
                  placeholder="Beschreibe deine Tätigkeiten und Erfolge..."
                />
              </Box>
            ))
          )}
        </Box>

        {/* Fähigkeiten */}
        <Box className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <Typography
            variant="h2"
            component="h2"
            className="text-xl font-semibold mb-4"
          >
            Fähigkeiten
          </Typography>

          <Box display="flex" gap={2} mb={4}>
            <TextField
              label="Neue Fähigkeit"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              fullWidth
              placeholder="z.B. React, TypeScript, Projektmanagement..."
            />
            <MuiButton
              variant="primary"
              size="sm"
              onClick={addSkill}
              disabled={!newSkill.trim()}
            >
              Hinzufügen
            </MuiButton>
          </Box>

          {profile.skills.length === 0 ? (
            <Typography
              color="textSecondary"
              className="italic text-center my-4"
            >
              Noch keine Fähigkeiten hinzugefügt
            </Typography>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
                <div
                  key={index}
                  className="bg-blue-50 border border-blue-200 rounded-full px-3 py-1 flex items-center"
                >
                  <span>{skill.name}</span>
                  <IconButton
                    size="small"
                    onClick={() => removeSkill(index)}
                    className="ml-1 text-red-500"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </div>
              ))}
            </div>
          )}
        </Box>

        {/* Sprachen */}
        <Box className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <Typography
            variant="h2"
            component="h2"
            className="text-xl font-semibold mb-4"
          >
            Sprachen
          </Typography>

          <Box display="flex" gap={2} mb={4}>
            <TextField
              label="Sprache"
              value={newLanguage.name}
              onChange={(e) =>
                setNewLanguage({ ...newLanguage, name: e.target.value })
              }
              fullWidth
            />
            <TextField
              select
              label="Niveau"
              value={newLanguage.level}
              onChange={(e) =>
                setNewLanguage({
                  ...newLanguage,
                  level: e.target.value as Language["level"],
                })
              }
              fullWidth
              SelectProps={{ native: true }}
            >
              <option value="A1">A1 - Anfänger</option>
              <option value="A2">A2 - Grundlegende Kenntnisse</option>
              <option value="B1">B1 - Fortgeschrittene Kenntnisse</option>
              <option value="B2">B2 - Selbständige Sprachverwendung</option>
              <option value="C1">C1 - Fachkundige Sprachkenntnisse</option>
              <option value="C2">
                C2 - Annähernd muttersprachliche Kenntnisse
              </option>
              <option value="Muttersprache">Muttersprache</option>
            </TextField>
            <MuiButton
              variant="primary"
              size="sm"
              onClick={addLanguage}
              disabled={!newLanguage.name.trim()}
            >
              Hinzufügen
            </MuiButton>
          </Box>

          {profile.languages.length === 0 ? (
            <Typography
              color="textSecondary"
              className="italic text-center my-4"
            >
              Noch keine Sprachen hinzugefügt
            </Typography>
          ) : (
            <div className="space-y-2">
              {profile.languages.map((language, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-gray-50 p-2 rounded"
                >
                  <div>
                    <span className="font-medium">{language.name}</span>
                    <span className="ml-2 text-gray-600">
                      ({language.level})
                    </span>
                  </div>
                  <IconButton
                    size="small"
                    onClick={() => removeLanguage(index)}
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </div>
              ))}
            </div>
          )}
        </Box>

        {/* Interessen */}
        <Box className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <Typography
            variant="h2"
            component="h2"
            className="text-xl font-semibold mb-4"
          >
            Interessen
          </Typography>

          <Box display="flex" gap={2} mb={4}>
            <TextField
              label="Neues Interesse"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              fullWidth
              placeholder="z.B. Fotografie, Reisen, Kochen..."
            />
            <MuiButton
              variant="primary"
              size="sm"
              onClick={addInterest}
              disabled={!newInterest.trim()}
            >
              Hinzufügen
            </MuiButton>
          </Box>

          {!profile.interests || profile.interests.length === 0 ? (
            <Typography
              color="textSecondary"
              className="italic text-center my-4"
            >
              Noch keine Interessen hinzugefügt
            </Typography>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest, index) => (
                <div
                  key={index}
                  className="bg-gray-50 border border-gray-200 rounded-full px-3 py-1 flex items-center"
                >
                  <span>{interest}</span>
                  <IconButton
                    size="small"
                    onClick={() => removeInterest(index)}
                    className="ml-1 text-red-500"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </div>
              ))}
            </div>
          )}
        </Box>

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
