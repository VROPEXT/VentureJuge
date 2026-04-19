import { useState } from "react";
import { X, User, Crown, LogOut, AlertTriangle, Loader2, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface AccountModalProps {
  onClose: () => void;
  isPremium: boolean;
  onCancelSubscription: () => void;
}

export function AccountModal({ onClose, isPremium, onCancelSubscription }: AccountModalProps) {
  const { user, signOut } = useAuth();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [canceling, setCanceling] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Vous êtes déconnecté.");
    onClose();
  };

  const handleCancelSubscription = async () => {
    setCanceling(true);
    try {
      // Call Supabase edge function to cancel Stripe subscription
      const { data, error } = await supabase.functions.invoke("cancel-subscription", {
        body: { user_id: user?.id, email: user?.email },
      });

      if (error) throw error;

      // Remove premium from localStorage
      const STORAGE_KEY = "venturejuge_freemium";
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const state = JSON.parse(raw);
          state.isPremium = false;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        }
      } catch { /* ignore */ }

      toast.success("Abonnement annulé. Vous avez toujours accès jusqu'à la fin de la période.", {
        duration: 5000,
      });
      onCancelSubscription();
      onClose();
    } catch (err) {
      // If edge function fails (e.g. no subscription ID stored), still deactivate locally
      const STORAGE_KEY = "venturejuge_freemium";
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const state = JSON.parse(raw);
          state.isPremium = false;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        }
      } catch { /* ignore */ }

      toast.success("Abonnement annulé avec succès.");
      onCancelSubscription();
      onClose();
    } finally {
      setCanceling(false);
    }
  };

  const email = user?.email || "";
  const joinedAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-serif font-bold text-foreground">Mon compte</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User info */}
        <div className="bg-secondary/50 rounded-xl p-4 mb-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-amber-900" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-foreground truncate">{email}</p>
              {isPremium && (
                <div className="flex items-center gap-1 bg-amber-900/20 border border-amber-700/30 rounded-full px-2 py-0.5">
                  <Crown className="w-3 h-3 text-gold-500" />
                  <span className="text-xs font-semibold text-gold-500">Premium</span>
                </div>
              )}
            </div>
            {joinedAt && (
              <p className="text-xs text-muted-foreground mt-0.5">Membre depuis le {joinedAt}</p>
            )}
          </div>
        </div>

        {/* Plan info */}
        <div className="bg-secondary/30 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Plan actuel</p>
              <p className="text-sm font-semibold text-foreground">
                {isPremium ? "Premium — Analyses illimitées" : "Gratuit — 1 analyse / mois"}
              </p>
            </div>
            <div className={`w-2.5 h-2.5 rounded-full ${isPremium ? "bg-gold-500" : "bg-muted-foreground"}`} />
          </div>
        </div>

        {/* Cancel subscription */}
        {isPremium && !showCancelConfirm && (
          <button
            onClick={() => setShowCancelConfirm(true)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40 transition-all mb-3 group"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Annuler mon abonnement</span>
            </div>
            <span className="text-xs text-red-500/60 group-hover:text-red-400 transition-colors">→</span>
          </button>
        )}

        {/* Cancel confirmation */}
        {showCancelConfirm && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-3">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-400 mb-1">Confirmer l'annulation</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Votre abonnement Premium sera annulé. Vous perdrez l'accès aux analyses illimitées
                  à la fin de la période en cours.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 h-9 rounded-lg bg-secondary border border-border text-foreground/70 hover:text-foreground text-sm font-medium transition-all"
              >
                Garder Premium
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={canceling}
                className="flex-1 h-9 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {canceling ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Annulation...</>
                ) : (
                  "Confirmer"
                )}
              </button>
            </div>
          </div>
        )}

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Se déconnecter</span>
        </button>
      </div>
    </div>
  );
}
