import { Seniority } from "@prisma/client";

const NON_ENGLISH_PHRASES = [
  "portuguese required", "fluent in german", "fluent in french", "fluent in spanish",
  "fluent in dutch", "fluent in italian", "fluent in polish", "fluent in russian",
  "native speaker of german", "native speaker of french", "native speaker of spanish",
  "bilingual german", "bilingual french", "bilingual spanish", "bilingual dutch",
  "deutsch", "deutschkenntnisse", "wir suchen", "stellenanzeige",
  "nous cherchons", "nous recherchons", "buscamos", "se busca",
  "vous parlez", "parlez-vous", "sprichst du", "sprecht ihr",
];

const NON_ENGLISH_STOPWORDS = [
  " und ", " oder ", " mit ", " für ", " von ", " bei ", " als ", " nach ", " aus ", " vor ",
  " est ", " les ", " des ", " une ", " vous ", " nous ", " ils ", " que ", " qui ",
  " para ", " por ", " con ", " del ", " los ", " las ", " una ", " que ", " como ",
  " voor ", " van ", " het ", " een ", " met ", " zijn ", " worden ",
];

export function isEnglishOnly(title: string, description: string): boolean {
  const combined = `${title} ${description}`.toLowerCase();

  for (const phrase of NON_ENGLISH_PHRASES) {
    if (combined.includes(phrase)) return false;
  }

  // Count non-English stopwords in description (sample first 1000 chars)
  const sample = description.toLowerCase().slice(0, 1000);
  let stopwordHits = 0;
  for (const word of NON_ENGLISH_STOPWORDS) {
    if (sample.includes(word)) stopwordHits++;
  }
  if (stopwordHits >= 3) return false;

  return true;
}

const SENIORITY_RULES: Array<{ patterns: string[]; level: Seniority }> = [
  { patterns: ["intern", "trainee", "apprentice", "graduate"], level: Seniority.INTERN },
  { patterns: ["junior", "jr.", "jr ", "entry level", "entry-level", "associate"], level: Seniority.JUNIOR },
  { patterns: ["principal"], level: Seniority.PRINCIPAL },
  { patterns: ["staff"], level: Seniority.STAFF },
  { patterns: ["tech lead", "team lead", "lead developer", "lead engineer", "engineering lead"], level: Seniority.LEAD },
  { patterns: ["senior", "sr.", "sr ", "experienced", "expert"], level: Seniority.SENIOR },
];

export function parseSeniority(title: string, description: string): Seniority | null {
  const titleLower = title.toLowerCase();

  // Check title first — title signal is the most reliable
  for (const rule of SENIORITY_RULES) {
    for (const pattern of rule.patterns) {
      if (titleLower.includes(pattern)) return rule.level;
    }
  }

  // Fall back to description (first 1500 chars)
  const descLower = description.slice(0, 1500).toLowerCase();
  for (const rule of SENIORITY_RULES) {
    for (const pattern of rule.patterns) {
      if (descLower.includes(pattern)) return rule.level;
    }
  }

  return Seniority.MID;
}
