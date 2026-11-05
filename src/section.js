/* חתך חי: בניין, קרקע ושמיים, ושכבת מנגנון לכל לקוח. כל תווית בשם, בקו דיו. */
const W = 640, H = 400, G = 260; // G = מפלס הקרקע

function base(c) {
  return `
  <rect x="0" y="0" width="${W}" height="${G}" fill="#FBFAF6"/>
  <rect x="0" y="${G}" width="${W}" height="${H - G}" fill="#EFE8DA"/>
  <line x1="0" y1="${G}" x2="${W}" y2="${G}" stroke="#141618" stroke-width="1.5"/>
  <g stroke="#141618" stroke-width="1.2" fill="#fff">
    <rect x="300" y="70" width="190" height="${G - 70}"/>
    ${[110, 150, 190, 230].map(y => `<line x1="300" y1="${y}" x2="490" y2="${y}"/>`).join("")}
  </g>
  <g font-family="IBM Plex Mono, monospace" font-size="11" fill="#6B7178">
    <text x="395" y="62" text-anchor="middle">בניין</text>
    <text x="12" y="${G + 18}">קרקע</text>
  </g>`;
}

const FLIP = { start: "end", end: "start", middle: "middle" };
const tag = (x, y, t, c, anchor = "start") =>
  `<text class="fadein" direction="rtl" style="animation-delay:1.6s" x="${x}" y="${y}" font-family="IBM Plex Mono, monospace" font-size="14" font-weight="500" fill="${c}" text-anchor="${FLIP[anchor]}">${t}</text>`;

const LAYERS = {
  river: c => `
    <g stroke="#141618" stroke-width="1.2" fill="none">
      <path d="M0 ${G + 40} L90 ${G + 40} L90 ${G + 20} L170 ${G + 20} L170 ${G} L300 ${G}"/>
    </g>
    <rect class="rise" x="0" y="${G - 10}" width="210" height="${50 + 10}" fill="${c}" fill-opacity=".35"/>
    <line x1="0" y1="${G - 10}" x2="300" y2="${G - 10}" stroke="${c}" stroke-dasharray="4 4"/>
    <rect x="300" y="${G - 40}" width="190" height="40" fill="none" stroke="${c}" stroke-width="2" stroke-dasharray="2 3"/>
    ${tag(8, G - 18, "מפלס שיטפון", c)}
    ${tag(395, G - 46, "לובי שמותר להציף", c, "middle")}
    ${tag(40, G + 70, "גדה מדורגת", c)}`,
  alga: c => `
    ${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${492 + i * 7}" y="74" width="5" height="${G - 78}" fill="${c}" fill-opacity="${.25 + i * .08}"/>`).join("")}
    ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<circle class="bubble" style="animation-delay:${i * .3}s" cx="${494 + (i % 6) * 7}" cy="${G - 10}" r="2" fill="${c}"/>`).join("")}
    <path class="draw" d="M600 20 L520 120" stroke="#C9A227" stroke-width="2" style="--len:130"/>
    ${tag(600, 40, "אור", "#B08A2E")}
    ${tag(560, G - 120, "חזית אצות", c, "middle")}
    ${tag(560, G + 30, "ביומסה וחום", c, "middle")}`,
  worm: c => `
    <path d="M120 ${G} L120 ${G - 70}" stroke="#3E7D4F" stroke-width="3"/>
    <circle cx="120" cy="${G - 92}" r="30" fill="#3E7D4F" fill-opacity=".35"/>
    ${["M120 260 C110 300 90 320 70 360", "M120 260 C130 310 150 330 170 370", "M120 260 C120 300 125 340 118 390"].map(d => `<path class="draw" d="${d}" stroke="#3E7D4F" fill="none" stroke-width="1.5" style="--len:160"/>`).join("")}
    ${["M20 300 C60 330 100 280 160 320 C200 345 240 300 280 330", "M200 360 C230 340 260 380 290 350"].map(d => `<path class="draw" d="${d}" stroke="${c}" fill="none" stroke-width="5" stroke-linecap="round" stroke-opacity=".7" style="--len:320"/>`).join("")}
    <rect x="300" y="${G}" width="190" height="${H - G}" fill="#141618" fill-opacity=".08"/>
    ${tag(395, G + 70, "בלי מרתף: קרקע רציפה", c, "middle")}
    ${tag(20, G + 120, "מנהרות", c)}
    ${tag(160, G - 120, "עץ", "#3E7D4F")}`,
  seed: c => `
    <path class="draw" d="M20 40 C140 10 240 90 300 120 C340 140 420 120 492 150" stroke="${c}" fill="none" stroke-dasharray="3 5" stroke-width="1.5" style="--len:520"/>
    ${[120, 160, 200].map((y, i) => `<g class="fadein" style="animation-delay:${1 + i * .4}s"><rect x="490" y="${y}" width="12" height="10" fill="#fff" stroke="#141618"/><path d="M496 ${y} q-6 -14 4 -22" stroke="#3E7D4F" fill="none" stroke-width="1.5"/></g>`).join("")}
    <g class="fadein" style="animation-delay:1.2s">${[310, 340, 370, 400, 430, 460].map(x => `<path d="M${x} 70 q-4 -12 2 -18" stroke="#3E7D4F" fill="none" stroke-width="1.5"/>`).join("")}</g>
    ${tag(40, 32, "רוח מביאה זרעים", c)}
    ${tag(520, 110, "כיס בחזית", c)}
    ${tag(395, 46, "גג בנק זרעים", c, "middle")}`,
  bee: c => {
    const hex = (x, y) => `<path d="M${x} ${y - 6} l5 3 v6 l-5 3 l-5 -3 v-6z" fill="${c}" fill-opacity=".35" stroke="${c}"/>`;
    return `
    <g class="fadein">${[0, 1, 2, 3].flatMap(r => [0, 1, 2].map(k => hex(504 + k * 11 + (r % 2) * 5, 140 + r * 10))).join("")}</g>
    ${[60, 130, 200].map(x => `<g><line x1="${x}" y1="${G}" x2="${x}" y2="${G - 26}" stroke="#3E7D4F"/><circle cx="${x}" cy="${G - 30}" r="6" fill="${c}"/></g>`).join("")}
    <path class="draw" d="M60 ${G - 30} C90 150 110 150 130 ${G - 30} C160 160 180 170 200 ${G - 30} C260 120 420 40 510 150" stroke="#141618" fill="none" stroke-dasharray="2 4" style="--len:700"/>
    <rect x="80" y="${G + 4}" width="100" height="22" fill="${c}" fill-opacity=".2"/>
    ${tag(540, 135, "לבני קינון", c)}
    ${tag(130, G + 44, "קרקע חולית לקינון", c, "middle")}
    ${tag(130, 140, "מסלול האבקה", "#141618", "middle")}`;
  },
  fungus: c => `
    <path d="M70 ${G} v-60" stroke="#3E7D4F" stroke-width="3"/><circle cx="70" cy="${G - 80}" r="24" fill="#3E7D4F" fill-opacity=".3"/>
    <path d="M220 ${G} v-50" stroke="#3E7D4F" stroke-width="3"/><circle cx="220" cy="${G - 70}" r="20" fill="#3E7D4F" fill-opacity=".3"/>
    ${["M70 270 C100 300 130 290 150 310 C170 330 200 300 220 270", "M70 270 C90 330 160 350 220 270", "M150 310 C150 340 130 360 110 380", "M150 310 C180 330 200 360 240 370", "M100 300 C80 320 60 330 40 350"].map(d => `<path class="draw" d="${d}" stroke="${c}" fill="none" stroke-width="1" style="--len:260"/>`).join("")}
    <g class="fadein" style="animation-delay:1.4s">${[0, 1, 2, 3].map(i => `<rect x="${310 + i * 44}" y="${G - 36}" width="40" height="34" fill="#F3EFE6" stroke="${c}"/>`).join("")}</g>
    ${tag(145, G + 110, "רשת תפטיר בין העצים", c, "middle")}
    ${tag(395, G - 46, "לבני תפטיר", c, "middle")}`,
  bird: c => `
    <g class="fadein">${Array.from({ length: 60 }, (_, i) => `<circle cx="${305 + (i % 10) * 18}" cy="${80 + Math.floor(i / 10) * 30}" r="1.6" fill="${c}"/>`).join("")}</g>
    <path class="draw" d="M20 120 C120 100 220 110 280 130 C300 136 290 60 340 30 C380 10 480 20 620 30" stroke="#141618" fill="none" stroke-width="1.5" style="--len:760"/>
    <path d="M14 116 l10 4 l-10 4" fill="none" stroke="#141618"/>
    <path class="draw" d="M490 ${G} L560 ${G - 4} L600 ${G}" stroke="#C9A227" stroke-width="6" stroke-opacity=".35" fill="none" style="--len:120"/>
    ${tag(20, 104, "נתיב נדידה", "#141618")}
    ${tag(395, 255, "זכוכית בדפוס נקודות", c, "middle")}
    ${tag(560, G - 14, "אור כלפי מטה", "#B08A2E", "middle")}`,
};

export function sectionSVG(client) {
  return `<svg class="section-svg" style="direction:ltr" viewBox="0 0 ${W} ${H}" role="img" aria-label="חתך: ${client.mechanism}">
    ${base(client.color)}${LAYERS[client.id](client.color)}
  </svg>`;
}

/* סימן קטן לכרטיס: אותו חתך במזעור */
export function miniSVG(client) {
  return `<svg style="direction:ltr" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${base(client.color)}${LAYERS[client.id](client.color).replace(/<text[\s\S]*?<\/text>/g, "")}</svg>`;
}
