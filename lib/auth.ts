"use client";

/**
 * Purchase needs an authenticated OmniDEL ID.
 *
 * DEMO ONLY: this keeps a local session so the flow can be clicked through.
 * Replace `requestOtp`, `verifyOtp` and `getSession` with calls to the OmniDEL
 * auth API before launch — nothing else in the site needs to change.
 */
const KEY = "omnidel.session";

export interface Session {
  phone: string;
  at: string;
}

export function getSession(): Session | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export async function requestOtp(phone: string): Promise<void> {
  if (!/^\+?\d[\d\s]{8,14}$/.test(phone.trim())) throw new Error("Enter a valid mobile number.");
  await new Promise((r) => setTimeout(r, 500));
}

export async function verifyOtp(phone: string, code: string): Promise<Session> {
  if (!/^\d{6}$/.test(code.trim())) throw new Error("Enter the 6-digit code.");
  await new Promise((r) => setTimeout(r, 500));
  const s = { phone: phone.trim(), at: new Date().toISOString() };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* private mode: the session lasts for this page only */
  }
  return s;
}

export function signOut() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {}
}
