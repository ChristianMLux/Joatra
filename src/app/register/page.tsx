"use client";

import RegisterForm from "@/components/auth/RegisterForm";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useEffect } from "react";
import LoadingSpinner from "@/components/layout/MuiLoadingSpinner";

export default function Register() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    return null;
  }

  return <RegisterForm />;
}
