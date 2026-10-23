// Mivvo brand asset generator. Usage: node gen.js <projectRoot> <sharpPath>
const path = require("path");
const fs = require("fs");
const root = process.argv[2];
const sharp = require(process.argv[3]);

const THEMES = {
  parent: { from: "#4F46E5", to: "#8B5CF6", fg: "#FFFFFF", accent: "#FF8A65" },
  child: { from: "#FF8A65", to: "#F05A7E", fg: "#FFFFFF", accent: "#4F46E5" },
};

// The "Kucak" mark, drawn on a 1024 grid centered at 512,512.
function mark(t, opts = {}) {
  const fg = opts.mono ? "#FFFFFF" : t.fg;
  const accent = opts.mono ? "#FFFFFF" : t.accent;
  return `<path d="M268 470 Q268 790 512 790 Q756 790 756 470" fill="none" stroke="${fg}" stroke-width="104" stroke-linecap="round"/>
<circle cx="512" cy="520" r="112" fill="${accent}"/>
<circle cx="512" cy="268" r="84" fill="${fg}"/>`;
}
const grad = (t, id = "g") =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="1024" y2="1024" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${t.from}"/><stop offset="1" stop-color="${t.to}"/></linearGradient>`;

const svg = (body, w = 1024, h = 1024, defs = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs>${defs}</defs>${body}</svg>`;

// Mark scaled into a box: s = scale, centered in w x h canvas.
const placed = (t, s, w = 1024, h = 1024, opts) =>
  `<g transform="translate(${w / 2 - 512 * s} ${h / 2 - 512 * s}) scale(${s})">${mark(t, opts)}</g>`;

const rounded = (t) => svg(`<rect width="1024" height="1024" rx="232" fill="url(#g)"/>${mark(t)}`, 1024, 1024, grad(t));
const square = (t, s = 0.86) => svg(`<rect width="1024" height="1024" fill="url(#g)"/>${placed(t, s)}`, 1024, 1024, grad(t));

async function out(svgStr, file, size) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  let img = sharp(Buffer.from(svgStr));
  if (size) img = img.resize(size[0], size[1]);
  await img.png().toFile(file);
  console.log("wrote", path.relative(root, file));
}

async function featureGraphic(t, title, sub, file) {
  const s = svg(
    `<rect width="1024" height="500" fill="url(#g)"/>
<circle cx="900" cy="80" r="220" fill="#fff" fill-opacity="0.07"/>
<circle cx="80" cy="470" r="160" fill="#fff" fill-opacity="0.07"/>
<g transform="translate(80 135) scale(0.225)"><rect width="1024" height="1024" rx="232" fill="#fff" fill-opacity="0.16"/>${mark(t)}</g>
<text x="350" y="240" font-family="Segoe UI, Arial, sans-serif" font-size="68" font-weight="800" fill="#fff">${title}</text>
<text x="350" y="300" font-family="Segoe UI, Arial, sans-serif" font-size="30" fill="#fff" fill-opacity="0.92">${sub}</text>`,
    1024, 500, grad(t)
  );
  await out(s, file);
}

(async () => {
  const P = THEMES.parent, C = THEMES.child;
  const web = path.join(root, "frontend/frontend");
  const parent = path.join(root, "parent-app-expo/assets");
  const child = path.join(root, "child-app-expo/assets/images");
  const store = path.join(root, "frontend/brand/store");

  // Brand sources
  fs.mkdirSync(path.join(root, "frontend/brand"), { recursive: true });
  fs.writeFileSync(path.join(root, "frontend/brand/mivvo-mark.svg"), rounded(P));
  fs.writeFileSync(path.join(root, "frontend/brand/mivvo-child-mark.svg"), rounded(C));

  // Web
  fs.writeFileSync(path.join(web, "public/favicon.svg"), rounded(P));
  fs.writeFileSync(path.join(web, "src/app/icon.svg"), rounded(P));
  await out(square(P, 0.8), path.join(web, "src/app/apple-icon.png"), [180, 180]);
  await out(rounded(P), path.join(web, "public/icon-192.png"), [192, 192]);
  await out(rounded(P), path.join(web, "public/icon-512.png"), [512, 512]);
  await out(square(P, 0.62), path.join(web, "public/icon-maskable-512.png"), [512, 512]);

  // Expo apps: icon (full-bleed square), adaptive layers, splash, favicon
  for (const [t, dir, names] of [
    [P, parent, { icon: "icon.png", fg: "adaptive-icon.png", bg: "adaptive-icon-background.png", mono: "adaptive-icon-monochrome.png", splash: "splash-icon.png", fav: "favicon.png" }],
    [C, child, { icon: "icon.png", fg: "android-icon-foreground.png", bg: "android-icon-background.png", mono: "android-icon-monochrome.png", splash: "splash-icon.png", fav: "favicon.png" }],
  ]) {
    await out(square(t), path.join(dir, names.icon));
    // Adaptive foreground: mark inside the 66% safe zone, transparent background
    await out(svg(placed(t, 0.6)), path.join(dir, names.fg));
    await out(svg(`<rect width="1024" height="1024" fill="url(#g)"/>`, 1024, 1024, grad(t)), path.join(dir, names.bg));
    await out(svg(placed(t, 0.6, 1024, 1024, { mono: true })), path.join(dir, names.mono));
    await out(rounded(t), path.join(dir, names.splash), [512, 512]);
    await out(rounded(t), path.join(dir, names.fav), [48, 48]);
  }

  // Social share image (Open Graph / Twitter), 1200x630
  for (const [file, title1, title2, sub] of [
    ["src/app/opengraph-image.png", "Çocuğunuz dijital dünyada", "yalnız değil.", "Türkçe yapay zeka ile zorbalık, tehdit ve yabancı kişi riskine anında bildirim."],
    ["src/app/en/opengraph-image.png", "Your child is never alone", "in the digital world.", "AI alerts for bullying, threats and stranger contact, in real time."],
  ]) {
    const og = svg(
      `<rect width="1200" height="630" fill="#0B0A1F"/>
<circle cx="1080" cy="40" r="360" fill="url(#g)" fill-opacity="0.55"/>
<circle cx="1150" cy="600" r="200" fill="#FF8A65" fill-opacity="0.25"/>
<g transform="translate(80 80) scale(0.09)"><rect width="1024" height="1024" rx="232" fill="url(#g)"/>${mark(P)}</g>
<text x="190" y="152" font-family="Segoe UI, Arial, sans-serif" font-size="46" font-weight="800" fill="#fff">mivvo</text>
<text x="80" y="330" font-family="Segoe UI, Arial, sans-serif" font-size="68" font-weight="800" fill="#fff">${title1}</text>
<text x="80" y="415" font-family="Segoe UI, Arial, sans-serif" font-size="68" font-weight="800" fill="#FF8A65">${title2}</text>
<text x="80" y="500" font-family="Segoe UI, Arial, sans-serif" font-size="28" fill="#C7C4E8">${sub}</text>
<text x="80" y="570" font-family="Segoe UI, Arial, sans-serif" font-size="26" font-weight="700" fill="#A5B4FC">mivvo.org</text>`,
      1200, 630, grad(P)
    );
    await out(og, path.join(web, file));
  }

  // Play Store listing assets
  await out(square(P), path.join(store, "parent-icon-512.png"), [512, 512]);
  await out(square(C), path.join(store, "child-icon-512.png"), [512, 512]);
  await featureGraphic(P, "Mivvo Ebeveyn", "Çocuğunuzun dijital güvenliği, cebinizde.", path.join(store, "parent-feature-1024x500.png"));
  await featureGraphic(C, "Mivvo Çocuk", "Ailenle bağlı, güvende kal.", path.join(store, "child-feature-1024x500.png"));
})().catch((e) => { console.error(e); process.exit(1); });
