import { BusinessAnalysis } from "@/types/analysis";

// ============================================================
// BUSINESS JUDGE ENGINE — Critères d'évaluation personnalisés
// ============================================================

interface Criteria {
  hasMarket: boolean;
  hasCompetition: boolean;
  hasDigital: boolean;
  hasPhysical: boolean;
  hasService: boolean;
  hasProduct: boolean;
  hasSubscription: boolean;
  hasLowCost: boolean;
  hasHighMargin: boolean;
  hasTech: boolean;
  hasSocial: boolean;
  hasLocal: boolean;
  hasGlobal: boolean;
  hasRegulation: boolean;
  hasDependency: boolean;
  hasNovelty: boolean;
  hasTrend: boolean;
  wordCount: number;
  ideaLength: "vague" | "normal" | "detailed";
}

function extractCriteria(idea: string): Criteria {
  const text = idea.toLowerCase();
  const words = idea.trim().split(/\s+/);

  const has = (...terms: string[]) => terms.some((t) => text.includes(t));

  return {
    hasMarket: has("client", "clients", "marché", "marche", "demande", "besoin", "utilisateur", "acheteur", "customer", "market", "audience"),
    hasCompetition: has("concurrent", "concurrence", "compétiteur", "competition", "rival", "amazon", "google", "facebook", "airbnb", "uber"),
    hasDigital: has("app", "application", "site", "web", "en ligne", "online", "digital", "saas", "plateforme", "platform", "logiciel", "software"),
    hasPhysical: has("boutique", "magasin", "local", "physique", "restaurant", "café", "atelier", "entrepôt", "livraison"),
    hasService: has("service", "consulting", "conseil", "coaching", "formation", "cours", "accompagnement", "prestation", "freelance"),
    hasProduct: has("produit", "article", "fabriquer", "vendre", "e-commerce", "dropshipping", "marchandise", "manufacture"),
    hasSubscription: has("abonnement", "mensuel", "subscription", "récurrent", "saas", "membership"),
    hasLowCost: has("gratuit", "peu coûteux", "pas cher", "low cost", "budget", "minime", "faible investissement"),
    hasHighMargin: has("marge", "profit", "rentable", "bénéfice", "lucratif", "margin"),
    hasTech: has("ia", "ai", "intelligence artificielle", "machine learning", "blockchain", "crypto", "nft", "tech", "technologie", "robot", "automatisation"),
    hasSocial: has("réseau social", "instagram", "tiktok", "youtube", "influencer", "viral", "communauté", "contenu"),
    hasLocal: has("local", "ville", "quartier", "région", "france", "canada", "belgique", "suisse", "montreal", "paris"),
    hasGlobal: has("mondial", "international", "global", "partout", "monde entier", "export"),
    hasRegulation: has("licence", "permis", "réglementation", "légal", "droit", "loi", "médical", "santé", "alimentaire", "financier", "banque"),
    hasDependency: has("google", "amazon", "facebook", "meta", "apple", "fournisseur", "dépend", "partenaire obligatoire"),
    hasNovelty: has("innovant", "nouveau", "unique", "jamais vu", "première fois", "disruptif", "révolutionnaire", "original"),
    hasTrend: has("tendance", "trend", "croissance", "en vogue", "populaire", "boom", "montant"),
    wordCount: words.length,
    ideaLength: words.length < 15 ? "vague" : words.length < 50 ? "normal" : "detailed",
  };
}

function computeRiskScore(c: Criteria): number {
  let score = 30; // base moderate risk

  // Vague idea = more risk (unknown unknowns)
  if (c.ideaLength === "vague") score += 20;
  if (c.ideaLength === "detailed") score -= 10;

  // No market defined = risk
  if (!c.hasMarket) score += 15;
  else score -= 8;

  // High competition = risk
  if (c.hasCompetition) score += 12;

  // Regulation = high risk
  if (c.hasRegulation) score += 18;

  // Dependency on big platforms = risk
  if (c.hasDependency) score += 10;

  // Physical = more operational risk
  if (c.hasPhysical) score += 8;
  if (c.hasDigital) score -= 5;

  // Service = lower risk than product
  if (c.hasService) score -= 10;
  if (c.hasProduct) score += 5;

  // Subscription = lower risk (recurring revenue)
  if (c.hasSubscription) score -= 8;

  // Low cost entry = less risk
  if (c.hasLowCost) score -= 10;

  // Tech-heavy = more execution risk
  if (c.hasTech) score += 5;

  // Trending market = lower risk
  if (c.hasTrend) score -= 7;

  // Global ambitions without foundation = risk
  if (c.hasGlobal && !c.hasMarket) score += 10;

  return Math.min(95, Math.max(5, Math.round(score)));
}

function computeMoneyScore(c: Criteria): number {
  let score = 35; // base moderate potential

  // Service income is real
  if (c.hasService) score += 15;

  // Subscription = scalable money
  if (c.hasSubscription) score += 20;

  // Digital = scalable
  if (c.hasDigital) score += 12;

  // High margin = more money
  if (c.hasHighMargin) score += 15;

  // Tech trends = multiplier
  if (c.hasTech) score += 10;
  if (c.hasTrend) score += 10;

  // Global reach = more potential
  if (c.hasGlobal) score += 12;

  // Local is limited
  if (c.hasLocal && !c.hasDigital) score -= 10;

  // Physical reduces scalability
  if (c.hasPhysical && !c.hasDigital) score -= 12;

  // No market awareness = uncertain money
  if (!c.hasMarket) score -= 15;

  // Novel idea premium
  if (c.hasNovelty) score += 8;

  // Social media business = high potential if done right
  if (c.hasSocial) score += 8;

  // Vague idea = uncertain potential
  if (c.ideaLength === "vague") score -= 15;
  if (c.ideaLength === "detailed") score += 8;

  return Math.min(95, Math.max(5, Math.round(score)));
}

function getRiskLabel(score: number): string {
  if (score <= 20) return "Très faible risque";
  if (score <= 40) return "Risque modéré";
  if (score <= 60) return "Risque significatif";
  if (score <= 80) return "Risque élevé";
  return "Risque très élevé";
}

function getMoneyLabel(score: number): string {
  if (score <= 20) return "Très limité";
  if (score <= 40) return "Potentiel modeste";
  if (score <= 60) return "Potentiel intéressant";
  if (score <= 80) return "Fort potentiel";
  return "Potentiel exceptionnel";
}

function buildStrengths(c: Criteria, idea: string): string[] {
  const strengths: string[] = [];

  if (c.hasMarket) strengths.push("Vous avez identifié un marché ou une cible — c'est la base de tout business sérieux.");
  if (c.hasService) strengths.push("Un modèle de service génère du revenu rapidement avec peu d'investissement initial.");
  if (c.hasSubscription) strengths.push("Le modèle par abonnement crée des revenus récurrents et prévisibles — excellent pour la trésorerie.");
  if (c.hasDigital) strengths.push("Un business digital est scalable : vous pouvez toucher des milliers de clients sans coûts proportionnels.");
  if (c.hasLowCost) strengths.push("Faibles coûts d'entrée — vous pouvez tester et valider avant d'investir massivement.");
  if (c.hasHighMargin) strengths.push("Potentiel de marges élevées, ce qui signifie plus de profit par vente.");
  if (c.hasTrend) strengths.push("L'idée s'inscrit dans une tendance de marché croissante — le timing est favorable.");
  if (c.hasNovelty) strengths.push("L'originalité de l'idée peut créer un avantage concurrentiel initial fort.");
  if (c.hasTech) strengths.push("La technologie peut créer des barrières à l'entrée et automatiser la croissance.");
  if (c.ideaLength === "detailed") strengths.push("Idée bien développée et articulée — vous avez réfléchi aux détails.");
  if (c.hasGlobal) strengths.push("Ambition internationale — le marché potentiel est beaucoup plus large.");

  if (strengths.length === 0) {
    strengths.push("Toute idée a un point de départ — c'est courageux d'oser entreprendre.");
    strengths.push("Le potentiel d'apprentissage et d'adaptation est toujours présent.");
  }

  return strengths.slice(0, 4);
}

function buildWeaknesses(c: Criteria, idea: string): string[] {
  const weaknesses: string[] = [];

  if (!c.hasMarket) weaknesses.push("Aucune cible ou marché clairement défini — sans client identifié, pas de business viable.");
  if (c.hasCompetition) weaknesses.push("Marché concurrentiel détecté — il faudra une différenciation forte et claire pour s'imposer.");
  if (c.hasRegulation) weaknesses.push("Le secteur implique des réglementations potentiellement lourdes (licences, conformité, délais).");
  if (c.hasDependency) weaknesses.push("Dépendance à des plateformes tierces — un changement de leurs conditions peut détruire le modèle.");
  if (c.hasPhysical && !c.hasDigital) weaknesses.push("Modèle 100% physique : coûts fixes élevés, scalabilité limitée et risques opérationnels plus importants.");
  if (!c.hasService && !c.hasSubscription && !c.hasProduct) weaknesses.push("Le modèle de revenus n'est pas clairement défini — comment allez-vous monétiser exactement ?");
  if (c.ideaLength === "vague") weaknesses.push("L'idée manque de précision — difficile d'évaluer la faisabilité sans plus de détails.");
  if (c.hasGlobal && !c.hasMarket) weaknesses.push("Ambition globale sans marché cible défini — commencez local avant de viser le monde.");
  if (c.hasTech && !c.hasMarket) weaknesses.push("La technologie seule ne suffit pas — la valeur doit résoudre un vrai problème pour de vrais clients.");

  if (weaknesses.length === 0) {
    weaknesses.push("L'exécution reste le principal défi — une bonne idée sans exécution solide ne va nulle part.");
    weaknesses.push("La validation du marché doit être une priorité avant tout investissement majeur.");
  }

  return weaknesses.slice(0, 4);
}

function buildMarketAnalysis(c: Criteria): string {
  if (c.hasTech && c.hasDigital && c.hasSubscription) {
    return "Le marché SaaS/Tech est en forte croissance mondiale. La compétition est intense mais les opportunités de niche restent nombreuses. Un produit bien positionné peut atteindre des valorisations significatives rapidement.";
  }
  if (c.hasSocial) {
    return "L'économie des créateurs et des réseaux sociaux génère des milliards annuellement. La saturation est réelle mais les niches spécialisées continuent d'émerger. La différenciation de contenu est clé.";
  }
  if (c.hasPhysical && c.hasLocal) {
    return "Le commerce local connaît un regain post-pandémie avec une clientèle qui valorise le local. Les marges dépendent fortement de la gestion des coûts fixes. La complémentarité online/offline est essentielle.";
  }
  if (c.hasService) {
    return "Le marché des services professionnels est stable et résilient. La croissance dépend de votre réputation, de votre réseau et de votre capacité à monter en gamme. Le bouche-à-oreille reste le canal principal.";
  }
  if (c.hasTrend) {
    return "Idée dans un marché en croissance active — le timing est favorable. Attention cependant aux tendances éphémères : construire sur des fondations solides et pérennes est crucial.";
  }
  return "Le potentiel de marché dépend largement de l'exécution et du positionnement. Une étude de marché approfondie permettrait de mieux quantifier l'opportunité et d'affiner la stratégie.";
}

function buildRecommendation(riskScore: number, moneyScore: number, c: Criteria): string {
  if (moneyScore >= 65 && riskScore <= 45) {
    return "Excellente opportunité. Passez immédiatement à la validation : trouvez 3 clients pilotes, construisez un MVP en 30 jours et mesurez les résultats avant de scaler.";
  }
  if (moneyScore >= 65 && riskScore > 45) {
    return "Fort potentiel financier mais risque notable. Réduisez d'abord les risques identifiés avant d'investir massivement. Testez à petite échelle et validez les hypothèses clés.";
  }
  if (moneyScore < 40 && riskScore <= 40) {
    return "Idée sûre mais au potentiel modeste. Peut constituer un bon revenu complémentaire. Pour en faire un business principal, cherchez comment augmenter les marges ou la scalabilité.";
  }
  if (moneyScore < 40 && riskScore > 60) {
    return "L'idée dans sa forme actuelle présente trop de risques pour un potentiel insuffisant. Reformulez la proposition de valeur ou explorez une pivotation vers un modèle plus viable.";
  }
  return "Idée correcte avec un équilibre risque/rendement acceptable. Détaillez davantage votre modèle économique et identifiez votre avantage concurrentiel distinct pour maximiser les chances de succès.";
}

function getVerdict(riskScore: number, moneyScore: number): { verdict: string; emoji: string } {
  const net = moneyScore - riskScore;
  if (net >= 35) return { verdict: "OPPORTUNITÉ SOLIDE", emoji: "🏆" };
  if (net >= 15) return { verdict: "POTENTIEL RÉEL", emoji: "✅" };
  if (net >= -10) return { verdict: "À AFFINER", emoji: "⚠️" };
  if (net >= -30) return { verdict: "RISQUÉ", emoji: "🔴" };
  return { verdict: "À REPENSER", emoji: "❌" };
}

function getEstimatedRevenue(moneyScore: number, c: Criteria): string {
  if (moneyScore >= 80) return c.hasGlobal ? "1M€+ par an envisageable" : "100K–500K€ par an envisageable";
  if (moneyScore >= 60) return c.hasSubscription ? "30K–150K€/an en régime stable" : "20K–80K€/an avec bonne exécution";
  if (moneyScore >= 40) return "5K–30K€/an comme revenu complémentaire";
  return "Difficile à estimer sans validation marché";
}

// Simulate async processing delay
async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function analyzeBusinessIdea(idea: string): Promise<BusinessAnalysis> {
  await delay(2800); // realistic analysis time

  const c = extractCriteria(idea);
  const riskScore = computeRiskScore(c);
  const moneyScore = computeMoneyScore(c);
  const { verdict, emoji } = getVerdict(riskScore, moneyScore);
  const strengths = buildStrengths(c, idea);
  const weaknesses = buildWeaknesses(c, idea);
  const marketAnalysis = buildMarketAnalysis(c);
  const recommendation = buildRecommendation(riskScore, moneyScore, c);

  // Build main risks list
  const mainRisks: string[] = [];
  if (c.hasRegulation) mainRisks.push("Contraintes réglementaires et légales");
  if (c.hasCompetition) mainRisks.push("Pression concurrentielle forte");
  if (c.hasDependency) mainRisks.push("Dépendance à des tiers critiques");
  if (c.hasPhysical) mainRisks.push("Coûts opérationnels fixes élevés");
  if (!c.hasMarket) mainRisks.push("Marché cible non validé");
  if (c.ideaLength === "vague") mainRisks.push("Modèle économique flou");
  if (mainRisks.length === 0) mainRisks.push("Risques d'exécution standard", "Volatilité du marché");

  return {
    verdict,
    verdict_emoji: emoji,
    summary: `Après analyse approfondie de votre idée selon ${weaknesses.length + strengths.length} critères clés, voici notre verdict d'expert.`,
    strengths,
    weaknesses,
    moneyPotential: {
      score: moneyScore,
      label: getMoneyLabel(moneyScore),
      details: `Votre idée présente un ${getMoneyLabel(moneyScore).toLowerCase()} de revenus. ${moneyScore >= 60 ? "Les mécanismes de monétisation identifiés sont favorables." : "La monétisation nécessite d'être mieux structurée."}`,
      estimatedRevenue: getEstimatedRevenue(moneyScore, c),
    },
    risk: {
      score: riskScore,
      label: getRiskLabel(riskScore),
      details: `${getRiskLabel(riskScore)} détecté. ${riskScore >= 60 ? "Des mesures de mitigation sont nécessaires avant de lancer." : "Le niveau de risque est gérable avec une bonne préparation."}`,
      mainRisks: mainRisks.slice(0, 3),
    },
    marketAnalysis,
    recommendation,
  };
}
