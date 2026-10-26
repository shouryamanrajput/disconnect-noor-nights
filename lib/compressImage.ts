// Shrinks a payment screenshot in the browser before upload:
// longest side ≤ 1280 px, JPEG, under ~500 KB. Works for JPG/PNG/WebP
// everywhere and HEIC where the browser can decode it (Safari). If a HEIC
// can't be decoded here, the original is sent as-is when it is small enough
// (the Apps Script accepts HEIC and caps uploads at ~5 MB).

export type Compressed = { base64: string; mimeType: string; bytes: number; width?: number; height?: number; previewUrl: string };

export const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const MAX_SIDE = 1280;
const TARGET = 500 * 1024;
const RAW_FALLBACK_MAX = 4 * 1024 * 1024;

export function mimeOf(file: File) {
  const t = (file.type || "").toLowerCase();
  if (t === "image/jpg") return "image/jpeg";
  if (t) return t;
  const ext = file.name.split(".").pop()?.toLowerCase();
  return ext === "heic" ? "image/heic" : ext === "heif" ? "image/heif" : ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : ext === "jpg" || ext === "jpeg" ? "image/jpeg" : "";
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("decode"));
    };
    img.src = url;
  });
}

const toBlob = (c: HTMLCanvasElement, q: number) => new Promise<Blob | null>((r) => c.toBlob(r, "image/jpeg", q));

function blobToBase64(b: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result).split(",")[1] || "");
    fr.onerror = () => reject(fr.error);
    fr.readAsDataURL(b);
  });
}

export async function compressImage(file: File): Promise<Compressed> {
  const mime = mimeOf(file);
  if (!ACCEPTED.includes(mime)) throw new Error("type");
  let img: HTMLImageElement;
  try {
    img = await loadImage(file);
  } catch {
    // e.g. HEIC on Chrome/Android: send the original if it's small enough.
    if ((mime === "image/heic" || mime === "image/heif") && file.size <= RAW_FALLBACK_MAX) {
      return { base64: await blobToBase64(file), mimeType: mime, bytes: file.size, previewUrl: "" };
    }
    throw new Error("decode");
  }
  let side = MAX_SIDE;
  let blob: Blob | null = null;
  let w = 0;
  let h = 0;
  for (let attempt = 0; attempt < 4; attempt++) {
    const scale = Math.min(1, side / Math.max(img.naturalWidth, img.naturalHeight));
    w = Math.max(1, Math.round(img.naturalWidth * scale));
    h = Math.max(1, Math.round(img.naturalHeight * scale));
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    if (!ctx) throw new Error("canvas");
    ctx.fillStyle = "#fff"; // transparent PNGs → white, not black
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    for (const q of [0.82, 0.7, 0.58]) {
      blob = await toBlob(c, q);
      if (blob && blob.size <= TARGET) break;
    }
    if (blob && blob.size <= TARGET) break;
    side = Math.round(side * 0.75);
  }
  URL.revokeObjectURL(img.src);
  if (!blob) throw new Error("encode");
  return { base64: await blobToBase64(blob), mimeType: "image/jpeg", bytes: blob.size, width: w, height: h, previewUrl: URL.createObjectURL(blob) };
}
