# Joatra (w.i.p)

Ein modernes Tool zur Verwaltung deiner Jobbewerbungen. Behalte den Überblick über alle deine Bewerbungen, verfolge deren Status, organisiere deinen Jobsuchprozess effizient und generiere passende Bewerbungsdokumente.

<p align="center">
<img src="./public/assets/images/joatra_title_02.png" alt="Joatra Header Banner" width="600">
</p>

## Features

### Bewerbungs-Management:

- Füge Jobdetails wie Unternehmen, Position, Links, Gehaltsvorstellungen, Tech-Stack und Bewerbungsdatum hinzu.
- Verfolge den Status jeder Bewerbung (Beworben, Interview, Abgelehnt, Angenommen).
- Filtere deine Bewerbungen nach Status.
- Füge individuelle Notizen und Ablehnungsgründe hinzu.
- **Ansicht-Optionen:** Wechsle zwischen einer kompakten Kachelansicht und einer detaillierten Listenansicht.

### Benutzerprofil:

- Verwalte zentral deine persönlichen Daten (Kontakt, Adresse etc.).
- Hinterlege detailliert deinen Werdegang: Ausbildung und Berufserfahrung.
- Pflege deine Fähigkeiten (Skills), Sprachkenntnisse und optional Interessen.
- Diese Daten bilden die Grundlage für die Dokumenten-Generatoren.

### Vermittler-Management:

- Erfasse und verwalte Kontakte zu Personalvermittlern.
- Ordne Bewerbungen direkt einem Vermittler zu.

### CV-Generator:

- Erstelle automatisch professionelle Lebensläufe im PDF-Format.
- Wähle aus verschiedenen Templates (z.B. Standard, Modern, Enhanced).
- Lasse den Lebenslauf optional auf eine spezifische Stelle zuschneiden (ATS-optimiert).
- Nutze KI-Unterstützung zur Optimierung von Tätigkeitsbeschreibungen.
- **Inhalts-Editor:** Bearbeite die generierten Texte direkt in der Vorschau vor dem Download.

### Anschreiben-Generator:

- Erstelle automatisch professionelle Anschreiben im PDF-Format.
- Lasse das Anschreiben optional auf eine spezifische Stelle zuschneiden (ATS-optimiert).
- Wähle aus verschiedenen Templates und Stilen (z.B. Formal, Modern, Deutsch/Englisch).
- Nutze KI-Unterstützung zur Generierung der Textinhalte basierend auf deinem Profil und der Stelle.
- **Inhalts-Editor:** Bearbeite die generierten Texte direkt in der Vorschau vor dem Download.

### Weitere Features:

- **Benutzerkonten:** Sichere Authentifizierung mit E-Mail und Passwort über Firebase.
- **Responsive Design:** Optimiert für Desktop und mobile Geräte.

## Tech Stack

- **Frontend:** Next.js (App Router), React, TypeScript
- **Styling:** Tailwind CSS, Material UI (MUI)
- **Authentifizierung & Datenbank:** Firebase (Authentication & Firestore)
- **PDF-Generierung & Anzeige:** `@react-pdf/renderer`, `react-pdf`, `pdfjs-dist`
- **KI-Integration:** Google Generative AI (Gemini API)
- **Benachrichtigungen:** `react-hot-toast`
- **Datumsmanagement:** `date-fns`
