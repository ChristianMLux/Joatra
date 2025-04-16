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

  let prompt = `**Instruction:** Erstelle ein professionelles Anschreiben in ${templateData.language === "de" ? "deutscher" : "englischer"} Sprache für eine Bewerbung.
  **Style:** ${templateData.style} ${templateData.language === "de" && templateData.din5008Compliant ? "(DIN 5008-konform)" : ""}

  **WICHTIGE FORMAT-ANFORDERUNGEN:**
  - Das gesamte Anschreiben MUSS auf EINE A4-Seite passen. Dies ist absolut entscheidend.
  - Halte jeden Abschnitt prägnant, aber vollständig. 
  - Die Einleitung sollte maximal 3-4 Sätze umfassen.
  - Der Hauptteil sollte 2-3 kurze, prägnante Absätze haben.
  - Der Abschluss sollte kompakt sein und auf ein Vorstellungsgespräch hinweisen.
  - Verzichte auf Füllwörter und unnötige Höflichkeitsfloskeln.
  - Verwende NICHT "..." als Abkürzung für gekürzte Inhalte. Formuliere stattdessen kompakte, vollständige Sätze.

  **Ziel:** Überzeuge den Leser, dass der Bewerber (${profileData.personalDetails.firstName} ${profileData.personalDetails.lastName}) ein:e exzellente:r Kandidat:in für die Position als ${jobData?.jobTitle || "die ausgeschriebene Position"} bei ${jobData?.company || "Ihrem Unternehmen"} ist. Stelle einen klaren Bezug ("roter Faden") zwischen dem Profil des Bewerbers und den Anforderungen der Stelle her. Hebe relevante Erfolge hervor.

  **Bewerber-Profil:**
  Name: ${profileData.personalDetails.firstName} ${profileData.personalDetails.lastName}
  Kontakt: ${profileData.personalDetails.address || ""}, ${profileData.personalDetails.postalCode || ""} ${profileData.personalDetails.city || ""}, Tel.: ${profileData.personalDetails.phone || "N/A"}, E-Mail: ${profileData.personalDetails.email}
  Zusammenfassung/Stärken (Zur Inspiration für die Einleitung): ${profileData.summary || "Motivierte:r Fachkraft"}
  Relevante Berufserfahrung (Konzentriere dich auf Erfolge/Ergebnisse):\n${relevantExperienceDetails || "Keine spezifischen Erfahrungsdetails angegeben."}
  Schlüsselkompetenzen: ${profileData.skills
    .slice(0, 10)
    .map((s) => s.name)
    .join(", ")}

  **Zielposition:**
  Jobtitel: ${jobData?.jobTitle || "Ausgeschriebene Position"}
  Firmenadresse: ${companyAddressString}
  Ansprechpartner: ${jobData?.contactPerson?.name || "Nicht angegeben"}
  Schlüsselwörter zur natürlichen Integration: ${keywords.join(", ")}
  Hauptanforderungen/Notizen (Auf diese Punkte gezielt eingehen):\n${jobRequirements}

  **Aufgabe:** Erstelle das vollständige Anschreiben. Strukturiere die Ausgabe DEUTLICH mit den folgenden Tags EXAKT wie geschrieben, wobei der Inhalt für jeden Abschnitt unmittelbar nach dem jeweiligen Tag auf einer neuen Zeile folgt:
  [PERSONAL_DETAILS_BLOCK]
  (Formatierter Absenderblock: Name, Adresse, Telefon, E-Mail)
  [COMPANY_ADDRESS_BLOCK]
  (Verwende die angegebene 'Firmenadresse'. Formatiere sie korrekt für die Adresszeile eines Briefes.)
  [DATE]
  (Aktuelles Datum: ${currentDateFormatted})
  [SUBJECT]
  (Betreffzeile: "Bewerbung als ${jobData?.jobTitle || "Ausgeschriebene Position"}" ggf. mit Ref., falls in den Notizen verfügbar. Gib REINEN TEXT aus, keine Markdown-Formatierung wie Fettschrift.)
  [SALUTATION]
  (Personalisierte Anrede mit 'Ansprechpartner', falls möglich, sonst formale Standardanrede)
  [INTRODUCTION]
  (Ansprechender Einleitungsabsatz. Formuliere die Zusammenfassung professionell um. Nenne den Zweck und drücke spezifisches Interesse an DIESER Position und DIESEM Unternehmen aus, evtl. mit Bezug auf etwas aus den Job-Notizen wie Unternehmenskultur oder verwendete Technologien.)
  [MAIN_BODY]
  (Strukturiere in 2-3 logischen Absätzen:
   1. Beginne mit der wirkungsvollsten Erfahrung/Erfolg aus 'Relevante Berufserfahrung' und verknüpfe sie explizit mit einer Hauptanforderung der Stelle. Integriere relevante Schlüsselwörter.
   2. Stelle weitere relevante Fähigkeiten und Erfahrungen vor, die weitere Jobanforderungen erfüllen. Falls es eine Technologie-Lücke gibt (z.B. Profil erwähnt React, Job erfordert Vue), adressiere diese positiv (solide Grundlage, schnelle Lernfähigkeit, übertragbare Fähigkeiten).
   3. Schließe den Hauptteil mit einer erneuten Betonung der starken Motivation für diese spezifische Position bei diesem Unternehmen ab, evtl. mit Bezug auf Unternehmenswerte oder Möglichkeiten, die in den Job-Notizen erwähnt werden.)
  [CLOSING]
  (Standardmäßiger Schlussabsatz mit Interesse an einem Vorstellungsgespräch, Schlussformel wie "Mit freundlichen Grüßen" oder "Sincerely,", und dem Namen des Bewerbers.)

  **ÄUSSERST WICHTIG:** Füge KEINE Platzhalter wie "[...]" oder "(...)" oder Kommentare wie "(Adresse fehlt)" oder ähnliche Anweisungen im generierten Text für irgendeinen Abschnitt ein. Falls Informationen fehlen, lasse sie aus oder formuliere den Satz natürlich ohne das fehlende Element. Die Ausgabe darf NUR den endgültigen Anschreiben-Text für jeden Abschnitt enthalten.
  `;

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
