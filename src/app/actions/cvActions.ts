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
 **Instruction:** Du bist ein Expert/in für Lebenslauf-Optimierung. Formuliere die folgende "Original Description" für die Position "${experience.position}" bei "${experience.company}" so um, dass sie besser zur Stellenausschreibung "${jobTitle}" passt.
 
 **WICHTIG:** 
 - Behalte unbedingt die Ich-Form bei (z.B. "Ich habe entwickelt..." statt "Entwickelte...").
 - Kürze den Text nicht mit "...", sondern formuliere Inhalte komplett und prägnant.
 - Formuliere so, dass die Beschreibung auf einem CV professionell wirkt.
 - Betone Fähigkeiten und Erfolge, die für die Zielposition relevant sind.
 - Verwende starke Aktionsverben in ${language === "de" ? "deutscher" : "englischer"} Sprache.
 - Maximale Länge: 4 Zeilen (ca. 400 Zeichen), aber stelle sicher, dass alle wichtigen Informationen enthalten sind.

 **Kontext:**
 * **Original Beschreibung:** ${originalDescription}
 * **Zielposition:** ${jobTitle}
 * **Stellenbeschreibung/Anforderungen:** ${jobDescription.substring(0, 1200)}...

 **Aufgabe:** Formuliere die "Original Beschreibung" basierend auf den Anweisungen um. Gib NUR den umformulierten Text zurück, ohne zusätzliche Erklärungen oder Formatierungen.
 
 **Beispiel für gutes Ergebnis:**
 "Ich entwickelte responsive Frontend-Komponenten mit React/TypeScript und Next.js. Dabei führte ich Code-Reviews durch, implementierte automatisierte Tests und optimierte den CI-Prozess. Die Integration von Google Analytics ermöglichte mir datenbasierte Entscheidungen zur Performance-Verbesserung."
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
 **Instruction:** Du bist ein Expert/in für Lebenslauf-Optimierung. Formuliere die folgende "Original Ausbildungsbeschreibung" für den Abschluss "${education.degree}" von "${education.institution}" so um, dass sie besser zur Stellenausschreibung "${jobTitle}" passt.
 
 **WICHTIG:** 
 - Behalte unbedingt die Ich-Form bei, falls diese im Original verwendet wird.
 - Kürze den Text nicht mit "...", sondern formuliere vollständige und prägnante Sätze.
 - Hervorhebung von relevanten Kursen, Projekten oder Abschlussarbeiten, die für die Zielposition wertvoll sind.
 - Verwende klare und prägnante Sprache in ${language === "de" ? "Deutsch" : "Englisch"}.
 - Maximale Länge: 3 Zeilen (ca. 300 Zeichen).

 **Kontext:**
 * **Original Ausbildungsbeschreibung:** ${originalDescription}
 * **Zielposition:** ${jobTitle}
 * **Stellenbeschreibung/Anforderungen:** ${jobDescription.substring(0, 1000)}...

 **Aufgabe:** Formuliere die "Original Ausbildungsbeschreibung" basierend auf den Anweisungen um. Gib NUR den umformulierten Text zurück, ohne zusätzliche Erklärungen oder Formatierungen.

 **Beispiel für gutes Ergebnis:**
 "Schwerpunkte meines Studiums waren Datenbanksysteme, Cloud Computing und moderne Frontend-Technologien. In meiner Abschlussarbeit entwickelte ich eine Web-Anwendung mit React und Node.js. Praktische Erfahrung sammelte ich durch Teamprojekte mit agilen Methoden (Scrum)."
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
