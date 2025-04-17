"use client";

import { Typography, Paper, Grid, SvgIcon } from "@mui/material";
import {
  TrackChangesIcon,
  PersonPinIcon,
  DescriptionIcon,
  EditNoteIcon,
  GroupIcon,
  PictureAsPdfIcon,
} from "./Icons/Icons";

export default function FeaturesSection() {
  return (
    <section className="py-16 md:py-24 bg-white px-6 md:px-8">
      <div className="container mx-auto">
        <Typography
          variant="h3"
          component="h2"
          className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-16"
        >
          Funktionen im Überblick
        </Typography>
        <Grid container spacing={5} justifyContent="center">
          {/* Feature Card 1: Tracking */}
          <Grid sx={{ width: { xs: "100%", sm: "50%", md: "33.33%" } }}>
            <Paper
              elevation={0}
              className="p-6 md:p-8 text-center rounded-xl h-full flex flex-col items-center border border-gray-100 hover:shadow-lg transition-shadow duration-300"
            >
              <SvgIcon
                component={TrackChangesIcon}
                color="primary"
                sx={{ fontSize: 28, mb: 2.5 }}
              />
              <Typography
                variant="h6"
                component="h3"
                className="font-semibold mb-2.5 text-gray-800"
              >
                Bewerbungs-Tracking
              </Typography>
              <Typography
                variant="body2"
                color="textSecondary"
                className="flex-grow text-sm"
              >
                Erfasse alle Details, verfolge den Status (Beworben, Interview
                etc.) und füge Notizen hinzu.
              </Typography>
            </Paper>
          </Grid>
          {/* Feature Card 2: Profile */}
          <Grid sx={{ width: { xs: "100%", sm: "50%", md: "33.33%" } }}>
            <Paper
              elevation={0}
              className="p-6 md:p-8 text-center rounded-xl h-full flex flex-col items-center border border-gray-100 hover:shadow-lg transition-shadow duration-300"
            >
              <SvgIcon
                component={PersonPinIcon}
                color="primary"
                sx={{ fontSize: 28, mb: 2.5 }}
              />
              <Typography
                variant="h6"
                component="h3"
                className="font-semibold mb-2.5 text-gray-800"
              >
                Zentrales Profil
              </Typography>
              <Typography
                variant="body2"
                color="textSecondary"
                className="flex-grow text-sm"
              >
                Verwalte deinen Werdegang, Fähigkeiten und Kontaktdaten an einem
                Ort – die Basis für deine Dokumente.
              </Typography>
            </Paper>
          </Grid>
          {/* Feature Card 3: Generators */}
          <Grid sx={{ width: { xs: "100%", sm: "50%", md: "33.33%" } }}>
            <Paper
              elevation={0}
              className="p-6 md:p-8 text-center rounded-xl h-full flex flex-col items-center border border-gray-100 hover:shadow-lg transition-shadow duration-300"
            >
              <SvgIcon
                component={DescriptionIcon}
                color="primary"
                sx={{ fontSize: 28, mb: 2.5 }}
              />
              <Typography
                variant="h6"
                component="h3"
                className="font-semibold mb-2.5 text-gray-800"
              >
                CV & Anschreiben
              </Typography>
              <Typography
                variant="body2"
                color="textSecondary"
                className="flex-grow text-sm"
              >
                Generiere automatisch professionelle Lebensläufe und
                Anschreiben, zugeschnitten auf die jeweilige Stelle.
              </Typography>
            </Paper>
          </Grid>
          {/* Feature Card 4: Editor */}
          <Grid sx={{ width: { xs: "100%", sm: "50%", md: "33.33%" } }}>
            <Paper
              elevation={0}
              className="p-6 md:p-8 text-center rounded-xl h-full flex flex-col items-center border border-gray-100 hover:shadow-lg transition-shadow duration-300"
            >
              <SvgIcon
                component={EditNoteIcon}
                color="primary"
                sx={{ fontSize: 28, mb: 2.5 }}
              />
              <Typography
                variant="h6"
                component="h3"
                className="font-semibold mb-2.5 text-gray-800"
              >
                Inhalts-Editor
              </Typography>
              <Typography
                variant="body2"
                color="textSecondary"
                className="flex-grow text-sm"
              >
                Passe die von der KI generierten Texte für CV und Anschreiben
                vor dem Download individuell an.
              </Typography>
            </Paper>
          </Grid>
          {/* Feature Card 5: Recruiters */}
          <Grid sx={{ width: { xs: "100%", sm: "50%", md: "33.33%" } }}>
            <Paper
              elevation={0}
              className="p-6 md:p-8 text-center rounded-xl h-full flex flex-col items-center border border-gray-100 hover:shadow-lg transition-shadow duration-300"
            >
              <SvgIcon
                component={GroupIcon}
                color="primary"
                sx={{ fontSize: 28, mb: 2.5 }}
              />
              <Typography
                variant="h6"
                component="h3"
                className="font-semibold mb-2.5 text-gray-800"
              >
                Vermittler-Verwaltung
              </Typography>
              <Typography
                variant="body2"
                color="textSecondary"
                className="flex-grow text-sm"
              >
                Behalte den Überblick über deine Kontakte zu Personalvermittlern
                und deren Stellenangebote.
              </Typography>
            </Paper>
          </Grid>
          {/* Feature Card 6: PDF Export */}
          <Grid sx={{ width: { xs: "100%", sm: "50%", md: "33.33%" } }}>
            <Paper
              elevation={0}
              className="p-6 md:p-8 text-center rounded-xl h-full flex flex-col items-center border border-gray-100 hover:shadow-lg transition-shadow duration-300"
            >
              <SvgIcon
                component={PictureAsPdfIcon}
                color="primary"
                sx={{ fontSize: 28, mb: 2.5 }}
              />
              <Typography
                variant="h6"
                component="h3"
                className="font-semibold mb-2.5 text-gray-800"
              >
                PDF Export
              </Typography>
              <Typography
                variant="body2"
                color="textSecondary"
                className="flex-grow text-sm"
              >
                Exportiere deine Bewerbungsliste als übersichtliche PDF-Datei.
              </Typography>
            </Paper>
          </Grid>
        </Grid>{" "}
      </div>
    </section>
  );
}
