import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { idea } = await req.json();

    if (!idea || idea.trim().length < 10) {
      throw new Error("Idea too short");
    }

    const apiKey = Deno.env.get("ONSPACE_AI_API_KEY");
    const baseUrl = Deno.env.get("ONSPACE_AI_BASE_URL");

    const systemPrompt = `Tu es un expert en analyse d'idées business avec 20 ans d'expérience en venture capital, stratégie d'entreprise et entrepreneuriat. 
Tu dois analyser une idée business de façon très détaillée et professionnelle en JSON structuré.

Tu répondras UNIQUEMENT avec un objet JSON valide, sans markdown ni commentaires. Voici la structure exacte:
{
  "verdict": "OPPORTUNITÉ SOLIDE" | "POTENTIEL RÉEL" | "À AFFINER" | "RISQUE ÉLEVÉ",
  "verdict_emoji": "🚀" | "💡" | "⚠️" | "🔴",
  "summary": "Résumé exécutif en 2-3 phrases percutantes",
  "strengths": ["point fort 1", "point fort 2", "point fort 3", "point fort 4", "point fort 5"],
  "weaknesses": ["point faible 1", "point faible 2", "point faible 3", "point faible 4"],
  "moneyPotential": {
    "score": <0-100>,
    "label": "ex: Fort potentiel",
    "details": "Explication détaillée du potentiel financier en 2-3 phrases",
    "estimatedRevenue": "ex: 50k€ - 500k€ / an à 3 ans"
  },
  "risk": {
    "score": <0-100>,
    "label": "ex: Risque modéré",
    "details": "Explication détaillée du profil de risque en 2-3 phrases",
    "mainRisks": ["risque 1", "risque 2", "risque 3"]
  },
  "marketAnalysis": "Analyse de marché détaillée: taille du marché, tendances, saturation, opportunités. 3-5 phrases.",
  "recommendation": "Recommandation concrète et actionnable: que faire maintenant. 2-3 phrases.",
  "targetAudience": "Description précise de l'audience cible idéale avec démographie, besoins et comportements",
  "competitorAnalysis": "Analyse détaillée de la concurrence existante, des acteurs clés et comment se différencier",
  "actionPlan": [
    "Étape 1: ...",
    "Étape 2: ...",
    "Étape 3: ...",
    "Étape 4: ...",
    "Étape 5: ..."
  ],
  "fundingOptions": [
    "Option de financement 1 avec détails",
    "Option de financement 2 avec détails",
    "Option de financement 3 avec détails"
  ],
  "breakEvenAnalysis": "Analyse du point mort: investissement initial estimé, délai estimé pour atteindre la rentabilité, volume minimum de clients/ventes nécessaire",
  "growthStrategy": "Stratégie de croissance détaillée: comment scaler de 0 à 1M€, canaux d'acquisition, partenariats clés",
  "exitStrategies": [
    "Stratégie de sortie 1",
    "Stratégie de sortie 2"
  ]
}`;

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyse cette idée business: "${idea}"` },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OnSpace AI error: ${err}`);
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content ?? "";

    // Clean potential markdown code fences
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return new Response(JSON.stringify({ analysis: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("analyze-premium error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
