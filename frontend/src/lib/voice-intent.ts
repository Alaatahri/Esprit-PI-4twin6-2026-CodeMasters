/**
 * Normalise le texte pour la détection d’intentions (FR accent-insensible).
 * Ne casse pas l’arabe : on applique NFD + suppression des signes diacritiques combinés.
 */
export function normalizeVoiceText(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Codes langue préférés pour Web Speech API */
export function speechRecognitionLang(uiLang: string): string {
  if (uiLang === "ar-SA") return "ar-SA";
  if (uiLang === "en-US") return "en-US";
  return "fr-FR";
}
