"use client";

import CoverLetterGenerator from "@/components/coverLetter/CoverLetterGenerator";
import { CoverLetterGeneratorProvider } from "@/providers/CoverLetterGeneratorProvider";
import AuthCheck from "@/components/auth/AuthCheck";

export default function CoverLetterGeneratorPage() {
  return (
    <AuthCheck>
      <CoverLetterGeneratorProvider>
        <CoverLetterGenerator />
      </CoverLetterGeneratorProvider>
    </AuthCheck>
  );
}
