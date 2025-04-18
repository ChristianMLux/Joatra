import { useState, useEffect, useCallback, FormEvent } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/providers/AuthProvider";
import {
  createUserProfile,
  updateUserProfile,
  getUserProfile,
} from "@/lib/firebase/firebase";
import {
  UserProfile,
  Education,
  Experience,
  Skill,
  Language,
} from "@/lib/types";

const toInputDateString = (dateInput: any): string => {
  if (!dateInput) return "";
  try {
    let dateObj: Date | null = null;
    if (dateInput instanceof Date) {
      dateObj = dateInput;
    } else if (
      typeof dateInput === "object" &&
      dateInput !== null &&
      "toDate" in dateInput &&
      typeof dateInput.toDate === "function"
    ) {
      dateObj = dateInput.toDate();
    } else if (typeof dateInput === "string" || typeof dateInput === "number") {
      if (
        typeof dateInput === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(dateInput)
      ) {
        return dateInput;
      }
      const parsed = new Date(dateInput);
      if (!isNaN(parsed.getTime())) {
        if (typeof dateInput === "string" && parsed.getFullYear() < 1900) {
        } else {
          dateObj = parsed;
        }
      }
    }
    if (dateObj && !isNaN(dateObj.getTime())) {
      const year = dateObj.getFullYear();
      const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
      const day = dateObj.getDate().toString().padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
  } catch (error) {
    console.error(
      "Error converting date to YYYY-MM-DD string:",
      dateInput,
      error
    );
  }
  return "";
};

const fromInputDateString = (
  dateString: string | undefined | null
): Date | null => {
  if (
    !dateString ||
    typeof dateString !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(dateString)
  ) {
    return null;
  }
  try {
    const date = new Date(`${dateString}T00:00:00`);
    if (!isNaN(date.getTime())) {
      return date;
    }
  } catch (error) {
    console.error(
      "Error converting YYYY-MM-DD string to Date:",
      dateString,
      error
    );
  }
  return null;
};

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

interface UseProfileFormReturn {
  profile: UserProfile;
  loading: boolean;
  saving: boolean;
  newSkill: string;
  setNewSkill: React.Dispatch<React.SetStateAction<string>>;
  newLanguage: { name: string; level: Language["level"] };
  setNewLanguage: React.Dispatch<
    React.SetStateAction<{ name: string; level: Language["level"] }>
  >;
  newInterest: string;
  setNewInterest: React.Dispatch<React.SetStateAction<string>>;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handlePersonalChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  addEducation: () => void;
  updateEducation: (index: number, field: keyof Education, value: any) => void;
  removeEducation: (index: number) => void;
  addExperience: () => void;
  updateExperience: (
    index: number,
    field: keyof Experience,
    value: any
  ) => void;
  removeExperience: (index: number) => void;
  addSkill: () => void;
  removeSkill: (index: number) => void;
  addLanguage: () => void;
  removeLanguage: (index: number) => void;
  addInterest: () => void;
  removeInterest: (index: number) => void;
  handleSubmit: (e: FormEvent) => Promise<void>;
}

export function useProfileForm(): UseProfileFormReturn {
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

  // Effekt zum Laden des Profils
  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      if (!user) {
        setLoading(false);
        setProfile(emptyProfile);
        return;
      }
      setLoading(true);
      try {
        const userProfileData = await getUserProfile(user.uid);
        if (isMounted) {
          if (userProfileData) {
            const educationWithStringDates = (
              userProfileData.education || []
            ).map((edu) => ({
              ...edu,
              startDate: toInputDateString(edu.startDate),
              endDate: toInputDateString(edu.endDate),
            }));
            const experienceWithStringDates = (
              userProfileData.experience || []
            ).map((exp) => ({
              ...exp,
              startDate: toInputDateString(exp.startDate),
              endDate: toInputDateString(exp.endDate),
            }));
            setProfile({
              ...emptyProfile,
              ...userProfileData,
              userId: user.uid,
              education: educationWithStringDates,
              experience: experienceWithStringDates,
              skills: userProfileData.skills || [],
              languages: userProfileData.languages || [],
              certificates: userProfileData.certificates || [],
              interests: userProfileData.interests || [],
              personalDetails: {
                ...(userProfileData.personalDetails ||
                  emptyProfile.personalDetails),
                email:
                  userProfileData.personalDetails?.email || user.email || "",
              },
            });
          } else {
            setProfile({
              ...emptyProfile,
              userId: user.uid,
              personalDetails: {
                ...emptyProfile.personalDetails,
                email: user.email || "",
              },
            });
          }
        }
      } catch (error) {
        console.error("Fehler beim Laden des Profils (Hook):", error);
        toast.error("Profil konnte nicht geladen werden");
        if (isMounted) setProfile({ ...emptyProfile, userId: user.uid });
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Handler
  const handlePersonalChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setProfile((prev) => ({
        ...prev,
        personalDetails: { ...prev.personalDetails, [name]: value },
      }));
    },
    []
  );
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setProfile((prev) => ({ ...prev, [name]: value }));
    },
    []
  );
  const addEducation = useCallback(() => {
    const newEducation: Education = {
      institution: "",
      degree: "",
      field: "",
      startDate: toInputDateString(new Date()),
      endDate: "",
      location: "",
      description: "",
      ongoing: false,
    };
    setProfile((prev) => ({
      ...prev,
      education: [...prev.education, newEducation],
    }));
  }, []);
  const updateEducation = useCallback(
    (index: number, field: keyof Education, value: any) => {
      setProfile((prev) => {
        const updatedEducation = [...prev.education];
        const currentItem = { ...updatedEducation[index] };
        if (field === "ongoing") {
          currentItem.ongoing = Boolean(value);
          if (currentItem.ongoing) {
            currentItem.endDate = "";
          }
        } else if (field !== "id") {
          (currentItem as any)[field] = value;
        }
        updatedEducation[index] = currentItem;
        return { ...prev, education: updatedEducation };
      });
    },
    []
  );
  const removeEducation = useCallback((index: number) => {
    setProfile((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  }, []);
  const addExperience = useCallback(() => {
    const newExperience: Experience = {
      company: "",
      position: "",
      startDate: toInputDateString(new Date()),
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
  }, []);
  const updateExperience = useCallback(
    (index: number, field: keyof Experience, value: any) => {
      setProfile((prev) => {
        const updatedExperience = [...prev.experience];
        const currentItem = { ...updatedExperience[index] };
        if (field === "ongoing") {
          currentItem.ongoing = Boolean(value);
          if (currentItem.ongoing) {
            currentItem.endDate = "";
          }
        } else if (field !== "id") {
          (currentItem as any)[field] = value;
        }
        updatedExperience[index] = currentItem;
        return { ...prev, experience: updatedExperience };
      });
    },
    []
  );
  const removeExperience = useCallback((index: number) => {
    setProfile((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  }, []);
  const addSkill = useCallback(() => {
    if (!newSkill.trim()) return;
    const skill: Skill = { name: newSkill };
    setProfile((prev) => ({ ...prev, skills: [...prev.skills, skill] }));
    setNewSkill("");
  }, [newSkill]);
  const removeSkill = useCallback((index: number) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  }, []);
  const addLanguage = useCallback(() => {
    if (!newLanguage.name.trim()) return;
    setProfile((prev) => ({
      ...prev,
      languages: [...prev.languages, newLanguage],
    }));
    setNewLanguage({ name: "", level: "B2" });
  }, [newLanguage]);
  const removeLanguage = useCallback((index: number) => {
    setProfile((prev) => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index),
    }));
  }, []);
  const addInterest = useCallback(() => {
    if (!newInterest.trim()) return;
    setProfile((prev) => ({
      ...prev,
      interests: [...(prev.interests || []), newInterest],
    }));
    setNewInterest("");
  }, [newInterest]);
  const removeInterest = useCallback((index: number) => {
    setProfile((prev) => ({
      ...prev,
      interests: (prev.interests || []).filter((_, i) => i !== index),
    }));
  }, []);

  // Submit Handler
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!user) {
        toast.error("Authentifizierung erforderlich.");
        return;
      }
      setSaving(true);
      try {
        const profileCopy = JSON.parse(JSON.stringify(profile));
        profileCopy.education = profileCopy.education.map((edu: any) => ({
          ...edu,
          startDate: fromInputDateString(edu.startDate),
          endDate: edu.ongoing ? null : fromInputDateString(edu.endDate),
        }));
        profileCopy.experience = profileCopy.experience.map((exp: any) => ({
          ...exp,
          startDate: fromInputDateString(exp.startDate),
          endDate: exp.ongoing ? null : fromInputDateString(exp.endDate),
        }));
        delete profileCopy.newSkill;
        delete profileCopy.newLanguage;
        delete profileCopy.newInterest;

        if (profile.id) {
          await updateUserProfile(profile.id, profileCopy);
          toast.success("Profil erfolgreich aktualisiert");
        } else {
          await createUserProfile(user.uid, profileCopy);
          toast.success("Profil erfolgreich erstellt");
        }
        router.push("/profile");
      } catch (error) {
        console.error("Fehler beim Speichern des Profils (Hook):", error);
        toast.error("Profil konnte nicht gespeichert werden");
      } finally {
        setSaving(false);
      }
    },
    [user, profile, router]
  );

  return {
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
  };
}
