"use client";

import CVGenerator from "@/components/cv/CVGenerator";
import { CVGeneratorProvider } from "@/providers/CVGeneratorProvider";
import AuthCheck from "@/components/auth/AuthCheck";

export default function CVGeneratorPage() {
  return (
    <AuthCheck>
      <CVGeneratorProvider>
        <CVGenerator />
      </CVGeneratorProvider>
    </AuthCheck>
  );
}
