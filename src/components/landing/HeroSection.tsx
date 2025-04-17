"use client";

import Link from "next/link";
import { Typography } from "@mui/material";
import MuiButton from "@/components/ui/Button";

export default function HeroSection() {
  return (
    <section className="flex-grow flex items-center bg-transparent md:py-32 px-6 md:px-8">
      <div className="container mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-12">
        <div className="w-2/3 text-left flex-grow">
          {/* Badge Placeholder */}
          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            🚀 Neu: CV & Anschreiben Editor!
          </span>

          <Typography
            variant="h2"
            component="h1"
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-5 leading-tight"
          >
            Behalte den Überblick über deine Bewerbungen –{" "}
            <span className="text-blue-600">Mühelos.</span>
          </Typography>
          <Typography
            variant="h6"
            component="p"
            className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto md:mx-0 mb-10"
          >
            Joatra hilft dir, deine Jobsuche zu organisieren, den Status deiner
            Bewerbungen zu verfolgen und professionelle Lebensläufe und
            Anschreiben zu generieren.
          </Typography>
          <div className="flex flex-col sm:flex-row justify-center md:justify-start space-y-3 sm:space-y-0 sm:space-x-4">
            <MuiButton
              variant="primary"
              size="lg"
              component={Link}
              href="/register"
              className="shadow hover:shadow-md"
            >
              Jetzt Registrieren
            </MuiButton>
            <MuiButton
              variant="outline"
              size="lg"
              component={Link}
              href="/login"
            >
              Anmelden
            </MuiButton>
          </div>
        </div>

        <div className="w-full md:w-1/3 hidden md:flex justify-center items-center flex-shrink-0">
          <div className="w-full max-w-xs h-64 md:h-80 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-lg shadow-md flex items-center justify-center">
            <Typography variant="caption" color="textSecondary">
              [Platzhalter für Bild/Illustration]
            </Typography>
          </div>
        </div>
      </div>
    </section>
  );
}
