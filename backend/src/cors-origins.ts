/**
 * Origines autorisées pour CORS.
 * En prod : définir CORS_ORIGINS (liste séparée par des virgules) et/ou FRONTEND_URL.
 * FRONTEND_URL est aussi utilisé pour les liens e-mail — on l’ajoute aux origines CORS si présent.
 */
export function buildCorsOrigins(): string[] {
  const devDefaults = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ];

  const fromCsv = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const fe = process.env.FRONTEND_URL?.trim();
  const fromFrontend = fe ? [fe.replace(/\/$/, '')] : [];

  const explicit = [...new Set([...fromCsv, ...fromFrontend])];

  if (explicit.length > 0) {
    const out = new Set<string>([...explicit]);
    if (process.env.NODE_ENV !== 'production') {
      devDefaults.forEach((o) => out.add(o));
    }
    return [...out];
  }

  if (process.env.NODE_ENV === 'production') {
    return [];
  }

  return devDefaults;
}
