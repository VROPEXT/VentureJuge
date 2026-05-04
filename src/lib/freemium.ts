import { FreemiumState } from "@/types/analysis";

const STORAGE_KEY = "venturejuge_freemium";

const VIP_ACCOUNTS: string[] = [
  "palagniouk.alexban@gmail.com",
];

export function isVipAccount(email: string | null | undefined): boolean {
  if (!email) return false;
  return VIP_ACCOUNTS.includes(email.toLowerCase().trim());
}

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function getFreemiumState(): FreemiumState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { isPremium: false, requestsThisMonth: 0, lastResetMonth: getCurrentMonth() };
    const state: FreemiumState = JSON.parse(raw);
    if (state.lastResetMonth !== getCurrentMonth()) {
      state.requestsThisMonth = 0;
      state.lastResetMonth = getCurrentMonth();
      saveFreemiumState(state);
    }
    return state;
  } catch {
    return { isPremium: false, requestsThisMonth: 0, lastResetMonth: getCurrentMonth() };
  }
}

export function saveFreemiumState(state: FreemiumState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function canMakeRequest(email?: string | null): boolean {
  if (isVipAccount(email)) return true;
  const state = getFreemiumState();
  if (state.isPremium) return true;
  return state.requestsThisMonth < 1;
}

export function incrementRequestCount() {
  const state = getFreemiumState();
  state.requestsThisMonth += 1;
  saveFreemiumState(state);
}

export function activatePremium(email: string) {
  const state = getFreemiumState();
  state.isPremium = true;
  saveFreemiumState(state);
  localStorage.setItem("venturejuge_email", email);
}

export function getStoredEmail(): string {
  return localStorage.getItem("venturejuge_email") || "";
}

export function isPremiumUser(): boolean {
  return getFreemiumState().isPremium;
}
