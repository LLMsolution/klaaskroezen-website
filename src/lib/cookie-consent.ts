export type ConsentState = "accepted" | "denied" | null;

export const CONSENT_STORAGE_KEY = "kk-cookie-consent";
export const CONSENT_CHANGE_EVENT = "kk-cookie-consent-change";

export function readConsent(): ConsentState {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
  return value === "accepted" || value === "denied" ? value : null;
}

export function writeConsent(state: "accepted" | "denied"): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CONSENT_STORAGE_KEY, state);
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: state }));
}
