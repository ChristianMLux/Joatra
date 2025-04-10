"use client";

import ProfileForm from "@/components/profile/ProfileForm";
import AuthCheck from "@/components/auth/AuthCheck";

export default function CreateProfilePage() {
  return (
    <AuthCheck>
      <ProfileForm />
    </AuthCheck>
  );
}
