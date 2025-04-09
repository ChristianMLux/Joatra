"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { logout } from "@/lib/firebase/firebase";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Title from "@/components/ui/Title";
import Button from "@/components/ui/Button";

export default function Header() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Erfolgreich abgemeldet");
      router.push("/login");
    } catch (error) {
      toast.error("Fehler beim Abmelden");
    }
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            {/* Logo/App Name */}
            <Title
              text="Joatra"
              size="xl"
              asLink={true}
              href="/"
              className="tracking-tight"
            />

            {/* Main Navigation */}
            {!loading && user && (
              <nav className="flex justify-between space-x-6">
                <Link
                  href="/"
                  className={`font-medium ${
                    pathname === "/"
                      ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/recruiters"
                  className={`font-medium ${
                    pathname === "/recruiters" ||
                    pathname.startsWith("/recruiters/")
                      ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  Vermittler
                </Link>
                <Link
                  href="/stats"
                  className={`font-medium ${
                    pathname === "/stats"
                      ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  Statistiken
                </Link>
              </nav>
            )}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center space-x-4">
                    <Link href="/jobs/add">
                      <Button variant="primary" size="sm">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Neue Bewerbung
                      </Button>
                    </Link>
                    <div className="relative group">
                      <button className="flex items-center text-gray-700 hover:text-blue-600">
                        <span className="hidden md:inline mr-2">
                          {user.email?.split("@")[0]}
                        </span>
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                          {user.email?.charAt(0).toUpperCase()}
                        </div>
                      </button>
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Profil
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Abmelden
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex space-x-3">
                    <Link href="/login">
                      <Button variant="outline" size="sm">
                        Anmelden
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button variant="primary" size="sm">
                        Registrieren
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
