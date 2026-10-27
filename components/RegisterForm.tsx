"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { site } from "@/lib/config";
import { launchFireworks } from "@/lib/fireworks";
import AnimatedElephant from "@/components/AnimatedElephant";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import InstagramIcon from "@/components/InstagramIcon";
import { EnvelopeIcon } from "@/components/Icons";
import { Diya, Ornament } from "@/components/Decor";
import FestiveBackdrop from "@/components/FestiveBackdrop";
import PaymentStep from "@/components/PaymentStep";
import { clearSession, fmtWait, loadSession, rateLimitWait, recordSubmit, reRegisterWait, rememberMobile, saveSession, type Reg } from "@/lib/session";

type Values = {
  name: string;
  ageGroup: string;
  mobile: string;
  email: string;
  instagram: string;
  heardFrom: string;
  heardFromOther: string;
  why: string;
  comfortable: string;
};
type Errors = Partial<Record<keyof Values, string>>;
type Status = "idle" | "sending" | "pay" | "done" | "soon" | "error";
const MIN_FILL_MS = 3000; // faster than this from page load = a bot: skip silently
const LIMITS: Record<keyof Values, number> = { name: 80, ageGroup: 20, mobile: 16, email: 120, instagram: 31, heardFrom: 40, heardFromOther: 100, why: 200, comfortable: 60 };
/** Drops control and bidi-override characters, caps length. */
const sanitize = (k: keyof Values, s: string) => s.replace(/[\u0000-\u001F\u007F-\u009F\u200B\u202A-\u202E\u2066-\u2069\uFEFF]/g, "").slice(0, LIMITS[k]);

const empty: Values = { name: "", ageGroup: "", mobile: "", email: "", instagram: "", heardFrom: "", heardFromOther: "", why: "", comfortable: "" };
// Order the fields are checked in, so focus lands on the first problem.
const order: (keyof Values)[] = ["name", "ageGroup", "mobile", "email", "instagram", "heardFrom", "heardFromOther", "why", "comfortable"];

/** Accepts 98765 43210, 098765…, +91 98765…; returns the 10 digits. */
function normaliseMobile(v: string) {
  let d = v.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return d;
}
const stripAt = (v: string) => v.replace(/^[\s@]+/, "").replace(/\s/g, "");

function validate(v: Values): Errors {
  const e: Errors = {};
  if (v.name.trim().length < 2) e.name = "Please tell us your name.";
  else if (!/^[\p{L}\p{M}][\p{L}\p{M} .'’-]{1,79}$/u.test(v.name.trim())) e.name = "Please use letters only in your name.";
  if (!v.ageGroup) e.ageGroup = "Please pick your age group.";
  const m = normaliseMobile(v.mobile);
  if (!m) e.mobile = "Please add your mobile number.";
  else if (!/^[6-9]\d{9}$/.test(m)) e.mobile = "Enter a valid 10-digit Indian mobile number.";
  if (!v.email.trim()) e.email = "Please add your email.";
  else if (v.email.trim().length > 120 || !/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/.test(v.email.trim())) e.email = "That email doesn’t look right.";
  const ig = stripAt(v.instagram);
  if (ig && !/^[A-Za-z0-9._]{1,30}$/.test(ig)) e.instagram = "Handles use letters, numbers, dots and underscores only.";
  if (!v.heardFrom || !site.form.heardFrom.includes(v.heardFrom)) e.heardFrom = "Please choose one.";
  else if (v.heardFrom === "Other" && !v.heardFromOther.trim()) e.heardFromOther = "Tell us where you heard about us.";
  if (!v.comfortable || !site.form.comfortable.includes(v.comfortable)) e.comfortable = "Please choose one.";
  if (v.ageGroup && !site.form.ageGroups.includes(v.ageGroup)) e.ageGroup = "Please pick your age group.";
  return e;
}

/** DSC-XXXXXX, no look-alike characters (0/O, 1/I/L). */
function newRegId() {
  const abc = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return "DSC-" + Array.from(bytes, (b) => abc[b % abc.length]).join("");
}

/* step indicator: 1 Details, 2 Payment */
function Steps({ step }: { step: 1 | 2 | 3 }) {
  const items = ["Details", "Payment"];
  return (
    <ol aria-label="Registration steps" className="mx-auto mt-3 flex max-w-[320px] items-center justify-center gap-1.5 sm:mt-6 sm:gap-2">
      {items.map((label, i) => {
        const n = i + 1;
        const done = step > n;
        const current = step === n;
        return (
          <li key={label} aria-current={current ? "step" : undefined} className="flex items-center gap-1.5 sm:gap-2">
            {i > 0 && <span aria-hidden className={`h-0.5 w-6 rounded-full sm:w-12 ${step > 1 ? "bg-marigold" : "bg-cream/30"}`} />}
            <span aria-hidden className={`grid h-6 w-6 place-items-center rounded-full border-2 font-sans text-[12px] sm:h-8 sm:w-8 sm:text-[13.5px] font-extrabold ${done || current ? "border-marigold bg-marigold text-plum" : "border-cream/40 text-cream/80"}`}>
              {done ? "✓" : n}
            </span>
            <span className={`font-sans text-[12px] font-bold sm:text-[14px] ${current ? "text-marigold" : "text-cream/85"}`}>
              {label}
              <span className="sr-only">{done ? " (done)" : current ? " (current step)" : ""}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** Payload for the Apps Script web app (scripts/sheet-apps-script.gs). */
function buildBody(v: Values, company: string, regId: string) {
  const ig = stripAt(v.instagram);
  return new URLSearchParams({
    regId,
    name: v.name.trim(),
    ageGroup: v.ageGroup,
    mobile: `+91${normaliseMobile(v.mobile)}`,
    email: v.email.trim(),
    instagram: ig ? `@${ig}` : "",
    heardFrom: v.heardFrom === "Other" ? `Other: ${v.heardFromOther.trim()}` : v.heardFrom,
    why: v.why.trim(),
    comfortable: v.comfortable,
    sourcePage: window.location.origin + window.location.pathname,
    company, // honeypot: real people leave it empty
  });
}

/* ── small building blocks ─────────────────────────────── */
/* Mobile shows an icon in each badge, tablet/desktop keep the numbers. */
const ICONS: Record<string, string> = {
  person: "M10 10a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Zm0 1.8c-3.4 0-6.6 1.7-6.6 4.2V18h13.2v-2c0-2.5-3.2-4.2-6.6-4.2Z",
  group: "M7 9.4a2.9 2.9 0 1 0 0-5.8 2.9 2.9 0 0 0 0 5.8Zm6.6 0a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8ZM7 10.8c-2.8 0-5.4 1.4-5.4 3.4v1.7h10.8v-1.7c0-2-2.6-3.4-5.4-3.4Zm6.6.4c-.6 0-1.1.1-1.6.2 1.1.8 1.8 1.8 1.8 3v1.5h4.6v-1.5c0-1.8-2.2-3.2-4.8-3.2Z",
  phone: "M5.6 2.4 8 2l1.4 3.6-1.7 1.3a9.4 9.4 0 0 0 5.4 5.4l1.3-1.7L18 12l-.4 2.4c-.1.9-.9 1.6-1.8 1.6C9 16 4 11 4 4.2c0-.9.7-1.7 1.6-1.8Z",
  mail: "M3 4.5h14c.8 0 1.5.7 1.5 1.5v8c0 .8-.7 1.5-1.5 1.5H3c-.8 0-1.5-.7-1.5-1.5V6c0-.8.7-1.5 1.5-1.5Zm.4 1.8 6.6 4.6 6.6-4.6H3.4Z",
  insta: "M6.5 2h7A4.5 4.5 0 0 1 18 6.5v7a4.5 4.5 0 0 1-4.5 4.5h-7A4.5 4.5 0 0 1 2 13.5v-7A4.5 4.5 0 0 1 6.5 2Zm0 1.8a2.7 2.7 0 0 0-2.7 2.7v7a2.7 2.7 0 0 0 2.7 2.7h7a2.7 2.7 0 0 0 2.7-2.7v-7a2.7 2.7 0 0 0-2.7-2.7h-7ZM10 6a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 1.8a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4Zm4.3-2.9a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z",
  megaphone: "M16 3v13l-5.2-3H8.6l.9 4H7.3l-1-4H4.5A2.5 2.5 0 0 1 2 10.5v-2A2.5 2.5 0 0 1 4.5 6h6.3L16 3Zm1.6 4.6a2.2 2.2 0 0 1 0 3.8V7.6Z",
  sparkle: "M10 1.5 11.8 7l5.7 1.9-5.7 1.9L10 16.4l-1.8-5.6-5.7-1.9L8.2 7 10 1.5Zm5.6 10.6.8 2.1 2.1.8-2.1.8-.8 2.1-.8-2.1-2.1-.8 2.1-.8.8-2.1Z",
  chat: "M4 3h12a2 2 0 0 1 2 2v7.5a2 2 0 0 1-2 2H9l-4 3.5v-3.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm2 5.2a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Zm4 0a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Zm4 0a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Z",
};
function Num({ n, icon }: { n?: string; icon: string }) {
  return (
    <span aria-hidden className={`mr-1.5 inline-grid h-[18px] w-[18px] shrink-0 place-items-center max-sm:self-start rounded-full bg-marigold font-sans text-[10px] font-extrabold text-plum sm:mr-2 sm:h-6 sm:w-6 sm:text-[11px] ${n ? "" : "sm:bg-transparent"}`}>
      <svg viewBox="0 0 20 20" className="h-[11px] w-[11px] fill-plum sm:hidden"><path d={ICONS[icon]} /></svg>
      {n && <span className="hidden sm:inline">{n}</span>}
    </span>
  );
}
function ErrorText({ id, msg }: { id: string; msg?: string }) {
  if (!msg) return null;
  return (
    <p id={id} className="mt-1.5 flex items-start gap-1.5 text-[12px] font-semibold sm:mt-2 sm:text-[13.5px] text-[#FFE27A]">
      <svg viewBox="0 0 20 20" aria-hidden className="mt-[1px] h-3.5 w-3.5 shrink-0 fill-[#FFE27A] sm:h-4 sm:w-4"><path d="M10 1.5 19 18H1L10 1.5Zm-1 6v5h2v-5H9Zm0 6.5v2h2v-2H9Z" /></svg>
      {msg}
    </p>
  );
}
const inputBase =
  "block w-full h-10 rounded-xl border-2 bg-cream px-3 py-1.5 font-sans text-[16px] font-medium text-plum placeholder:text-plum/45 sm:h-11 sm:px-3.5 sm:py-2 max-sm:placeholder:text-[13.5px] max-sm:placeholder:text-plum/40 outline-none transition-colors focus:border-marigold focus:ring-4 focus:ring-marigold/30";
const inputCls = (bad?: string) => `${inputBase} ${bad ? "border-[#FF6FA3] ring-2 ring-[#FF6FA3]/40" : "border-transparent"}`;

function Field({ id, n, icon, label, hint, error, children }: { id: string; n?: string; icon: string; label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="flex items-center font-sans text-[12.5px] font-semibold leading-[1.3] text-cream max-sm:font-medium sm:text-base">
        <Num n={n} icon={icon} />
        {label}
      </label>
      {hint && <p id={`${id}-hint`} className="mt-0.5 pl-6 text-[11px] sm:pl-8 sm:text-[12.5px] text-cream/70">{hint}</p>}
      <div className="mt-1 sm:mt-2">{children}</div>
      <ErrorText id={`${id}-err`} msg={error} />
    </div>
  );
}

// Pill layouts: "grid4" short options in one row (age), "grid2" a neat 2×2
// (where you heard of us), "stack" long answers one per line on phones.
const PILL_LAYOUT = {
  grid4: "grid grid-cols-2 gap-1.5 min-[360px]:grid-cols-4 sm:gap-2 [&_label]:px-1.5 sm:[&_label]:px-3.5",
  grid2: "grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap sm:gap-2",
  stack: "grid grid-cols-1 gap-1.5 sm:flex sm:flex-wrap sm:gap-2",
};
function Pills({ name, n, icon, legend, options, value, onChange, error, layout }: { name: keyof Values; n: string; icon: string; legend: string; options: string[]; value: string; onChange: (v: string) => void; error?: string; layout: keyof typeof PILL_LAYOUT }) {
  return (
    <fieldset id={`rf-${name}`} tabIndex={-1} aria-invalid={!!error} aria-describedby={error ? `rf-${name}-err` : undefined} className="outline-none">
      <legend className="flex items-center font-sans text-[12.5px] font-semibold leading-[1.3] text-cream max-sm:font-medium sm:text-base">
        <Num n={n} icon={icon} />
        {legend}
      </legend>
      <div className={`mt-1 sm:mt-2 ${PILL_LAYOUT[layout]}`}>
        {options.map((o) => {
          const id = `rf-${name}-${o.replace(/\W+/g, "-")}`;
          return (
            <span key={o} className="relative block">
              <input id={id} type="radio" name={name} value={o} checked={value === o} onChange={() => onChange(o)} className="peer sr-only" />
              <label
                htmlFor={id}
                className={`flex min-h-[36px] cursor-pointer select-none items-center justify-center rounded-full border-[1.5px] px-3 py-1 text-center font-sans text-[12.5px] font-semibold leading-tight sm:min-h-[40px] sm:px-3.5 sm:py-1.5 sm:text-[14px] transition-colors peer-checked:border-marigold peer-checked:bg-marigold peer-checked:text-plum peer-focus-visible:ring-4 peer-focus-visible:ring-marigold/40 ${
                  error ? "border-[#FF6FA3] text-cream" : "border-marigold/55 text-cream hover:border-marigold hover:bg-white/5"
                }`}
              >
                {o}
              </label>
            </span>
          );
        })}
      </div>
      <ErrorText id={`rf-${name}-err`} msg={error} />
    </fieldset>
  );
}

/* ── the section ───────────────────────────────────────── */
export default function RegisterForm() {
  const r = site.register;
  const f = site.form;
  const [v, setV] = useState<Values>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [tried, setTried] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const submitRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const [reg, setReg] = useState<Reg | null>(null);
  const [notice, setNotice] = useState("");
  const mountedAt = useRef(0);
  const sending = useRef(false); // duplicate-submit guard (state updates are async)

  const expire = () => {
    clearSession();
    setReg(null);
    setStatus("idle");
    setNotice("Your session expired, please fill the form again.");
  };

  // Came back after a reload mid-payment? Resume at step 2 unless it expired.
  useEffect(() => {
    mountedAt.current = Date.now();
    const s = loadSession();
    if (s === "expired") setNotice("Your session expired, please fill the form again.");
    else if (s) {
      setReg(s.reg);
      setStatus("pay");
    }
  }, []);
  // Re-check when the tab becomes visible again (phones suspend timers).
  useEffect(() => {
    if (status !== "pay") return;
    const onVis = () => {
      if (document.visibilityState === "visible" && loadSession() === "expired") expire();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [status]);

  const scrollToPanel = () => requestAnimationFrame(() => panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));

  const set = <K extends keyof Values>(k: K, val: Values[K]) => {
    const next = { ...v, [k]: sanitize(k, val) };
    if (notice) setNotice("");
    setV(next);
    if (tried) setErrors(validate(next)); // live re-check once they've tried submitting
    if (status === "error" || status === "soon") setStatus("idle");
  };

  const burst = () => {
    const b = submitRef.current?.getBoundingClientRect();
    if (b) launchFireworks(b.left + b.width / 2, b.top + b.height / 2);
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (sending.current) return;
    setTried(true);
    const errs = validate(v);
    setErrors(errs);
    const first = order.find((k) => errs[k]);
    if (first) {
      const el = document.getElementById(`rf-${first}`);
      el?.focus({ preventScroll: true });
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const endpoint = site.sheetEndpoint;
    if (!endpoint) {
      // Not wired up yet: no network call.
      if (site.links.register) window.open(site.links.register, "_blank", "noopener,noreferrer");
      else setStatus("soon");
      return;
    }
    // Bots: honeypot filled or submitted impossibly fast. Skip silently.
    if ((honeypotRef.current?.value ?? "") !== "" || Date.now() - mountedAt.current < MIN_FILL_MS) {
      setStatus("done");
      return;
    }
    const mobile = `+91${normaliseMobile(v.mobile)}`;
    const rl = rateLimitWait();
    if (rl > 0) {
      setNotice(`Too many attempts from this device. Please try again in ${fmtWait(rl)}, or DM us on Instagram.`);
      return;
    }
    const again = await reRegisterWait(mobile);
    if (again > 0) {
      setNotice(`This number was just registered from this device. Please wait ${fmtWait(again)} before registering it again, or DM us on Instagram.`);
      return;
    }
    sending.current = true;
    setNotice("");
    setStatus("sending");
    try {
      recordSubmit();
      // Apps Script doesn't send CORS headers, so the response is opaque;
      // reaching here means the request was delivered (a network failure throws).
      const regId = newRegId();
      const body = buildBody(v, "", regId);
      await fetch(endpoint, { method: "POST", mode: "no-cors", body, credentials: "omit", referrerPolicy: "strict-origin-when-cross-origin" });
      const next: Reg = { regId, name: body.get("name") || "", mobile, email: body.get("email") || "" };
      saveSession(next);
      await rememberMobile(mobile);
      setReg(next);
      setStatus("pay");
      scrollToPanel();
    } catch {
      setStatus("error");
    } finally {
      sending.current = false;
    }
  }

  function paid(from?: DOMRect) {
    if (from) launchFireworks(from.left + from.width / 2, from.top + from.height / 2);
    else burst();
    clearSession();
    setStatus("done");
    scrollToPanel();
  }
  function restart() {
    clearSession();
    setNotice("");
    setReg(null);
    setV(empty);
    setErrors({});
    setTried(false);
    setStatus("idle");
    scrollToPanel();
  }

  const errCount = Object.keys(errors).length;
  const desc = (k: keyof Values, hint = false) => [hint ? `rf-${k}-hint` : "", errors[k] ? `rf-${k}-err` : ""].filter(Boolean).join(" ") || undefined;

  return (
    <section id="register" className="bg-poster relative scroll-mt-12 overflow-hidden pb-10 pt-6 sm:scroll-mt-14 sm:pb-24 sm:pt-20">
      <FestiveBackdrop variant="full" inner={350} />
      <div className="container-px relative z-10 max-w-[760px]">
        <div>
          {/* elephant pair facing a diya, sitting on the arch */}
          <div aria-hidden className="relative z-10 -mb-5 flex items-end justify-center gap-1 sm:-mb-8 sm:gap-3">
            <AnimatedElephant side="left" sizes="120px" className="w-[64px] sm:w-[112px]" />
            <Diya uid="dyr" className="mb-1 h-9 w-10 sm:h-14 sm:w-16" />
            <AnimatedElephant side="right" sizes="120px" phase={260} className="w-[64px] sm:w-[112px]" />
          </div>

          {/* purple jharokha panel: arched top, gold inner frame */}
          <div ref={panelRef} className="register-arch bg-royal-tex relative scroll-mt-14 px-5 pb-6 pt-9 shadow-[0_12px_28px_rgba(70,8,60,0.3)] sm:scroll-mt-20 sm:px-10 sm:pb-12 sm:pt-20">
            <div aria-hidden className="register-arch-inner pointer-events-none absolute inset-2.5 border-2 border-marigold/70 sm:inset-4" />
            <div className="relative">
              <div className="text-center">
                <h2 className="gold-text title-lg font-display text-[1.65rem] uppercase leading-tight max-[359px]:text-[1.45rem] sm:text-[3.4rem]">{r.heading}</h2>
                <Ornament className="mt-1 max-sm:gap-2 max-sm:[&>span]:w-10 max-sm:[&_svg]:h-4 max-sm:[&_svg]:w-6 sm:mt-3" />
                <p className="mt-1.5 font-sans text-[12px] font-bold uppercase tracking-[0.06em] text-gold max-sm:leading-snug sm:mt-3 sm:text-[14.5px] sm:tracking-[0.08em]">{r.subline}</p>
              </div>

              <Steps step={status === "done" ? 3 : status === "pay" ? 2 : 1} />

              {status === "pay" && reg ? (
                <PaymentStep reg={reg} endpoint={site.sheetEndpoint} onDone={paid} onRestart={restart} onExpire={expire} />
              ) : status === "done" ? (
                <div role="status" className="mx-auto mt-8 max-w-[460px] text-center">
                  <div className="coral-pill mx-auto inline-block rounded-full px-6 py-2 font-caps text-[13px] font-bold uppercase tracking-[0.06em]">Request received</div>
                  <p className="gold-text title-lg mt-6 font-display text-[2rem] uppercase leading-tight sm:text-[2.6rem]">{r.thanksTitle}</p>
                  <p className="mt-3 text-[16px] leading-relaxed text-cream">{r.thanksBody}</p>
                  {reg && <p className="mt-3 text-[14px] text-cream/85">Registration ID <span className="font-mono font-bold text-marigold">{reg.regId}</span>. Keep it handy.</p>}
                </div>
              ) : (
                <form noValidate onSubmit={onSubmit} className="mx-auto mt-4 max-w-[560px] space-y-3 sm:mt-10 sm:space-y-7" aria-describedby="rf-note">
                  {notice && (
                    <p role="status" className="coral-pill rounded-2xl px-4 py-3 text-center font-sans text-[13px] font-bold sm:text-[14.5px]">
                      {notice}
                    </p>
                  )}
                  <Field id="rf-name" n="01" icon="person" label="What’s your name?" error={errors.name}>
                    <input id="rf-name" name="name" type="text" autoComplete="name" required aria-required aria-invalid={!!errors.name} aria-describedby={desc("name")} value={v.name} onChange={(e) => set("name", e.target.value)} placeholder="Your full name" maxLength={80} className={inputCls(errors.name)} />
                  </Field>

                  <Pills name="ageGroup" n="02" icon="group" legend="What’s your age group?" options={f.ageGroups} value={v.ageGroup} onChange={(x) => set("ageGroup", x)} error={errors.ageGroup} layout="grid4" />

                  <div className="grid gap-3 sm:grid-cols-2 sm:gap-5">
                    <Field id="rf-mobile" icon="phone" label="Mobile number" error={errors.mobile}>
                      <div className={`flex overflow-hidden rounded-xl border-2 bg-cream focus-within:border-marigold focus-within:ring-4 focus-within:ring-marigold/30 ${errors.mobile ? "border-[#FF6FA3] ring-2 ring-[#FF6FA3]/40" : "border-transparent"}`}>
                        <span aria-hidden className="grid shrink-0 place-items-center border-r-2 border-plum/15 bg-marigold/90 px-2.5 font-sans text-[14px] font-extrabold text-plum sm:px-3 sm:text-[16px]">+91</span>
                        <input id="rf-mobile" name="mobile" type="tel" inputMode="numeric" autoComplete="tel-national" required aria-required aria-label="Mobile number, 10 digits, India +91" aria-invalid={!!errors.mobile} aria-describedby={desc("mobile")} value={v.mobile} onChange={(e) => set("mobile", e.target.value.replace(/[^\d\s+-]/g, "").slice(0, 16))} placeholder="98765 43210" className="block h-10 w-full min-w-0 bg-transparent px-3 py-2 font-sans text-[16px] font-medium text-plum placeholder:text-plum/45 max-sm:placeholder:text-[14px] max-sm:placeholder:text-plum/40 outline-none" />
                      </div>
                    </Field>
                    <Field id="rf-email" icon="mail" label="Email" error={errors.email}>
                      <input id="rf-email" name="email" type="email" inputMode="email" autoComplete="email" required aria-required aria-invalid={!!errors.email} aria-describedby={desc("email")} value={v.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" maxLength={120} className={inputCls(errors.email)} />
                    </Field>
                  </div>

                  <Field id="rf-instagram" n="03" icon="insta" label="What’s your Instagram handle?" hint="Optional, but useful for event communication" error={errors.instagram}>
                    <div className={`flex overflow-hidden rounded-xl border-2 bg-cream focus-within:border-marigold focus-within:ring-4 focus-within:ring-marigold/30 ${errors.instagram ? "border-[#FF6FA3] ring-2 ring-[#FF6FA3]/40" : "border-transparent"}`}>
                      <span aria-hidden className="grid shrink-0 place-items-center pl-3 font-sans text-[14px] font-extrabold text-plum/60 sm:pl-3.5 sm:text-[16px]">@</span>
                      <input id="rf-instagram" name="instagram" type="text" autoCapitalize="none" autoCorrect="off" spellCheck={false} aria-invalid={!!errors.instagram} aria-describedby={desc("instagram", true)} value={v.instagram} onChange={(e) => set("instagram", stripAt(e.target.value))} placeholder="yourhandle" maxLength={31} className="block h-10 w-full min-w-0 bg-transparent py-2 pl-1 pr-3.5 font-sans text-[16px] font-medium text-plum placeholder:text-plum/45 max-sm:placeholder:text-[14px] max-sm:placeholder:text-plum/40 outline-none" />
                    </div>
                  </Field>

                  <div>
                    <Pills name="heardFrom" n="04" icon="megaphone" legend="How did you hear about Disconnect?" options={f.heardFrom} value={v.heardFrom} onChange={(x) => set("heardFrom", x)} error={errors.heardFrom} layout="grid2" />
                    {v.heardFrom === "Other" && (
                      <div className="mt-3">
                        <label htmlFor="rf-heardFromOther" className="sr-only">Where did you hear about Disconnect?</label>
                        <input id="rf-heardFromOther" name="heardFromOther" type="text" autoFocus aria-invalid={!!errors.heardFromOther} aria-describedby={desc("heardFromOther")} value={v.heardFromOther} onChange={(e) => set("heardFromOther", e.target.value)} placeholder="Where? (e.g. a poster, an event)" maxLength={100} className={inputCls(errors.heardFromOther)} />
                        <ErrorText id="rf-heardFromOther-err" msg={errors.heardFromOther} />
                      </div>
                    )}
                  </div>

                  <Field id="rf-why" n="05" icon="sparkle" label="What made you want to join our Diwali party?" error={errors.why}>
                    <input id="rf-why" name="why" type="text" aria-describedby={desc("why")} value={v.why} onChange={(e) => set("why", e.target.value)} placeholder="Keep it casual" maxLength={200} className={inputCls(errors.why)} />
                  </Field>

                  <Pills name="comfortable" n="06" icon="chat" legend="Are you comfortable attending a social event where you may not know everyone?" options={f.comfortable} value={v.comfortable} onChange={(x) => set("comfortable", x)} error={errors.comfortable} layout="stack" />

                  <div className="pt-0.5 sm:pt-1">
                    {tried && errCount > 0 && (
                      <p role="alert" className="mb-3 text-center text-[12.5px] font-bold text-[#FFE27A] sm:text-[14px]">
                        Please fix the {errCount === 1 ? "highlighted field" : `${errCount} highlighted fields`} above.
                      </p>
                    )}
                    <button ref={submitRef} type="submit" disabled={status === "sending"} className="btn-primary btn-spark min-h-[46px] w-full py-2.5 text-[15px] disabled:cursor-wait disabled:opacity-80 sm:min-h-[56px] sm:text-lg">
                      <EnvelopeIcon className="h-[18px] w-[18px] shrink-0 text-plum" />
                      {status === "sending" ? "Sending…" : site.ctas.primary}
                    </button>
                    <div aria-live="polite">
                      {status === "soon" && <p className="coral-pill mt-5 rounded-2xl px-4 py-3 text-center font-sans text-[13px] font-bold sm:text-[14.5px]">{r.soonMessage}</p>}
                      {status === "error" && <p className="mt-4 text-center text-[12.5px] font-bold text-[#FFE27A] sm:text-[14px]">Couldn’t send just now — check your connection and try again, or DM us on Instagram.</p>}
                    </div>
                  </div>
                  {/* honeypot: hidden from people and screen readers; bots tend to fill it */}
                  <div aria-hidden className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
                    <label htmlFor="rf-company">Company</label>
                    <input ref={honeypotRef} id="rf-company" name="company" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
                  </div>
                </form>
              )}

              <p id="rf-note" className="mx-auto mt-4 max-w-[460px] text-balance text-center text-[11px] leading-snug text-cream/65 sm:mt-7 sm:text-[13.5px]">{r.note}</p>
              <div className="mt-1 sm:mt-2 flex flex-wrap items-center justify-center gap-x-3 max-sm:flex-nowrap max-sm:gap-x-1 gap-y-0 font-semibold sm:gap-x-6">
                <a href={site.links.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center gap-1.5 px-2 text-[13px] text-marigold sm:gap-2 sm:text-[15px] underline decoration-marigold/40 underline-offset-4 hover:decoration-marigold">
                  <WhatsAppIcon className="h-4 w-4 sm:h-5 sm:w-5" /> <span className="sm:hidden">WhatsApp</span><span className="hidden sm:inline">{site.ctas.whatsapp}</span>
                </a>
                <span aria-hidden className="h-4 w-px bg-marigold/40 sm:hidden" />
                <a href={site.links.instagramDM} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center gap-1.5 px-2 text-[13px] text-marigold sm:gap-2 sm:text-[15px] underline decoration-marigold/40 underline-offset-4 hover:decoration-marigold">
                  <InstagramIcon className="h-4 w-4 sm:h-5 sm:w-5" /> <span className="sm:hidden">Instagram DM</span><span className="hidden sm:inline">{site.ctas.instagram}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
