"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { logout } from "@/lib/firebase/firebase";
import toast from "react-hot-toast";

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
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="font-bold text-xl text-blue-600">
          Job Tracker
        </Link>

        <nav>
          <ul className="flex space-x-4">
            {!loading && (
              <>
                {user ? (
                  <>
                    <li>
                      <Link
                        href="/"
                        className={`cursor-pointer ${pathname === "/" ? "text-blue-600" : "text-gray-600 hover:text-blue-600"}`}
                      >
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/jobs/add"
                        className={`cursor-pointer ${pathname === "/jobs/add" ? "text-blue-600" : "text-gray-600 hover:text-blue-600"}`}
                      >
                        Job hinzufügen
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="text-gray-600 hover:text-blue-600"
                      >
                        Abmelden
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link
                        href="/login"
                        className={`cursor-pointer ${pathname === "/login" ? "text-blue-600" : "text-gray-600 hover:text-blue-600"}`}
                      >
                        Anmelden
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/register"
                        className={`cursor-pointer ${pathname === "/register" ? "text-blue-600" : "text-gray-600 hover:text-blue-600"}`}
                      >
                        Registrieren
                      </Link>
                    </li>
                  </>
                )}
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
