import puppeteer from "puppeteer-core";
const b = await puppeteer.launch({ executablePath: "/usr/bin/google-chrome", headless: true, args: ["--no-sandbox","--hide-scrollbars"] });
for (const [W,H,m,name] of [[390,844,true,"scene-mobile"],[1440,900,false,"/tmp/scene-desktop"]]) {
  const p = await b.newPage();
  await p.setViewport({ width: W, height: H, deviceScaleFactor: m ? 2 : 1, isMobile: m, hasTouch: m });
  await p.goto("http://localhost:3100", { waitUntil: "networkidle0" });
  await p.evaluateHandle("document.fonts.ready");
  await p.evaluate(() => document.getElementById("scene").scrollIntoView());
  await new Promise(r => setTimeout(r, 1500));
  await p.addStyleTag({ content: ".fixed{display:none!important}" });
  const el = await p.$("#scene");
  const box = await el.boundingBox();
  console.log(name, Math.round(box.height));
  await el.screenshot({ path: name.startsWith("/") ? name + ".png" : `shots/${name}.png` });
  await p.close();
}
await b.close();
