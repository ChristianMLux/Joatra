"use client";

import AuthCheck from "@/components/auth/AuthCheck";
import RecruiterDetail from "@/components/recruiters/RecruiterDetail";
import { useParams } from "next/navigation";
import LoadingSpinner from "@/components/layout/LoadingSpinner";
import { useAuth } from "@/providers/AuthProvider";

export default function RecruiterDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return <AuthCheck>{id && <RecruiterDetail recruiterId={id} />}</AuthCheck>;
}
