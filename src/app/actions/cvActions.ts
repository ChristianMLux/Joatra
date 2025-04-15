"use server";

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { Experience, Job, Education } from "@/lib/types";

interface TailorExperiencePayload {
  experience: Experience;
  job: Job | null;
  language: "de" | "en";
}

interface TailorEducationPayload {
  education: Education;
  job: Job | null;
  language: "de" | "en";
}

interface ActionResult {
  success: boolean;
  tailoredDescription?: string;
  error?: string;
}

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "MISSING_API_KEY");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const generationConfig = {
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  maxOutputTokens: 350,
};

const generationConfigEducation = {
  temperature: 0.6,
  topP: 0.9,
  topK: 40,
  maxOutputTokens: 200,
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

const handleError = (error: any, context: string): ActionResult => {
  console.error(`Server Action: Error during ${context}:`, error);
  let errorMessage = `Failed to tailor ${context}.`;
  if (error.message) {
    errorMessage += ` Error: ${error.message}`;
  }
  if (error.message && error.message.includes("SAFETY")) {
    errorMessage = `Content generation blocked due to safety settings during ${context}. Please review content or prompt.`;
  }
  return {
    success: false,
    tailoredDescription: undefined,
    error: errorMessage,
  };
};

// --- Action for Experience ---
export async function tailorExperienceDescriptionAction(
  payload: TailorExperiencePayload
): Promise<ActionResult> {
  console.log(
    "Server Action: tailorExperienceDescriptionAction called for:",
    payload.experience.position
  );

  if (!apiKey) return { success: false, error: "API Key not configured." };
  if (!payload.experience.description) {
    console.log("Server Action (Experience): No original description.");
    return { success: true, tailoredDescription: "" };
  }

  const { experience, job, language } = payload;
  const originalDescription = experience.description;
  const jobDescription = job?.notes || "";
  const jobTitle = job?.jobTitle || "the target position";

  const prompt = `
 **Instruction:** You are an expert CV writer. Rewrite the following "Original Description" for the position of "${experience.position}" at "${experience.company}" to be suitable for a CV targeting the job "${jobTitle}".
 Focus on highlighting skills, responsibilities, and achievements from the original description that are most relevant to the "Target Job Description/Requirements".
 Use strong action verbs and maintain a professional tone in ${language === "de" ? "German" : "English"}. Keep the rewritten description concise but comprehensive, ensuring key details are preserved. The description should not exceed 4 lines on DIN A4 format

 **Context:**
 * **Original Description:** ${originalDescription}
 * **Target Job Title:** ${jobTitle}
 * **Target Job Description/Requirements:** ${jobDescription.substring(0, 1200)}...

 **Task:** Rewrite the "Original Description" based on the instructions above. Output *only* the rewritten description text, without any additional explanations or formatting like bullet points unless it naturally fits the rewritten text.

 **Example Rewritten Output:**
 Led the full-stack development (C#/ASP.NET, React/TypeScript) of key platform features, including responsive component implementation and optimization. Collaborated closely with Product Owners on requirement analysis and specifications. Enhanced code quality through rigorous code reviews and the development of automated unit, integration, and end-to-end tests. Optimized CI processes and integrated Google Analytics for data-driven performance improvements.
 `;

  console.log("Server Action (Experience): Sending prompt to LLM...");

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings,
    });
    const response = result.response;
    const generatedText = response?.text()?.trim() || "";
    console.log("Server Action (Experience): Received response.");

    let tailoredDescription = generatedText;
    if (
      tailoredDescription.length === 0 && originalDescription
        ? originalDescription.length > 0
        : 0
    ) {
      console.warn("Server Action (Experience): Fallback to original.");
      tailoredDescription = originalDescription || "";
    }
    return { success: true, tailoredDescription: tailoredDescription };
  } catch (error: any) {
    return handleError(error, "experience description");
  }
}

// --- Action for Education ---
export async function tailorEducationDescriptionAction(
  payload: TailorEducationPayload
): Promise<ActionResult> {
  console.log(
    "Server Action: tailorEducationDescriptionAction called for:",
    payload.education.degree
  );

  if (!apiKey) return { success: false, error: "API Key not configured." };
  if (!payload.education.description) {
    console.log("Server Action (Education): No original description.");
    return { success: true, tailoredDescription: "" };
  }

  const { education, job, language } = payload;
  const originalDescription = education.description;
  const jobDescription = job?.notes || "";
  const jobTitle = job?.jobTitle || "the target position";

  const prompt = `
 **Instruction:** You are an expert CV writer. Rewrite the following "Original Education Description" for the degree "${education.degree}" from "${education.institution}" to be suitable for a CV targeting the job "${jobTitle}".
 Focus on highlighting key modules, projects, theses, or acquired skills from the original description that are most relevant to the "Target Job Description/Requirements".
 Use clear and concise language in ${language === "de" ? "German" : "English"}. **The final rewritten description must not exceed 4 lines.**

 **Context:**
 * **Original Education Description:** ${originalDescription}
 * **Target Job Title:** ${jobTitle}
 * **Target Job Description/Requirements:** ${jobDescription.substring(0, 1000)}...

 **Task:** Rewrite the "Original Education Description" based on the instructions above, ensuring it is relevant and **does not exceed 4 lines**. Output *only* the rewritten description text.

 **Example Rewritten Output (max 4 lines):**
 Key modules included Advanced Algorithms, Database Systems, and Cloud Infrastructure. Developed a web application for project management as final thesis, utilizing React and Node.js. Gained practical experience with agile methodologies (Scrum).

 `;

  console.log("Server Action (Education): Sending prompt to LLM...");

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: generationConfigEducation,
      safetySettings,
    });
    const response = result.response;
    const generatedText = response?.text()?.trim() || "";
    console.log("Server Action (Education): Received response.");

    let tailoredDescription = generatedText;

    const lines = tailoredDescription.split("\n").length;
    if (lines > 4) {
      console.warn(
        `Server Action (Education): Output exceeded 4 lines (${lines}). Truncating or prompt refinement needed.`
      );
    }

    if (
      tailoredDescription.length === 0 && originalDescription
        ? originalDescription.length > 0
        : 0
    ) {
      console.warn("Server Action (Education): Fallback to original.");
      tailoredDescription = originalDescription || "";
    }
    return { success: true, tailoredDescription: tailoredDescription };
  } catch (error: any) {
    return handleError(error, "education description");
  }
}
