// QA screenshots. Scrolls first so scroll-reveal sections render, then checks
// for horizontal overflow, small text and small tap targets.
// Usage: node scripts/shot.mjs   (SHOT_URL, CHROME env vars optional)
import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";

const CHROME = process.env.CHROME || "/usr/bin/google-chrome";
const URL = process.env.SHOT_URL || "http://localhost:3100";
mkdirSync("shots", { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox", "--hide-scrollbars"],
});
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function run(name, W, H, mobile, { fold = null, bar = null } = {}) {
  const errors = [];
  const page = await browser.newPage();
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push("PAGEERROR " + e.message));
  await page.setViewport({ width: W, height: H, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile });
  await page.goto(URL, { waitUntil: "networkidle0", timeout: 60000 });
  await page.evaluateHandle("document.fonts.ready");
  if (fold) {
    await wait(900);
    const ctaBottom = await page.evaluate(() => {
      const a = document.querySelector("#top a.btn-primary");
      return Math.round(a.getBoundingClientRect().bottom);
    });
    await page.screenshot({ path: `shots/${fold}.png` });
    console.log(fold, `hero CTA bottom at ${ctaBottom}px of ${H}px viewport`);
  }
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += Math.round(H * 0.6)) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await wait(200);
  }
  await wait(700);
  const audit = await page.evaluate((mobile) => {
    const cw = document.documentElement.clientWidth;
    const vis = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none"; };
    const smallText = [];
    for (const el of document.querySelectorAll("body *")) {
      if (!vis(el) || el.closest(".sr-only")) continue;
      const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (!own) continue;
      const fs = parseFloat(getComputedStyle(el).fontSize);
      if (fs < 11) smallText.push(`${el.tagName} ${fs}px "${el.textContent.trim().slice(0, 30)}"`);
    }
    const smallTaps = mobile
      ? [...document.querySelectorAll("a,button")].filter(vis).filter((a) => { const r = a.getBoundingClientRect(); return r.height < 44 || r.width < 44; }).map((a) => `${a.textContent.trim().slice(0, 25) || a.getAttribute("aria-label")} ${Math.round(a.getBoundingClientRect().width)}x${Math.round(a.getBoundingClientRect().height)}`)
      : [];
    return { sw: document.documentElement.scrollWidth, cw, smallText, smallTaps };
  }, mobile);
  if (bar) {
    await page.evaluate(() => window.scrollTo(0, 1600));
    await wait(900);
    await page.screenshot({ path: `shots/${bar}.png` });
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(600);
  // Fixed bars would otherwise be painted mid-page in a full-page capture.
  await page.addStyleTag({ content: ".fixed.bottom-0{display:none!important}" });
  await page.screenshot({ path: `shots/${name}.png`, fullPage: true });
  if (name === "desktop") await page.screenshot({ path: "shots/hero.png", clip: { x: 0, y: 0, width: W, height: 1000 } });
  console.log(name, `${W}x${H}`, "height", total, "hscroll", audit.sw > audit.cw ? `YES ${audit.sw}>${audit.cw}` : "no",
    "| text<11px:", audit.smallText.length ? audit.smallText : "none",
    "| taps<44:", audit.smallTaps.length ? audit.smallTaps : "none", "| errors:", errors.length ? errors : "none");
  await page.close();
}

await run("desktop", 1440, 900, false);
await run("mobile-360", 360, 740, true);
await run("mobile-390", 390, 844, true, { fold: "mobile-fold", bar: "mobile-bar" });
await run("mobile-430", 430, 932, true);
await browser.close();
