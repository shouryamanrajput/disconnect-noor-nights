"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { site } from "@/lib/config";
import { compressImage, MAX_INPUT, mimeOf, type Compressed } from "@/lib/compressImage";
import { loadSession, touchSession, type Reg } from "@/lib/session";
import { Ornament } from "@/components/Decor";

export type { Reg };

const fmtKB = (b: number) => (b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

function upiLink(regId: string) {
  const p = site.payment;
  const q = new URLSearchParams({ pa: p.upiId, pn: p.payeeName, cu: "INR", tn: `Disconnect Diwali ${regId}` });
  if (p.amountValue) q.set("am", p.amountValue);
  return `upi://pay?${q.toString()}`;
}

/** Step 2: QR / UPI details, screenshot upload, submit to the Apps Script. */
function SessionTimer({ onExpire }: { onExpire: () => void }) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => {
      const s = loadSession();
      if (!s || s === "expired") return onExpire();
      setLeft(s.left);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [onExpire]);
  if (left === null) return null;
  const sec = Math.max(0, Math.ceil(left / 1000));
  const warn = sec <= 120;
  const mmss = `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
  return (
    <p data-session-timer className={`mx-auto mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] sm:text-[13px] font-semibold ${warn ? "bg-[#FFE27A] text-plum" : "bg-night/40 text-cream/80"}`} role={warn ? "alert" : undefined}>
      <svg viewBox="0 0 20 20" aria-hidden className="h-3.5 w-3.5 fill-current"><path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm1 4v4.6l3 1.8-.8 1.3L9 11.4V6h2Z" /></svg>
      Session expires in <span className="font-mono tabular-nums">{mmss}</span>
      {warn && <span className="sr-only">. Less than 2 minutes left, please upload soon.</span>}
    </p>
  );
}

export default function PaymentStep({ reg, endpoint, onDone, onRestart, onExpire }: { reg: Reg; endpoint: string; onDone: (from?: DOMRect) => void; onRestart: () => void; onExpire: () => void }) {
  const p = site.payment;
  const [qrOk, setQrOk] = useState(true);
  const [shot, setShot] = useState<Compressed | null>(null);
  const [busy, setBusy] = useState<"" | "reading" | "sending">("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  const sending = useRef(false);

  useEffect(() => () => { if (shot?.previewUrl) URL.revokeObjectURL(shot.previewUrl); }, [shot]);

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow picking the same file again
    if (!file) return;
    setError("");
    touchSession();
    if (mimeOf(file).includes("svg")) {
      setError("Please choose an image (JPG, PNG, WebP or HEIC).");
      return;
    }
    if (file.size > MAX_INPUT) {
      setError("That file is over 10 MB. Please upload a screenshot.");
      return;
    }
    setBusy("reading");
    try {
      setShot(await compressImage(file));
    } catch (err) {
      setError((err as Error).message === "type" ? "Please choose an image (JPG, PNG, WebP or HEIC)." : "Couldn’t read that image. Please try a JPG or PNG screenshot.");
    } finally {
      setBusy("");
    }
  }

  async function copyUpi() {
    try {
      await navigator.clipboard.writeText(p.upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked: the ID is still visible to copy by hand */
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (sending.current) return;
    const s = loadSession();
    if (s === "expired") return onExpire();
    touchSession();
    if (!shot) {
      setError("Please add your payment screenshot first.");
      fileRef.current?.focus();
      return;
    }
    sending.current = true;
    setBusy("sending");
    setError("");
    const ext = shot.mimeType === "image/jpeg" ? "jpg" : shot.mimeType.split("/")[1];
    const body = new URLSearchParams({
      action: "payment",
      regId: reg.regId,
      name: reg.name,
      mobile: reg.mobile,
      email: reg.email,
      fileName: `${reg.regId}.${ext}`,
      mimeType: shot.mimeType,
      data: shot.base64,
      company: "",
    });
    try {
      // Opaque (no-cors) response, same as step 1: reaching here = delivered.
      await fetch(endpoint, { method: "POST", mode: "no-cors", body, credentials: "omit" });
      onDone(submitRef.current?.getBoundingClientRect());
    } catch {
      setError("Couldn’t upload just now. Check your connection and try again, or DM us the screenshot on Instagram.");
      setBusy("");
    } finally {
      sending.current = false;
    }
  }

  return (
    <form noValidate onSubmit={onSubmit} onPointerDown={touchSession} onKeyDown={touchSession} className="mx-auto mt-7 max-w-[460px] text-center max-sm:mt-4 max-sm:flex max-sm:flex-col" aria-labelledby="pay-title">
      <p className="text-[13px] sm:text-[14px] text-cream/90 max-sm:order-3 max-sm:mt-1.5 max-sm:text-[12px] max-sm:font-semibold max-sm:leading-snug max-sm:text-gold">
        Thanks, {reg.name.split(" ")[0]}! Your details are in. Registration ID{" "}
        <span className="whitespace-nowrap rounded-md bg-night/50 px-1.5 py-0.5 font-mono text-[12.5px] sm:text-[13.5px] font-bold text-marigold">{reg.regId}</span>
      </p>
      <div className="max-sm:order-4"><SessionTimer onExpire={onExpire} /></div>
      <h3 id="pay-title" className="gold-text title-lg mt-4 font-display text-[1.7rem] uppercase leading-tight sm:mt-5 sm:text-[2.4rem] max-sm:order-1 max-sm:mt-0 max-sm:text-[1.5rem]">{p.title}</h3>
      <Ornament className="mt-1 sm:hidden max-sm:order-2 max-sm:gap-2 max-sm:[&>span]:w-10 max-sm:[&_svg]:h-4 max-sm:[&_svg]:w-6" />
      {/* Phones: one cream card (QR, amount, payee, UPI). From sm up the wrapper is display:contents, so the layout is the original. */}
      <div className="max-sm:order-5 max-sm:mt-4 max-sm:flex max-sm:flex-col max-sm:items-center max-sm:rounded-2xl max-sm:border-2 max-sm:border-marigold/60 max-sm:bg-cream max-sm:px-3 max-sm:pb-3 max-sm:pt-3.5 max-sm:shadow-[0_8px_22px_rgba(20,2,40,0.3)] sm:contents">
      <p className="mt-1 font-sans text-[1.75rem] font-extrabold sm:text-[2rem] leading-none text-cream max-sm:order-3 max-sm:mt-2.5 max-sm:text-[1.6rem] max-sm:text-plum">{p.amount}</p>
      <p className="mt-2 text-[13.5px] sm:text-[14.5px] text-cream/90 max-sm:order-4 max-sm:mt-1 max-sm:text-[12.5px] max-sm:text-plum/75">
        Paying to <span className="font-extrabold tracking-wide text-marigold max-sm:text-rani">{p.payeeName}</span>
      </p>
      <p className="mx-auto mt-3 max-w-[400px] text-[13.5px] sm:text-[14.5px] leading-relaxed text-cream/90 max-sm:order-7 max-sm:mt-2.5 max-sm:text-[11.5px] max-sm:leading-snug max-sm:text-plum/65">{p.body}</p>

      <div className="mx-auto mt-5 w-[220px] rounded-2xl bg-white p-3 sm:w-[260px] shadow-[0_10px_30px_rgba(20,2,40,0.35)] max-sm:order-1 max-sm:mt-0 max-sm:w-[200px] max-sm:p-2 max-sm:shadow-none">
        {qrOk ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.qrImage} alt={`UPI QR code to pay ${p.amount} to ${p.payeeName}`} width={196} height={196} className="block h-[196px] w-[196px] rounded-lg object-contain [image-rendering:pixelated] max-sm:h-[184px] max-sm:w-[184px] sm:h-[236px] sm:w-[236px]" onError={() => setQrOk(false)} />
        ) : (
          <div role="img" aria-label="Payment QR coming soon" className="grid h-[196px] w-[196px] max-sm:h-[184px] max-sm:w-[184px] place-items-center rounded-lg border-2 border-dashed border-plum/30 px-4 text-plum">
            <div>
              <svg viewBox="0 0 48 48" aria-hidden className="mx-auto h-12 w-12 fill-plum/70">
                <path d="M4 4h16v16H4V4Zm4 4v8h8V8H8Zm20-4h16v16H28V4Zm4 4v8h8V8h-8ZM4 28h16v16H4V28Zm4 4v8h8v-8H8Zm20-4h6v6h-6v-6Zm10 0h6v6h-6v-6Zm-10 10h6v6h-6v-6Zm10 0h6v6h-6v-6ZM11 11h2v2h-2v-2Zm24 0h2v2h-2v-2ZM11 35h2v2h-2v-2Z" />
              </svg>
              <p className="mt-2 text-[13px] sm:text-[14px] font-bold">Payment QR coming soon</p>
              <p className="mt-1 text-[11.5px] sm:text-[12.5px] leading-snug text-plum/75">DM us on Instagram and we’ll share the payment details.</p>
            </div>
          </div>
        )}
      </div>
      {qrOk && <p className="mt-3 text-[13px] sm:text-[14px] font-bold text-cream max-sm:order-2 max-sm:mt-1.5 max-sm:text-[12px] max-sm:text-plum/70">Scan with any UPI app</p>}

      {p.upiId && (
        <div className="mt-4 flex flex-col items-center gap-3 max-sm:order-5 max-sm:mt-2.5 max-sm:w-full max-sm:gap-2.5">
          <a href={upiLink(reg.regId)} className="btn-primary min-h-[48px] w-full max-w-[320px] sm:hidden max-sm:order-2 max-sm:text-[15px]">
            Pay {p.amount} with UPI app
          </a>
          <div className="flex max-w-full flex-col items-center max-sm:order-1">
            <span className="mb-1 text-[11.5px] sm:text-[12.5px] font-semibold uppercase tracking-[0.08em] text-cream/75 sm:hidden max-sm:text-plum/60">or pay to UPI ID</span>
            <div className="flex max-w-full items-center gap-2 rounded-full border-2 border-marigold/55 bg-night/30 py-1 pl-4 pr-1 max-sm:border-plum/15 max-sm:bg-plum/[0.06] max-sm:py-0.5 max-sm:pl-3.5">
              <span className="hidden shrink-0 text-[12px] sm:text-[13px] text-cream/80 sm:inline">UPI ID</span>
              <span className="min-w-0 select-all break-all font-sans text-[14px] sm:text-[15px] font-bold tracking-tight text-marigold max-sm:text-[13.5px] max-sm:text-plum">{p.upiId}</span>
              <button type="button" onClick={copyUpi} aria-label={copied ? "UPI ID copied" : "Copy UPI ID"} className="min-h-[44px] max-sm:min-h-[40px] shrink-0 rounded-full bg-marigold px-4 text-[12.5px] sm:text-[13.5px] font-extrabold text-plum">
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Phones: short how-to rows instead of the note box */}
      <ol className="mt-4 space-y-2 text-left sm:hidden max-sm:order-6">
        {[
          ["1", `Pay ${p.amount} by scanning the QR or with your UPI app`],
          ["2", "Take a screenshot of the payment confirmation"],
          ["3", "Upload it below and submit"],
        ].map(([n, t]) => (
          <li key={n} className="flex items-start gap-2 text-[12.5px] font-medium leading-snug text-cream">
            <span aria-hidden className="mt-px inline-grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full bg-marigold text-[10px] font-extrabold text-plum">{n}</span>
            {t}
          </li>
        ))}
      </ol>

      <p className="max-sm:hidden mx-auto mt-6 max-w-[400px] rounded-xl bg-night/40 px-4 py-3 text-[13px] sm:text-[14px] font-semibold leading-snug text-cream">
        After paying, take or keep a screenshot of the payment confirmation and upload it below.
      </p>

      <div className="mt-6 text-left max-sm:order-7 max-sm:mt-4">
        <p className="flex items-center font-sans text-[14px] sm:text-[15.5px] font-bold text-cream max-sm:text-[13.5px] max-sm:font-medium">
          <span aria-hidden className="mr-2 inline-grid h-7 w-7 shrink-0 place-items-center rounded-full bg-marigold text-[12px] font-extrabold text-plum max-sm:mr-1.5 max-sm:h-[18px] max-sm:w-[18px] max-sm:text-[10px]">↑</span>
          Upload your payment screenshot
        </p>
        <input ref={fileRef} id="pay-file" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif" onChange={onFile} className="peer sr-only" aria-describedby={error ? "pay-err" : "pay-hint"} />
        {shot ? (
          <div className="mt-3 flex items-center gap-4 rounded-xl border-2 border-marigold/55 bg-night/30 p-3 max-sm:mt-1.5 max-sm:gap-3 max-sm:border-dashed max-sm:border-plum/30 max-sm:bg-cream max-sm:p-2.5">
            {shot.previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={shot.previewUrl} alt="Preview of your payment screenshot" className="h-28 w-auto max-w-[45%] rounded-lg object-contain max-sm:h-24" />
            ) : (
              <div className="grid h-28 w-20 place-items-center rounded-lg bg-cream/10 text-[12px] font-bold text-cream/80">HEIC</div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[13px] sm:text-[14px] font-bold text-cream max-sm:text-plum">Screenshot ready</p>
              <p className="text-[12px] sm:text-[13px] text-cream/75 max-sm:text-plum/65">{fmtKB(shot.bytes)}{shot.width ? ` · ${shot.width}×${shot.height}` : ""}</p>
              <label htmlFor="pay-file" className="mt-2 inline-flex min-h-[44px] max-sm:min-h-[40px] cursor-pointer items-center rounded-full border-2 border-marigold/70 px-4 text-[12.5px] sm:text-[13.5px] font-bold text-marigold peer-focus-visible:ring-4 max-sm:border-plum/40 max-sm:bg-marigold max-sm:text-plum">Change</label>
            </div>
          </div>
        ) : (
          <label htmlFor="pay-file" className={`mt-3 flex min-h-[64px] cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 text-[14px] sm:text-[15px] font-bold transition-colors hover:bg-white/5 peer-focus-visible:ring-4 peer-focus-visible:ring-marigold/40 max-sm:mt-1.5 max-sm:min-h-[60px] max-sm:bg-cream max-sm:text-[13px] max-sm:hover:bg-cream ${error ? "border-[#FF6FA3] text-cream max-sm:text-plum" : "border-marigold/70 text-marigold max-sm:border-plum/30 max-sm:text-plum"}`}>
            <svg viewBox="0 0 20 20" aria-hidden className="h-5 w-5 shrink-0 fill-rani sm:hidden"><path d="M4 3h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm0 2v7.6l3.2-3.2 2.6 2.6 3.4-3.4L16 11.4V5H4Zm3 .8a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2Z" /></svg>
            {busy === "reading" ? "Preparing image…" : "Choose screenshot (JPG, PNG, WebP, HEIC)"}
          </label>
        )}
        <p id="pay-hint" className="mt-2 text-[12px] sm:text-[13px] text-cream/70 max-sm:mt-1.5 max-sm:text-[11.5px]">We shrink it on your phone before sending, so it uploads fast.</p>
      </div>

      <div aria-live="polite" className="max-sm:order-8">{error && <p id="pay-err" className="mt-4 text-[13px] sm:text-[14px] font-bold text-[#FFE27A]">{error}</p>}</div>

      <button ref={submitRef} type="submit" disabled={busy !== ""} className="btn-primary btn-spark mt-6 min-h-[50px] w-full text-[15px] max-sm:order-9 max-sm:mt-4 sm:min-h-[56px] sm:text-lg disabled:cursor-wait disabled:opacity-80">
        {busy === "sending" ? "Uploading…" : "Submit payment screenshot"}
      </button>
      <button type="button" onClick={onRestart} className="max-sm:order-10 max-sm:mt-1 max-sm:self-center mt-3 min-h-[44px] px-3 text-[12.5px] sm:text-[13.5px] font-semibold text-cream/75 underline decoration-cream/30 underline-offset-4 hover:text-cream">
        Not you? Start over
      </button>
    </form>
  );
}
