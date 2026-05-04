import { BusinessAnalysis } from "@/types/analysis";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "mistralai/mistral-7b-instruct:free";

async function callAI(prompt: string): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("Clé OpenRouter manquante");

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": "https://venturejuge.online",
      "X-Title": "VentureJuge",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 3000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err?.error?.message || "Erreur OpenRouter");
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

export async function analyzePremiumGemini(idea: string): Promise<BusinessAnalysis> {
  const prompt = `Tu es VentureJuge, un expert en analyse d'idées business. Analyse cette idée et réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks.

IDÉE : ${idea}

Format JSON exact :
{
  "verdict": "OPPORTUNITÉ SOLIDE",
  "verdict_emoji": "🏆",
  "summary": "Résumé en 1-2 phrases",
  "strengths": ["Point fort 1", "Point fort 2", "Point fort 3"],
  "weaknesses": ["Point faible 1", "Point faible 2", "Point faible 3"],
  "moneyPotential": {
    "score": 75,
    "label": "Fort potentiel",
    "details": "Explication en 2 phrases",
    "estimatedRevenue": "50K-200K€/an"
  },
  "risk": {
    "score": 40,
    "label": "Risque modéré",
    "details": "Explication en 2 phrases",
    "mainRisks": ["Risque 1", "Risque 2", "Risque 3"]
  },
  "marketAnalysis": "Analyse de marché en 3 phrases",
  "recommendation": "Recommandation concrète en 2 phrases",
  "isPremium": true,
  "targetAudience": "Description de la cible",
  "competitorAnalysis": "Analyse concurrentielle",
  "actionPlan": ["Étape 1", "Étape 2", "Étape 3", "Étape 4"],
  "breakEvenAnalysis": "Analyse du point mort",
  "fundingOptions": ["Option 1", "Option 2", "Option 3"],
  "growthStrategy": "Stratégie de croissance",
  "exitStrategies": ["Stratégie 1", "Stratégie 2"]
}`;

  const text = await callAI(prompt);
  const cleaned = text.replace(/```json|```/g, "").trim();
  const analysis = JSON.parse(cleaned);
  return { ...analysis, isPremium: true };
}

export async function generateBusinessPlanGemini(idea: string, analysis: BusinessAnalysis): Promise<any> {
  const prompt = `Tu es un expert en création d'entreprise. Génère un business plan complet en français pour cette idée.

IDÉE : ${idea}
VERDICT : ${analysis.verdict} — Risque ${analysis.risk.score}/100, Potentiel ${analysis.moneyPotential.score}/100

Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks :
{
  "titre": "Nom du projet",
  "date": "Mai 2026",
  "executive_summary": "Résumé exécutif en 3-4 phrases",
  "description_projet": {
    "concept": "Description du concept",
    "mission": "Mission en 1 phrase",
    "vision": "Vision à 5 ans",
    "modele_economique": "Comment l'entreprise gagne de l'argent"
  },
  "analyse_marche": {
    "taille_marche": "Taille avec chiffres",
    "cible_principale": "Description de la cible",
    "tendances": "Tendances favorables",
    "opportunite": "Opportunité principale"
  },
  "concurrence": {
    "concurrents_directs": ["Concurrent 1", "Concurrent 2", "Concurrent 3"],
    "avantage_concurrentiel": "Ce qui différencie ce projet",
    "positionnement": "Positionnement sur le marché"
  },
  "plan_marketing": {
    "strategie": "Stratégie marketing",
    "canaux": ["Canal 1", "Canal 2", "Canal 3"],
    "message_cle": "Message clé",
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
    {"risque": "Risque 1", "mitigation": "Solution"},
    {"risque": "Risque 2", "mitigation": "Solution"},
    {"risque": "Risque 3", "mitigation": "Solution"}
  ],
  "conclusion": "Conclusion motivante en 2-3 phrases"
}`;

  const text = await callAI(prompt);
  const cleaned = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}