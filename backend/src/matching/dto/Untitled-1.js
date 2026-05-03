const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");

const C = {
  BLACK:    "0D0E14",
  DARK:     "13141C",
  CARD:     "1A1B26",
  CARD2:    "1E2030",
  YELLOW:   "F5A623",
  WHITE:    "FFFFFF",
  OFFWHITE: "E8E8F0",
  GRAY:     "8A8BA0",
  LIGHT:    "C5C6D8",
  GREEN:    "2ECC71",
  RED:      "E74C3C",
  NAVY:     "0D1117",
};

const ICONS = {
  helmet:   (c,s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${s}" height="${s}" fill="${c}"><path d="M12 2C7.58 2 4 5.58 4 10v1H2v2h2v1c0 1.11.89 2 2 2h12c1.11 0 2-.89 2-2v-1h2v-2h-2v-1c0-4.42-3.58-8-8-8zm0 2c3.31 0 6 2.69 6 6v1H6v-1c0-3.31 2.69-6 6-6z"/></svg>`,
  building: (c,s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${s}" height="${s}" fill="${c}"><path d="M17 11V3H7v4H3v14h8v-4h2v4h8V11h-4zM7 19H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5v-2h2v2zm4 4H9v-2h2v2zm0-4H9v-2h2v2zm0-4H9V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2z"/></svg>`,
  people:   (c,s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${s}" height="${s}" fill="${c}"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>`,
  lock:     (c,s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${s}" height="${s}" fill="${c}"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>`,
  robot:    (c,s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${s}" height="${s}" fill="${c}"><path d="M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3zM9.5 12c-.83 0-1.5-.67-1.5-1.5S8.67 9 9.5 9s1.5.67 1.5 1.5S10.33 12 9.5 12zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 9 14.5 9s1.5.67 1.5 1.5S15.33 12 14.5 12z"/></svg>`,
  chart:    (c,s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${s}" height="${s}" fill="${c}"><path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z"/></svg>`,
  dollar:   (c,s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${s}" height="${s}" fill="${c}"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>`,
  star:     (c,s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${s}" height="${s}" fill="${c}"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`,
  check:    (c,s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${s}" height="${s}" fill="${c}"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`,
  cross:    (c,s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${s}" height="${s}" fill="${c}"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`,
  globe:    (c,s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${s}" height="${s}" fill="${c}"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>`,
  mail:     (c,s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${s}" height="${s}" fill="${c}"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>`,
  rocket:   (c,s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${s}" height="${s}" fill="${c}"><path d="M9.19 6.35c-2.04 2.29-3.44 5.58-3.57 5.89L2 10.69l4.05-4.05c.47-.47 1.17-.64 1.81-.43l1.33.14zM11.17 19.42c.31-.13 3.58-1.54 5.87-3.58l.14 1.35c.21.64.03 1.34-.44 1.81L12.69 23l-1.52-3.58zm8.49-14.56C16.32 1.52 10.42.62 6.62 4.42l-.28.28 6.96 6.96 6.36-6.8zM14 9c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-7.06 9.77L3 21.99l3.23-3.94 1.97 1.97-.26-.25zm7.06-1.77l-6-6c0-.01.01-.01.01-.02.58-1.34 1.48-3.08 2.76-4.55l7.22 7.22c-1.43 1.28-3.16 2.18-4.52 2.77-.16.06-.32.09-.47.08z"/></svg>`,
  heart:    (c,s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${s}" height="${s}" fill="${c}"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`,
  handshake:(c,s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${s}" height="${s}" fill="${c}"><path d="M11 14H9C9 8.49 13.49 4 19 4v2c-4.41 0-8 3.59-8 8zm4-4h-2c0-2.76 2.24-5 5-5v2c-1.65 0-3 1.35-3 3zm5 12.5c-1.25 0-2.45-.2-3.57-.57-.1-.03-.21-.05-.31-.05-.26 0-.51.1-.71.29l-2.2 2.2c-2.83-1.45-5.15-3.76-6.59-6.59l2.2-2.21c.28-.27.36-.66.25-1.01C8.7 15.45 8.5 14.25 8.5 13c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z"/></svg>`,
  shield:   (c,s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${s}" height="${s}" fill="${c}"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>`,
  target:   (c,s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${s}" height="${s}" fill="${c}"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-12c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/></svg>`,
  growth:   (c,s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${s}" height="${s}" fill="${c}"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>`,
  speed:    (c,s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${s}" height="${s}" fill="${c}"><path d="M20.38 8.57l-1.23 1.85a8 8 0 0 1-.22 7.58H5.07A8 8 0 0 1 15.58 6.85l1.85-1.23A10 10 0 0 0 3.35 19a2 2 0 0 0 1.72 1h13.85a2 2 0 0 0 1.74-1 10 10 0 0 0-.27-10.44zm-9.79 6.84a2 2 0 0 0 2.83 0l5.66-8.49-8.49 5.66a2 2 0 0 0 0 2.83z"/></svg>`,
  quote:    (c,s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${s}" height="${s}" fill="${c}"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/></svg>`,
  eye:      (c,s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${s}" height="${s}" fill="${c}"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`,
  team:     (c,s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${s}" height="${s}" fill="${c}"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>`,
};

async function ico(name, color = "#1A1B26", size = 256) {
  const fn = ICONS[name];
  if (!fn) return null;
  const svg = fn(color, size);
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

// Yellow box + dark icon (matches BMP.tn website)
async function addIconBox(s, pres, iconName, x, y, w = 0.65, h = 0.65) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: C.YELLOW }, line: { color: C.YELLOW }, rectRadius: 0.1 });
  const img = await ico(iconName, "#1A1B26", 256);
  if (img) s.addImage({ data: img, x: x + 0.07, y: y + 0.07, w: w - 0.14, h: h - 0.14 });
}

function topBar(s, pres) {
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.045, fill: { color: C.YELLOW }, line: { color: C.YELLOW } });
}

function sectionLabel(s, label) {
  s.addText(label, { x: 0.5, y: 0.18, w: 5, h: 0.3, fontSize: 8.5, color: C.YELLOW, charSpacing: 3.5, bold: true, margin: 0 });
}

function slideTitle(s, title) {
  s.addText(title, { x: 0.5, y: 0.52, w: 9, h: 0.65, fontSize: 27, bold: true, color: C.WHITE, margin: 0 });
}

function slideTitleTwo(s, line1, line2) {
  s.addText(line1, { x: 0.5, y: 0.52, w: 9, h: 0.55, fontSize: 27, bold: true, color: C.WHITE, margin: 0 });
  s.addText(line2, { x: 0.5, y: 1.02, w: 9, h: 0.45, fontSize: 22, bold: true, color: C.YELLOW, margin: 0 });
}

function makeShadow() {
  return { type: "outer", blur: 8, offset: 2, color: "000000", opacity: 0.18 };
}

async function main() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";

  // ═══════════════════════════════════════════════════════
  // SLIDE 1 — WELCOME / COVER (Full-bleed dark, bold brand)
  // ═══════════════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: C.BLACK };

    // Full left panel
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 5.6, h: 5.625, fill: { color: C.CARD }, line: { color: C.CARD } });
    // Yellow top accent on left panel
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 5.6, h: 0.06, fill: { color: C.YELLOW }, line: { color: C.YELLOW } });

    // BMP.tn logo box
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.55, y: 0.55, w: 1.15, h: 1.15, fill: { color: C.YELLOW }, line: { color: C.YELLOW }, rectRadius: 0.16 });
    const h1 = await ico("helmet", "#1A1B26", 300);
    s.addImage({ data: h1, x: 0.7, y: 0.7, w: 0.85, h: 0.85 });

    s.addText([
      { text: "BMP", options: { bold: true, color: C.WHITE, fontSize: 38 } },
      { text: ".tn", options: { bold: true, color: C.YELLOW, fontSize: 38 } },
    ], { x: 1.85, y: 0.58, w: 3.4, h: 0.75, margin: 0 });
    s.addText("PLATEFORME", { x: 1.85, y: 1.28, w: 3.4, h: 0.3, fontSize: 9, color: C.GRAY, charSpacing: 4, margin: 0 });

    // Divider
    s.addShape(pres.shapes.LINE, { x: 0.55, y: 1.8, w: 4.7, h: 0, line: { color: "2A2B3A", width: 1 } });

    s.addText("Build Smarter.", { x: 0.55, y: 2.0, w: 4.8, h: 0.65, fontSize: 30, bold: true, color: C.WHITE, margin: 0 });
    s.addText("Connect Every Actor.", { x: 0.55, y: 2.62, w: 4.8, h: 0.6, fontSize: 26, bold: true, color: C.YELLOW, margin: 0 });

    s.addText("A digital marketplace & project management platform\ntransforming the construction sector in Tunisia.", {
      x: 0.55, y: 3.35, w: 4.8, h: 0.75, fontSize: 11.5, color: C.LIGHT, margin: 0,
    });

    // Stat pills
    const stats = [["30%","Productivity Lost"],["3","Key Actors"],["1","Unified Platform"]];
    for (let i = 0; i < 3; i++) {
      const x = 0.55 + i * 1.68;
      s.addShape(pres.shapes.RECTANGLE, { x, y: 4.3, w: 1.55, h: 0.85, fill: { color: C.CARD2 }, line: { color: "2E2F45", width: 0.5 }, rectRadius: 0.09 });
      s.addText(stats[i][0], { x, y: 4.35, w: 1.55, h: 0.38, fontSize: 20, bold: true, color: C.YELLOW, align: "center", margin: 0 });
      s.addText(stats[i][1], { x, y: 4.72, w: 1.55, h: 0.3, fontSize: 8, color: C.GRAY, align: "center", margin: 0 });
    }

    // Right side — geometric pattern background
    s.addShape(pres.shapes.RECTANGLE, { x: 5.6, y: 0, w: 4.4, h: 5.625, fill: { color: C.NAVY }, line: { color: C.NAVY } });

    // Grid decoration
    const cols = 6, rows = 7;
    for (let r = 0; r < rows; r++) {
      for (let c2 = 0; c2 < cols; c2++) {
        const opacity = (r + c2) % 3 === 0 ? 18 : ((r * c2) % 5 === 0 ? 10 : 5);
        s.addShape(pres.shapes.RECTANGLE, {
          x: 5.7 + c2 * 0.7, y: 0.05 + r * 0.78,
          w: 0.55, h: 0.65,
          fill: { color: C.YELLOW, transparency: 100 - opacity },
          line: { color: C.YELLOW, transparency: 80, width: 0.5 },
        });
      }
    }

    // Central badge
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 7.15, y: 1.8, w: 1.7, h: 1.7, fill: { color: "1A1B26" }, line: { color: C.YELLOW, width: 2 }, rectRadius: 0.2, shadow: makeShadow() });
    const h2 = await ico("helmet", C.YELLOW, 300);
    s.addImage({ data: h2, x: 7.35, y: 2.0, w: 1.3, h: 1.3 });

    // Week label
    s.addText("FINAL PITCH · WEEK 13", { x: 5.7, y: 4.55, w: 4.0, h: 0.3, fontSize: 8, color: C.GRAY, align: "center", charSpacing: 2.5, margin: 0 });
    s.addText("CCCA4 · PI-CDIO", { x: 5.7, y: 4.88, w: 4.0, h: 0.3, fontSize: 8, color: C.YELLOW, align: "center", charSpacing: 2, margin: 0 });

    // Bottom yellow bottom bar
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.575, w: 10, h: 0.05, fill: { color: C.YELLOW }, line: { color: C.YELLOW } });
  }

  // ═══════════════════════════════════════════════════════
  // SLIDE 2 — TEAM / GROUP
  // ═══════════════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: C.BLACK };
    topBar(s, pres);

    sectionLabel(s, "MEET THE TEAM");
    slideTitle(s, "The People Behind BMP.tn");

    const members = [
      { name: "Aaa Tahri",          role: "Project Lead" },
      { name: "Adjz Msekni",        role: "Full-Stack Dev" },
      { name: "Wala Rezgui",        role: "UI/UX Designer" },
      { name: "Ibtihal Mechergui",  role: "Backend Dev" },
      { name: "Syrine Jedidi",      role: "AI Engineer" },
      { name: "Nourane Lammouchi",  role: "Business Analyst" },
    ];

    for (let i = 0; i < 6; i++) {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = 0.55 + col * 3.1;
      const y = 1.45 + row * 1.85;

      s.addShape(pres.shapes.RECTANGLE, {
        x, y, w: 2.9, h: 1.65,
        fill: { color: C.CARD }, line: { color: "252637", width: 0.5 }, rectRadius: 0.12,
        shadow: makeShadow(),
      });
      // Yellow left accent
      s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.065, h: 1.65, fill: { color: C.YELLOW }, line: { color: C.YELLOW }, rectRadius: 0 });

      // Avatar circle
      s.addShape(pres.shapes.OVAL, { x: x + 0.2, y: y + 0.35, w: 0.85, h: 0.85, fill: { color: C.YELLOW }, line: { color: C.YELLOW } });
      s.addText(members[i].name.split(" ").map(w => w[0]).join(""), {
        x: x + 0.2, y: y + 0.35, w: 0.85, h: 0.85,
        fontSize: 18, bold: true, color: C.BLACK, align: "center", margin: 0,
      });

      s.addText(members[i].name, { x: x + 1.18, y: y + 0.38, w: 1.6, h: 0.4, fontSize: 13, bold: true, color: C.WHITE, margin: 0 });
      s.addShape(pres.shapes.RECTANGLE, { x: x + 1.18, y: y + 0.82, w: 1.2, h: 0.28, fill: { color: "25263A" }, line: { color: C.YELLOW, width: 0.5 }, rectRadius: 0.05 });
      s.addText(members[i].role, { x: x + 1.18, y: y + 0.82, w: 1.2, h: 0.28, fontSize: 8, color: C.YELLOW, align: "center", margin: 0 });
    }

    // Bottom: course info
    s.addShape(pres.shapes.RECTANGLE, { x: 0.55, y: 5.08, w: 8.9, h: 0.35, fill: { color: C.CARD2 }, line: { color: "252637", width: 0.5 }, rectRadius: 0.06 });
    s.addText("CCCA4  ·  PI–CDIO  ·  Final Pitch  ·  Week 13  ·  20-Minute Presentation", {
      x: 0.55, y: 5.08, w: 8.9, h: 0.35, fontSize: 9, color: C.GRAY, align: "center", margin: 0,
    });
  }

  // ═══════════════════════════════════════════════════════
  // SLIDE 3 — AGENDA
  // ═══════════════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: C.BLACK };
    topBar(s, pres);

    sectionLabel(s, "AGENDA");
    slideTitle(s, "What We'll Cover Today");

    const steps = [
      { n: "01", label: "Introduction",         sub: "Capturing attention — the problem that matters" },
      { n: "02", label: "The Problem",           sub: "Why construction in Tunisia is broken" },
      { n: "03", label: "Our Solution",          sub: "BMP.tn — one platform for every actor" },
      { n: "04", label: "Impact & Value",        sub: "Real outcomes, real transformation" },
      { n: "05", label: "Key Features",          sub: "Feature–benefit mapping" },
      { n: "06", label: "Business Model",        sub: "How BMP.tn grows and earns" },
      { n: "07", label: "Conclusion",            sub: "A call to action" },
    ];

    for (let i = 0; i < 7; i++) {
      const col = i < 4 ? 0 : 1;
      const row = i < 4 ? i : i - 4;
      const x = 0.55 + col * 4.75;
      const y = 1.38 + row * 1.02;

      s.addShape(pres.shapes.RECTANGLE, {
        x, y, w: 4.45, h: 0.87,
        fill: { color: C.CARD }, line: { color: "252637", width: 0.5 }, rectRadius: 0.1,
      });
      s.addText(steps[i].n, { x: x + 0.12, y: y + 0.05, w: 0.55, h: 0.77, fontSize: 22, bold: true, color: C.YELLOW, align: "center", margin: 0 });
      s.addShape(pres.shapes.LINE, { x: x + 0.72, y: y + 0.15, w: 0, h: 0.57, line: { color: "2A2B3A", width: 1 } });
      s.addText(steps[i].label, { x: x + 0.85, y: y + 0.1, w: 3.4, h: 0.32, fontSize: 12.5, bold: true, color: C.WHITE, margin: 0 });
      s.addText(steps[i].sub, { x: x + 0.85, y: y + 0.42, w: 3.4, h: 0.3, fontSize: 9, color: C.GRAY, margin: 0 });
    }
    // fill bottom-right gap
    s.addShape(pres.shapes.RECTANGLE, { x: 5.3, y: 1.38 + 3 * 1.02, w: 4.45, h: 0.87, fill: { color: "0D0E14" }, line: { color: "0D0E14" } });
    // Accent: duration badge
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 5.55, y: 1.38 + 3 * 1.02 + 0.1, w: 3.95, h: 0.67, fill: { color: C.YELLOW }, line: { color: C.YELLOW }, rectRadius: 0.1 });
    s.addText("⏱  20-Minute Pitch + Q&A Session", {
      x: 5.55, y: 1.38 + 3 * 1.02 + 0.1, w: 3.95, h: 0.67, fontSize: 12, bold: true, color: C.BLACK, align: "center", margin: 0,
    });
  }

  // ═══════════════════════════════════════════════════════
  // SLIDE 4 — INTRODUCTION (Hook)
  // ═══════════════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: C.BLACK };
    topBar(s, pres);

    sectionLabel(s, "01  ·  INTRODUCTION");

    // Large rhetorical question
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0.75, w: 10, h: 2.4, fill: { color: C.CARD }, line: { color: C.CARD } });
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0.75, w: 0.08, h: 2.4, fill: { color: C.YELLOW }, line: { color: C.YELLOW } });

    const qi = await ico("quote", C.YELLOW, 200);
    s.addImage({ data: qi, x: 0.3, y: 0.95, w: 0.6, h: 0.6 });

    s.addText("In 2024, why is one of Tunisia's biggest industries\nstill running on WhatsApp and paper catalogs?", {
      x: 0.55, y: 1.0, w: 9.1, h: 1.5,
      fontSize: 24, bold: true, color: C.WHITE, margin: 0,
    });
    s.addText("— The question no one was asking. Until now.", {
      x: 0.55, y: 2.55, w: 9.1, h: 0.4,
      fontSize: 12, italic: true, color: C.YELLOW, margin: 0,
    });

    // 3 teaser stat blocks
    const teasers = [
      { icon: "building", stat: "$4B+",  label: "Tunisia construction market" },
      { icon: "chart",    stat: "<5%",   label: "Currently digitized" },
      { icon: "speed",    stat: "30%",   label: "Productivity lost yearly" },
    ];
    for (let i = 0; i < 3; i++) {
      const x = 0.55 + i * 3.1;
      s.addShape(pres.shapes.RECTANGLE, {
        x, y: 3.45, w: 2.9, h: 1.7,
        fill: { color: C.CARD }, line: { color: "252637", width: 0.5 }, rectRadius: 0.12, shadow: makeShadow(),
      });
      await addIconBox(s, pres, teasers[i].icon, x + 0.2, 3.6, 0.65, 0.65);
      s.addText(teasers[i].stat, { x: x + 1.0, y: 3.6, w: 1.75, h: 0.65, fontSize: 28, bold: true, color: C.YELLOW, margin: 0 });
      s.addText(teasers[i].label, { x: x + 0.2, y: 4.35, w: 2.5, h: 0.55, fontSize: 10, color: C.LIGHT, margin: 0 });
    }
  }

  // ═══════════════════════════════════════════════════════
  // SLIDE 5 — THE PROBLEM
  // ═══════════════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: C.BLACK };
    topBar(s, pres);

    sectionLabel(s, "02  ·  THE PROBLEM");
    slideTitleTwo(s, "Construction in Tunisia Is Broken —", "And Everyone Has Accepted It.");

    // 4 problem cards
    const probs = [
      { icon: "people",   label: "No Trusted Professionals", desc: "Finding verified experts and artisans is near impossible — word of mouth is the only system." },
      { icon: "building", label: "Zero Project Structure",   desc: "Projects are coordinated through WhatsApp messages, phone calls, and physical paper logs." },
      { icon: "globe",    label: "Fragmented Communication", desc: "3 phones. 2 WhatsApp groups. 0 clarity. Information is lost, delayed, and duplicated." },
      { icon: "dollar",   label: "Hidden Costs Everywhere",  desc: "No group purchasing, no price transparency, no budget oversight — money disappears." },
    ];

    for (let i = 0; i < 4; i++) {
      const x = 0.45 + i * 2.3;
      s.addShape(pres.shapes.RECTANGLE, {
        x, y: 1.65, w: 2.1, h: 2.85,
        fill: { color: C.CARD }, line: { color: "252637", width: 0.5 }, rectRadius: 0.12, shadow: makeShadow(),
      });
      s.addShape(pres.shapes.RECTANGLE, { x, y: 1.65, w: 2.1, h: 0.055, fill: { color: C.RED }, line: { color: C.RED } });
      await addIconBox(s, pres, probs[i].icon, x + 0.22, 1.82, 0.62, 0.62);
      s.addText(probs[i].label, { x: x + 0.15, y: 2.56, w: 1.82, h: 0.55, fontSize: 11, bold: true, color: C.WHITE, margin: 0 });
      s.addText(probs[i].desc,  { x: x + 0.15, y: 3.13, w: 1.82, h: 1.2,  fontSize: 9,  color: C.GRAY,  margin: 0 });
    }

    // Bottom result
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.45, y: 4.65, w: 9.1, h: 0.75,
      fill: { color: "1E0A0A" }, line: { color: C.RED, width: 1 }, rectRadius: 0.1,
    });
    const cx = await ico("cross", C.RED, 200);
    s.addImage({ data: cx, x: 0.65, y: 4.76, w: 0.42, h: 0.42 });
    s.addText("The result: 30% productivity lost every year — delays, cost overruns, missed deadlines, and no accountability.", {
      x: 1.2, y: 4.7, w: 8.2, h: 0.65, fontSize: 11.5, bold: true, color: C.OFFWHITE, valign: "middle", margin: 0,
    });
  }

  // ═══════════════════════════════════════════════════════
  // SLIDE 6 — THE SOLUTION
  // ═══════════════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: C.BLACK };
    topBar(s, pres);

    sectionLabel(s, "03  ·  THE SOLUTION");
    slideTitleTwo(s, "Introducing BMP.tn —", "One Platform. Every Actor. Zero Compromise.");

    // Left: hub description
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.45, y: 1.55, w: 3.5, h: 3.75,
      fill: { color: C.CARD }, line: { color: "252637", width: 0.5 }, rectRadius: 0.12, shadow: makeShadow(),
    });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.45, y: 1.55, w: 3.5, h: 0.055, fill: { color: C.YELLOW }, line: { color: C.YELLOW } });

    // Hub logo
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 1.4, y: 1.75, w: 1.6, h: 1.35, fill: { color: C.YELLOW }, line: { color: C.YELLOW }, rectRadius: 0.15 });
    s.addText([
      { text: "BMP", options: { bold: true, color: C.BLACK, fontSize: 22 } },
      { text: ".tn", options: { bold: true, color: "1A1B26", fontSize: 22 } },
    ], { x: 1.4, y: 1.85, w: 1.6, h: 0.5, align: "center", margin: 0 });
    s.addText("HUB", { x: 1.4, y: 2.38, w: 1.6, h: 0.3, fontSize: 8, bold: true, color: "3A3A3A", charSpacing: 5, align: "center", margin: 0 });

    s.addText("Built exclusively for construction —\nnot adapted from generic tools.", {
      x: 0.65, y: 3.25, w: 3.1, h: 0.65, fontSize: 10.5, italic: true, color: C.LIGHT, margin: 0,
    });

    const diffPts = ["AI-powered expert matching", "Real-time site tracking", "Integrated marketplace", "Group purchasing power"];
    for (let i = 0; i < 4; i++) {
      const ck = await ico("check", C.GREEN, 200);
      s.addImage({ data: ck, x: 0.6, y: 4.0 + i * 0.31, w: 0.28, h: 0.28 });
      s.addText(diffPts[i], { x: 0.95, y: 3.98 + i * 0.31, w: 2.85, h: 0.3, fontSize: 10, color: C.LIGHT, margin: 0 });
    }

    // Right: 4 actor cards 2x2
    const actors = [
      { icon: "people",  label: "Client",       items: ["AI expert matching","Budget tracking","Real-time progress"] },
      { icon: "helmet",  label: "Artisan",       items: ["Site tracking","Real-time quotes","Progress reports"] },
      { icon: "star",    label: "Expert",        items: ["Product docs","Tech expertise","Project oversight"] },
      { icon: "building",label: "Manufacturer",  items: ["Digital sales","Grouped orders","Marketplace"] },
    ];
    const positions = [[4.15,1.55],[6.7,1.55],[4.15,3.35],[6.7,3.35]];
    for (let i = 0; i < 4; i++) {
      const [ax, ay] = positions[i];
      s.addShape(pres.shapes.RECTANGLE, {
        x: ax, y: ay, w: 2.35, h: 1.62,
        fill: { color: C.CARD }, line: { color: "252637", width: 0.5 }, rectRadius: 0.1, shadow: makeShadow(),
      });
      s.addShape(pres.shapes.RECTANGLE, { x: ax, y: ay, w: 2.35, h: 0.055, fill: { color: C.YELLOW }, line: { color: C.YELLOW } });
      await addIconBox(s, pres, actors[i].icon, ax + 0.15, ay + 0.15, 0.52, 0.52);
      s.addText(actors[i].label, { x: ax + 0.8, y: ay + 0.18, w: 1.45, h: 0.38, fontSize: 13, bold: true, color: C.WHITE, margin: 0 });
      for (let j = 0; j < 3; j++) {
        s.addText("›  " + actors[i].items[j], { x: ax + 0.15, y: ay + 0.75 + j * 0.27, w: 2.1, h: 0.25, fontSize: 8.5, color: C.LIGHT, margin: 0 });
      }
    }

    // Bottom tagline
    s.addShape(pres.shapes.RECTANGLE, { x: 0.45, y: 5.1, w: 9.1, h: 0.35, fill: { color: "14150D" }, line: { color: C.YELLOW, width: 0.5 }, rectRadius: 0.06 });
    s.addText("The first and only platform built end-to-end for Tunisian construction professionals.", {
      x: 0.45, y: 5.1, w: 9.1, h: 0.35, fontSize: 10, italic: true, color: C.YELLOW, align: "center", margin: 0,
    });
  }

  // ═══════════════════════════════════════════════════════
  // SLIDE 7 — IMPACT (Before → After)
  // ═══════════════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: C.BLACK };
    topBar(s, pres);

    sectionLabel(s, "04  ·  IMPACT");
    slideTitle(s, "Before BMP.tn vs. After BMP.tn");

    const bef = [
      "3 phones. 2 WhatsApp groups.",
      "Paper catalogs from 2019.",
      "Called 7 suppliers — got 1 quote.",
      "1 hour searching = still no answer.",
      "No visibility on project progress.",
      "Budget tracked in a notebook.",
    ];
    const aft = [
      "One app. Site tracked instantly.",
      "Live product catalog & tech docs.",
      "AI assigns the right expert in seconds.",
      "Quote received within minutes.",
      "Real-time photo progress reports.",
      "Budget dashboard with smart alerts.",
    ];

    // Before col
    s.addShape(pres.shapes.RECTANGLE, { x: 0.45, y: 1.3, w: 4.1, h: 0.48, fill: { color: "2A0D0D" }, line: { color: C.RED, width: 1 }, rectRadius: 0.08 });
    s.addText("BEFORE BMP.tn", { x: 0.45, y: 1.3, w: 4.1, h: 0.48, fontSize: 12, bold: true, color: C.RED, align: "center", margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.45, y: 1.83, w: 4.1, h: 3.2, fill: { color: C.CARD }, line: { color: "252637", width: 0.5 }, rectRadius: 0.1 });
    for (let i = 0; i < 6; i++) {
      const cx = await ico("cross", C.RED, 200);
      s.addImage({ data: cx, x: 0.62, y: 1.95 + i * 0.49, w: 0.3, h: 0.3 });
      s.addText(bef[i], { x: 1.0, y: 1.93 + i * 0.49, w: 3.4, h: 0.38, fontSize: 10.5, color: C.LIGHT, margin: 0 });
    }

    // Arrow
    s.addShape(pres.shapes.OVAL, { x: 4.68, y: 2.5, w: 0.65, h: 0.65, fill: { color: C.YELLOW }, line: { color: C.YELLOW } });
    s.addText("→", { x: 4.68, y: 2.5, w: 0.65, h: 0.65, fontSize: 18, bold: true, color: C.BLACK, align: "center", margin: 0 });

    // After col
    s.addShape(pres.shapes.RECTANGLE, { x: 5.45, y: 1.3, w: 4.1, h: 0.48, fill: { color: "0A2015" }, line: { color: C.GREEN, width: 1 }, rectRadius: 0.08 });
    s.addText("AFTER BMP.tn", { x: 5.45, y: 1.3, w: 4.1, h: 0.48, fontSize: 12, bold: true, color: C.GREEN, align: "center", margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 5.45, y: 1.83, w: 4.1, h: 3.2, fill: { color: C.CARD }, line: { color: "252637", width: 0.5 }, rectRadius: 0.1 });
    for (let i = 0; i < 6; i++) {
      const ck = await ico("check", C.GREEN, 200);
      s.addImage({ data: ck, x: 5.62, y: 1.95 + i * 0.49, w: 0.3, h: 0.3 });
      s.addText(aft[i], { x: 6.0, y: 1.93 + i * 0.49, w: 3.4, h: 0.38, fontSize: 10.5, color: C.LIGHT, margin: 0 });
    }

    // KPI bar
    const kpis = ["5h saved per artisan / week", "30% cost reduction", "100% project visibility"];
    for (let i = 0; i < 3; i++) {
      s.addShape(pres.shapes.RECTANGLE, { x: 0.45 + i * 3.08, y: 5.12, w: 2.9, h: 0.38, fill: { color: C.YELLOW }, line: { color: C.YELLOW }, rectRadius: 0.06 });
      s.addText(kpis[i], { x: 0.45 + i * 3.08, y: 5.12, w: 2.9, h: 0.38, fontSize: 10, bold: true, color: C.BLACK, align: "center", margin: 0 });
    }
  }

  // ═══════════════════════════════════════════════════════
  // SLIDE 8 — KEY FEATURES & BENEFITS
  // ═══════════════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: C.BLACK };
    topBar(s, pres);

    sectionLabel(s, "05  ·  KEY FEATURES & BENEFITS");
    slideTitle(s, "Every Feature Delivers a Real Benefit");

    const feats = [
      { icon: "robot",    feat: "AI Expert Matching",    ben: "Right professional, first time — no more calling 7 people to get 1 answer." },
      { icon: "eye",      feat: "Real-Time Tracking",    ben: "Full site visibility from your phone — no more surprise delays." },
      { icon: "dollar",   feat: "Quotation Engine",      ben: "Professional devis in minutes — not days." },
      { icon: "globe",    feat: "Marketplace",           ben: "All materials in one place — no more paper catalogs." },
      { icon: "people",   feat: "Group Buying",          ben: "Lower costs through collective purchasing — up to 20% savings." },
      { icon: "shield",   feat: "Budget Control",        ben: "Alerts before overruns happen — never be caught off guard again." },
      { icon: "star",     feat: "Reviews & Ratings",     ben: "Trust built on verified feedback — quality becomes accountable." },
      { icon: "lock",     feat: "Secure Role Access",    ben: "Each actor sees exactly what they need — nothing more, nothing less." },
    ];

    for (let i = 0; i < 8; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 0.45 + col * 4.78;
      const y = 1.38 + row * 1.03;

      s.addShape(pres.shapes.RECTANGLE, {
        x, y, w: 4.55, h: 0.88,
        fill: { color: C.CARD }, line: { color: "252637", width: 0.5 }, rectRadius: 0.1, shadow: makeShadow(),
      });
      await addIconBox(s, pres, feats[i].icon, x + 0.15, y + 0.12, 0.62, 0.62);
      s.addText(feats[i].feat, { x: x + 0.9, y: y + 0.1, w: 3.5, h: 0.33, fontSize: 12, bold: true, color: C.WHITE, margin: 0 });
      s.addText(feats[i].ben,  { x: x + 0.9, y: y + 0.43, w: 3.5, h: 0.38, fontSize: 9, color: C.GRAY, margin: 0 });
    }
  }

  // ═══════════════════════════════════════════════════════
  // SLIDE 9 — BUSINESS MODEL
  // ═══════════════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: C.BLACK };
    topBar(s, pres);

    sectionLabel(s, "06  ·  BUSINESS MODEL");
    slideTitle(s, "How BMP.tn Creates & Captures Value");

    // Left: 4 revenue streams
    const streams = [
      { icon: "dollar",   label: "Subscription Plans",  desc: "Monthly/annual tiers for experts & manufacturers" },
      { icon: "handshake",label: "Transaction Fees",    desc: "Small commission on marketplace & quotes" },
      { icon: "people",   label: "Group Buying Margin", desc: "Revenue share from bulk procurement savings" },
      { icon: "chart",    label: "Analytics & Insights",desc: "Premium dashboards for industry players" },
    ];

    for (let i = 0; i < 4; i++) {
      const y = 1.38 + i * 1.0;
      s.addShape(pres.shapes.RECTANGLE, {
        x: 0.45, y, w: 5.6, h: 0.86,
        fill: { color: C.CARD }, line: { color: "252637", width: 0.5 }, rectRadius: 0.1, shadow: makeShadow(),
      });
      await addIconBox(s, pres, streams[i].icon, 0.6, y + 0.12, 0.6, 0.6);
      s.addText(streams[i].label, { x: 1.33, y: y + 0.1, w: 4.5, h: 0.33, fontSize: 13, bold: true, color: C.WHITE, margin: 0 });
      s.addText(streams[i].desc,  { x: 1.33, y: y + 0.45, w: 4.5, h: 0.3, fontSize: 9.5, color: C.GRAY, margin: 0 });
    }

    // Right: market stats
    s.addShape(pres.shapes.RECTANGLE, {
      x: 6.25, y: 1.38, w: 3.3, h: 4.02,
      fill: { color: C.CARD }, line: { color: "252637", width: 0.5 }, rectRadius: 0.12, shadow: makeShadow(),
    });
    s.addShape(pres.shapes.RECTANGLE, { x: 6.25, y: 1.38, w: 3.3, h: 0.055, fill: { color: C.YELLOW }, line: { color: C.YELLOW } });
    s.addText("MARKET OPPORTUNITY", { x: 6.25, y: 1.45, w: 3.3, h: 0.35, fontSize: 8.5, bold: true, color: C.YELLOW, align: "center", charSpacing: 2, margin: 0 });

    const mkt = [["~35k","Construction firms"],["200k+","Artisans & workers"],["$4B+","Market value"],["<5%","Currently digitized"]];
    for (let i = 0; i < 4; i++) {
      const my = 1.92 + i * 0.86;
      s.addShape(pres.shapes.RECTANGLE, { x: 6.42, y: my, w: 2.96, h: 0.72, fill: { color: C.CARD2 }, line: { color: "2E2F45", width: 0.5 }, rectRadius: 0.08 });
      s.addText(mkt[i][0], { x: 6.42, y: my + 0.04, w: 2.96, h: 0.4, fontSize: 22, bold: true, color: C.YELLOW, align: "center", margin: 0 });
      s.addText(mkt[i][1], { x: 6.42, y: my + 0.44, w: 2.96, h: 0.24, fontSize: 8.5, color: C.GRAY, align: "center", margin: 0 });
    }

    // SDG badges
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.45, y: 5.08, w: 2.7, h: 0.35, fill: { color: "0A2015" }, line: { color: C.GREEN, width: 0.5 }, rectRadius: 0.06 });
    s.addText("🌍  SDG 9 – Innovation & Infrastructure", { x: 0.45, y: 5.08, w: 2.7, h: 0.35, fontSize: 8.5, color: C.GREEN, align: "center", margin: 0 });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 3.3, y: 5.08, w: 2.7, h: 0.35, fill: { color: "0A2015" }, line: { color: C.GREEN, width: 0.5 }, rectRadius: 0.06 });
    s.addText("💚  SDG 8 – Decent Work & Economic Growth", { x: 3.3, y: 5.08, w: 2.7, h: 0.35, fontSize: 8.5, color: C.GREEN, align: "center", margin: 0 });
  }

  // ═══════════════════════════════════════════════════════
  // SLIDE 10 — CONCLUSION / CALL TO ACTION
  // ═══════════════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: C.BLACK };

    // Full yellow top half
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 2.6, fill: { color: C.YELLOW }, line: { color: C.YELLOW } });

    s.addText("07  ·  CONCLUSION", { x: 0.6, y: 0.25, w: 5, h: 0.32, fontSize: 9, color: "3A3000", charSpacing: 3, bold: true, margin: 0 });
    s.addText("The Future of Construction\nBegins Here.", { x: 0.6, y: 0.6, w: 9, h: 1.4, fontSize: 32, bold: true, color: C.BLACK, margin: 0 });
    s.addText("A platform today. An industry standard tomorrow.", { x: 0.6, y: 2.1, w: 9, h: 0.38, fontSize: 13, color: "3A3000", italic: true, margin: 0 });

    // Body dark section
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 2.6, w: 10, h: 3.025, fill: { color: C.CARD }, line: { color: C.CARD } });

    s.addText("Those who wait will still be on WhatsApp — while their competitors work from a dashboard.", {
      x: 0.6, y: 2.75, w: 8.8, h: 0.65, fontSize: 14, color: C.LIGHT, italic: true, margin: 0,
    });

    // 3 CTA cards
    const ctas = [
      { icon: "globe",   label: "www.bmp.tn",     sub: "Explore the platform" },
      { icon: "mail",    label: "contact@bmp.tn",  sub: "Get in touch with us" },
      { icon: "rocket",  label: "MVP · 2024",      sub: "CCCA4 · Week 13" },
    ];
    for (let i = 0; i < 3; i++) {
      const x = 0.5 + i * 3.12;
      s.addShape(pres.shapes.RECTANGLE, {
        x, y: 3.55, w: 2.95, h: 1.25,
        fill: { color: C.CARD2 }, line: { color: "252637", width: 0.5 }, rectRadius: 0.12, shadow: makeShadow(),
      });
      await addIconBox(s, pres, ctas[i].icon, x + 0.18, 3.7, 0.6, 0.6);
      s.addText(ctas[i].label, { x: x + 0.9, y: 3.72, w: 1.9, h: 0.38, fontSize: 13, bold: true, color: C.YELLOW, margin: 0 });
      s.addText(ctas[i].sub,   { x: x + 0.9, y: 4.1,  w: 1.9, h: 0.3, fontSize: 9,  color: C.GRAY, margin: 0 });
    }

    // Team at bottom
    s.addText("Aaa Tahri  ·  Adjz Msekni  ·  Wala Rezgui  ·  Ibtihal Mechergui  ·  Syrine Jedidi  ·  Nourane Lammouchi", {
      x: 0.5, y: 4.98, w: 9, h: 0.35, fontSize: 8.5, color: C.GRAY, align: "center", margin: 0,
    });

    // Bottom bar
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.575, w: 10, h: 0.05, fill: { color: C.YELLOW }, line: { color: C.YELLOW } });
  }

  // ═══════════════════════════════════════════════════════
  // SLIDE 11 — THANK YOU
  // ═══════════════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: C.BLACK };

    // Full left dark panel
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 5.5, h: 5.625, fill: { color: C.CARD }, line: { color: C.CARD } });
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 5.5, h: 0.055, fill: { color: C.YELLOW }, line: { color: C.YELLOW } });

    // Logo
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.55, y: 0.55, w: 1.0, h: 1.0, fill: { color: C.YELLOW }, line: { color: C.YELLOW }, rectRadius: 0.14 });
    const ht = await ico("helmet", "#1A1B26", 256);
    s.addImage({ data: ht, x: 0.68, y: 0.68, w: 0.74, h: 0.74 });

    s.addText([
      { text: "BMP", options: { bold: true, color: C.WHITE, fontSize: 22 } },
      { text: ".tn", options: { bold: true, color: C.YELLOW, fontSize: 22 } },
    ], { x: 1.7, y: 0.6, w: 3, h: 0.5, margin: 0 });

    s.addShape(pres.shapes.LINE, { x: 0.55, y: 1.75, w: 4.5, h: 0, line: { color: "2A2B3A", width: 1 } });

    s.addText("Thank You", { x: 0.55, y: 1.95, w: 4.7, h: 0.75, fontSize: 40, bold: true, color: C.WHITE, margin: 0 });
    s.addText("for your attention.", { x: 0.55, y: 2.65, w: 4.7, h: 0.55, fontSize: 24, bold: true, color: C.YELLOW, margin: 0 });

    s.addText("We are now open for questions.\nWe look forward to your feedback.", {
      x: 0.55, y: 3.35, w: 4.7, h: 0.75, fontSize: 12, color: C.LIGHT, italic: true, margin: 0,
    });

    // Q&A badge
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.55, y: 4.35, w: 2.3, h: 0.72, fill: { color: C.YELLOW }, line: { color: C.YELLOW }, rectRadius: 0.1 });
    s.addText("Q&A Session", { x: 0.55, y: 4.35, w: 2.3, h: 0.72, fontSize: 14, bold: true, color: C.BLACK, align: "center", margin: 0 });

    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 3.0, y: 4.35, w: 2.0, h: 0.72, fill: { color: C.CARD2 }, line: { color: "252637", width: 0.5 }, rectRadius: 0.1 });
    s.addText("Week 13\nCCCA4", { x: 3.0, y: 4.35, w: 2.0, h: 0.72, fontSize: 10, color: C.GRAY, align: "center", margin: 0 });

    // Right side — pattern
    s.addShape(pres.shapes.RECTANGLE, { x: 5.5, y: 0, w: 4.5, h: 5.625, fill: { color: C.NAVY }, line: { color: C.NAVY } });

    // Big BMP.tn watermark
    for (let r = 0; r < 8; r++) {
      for (let c2 = 0; c2 < 6; c2++) {
        const op = (r + c2) % 4 === 0 ? 15 : ((r * c2) % 3 === 0 ? 8 : 4);
        s.addShape(pres.shapes.RECTANGLE, {
          x: 5.6 + c2 * 0.72, y: 0.05 + r * 0.69,
          w: 0.58, h: 0.58,
          fill: { color: C.YELLOW, transparency: 100 - op },
          line: { color: C.YELLOW, transparency: 82, width: 0.5 },
        });
      }
    }

    // Center badge
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 7.0, y: 1.8, w: 2.0, h: 2.0, fill: { color: "1A1B26" }, line: { color: C.YELLOW, width: 2.5 }, rectRadius: 0.25, shadow: makeShadow() });
    const hbig = await ico("helmet", C.YELLOW, 300);
    s.addImage({ data: hbig, x: 7.2, y: 2.0, w: 1.6, h: 1.6 });

    // Team names
    const names = ["Aaa Tahri","Adjz Msekni","Wala Rezgui","Ibtihal Mechergui","Syrine Jedidi","Nourane Lammouchi"];
    for (let i = 0; i < 6; i++) {
      s.addText("· " + names[i], { x: 5.62, y: 4.05 + i * 0.24, w: 4.0, h: 0.23, fontSize: 9, color: C.GRAY, margin: 0 });
    }

    // Bottom bar
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.575, w: 10, h: 0.05, fill: { color: C.YELLOW }, line: { color: C.YELLOW } });
  }

  await pres.writeFile({ fileName: "/home/claude/BMP_tn_FinalPitch.pptx" });
  console.log("✅ Final pitch deck written — 11 slides.");
}

main().catch(console.error);