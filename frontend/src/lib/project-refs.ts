/**
 * Id Mongo hex stable (string, Extended JSON `{ $oid }`, sous-doc `{ _id }`, champ `id`).
 * Évite `String({ $oid })` → `[object Object]` qui fusionne tous les clients en une fausse clé.
 */
export function mongoIdString(ref: unknown): string {
  if (ref == null || ref === "") return "";
  if (typeof ref === "string") return ref.trim();
  if (typeof ref === "number" || typeof ref === "bigint") return String(ref);
  if (typeof ref !== "object" || ref === null) return "";

  const o = ref as Record<string, unknown>;

  if (typeof o.$oid === "string") return o.$oid.trim();

  if ("_id" in o && o._id !== undefined) {
    return mongoIdString(o._id);
  }

  if (typeof o.id === "string") return o.id.trim();

  return "";
}

/** Extrait un id Mongo depuis une ref ; repli sur `String(ref)` pour valeurs non standard */
export function refId(ref: unknown): string {
  const mid = mongoIdString(ref);
  if (mid) return mid;
  if (ref == null || ref === "") return "";
  if (typeof ref === "string") return ref;
  return String(ref);
}
