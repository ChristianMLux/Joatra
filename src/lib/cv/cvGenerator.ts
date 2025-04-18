import {
  UserProfile,
  Job,
  CVTemplate,
  Skill,
  Experience,
  Education,
} from "../types";
import {
  tailorExperienceDescriptionAction,
  tailorEducationDescriptionAction,
} from "@/app/actions/cvActions";
import { serializeObjectForServerAction } from "../utils";

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
    "qa",
    "product management",
    "product owner",
    "ux",
    "ui",
    "accessibility",
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

// --- Skill Sorting ---
export const sortSkillsByRelevance = (
  skills: Skill[],
  keywords: string[]
): Skill[] => {
  const lowercaseKeywords = keywords.map((kw) => kw.toLowerCase());
  return [...skills].sort((a, b) => {
    const aIsRelevant = lowercaseKeywords.includes(a.name.toLowerCase());
    const bIsRelevant = lowercaseKeywords.includes(b.name.toLowerCase());
    if (aIsRelevant && !bIsRelevant) return -1;
    if (!aIsRelevant && bIsRelevant) return 1;
    const levels = ["Experte", "Sehr gut", "Gut", "Grundkenntnisse"];
    const aLevelIndex = levels.indexOf(a.level || "Grundkenntnisse");
    const bLevelIndex = levels.indexOf(b.level || "Grundkenntnisse");
    return aLevelIndex - bLevelIndex;
  });
};

// --- Summary Generation ---
const calculateYearsOfExperience = (experiences: Experience[]): number => {
  let totalMonths = 0;
  experiences.forEach((exp) => {
    try {
      const startDate = new Date(exp.startDate);
      const endDate = exp.ongoing
        ? new Date()
        : new Date(exp.endDate || new Date());
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        const months =
          (endDate.getFullYear() - startDate.getFullYear()) * 12 +
          (endDate.getMonth() - startDate.getMonth());
        totalMonths += Math.max(0, months);
      }
    } catch (e) {
      console.error("Error calculating experience duration for entry:", exp, e);
    }
  });
  return Math.floor(totalMonths / 12);
};

const generateSummary = (
  profile: UserProfile,
  job: Job | null,
  keywords: string[]
): string => {
  if (profile.summary) {
    return profile.summary;
  }
  const name = `${profile.personalDetails.firstName} ${profile.personalDetails.lastName}`;
  const yearsOfExperience = calculateYearsOfExperience(profile.experience);
  const topSkills = profile.skills
    .slice(0, 3)
    .map((s) => s.name)
    .join(", ");
  if (job) {
    return `Erfahrene(r) ${job.jobTitle || "Fachkraft"} mit ${yearsOfExperience} Jahren Berufserfahrung und fundiertem Wissen in ${topSkills || "relevanten Technologien"}. Auf der Suche nach einer neuen Herausforderung bei ${job.company}, um meine Fähigkeiten weiterzuentwickeln und zum Unternehmenserfolg beizutragen.`;
  } else {
    return `${name} ist ein(e) motivierte(r) Fachkraft mit ${yearsOfExperience} Jahren Berufserfahrung und Expertise in ${topSkills || "seinem/ihrem Fachgebiet"}.`;
  }
};

// --- Main CV Generation Function ---
export const generateCV = async (
  profile: UserProfile,
  job: Job | null,
  template: CVTemplate
): Promise<any> => {
  const keywords = extractKeywords(job);
  const sortedSkills = sortSkillsByRelevance(profile.skills || [], keywords);

  const sortedExperienceRaw = [...(profile.experience || [])].sort((a, b) => {
    try {
      const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
      const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
      if (isNaN(dateA) || isNaN(dateB)) return 0;
      return dateB - dateA;
    } catch {
      return 0;
    }
  });
  const sortedEducationRaw = [...(profile.education || [])].sort((a, b) => {
    try {
      const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
      const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
      if (isNaN(dateA) || isNaN(dateB)) return 0;
      return dateB - dateA;
    } catch {
      return 0;
    }
  });

  const serializedJob = job ? serializeObjectForServerAction(job) : null;

  // Tailor Experience Descriptions
  const tailoredExperiencePromises = sortedExperienceRaw.map(async (exp) => {
    const serializedExp = serializeObjectForServerAction(exp);
    if (job && exp.description) {
      try {
        const result = await tailorExperienceDescriptionAction({
          experience: serializedExp,
          job: serializedJob,
          language: template.language,
        });
        return {
          ...exp,
          description:
            result.success && result.tailoredDescription
              ? result.tailoredDescription
              : exp.description,
        };
      } catch (error) {
        console.error(
          `Exception tailoring experience for ${exp.company}:`,
          error
        );
        return exp;
      }
    }
    return exp;
  });
  const tailoredExperience = await Promise.all(tailoredExperiencePromises);

  // Tailor Education Descriptions
  const tailoredEducationPromises = sortedEducationRaw.map(async (edu) => {
    const serializedEdu = serializeObjectForServerAction(edu);
    if (job && edu.description) {
      try {
        const result = await tailorEducationDescriptionAction({
          education: serializedEdu,
          job: serializedJob,
          language: template.language,
        });
        return {
          ...edu,
          description:
            result.success && result.tailoredDescription
              ? result.tailoredDescription
              : edu.description,
        };
      } catch (error) {
        console.error(
          `Exception tailoring education for ${edu.institution}:`,
          error
        );
        return edu;
      }
    }
    return edu;
  });
  const tailoredEducation = await Promise.all(tailoredEducationPromises);

  // Final content object for PDF
  const content = {
    personalDetails: profile.personalDetails,
    summary: generateSummary(profile, job, keywords),
    experience: tailoredExperience,
    education: tailoredEducation,
    skills: sortedSkills,
    languages: profile.languages || [],
    certificates: profile.certificates || [],
    interests: profile.interests || [],
    keywords: keywords,
    templateType: template.type,
    templateLanguage: template.language,
    photoIncluded: template.photoIncluded,
  };

  return content;
};
