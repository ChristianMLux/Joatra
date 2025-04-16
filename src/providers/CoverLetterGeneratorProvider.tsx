"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useAuth } from "./AuthProvider";
import {
  getUserProfile,
  getCoverLetterTemplates,
  getJobs,
} from "@/lib/firebase/firebase";
import { UserProfile, Job } from "@/lib/types";
import toast from "react-hot-toast";
import { generateCoverLetterAction } from "@/app/actions/coverLetterActions";
import { serializeObjectForServerAction } from "@/lib/utils";

interface CoverLetterTemplate {
  id: string;
  name: string;
  description: string;
  language: "de" | "en";
  style: "formal" | "modern" | "creative";
  atsOptimized: boolean;
  din5008Compliant?: boolean;
}

interface CoverLetterGeneratorContextType {
  profile: UserProfile | null;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  selectedJob: Job | null;
  setSelectedJob: React.Dispatch<React.SetStateAction<Job | null>>;
  templates: CoverLetterTemplate[];
  selectedTemplate: CoverLetterTemplate | null;
  setSelectedTemplate: React.Dispatch<
    React.SetStateAction<CoverLetterTemplate | null>
  >;
  generatedContent: any | null;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  updateGeneratedContent: (newContent: any) => void;
  loading: boolean;
  loadJob: (jobId: string) => Promise<void>;
  loadProfile: () => Promise<void>;
  selectTemplate: (templateId: string) => void;
  generateContent: () => Promise<void>;
}

const defaultTemplates: CoverLetterTemplate[] = [
  {
    id: "formal-de",
    name: "Formales Anschreiben (Deutsch)",
    description:
      "Standard-Anschreiben nach DIN 5008 Norm für deutsche Bewerbungen",
    language: "de",
    style: "formal",
    atsOptimized: true,
    din5008Compliant: true,
  },
  {
    id: "modern-de",
    name: "Modernes Anschreiben (Deutsch)",
    description:
      "Zeitgemäßes Anschreiben mit klarer Struktur und modernem Layout",
    language: "de",
    style: "modern",
    atsOptimized: true,
    din5008Compliant: true,
  },
  {
    id: "formal-en",
    name: "Formal Cover Letter (English)",
    description: "Standard cover letter format for international applications",
    language: "en",
    style: "formal",
    atsOptimized: true,
  },
  {
    id: "creative-en",
    name: "Creative Cover Letter (English)",
    description:
      "Stand out with a unique but professional cover letter for creative positions",
    language: "en",
    style: "creative",
    atsOptimized: true,
  },
];

const CoverLetterGeneratorContext =
  createContext<CoverLetterGeneratorContextType>({
    profile: null,
    setProfile: () => {},
    selectedJob: null,
    setSelectedJob: () => {},
    templates: defaultTemplates,
    selectedTemplate: null,
    setSelectedTemplate: () => {},
    generatedContent: null,
    isEditing: false,
    setIsEditing: () => {},
    updateGeneratedContent: () => {},
    loading: true,
    loadJob: async () => {},
    loadProfile: async () => {},
    selectTemplate: () => {},
    generateContent: async () => {},
  });

export function CoverLetterGeneratorProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [templates, setTemplates] =
    useState<CoverLetterTemplate[]>(defaultTemplates);
  const [selectedTemplate, setSelectedTemplate] =
    useState<CoverLetterTemplate | null>(null);
  const [generatedContent, setGeneratedContent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    let isMounted = true;
    console.log("CL_PROVIDER: Loading templates...");
    const loadTemplates = async () => {
      try {
        const templatesData = await getCoverLetterTemplates();
        if (isMounted) {
          if (templatesData && templatesData.length > 0) {
            console.log("CL_PROVIDER: Templates loaded from Firestore.");
            setTemplates(templatesData);
          } else {
            console.warn(
              "CL_PROVIDER: No templates from Firestore, using defaults."
            );
            setTemplates(defaultTemplates);
          }
        }
      } catch (error) {
        console.error(
          "CL_PROVIDER: Fehler beim Laden der Anschreiben-Templates:",
          error
        );
        toast.error(
          "Anschreiben-Templates konnten nicht geladen werden. Nutze Fallback."
        );
        if (isMounted) setTemplates(defaultTemplates);
      }
    };
    loadTemplates();
    return () => {
      isMounted = false;
    };
  }, []);

  const loadProfile = useCallback(async () => {
    let isMounted = true;
    console.log("CL_PROVIDER: loadProfile called. User:", !!user);
    if (!user) {
      setProfile(null);
      setLoading(false);
      console.log("CL_PROVIDER: No user, profile set to null, loading false.");
      return;
    }
    setLoading(true);
    try {
      const profileData = await getUserProfile(user.uid);
      if (isMounted) {
        console.log("CL_PROVIDER: Fetched profile data:", !!profileData);
        setProfile(profileData);
      }
    } catch (error) {
      console.error("CL_PROVIDER: Fehler beim Laden des Profils:", error);
      toast.error("Dein Profil konnte nicht geladen werden");
      if (isMounted) setProfile(null);
    } finally {
      if (isMounted) {
        console.log("CL_PROVIDER: Finished loading profile, loading false.");
        setLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const loadJob = useCallback(
    async (jobId: string) => {
      let isMounted = true;
      console.log(
        `CL_PROVIDER: loadJob called for ID: ${jobId}. User:`,
        !!user
      );
      if (!user) return;
      try {
        const allJobs = await getJobs(user.uid);
        const job = allJobs.find((j) => j.id === jobId);

        if (!job) {
          toast.error("Stellenanzeige konnte nicht gefunden werden");
          if (isMounted) setSelectedJob(null);
        } else {
          console.log("CL_PROVIDER: Job found, setting selectedJob:", job.id);
          if (isMounted) {
            setSelectedJob(job);
            setGeneratedContent(null);
            setIsEditing(false);
          }
        }
      } catch (error) {
        console.error(
          "CL_PROVIDER: Fehler beim Laden der Stellenanzeige:",
          error
        );
        toast.error("Stellenanzeige konnte nicht geladen werden");
        if (isMounted) setSelectedJob(null);
      } finally {
      }
    },
    [user]
  );

  const selectTemplate = useCallback(
    (templateId: string) => {
      console.log(`CL_PROVIDER: selectTemplate called for ID: ${templateId}`);
      const template = templates.find((t) => t.id === templateId);
      if (template) {
        setSelectedTemplate(template);
        setGeneratedContent(null);
        setIsEditing(false);
        console.log("CL_PROVIDER: Template selected:", template.id);
      } else {
        console.warn(`CL_PROVIDER: Template ID ${templateId} not found`);
      }
    },
    [templates]
  );

  const generateContent = useCallback(async () => {
    console.log("CL_PROVIDER: generateContent called");
    if (!profile || !selectedTemplate) {
      toast.error("Profil oder Template fehlt für die Anschreiben-Generierung");
      console.error(
        "CL_PROVIDER: generateContent - Missing profile or template",
        {
          profile: !!profile,
          selectedTemplate: !!selectedTemplate,
        }
      );
      return;
    }

    const payload = {
      profileData: profile,
      jobData: selectedJob,
      templateData: {
        language: selectedTemplate.language,
        style: selectedTemplate.style,
        din5008Compliant: selectedTemplate.din5008Compliant,
      },
    };

    let serializedPayload;
    try {
      serializedPayload = serializeObjectForServerAction(payload);
      console.log(
        "CL_PROVIDER: Calling generateCoverLetterAction with serialized payload:",
        serializedPayload
      );
    } catch (error) {
      console.error("CL_PROVIDER: Error serializing payload:", error);
      toast.error("Fehler bei der Vorbereitung der Daten für den Server.");
      return;
    }

    setLoading(true);
    setGeneratedContent(null);
    setIsEditing(false);

    try {
      const result = await generateCoverLetterAction(serializedPayload);
      console.log("CL_PROVIDER: Received result from Server Action:", result);

      if (result.success && result.content) {
        setGeneratedContent(result.content);
        toast.success("Anschreiben erfolgreich generiert!");
      } else {
        toast.error(
          result.error || "Anschreiben konnte nicht generiert werden."
        );
        setGeneratedContent(null);
      }
    } catch (error) {
      console.error(
        "CL_PROVIDER: Fehler bei der Anschreiben-Generierung (Action Call):",
        error
      );
      toast.error("Ein unerwarteter Fehler ist aufgetreten.");
      setGeneratedContent(null);
    } finally {
      setLoading(false);
    }
  }, [profile, selectedJob, selectedTemplate]);

  const updateGeneratedContent = useCallback((newContent: any) => {
    console.log("CL_PROVIDER: updateGeneratedContent called.");
    setGeneratedContent(newContent);
    setIsEditing(false);
    toast.success("Änderungen am Anschreiben gespeichert.");
  }, []);

  return (
    <CoverLetterGeneratorContext.Provider
      value={{
        profile,
        setProfile,
        selectedJob,
        setSelectedJob,
        templates,
        selectedTemplate,
        setSelectedTemplate,
        generatedContent,
        // -- NEW --
        isEditing,
        setIsEditing,
        updateGeneratedContent,
        // ---------
        loading,
        loadJob,
        loadProfile,
        selectTemplate,
        generateContent,
      }}
    >
      {children}
    </CoverLetterGeneratorContext.Provider>
  );
}

export function useCoverLetterGenerator() {
  return useContext(CoverLetterGeneratorContext);
}
