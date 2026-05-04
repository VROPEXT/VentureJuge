import { useState } from "react";
import { X, Mail, Lock, Briefcase, Eye, EyeOff, Loader2, KeyRound, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
  defaultMode?: "login" | "register";
}

export function AuthModal({ onClose, onSuccess, defaultMode = "login" }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">(defaultMode);
  const [step, setStep] = useState<"form" | "verify">("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async () => {
    setError(null);
    if (!email || !password) { setError("Veuillez remplir tous les champs."); return; }
    if (password.length < 6) { setError("Le mot de passe doit contenir au moins 6 caractères."); return; }
    setLoading(true);
    if (mode === "register") {
      const { error: authError } = await signUp(email, password);
      setLoading(false);
      if (authError) {
        setError(authError.includes("User already registered") ? "Un compte existe déjà avec cet email." : authError);
        return;
      }
      setStep("verify");
      return;
    }
    const { error: authError } = await signIn(email, password);
    setLoading(false);
    if (authError) {
      if (authError.includes("Invalid login credentials")) setError("Email ou mot de passe incorrect.");
      else if (authError.includes("Email not confirmed")) { await supabase.auth.resend({ type: "signup", email }); setStep("verify"); }
      else setError(authError);
      return;
    }
    toast.success("Connexion réussie !");
    onSuccess(); onClose();
  };

  const handleVerifyOtp = async () => {
    setError(null);
    if (otp.length < 4) { setError("Entrez le code reçu par email."); return; }
    setLoading(true);
    const { error: verifyError } = await supabase.auth.verifyOtp({ email, token: otp.trim(), type: "signup" });
    setLoading(false);
    if (verifyError) { setError("Code invalide ou expiré. Réessayez."); return; }
    toast.success("Compte vérifié ! Bienvenue sur VentureJuge 🎉");
    onSuccess(); onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            {step === "verify" && (
              <button onClick={() => { setStep("form"); setOtp(""); setError(null); }} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all mr-1">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-amber-900" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-foreground">
                {step === "verify" ? "Vérification email" : mode === "login" ? "Connexion" : "Créer un compte"}
              </h2>
              <p className="text-xs text-muted-foreground">VentureJuge</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {step === "verify" ? (
          <div className="space-y-4">
            <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl px-4 py-3 flex gap-3 items-start">
              <Mail className="w-4 h-4 text-gold-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">Code envoyé à <span className="text-gold-500">{email}</span>. Vérifiez vos spams.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Code de vérification</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" value={otp} onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); setError(null); }} placeholder="123456" maxLength={6} onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()} className="w-full h-11 bg-background border border-border rounded-xl pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-gold-500/50 tracking-widest font-mono" />
              </div>
            </div>
            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"><p className="text-xs text-red-400">{error}</p></div>}
            <button onClick={handleVerifyOtp} disabled={loading} className="w-full h-11 rounded-xl gold-gradient text-amber-900 font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Vérification...</> : "Confirmer mon compte"}
            </button>
            <button onClick={async () => { await supabase.auth.resend({ type: "signup", email }); toast.info("Nouveau code envoyé !"); }} className="w-full text-xs text-muted-foreground hover:text-gold-500 transition-colors py-1">Renvoyer le code</button>
          </div>
        ) : (
          <>
            <div className="flex bg-secondary rounded-xl p-1 mb-6">
              {(["login", "register"] as const).map((m) => (
                <button key={m} onClick={() => { setMode(m); setError(null); }} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === m ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                  {m === "login" ? "Se connecter" : "S'inscrire"}
                </button>
              ))}
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(null); }} placeholder="vous@exemple.com" onKeyDown={(e) => e.key === "Enter" && handleSubmit()} className="w-full h-11 bg-background border border-border rounded-xl pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-gold-500/50 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => { setPassword(e.target.value); setError(null); }} placeholder={mode === "register" ? "Min. 6 caractères" : "••••••••"} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} className="w-full h-11 bg-background border border-border rounded-xl pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-gold-500/50 transition-all" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"><p className="text-xs text-red-400">{error}</p></div>}
              <button onClick={handleSubmit} disabled={loading} className="w-full h-11 rounded-xl gold-gradient text-amber-900 font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Chargement...</> : mode === "login" ? "Se connecter" : "Créer mon compte"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
