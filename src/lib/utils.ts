import { format } from "date-fns";
import { de, enUS } from "date-fns/locale";

const locales = { de, en: enUS };

/**
 * Formatiert ein Datumsobjekt, einen Timestamp oder einen String in ein lesbares Format.
 * Akzeptiert verschiedene Eingabetypen und gibt einen formatierten String oder einen Platzhalter zurück.
 *
 * @param dateInput - Das zu formatierende Datum (Timestamp, Date-Objekt, String, number).
 * @param formatString - Das gewünschte Ausgabeformat (date-fns Format-String). Standard: 'dd. MMMM yyyy'.
 * @param localeKey - Der Schlüssel für die Locale ('de' oder 'en'). Standard: 'de'.
 * @param fallback - Der String, der zurückgegeben wird, wenn die Formatierung fehlschlägt. Standard: '-'.
 * @returns Der formatierte Datumsstring oder der Fallback-String.
 */
export function formatDate(
  dateInput: any,
  formatString: string = "dd. MMMM yyyy",
  localeKey: keyof typeof locales = "de",
  fallback: string = "-"
): string {
  if (!dateInput) {
    return fallback;
  }

  let dateObj: Date | null = null;

  try {
    if (
      dateInput &&
      typeof dateInput === "object" &&
      typeof dateInput.toDate === "function"
    ) {
      dateObj = dateInput.toDate();
    } else if (dateInput instanceof Date) {
      dateObj = dateInput;
    } else {
      const parsed = new Date(dateInput);
      if (!isNaN(parsed.getTime())) {
        dateObj = parsed;
      }
    }

    if (dateObj && !isNaN(dateObj.getTime())) {
      const locale = locales[localeKey] || locales.de;
      return format(dateObj, formatString, { locale });
    } else {
      console.warn(
        "formatDate: Ungültiges Datumsobjekt erhalten nach Konvertierung von:",
        dateInput
      );
      return fallback;
    }
  } catch (error) {
    console.error(
      "formatDate: Fehler bei der Datumsformatierung:",
      error,
      "Input:",
      dateInput
    );
    return fallback;
  }
}

/**
 * Serialisiert Objekte für Server Actions, indem Timestamp-Objekte in ISO-Strings konvertiert werden.
 * @param obj - Das zu serialisierende Objekt.
 * @returns Eine serialisierte Kopie des Eingabeobjekts.
 */
export function serializeObjectForServerAction<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (key, value) => {
      if (
        value &&
        typeof value === "object" &&
        "seconds" in value &&
        "nanoseconds" in value &&
        typeof value.seconds === "number" &&
        typeof value.nanoseconds === "number"
      ) {
        return new Date(
          value.seconds * 1000 + value.nanoseconds / 1000000
        ).toISOString();
      }
      return value;
    })
  );
}
