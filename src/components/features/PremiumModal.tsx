import { useState } from "react";
import { X, Zap, CheckCircle, Crown, Loader2 } from "lucide-react";
import { createPaymentSession } from "@/lib/stripe";
import { getStoredEmail } from "@/lib/freemium";
import { toast } from "sonner";

interface PremiumModalProps {
  onClose: () => void;
  trigger: "limit" | "upgrade";
}

const FREE_FEATURES = [
  "1 analyse par mois",
  "Score de risque & potentiel",
  "Points forts et faibles",
  "Analyse de marché basique",
];

const PREMIUM_FEATURES = [
  "Analyses illimitées",
  "IA plus développée (Gemini 3)",
  "Plan d'action en 5 étapes",
  "Analyse de la concurrence",
  "Audience cible détaillée",
  "Options de financement",
  "Analyse du point mort",
  "Stratégie de croissance",
  "Stratégies de sortie",
];

export function PremiumModal({ onClose, trigger }: PremiumModalProps) {
  const [email, setEmail] = useState(getStoredEmail());
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!email.trim() || !email.includes("@")) {
      toast.error("Entrez une adresse email valide.");
      return;
    }
    setLoading(true);
    try {
      const url = await createPaymentSession(email.trim());
      window.open(url, "_blank");
      toast.success("Redirection vers Stripe en cours...");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur lors de la création du paiement.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
        {/* Gold top bar */}
        <div className="h-1 w-full gold-gradient" />

        <div className="p-6 sm:p-8">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            {trigger === "limit" ? (
              <>
                <div className="w-14 h-14 rounded-2xl bg-amber-900/30 border border-amber-700/40 flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-7 h-7 text-gold-500" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
                  Limite mensuelle atteinte
                </h2>
                <p className="text-sm text-muted-foreground">
                  Vous avez utilisé votre analyse gratuite ce mois-ci. Passez à Premium pour des analyses illimitées.
                </p>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-amber-900/30 border border-amber-700/40 flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-7 h-7 text-gold-500" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
                  Passez à Premium
                </h2>
                <p className="text-sm text-muted-foreground">
                  Obtenez des analyses approfondies par IA avec plan d'action complet.
                </p>
              </>
            )}
          </div>

          {/* Comparison */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {/* Free */}
            <div className="bg-secondary/40 border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Gratuit</span>
              </div>
              <ul className="space-y-2">
                {FREE_FEATURES.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Premium */}
            <div className="bg-gradient-to-br from-amber-900/30 to-amber-800/10 border border-amber-700/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-3.5 h-3.5 text-gold-500" />
                <span className="text-xs font-semibold text-gold-500 uppercase tracking-wider">Premium</span>
              </div>
              <ul className="space-y-2">
                {PREMIUM_FEATURES.slice(0, 6).map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-foreground/90">{f}</span>
                  </li>
                ))}
                <li className="text-xs text-gold-500 font-medium">+ {PREMIUM_FEATURES.length - 6} autres...</li>
              </ul>
            </div>
          </div>

          {/* Price */}
          <div className="text-center mb-5">
            <div className="inline-flex items-baseline gap-1">
              <span className="text-4xl font-serif font-black text-gold-500">4,97€</span>
              <span className="text-sm text-muted-foreground">/mois</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Sans engagement · Résiliable à tout moment</p>
          </div>

          {/* Email input */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-foreground mb-2">
              Votre email (pour accéder à Premium)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              className="w-full h-11 bg-background border border-border rounded-xl px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500/50 transition-all"
            />
          </div>

          {/* CTA */}
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full h-12 rounded-xl gold-gradient text-amber-900 font-semibold text-sm hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-all glow-gold flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Redirection...
              </>
            ) : (
              <>
                <Crown className="w-4 h-4" />
                Passer à Premium — 4,97€/mois
              </>
            )}
          </button>

          <p className="text-center text-xs text-muted-foreground mt-3">
            Paiement sécurisé via Stripe · Accès immédiat · Résiliable à tout moment
          </p>
        </div>
      </div>
    </div>
  );
}
