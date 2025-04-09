"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginWithEmail } from "@/lib/firebase/firebase";
import MuiButton from "@/components/ui/Button";
import toast from "react-hot-toast";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await loginWithEmail(email, password);
      toast.success("Erfolgreich angemeldet");
      router.push("/");
    } catch (error: any) {
      let errorMessage = "Fehler bei der Anmeldung";

      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        errorMessage = "E-Mail oder Passwort ist falsch";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage =
          "Zu viele fehlgeschlagene Anmeldeversuche. Bitte versuche es später erneut.";
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto card">
      <h1 className="text-2xl font-bold mb-6">Anmelden</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            E-Mail
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            placeholder="deine@email.de"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Passwort
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            placeholder="Dein Passwort"
            required
          />
        </div>

        <MuiButton
          type="submit"
          className="btn-primary w-full mt-4"
          disabled={loading}
        >
          {loading ? "Wird angemeldet..." : "Anmelden"}
        </MuiButton>
      </form>

      <div className="mt-4 text-center text-sm">
        <p>
          Noch kein Konto?{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            Jetzt registrieren
          </Link>
        </p>
      </div>
    </div>
  );
}
