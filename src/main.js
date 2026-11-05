import "./styles.css";
import { CLIENTS, ELEMENTS, GRADIENT, APPS, TIMELINE, SOURCE } from "./data.js";
import { sectionSVG, miniSVG } from "./section.js";

const app = document.getElementById("app");
const $ = (s, r = document) => r.querySelector(s);
const md = s => s.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
const byId = id => CLIENTS.find(c => c.id === id);
const level = g => GRADIENT.reduce((a, b) => Math.abs(b.v - g) < Math.abs(a.v - g) ? b : a);
const MOVES = CLIENTS.length * ELEMENTS.length;

function toast(t) { const el = $("#toast"); el.textContent = t; el.classList.add("on"); clearTimeout(toast.h); toast.h = setTimeout(() => el.classList.remove("on"), 1800); }
async function copy(text, msg = "הועתק") { try { await navigator.clipboard.writeText(text); toast(msg); } catch { toast("ההעתקה נחסמה בדפדפן"); } }

/* פרומפט לתמונה: משפט זיקוק, ואחריו פרומפט בעברית למידג'רני, לפי חמש שכבות: נושא, הקשר, חומר, אור, מצלמה */
export function buildPrompt(c, el, g) {
  const e = ELEMENTS.find(x => x.id === el) || ELEMENTS[0];
  const L = level(g);
  const distill = `${e.name} שעובד גם בשביל ה${c.name}: ${c.moves[e.id]}`;
  const prompt = [
    `${c.prompt.subject}, ${e.name} כמוקד`,
    `${c.ashdod.site} (${c.ashdod.nameEn}), ${L.name} בדרגה ${L.v} מתוך 1`,
    c.prompt.material,
    c.prompt.light,
    "עדשה 35 מ\"מ, גובה עין, קומפוזיציה מאוזנת, צבע טבעי",
    "Documentary realism, Professional architecture photography, 1:1",
  ].join(", ");
  const params = "--ar 1:1 --style raw --v 7 --no text, words, writing, frame divisions";
  return { distill, prompt: `${prompt} ${params}` };
}

function promptBox(c, el, g) {
  const p = buildPrompt(c, el, g);
  return `<div class="prompt">
    <div class="lbl">פרומפט לתמונה · Midjourney</div>
    <p class="distill">${p.distill}</p>
    <pre>${p.prompt}</pre>
    <div class="row">
      <button class="btn primary press" data-copy="${encodeURIComponent(p.distill + "\n\n" + p.prompt)}">העתקת הפרומפט</button>
      <a class="btn" href="https://www.midjourney.com/imagine" target="_blank" rel="noopener">פתיחת Midjourney</a>
    </div>
  </div>`;
}

function appBtn(key, q) {
  const a = APPS[key];
  return `<a class="btn" href="${a.url}" target="_blank" rel="noopener" title="${q || ""}">${a.name}</a>`;
}

/* ===== דף הבית ===== */
function home() {
  app.innerHTML = `
  <section class="lens">
    <div>
      <div class="kicker">ARC &amp; בינה · החזון</div>
      <h1><b>הלקוח השתנה.</b><br>האדריכלות מתכננת גם לנהר, לאצה, לתולעת ולזרע.</h1>
      <p class="sub">אלפיים שנה היה לאדריכלות <b>לקוח אחד: גוף האדם</b>. האפליקציה הופכת את הרעיון של הפרק <b>${SOURCE.chapter}</b> לכלי עבודה: <mark>ידע, הבנה, יישום וגילוי</mark>, לכל לקוח חדש.</p>
    </div>
  </section>

  <section class="hero">
    <div class="machine">
      <div class="hud"><div class="lvl" id="lvl"></div><p id="lvlline"></p></div>
      <span class="lbl hint">גרירה לסיבוב</span>
      <canvas id="gl" aria-label="גוש בניין שנפתח מ-0, מרחב מחוטא, עד 1, מרחב חי"></canvas>
      <div class="slider">
        <span class="lbl">0 · מחוטא</span>
        <input id="g" type="range" min="0" max="1" step="0.01" value="0.5" aria-label="הגרדיאנט בין מרחב מחוטא למרחב חי">
        <span class="lbl">1 · חי</span>
      </div>
      <div class="bars" id="bars"></div>
    </div>
    <div class="steps">
      <div class="lbl">המסלול: מכירים, מבינים, מיישמים, מגלים</div>
      ${[
        ["ידע", CLIENTS.length, "לקוחות חדשים", "לכל לקוח עובדה עם מקור ושנה, ותקדים שכבר נבנה.", "#/clients"],
        ["הבנה", CLIENTS.length, "מנגנונים בחתך חי", "החתך מראה מה הלקוח צריך, ומה הוא נותן לבניין.", "#/client/river"],
        ["יישום", MOVES, "מהלכי תכנון", "לכל לקוח מהלך בגג, בחזית, בקרקע וברחוב, ודוגמה מאשדוד.", "#/brief"],
        ["גילוי", MOVES * GRADIENT.length, "צירופים במעבדה", "לקוח, רכיב ודרגה: רעיון חדש, פרומפט לתמונה ותדריך A4.", "#/lab"],
      ].map(([h, n, u, p, href]) => `<a class="step" href="${href}"><span class="n">${n}</span><span><h3>${h}: ${u}</h3><p>${p}</p></span></a>`).join("")}
      <a class="step" href="#/network"><span class="n">${Object.keys(APPS).length}</span><span><h3>רשת: אפליקציות שותפות</h3><p>כל לקוח פותח שאלת מחקר בטבלה המחזורית, בנובל, בתזונה, ברפואה ובעולם הנעלם.</p></span></a>
    </div>
  </section>

  <section class="psi">
    <div class="card p"><div class="lbl">בעיה</div><h3>מידה אחת, לקוח אחד</h3><p>מוויטרוביוס ועד ה<b>מודולור</b>, כל מידה נגזרה מגוף האדם. השאר הוצא החוצה בשם ההיגיינה.</p></div>
    <div class="card s"><div class="lbl">פתרון</div><h3>גרדיאנט במקום גבול</h3><p>כל תכונה של האתר על רצף <b>0 עד 1</b>: פוריות, לחות, אור. מי שמכוון את הערכים, אוצר את הנוף.</p></div>
    <div class="card i"><div class="lbl">תובנה</div><h3><mark>האדם לא יוצא מהתמונה. הוא זז מהמרכז.</mark></h3><p>האדריכל עובר מיצירה לאוצרות: מתכנן מקום, ומשאיר בו מקום לאחרים.</p></div>
  </section>

  <div class="sechead"><h2>שבעה לקוחות, שבעה בריפים</h2><a class="btn" href="#/clients">כל הלקוחות</a></div>
  <div class="clientgrid">${CLIENTS.map(clientCard).join("")}</div>

  <div class="foot"><span>מקור הרעיון: הפרק ${SOURCE.chapter}, ${SOURCE.publisher}, כפי שזוקק בכתבות "הלקוח השתנה" ו"אדריכלות שמשאירה מקום לאחרים".</span><span>מקור השראה לשפה: איאן מקהרג (Ian McHarg), Design with Nature, 1969</span></div>`;

  const input = $("#g");
  const show = () => {
    const g = +input.value, L = level(g);
    $("#lvl").innerHTML = `<b>${g.toFixed(2)}</b>${L.name}`;
    $("#lvlline").textContent = L.line;
    const lerp = k => Math.round(GRADIENT[0][k] + (GRADIENT[4][k] - GRADIENT[0][k]) * g);
    $("#bars").innerHTML = [["נקבוביות", lerp("porosity"), "%", 75], ["לחות קרקע", lerp("moisture"), "%", 80], ["מינים באתר", lerp("species"), "", 40]]
      .map(([n, v, u, max]) => `<div class="bar"><div class="lbl">${n}</div><div class="num">${v}${u}</div><div class="track"><div class="fill" style="width:${v / max * 100}%"></div></div></div>`).join("");
    machine?.set(g);
  };
  let machine;
  import("./gradient3d.js").then(m => { machine = m.mountGradient($("#gl")); show(); cleanup = () => machine.destroy(); })
    .catch(() => { $("#gl").replaceWith(Object.assign(document.createElement("div"), { className: "gradscale" })); });
  input.addEventListener("input", show);
  show();
}

function clientCard(c, i) {
  return `<a class="ccard" href="#/client/${c.id}" style="--c:${c.color};animation-delay:${i * 60}ms">
    ${miniSVG(c)}
    <span class="nm">${c.name}</span><span class="en">${c.latin}</span>
    <span class="in">${c.insight}</span>
  </a>`;
}

/* ===== הלקוחות ===== */
function clients() {
  app.innerHTML = `
  <section class="lens"><div>
    <div class="kicker">הלקוחות · ${CLIENTS.length}</div>
    <h1>רשימת הלקוחות <b>התארכה</b>.</h1>
    <p class="sub">לכל לקוח: מה הוא <b>צריך</b>, מה הוא <b>נותן</b>, ואיזה מהלך תכנון עונה לשניהם.</p>
  </div></section>
  <div class="clientgrid">${CLIENTS.map(clientCard).join("")}</div>
  <div class="sechead"><h2>הצורך מול המתנה</h2></div>
  <div class="card" style="overflow-x:auto"><table class="tbl"><thead><tr><th>לקוח</th><th>צריך</th><th>נותן</th><th>תובנה</th></tr></thead>
  <tbody>${CLIENTS.map(c => `<tr><td><a href="#/client/${c.id}" style="color:${c.color};font-weight:600">${c.name}</a></td><td>${c.need}</td><td>${c.gives}</td><td>${c.insight}</td></tr>`).join("")}</tbody></table></div>`;
}

function client(id) {
  const c = byId(id) || CLIENTS[0];
  const i = CLIENTS.indexOf(c);
  const prev = CLIENTS[(i - 1 + CLIENTS.length) % CLIENTS.length], next = CLIENTS[(i + 1) % CLIENTS.length];
  app.innerHTML = `
  <section class="lens" style="--c:${c.color}"><div>
    <div class="kicker" style="color:${c.color}">לקוח ${String(i + 1).padStart(2, "0")} · ${c.name} · ${c.latin}</div>
    <h1><b>${c.insight}</b></h1>
    <p class="sub">${c.mechanism}</p>
  </div></section>
  <div class="clientpage" style="--c:${c.color}">
    <div class="col">
      <div class="card"><div class="lbl">ידע</div><p class="fact">${md(c.fact)}</p><div class="src">${c.source}</div></div>
      <div class="card"><dl class="kv"><dt>צריך</dt><dd>${c.need}</dd><dt>נותן</dt><dd>${c.gives}</dd><dt>תקדים</dt><dd>${md(c.precedent)}</dd></dl></div>
      <div class="ashdod"><div class="lbl">דוגמה מהעיר</div><h3>${c.ashdod.site}</h3><div class="lbl" style="text-transform:none">${c.ashdod.nameEn}</div><p style="margin-top:6px">${c.ashdod.line}</p></div>
    </div>
    <div class="col focus">
      <div class="lbl">הבנה: המנגנון בחתך</div>
      ${sectionSVG(c)}
      <div class="card"><div class="lbl">יישום: ארבעה מהלכי תכנון</div>
        <div class="moves">${ELEMENTS.map(e => `<div class="move"><span class="el">${e.name}</span><span>${c.moves[e.id]}</span></div>`).join("")}</div>
      </div>
    </div>
    <div class="col">
      <div class="card question"><div class="lbl">שאלת מחקר ברשת</div><p class="q">${c.question}</p><div class="row">${appBtn(c.app)}${appBtn(c.app2)}</div></div>
      ${promptBox(c, "facade", .75)}
      <div class="card"><div class="lbl">הייקו</div><p class="haiku">${c.haiku.join("<br>")}</p></div>
      <div class="row"><a class="btn primary" href="#/brief?c=${c.id}&e=ground&g=0.75">תדריך A4 ל${c.ashdod.site}</a><a class="btn" href="#/lab?c=${c.id}">למעבדה</a></div>
    </div>
  </div>
  <div class="pager"><a class="btn" href="#/client/${prev.id}">הקודם: ${prev.name}</a><a class="btn" href="#/client/${next.id}">הבא: ${next.name}</a></div>`;
}

/* ===== מעבדת גילויים ===== */
const TENSION = {
  roof: "האדם רוצה מערכות, שמש ונוף על הגג.",
  facade: "האדם רוצה אור, נוף ובידוד בחזית.",
  ground: "האדם רוצה חניה וזכויות בנייה במגרש.",
  street: "האדם רוצה תנועה מהירה ובטוחה ברחוב.",
};
function lab(params) {
  let s = { c: params.get("c") || "river", e: params.get("e") || "roof", g: +(params.get("g") ?? .5) };
  app.innerHTML = `
  <section class="lens"><div>
    <div class="kicker">מעבדת גילויים · ${MOVES * GRADIENT.length} צירופים</div>
    <h1>לקוח, רכיב ודרגה: <b>רעיון חדש</b>.</h1>
    <p class="sub">בוחרים שלושה, ומקבלים <b>גילוי</b>: את הקונפליקט, את המהלך, את התובנה, פרומפט לתמונה ותדריך מוכן.</p>
  </div></section>
  <div class="lab">
    <div class="pick card">
      <div><div class="lbl">לקוח</div><div class="chips" id="pc">${CLIENTS.map(c => `<button class="chip" data-c="${c.id}"><span class="dot" style="background:${c.color}"></span>${c.name}</button>`).join("")}</div></div>
      <div><div class="lbl">רכיב</div><div class="chips" id="pe">${ELEMENTS.map(e => `<button class="chip" data-e="${e.id}">${e.name}</button>`).join("")}</div></div>
      <div><div class="lbl">דרגה על הגרדיאנט</div><div class="chips" id="pg">${GRADIENT.map(L => `<button class="chip" data-g="${L.v}">${L.v} · ${L.name}</button>`).join("")}</div></div>
      <button class="btn primary" id="rand">גילוי אקראי</button>
    </div>
    <div id="out"></div>
  </div>`;
  const render = () => {
    const c = byId(s.c), e = ELEMENTS.find(x => x.id === s.e), L = level(s.g);
    history.replaceState(null, "", `#/lab?c=${s.c}&e=${s.e}&g=${s.g}`);
    app.querySelectorAll("[data-c]").forEach(b => b.setAttribute("aria-pressed", b.dataset.c === s.c));
    app.querySelectorAll("[data-e]").forEach(b => b.setAttribute("aria-pressed", b.dataset.e === s.e));
    app.querySelectorAll("[data-g]").forEach(b => b.setAttribute("aria-pressed", +b.dataset.g === L.v));
    const other = CLIENTS.filter(x => x.id !== c.id)[(CLIENTS.indexOf(c) + ELEMENTS.indexOf(e)) % (CLIENTS.length - 1)];
    $("#out").innerHTML = `<div class="discovery" style="--c:${c.color}">
      <div class="col">
        <div class="kicker" style="color:${c.color}">גילוי · ${c.name} × ${e.name} × ${L.v}</div>
        <h2>מה אם ה<b>${e.name}</b> היה עובד גם בשביל ה<b>${c.name}</b>?</h2>
        ${sectionSVG(c)}
        <div class="tri">
          <div class="p"><b>הקונפליקט</b>${TENSION[e.id]} ה${c.name} צריך ${c.need}.</div>
          <div class="s"><b>המהלך</b>${c.moves[e.id]}</div>
          <div class="i"><b>התובנה</b><mark>${c.insight}</mark></div>
        </div>
      </div>
      <div class="col">
        <div class="card"><div class="lbl">הדרגה</div><p><b>${L.name}.</b> ${L.line}</p><div class="gradscale" style="margin-top:8px"></div></div>
        <div class="card"><div class="lbl">צירוף נוסף</div><p>ה${e.name} הזה יכול לשרת גם את ה<b>${other.name}</b>: ${other.moves[e.id]}</p></div>
        ${promptBox(c, e.id, L.v)}
        <div class="card question"><div class="lbl">שאלת מחקר</div><p class="q">${c.question}</p><div class="row">${appBtn(c.app)}${appBtn(c.app2)}</div></div>
        <a class="btn primary" href="#/brief?c=${c.id}&e=${e.id}&g=${L.v}">תדריך A4 מהגילוי</a>
      </div>
    </div>`;
  };
  const h = ev => {
    const b = ev.target.closest("[data-c],[data-e],[data-g],#rand");
    if (!b) return;
    if (b.id === "rand") s = { c: CLIENTS[Math.floor(Math.random() * CLIENTS.length)].id, e: ELEMENTS[Math.floor(Math.random() * 4)].id, g: GRADIENT[1 + Math.floor(Math.random() * 4)].v };
    if (b.dataset.c) s.c = b.dataset.c;
    if (b.dataset.e) s.e = b.dataset.e;
    if (b.dataset.g) s.g = +b.dataset.g;
    render();
  };
  app.addEventListener("click", h);
  cleanup = () => app.removeEventListener("click", h);
  render();
}

/* ===== תדריך A4: המוצר הסופי ===== */
function brief(params) {
  const c = byId(params.get("c")) || CLIENTS[0];
  const e = ELEMENTS.find(x => x.id === params.get("e")) || ELEMENTS[2];
  const L = level(+(params.get("g") ?? .75));
  const p = buildPrompt(c, e.id, L.v);
  app.innerHTML = `
  <div class="briefbar">
    <div class="row">${CLIENTS.map(x => `<a class="chip" aria-pressed="${x.id === c.id}" href="#/brief?c=${x.id}&e=${e.id}&g=${L.v}">${x.name}</a>`).join("")}</div>
    <button class="btn primary" id="print">הדפסה ל-A4</button>
  </div>
  <article class="sheet" style="--c:${c.color}">
    <header><span>תדריך תכנון · ארק ובינה</span><span>${c.ashdod.nameEn}</span></header>
    <div class="kicker" style="color:${c.color};margin-top:16px">שני לקוחות: האדם וה${c.name}</div>
    <h1>${c.ashdod.site}</h1>
    <p class="sub">${c.ashdod.line}</p>
    <div class="two" style="margin-top:20px">
      <div>${sectionSVG(c)}</div>
      <div>
        <h2 style="margin-top:0">היעד על הגרדיאנט: ${L.v}, ${L.name}</h2>
        <p>${L.line}</p>
        <div class="gradscale" style="margin:10px 0"></div>
        <p class="fact" style="margin-top:12px">${md(c.fact)}</p><div class="src">${c.source}</div>
      </div>
    </div>
    <h2>מי מבקש מה</h2>
    <table class="tbl"><thead><tr><th>לקוח</th><th>צריך</th><th>נותן לאתר</th></tr></thead><tbody>
      <tr><td><b>האדם</b></td><td>${TENSION[e.id].replace("האדם רוצה ", "")}</td><td>שימוש, ערך כלכלי, חיים עירוניים</td></tr>
      <tr><td><b style="color:${c.color}">ה${c.name}</b></td><td>${c.need}</td><td>${c.gives}</td></tr>
    </tbody></table>
    <h2>ארבעה מהלכי תכנון</h2>
    <div class="moves">${ELEMENTS.map(x => `<div class="move"><span class="el" style="color:${c.color}">${x.name}</span><span>${x.id === e.id ? `<mark>${c.moves[x.id]}</mark>` : c.moves[x.id]}</span></div>`).join("")}</div>
    <div class="two">
      <div><h2>שאלת מחקר</h2><p>${c.question}</p><p class="src">להמשך: ${APPS[c.app].name}, ${APPS[c.app2].name}</p></div>
      <div><h2>הייקו</h2><p class="haiku">${c.haiku.join("<br>")}</p></div>
    </div>
    <h2>הדמיה: פרומפט לתמונה</h2>
    <p><b>${p.distill}</b></p>
    <p style="font-size:13px;color:var(--ink-2);margin-top:6px">${p.prompt}</p>
    <div class="row" style="margin-top:8px"><button class="btn press" data-copy="${encodeURIComponent(p.distill + "\n\n" + p.prompt)}">העתקת הפרומפט</button></div>
    <p class="src" style="margin-top:24px">מקור הרעיון: ${SOURCE.chapter}, ${SOURCE.publisher}. תדריך שנוצר באפליקציה, ${new Date().toLocaleDateString("he-IL")}.</p>
  </article>`;
  $("#print").addEventListener("click", () => print());
}

/* ===== מרעיון לחוק ===== */
function timeline() {
  const x0 = 60, x1 = 900, y = 120, sx = v => x0 + (v - 1960) / (2030 - 1960) * (x1 - x0);
  app.innerHTML = `
  <section class="lens"><div>
    <div class="kicker">מרעיון לחוק · 1962 עד 2017</div>
    <h1>בתוך <b>55 שנה</b>, רעיון הפך לחוק.</h1>
    <p class="sub">ספר, תמונה וועידה פתחו את הרשימה. מ-<b>2008</b> הטבע מקבל זכויות בחוקה, במדיניות ובבית המשפט. <mark>הלקוח הבא נכנס דרך התכנון.</mark></p>
  </div></section>
  <div class="card tl"><svg viewBox="0 0 960 260" role="img" aria-label="ציר הזמן של רשימת הלקוחות" style="direction:ltr">
    <line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="#141618" stroke-width="1.5"/>
    ${[1960, 1980, 2000, 2020].map(v => `<text x="${sx(v)}" y="${y + 70}" font-family="IBM Plex Mono" font-size="11" fill="#6B7178" text-anchor="middle">${v}</text>`).join("")}
    ${TIMELINE.map((t, i) => {
      const X = sx(t.y), up = i % 2 === 0, col = t.law ? "#2E7D4F" : "#141618";
      return `<g class="fadein" style="animation-delay:${i * 150}ms">
        <circle cx="${X}" cy="${y}" r="7" fill="${col}"/>
        <line x1="${X}" y1="${y}" x2="${X}" y2="${up ? y - 40 : y + 40}" stroke="${col}" stroke-width="1"/>
        <text x="${X}" y="${up ? y - 76 : y + 48}" font-family="IBM Plex Mono" font-weight="500" font-size="15" fill="${col}" text-anchor="middle">${t.y}</text>
        <text x="${X}" y="${up ? y - 60 : y + 64}" font-family="IBM Plex Sans Hebrew" font-size="12" fill="#141618" text-anchor="middle" direction="rtl">${t.t}</text>
        <text x="${X}" y="${up ? y - 46 : y + 78}" font-family="IBM Plex Sans Hebrew" font-size="11" fill="#6B7178" text-anchor="middle" direction="rtl">${t.d}</text>
      </g>`;
    }).join("")}
    <g><circle cx="${sx(2026)}" cy="${y}" r="9" fill="none" stroke="#1F5E6B" stroke-width="2" stroke-dasharray="3 3"/>
    <text x="${sx(2026)}" y="${y - 22}" font-family="IBM Plex Mono" font-size="14" font-weight="500" fill="#1F5E6B" text-anchor="middle">2026 ?</text></g>
    <g font-family="IBM Plex Sans Hebrew" font-size="12" fill="#6B7178"><circle cx="880" cy="232" r="5" fill="#141618"/><text x="870" y="236" text-anchor="end" direction="rtl">רעיון: ספר, תמונה, ועידה</text>
    <circle cx="660" cy="232" r="5" fill="#2E7D4F"/><text x="650" y="236" text-anchor="end" direction="rtl">הרעיון הפך לחוק או למדיניות</text></g>
  </svg></div>
  <div class="quotes">${SOURCE.quotes.map(q => `<div class="quote"><p class="he">"${q.he}"</p>${q.en ? `<p class="en">"${q.en}"</p>` : ""}<p class="src">${q.by}</p></div>`).join("")}</div>
  <div class="row" style="margin-top:24px"><a class="btn primary" href="#/lab">מי הלקוח של 2026? למעבדה</a></div>`;
}

/* ===== הרשת ===== */
function network() {
  const W = 760, H = 600, cx = W / 2, cy = H / 2;
  const keys = Object.keys(APPS);
  const pc = CLIENTS.map((c, i) => { const a = -Math.PI / 2 + i / CLIENTS.length * Math.PI * 2; return { c, x: cx + Math.cos(a) * 130, y: cy + Math.sin(a) * 130 }; });
  const pa = keys.map((k, i) => { const a = -Math.PI / 2 + (i + .5) / keys.length * Math.PI * 2; return { k, x: cx + Math.cos(a) * 265, y: cy + Math.sin(a) * 250 }; });
  const P = Object.fromEntries(pa.map(p => [p.k, p]));
  const links = CLIENTS.flatMap((c, i) => [[i, c.app, 1], [i, c.app2, 2]]);
  app.innerHTML = `
  <section class="lens"><div>
    <div class="kicker">הרשת · ${CLIENTS.length} לקוחות, ${keys.length} אפליקציות</div>
    <h1>כל לקוח <b>פותח שאלה</b> באפליקציה אחרת.</h1>
    <p class="sub">האצה מובילה לטבלה המחזורית, הזרע לנובל, הפטרייה לרפואה. הקו נושא את השאלה, והחץ את הכיוון.</p>
  </div></section>
  <div class="net">
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="רשת הקשרים בין הלקוחות לאפליקציות" style="direction:ltr">
      <defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10z" fill="#6B7178"/></marker></defs>
      <circle cx="${cx}" cy="${cy}" r="42" fill="#16303A"/><text x="${cx}" y="${cy + 5}" fill="#fff" font-family="IBM Plex Sans Hebrew" font-size="15" text-anchor="middle">האדם</text>
      ${links.map(([i, k, w]) => { const a = pc[i], b = P[k]; return `<line class="link draw" data-c="${CLIENTS[i].id}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${CLIENTS[i].color}" stroke-width="${w === 1 ? 2 : 1.2}" stroke-opacity=".7" ${w === 2 ? 'stroke-dasharray="4 4"' : ""} marker-end="url(#ar)" style="--len:400"/>`; }).join("")}
      ${pc.map(p => `<line x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}" stroke="#D9D9D3"/>`).join("")}
      ${pc.map(p => `<a href="#/client/${p.c.id}" data-hl="${p.c.id}"><circle cx="${p.x}" cy="${p.y}" r="38" fill="#fff" stroke="${p.c.color}" stroke-width="3"/><text x="${p.x}" y="${p.y + 5}" text-anchor="middle" font-family="IBM Plex Sans Hebrew" font-size="12" font-weight="600" fill="${p.c.color}" direction="rtl">${p.c.name}</text></a>`).join("")}
      ${pa.map(p => `<a href="${APPS[p.k].url}" target="_blank" rel="noopener"><rect x="${p.x - 66}" y="${p.y - 20}" width="132" height="40" fill="#FAFAF7" stroke="#141618"/><text x="${p.x}" y="${p.y - 3}" text-anchor="middle" font-family="IBM Plex Sans Hebrew" font-size="11.5" fill="#141618" direction="rtl">${APPS[p.k].name.length > 20 ? APPS[p.k].name.slice(0, 19) + "…" : APPS[p.k].name}</text><text x="${p.x}" y="${p.y + 12}" text-anchor="middle" font-family="IBM Plex Mono" font-size="10" fill="#6B7178">${APPS[p.k].lens}</text></a>`).join("")}
    </svg>
    <div class="col">
      <div class="legend"><span><i style="background:#141618"></i>שאלה ראשית</span><span><i style="background:repeating-linear-gradient(90deg,#141618 0 4px,transparent 4px 8px)"></i>שאלה משנית</span></div>
      ${CLIENTS.map(c => `<div class="card question" data-hl="${c.id}" style="border-inline-start:4px solid ${c.color};padding:10px 12px">
        <div class="lbl" style="color:${c.color}">${c.name}</div><p style="font-weight:500">${c.question}</p>
        <div class="row">${appBtn(c.app)}${appBtn(c.app2)}</div></div>`).join("")}
    </div>
  </div>`;
  app.querySelectorAll("[data-hl]").forEach(el => {
    el.addEventListener("mouseenter", () => app.querySelectorAll(".link").forEach(l => { l.style.strokeOpacity = l.dataset.c === el.dataset.hl ? 1 : .08; }));
    el.addEventListener("mouseleave", () => app.querySelectorAll(".link").forEach(l => { l.style.strokeOpacity = ""; }));
  });
}

/* ===== ניתוב ===== */
let cleanup = null;
function route() {
  cleanup?.(); cleanup = null;
  const h = location.hash.replace(/^#\/?/, "");
  const [path, qs] = h.split("?");
  const params = new URLSearchParams(qs || "");
  const [r, id] = path.split("/");
  const cur = r === "client" ? "clients" : r;
  document.querySelectorAll("#mainnav a").forEach(a => a.dataset.r === cur ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current"));
  ({ clients, lab: () => lab(params), brief: () => brief(params), timeline, network, client: () => client(id) }[r] || home)();
  const title = { clients: "הלקוחות", lab: "מעבדת גילויים", brief: "תדריך", timeline: "מרעיון לחוק", network: "הרשת", client: byId(id)?.name }[r];
  document.title = title ? `${title} · ארק ובינה` : "ארק ובינה: אדריכלות למהפכה הבאה";
  if (r !== "lab" || !route.wasLab) scrollTo(0, 0);
  route.wasLab = r === "lab";
}
app.addEventListener("click", e => { const b = e.target.closest("[data-copy]"); if (b) copy(decodeURIComponent(b.dataset.copy), "הפרומפט הועתק"); });
addEventListener("hashchange", route);
route();

/* כפתור הלוגו: ריפו הפרויקט בתוך התפריט */
customElements.whenDefined("ai-menu").then(() => {
  const m = document.querySelector("ai-menu");
  if (m) m.items = [{ label: "ריפו הפרויקט", hint: "GitHub", href: "https://github.com/Anat1969/ArcAndBina-GH" }];
});
if ("serviceWorker" in navigator && location.hostname !== "localhost") navigator.serviceWorker.register("/sw.js");
