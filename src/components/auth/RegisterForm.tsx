"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerWithEmail } from "@/lib/firebase/firebase";
import toast from "react-hot-toast";
import MuiButton from "@/components/ui/Button";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Die Passwörter stimmen nicht überein");
      return;
    }

    if (password.length < 6) {
      toast.error("Das Passwort muss mindestens 6 Zeichen lang sein");
      return;
    }

    setLoading(true);

    try {
      await registerWithEmail(email, password);
      toast.success("Konto erfolgreich erstellt");
      router.push("/");
    } catch (error: any) {
      let errorMessage = "Fehler bei der Registrierung";

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Diese E-Mail-Adresse wird bereits verwendet";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Ungültige E-Mail-Adresse";
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto card">
      <h1 className="text-2xl font-bold mb-6">Konto erstellen</h1>

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
            placeholder="Mindestens 6 Zeichen"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">
            Passwort bestätigen
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input-field"
            placeholder="Passwort wiederholen"
            required
          />
        </div>

        <MuiButton
          type="submit"
          className="btn-primary w-full mt-4"
          disabled={loading}
        >
          {loading ? "Wird registriert..." : "Registrieren"}
        </MuiButton>
      </form>

      <div className="mt-4 text-center text-sm">
        <p>
          Bereits ein Konto?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Jetzt anmelden
          </Link>
        </p>
      </div>
    </div>
  );
}
