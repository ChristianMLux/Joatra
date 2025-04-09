"use client";

import AuthCheck from "@/components/auth/AuthCheck";
import RecruiterForm from "@/components/recruiters/RecruiterForm";
import { useParams } from "next/navigation";
import LoadingSpinner from "@/components/layout/LoadingSpinner";
import { useAuth } from "@/providers/AuthProvider";

export default function EditRecruiterPage() {
  const params = useParams();
  const id = params?.id as string;
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return <AuthCheck>{id && <RecruiterForm recruiterId={id} />}</AuthCheck>;
}
