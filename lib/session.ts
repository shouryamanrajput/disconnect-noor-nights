// Client-side session + abuse guards for the registration form.
// Nothing here is a secret or a real security boundary (the server must still
// validate); it keeps stored data minimal and short-lived, and slows down
// accidental or scripted re-submits from one device.
import { site } from "@/lib/config";

export type Reg = { regId: string; name: string; mobile: string; email: string };
type Stored = Reg & { createdAt: number; lastActive: number };

const KEY = "dd-registration"; // sessionStorage (this tab only)
const RECENT_KEY = "dd-recent-mobiles"; // localStorage: { sha256(mobile): expiresAt }
const SUBMITS_KEY = "dd-submits"; // localStorage: [timestamps]
const MIN = 60_000;
export const REREGISTER_MS = 10 * MIN;
export const RATE_MAX = 3;
export const RATE_WINDOW_MS = 10 * MIN;
const REG_ID_RE = /^DSC-[A-Z0-9]{6}$/;

const ttl = () => site.session.ttlMinutes * MIN;
const idle = () => site.session.idleMinutes * MIN;

function read<T>(store: Storage, key: string): T | null {
  try {
    return JSON.parse(store.getItem(key) || "null") as T | null;
  } catch {
    return null;
  }
}
function write(store: Storage, key: string, value: unknown) {
  try {
    store.setItem(key, JSON.stringify(value));
  } catch {
    /* storage blocked (private mode): features degrade gracefully */
  }
}

/** ms until the session ends (whichever of absolute TTL / idle comes first). */
export const msLeft = (s: Stored, now = Date.now()) => Math.min(s.createdAt + ttl(), s.lastActive + idle()) - now;

export function saveSession(reg: Reg) {
  const now = Date.now();
  // Minimum only: no answers, no screenshot, no base64.
  write(sessionStorage, KEY, { regId: reg.regId, name: reg.name, mobile: reg.mobile, email: reg.email, createdAt: now, lastActive: now } satisfies Stored);
}

export function clearSession() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {}
}

/** Valid session → { reg, left }; expired → "expired" (and cleared); none → null. */
export function loadSession(): { reg: Reg; left: number } | "expired" | null {
  const s = read<Stored>(sessionStorage, KEY);
  if (!s) return null;
  const ok = typeof s === "object" && REG_ID_RE.test(String(s.regId)) && /^\+91[6-9]\d{9}$/.test(String(s.mobile)) && Number.isFinite(s.createdAt) && Number.isFinite(s.lastActive) && s.createdAt <= Date.now() + MIN;
  if (!ok) {
    clearSession();
    return null;
  }
  const left = msLeft(s);
  if (left <= 0) {
    clearSession();
    return "expired";
  }
  return { reg: { regId: s.regId, name: String(s.name).slice(0, 80), mobile: s.mobile, email: String(s.email).slice(0, 120) }, left };
}

/** Marks activity (extends the idle timer, never the absolute TTL). */
export function touchSession() {
  const s = read<Stored>(sessionStorage, KEY);
  if (s && msLeft(s) > 0) write(sessionStorage, KEY, { ...s, lastActive: Date.now() });
}

/* ── per-device guards (localStorage) ─────────────────── */

async function hashMobile(mobile: string) {
  const data = new TextEncoder().encode(`disconnect-diwali:${mobile}`);
  if (globalThis.crypto?.subtle) {
    const buf = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
  }
  let h = 2166136261; // FNV-1a fallback (non-secure contexts)
  for (const b of data) h = Math.imul(h ^ b, 16777619) >>> 0;
  return "f" + h.toString(16);
}

function recentMap(now = Date.now()) {
  const m = read<Record<string, number>>(localStorage, RECENT_KEY) || {};
  const live: Record<string, number> = {};
  for (const [k, exp] of Object.entries(m)) if (typeof exp === "number" && exp > now) live[k] = exp;
  return live;
}

/** ms until this mobile may register again from this device (0 = allowed). */
export async function reRegisterWait(mobile: string) {
  const exp = recentMap()[await hashMobile(mobile)];
  return exp ? exp - Date.now() : 0;
}
export async function rememberMobile(mobile: string) {
  const m = recentMap();
  m[await hashMobile(mobile)] = Date.now() + REREGISTER_MS;
  write(localStorage, RECENT_KEY, m);
}

/** ms until another submit is allowed (0 = allowed). */
export function rateLimitWait(now = Date.now()) {
  const list = (read<number[]>(localStorage, SUBMITS_KEY) || []).filter((t) => typeof t === "number" && t > now - RATE_WINDOW_MS);
  return list.length >= RATE_MAX ? Math.min(...list) + RATE_WINDOW_MS - now : 0;
}
export function recordSubmit(now = Date.now()) {
  const list = (read<number[]>(localStorage, SUBMITS_KEY) || []).filter((t) => typeof t === "number" && t > now - RATE_WINDOW_MS);
  list.push(now);
  write(localStorage, SUBMITS_KEY, list);
}

export const fmtWait = (ms: number) => {
  const m = Math.ceil(ms / MIN);
  return m <= 1 ? "a minute" : `${m} minutes`;
};
