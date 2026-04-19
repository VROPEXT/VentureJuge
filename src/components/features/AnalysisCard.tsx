import { useState } from "react";
import { Crown, CheckCircle, Target, Users, TrendingUp, XCircle, AlertTriangle, ChevronRight, DollarSign, BarChart3, Rocket, FileText } from "lucide-react";
import { BusinessAnalysis } from "@/types/analysis";
import { ScoreRing } from "@/components/features/ScoreRing";
import { BusinessPlanModal } from "@/components/features/BusinessPlanModal";

interface AnalysisCardProps {
  analysis: BusinessAnalysis;
  idea: string;
}

export function AnalysisCard({ analysis, idea }: AnalysisCardProps) {
  const [showBusinessPlan, setShowBusinessPlan] = useState(false);
  const getRiskColor = (score: number) => {
    if (score <= 30) return "#22c55e";
    if (score <= 55) return "#f59e0b";
    if (score <= 75) return "#f97316";
    return "#ef4444";
  };

  const getMoneyColor = (score: number) => {
    if (score >= 70) return "#22c55e";
    if (score >= 50) return "#f59e0b";
    if (score >= 30) return "#f97316";
    return "#ef4444";
  };

  const verdictBg = () => {
    const v = analysis.verdict;
    if (v === "OPPORTUNITÉ SOLIDE") return "from-green-900/40 to-green-800/20 border-green-700/50";
    if (v === "POTENTIEL RÉEL") return "from-amber-900/40 to-amber-800/20 border-amber-700/50";
    if (v === "À AFFINER") return "from-orange-900/40 to-orange-800/20 border-orange-700/50";
    return "from-red-900/40 to-red-800/20 border-red-700/50";
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Premium badge if applicable */}
      {analysis.isPremium && (
        <div className="flex items-center justify-center gap-2 bg-amber-900/20 border border-amber-700/30 rounded-full py-2 px-4 w-fit mx-auto">
          <Crown className="w-4 h-4 text-gold-500" />
          <span className="text-xs font-semibold text-gold-500 uppercase tracking-widest">Analyse Premium · IA Avancée</span>
        </div>
      )}

      {/* Verdict Banner */}
      <div className={`rounded-2xl bg-gradient-to-br ${verdictBg()} border p-6 text-center`}>
        <div className="text-5xl mb-3">{analysis.verdict_emoji}</div>
        <h2 className="text-2xl font-serif font-bold text-foreground tracking-wide">
          {analysis.verdict}
        </h2>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed max-w-lg mx-auto">
          {analysis.summary}
        </p>
      </div>

      {/* Score Rings */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center gap-4">
          <ScoreRing
            score={analysis.risk.score}
            color={getRiskColor(analysis.risk.score)}
            label="Score de Risque"
            sublabel={analysis.risk.label}
          />
          <div className="w-full space-y-2">
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              {analysis.risk.details}
            </p>
            <div className="space-y-1.5 mt-3">
              {analysis.risk.mainRisks.map((risk, i) => (
                <div key={i} className="flex items-start gap-2">
                  <AlertTriangle className="w-3 h-3 text-orange-400 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-foreground/80">{risk}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground text-center italic">0 = aucun risque · 100 = inutile</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center gap-4">
          <ScoreRing
            score={analysis.moneyPotential.score}
            color={getMoneyColor(analysis.moneyPotential.score)}
            label="Potentiel Financier"
            sublabel={analysis.moneyPotential.label}
          />
          <div className="w-full space-y-2">
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              {analysis.moneyPotential.details}
            </p>
            <div className="mt-3 bg-secondary/50 rounded-xl p-3 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Estimation revenus</p>
              <p className="text-sm font-semibold text-gold-500">{analysis.moneyPotential.estimatedRevenue}</p>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground text-center italic">0 = aucun revenu · 100 = jackpot</p>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <h3 className="font-serif font-semibold text-foreground">Points Forts</h3>
          </div>
          <ul className="space-y-3">
            {analysis.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <ChevronRight className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-foreground/85 leading-relaxed">{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="w-5 h-5 text-red-400" />
            <h3 className="font-serif font-semibold text-foreground">Points Faibles</h3>
          </div>
          <ul className="space-y-3">
            {analysis.weaknesses.map((w, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <ChevronRight className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-foreground/85 leading-relaxed">{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Market Analysis */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-gold-500" />
          <h3 className="font-serif font-semibold text-foreground">Analyse de Marché</h3>
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed">{analysis.marketAnalysis}</p>
      </div>

      {/* ===== PREMIUM SECTIONS ===== */}
      {analysis.isPremium && (
        <>
          {/* Target Audience */}
          {analysis.targetAudience && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-blue-400" />
                <h3 className="font-serif font-semibold text-foreground">Audience Cible</h3>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">{analysis.targetAudience}</p>
            </div>
          )}

          {/* Competitor Analysis */}
          {analysis.competitorAnalysis && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                <h3 className="font-serif font-semibold text-foreground">Analyse Concurrentielle</h3>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">{analysis.competitorAnalysis}</p>
            </div>
          )}

          {/* Action Plan */}
          {analysis.actionPlan && analysis.actionPlan.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Rocket className="w-5 h-5 text-gold-500" />
                <h3 className="font-serif font-semibold text-foreground">Plan d'Action</h3>
              </div>
              <ol className="space-y-3">
                {analysis.actionPlan.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full gold-gradient flex items-center justify-center text-xs font-bold text-amber-900 flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm text-foreground/85 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Break Even + Funding */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {analysis.breakEvenAnalysis && (
              <div className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <h3 className="font-serif font-semibold text-foreground text-sm">Point Mort</h3>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">{analysis.breakEvenAnalysis}</p>
              </div>
            )}

            {analysis.fundingOptions && analysis.fundingOptions.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-5 h-5 text-amber-400" />
                  <h3 className="font-serif font-semibold text-foreground text-sm">Options de Financement</h3>
                </div>
                <ul className="space-y-2">
                  {analysis.fundingOptions.map((opt, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-foreground/80 leading-relaxed">{opt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Growth Strategy */}
          {analysis.growthStrategy && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <h3 className="font-serif font-semibold text-foreground">Stratégie de Croissance</h3>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">{analysis.growthStrategy}</p>
            </div>
          )}

          {/* Exit Strategies */}
          {analysis.exitStrategies && analysis.exitStrategies.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-blue-400" />
                <h3 className="font-serif font-semibold text-foreground">Stratégies de Sortie</h3>
              </div>
              <ul className="space-y-2">
                {analysis.exitStrategies.map((s, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <ChevronRight className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-foreground/80 leading-relaxed">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {/* Recommendation */}
      <div className="bg-gradient-to-br from-amber-900/30 to-amber-800/10 border border-amber-700/40 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-5 h-5 text-gold-500" />
          <h3 className="font-serif font-semibold text-foreground">Notre Recommandation</h3>
        </div>
        <p className="text-sm text-foreground/90 leading-relaxed font-medium">{analysis.recommendation}</p>
      </div>

      {/* Business Plan CTA */}
      <div className="bg-gradient-to-br from-amber-900/20 to-amber-800/5 border border-amber-700/30 rounded-2xl p-6 text-center">
        <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center mx-auto mb-4">
          <FileText className="w-6 h-6 text-amber-900" />
        </div>
        <h3 className="font-serif font-bold text-foreground text-lg mb-2">Transformer en Business Plan</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-5 leading-relaxed">
          Générez un business plan complet et professionnel basé sur cette analyse — avec projections financières, plan marketing et feuille de route. Téléchargeable en PDF.
        </p>
        <button
          onClick={() => setShowBusinessPlan(true)}
          className="h-12 px-8 rounded-xl gold-gradient text-amber-900 font-semibold text-sm hover:opacity-90 transition-all glow-gold flex items-center gap-2 mx-auto"
        >
          <FileText className="w-4 h-4" />
          Générer le Business Plan
        </button>
      </div>

      {/* Business Plan Modal */}
      {showBusinessPlan && (
        <BusinessPlanModal
          onClose={() => setShowBusinessPlan(false)}
          idea={idea}
          analysis={analysis}
        />
      )}
    </div>
  );
}
