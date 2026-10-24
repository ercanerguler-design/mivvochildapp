/** Quick probe: prints the analyzer's score for each message. Usage: node scripts/probe-nlp.mts */
import { config } from "dotenv";
config({ path: ".env.local" });
const { analyzeText } = await import("../src/lib/nlp.ts");

const msgs = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [
      "Ercan: salaksın sen",
      "Ercan: aptal mısın lan sen",
      "Ercan: geri zekalı",
      "Ercan: seni sevmiyoruz kimse seni istemiyor",
      "Ercan: çok çirkinsin iğrenç",
      "Ercan: ezik herif",
      "Ercan: siktir git",
      "Ercan: amk çocuğu",
      "Ercan: orospu çocuğu",
      "Ercan: yarın seni döveceğim",
      "Ercan: okulda herkes sana gülüyor",
      "Ercan: şişko domuz",
      "Ercan: gerizekalı salak aptal",
      "Ercan: sen bir hiçsin",
      "Ercan: kendini öldür",
      "Ercan: amına koyim",
      "Ercan: seni gruptan attık",
      "Ercan: annen de senin gibi aptal",
      "Ercan: kanka maç kaçta",
      "Ercan: seni öldürcem 😂 ödev atmadın",
    ];

const rows = await Promise.all(msgs.map(async (m) => ({ m, r: await analyzeText(m) })));
for (const { m, r } of rows) console.log(String(r.riskScore).padStart(3), r.isRisky ? "RISK" : "    ", (r.categories.join(",") || "-").padEnd(22), m);
