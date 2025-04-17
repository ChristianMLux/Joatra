"use client";

import { Suspense } from "react";
import { useAuth } from "@/providers/AuthProvider";
import LoadingSpinner from "@/components/layout/MuiLoadingSpinner";
import AuthCheck from "@/components/auth/AuthCheck";
import JobDashboardContent from "@/components/jobs/JobDashboardContent";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import CallToActionSection from "@/components/landing/CallToActionSection";

export default function Home() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <HeroSection />
        <FeaturesSection />
        <CallToActionSection />
      </div>
    );
  }

  return (
    <AuthCheck>
      <Suspense
        fallback={<LoadingSpinner message="Dashboard wird geladen..." />}
      >
        <JobDashboardContent />
      </Suspense>
    </AuthCheck>
  );
}
