"use server";

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { UserProfile, Job } from "@/lib/types";
import { extractKeywords } from "@/lib/coverLetter/coverLetterGenerator";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface GenerateActionPayload {
  profileData: UserProfile;
  jobData: Job | null;
  templateData: {
    language: "de" | "en";
    style: "formal" | "modern" | "creative";
    din5008Compliant?: boolean;
  };
}

interface ActionResult {
  success: boolean;
  content?: any;
  error?: string;
}

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY is not set in environment variables.");
}
const genAI = new GoogleGenerativeAI(apiKey || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

function extractSectionBetweenTags(
  text: string,
  currentTag: string,
  allTags: string[]
): string {
  const startIndex = text.indexOf(currentTag);
  if (startIndex === -1) {
    console.warn(`Revised Parsing: Tag ${currentTag} not found.`);
    return `[${currentTag.slice(1, -1)} not found]`;
  }
  const contentStartIndex = startIndex + currentTag.length;
  let contentEndIndex = text.length;
  for (const nextTag of allTags) {
    if (nextTag === currentTag) continue;
    const nextTagPos = text.indexOf(nextTag, contentStartIndex);
    if (nextTagPos !== -1 && nextTagPos < contentEndIndex) {
      contentEndIndex = nextTagPos;
    }
  }
  return text.substring(contentStartIndex, contentEndIndex).trim();
}

/**
 * Server Action to generate cover letter content using an LLM.
 * @param payload - The data needed for generation (profile, job, template).
 * @returns An object indicating success or failure, and the generated content or an error message.
 */
export async function generateCoverLetterAction(
  payload: GenerateActionPayload
): Promise<ActionResult> {
  console.log(
    "Server Action: generateCoverLetterAction called with payload:",
    payload
  );

  if (!apiKey) {
    return { success: false, error: "API Key not configured on server." };
  }

  const { profileData, jobData, templateData } = payload;

  // --- 1. Construct Optimized Prompt ---
  const keywords = jobData ? extractKeywords(jobData) : [];
  const currentDateFormatted = format(
    new Date(),
    templateData.language === "de" ? "dd. MMMM yyyy" : "MMMM dd, yyyy",
    { locale: templateData.language === "de" ? de : undefined }
  );

  const relevantExperienceDetails = profileData.experience
    .slice(0, 2)
    .map(
      (exp) =>
        `- Position: ${exp.position} at ${exp.company}\n  Period: (${format(new Date(exp.startDate), "MM/yyyy")} - ${exp.ongoing ? "Present" : format(new Date(exp.endDate || Date.now()), "MM/yyyy")})\n  Description/Achievements: ${exp.description || "N/A"}`
    )
    .join("\n");

  let jobRequirements = "N/A";
  if (jobData?.notes) {
    const notesLower = jobData.notes.toLowerCase();
    const reqKeywords = [
      "what sets you apart:",
      "anforderungen:",
      "requirements:",
      "erwartet:",
      "required:",
      "qualifikationen:",
      "qualifications:",
    ];
    let reqStartIndex = -1;
    for (const kw of reqKeywords) {
      reqStartIndex = notesLower.indexOf(kw);
      if (reqStartIndex !== -1) {
        reqStartIndex += kw.length;
        break;
      }
    }
    if (reqStartIndex !== -1) {
      const endKeywords = ["why join:", "wir bieten:", "benefits:", "\n\n\n"];
      let reqEndIndex = jobData.notes.length;
      for (const endKw of endKeywords) {
        const tempEndIndex = jobData.notes.indexOf(endKw, reqStartIndex);
        if (tempEndIndex !== -1 && tempEndIndex < reqEndIndex) {
          reqEndIndex = tempEndIndex;
        }
      }
      jobRequirements = jobData.notes
        .substring(reqStartIndex, reqEndIndex)
        .trim();
    } else {
      jobRequirements = jobData.notes.substring(0, 500) + "...";
    }
  }

  const companyAddressString = jobData
    ? [
        jobData.company,
        jobData.contactPerson?.name
          ? templateData.language === "de"
            ? `z.Hd. ${jobData.contactPerson.name}`
            : jobData.contactPerson.name
          : null,
        jobData.companyStreet,
        jobData.companyPostalCode
          ? `${jobData.companyPostalCode} ${jobData.companyCity || ""}`
          : jobData.companyCity,
      ]
        .filter(Boolean)
        .join("\n")
    : "Your Company\n[City]";

  // --- PROMPT ---
  let prompt = `**Instruction:** Generate a professional and polite cover letter in ${templateData.language === "de" ? "German" : "English"}.
  **Style:** ${templateData.style} ${templateData.language === "de" && templateData.din5008Compliant ? "(DIN 5008 compliant formatting preferred)" : ""}

  **Goal:** Convince the reader that the applicant (${profileData.personalDetails.firstName} ${profileData.personalDetails.lastName}) is an excellent candidate for the position of ${jobData?.jobTitle || "the advertised position"} at ${jobData?.company || "your company"}. Create a clear connection ("roter Faden") between the applicant's profile and the job requirements. Highlight relevant achievements.

  **Applicant Profile:**
  Name: ${profileData.personalDetails.firstName} ${profileData.personalDetails.lastName}
  Contact: ${profileData.personalDetails.address || ""}, ${profileData.personalDetails.postalCode || ""} ${profileData.personalDetails.city || ""}, Phone: ${profileData.personalDetails.phone || "N/A"}, Email: ${profileData.personalDetails.email}
  Summary/Key Strengths (Use for inspiration, rephrase professionally for introduction): ${profileData.summary || "Motivated professional"}
  Relevant Experience Details (Focus on achievements/results from descriptions):\n${relevantExperienceDetails || "No specific experience details provided."}
  Key Skills: ${profileData.skills
    .slice(0, 10)
    .map((s) => s.name)
    .join(", ")}

  **Target Job:**
  Job Title: ${jobData?.jobTitle || "Advertised Position"}
  Company Address Details: ${companyAddressString}
  Contact Person Name: ${jobData?.contactPerson?.name || "Not specified"}
  Keywords to integrate naturally: ${keywords.join(", ")}
  Key Job Requirements/Notes (Address these points specifically):\n${jobRequirements}

  **Task:** Write the complete cover letter. Structure the output CLEARLY using the following tags EXACTLY as written, with the content for each section immediately following the tag on a new line:
  [PERSONAL_DETAILS_BLOCK]
  (Formatted sender address block: Name, Address, Phone, Email)
  [COMPANY_ADDRESS_BLOCK]
  (Use the provided 'Company Address Details'. Format it correctly for a letter address block.)
  [DATE]
  (Current date: ${currentDateFormatted})
  [SUBJECT]
  (Subject line: "Bewerbung als ${jobData?.jobTitle || "Advertised Position"}" possibly with Ref. if available in notes. Output PLAIN TEXT, no markdown bolding.)
  [SALUTATION]
  (Personalized using 'Contact Person Name' if possible, otherwise formal generic)
  [INTRODUCTION]
  (Engaging opening paragraph. Rephrase summary professionally. State the purpose and express specific interest in THIS role and THIS company, possibly referencing something from the job notes like company culture or technology stack.)
  [MAIN_BODY]
  (Structure in 2-3 logical paragraphs:
   1. Start with the most impactful experience/achievement from 'Relevant Experience Details' and explicitly link it to a key 'Job Requirement'. Integrate relevant keywords.
   2. Discuss other relevant skills and experiences, addressing how they meet further job requirements. If there's a technology gap (e.g., profile mentions React, job requires Vue), address it positively (strong foundation, quick learner, transferable skills).
   3. Conclude the main body by reiterating strong motivation for this specific role at this company, perhaps linking back to company values or opportunities mentioned in job notes if applicable.)
  [CLOSING]
  (Standard closing paragraph expressing interest in an interview, closing phrase like "Mit freundlichen Grüßen" or "Sincerely,", and typed applicant name.)

  **ULTRA IMPORTANT:** Absolutely DO NOT include any placeholders like "[...]" or "(...)" or comments like "(Address missing)" or similar instructions within the generated text for any section. If information is missing, omit it or phrase the sentence naturally without the missing piece. The output must only contain the final cover letter text for each section.
  `;
  // --- END OF OPTIMIZED PROMPT ---

  console.log(
    "Server Action: Sending prompt to LLM:",
    prompt.substring(0, 500) + "..."
  );

  try {
    // --- 2. Call the LLM API ---
    const result = await model.generateContent(prompt);
    const response = result.response;
    const generatedText = response.text();

    console.log(
      "Server Action: Received response from LLM:",
      generatedText.substring(0, 500) + "..."
    );

    // --- 3. Parse the Response using the tag-boundary logic ---
    const parsedContent: any = {
      keywords,
      templateStyle: templateData.style,
      templateLanguage: templateData.language,
      din5008Compliant: templateData.din5008Compliant,
    };

    const allTags = [
      "[PERSONAL_DETAILS_BLOCK]",
      "[COMPANY_ADDRESS_BLOCK]",
      "[DATE]",
      "[SUBJECT]",
      "[SALUTATION]",
      "[INTRODUCTION]",
      "[MAIN_BODY]",
      "[CLOSING]",
    ];

    let parsingSuccessful = true;
    allTags.forEach((tag) => {
      const content = extractSectionBetweenTags(generatedText, tag, allTags);
      const sectionName = tag.slice(1, -1);
      if (content === `[${sectionName} not found]`) {
        parsingSuccessful = false;
        console.error(`Server Action: Parsing failed for tag ${tag}`);
      }
      const camelCaseKey = sectionName
        .toLowerCase()
        .replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
      parsedContent[camelCaseKey] = content
        .replace(/\[.*?\]/g, "")
        .replace(/\*\*/g, "")
        .trim();
    });

    // --- 4. Overwrite Date with Server-Generated Date ---
    parsedContent.date = currentDateFormatted;
    console.log(
      "Server Action: Overwriting date with server-generated:",
      parsedContent.date
    );

    if (!parsingSuccessful) {
      console.error(
        "Server Action: Parsing failed for one or more sections. Review LLM response and parsing logic."
      );
    }

    console.log("Server Action: Final Parsed content:", parsedContent);

    // --- 5. Return Success ---
    return { success: true, content: parsedContent };
  } catch (error: any) {
    console.error("Server Action: Error calling LLM API:", error);
    let errorMessage = "Failed to generate cover letter content.";
    if (error.message) {
      errorMessage += ` Error: ${error.message}`;
    }
    if (error.message && error.message.includes("SAFETY")) {
      errorMessage =
        "Inhaltsgenerierung aufgrund von Sicherheitsrichtlinien blockiert. Bitte Prompt anpassen.";
    }
    return { success: false, error: errorMessage };
  }
}
