import { createClient } from "@supabase/supabase-js";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { BusinessAnalysis } from "@/types/analysis";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export async function createPaymentSession(email: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke("create-payment", {
    body: { email },
  });

  if (error) {
    let msg = error.message;
    if (error instanceof FunctionsHttpError) {
      try {
        const text = await error.context?.text();
        msg = text || msg;
      } catch {
        // keep original
      }
    }
    throw new Error(msg);
  }

  if (!data?.url) throw new Error("No checkout URL returned");
  return data.url;
}

export async function verifyPayment(sessionId: string): Promise<{ isPaid: boolean; email: string | null }> {
  const { data, error } = await supabase.functions.invoke("verify-payment", {
    body: { session_id: sessionId },
  });

  if (error) {
    let msg = error.message;
    if (error instanceof FunctionsHttpError) {
      try {
        const text = await error.context?.text();
        msg = text || msg;
      } catch {
        // keep original
      }
    }
    throw new Error(msg);
  }

  return { isPaid: data?.isPaid ?? false, email: data?.email ?? null };
}

export async function analyzePremium(idea: string): Promise<BusinessAnalysis> {
  const { data, error } = await supabase.functions.invoke("analyze-premium", {
    body: { idea },
  });

  if (error) {
    let msg = error.message;
    if (error instanceof FunctionsHttpError) {
      try {
        const statusCode = error.context?.status ?? 500;
        const text = await error.context?.text();
        msg = `[Code: ${statusCode}] ${text || error.message}`;
      } catch {
        // keep original
      }
    }
    throw new Error(msg);
  }

  const analysis = data?.analysis;
  if (!analysis) throw new Error("No analysis returned from AI");

  return { ...analysis, isPremium: true };
}
