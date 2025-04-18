import { UserProfile, Job } from "../types";
import { format } from "date-fns";
import { de, enUS } from "date-fns/locale"; // Import locales

// Definiere den Typ für CoverLetterTemplate lokal oder importiere ihn
interface CoverLetterTemplate {
  id: string;
  name: string;
  description: string;
  language: "de" | "en";
  style: "formal" | "modern" | "creative";
  atsOptimized: boolean;
  din5008Compliant?: boolean;
}

// --- Keyword Extraction ---
const extractTechKeywords = (text: string): string[] => {
  const techKeywordList = [
    "javascript",
    "typescript",
    "react",
    "angular",
    "vue",
    "node.js",
    "node",
    "express",
    "next.js",
    "nextjs",
    "html",
    "css",
    "sass",
    "less",
    "sql",
    "nosql",
    "postgresql",
    "mysql",
    "mongodb",
    "firebase",
    "aws",
    "azure",
    "git",
    "github",
    "gitlab",
    "ci/cd",
    "docker",
    "kubernetes",
    "python",
    "django",
    "flask",
    "java",
    "spring",
    "c#",
    ".net",
    "php",
    "laravel",
    "symfony",
    "ruby",
    "rails",
    "swift",
    "kotlin",
    "flutter",
    "dart",
    "react native",
    "android",
    "ios",
    "agile",
    "scrum",
    "kanban",
    "jira",
    "confluence",
    "figma",
    "sketch",
    "adobe xd",
    "photoshop",
    "illustrator",
    "redux",
    "graphql",
    "rest",
    "api",
    "microservices",
    "testing",
    "jest",
    "cypress",
    "selenium",
  ];
  return techKeywordList.filter((keyword) => text.includes(keyword));
};

const extractSoftSkills = (text: string): string[] => {
  const softSkillsList = [
    "communication",
    "kommunikation",
    "teamwork",
    "team",
    "leadership",
    "führung",
    "problem solving",
    "problemlösung",
    "time management",
    "zeitmanagement",
    "adaptability",
    "anpassungsfähigkeit",
    "creativity",
    "kreativität",
    "critical thinking",
    "kritisches denken",
    "emotional intelligence",
    "emotionale intelligenz",
    "negotiation",
    "verhandlung",
    "conflict resolution",
    "konfliktlösung",
    "decision making",
    "entscheidungsfindung",
    "presentation",
    "präsentation",
    "customer service",
    "kundenservice",
    "mentoring",
    "coaching",
  ];
  return softSkillsList.filter((skill) => text.includes(skill));
};

export const extractKeywords = (job: Job | null): string[] => {
  if (!job) return [];
  const keywordSources = [
    job.jobTitle,
    job.company,
    job.notes || "",
    ...(job.techStack || []),
  ].filter(Boolean);
  const combinedText = keywordSources.join(" ").toLowerCase();
  const techKeywords = extractTechKeywords(combinedText);
  const softSkills = extractSoftSkills(combinedText);
  return [...new Set([...techKeywords, ...softSkills])];
};

// --- Date Formatting ---
// Verwendet jetzt die zentrale Funktion aus utils.ts, diese lokale ist nicht mehr nötig
// import { formatDate as formatDateUtil } from '../utils'; // Beispielimport
// export const formatDate = (date: any, language: string = "de"): string => {
//   return formatDateUtil(date, language === 'de' ? 'dd. MMMM yyyy' : 'MMMM dd, yyyy', language as 'de' | 'en');
// };

// --- Content Generation Helpers ---
const generateSalutation = (
  profile: UserProfile,
  job: Job | null,
  language: string
): string => {
  if (!job) {
    return language === "de"
      ? "Sehr geehrte Damen und Herren,"
      : "Dear Sir or Madam,";
  }
  if (job.contactPerson?.name) {
    const nameParts = job.contactPerson.name.split(" ");
    const lastName =
      nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
    // Simple gender detection based on common German titles (can be improved)
    const isFemale = /frau|ms|mrs|miss/i.test(job.contactPerson.name);
    const isMale = /herr|mr/i.test(job.contactPerson.name);

    if (language === "de") {
      if (isFemale) return `Sehr geehrte Frau ${lastName},`;
      if (isMale) return `Sehr geehrter Herr ${lastName},`;
      // Fallback if gender is unclear
      return `Sehr geehrte/r Frau/Herr ${lastName},`; // Or simply use the full name
    } else {
      // English doesn't usually differentiate gender in salutation this way
      return `Dear ${job.contactPerson.name},`;
    }
  }
  return language === "de"
    ? "Sehr geehrte Damen und Herren,"
    : "Dear Hiring Manager,"; // Use Hiring Manager as default
};

const generateCompanyAddressBlock = (
  job: Job | null,
  language: string
): string => {
  if (!job) return "";
  // Build address lines, filtering out empty ones
  const lines = [
    job.company,
    job.contactPerson?.name
      ? language === "de"
        ? `z.Hd. ${job.contactPerson.name}`
        : job.contactPerson.name
      : null,
    job.companyStreet,
    job.companyPostalCode || job.companyCity
      ? `${job.companyPostalCode || ""} ${job.companyCity || ""}`.trim()
      : null,
  ].filter(Boolean); // Remove null/empty lines
  return lines.join("\n");
};

// --- Content Generation (Placeholder/Example Logic) ---
// NOTE: This uses very basic placeholder logic. The actual generation
// should ideally happen via the Server Action calling an LLM.
// These functions are kept for structure but likely overridden by the LLM response.

const generateIntroduction = (
  profile: UserProfile,
  job: Job | null,
  language: string
): string => {
  if (!job) {
    return language === "de"
      ? `hiermit bewerbe ich mich mit großem Interesse auf eine passende Position in Ihrem Unternehmen. Meine Qualifikationen und beruflichen Erfahrungen könnten für Sie von Wert sein.`
      : `I am writing to express my strong interest in a suitable position within your company. My qualifications and professional experience may be of value to you.`;
  }
  return language === "de"
    ? `hiermit bewerbe ich mich mit großem Interesse auf die von Ihnen ausgeschriebene Stelle als ${job.jobTitle}. ${job.company} ist mir als ${job?.notes?.includes("Marktführer") ? "Marktführer" : "interessanter Arbeitgeber"} bekannt, und ich bin überzeugt, dass meine Fähigkeiten gut zu Ihren Anforderungen passen.`
    : `I am writing with great interest to apply for the position of ${job.jobTitle} at ${job.company}. I know ${job.company} as ${job?.notes?.includes("market leader") ? "a market leader" : "an interesting employer"}, and I am confident that my skills align well with your requirements.`;
};

const generateMainBody = (
  profile: UserProfile,
  job: Job | null,
  keywords: string[],
  language: string
): string => {
  const recentExperience =
    profile.experience.length > 0 ? profile.experience[0] : null; // Assumes sorted
  const topSkills = profile.skills
    .slice(0, 3)
    .map((s) => s.name)
    .join(", ");

  if (language === "de") {
    return `In meiner letzten Position ${recentExperience ? `als ${recentExperience.position} bei ${recentExperience.company}` : ""} konnte ich meine Fähigkeiten in ${topSkills} erfolgreich einsetzen und erweitern. ${recentExperience?.description ? `Dabei war ich unter anderem für ${recentExperience.description.split(".")[0]} verantwortlich.` : ""} \n\nIch bin überzeugt, die Anforderungen der Stelle als ${job?.jobTitle || "Mitarbeiter"} zu erfüllen und ${job ? job.company : "Ihr Unternehmen"} tatkräftig unterstützen zu können.`;
  } else {
    return `In my most recent role ${recentExperience ? `as a ${recentExperience.position} at ${recentExperience.company}` : ""}, I successfully applied and expanded my skills in ${topSkills}. ${recentExperience?.description ? `My responsibilities included ${recentExperience.description.split(".")[0]}.` : ""}\n\nI am confident that I meet the requirements for the position of ${job?.jobTitle || "employee"} and can actively support ${job ? job.company : "your company"}.`;
  }
};

const generateClosing = (
  profile: UserProfile,
  job: Job | null,
  language: string
): string => {
  if (language === "de") {
    return `Über eine Einladung zu einem persönlichen Gespräch würde ich mich sehr freuen.\n\nMit freundlichen Grüßen\n\n${profile.personalDetails.firstName} ${profile.personalDetails.lastName}`;
  } else {
    return `I would be very pleased to receive an invitation for a personal interview.\n\nSincerely,\n\n${profile.personalDetails.firstName} ${profile.personalDetails.lastName}`;
  }
};

// --- Main Generator Function (Placeholder) ---
// This function likely isn't called directly anymore if the Server Action handles generation.
export const generateCoverLetter = (
  profile: UserProfile,
  job: Job | null,
  template: CoverLetterTemplate
): any => {
  console.warn(
    "Local 'generateCoverLetter' function called. Generation should ideally happen via Server Action."
  );
  const keywords = extractKeywords(job);
  const currentDate = new Date();
  const language = template.language;

  // Use helper functions to generate basic content parts
  const personalDetailsBlock = `${profile.personalDetails.firstName} ${profile.personalDetails.lastName}\n${profile.personalDetails.address || ""}\n${profile.personalDetails.postalCode || ""} ${profile.personalDetails.city || ""}\n${profile.personalDetails.email}\n${profile.personalDetails.phone || ""}`;
  const companyAddressBlock = generateCompanyAddressBlock(job, language);
  const date = format(
    currentDate,
    language === "de" ? "dd. MMMM yyyy" : "MMMM dd, yyyy",
    { locale: language === "de" ? de : enUS }
  );
  const subject = job
    ? language === "de"
      ? `Bewerbung als ${job.jobTitle}`
      : `Application for ${job.jobTitle}`
    : language === "de"
      ? "Bewerbung"
      : "Application";
  const salutation = generateSalutation(profile, job, language);
  const introduction = generateIntroduction(profile, job, language);
  const mainBody = generateMainBody(profile, job, keywords, language);
  const closing = generateClosing(profile, job, language);

  // Return the structured content
  return {
    personalDetails: profile.personalDetails, // Keep for potential use in PDF
    personalDetailsBlock,
    companyAddressBlock,
    date,
    subject,
    salutation,
    introduction,
    mainBody,
    closing,
    keywords,
    templateStyle: template.style,
    templateLanguage: language,
    din5008Compliant: template.din5008Compliant,
  };
};
