import { UserProfile, Job } from "../types";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface CoverLetterTemplate {
  id: string;
  name: string;
  description: string;
  language: "de" | "en";
  style: "formal" | "modern" | "creative";
  atsOptimized: boolean;
  din5008Compliant?: boolean;
}

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
    return format(dateObj, "dd. MMMM yyyy", { locale: de });
  } else {
    return format(dateObj, "MMMM dd, yyyy");
  }
};

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

    if (language === "de") {
      return `Sehr geehrte${lastName ? `r Herr ${lastName}` : " Damen und Herren"},`;
    } else {
      return `Dear ${job.contactPerson.name},`;
    }
  }

  return language === "de"
    ? "Sehr geehrte Damen und Herren,"
    : "Dear Sir or Madam,";
};

const generateCompanyAddressBlock = (
  job: Job | null,
  language: string
): string => {
  if (!job) return "";

  const companyName = job.company;
  const contactPerson = job.contactPerson?.name || "";
  const location = job.location || "";

  if (language === "de") {
    return `${companyName}
  ${contactPerson ? contactPerson + "\n" : ""}${location ? location : ""}`;
  } else {
    return `${companyName}
  ${contactPerson ? contactPerson + "\n" : ""}${location ? location : ""}`;
  }
};

const generateIntroduction = (
  profile: UserProfile,
  job: Job | null,
  language: string
): string => {
  if (!job) {
    if (language === "de") {
      return `mit großem Interesse bewerbe ich mich auf die ausgeschriebene Position. Meine Qualifikationen und beruflichen Erfahrungen entsprechen Ihren Anforderungen, und ich bin überzeugt, dass ich einen wertvollen Beitrag zu Ihrem Unternehmen leisten kann.`;
    } else {
      return `I am writing to express my interest in the advertised position. My qualifications and professional experience match your requirements, and I am confident that I can make a valuable contribution to your company.`;
    }
  }

  if (language === "de") {
    return `mit großem Interesse bewerbe ich mich auf die von Ihnen ausgeschriebene Stelle als ${job.jobTitle}. Während meiner Recherche über ${job.company} hat mich besonders Ihre ${job?.notes?.includes("Innovation") ? "innovative Arbeitsweise" : "Unternehmensphilosophie"} angesprochen, und ich bin überzeugt, dass meine Fähigkeiten und Erfahrungen ideal zu Ihren Anforderungen passen.`;
  } else {
    return `I am writing to apply for the ${job.jobTitle} position advertised by your company. During my research about ${job.company}, I was particularly impressed by your ${job?.notes?.includes("innovation") ? "innovative approach" : "company philosophy"}, and I believe my skills and experience are an ideal match for your requirements.`;
  }
};

const generateMainBody = (
  profile: UserProfile,
  job: Job | null,
  keywords: string[],
  language: string
): string => {
  const recentExperience =
    profile.experience.length > 0
      ? profile.experience.sort((a, b) => {
          const dateA = new Date(a.startDate);
          const dateB = new Date(b.startDate);
          return dateB.getTime() - dateA.getTime();
        })[0]
      : null;

  const matchingSkills = profile.skills
    .filter((skill) =>
      keywords.some((keyword) =>
        skill.name.toLowerCase().includes(keyword.toLowerCase())
      )
    )
    .slice(0, 3)
    .map((skill) => skill.name);

  const yearsOfExperience = profile.experience.reduce((sum, exp) => {
    const startDate = new Date(exp.startDate);
    const endDate = exp.ongoing
      ? new Date()
      : new Date(exp.endDate || new Date());
    const years =
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    return sum + years;
  }, 0);

  const roundedYears = Math.floor(yearsOfExperience);

  if (language === "de") {
    let mainBody = `Derzeit arbeite ich ${recentExperience ? `als ${recentExperience.position} bei ${recentExperience.company}` : "in meiner aktuellen Position"}, wo ich umfangreiche Erfahrung ${matchingSkills.length > 0 ? `in ${matchingSkills.join(", ")}` : "in meinem Fachgebiet"} sammeln konnte. Insgesamt verfüge ich über ${roundedYears} Jahre Berufserfahrung und konnte dabei meine Fähigkeiten kontinuierlich ausbauen.
  
  Zu meinen Stärken zählen ${profile.skills
    .slice(0, 3)
    .map((s) => s.name)
    .join(
      ", "
    )}${job?.techStack && job.techStack.length > 0 ? ` sowie die von Ihnen geforderten Kenntnisse in ${job.techStack.slice(0, 3).join(", ")}` : ""}. Durch meine fundierten Kenntnisse und praktischen Erfahrungen bin ich in der Lage, schnell Lösungen zu entwickeln und effizient in Teams zu arbeiten.`;

    return mainBody;
  } else {
    let mainBody = `I am currently working ${recentExperience ? `as a ${recentExperience.position} at ${recentExperience.company}` : "in my current position"}, where I have gained extensive experience ${matchingSkills.length > 0 ? `in ${matchingSkills.join(", ")}` : "in my field"}. In total, I have ${roundedYears} years of professional experience during which I have continuously expanded my skills.
  
  My strengths include ${profile.skills
    .slice(0, 3)
    .map((s) => s.name)
    .join(
      ", "
    )}${job?.techStack && job.techStack.length > 0 ? ` as well as the knowledge you require in ${job.techStack.slice(0, 3).join(", ")}` : ""}. Through my strong background and practical experience, I am able to develop solutions quickly and work efficiently in team environments.`;

    return mainBody;
  }
};

const generateClosing = (
  profile: UserProfile,
  job: Job | null,
  language: string
): string => {
  if (language === "de") {
    return `Ich freue mich auf die Gelegenheit, meine Bewerbung in einem persönlichen Gespräch zu vertiefen und zu erläutern, wie ich ${job ? job.company : "Ihr Unternehmen"} mit meinen Fähigkeiten unterstützen kann.
  
  Mit freundlichen Grüßen
  
  ${profile.personalDetails.firstName} ${profile.personalDetails.lastName}`;
  } else {
    return `I look forward to the opportunity to discuss my application in a personal interview and to explain how I can support ${job ? job.company : "your company"} with my skills.
  
  Sincerely,
  
  ${profile.personalDetails.firstName} ${profile.personalDetails.lastName}`;
  }
};

export const generateCoverLetter = (
  profile: UserProfile,
  job: Job | null,
  template: CoverLetterTemplate
): any => {
  const keywords = extractKeywords(job);
  const currentDate = new Date();
  const language = template.language;

  const personalDetails = profile.personalDetails;
  const personalDetailsBlock =
    language === "de"
      ? `${personalDetails.firstName} ${personalDetails.lastName}
  ${personalDetails.address || ""}
  ${personalDetails.postalCode || ""} ${personalDetails.city || ""}
  Tel.: ${personalDetails.phone || ""}
  E-Mail: ${personalDetails.email}`
      : `${personalDetails.firstName} ${personalDetails.lastName}
  ${personalDetails.address || ""}
  ${personalDetails.postalCode || ""} ${personalDetails.city || ""}
  Phone: ${personalDetails.phone || ""}
  Email: ${personalDetails.email}`;

  const companyAddressBlock = generateCompanyAddressBlock(job, language);

  const date = formatDate(currentDate, language);
  const subject = job
    ? language === "de"
      ? `Bewerbung als ${job.jobTitle}${job.techStack ? ` mit Schwerpunkt ${job.techStack[0]}` : ""}`
      : `Application for the position of ${job.jobTitle}${job.techStack ? ` with focus on ${job.techStack[0]}` : ""}`
    : language === "de"
      ? "Bewerbung"
      : "Job Application";
  const salutation = generateSalutation(profile, job, language);
  const introduction = generateIntroduction(profile, job, language);
  const mainBody = generateMainBody(profile, job, keywords, language);
  const closing = generateClosing(profile, job, language);

  const content = {
    personalDetails: profile.personalDetails,
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

  return content;
};

export const generateGermanFormalCoverLetter = (content: any): string => {
  return JSON.stringify(content);
};

export const generateInternationalCoverLetter = (content: any): string => {
  return JSON.stringify(content);
};
