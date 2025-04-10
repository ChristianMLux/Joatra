import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/providers/AuthProvider";
import { JobsProvider } from "@/lib/hooks/hooks";
import { RecruitersProvider } from "@/providers/RecruitersProvider";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Metadata } from "next";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "@/theme";

export const metadata: Metadata = {
  title: "Joatra",
  description: "Behalte den Überblick über deine Bewerbungen",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </head>
      <body className="flex flex-col min-h-screen">
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
              <JobsProvider>
                <RecruitersProvider>
                  <Header />
                  <main className="container mx-auto px-4 py-6 flex-grow">
                    {children}
                  </main>
                  <Toaster position="bottom-right" />
                  <Footer />
                </RecruitersProvider>
              </JobsProvider>
            </AuthProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
