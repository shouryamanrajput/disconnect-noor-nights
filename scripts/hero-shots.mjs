// Desktop hero shots, fireworks frame and trunk-pose crops (local QA only).
import puppeteer from "puppeteer-core";
const URL = process.env.URL || "http://localhost:3100";
const b = await puppeteer.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] });
const p = await b.newPage();
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
for (const [w, h] of [[1280, 800], [1440, 900]]) {
  await p.setViewport({ width: w, height: h });
  await p.goto(URL, { waitUntil: "networkidle0" });
  await wait(1200);
  await p.screenshot({ path: `shots/hero-${w}.png` });
}
// fireworks: stub window.open, click the hero button, grab ~500ms later
await p.setViewport({ width: 1440, height: 900 });
await p.goto(URL, { waitUntil: "networkidle0" });
await p.evaluate(() => { window.__opened = []; window.open = (u) => { window.__opened.push(u); return null; }; });
await wait(600);
await p.click("#top a.btn-primary");
await wait(520);
await p.screenshot({ path: "shots/fireworks.png" });
console.log("opened:", await p.evaluate(() => window.__opened));
await wait(1600);
console.log("canvas left after:", await p.evaluate(() => document.querySelectorAll("canvas[data-fireworks]").length));
// trunk poses: elephant crop at two scroll positions
const crop = async (name) => {
  const r = await p.evaluate(() => { const e = [...document.querySelectorAll("#top div[aria-hidden]")].find((d) => d.querySelector("img[src*='elephant-body-left']") && getComputedStyle(d).display !== "none"); const b = e.getBoundingClientRect(); return { x: b.x, y: b.y + window.scrollY, w: b.width, h: b.height }; });
  await p.screenshot({ path: `shots/${name}.png`, clip: { x: Math.max(0, r.x - 10), y: Math.max(0, r.y - 30), width: r.w + 20, height: r.h + 60 } });
};
await p.evaluate(() => window.scrollTo(0, 0)); await wait(2000); await crop("trunk-a");
await p.evaluate(() => window.scrollTo(0, 180)); await wait(250); await crop("trunk-b");
await b.close();
