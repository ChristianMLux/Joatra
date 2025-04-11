"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import LoadingSpinner from "@/components/layout/MuiLoadingSpinner";
import { AuthCheckProps } from "@/lib/types";

/**
 * AuthCheck Component
 * Ensures that a user is authenticated before rendering child components.
 * Redirects to the login page if the user is not authenticated after loading.
 * @param {AuthCheckProps} props - Component props.
 * @param {React.ReactNode} props.children - The components to render if authenticated.
 * @returns {React.ReactElement | null} The child components or a loading spinner/null.
 */
export default function AuthCheck({ children }: AuthCheckProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      console.log(
        "AuthCheck: User not found after loading, redirecting to /login"
      );
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingSpinner message="Authentifizierung wird überprüft..." />;
  }

  if (!user) {
    console.log(
      "AuthCheck: No user, rendering null while redirect effect runs."
    );
    return null;
  }

  return <>{children}</>;
}
