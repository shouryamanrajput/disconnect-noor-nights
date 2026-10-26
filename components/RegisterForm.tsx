"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { site } from "@/lib/config";
import { launchFireworks } from "@/lib/fireworks";
import Reveal from "@/components/Reveal";
import AnimatedElephant from "@/components/AnimatedElephant";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import InstagramIcon from "@/components/InstagramIcon";
import { EnvelopeIcon } from "@/components/Icons";
import { Diya, Ornament } from "@/components/Decor";
import FestiveBackdrop from "@/components/FestiveBackdrop";
import PaymentStep, { type Reg } from "@/components/PaymentStep";

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
const STORE_KEY = "dd-registration"; // sessionStorage: lets a visitor finish paying after a reload

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
  if (!v.ageGroup) e.ageGroup = "Please pick your age group.";
  const m = normaliseMobile(v.mobile);
  if (!m) e.mobile = "Please add your mobile number.";
  else if (!/^[6-9]\d{9}$/.test(m)) e.mobile = "Enter a valid 10-digit Indian mobile number.";
  if (!v.email.trim()) e.email = "Please add your email.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) e.email = "That email doesn’t look right.";
  const ig = stripAt(v.instagram);
  if (ig && !/^[A-Za-z0-9._]{1,30}$/.test(ig)) e.instagram = "Handles use letters, numbers, dots and underscores only.";
  if (!v.heardFrom) e.heardFrom = "Please choose one.";
  else if (v.heardFrom === "Other" && !v.heardFromOther.trim()) e.heardFromOther = "Tell us where you heard about us.";
  if (!v.comfortable) e.comfortable = "Please choose one.";
  return e;
}

/** DSC-XXXXXX, no look-alike characters (0/O, 1/I/L). */
function newRegId() {
  const abc = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return "DSC-" + Array.from(bytes, (b) => abc[b % abc.length]).join("");
}

function readStored(): Reg | null {
  try {
    const r = JSON.parse(sessionStorage.getItem(STORE_KEY) || "null");
    return r && /^DSC-[A-Z0-9]{6}$/.test(r.regId) && r.mobile ? (r as Reg) : null;
  } catch {
    return null;
  }
}

/* step indicator: 1 Details, 2 Payment */
function Steps({ step }: { step: 1 | 2 | 3 }) {
  const items = ["Details", "Payment"];
  return (
    <ol aria-label="Registration steps" className="mx-auto mt-6 flex max-w-[320px] items-center justify-center gap-2">
      {items.map((label, i) => {
        const n = i + 1;
        const done = step > n;
        const current = step === n;
        return (
          <li key={label} aria-current={current ? "step" : undefined} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden className={`h-0.5 w-8 rounded-full sm:w-12 ${step > 1 ? "bg-marigold" : "bg-cream/30"}`} />}
            <span aria-hidden className={`grid h-8 w-8 place-items-center rounded-full border-2 font-sans text-[13.5px] font-extrabold ${done || current ? "border-marigold bg-marigold text-plum" : "border-cream/40 text-cream/80"}`}>
              {done ? "✓" : n}
            </span>
            <span className={`font-sans text-[14px] font-bold ${current ? "text-marigold" : "text-cream/85"}`}>
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
function Num({ n }: { n: string }) {
  return <span aria-hidden className="mr-2 inline-grid h-7 w-7 shrink-0 place-items-center rounded-full bg-marigold font-sans text-[12px] font-extrabold text-plum">{n}</span>;
}
function ErrorText({ id, msg }: { id: string; msg?: string }) {
  if (!msg) return null;
  return (
    <p id={id} className="mt-2 flex items-start gap-1.5 text-[13.5px] font-semibold text-[#FFE27A]">
      <svg viewBox="0 0 20 20" aria-hidden className="mt-[1px] h-4 w-4 shrink-0 fill-[#FFE27A]"><path d="M10 1.5 19 18H1L10 1.5Zm-1 6v5h2v-5H9Zm0 6.5v2h2v-2H9Z" /></svg>
      {msg}
    </p>
  );
}
const inputBase =
  "block w-full min-h-[48px] rounded-xl border-2 bg-cream px-4 py-2.5 font-sans text-[16px] font-medium text-plum placeholder:text-plum/45 outline-none transition-colors focus:border-marigold focus:ring-4 focus:ring-marigold/30";
const inputCls = (bad?: string) => `${inputBase} ${bad ? "border-[#FF6FA3] ring-2 ring-[#FF6FA3]/40" : "border-transparent"}`;

function Field({ id, n, label, hint, error, children }: { id: string; n?: string; label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="flex items-center font-sans text-[15.5px] font-bold leading-snug text-cream sm:text-base">
        {n ? <Num n={n} /> : <span aria-hidden className="mr-2 inline-block h-7 w-7 shrink-0" />}
        {label}
      </label>
      {hint && <p id={`${id}-hint`} className="mt-1 pl-9 text-[13px] text-cream/75">{hint}</p>}
      <div className="mt-2.5">{children}</div>
      <ErrorText id={`${id}-err`} msg={error} />
    </div>
  );
}

function Pills({ name, n, legend, options, value, onChange, error, cols = "" }: { name: keyof Values; n: string; legend: string; options: string[]; value: string; onChange: (v: string) => void; error?: string; cols?: string }) {
  return (
    <fieldset id={`rf-${name}`} tabIndex={-1} aria-invalid={!!error} aria-describedby={error ? `rf-${name}-err` : undefined} className="outline-none">
      <legend className="flex items-center font-sans text-[15.5px] font-bold leading-snug text-cream sm:text-base">
        <Num n={n} />
        {legend}
      </legend>
      <div className={`mt-2.5 flex flex-wrap gap-2 ${cols}`}>
        {options.map((o) => {
          const id = `rf-${name}-${o.replace(/\W+/g, "-")}`;
          return (
            <span key={o} className="relative">
              <input id={id} type="radio" name={name} value={o} checked={value === o} onChange={() => onChange(o)} className="peer sr-only" />
              <label
                htmlFor={id}
                className={`flex min-h-[44px] cursor-pointer select-none items-center rounded-full border-2 px-4 py-2 font-sans text-[14.5px] font-bold transition-colors peer-checked:border-marigold peer-checked:bg-marigold peer-checked:text-plum peer-focus-visible:ring-4 peer-focus-visible:ring-marigold/40 ${
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

  // Came back after a reload mid-payment? Resume at step 2.
  useEffect(() => {
    const stored = readStored();
    if (stored) {
      setReg(stored);
      setStatus("pay");
    }
  }, []);

  const scrollToPanel = () => requestAnimationFrame(() => panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));

  const set = <K extends keyof Values>(k: K, val: Values[K]) => {
    const next = { ...v, [k]: val };
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
    setStatus("sending");
    try {
      // Apps Script doesn't send CORS headers, so the response is opaque;
      // reaching here means the request was delivered (a network failure throws).
      const regId = newRegId();
      const body = buildBody(v, honeypotRef.current?.value ?? "", regId);
      await fetch(endpoint, { method: "POST", mode: "no-cors", body });
      const next: Reg = { regId, name: body.get("name") || "", mobile: body.get("mobile") || "", email: body.get("email") || "" };
      try {
        sessionStorage.setItem(STORE_KEY, JSON.stringify(next));
      } catch {
        /* private mode: the step still works, it just won't survive a reload */
      }
      setReg(next);
      setStatus("pay");
      scrollToPanel();
    } catch {
      setStatus("error");
    }
  }

  function paid(from?: DOMRect) {
    if (from) launchFireworks(from.left + from.width / 2, from.top + from.height / 2);
    else burst();
    try {
      sessionStorage.removeItem(STORE_KEY);
    } catch {}
    setStatus("done");
    scrollToPanel();
  }
  function restart() {
    try {
      sessionStorage.removeItem(STORE_KEY);
    } catch {}
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
    <section id="register" className="bg-poster relative scroll-mt-14 overflow-hidden pb-20 pt-14 sm:pb-24 sm:pt-20">
      <FestiveBackdrop variant="full" inner={350} />
      <div className="container-px relative z-10 max-w-[760px]">
        <Reveal>
          {/* elephant pair facing a diya, sitting on the arch */}
          <div aria-hidden className="relative z-10 -mb-6 flex items-end justify-center gap-1 sm:-mb-8 sm:gap-3">
            <AnimatedElephant side="left" sizes="120px" className="w-[78px] sm:w-[112px]" />
            <Diya className="mb-1 h-11 w-12 sm:h-14 sm:w-16" />
            <AnimatedElephant side="right" sizes="120px" phase={260} className="w-[78px] sm:w-[112px]" />
          </div>

          {/* purple jharokha panel: arched top, gold inner frame */}
          <div ref={panelRef} className="register-arch bg-royal-tex relative scroll-mt-20 px-4 pb-8 pt-14 shadow-[0_20px_50px_rgba(70,8,60,0.35)] sm:px-10 sm:pb-12 sm:pt-20">
            <div aria-hidden className="register-arch-inner pointer-events-none absolute inset-2.5 border-2 border-marigold/70 sm:inset-4" />
            <div className="relative">
              <div className="text-center">
                <h2 className="gold-text title-lg font-display text-[2.5rem] uppercase leading-tight sm:text-[3.4rem]">{r.heading}</h2>
                <Ornament className="mt-3" />
                <p className="mt-3 font-sans text-[13.5px] font-bold uppercase tracking-[0.08em] text-gold sm:text-[14.5px]">{r.subline}</p>
              </div>

              <Steps step={status === "done" ? 3 : status === "pay" ? 2 : 1} />

              {status === "pay" && reg ? (
                <PaymentStep reg={reg} endpoint={site.sheetEndpoint} onDone={paid} onRestart={restart} />
              ) : status === "done" ? (
                <div role="status" className="mx-auto mt-8 max-w-[460px] text-center">
                  <div className="coral-pill mx-auto inline-block rounded-full px-6 py-2 font-caps text-[13px] font-bold uppercase tracking-[0.06em]">Request received</div>
                  <p className="gold-text title-lg mt-6 font-display text-[2rem] uppercase leading-tight sm:text-[2.6rem]">{r.thanksTitle}</p>
                  <p className="mt-3 text-[16px] leading-relaxed text-cream">{r.thanksBody}</p>
                  {reg && <p className="mt-3 text-[14px] text-cream/85">Registration ID <span className="font-mono font-bold text-marigold">{reg.regId}</span>. Keep it handy.</p>}
                </div>
              ) : (
                <form noValidate onSubmit={onSubmit} className="mx-auto mt-8 max-w-[560px] space-y-7 sm:mt-10" aria-describedby="rf-note">
                  <Field id="rf-name" n="01" label="What’s your name?" error={errors.name}>
                    <input id="rf-name" name="name" type="text" autoComplete="name" required aria-required aria-invalid={!!errors.name} aria-describedby={desc("name")} value={v.name} onChange={(e) => set("name", e.target.value)} placeholder="Your full name" maxLength={80} className={inputCls(errors.name)} />
                  </Field>

                  <Pills name="ageGroup" n="02" legend="What’s your age group?" options={f.ageGroups} value={v.ageGroup} onChange={(x) => set("ageGroup", x)} error={errors.ageGroup} />

                  <div className="grid gap-7 sm:grid-cols-2 sm:gap-5">
                    <Field id="rf-mobile" label="Mobile number" error={errors.mobile}>
                      <div className={`flex overflow-hidden rounded-xl border-2 bg-cream focus-within:border-marigold focus-within:ring-4 focus-within:ring-marigold/30 ${errors.mobile ? "border-[#FF6FA3] ring-2 ring-[#FF6FA3]/40" : "border-transparent"}`}>
                        <span aria-hidden className="grid shrink-0 place-items-center border-r-2 border-plum/15 bg-marigold/90 px-3 font-sans text-[16px] font-extrabold text-plum">+91</span>
                        <input id="rf-mobile" name="mobile" type="tel" inputMode="numeric" autoComplete="tel-national" required aria-required aria-label="Mobile number, 10 digits, India +91" aria-invalid={!!errors.mobile} aria-describedby={desc("mobile")} value={v.mobile} onChange={(e) => set("mobile", e.target.value.replace(/[^\d\s+-]/g, "").slice(0, 16))} placeholder="98765 43210" className="block min-h-[44px] w-full min-w-0 bg-transparent px-3 py-2.5 font-sans text-[16px] font-medium text-plum placeholder:text-plum/45 outline-none" />
                      </div>
                    </Field>
                    <Field id="rf-email" label="Email" error={errors.email}>
                      <input id="rf-email" name="email" type="email" inputMode="email" autoComplete="email" required aria-required aria-invalid={!!errors.email} aria-describedby={desc("email")} value={v.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" className={inputCls(errors.email)} />
                    </Field>
                  </div>

                  <Field id="rf-instagram" n="03" label="What’s your Instagram handle?" hint="Optional, but useful for event communication" error={errors.instagram}>
                    <div className={`flex overflow-hidden rounded-xl border-2 bg-cream focus-within:border-marigold focus-within:ring-4 focus-within:ring-marigold/30 ${errors.instagram ? "border-[#FF6FA3] ring-2 ring-[#FF6FA3]/40" : "border-transparent"}`}>
                      <span aria-hidden className="grid shrink-0 place-items-center pl-4 font-sans text-[16px] font-extrabold text-plum/60">@</span>
                      <input id="rf-instagram" name="instagram" type="text" autoCapitalize="none" autoCorrect="off" spellCheck={false} aria-invalid={!!errors.instagram} aria-describedby={desc("instagram", true)} value={v.instagram} onChange={(e) => set("instagram", stripAt(e.target.value))} placeholder="yourhandle" maxLength={31} className="block min-h-[44px] w-full min-w-0 bg-transparent py-2.5 pl-1 pr-4 font-sans text-[16px] font-medium text-plum placeholder:text-plum/45 outline-none" />
                    </div>
                  </Field>

                  <div>
                    <Pills name="heardFrom" n="04" legend="How did you hear about Disconnect?" options={f.heardFrom} value={v.heardFrom} onChange={(x) => set("heardFrom", x)} error={errors.heardFrom} />
                    {v.heardFrom === "Other" && (
                      <div className="mt-3">
                        <label htmlFor="rf-heardFromOther" className="sr-only">Where did you hear about Disconnect?</label>
                        <input id="rf-heardFromOther" name="heardFromOther" type="text" autoFocus aria-invalid={!!errors.heardFromOther} aria-describedby={desc("heardFromOther")} value={v.heardFromOther} onChange={(e) => set("heardFromOther", e.target.value)} placeholder="Where? (e.g. a poster, an event)" maxLength={100} className={inputCls(errors.heardFromOther)} />
                        <ErrorText id="rf-heardFromOther-err" msg={errors.heardFromOther} />
                      </div>
                    )}
                  </div>

                  <Field id="rf-why" n="05" label="What made you want to join our Diwali party?" error={errors.why}>
                    <input id="rf-why" name="why" type="text" aria-describedby={desc("why")} value={v.why} onChange={(e) => set("why", e.target.value)} placeholder="Keep it casual" maxLength={200} className={inputCls(errors.why)} />
                  </Field>

                  <Pills name="comfortable" n="06" legend="Are you comfortable attending a social event where you may not know everyone?" options={f.comfortable} value={v.comfortable} onChange={(x) => set("comfortable", x)} error={errors.comfortable} />

                  <div className="pt-1">
                    {tried && errCount > 0 && (
                      <p role="alert" className="mb-3 text-center text-[14px] font-bold text-[#FFE27A]">
                        Please fix the {errCount === 1 ? "highlighted field" : `${errCount} highlighted fields`} above.
                      </p>
                    )}
                    <button ref={submitRef} type="submit" disabled={status === "sending"} className="btn-primary btn-spark min-h-[56px] w-full text-lg disabled:cursor-wait disabled:opacity-80">
                      <EnvelopeIcon className="h-5 w-5 shrink-0 text-plum" />
                      {status === "sending" ? "Sending…" : site.ctas.primary}
                    </button>
                    <div aria-live="polite">
                      {status === "soon" && <p className="coral-pill mt-5 rounded-2xl px-4 py-3 text-center font-sans text-[14.5px] font-bold">{r.soonMessage}</p>}
                      {status === "error" && <p className="mt-4 text-center text-[14px] font-bold text-[#FFE27A]">Couldn’t send just now — check your connection and try again, or DM us on Instagram.</p>}
                    </div>
                  </div>
                  {/* honeypot: hidden from people and screen readers; bots tend to fill it */}
                  <div aria-hidden className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
                    <label htmlFor="rf-company">Company</label>
                    <input ref={honeypotRef} id="rf-company" name="company" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
                  </div>
                </form>
              )}

              <p id="rf-note" className="mx-auto mt-7 max-w-[520px] text-center text-[13.5px] leading-relaxed text-cream/85">{r.note}</p>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-0 font-semibold sm:gap-x-6">
                <a href={site.links.whatsapp} target="_blank" rel="noreferrer" className="inline-flex min-h-[44px] items-center gap-2 px-2 text-[15px] text-marigold underline decoration-marigold/40 underline-offset-4 hover:decoration-marigold">
                  <WhatsAppIcon className="h-5 w-5" /> <span className="sm:hidden">WhatsApp</span><span className="hidden sm:inline">{site.ctas.whatsapp}</span>
                </a>
                <a href={site.links.instagramDM} target="_blank" rel="noreferrer" className="inline-flex min-h-[44px] items-center gap-2 px-2 text-[15px] text-marigold underline decoration-marigold/40 underline-offset-4 hover:decoration-marigold">
                  <InstagramIcon className="h-5 w-5" /> <span className="sm:hidden">Instagram DM</span><span className="hidden sm:inline">{site.ctas.instagram}</span>
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
