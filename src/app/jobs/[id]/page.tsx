"use client";

import AuthCheck from "@/components/auth/AuthCheck";
import JobForm from "@/components/jobs/JobForm";
import { useParams } from "next/navigation";
import LoadingSpinner from "@/components/layout/MuiLoadingSpinner";
import { useAuth } from "@/providers/AuthProvider";

export default function EditJobPage() {
  const params = useParams();
  const id = params?.id as string;
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return <AuthCheck>{id && <JobForm jobId={id} />}</AuthCheck>;
}
