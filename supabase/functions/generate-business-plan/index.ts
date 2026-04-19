import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { idea, analysis } = await req.json();

    if (!idea) {
      return new Response(JSON.stringify({ error: "Idea is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY") || Deno.env.get("GEMINI_API_KEY") || "";

    const prompt = `Tu es un expert en création d'entreprise et en rédaction de business plans professionnels. 
    
Génère un business plan complet et professionnel en français pour l'idée suivante :

IDÉE : ${idea}

ANALYSE PRÉALABLE :
- Verdict : ${analysis?.verdict || "N/A"}
- Score de risque : ${analysis?.risk?.score || "N/A"}/100
- Potentiel financier : ${analysis?.moneyPotential?.score || "N/A"}/100
- Résumé : ${analysis?.summary || "N/A"}
- Points forts : ${analysis?.strengths?.join(", ") || "N/A"}
- Points faibles : ${analysis?.weaknesses?.join(", ") || "N/A"}
- Revenus estimés : ${analysis?.moneyPotential?.estimatedRevenue || "N/A"}

Génère un business plan structuré en JSON avec exactement ce format :
{
  "titre": "Nom du projet/business",
  "date": "Mois Année",
  "executive_summary": "Résumé exécutif de 3-4 phrases percutantes présentant le projet, le marché, et la proposition de valeur.",
  "description_projet": {
    "concept": "Description détaillée du concept et de la proposition de valeur unique (2-3 paragraphes)",
    "mission": "Mission de l'entreprise en 1 phrase",
    "vision": "Vision à 5 ans en 1 phrase",
    "modele_economique": "Description du modèle économique (comment l'entreprise gagne de l'argent)"
  },
  "analyse_marche": {
    "taille_marche": "Estimation de la taille du marché avec chiffres",
    "cible_principale": "Description précise de la cible principale",
    "tendances": "2-3 tendances favorables au projet",
    "opportunite": "L'opportunité principale identifiée"
  },
  "concurrence": {
    "concurrents_directs": ["concurrent 1", "concurrent 2", "concurrent 3"],
    "avantage_concurrentiel": "Ce qui différencie vraiment ce projet de la concurrence",
    "positionnement": "Comment se positionner sur le marché"
  },
  "plan_marketing": {
    "strategie": "Stratégie marketing globale",
    "canaux": ["Canal 1", "Canal 2", "Canal 3", "Canal 4"],
    "message_cle": "Message clé à communiquer aux clients",
    "budget_acquisition": "Estimation du coût d'acquisition client"
  },
  "plan_operationnel": {
    "structure_juridique": "Forme juridique recommandée et pourquoi",
    "ressources_cles": ["Ressource 1", "Ressource 2", "Ressource 3"],
    "etapes_lancement": [
      {"phase": "Phase 1 — Mois 1-2", "actions": "Actions concrètes"},
      {"phase": "Phase 2 — Mois 3-4", "actions": "Actions concrètes"},
      {"phase": "Phase 3 — Mois 5-6", "actions": "Actions concrètes"},
      {"phase": "Phase 4 — Mois 7-12", "actions": "Actions concrètes"}
    ]
  },
  "plan_financier": {
    "investissement_initial": "Montant et détail de l'investissement de départ nécessaire",
    "charges_mensuelles": "Estimation des charges fixes mensuelles",
    "previsions": [
      {"periode": "Mois 1-3", "ca_estime": "X €", "resultat": "Déficitaire / Équilibre / Bénéficiaire"},
      {"periode": "Mois 4-6", "ca_estime": "X €", "resultat": "Déficitaire / Équilibre / Bénéficiaire"},
      {"periode": "An 1", "ca_estime": "X €", "resultat": "Déficitaire / Équilibre / Bénéficiaire"},
      {"periode": "An 2", "ca_estime": "X €", "resultat": "Déficitaire / Équilibre / Bénéficiaire"},
      {"periode": "An 3", "ca_estime": "X €", "resultat": "Déficitaire / Équilibre / Bénéficiaire"}
    ],
    "point_mort": "Quand et à quel chiffre d'affaires mensuel l'entreprise sera rentable",
    "financement": ["Option de financement 1", "Option de financement 2", "Option de financement 3"]
  },
  "risques": [
    {"risque": "Risque principal 1", "mitigation": "Comment l'atténuer"},
    {"risque": "Risque principal 2", "mitigation": "Comment l'atténuer"},
    {"risque": "Risque principal 3", "mitigation": "Comment l'atténuer"}
  ],
  "conclusion": "Conclusion motivante de 2-3 phrases sur le potentiel du projet et les prochaines étapes recommandées."
}

Réponds UNIQUEMENT avec le JSON, sans markdown, sans backticks, sans texte avant ou après.`;

    // Try Anthropic API first
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    
    let planText = "";

    if (anthropicKey) {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-opus-4-5",
          max_tokens: 4000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      planText = data.content?.[0]?.text || "";
    } else {
      // Fallback: Gemini
      const geminiKey = Deno.env.get("GEMINI_API_KEY");
      if (geminiKey) {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        );
        const data = await response.json();
        planText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      }
    }

    if (!planText) {
      throw new Error("Aucune réponse de l'IA");
    }

    // Clean and parse JSON
    const cleaned = planText.replace(/```json|```/g, "").trim();
    const plan = JSON.parse(cleaned);

    return new Response(JSON.stringify({ plan }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Business plan error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
