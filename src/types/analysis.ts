export interface BusinessAnalysis {
  verdict: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  moneyPotential: {
    score: number;
    label: string;
    details: string;
    estimatedRevenue: string;
  };
  risk: {
    score: number;
    label: string;
    details: string;
    mainRisks: string[];
  };
  marketAnalysis: string;
  verdict_emoji: string;
  recommendation: string;
  // Premium-only fields
  isPremium?: boolean;
  actionPlan?: string[];
  targetAudience?: string;
  competitorAnalysis?: string;
  fundingOptions?: string[];
  breakEvenAnalysis?: string;
  growthStrategy?: string;
  exitStrategies?: string[];
}

export type AnalysisStatus = "idle" | "analyzing" | "done";

export interface FreemiumState {
  isPremium: boolean;
  requestsThisMonth: number;
  lastResetMonth: string; // "YYYY-MM"
}
