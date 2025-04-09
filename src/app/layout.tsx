import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/providers/AuthProvider";
import { JobsProvider } from "@/lib/hooks/hooks";
import { RecruitersProvider } from "@/providers/RecruitersProvider";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Job Tracker",
  description: "Behalte den Überblick über deine Bewerbungen",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="flex flex-col min-h-screen">
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
      </body>
    </html>
  );
}
