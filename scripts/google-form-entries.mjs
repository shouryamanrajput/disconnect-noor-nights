#!/usr/bin/env node
// Print the entry IDs of a public Google Form, so you can paste them into
// lib/config.ts → site.googleForm.
//
//   node scripts/google-form-entries.mjs "https://docs.google.com/forms/d/e/<FORM_ID>/viewform"
//   node scripts/google-form-entries.mjs "https://forms.gle/xxxx"
//   node scripts/google-form-entries.mjs --json "<url>"     (machine-readable)
//   node scripts/google-form-entries.mjs --self-test        (offline parser test)
//
// No API key or login needed: it reads the public form page and parses the
// FB_PUBLIC_LOAD_DATA_ blob Google embeds in it. The form must accept
// responses without sign-in ("Restrict to users in <org>" and
// "Limit to 1 response" must be OFF, or the page will be a login wall).
// Needs Node 18+ (built-in fetch). No dependencies.

const TYPES = {
  0: "short answer",
  1: "paragraph",
  2: "multiple choice",
  3: "dropdown",
  4: "checkboxes",
  5: "linear scale",
  7: "grid",
  8: "section",
  9: "date",
  10: "time",
  11: "image",
  12: "video",
  13: "file upload",
  18: "rating",
};

/** Pull the FB_PUBLIC_LOAD_DATA_ array out of the viewform HTML. */
export function extractLoadData(html) {
  const m = html.match(/FB_PUBLIC_LOAD_DATA_\s*=\s*([\s\S]*?);\s*<\/script>/);
  if (!m) throw new Error("FB_PUBLIC_LOAD_DATA_ not found — is this a public Google Form viewform page (not a sign-in page or the editor)?");
  return JSON.parse(m[1]);
}

/** Turn FB_PUBLIC_LOAD_DATA_ into a flat list of questions with entry IDs. */
export function parseLoadData(data) {
  const form = data?.[1] ?? [];
  const items = form[1] ?? [];
  const questions = [];
  for (const item of items) {
    const [, title, , type, groups] = item;
    if (!Array.isArray(groups)) continue; // sections, images, videos: no answers
    for (const g of groups) {
      if (!Array.isArray(g) || g[0] == null) continue;
      const rawOpts = Array.isArray(g[1]) ? g[1] : [];
      const options = rawOpts.filter((o) => o && o[0] !== "" && !o[4]).map((o) => o[0]);
      const hasOther = rawOpts.some((o) => o && o[4] === 1);
      questions.push({
        entry: `entry.${g[0]}`,
        title: type === 7 && g[3]?.[0] ? `${title ?? ""} [${g[3][0]}]` : (title ?? "").trim(),
        type: TYPES[type] ?? `type ${type}`,
        required: !!g[2],
        options,
        hasOther,
      });
    }
  }
  return {
    title: form[8] ?? data?.[3] ?? "",
    description: form[0] ?? "",
    questions,
  };
}

/** viewform URL → formResponse URL (the POST target). */
export function actionFromUrl(url) {
  const u = new URL(url);
  u.search = "";
  u.hash = "";
  u.pathname = u.pathname.replace(/\/(viewform|formResponse|edit)?\/?$/, "") + "/formResponse";
  return u.toString();
}

// Guess which config key each question is, from its title (handy for pasting).
const KEY_HINTS = [
  ["name", /\bname\b/i],
  ["ageGroup", /\bage\b/i],
  ["mobile", /mobile|phone|whats\s?app\s*(no|number)/i],
  ["email", /e-?mail/i],
  ["instagram", /instagram|\big\b|handle/i],
  ["heardFrom", /hear about|how did you (find|hear)/i],
  ["why", /why|made you want|join our/i],
  ["comfortable", /comfortable|may not know/i],
];
export function guessKey(title) {
  return KEY_HINTS.find(([, re]) => re.test(title))?.[0] ?? null;
}

function print(url, parsed) {
  const action = actionFromUrl(url);
  console.log(`\nForm:   ${parsed.title || "(untitled)"}`);
  console.log(`Action: ${action}\n`);
  for (const q of parsed.questions) {
    const flags = [q.type, q.required ? "required" : "optional", q.hasOther ? "has Other" : ""].filter(Boolean).join(", ");
    console.log(`${q.entry.padEnd(18)} ${q.title}  (${flags})`);
    if (q.options.length) console.log(`${"".padEnd(18)}   options: ${q.options.join(" / ")}`);
  }
  // Ready-to-paste block for lib/config.ts
  const keys = {};
  for (const q of parsed.questions) {
    const k = guessKey(q.title);
    if (k && !keys[k]) keys[k] = q.entry;
  }
  console.log("\nPaste into lib/config.ts → site.googleForm (check the guesses!):\n");
  console.log(`  formAction: "${action}",`);
  console.log("  entries: {");
  for (const k of ["name", "ageGroup", "mobile", "email", "instagram", "heardFrom", "heardFromOther", "why", "comfortable"]) {
    console.log(`    ${k}: "${keys[k] ?? ""}",${keys[k] ? "" : "  // not matched — fill by hand or leave \"\""}`);
  }
  console.log("  },");
  if (parsed.questions.some((q) => q.hasOther)) console.log('\nNote: a question has the built-in "Other" option, so heardFromOther can stay "".');
  console.log("");
}

async function main(argv) {
  if (argv.includes("--self-test")) return selfTest();
  const json = argv.includes("--json");
  const url = argv.find((a) => !a.startsWith("--"));
  if (!url) {
    console.error('Usage: node scripts/google-form-entries.mjs "<Google Form viewform URL>"');
    process.exit(1);
  }
  const res = await fetch(url, { redirect: "follow", headers: { "user-agent": "Mozilla/5.0 (form-entry-lister)" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching the form`);
  const finalUrl = res.url || url;
  if (/accounts\.google\.com/.test(finalUrl)) throw new Error("The form needs sign-in. Turn off 'Restrict to users…' / 'Limit to 1 response' and retry.");
  const parsed = parseLoadData(extractLoadData(await res.text()));
  if (json) console.log(JSON.stringify({ action: actionFromUrl(finalUrl), ...parsed }, null, 2));
  else print(finalUrl, parsed);
}

// Offline test with a fixture shaped like a real FB_PUBLIC_LOAD_DATA_.
function selfTest() {
  const fixture = [null, [
    "Form description",
    [
      [111, "What's your name?", null, 0, [[2005620554, null, 1]]],
      [222, "What's your age group?", null, 2, [[1045781291, [["18–20"], ["21–24"], ["25–29"], ["30+"]], 1]]],
      [333, "Mobile number", null, 0, [[1065046570, null, 1]]],
      [444, "Email", null, 0, [[1166974658, null, 1]]],
      [555, "What's your Instagram handle?", "Optional", 0, [[839337160, null, 0]]],
      [666, "How did you hear about Disconnect?", null, 2, [[1556369182, [["Instagram"], ["Existing member"], ["Friend's referral"], ["", null, null, null, 1]], 1]]],
      [777, "A section header", null, 8],
      [888, "What made you want to join our Diwali party?", null, 0, [[1286351021, null, 0]]],
      [999, "Are you comfortable attending a social event where you may not know everyone?", null, 2, [[460837066, [["Yes"], ["I'd love to meet new people"], ["I'm a little shy but open to it"]], 1]]],
      [1000, "Rate", null, 7, [[11, [["1"], ["2"]], 0, ["Music"]], [12, [["1"], ["2"]], 0, ["Food"]]]],
    ],
    null, null, null, null, null, null, "Diwali House Party",
  ], "/forms", "Diwali House Party"];
  const html = `<html><script>var FB_PUBLIC_LOAD_DATA_ = ${JSON.stringify(fixture)};\n</script></html>`;
  const p = parseLoadData(extractLoadData(html));
  const assert = (c, m) => { if (!c) { console.error("FAIL:", m); process.exit(1); } console.log("ok  ", m); };
  assert(p.title === "Diwali House Party", "title");
  assert(p.questions.length === 10, "10 answerable entries (section skipped, grid rows split)");
  assert(p.questions[0].entry === "entry.2005620554" && p.questions[0].required, "name entry + required");
  assert(p.questions[1].options.join("|") === "18–20|21–24|25–29|30+", "age options");
  assert(p.questions[5].hasOther && p.questions[5].options.length === 3, "Other option detected, not listed as a choice");
  assert(p.questions[7].title.startsWith("Are you comfortable"), "skips section header");
  assert(p.questions[9].title === "Rate [Food]", "grid row titles");
  assert(guessKey("What's your Instagram handle?") === "instagram" && guessKey("Mobile number") === "mobile" && guessKey("How did you hear about Disconnect?") === "heardFrom", "key guesses");
  assert(actionFromUrl("https://docs.google.com/forms/d/e/ABC/viewform?usp=sf_link") === "https://docs.google.com/forms/d/e/ABC/formResponse", "action URL");
  let threw = false;
  try { extractLoadData("<html>sign in</html>"); } catch { threw = true; }
  assert(threw, "clear error when blob missing");
  print("https://docs.google.com/forms/d/e/ABC/viewform", p);
}

main(process.argv.slice(2)).catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});
