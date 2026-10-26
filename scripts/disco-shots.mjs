// Close-ups of the hero disco balls ~0.8s apart (local QA only).
import puppeteer from "puppeteer-core";
const URL = process.env.URL || "http://localhost:3100";
const b = await puppeteer.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] });
const p = await b.newPage();
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
await p.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
await p.goto(URL, { waitUntil: "networkidle0" });
await wait(1500);
const clip = { x: 20, y: 56, width: 1240, height: 140 };
await p.screenshot({ path: "shots/disco-a.png", clip });
await wait(800);
await p.screenshot({ path: "shots/disco-b.png", clip });
await b.close();
