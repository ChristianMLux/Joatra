"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import LoadingSpinner from "@/components/layout/LoadingSpinner";
import { AuthCheckProps } from "@/lib/types";

export default function AuthCheck({ children }: AuthCheckProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <LoadingSpinner message="Authentifizierung wird überprüft..." />;
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  return <>{children}</>;
}
