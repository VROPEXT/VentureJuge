import { BusinessAnalysis } from "@/types/analysis";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

async function callGemini(prompt: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Clé Gemini manquante");

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 4000 },
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err?.error?.message || "Erreur Gemini");
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

export async function analyzePremiumGemini(idea: string): Promise<BusinessAnalysis> {
  const prompt = `Tu es VentureJuge, un expert en analyse d'idées business. Analyse cette idée et réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks.

IDÉE : ${idea}

Format JSON exact attendu :
{
  "verdict": "OPPORTUNITÉ SOLIDE" | "POTENTIEL RÉEL" | "À AFFINER" | "RISQUÉ" | "À REPENSER",
  "verdict_emoji": "🏆" | "✅" | "⚠️" | "🔴" | "❌",
  "summary": "Résumé de l'analyse en 1-2 phrases percutantes",
  "strengths": ["Point fort 1", "Point fort 2", "Point fort 3", "Point fort 4"],
  "weaknesses": ["Point faible 1", "Point faible 2", "Point faible 3"],
  "moneyPotential": {
    "score": 0-100,
    "label": "Potentiel exceptionnel | Fort potentiel | Potentiel intéressant | Potentiel modeste | Très limité",
    "details": "Explication du potentiel financier en 2 phrases",
    "estimatedRevenue": "Estimation réaliste des revenus annuels"
  },
  "risk": {
    "score": 0-100,
    "label": "Très faible risque | Risque modéré | Risque significatif | Risque élevé | Risque très élevé",
    "details": "Explication du niveau de risque en 2 phrases",
    "mainRisks": ["Risque principal 1", "Risque principal 2", "Risque principal 3"]
  },
  "marketAnalysis": "Analyse détaillée du marché en 3-4 phrases avec données chiffrées si possible",
  "recommendation": "Recommandation actionnable et concrète en 2-3 phrases",
  "isPremium": true,
  "targetAudience": "Description précise de la cible clients idéale avec données démographiques",
  "competitorAnalysis": "Analyse des 3-4 principaux concurrents et comment se différencier",
  "actionPlan": [
    "Étape 1 concrète à faire dans les 30 premiers jours",
    "Étape 2 pour les mois 2-3",
    "Étape 3 pour les mois 4-6",
    "Étape 4 pour la croissance mois 7-12"
  ],
  "breakEvenAnalysis": "Quand et comment atteindre le point mort avec chiffres réalistes",
  "fundingOptions": ["Option financement 1", "Option financement 2", "Option financement 3"],
  "growthStrategy": "Stratégie de croissance détaillée sur 12-24 mois",
  "exitStrategies": ["Stratégie de sortie 1", "Stratégie de sortie 2"]
}`;

  const text = await callGemini(prompt);
  const cleaned = text.replace(/```json|```/g, "").trim();
  const analysis = JSON.parse(cleaned);
  return { ...analysis, isPremium: true };
}

export async function generateBusinessPlanGemini(idea: string, analysis: BusinessAnalysis): Promise<any> {
  const prompt = `Tu es un expert en création d'entreprise. Génère un business plan complet en français.

IDÉE : ${idea}
ANALYSE : Verdict ${analysis.verdict}, Risque ${analysis.risk.score}/100, Potentiel ${analysis.moneyPotential.score}/100

Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks :
{
  "titre": "Nom du projet",
  "date": "Mois Année actuelle",
  "executive_summary": "Résumé exécutif en 3-4 phrases",
  "description_projet": {
    "concept": "Description du concept en 2-3 paragraphes",
    "mission": "Mission en 1 phrase",
    "vision": "Vision à 5 ans en 1 phrase",
    "modele_economique": "Comment l'entreprise gagne de l'argent"
  },
  "analyse_marche": {
    "taille_marche": "Taille du marché avec chiffres",
    "cible_principale": "Description de la cible",
    "tendances": "2-3 tendances favorables",
    "opportunite": "Opportunité principale"
  },
  "concurrence": {
    "concurrents_directs": ["concurrent 1", "concurrent 2", "concurrent 3"],
    "avantage_concurrentiel": "Ce qui différencie ce projet",
    "positionnement": "Positionnement sur le marché"
  },
  "plan_marketing": {
    "strategie": "Stratégie marketing globale",
    "canaux": ["Canal 1", "Canal 2", "Canal 3", "Canal 4"],
    "message_cle": "Message clé aux clients",
    "budget_acquisition": "Coût d'acquisition estimé"
  },
  "plan_operationnel": {
    "structure_juridique": "Forme juridique recommandée",
    "ressources_cles": ["Ressource 1", "Ressource 2", "Ressource 3"],
    "etapes_lancement": [
      {"phase": "Phase 1 — Mois 1-2", "actions": "Actions concrètes"},
      {"phase": "Phase 2 — Mois 3-4", "actions": "Actions concrètes"},
      {"phase": "Phase 3 — Mois 5-6", "actions": "Actions concrètes"},
      {"phase": "Phase 4 — Mois 7-12", "actions": "Actions concrètes"}
    ]
  },
  "plan_financier": {
    "investissement_initial": "Montant et détail",
    "charges_mensuelles": "Charges fixes mensuelles",
    "previsions": [
      {"periode": "Mois 1-3", "ca_estime": "X €", "resultat": "Déficitaire"},
      {"periode": "Mois 4-6", "ca_estime": "X €", "resultat": "Équilibre"},
      {"periode": "An 1", "ca_estime": "X €", "resultat": "Bénéficiaire"},
      {"periode": "An 2", "ca_estime": "X €", "resultat": "Bénéficiaire"},
      {"periode": "An 3", "ca_estime": "X €", "resultat": "Bénéficiaire"}
    ],
    "point_mort": "Quand l'entreprise sera rentable",
    "financement": ["Option 1", "Option 2", "Option 3"]
  },
  "risques": [
    {"risque": "Risque 1", "mitigation": "Comment l'atténuer"},
    {"risque": "Risque 2", "mitigation": "Comment l'atténuer"},
    {"risque": "Risque 3", "mitigation": "Comment l'atténuer"}
  ],
  "conclusion": "Conclusion motivante en 2-3 phrases"
}`;

  const text = await callGemini(prompt);
  const cleaned = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}
