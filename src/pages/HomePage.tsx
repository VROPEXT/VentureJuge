import { useState, useRef, useEffect } from "react";
import { Briefcase, Zap, ChevronDown, RotateCcw, Crown, Lock, User, LogIn } from "lucide-react";
import { analyzeBusinessIdea } from "@/lib/businessJudge";
import { analyzePremium } from "@/lib/stripe";
import { BusinessAnalysis, AnalysisStatus } from "@/types/analysis";
import { AnalysisCard } from "@/components/features/AnalysisCard";
import { LoadingAnalysis } from "@/components/features/LoadingAnalysis";
import { PremiumModal } from "@/components/features/PremiumModal";
import { AuthModal } from "@/components/features/AuthModal";
import { AccountModal } from "@/components/features/AccountModal";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import {
  canMakeRequest,
  incrementRequestCount,
  isPremiumUser,
  activatePremium,
  getFreemiumState,
  isVipAccount,
} from "@/lib/freemium";
import { verifyPayment } from "@/lib/stripe";
import { toast } from "sonner";
import heroBg from "@/assets/hero-bg.jpg";

const EXAMPLE_IDEAS = [
  "Une application de livraison de repas sains par abonnement mensuel, ciblant les professionnels pressés en ville.",
  "Un service de coaching business en ligne pour aider les freelances à doubler leur tarif journalier.",
  "Une marketplace pour louer du matériel de sport entre particuliers dans les grandes villes.",
  "Une boutique de vêtements personnalisés avec IA qui génère des designs uniques selon les préférences.",
];

export function HomePage() {
  const [idea, setIdea] = useState("");
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [analysis, setAnalysis] = useState<BusinessAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumModalTrigger, setPremiumModalTrigger] = useState<"limit" | "upgrade">("upgrade");
  const [isPremium, setIsPremium] = useState(isPremiumUser());
  const [freeRequestsLeft, setFreeRequestsLeft] = useState(
    isPremiumUser() ? Infinity : Math.max(0, 1 - getFreemiumState().requestsThisMonth)
  );
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");
  const [showAccountModal, setShowAccountModal] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // VIP auto-premium
  useEffect(() => {
    if (user?.email && isVipAccount(user.email)) {
      setIsPremium(true);
      setFreeRequestsLeft(Infinity);
    }
  }, [user]);

  // Handle Stripe redirect back (success or canceled)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const premiumStatus = params.get("premium");
    const sessionId = params.get("session_id");

    if (premiumStatus === "success" && sessionId) {
      // Verify payment server-side
      verifyPayment(sessionId).then(({ isPaid, email }) => {
        if (isPaid) {
          activatePremium(email || "");
          setIsPremium(true);
          setFreeRequestsLeft(Infinity);
          toast.success("🎉 Bienvenue dans Premium ! Analyses illimitées activées.");
        }
      }).catch(() => {
        toast.error("Impossible de vérifier le paiement. Contactez le support.");
      });
      // Clean URL
      window.history.replaceState({}, "", "/");
    } else if (premiumStatus === "canceled") {
      toast.info("Paiement annulé. Vous pouvez réessayer quand vous voulez.");
      window.history.replaceState({}, "", "/");
    }
  }, []);

  const handleAnalyze = async () => {
    if (!idea.trim() || idea.trim().length < 10) {
      setError("Décrivez votre idée en au moins 10 caractères pour obtenir une analyse précise.");
      return;
    }

    // Check freemium limits
    if (!canMakeRequest(user?.email)) {
      setPremiumModalTrigger("limit");
      setShowPremiumModal(true);
      return;
    }

    setError(null);
    setStatus("analyzing");
    setAnalysis(null);

    try {
      let result: BusinessAnalysis;

      if (isPremium) {
        // Premium: use real AI
        result = await analyzePremium(idea);
      } else {
        // Free: use local engine
        result = await analyzeBusinessIdea(idea);
        incrementRequestCount();
        setFreeRequestsLeft(0);
      }

      setAnalysis(result);
      setStatus("done");
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Une erreur s'est produite. Veuillez réessayer.";
      setError(message);
      setStatus("idle");
    }
  };

  const handleReset = () => {
    setIdea("");
    setStatus("idle");
    setAnalysis(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleExample = (example: string) => {
    setIdea(example);
    setStatus("idle");
    setAnalysis(null);
    setError(null);
  };

  const openUpgradeModal = () => {
    setPremiumModalTrigger("upgrade");
    setShowPremiumModal(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-amber-900" />
            </div>
            <span className="font-serif font-bold text-lg text-foreground tracking-tight">
              VentureJuge
            </span>
          </div>
          <div className="flex items-center gap-3">
            {isPremium ? (
              <div className="flex items-center gap-2 bg-amber-900/20 border border-amber-700/30 rounded-full px-3 py-1.5">
                <Crown className="w-3.5 h-3.5 text-gold-500" />
                <span className="text-xs font-semibold text-gold-500">Premium</span>
              </div>
            ) : (
              <button
                onClick={openUpgradeModal}
                className="flex items-center gap-2 bg-secondary border border-border rounded-full px-3 py-1.5 hover:border-gold-500/40 hover:text-gold-500 transition-all group"
              >
                <Crown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-gold-500" />
                <span className="text-xs font-medium text-muted-foreground group-hover:text-gold-500 hidden sm:block">
                  Passer à Premium
                </span>
              </button>
            )}
            {user ? (
              <button
                onClick={() => setShowAccountModal(true)}
                className="flex items-center gap-2 bg-secondary border border-border rounded-full px-3 py-1.5 hover:border-gold-500/40 transition-all"
              >
                <User className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground hidden sm:block truncate max-w-24">
                  {user.email?.split("@")[0]}
                </span>
              </button>
            ) : (
              <button
                onClick={() => { setAuthModalMode("login"); setShowAuthModal(true); }}
                className="flex items-center gap-2 bg-secondary border border-border rounded-full px-3 py-1.5 hover:border-gold-500/40 transition-all"
              >
                <LogIn className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground hidden sm:block">Connexion</span>
              </button>
            )}
            <div className="w-2 h-2 rounded-full bg-green-400 pulse-dot" />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-900/30 border border-amber-700/40 rounded-full px-4 py-1.5 mb-6">
            <Zap className="w-3.5 h-3.5 text-gold-500" />
            <span className="text-xs text-gold-500 font-medium uppercase tracking-widest">Analyse en 30 secondes</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-black text-foreground leading-tight mb-4">
            Votre idée mérite{" "}
            <span className="text-gold-500">un vrai verdict</span>
          </h1>

          <p className="text-foreground/60 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            {isPremium
              ? "Analyses illimitées par IA plus développée · Plan d'action · Analyse concurrentielle · Stratégie de croissance"
              : "Soumettez votre idée business. Score de risque et potentiel financier sur 100."}
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-8 sm:gap-12 text-center">
            {isPremium ? (
              <>
                {[
                  { label: "Critères analysés", value: "20+" },
                  { label: "Score de risque", value: "/100" },
                  { label: "Moteur IA", value: "Avancé" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-2xl font-serif font-bold text-gold-500">{stat.value}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </>
            ) : (
              <>
                {[
                  { label: "Critères analysés", value: "14" },
                  { label: "Score de risque", value: "/100" },
                  { label: "Analyses gratuites", value: `${freeRequestsLeft}/mois` },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-2xl font-serif font-bold text-gold-500">{stat.value}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Main Form */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
        {/* Input Section */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-semibold text-foreground">
              Décrivez votre idée business
            </label>
            {!isPremium && freeRequestsLeft === 0 && (
              <div className="flex items-center gap-1.5 bg-amber-900/20 border border-amber-700/30 rounded-full px-2.5 py-1">
                <Lock className="w-3 h-3 text-gold-500" />
                <span className="text-xs text-gold-500 font-medium">Limite atteinte</span>
              </div>
            )}
          </div>

          <textarea
            value={idea}
            onChange={(e) => {
              setIdea(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Ex: Je veux créer une application mobile qui met en relation des personnes âgées avec des jeunes volontaires pour des services de proximité dans leur quartier, contre une rémunération modeste..."
            className="w-full h-40 bg-background border border-border rounded-xl p-4 text-foreground placeholder:text-muted-foreground/50 text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500/50 transition-all"
            disabled={status === "analyzing"}
          />

          {/* Character count */}
          <div className="flex items-center justify-between mt-2">
            <span className={`text-xs ${idea.length < 10 ? "text-muted-foreground" : "text-green-400"}`}>
              {idea.length} caractères{idea.length >= 10 ? " ✓" : " (min. 10)"}
            </span>
            {error && (
              <span className="text-xs text-red-400">{error}</span>
            )}
          </div>

          {/* Examples */}
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Exemples d'idées</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_IDEAS.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => handleExample(ex)}
                  disabled={status === "analyzing"}
                  className="text-xs px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground/70 hover:text-gold-500 hover:border-gold-500/40 transition-all disabled:opacity-40"
                >
                  Exemple {i + 1}
                </button>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleAnalyze}
              disabled={status === "analyzing" || !idea.trim()}
              className="flex-1 h-12 rounded-xl gold-gradient text-amber-900 font-semibold text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all glow-gold flex items-center justify-center gap-2"
            >
              {status === "analyzing" ? (
                <>
                  <div className="w-4 h-4 border-2 border-amber-900/30 border-t-amber-900 rounded-full animate-spin" />
                  {isPremium ? "Analyse IA en cours..." : "Analyse en cours..."}
                </>
              ) : (
                <>
                  {isPremium ? <Crown className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                  {isPremium ? "Analyse Premium" : "Juger mon idée"}
                </>
              )}
            </button>

            {(status === "done" || idea) && (
              <button
                onClick={handleReset}
                disabled={status === "analyzing"}
                className="h-12 px-4 rounded-xl bg-secondary border border-border text-foreground/70 hover:text-foreground hover:border-gold-500/40 disabled:opacity-40 transition-all flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-sm hidden sm:block">Nouvelle idée</span>
              </button>
            )}
          </div>

          {/* Free tier info */}
          {!isPremium && (
            <div className="mt-4 flex items-center justify-between bg-secondary/40 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${freeRequestsLeft > 0 ? "bg-green-400" : "bg-amber-500"}`} />
                <span className="text-xs text-muted-foreground">
                  {freeRequestsLeft > 0
                    ? `${freeRequestsLeft} analyse gratuite disponible ce mois`
                    : "Limite mensuelle gratuite atteinte"}
                </span>
              </div>
              <button
                onClick={openUpgradeModal}
                className="text-xs text-gold-500 font-semibold hover:underline flex items-center gap-1"
              >
                <Crown className="w-3 h-3" />
                Premium
              </button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {status === "analyzing" && <LoadingAnalysis isPremium={isPremium} />}

        {/* Results */}
        {status === "done" && analysis && (
          <div ref={resultsRef}>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px flex-1 bg-border" />
              <div className="flex items-center gap-2">
                <ChevronDown className="w-4 h-4 text-gold-500" />
                <span className="text-sm font-semibold text-gold-500 uppercase tracking-widest">Résultat de l'analyse</span>
                <ChevronDown className="w-4 h-4 text-gold-500" />
              </div>
              <div className="h-px flex-1 bg-border" />
            </div>
            <AnalysisCard analysis={analysis} idea={idea} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded gold-gradient flex items-center justify-center">
              <Briefcase className="w-3 h-3 text-amber-900" />
            </div>
            <span className="text-sm font-serif font-semibold text-foreground">VentureJuge</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <p className="text-xs text-muted-foreground text-center">
              Les scores sont indicatifs et ne remplacent pas un conseil professionnel.
            </p>
            <Link to="/legal" className="text-xs text-muted-foreground/60 hover:text-gold-500 transition-colors underline underline-offset-2">
              Mentions légales &amp; CGU
            </Link>
          </div>
          {!isPremium && (
            <button
              onClick={openUpgradeModal}
              className="text-xs text-gold-500 font-semibold hover:underline flex items-center gap-1.5"
            >
              <Crown className="w-3 h-3" />
              Passer à Premium
            </button>
          )}
        </div>
      </footer>

      {/* Premium Modal */}
      {showPremiumModal && (
        <PremiumModal onClose={() => setShowPremiumModal(false)} trigger={premiumModalTrigger} />
      )}
      {showAuthModal && (
        <AuthModal defaultMode={authModalMode} onClose={() => setShowAuthModal(false)} onSuccess={() => setShowAuthModal(false)} />
      )}
      {showAccountModal && (
        <AccountModal
          onClose={() => setShowAccountModal(false)}
          isPremium={isPremium}
          onCancelSubscription={() => { setIsPremium(false); setFreeRequestsLeft(Math.max(0, 1 - getFreemiumState().requestsThisMonth)); }}
        />
      )}
    </div>
  );
}
