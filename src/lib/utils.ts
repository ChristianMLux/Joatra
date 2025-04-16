/**
 * Serialisiert Objekte für Server Actions, indem Timestamp-Objekte in ISO-Strings konvertiert werden
 * @returns Eine serialisierte Kopie des Eingabeobjekts
 */
export function serializeObjectForServerAction<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (key, value) => {
      if (
        value &&
        typeof value === "object" &&
        "seconds" in value &&
        "nanoseconds" in value
      ) {
        return new Date(
          (value as { seconds: number }).seconds * 1000
        ).toISOString();
      }
      return value;
    })
  );
}
