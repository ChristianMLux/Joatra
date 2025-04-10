import {
  UserProfile,
  Job,
  CVTemplate,
  Skill,
  Experience,
  Education,
} from "../types";
import { format } from "date-fns";
import { de } from "date-fns/locale";

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

export const formatDate = (date: any, language: string = "de"): string => {
  if (!date) return "";

  let dateObj: Date;

  if (typeof date === "object" && "toDate" in date) {
    dateObj = date.toDate();
  } else if (date instanceof Date) {
    dateObj = date;
  } else {
    dateObj = new Date(date);
  }

  if (isNaN(dateObj.getTime())) {
    return "";
  }

  if (language === "de") {
    return format(dateObj, "MM/yyyy", { locale: de });
  } else {
    return format(dateObj, "MM/yyyy");
  }
};

export const generateCV = (
  profile: UserProfile,
  job: Job | null,
  template: CVTemplate
): any => {
  const keywords = extractKeywords(job);

  const sortedSkills = sortSkillsByRelevance(profile.skills, keywords);

  const sortedExperience = [...profile.experience].sort((a, b) => {
    const aDate = new Date(a.startDate);
    const bDate = new Date(b.startDate);
    return bDate.getTime() - aDate.getTime();
  });

  const sortedEducation = [...profile.education].sort((a, b) => {
    const aDate = new Date(a.startDate);
    const bDate = new Date(b.startDate);
    return bDate.getTime() - aDate.getTime();
  });

  const content = {
    personalDetails: profile.personalDetails,
    summary: generateSummary(profile, job, keywords),
    experience: sortedExperience,
    education: sortedEducation,
    skills: sortedSkills,
    languages: profile.languages,
    certificates: profile.certificates || [],
    interests: profile.interests || [],
    keywords: keywords,
    templateType: template.type,
    templateLanguage: template.language,
    photoIncluded: template.photoIncluded,
  };

  return content;
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
    return `Erfahrene(r) ${job.jobTitle} mit ${yearsOfExperience} Jahren Berufserfahrung und fundiertem Wissen in ${topSkills}. Auf der Suche nach einer neuen Herausforderung bei ${job.company}, um meine Fähigkeiten weiterzuentwickeln und zum Unternehmenserfolg beizutragen.`;
  } else {
    return `${name} ist ein(e) motivierte(r) Fachkraft mit ${yearsOfExperience} Jahren Berufserfahrung und Expertise in ${topSkills}.`;
  }
};

const calculateYearsOfExperience = (experiences: Experience[]): number => {
  let totalMonths = 0;

  experiences.forEach((exp) => {
    const startDate = new Date(exp.startDate);
    const endDate = exp.ongoing
      ? new Date()
      : new Date(exp.endDate || new Date());

    const months =
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth());

    totalMonths += months;
  });

  return Math.floor(totalMonths / 12);
};

export const generateGermanCV = (content: any): string => {
  return JSON.stringify(content);
};

export const generateInternationalCV = (content: any): string => {
  return JSON.stringify(content);
};
