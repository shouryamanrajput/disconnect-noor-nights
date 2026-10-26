"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { site } from "@/lib/config";
import { ACCEPTED, compressImage, mimeOf, type Compressed } from "@/lib/compressImage";

export type Reg = { regId: string; name: string; mobile: string; email: string };

const fmtKB = (b: number) => (b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

function upiLink(regId: string) {
  const p = site.payment;
  const q = new URLSearchParams({ pa: p.upiId, pn: p.payeeName, cu: "INR", tn: `Disconnect Diwali ${regId}` });
  if (p.amountValue) q.set("am", p.amountValue);
  return `upi://pay?${q.toString()}`;
}

/** Step 2: QR / UPI details, screenshot upload, submit to the Apps Script. */
export default function PaymentStep({ reg, endpoint, onDone, onRestart }: { reg: Reg; endpoint: string; onDone: (from?: DOMRect) => void; onRestart: () => void }) {
  const p = site.payment;
  const [qrOk, setQrOk] = useState(true);
  const [shot, setShot] = useState<Compressed | null>(null);
  const [busy, setBusy] = useState<"" | "reading" | "sending">("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);

  useEffect(() => () => { if (shot?.previewUrl) URL.revokeObjectURL(shot.previewUrl); }, [shot]);

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow picking the same file again
    if (!file) return;
    setError("");
    if (!ACCEPTED.includes(mimeOf(file))) {
      setError("Please choose an image (JPG, PNG, WebP or HEIC).");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setError("That file is too large. Please upload a screenshot.");
      return;
    }
    setBusy("reading");
    try {
      setShot(await compressImage(file));
    } catch {
      setError("Couldn’t read that image. Please try a JPG or PNG screenshot.");
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
    if (!shot) {
      setError("Please add your payment screenshot first.");
      fileRef.current?.focus();
      return;
    }
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
      await fetch(endpoint, { method: "POST", mode: "no-cors", body });
      onDone(submitRef.current?.getBoundingClientRect());
    } catch {
      setError("Couldn’t upload just now. Check your connection and try again, or DM us the screenshot on Instagram.");
      setBusy("");
    }
  }

  return (
    <form noValidate onSubmit={onSubmit} className="mx-auto mt-7 max-w-[460px] text-center" aria-labelledby="pay-title">
      <p className="text-[14px] text-cream/90">
        Thanks, {reg.name.split(" ")[0]}! Your details are in. Registration ID{" "}
        <span className="whitespace-nowrap rounded-md bg-night/50 px-1.5 py-0.5 font-mono text-[13.5px] font-bold text-marigold">{reg.regId}</span>
      </p>
      <h3 id="pay-title" className="gold-text title-lg mt-5 font-display text-[2rem] uppercase leading-tight sm:text-[2.4rem]">{p.title}</h3>
      <p className="mt-1 font-sans text-[2rem] font-extrabold leading-none text-cream">{p.amount}</p>
      <p className="mt-2 text-[14.5px] text-cream/90">
        Paying to <span className="font-extrabold tracking-wide text-marigold">{p.payeeName}</span>
      </p>
      <p className="mx-auto mt-3 max-w-[400px] text-[14.5px] leading-relaxed text-cream/90">{p.body}</p>

      <div className="mx-auto mt-5 w-[220px] rounded-2xl bg-white p-3 sm:w-[260px] shadow-[0_10px_30px_rgba(20,2,40,0.35)]">
        {qrOk ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.qrImage} alt={`UPI QR code to pay ${p.amount} to ${p.payeeName}`} width={196} height={196} className="block h-[196px] w-[196px] rounded-lg object-contain [image-rendering:pixelated] sm:h-[236px] sm:w-[236px]" onError={() => setQrOk(false)} />
        ) : (
          <div role="img" aria-label="Payment QR coming soon" className="grid h-[196px] w-[196px] place-items-center rounded-lg border-2 border-dashed border-plum/30 px-4 text-plum">
            <div>
              <svg viewBox="0 0 48 48" aria-hidden className="mx-auto h-12 w-12 fill-plum/70">
                <path d="M4 4h16v16H4V4Zm4 4v8h8V8H8Zm20-4h16v16H28V4Zm4 4v8h8V8h-8ZM4 28h16v16H4V28Zm4 4v8h8v-8H8Zm20-4h6v6h-6v-6Zm10 0h6v6h-6v-6Zm-10 10h6v6h-6v-6Zm10 0h6v6h-6v-6ZM11 11h2v2h-2v-2Zm24 0h2v2h-2v-2ZM11 35h2v2h-2v-2Z" />
              </svg>
              <p className="mt-2 text-[14px] font-bold">Payment QR coming soon</p>
              <p className="mt-1 text-[12.5px] leading-snug text-plum/75">DM us on Instagram and we’ll share the payment details.</p>
            </div>
          </div>
        )}
      </div>
      {qrOk && <p className="mt-3 text-[14px] font-bold text-cream">Scan with any UPI app</p>}

      {p.upiId && (
        <div className="mt-4 flex flex-col items-center gap-3">
          <a href={upiLink(reg.regId)} className="btn-primary min-h-[52px] w-full max-w-[320px] sm:hidden">
            Pay {p.amount} with UPI app
          </a>
          <div className="flex max-w-full flex-col items-center">
            <span className="mb-1 text-[12.5px] font-semibold uppercase tracking-[0.08em] text-cream/75 sm:hidden">or pay to UPI ID</span>
            <div className="flex max-w-full items-center gap-2 rounded-full border-2 border-marigold/55 bg-night/30 py-1 pl-4 pr-1">
              <span className="hidden shrink-0 text-[13px] text-cream/80 sm:inline">UPI ID</span>
              <span className="min-w-0 select-all break-all font-sans text-[15px] font-bold tracking-tight text-marigold">{p.upiId}</span>
              <button type="button" onClick={copyUpi} aria-label={copied ? "UPI ID copied" : "Copy UPI ID"} className="min-h-[44px] shrink-0 rounded-full bg-marigold px-4 text-[13.5px] font-extrabold text-plum">
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="mx-auto mt-6 max-w-[400px] rounded-xl bg-night/40 px-4 py-3 text-[14px] font-semibold leading-snug text-cream">
        After paying, take or keep a screenshot of the payment confirmation and upload it below.
      </p>

      <div className="mt-6 text-left">
        <p className="flex items-center font-sans text-[15.5px] font-bold text-cream">
          <span aria-hidden className="mr-2 inline-grid h-7 w-7 shrink-0 place-items-center rounded-full bg-marigold text-[12px] font-extrabold text-plum">↑</span>
          Upload your payment screenshot
        </p>
        <input ref={fileRef} id="pay-file" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif" onChange={onFile} className="peer sr-only" aria-describedby={error ? "pay-err" : "pay-hint"} />
        {shot ? (
          <div className="mt-3 flex items-center gap-4 rounded-xl border-2 border-marigold/55 bg-night/30 p-3">
            {shot.previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={shot.previewUrl} alt="Preview of your payment screenshot" className="h-28 w-auto max-w-[45%] rounded-lg object-contain" />
            ) : (
              <div className="grid h-28 w-20 place-items-center rounded-lg bg-cream/10 text-[12px] font-bold text-cream/80">HEIC</div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-bold text-cream">Screenshot ready</p>
              <p className="text-[13px] text-cream/75">{fmtKB(shot.bytes)}{shot.width ? ` · ${shot.width}×${shot.height}` : ""}</p>
              <label htmlFor="pay-file" className="mt-2 inline-flex min-h-[44px] cursor-pointer items-center rounded-full border-2 border-marigold/70 px-4 text-[13.5px] font-bold text-marigold peer-focus-visible:ring-4">Change</label>
            </div>
          </div>
        ) : (
          <label htmlFor="pay-file" className={`mt-3 flex min-h-[64px] cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 text-[15px] font-bold transition-colors hover:bg-white/5 peer-focus-visible:ring-4 peer-focus-visible:ring-marigold/40 ${error ? "border-[#FF6FA3] text-cream" : "border-marigold/70 text-marigold"}`}>
            {busy === "reading" ? "Preparing image…" : "Choose screenshot (JPG, PNG, WebP, HEIC)"}
          </label>
        )}
        <p id="pay-hint" className="mt-2 text-[13px] text-cream/70">We shrink it on your phone before sending, so it uploads fast.</p>
      </div>

      <div aria-live="polite">{error && <p id="pay-err" className="mt-4 text-[14px] font-bold text-[#FFE27A]">{error}</p>}</div>

      <button ref={submitRef} type="submit" disabled={busy !== ""} className="btn-primary btn-spark mt-6 min-h-[56px] w-full text-lg disabled:cursor-wait disabled:opacity-80">
        {busy === "sending" ? "Uploading…" : "Submit payment screenshot"}
      </button>
      <button type="button" onClick={onRestart} className="mt-3 min-h-[44px] px-3 text-[13.5px] font-semibold text-cream/75 underline decoration-cream/30 underline-offset-4 hover:text-cream">
        Not you? Start over
      </button>
    </form>
  );
}
