"use client";

import Link from "next/link";
import { Typography } from "@mui/material";
import MuiButton from "@/components/ui/Button";

export default function CallToActionSection() {
  return (
    <section className="py-16 bg-gray-50 px-6 md:px-8">
      <div className="container mx-auto text-center">
        <Typography
          variant="h4"
          component="h2"
          className="text-2xl md:text-3xl font-bold text-gray-800 mb-8"
        >
          Bereit, deine Jobsuche zu optimieren?
        </Typography>
        <div className="flex justify-center space-x-4">
          <MuiButton
            variant="primary"
            size="lg"
            component={Link}
            href="/register"
            className="shadow hover:shadow-md"
          >
            Kostenlos Registrieren
          </MuiButton>
          <MuiButton variant="outline" size="lg" component={Link} href="/login">
            Anmelden
          </MuiButton>
        </div>
      </div>
    </section>
  );
}
