"use client";

import AuthCheck from "@/components/auth/AuthCheck";
import JobForm from "@/components/jobs/JobForm";

export default function AddJob() {
  return (
    <AuthCheck>
      <JobForm />
    </AuthCheck>
  );
}
