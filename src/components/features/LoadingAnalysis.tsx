import { useEffect, useState } from "react";

const freeSteps = [
  "Analyse de la proposition de valeur...",
  "Évaluation du potentiel de marché...",
  "Calcul du score de risque...",
  "Estimation du potentiel financier...",
  "Génération du rapport final...",
];

const premiumSteps = [
  "Connexion à l'IA avancée...",
  "Analyse approfondie de l'idée...",
  "Étude de la concurrence et du marché...",
  "Calcul des scores risque et rentabilité...",
  "Élaboration du plan d'action...",
  "Génération du rapport premium...",
];

interface LoadingAnalysisProps {
  isPremium?: boolean;
}

export function LoadingAnalysis({ isPremium }: LoadingAnalysisProps) {
  const steps = isPremium ? premiumSteps : freeSteps;
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 560);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center gap-6">
      {/* Animated Logo */}
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-2 border-gold-500/30 animate-ping" />
        <div className="absolute inset-2 rounded-full border-2 border-gold-500/50 animate-ping [animation-delay:0.3s]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center">
            <span className="text-xl">⚖️</span>
          </div>
        </div>
      </div>

      <div className="text-center">
        <h3 className="text-lg font-serif font-semibold text-foreground mb-1">
          Analyse en cours
        </h3>
        <p className="text-sm text-muted-foreground">{isPremium ? "L'IA avancée analyse votre idée en profondeur" : "Notre moteur évalue votre idée selon 14 critères"}</p>
      </div>

      {/* Steps */}
      <div className="w-full max-w-sm space-y-3">
        {steps.map((step, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 transition-all duration-500 ${
              i < currentStep
                ? "opacity-40"
                : i === currentStep
                ? "opacity-100"
                : "opacity-20"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors duration-500 ${
                i < currentStep
                  ? "bg-green-400"
                  : i === currentStep
                  ? "bg-gold-500 pulse-dot"
                  : "bg-border"
              }`}
            />
            <span
              className={`text-sm transition-colors duration-500 ${
                i === currentStep ? "text-gold-500 font-medium" : "text-muted-foreground"
              }`}
            >
              {step}
            </span>
          </div>
        ))}
      </div>

      {/* Shimmer bars */}
      <div className="w-full space-y-3 mt-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className={`h-3 rounded-full shimmer`} style={{ width: `${70 + i * 10}%` }} />
        ))}
      </div>
    </div>
  );
}
