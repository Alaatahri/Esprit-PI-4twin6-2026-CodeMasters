type ScoredExpert = {
  _id: any;
  prenom?: string;
  nom: string;
  email: string;
  telephone?: string;
  competences?: string[];
  isAvailable?: boolean;
  rating?: number;
  experienceYears?: number;
  score: number;
};

function norm(s: unknown): string {
  return String(s ?? '')
    .trim()
    .toLowerCase();
}

/** Détail du score pour matcher experts ↔ analyse projet */
export function computeExpertMatchScore(
  expert: Record<string, unknown>,
  requiredCompetences: string[],
): { score: number; matchedRequiredCount: number; requiredLen: number } {
  const required = Array.isArray(requiredCompetences)
    ? requiredCompetences.map(norm).filter(Boolean)
    : [];

  const expertCompetences: string[] = Array.isArray(expert?.competences)
    ? (expert.competences as unknown[]).map(norm).filter(Boolean)
    : [];

  const rating = Number(expert?.rating ?? 0);
  const years = Number(expert?.experienceYears ?? 0);
  const cappedYears = Math.min(Math.max(0, years), 10);

  if (required.length === 0) {
    /** Pas de compétences extraites par l’IA : tri réel note + expérience (échelle 0–100). */
    const ratingWeight = (Math.max(0, Math.min(5, rating)) / 5) * 55;
    const expWeight = (cappedYears / 10) * 45;
    const score = Math.round((ratingWeight + expWeight) * 10) / 10;
    return { score, matchedRequiredCount: 0, requiredLen: 0 };
  }

  let matchedRequiredCount = 0;
  for (const req of required) {
    if (expertCompetences.includes(req)) matchedRequiredCount++;
  }

  const ratingScore = (Math.max(0, Math.min(5, rating)) / 5) * 25;
  const experienceScore = (cappedYears / 10) * 15;
  const competenceScore = (matchedRequiredCount / required.length) * 60;
  const totalScore = competenceScore + ratingScore + experienceScore;
  const score = Math.round(totalScore * 10) / 10;

  return { score, matchedRequiredCount, requiredLen: required.length };
}

export async function findBestExperts(
  requiredCompetences: string[],
  userModel: { find: (q: any) => any },
  limit = 5,
): Promise<ScoredExpert[]> {
  const experts: any[] = await userModel
    .find({
      role: 'expert',
      $or: [{ isAvailable: true }, { isAvailable: { $exists: false } }],
    })
    .lean()
    .exec();

  const scored = experts
    .map((expert) => {
      const { score, matchedRequiredCount, requiredLen } =
        computeExpertMatchScore(expert, requiredCompetences);

      const out: ScoredExpert = {
        _id: expert?._id,
        prenom: expert?.prenom,
        nom: expert?.nom,
        email: expert?.email,
        telephone: expert?.telephone,
        competences: expert?.competences,
        isAvailable: expert?.isAvailable,
        rating: expert?.rating,
        experienceYears: expert?.experienceYears,
        score,
      };

      return { out, matchedRequiredCount, requiredLen };
    })
    .filter((x) =>
      x.requiredLen === 0 ? true : x.matchedRequiredCount > 0,
    )
    .sort((a, b) => b.out.score - a.out.score)
    .slice(0, limit)
    .map((x) => x.out);

  return scored;
}
