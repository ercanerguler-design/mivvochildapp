// Builds Google Play listing graphics from real app screen captures.
// Usage: node make-play-assets.js <parent|child> <screens.png (5 screens side by side at 3x)> <outDir> <sharpPath>
const fs = require("fs");
const path = require("path");
const [, , app, screensPng, outDir, sharpPath] = process.argv;
const sharp = require(sharpPath);

const W = 1080, H = 1920;
const SCREEN_W = 1170, SCREEN_H = 2532; // one screen at 3x (390x844)
const FONT = "Segoe UI, Arial, sans-serif";

const APPS = {
  parent: {
    colors: { from: "#4F46E5", to: "#7C3AED", glow: "#FF8A65", accent: "#FFB199", sub: "#E9E7FF", dot: "#FF8A65" },
    feature: { title: ["Çocuğunuzun dijital", "güvenliği, cebinizde."], sub: "Türkçe yapay zekâ ile zorbalık ve tehlikelere anında uyarı", chips: ["Anında uyarı", "9 risk kategorisi", "KVKK uyumlu"] },
    shots: [
      { i: 0, file: "ana-ekran", title: ["Riskleri anında", "öğrenin"], sub: "Zorbalık, tehdit ve yabancı kişi uyarıları tek ekranda" },
      { i: 1, file: "uyari-detayi", title: ["Ne yapacağınızı", "bilin"], sub: "Her uyarıda risk açıklaması ve uzman önerileri" },
      { i: 2, file: "risk-kategorileri", title: ["9 risk kategorisi", "tek bir uygulama"], sub: "Zorbalık, cinsel risk, alkol, tehlikeli akımlar ve dahası" },
      { i: 3, file: "qr-ile-kurulum", title: ["1 dakikada", "kurulum"], sub: "Çocuğunuzun telefonunu QR kod ile eşleştirin" },
      { i: 4, file: "seffaf-koruma", title: ["Şeffaf ve", "güvenli koruma"], sub: "Gizli takip yok · KVKK'ya uygun · Türkçe yapay zekâ" },
    ],
  },
  child: {
    colors: { from: "#F9734F", to: "#E8457A", glow: "#4F46E5", accent: "#FFE7A3", sub: "#FFF1EC", dot: "#4F46E5" },
    feature: { title: ["Çevrim içi dünyada", "ailenle güvende."], sub: "Ebeveyn kontrolü ile zorbalık ve tehlikelere karşı koruma", chips: ["Yardım butonu", "Gizli takip yok", "KVKK uyumlu"] },
    shots: [
      { i: 0, file: "koruma-acik", title: ["Koruma açık,", "ailen yanında"], sub: "Rahatsız edici bir mesaj gelirse ailen haberdar olur" },
      { i: 1, file: "yardim-butonu", title: ["Tek dokunuşla", "yardım iste"], sub: "Acil durumda ailene anında haber ve konumun gider" },
      { i: 2, file: "seffaf-onay", title: ["Gizli değil,", "tamamen şeffaf"], sub: "Hangi verinin işlendiği kurulumda açıkça anlatılır" },
      { i: 3, file: "qr-ile-eslesme", title: ["QR ile", "kolay eşleşme"], sub: "Ebeveyn uygulamasındaki kodu okut, formu doldur" },
      { i: 4, file: "izinler", title: ["İki izinle", "koruma başlar"], sub: "Yalnızca mesajlaşma uygulamalarının bildirimleri okunur" },
    ],
  },
};
const CFG = APPS[app];
if (!CFG) throw new Error("app must be parent or child");
const SHOTS = CFG.shots;
const K = CFG.colors;

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function background(w, h) {
  return `<defs>
    <linearGradient id="bg" x1="0" y1="0" x2="${w}" y2="${h}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${K.from}"/><stop offset="1" stop-color="${K.to}"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <circle cx="${w * 0.95}" cy="${h * 0.08}" r="${w * 0.42}" fill="#ffffff" fill-opacity="0.07"/>
  <circle cx="${w * 0.02}" cy="${h * 0.86}" r="${w * 0.36}" fill="${K.glow}" fill-opacity="0.18"/>`;
}

async function screen(i) {
  return sharp(screensPng).extract({ left: i * SCREEN_W, top: 0, width: SCREEN_W, height: SCREEN_H }).png().toBuffer();
}

/** Screen inside a rounded black phone frame, returned as PNG of the given height. */
async function phone(i, height) {
  const bezel = Math.round(height * 0.018);
  const innerH = height - bezel * 2;
  const innerW = Math.round((innerH * SCREEN_W) / SCREEN_H);
  const width = innerW + bezel * 2;
  const r = Math.round(width * 0.11);
  const ri = r - bezel;
  const shot = await sharp(await screen(i)).resize(innerW, innerH).png().toBuffer();
  const mask = Buffer.from(`<svg width="${innerW}" height="${innerH}"><rect width="${innerW}" height="${innerH}" rx="${ri}" fill="#fff"/></svg>`);
  const rounded = await sharp(shot).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
  const frame = Buffer.from(`<svg width="${width}" height="${height}"><rect width="${width}" height="${height}" rx="${r}" fill="#0F0D1F"/></svg>`);
  return { buf: await sharp(frame).composite([{ input: rounded, left: bezel, top: bezel }]).png().toBuffer(), width, height };
}

async function screenshot({ i, file, title, sub }, n) {
  const p = await phone(i, 1390);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${background(W, H)}
    <text x="${W / 2}" y="190" text-anchor="middle" font-family="${FONT}" font-size="86" font-weight="800" fill="#fff">${esc(title[0])}</text>
    <text x="${W / 2}" y="290" text-anchor="middle" font-family="${FONT}" font-size="86" font-weight="800" fill="${K.accent}">${esc(title[1])}</text>
    <text x="${W / 2}" y="372" text-anchor="middle" font-family="${FONT}" font-size="38" fill="${K.sub}">${esc(sub)}</text>
  </svg>`;
  const shadow = Buffer.from(`<svg width="${p.width + 80}" height="${p.height + 80}"><rect x="40" y="50" width="${p.width}" height="${p.height}" rx="${p.width * 0.11}" fill="#1E1B4B" fill-opacity="0.45"/></svg>`);
  const shadowBlur = await sharp(shadow).blur(24).png().toBuffer();
  const left = Math.round((W - p.width) / 2);
  const top = 455;
  const out = path.join(outDir, "ekran-goruntuleri", `${String(n).padStart(2, "0")}-${file}.png`);
  await sharp(Buffer.from(svg))
    .composite([{ input: shadowBlur, left: left - 40, top: top - 40 }, { input: p.buf, left, top }])
    .png()
    .toFile(out);
  console.log("wrote", path.relative(outDir, out));
}

/** Splits text into lines of at most `max` characters on word boundaries. */
function wrap(text, max) {
  const lines = [];
  let line = "";
  for (const word of text.split(" ")) {
    if (line && (line + " " + word).length > max) {
      lines.push(line);
      line = word;
    } else line = line ? line + " " + word : word;
  }
  if (line) lines.push(line);
  return lines;
}

/** Landscape 16:9 tablet screenshot: headline on the left, phone on the right. Laid out at 1920x1080 and scaled by k. */
async function tabletShot({ i, file, title, sub }, n, dir, k) {
  const w = Math.round(1920 * k), h = Math.round(1080 * k);
  const p = await phone(i, Math.round(940 * k));
  const markSvg = `<g transform="translate(${130 * k} ${120 * k}) scale(${0.075 * k})"><rect width="1024" height="1024" rx="232" fill="#ffffff" fill-opacity="0.18"/><path d="M268 470 Q268 790 512 790 Q756 790 756 470" fill="none" stroke="#fff" stroke-width="104" stroke-linecap="round"/><circle cx="512" cy="520" r="112" fill="${K.dot}"/><circle cx="512" cy="268" r="84" fill="#fff"/></g>`;
  const subLines = wrap(sub, 34)
    .map((l, j) => `<text x="${130 * k}" y="${(640 + j * 54) * k}" font-family="${FONT}" font-size="${40 * k}" fill="${K.sub}">${esc(l)}</text>`)
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${background(w, h)}
    ${markSvg}
    <text x="${226 * k}" y="${172 * k}" font-family="${FONT}" font-size="${44 * k}" font-weight="800" fill="#fff">mivvo</text>
    <text x="${130 * k}" y="${440 * k}" font-family="${FONT}" font-size="${104 * k}" font-weight="800" fill="#fff">${esc(title[0])}</text>
    <text x="${130 * k}" y="${560 * k}" font-family="${FONT}" font-size="${104 * k}" font-weight="800" fill="${K.accent}">${esc(title[1])}</text>
    ${subLines}
  </svg>`;
  const shadow = Buffer.from(`<svg width="${p.width + 80}" height="${p.height + 80}"><rect x="40" y="50" width="${p.width}" height="${p.height}" rx="${p.width * 0.11}" fill="#1E1B4B" fill-opacity="0.45"/></svg>`);
  const shadowBlur = await sharp(shadow).blur(24).png().toBuffer();
  const left = Math.round(w - p.width - 220 * k);
  const top = Math.round((h - p.height) / 2);
  const out = path.join(outDir, dir, `${String(n).padStart(2, "0")}-${file}.png`);
  await sharp(Buffer.from(svg))
    .composite([{ input: shadowBlur, left: left - 40, top: top - 40 }, { input: p.buf, left, top }])
    .png()
    .toFile(out);
  console.log("wrote", path.relative(outDir, out));
}

async function featureGraphic() {
  const w = 1024, h = 500;
  const p = await phone(0, 620);
  const markSvg = (s) => `<g transform="scale(${s})"><rect width="1024" height="1024" rx="232" fill="#ffffff" fill-opacity="0.18"/><path d="M268 470 Q268 790 512 790 Q756 790 756 470" fill="none" stroke="#fff" stroke-width="104" stroke-linecap="round"/><circle cx="512" cy="520" r="112" fill="${K.dot}"/><circle cx="512" cy="268" r="84" fill="#fff"/></g>`;
  const chipW = (label) => Math.round(label.length * 9.6 + 36);
  const chip = (x, y, label) => `<rect x="${x}" y="${y}" rx="18" width="${chipW(label)}" height="36" fill="#ffffff" fill-opacity="0.16"/><text x="${x + 18}" y="${y + 24}" font-family="${FONT}" font-size="18" font-weight="600" fill="#fff">${esc(label)}</text>`;
  const chips = (labels, x, y) => labels.map((l) => { const c = chip(x, y, l); x += chipW(l) + 12; return c; }).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${background(w, h)}
    <g transform="translate(60 74)">${markSvg(0.07)}</g>
    <text x="146" y="118" font-family="${FONT}" font-size="34" font-weight="800" fill="#fff">mivvo</text>
    <text x="60" y="222" font-family="${FONT}" font-size="50" font-weight="800" fill="#fff">${esc(CFG.feature.title[0])}</text>
    <text x="60" y="282" font-family="${FONT}" font-size="50" font-weight="800" fill="${K.accent}">${esc(CFG.feature.title[1])}</text>
    <text x="60" y="330" font-family="${FONT}" font-size="22" fill="${K.sub}">${esc(CFG.feature.sub)}</text>
    ${chips(CFG.feature.chips, 60, 368)}
  </svg>`;
  const out = path.join(outDir, "grafikler", "ozellik-grafigi-1024x500.png");
  await sharp(Buffer.from(svg))
    .composite([{ input: await sharp(p.buf).extract({ left: 0, top: 0, width: p.width, height: h - 40 }).png().toBuffer(), left: w - p.width - 70, top: 40 }])
    .png()
    .toFile(out);
  console.log("wrote", path.relative(outDir, out));
}

(async () => {
  fs.mkdirSync(path.join(outDir, "ekran-goruntuleri"), { recursive: true });
  fs.mkdirSync(path.join(outDir, "grafikler"), { recursive: true });
  let n = 1;
  for (const s of SHOTS) await screenshot(s, n++);
  await featureGraphic();
  // 7" tablets accept 320-3840 px, 10" tablets 1080-7680 px.
  for (const [dir, k] of [["tablet-7-inc", 1], ["tablet-10-inc", 4 / 3]]) {
    fs.mkdirSync(path.join(outDir, dir), { recursive: true });
    n = 1;
    for (const s of SHOTS) await tabletShot(s, n++, dir, k);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
