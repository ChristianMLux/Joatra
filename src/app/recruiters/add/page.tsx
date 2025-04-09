"use client";

import AuthCheck from "@/components/auth/AuthCheck";
import RecruiterForm from "@/components/recruiters/RecruiterForm";

export default function AddRecruiter() {
  return (
    <AuthCheck>
      <RecruiterForm />
    </AuthCheck>
  );
}
