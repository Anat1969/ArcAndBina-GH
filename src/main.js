import "./styles.css";
import { CLIENTS, ELEMENTS, GRADIENT, APPS, TIMELINE, LANES, SOURCE, BRIDGES, FLASH, ROLES } from "./data.js";
import { ARTICLES } from "./articles.js";
import { sectionSVG } from "./section.js";
import { slotHTML, mountSlot } from "./slot.js";

const app = document.getElementById("app");
const $ = (s, r = document) => r.querySelector(s);
const md = s => s.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
const byId = id => CLIENTS.find(c => c.id === id);
const level = g => GRADIENT.reduce((a, b) => Math.abs(b.v - g) < Math.abs(a.v - g) ? b : a);
const MOVES = CLIENTS.length * ELEMENTS.length;
const BACK = "https://arc-and-bina.vercel.app";
const bridgesOf = c => Object.keys(BRIDGES).filter(k => k.startsWith(c.id + ":")).map(k => k.split(":")[1]);
const appsUsed = () => Object.keys(APPS).filter(k => CLIENTS.some(c => BRIDGES[`${c.id}:${k}`]));
const DISC = CLIENTS.map((c, i) => ({ id: "d-" + c.id, n: String(i + 1).padStart(2, "0"), c }));

function toast(t) { const el = $("#toast"); el.textContent = t; el.classList.add("on"); clearTimeout(toast.h); toast.h = setTimeout(() => el.classList.remove("on"), 2200); }
async function copy(text, msg = "הועתק") { try { await navigator.clipboard.writeText(text); toast(msg); } catch { toast("ההעתקה נחסמה בדפדפן"); } }

/* ===== המסגרת הקבועה: עדשה, ושלושה טורים: הקשר, מוקד, הפקה ===== */
let cleanups = [];
function page({ role, kicker, title, sub, meta, right, focus, left }) {
  const R = ROLES[role];
  app.innerHTML = `<div class="page">
    <header class="lens"><div><div class="kicker">${R ? `<span class="role">${R.step}</span>` : ""}${kicker}</div><h1>${title}</h1>${sub ? `<p class="sub">${sub}</p>` : ""}</div>${meta ? `<div class="meta">${meta}</div>` : ""}</header>
    <div class="frame">
      <aside class="pane side pr" aria-label="הקשר">${right}</aside>
      <section class="pane focus pf" aria-label="מוקד">${focus}</section>
      <aside class="pane side pl" aria-label="הפקה">${left}</aside>
    </div></div>`;
  cleanups.push(mountSlot(app, toast));
}
const ph = (a, b = "") => `<div class="ph"><span>${a}</span><span>${b}</span></div>`;
const why = t => `<p class="why">${t}</p>`;

/* בוררים: קטגוריה בעמודה אחת או בשורה אחת, כפתורים באותו גובה, בלי אנגלית */
const clientStack = (active, href) => `<div class="stack clients">${CLIENTS.map(c =>
  `<a class="opt" style="--c:${c.color}" href="${href(c)}" ${c.id === active ? 'aria-current="page"' : ""}><i class="sw"></i><span>${c.name}</span></a>`).join("")}</div>`;
const elementLine = (active, href) => `<div class="line elements">${ELEMENTS.map(e =>
  `<a class="opt" href="${href(e)}" ${e.id === active ? 'aria-current="page"' : ""}><span>${e.name}</span></a>`).join("")}</div>`;
const gradLine = (active, href) => `<div class="line grad">${GRADIENT.map(L =>
  `<a class="opt dual" href="${href(L)}" ${L.v === active ? 'aria-current="page"' : ""} title="${L.name}"><span>${L.v}</span><small>${L.name.replace("מרחב ", "")}</small></a>`).join("")}</div>`;

/* פרומפט לתמונה: משפט זיקוק, ופרומפט בעברית למידג'רני, בחמש שכבות: נושא, הקשר, חומר, אור, מצלמה */
const CAMERA = "עדשה 35 מ\"מ, גובה עין, קומפוזיציה מאוזנת, צבע טבעי";
const TAIL = "Documentary realism, Professional architecture photography, 1:1 --ar 1:1 --style raw --v 7 --no text, words, writing, frame divisions";
export function buildPrompt(c, el, g) {
  const e = ELEMENTS.find(x => x.id === el) || ELEMENTS[0];
  const L = level(g);
  return {
    distill: `${e.name} שעובד גם בשביל ה${c.name}: ${c.moves[e.id]}`,
    prompt: [`${c.prompt.subject}, ${e.name} כמוקד`, `${c.ashdod.site} (${c.ashdod.nameEn}), ${L.name}`, c.prompt.material, c.prompt.light, CAMERA].join(", ") + ", " + TAIL,
  };
}
const articlePrompt = a => ({ distill: `${a.title}: ${a.insight}`, prompt: [a.prompt.subject, a.who.place, a.prompt.material, a.prompt.light, CAMERA].join(", ") + ", " + TAIL });

/* גשר: תשובה ספציפית כאן, הפריט המדויק שם, ושדרוג מוצע לאפליקציה השותפה */
function bridgeUrl(b, c) {
  const u = new URL(b.url);
  u.searchParams.set("ab_q", c.question);
  u.searchParams.set("ab_back", `${BACK}/#/client/${c.id}`);
  return u.toString();
}
function bridgeCard(c, key, on) {
  const b = BRIDGES[`${c.id}:${key}`], a = APPS[key];
  if (!b) return "";
  return `<div class="bridge${on ? " on" : ""}" style="--c:${c.color}">
    <span class="to">${a.lens} · ${a.name} · ${b.exact ? "פריט מדויק" : "הפריט הקרוב ביותר"}</span>
    <span class="item">${b.item}</span>
    <p>${b.answer}</p>
    <a class="btn" href="${bridgeUrl(b, c)}" target="_blank" rel="noopener">לפריט באפליקציה</a>
    ${b.upgrade ? `<p class="up">שדרוג מוצע שם: ${b.upgrade}</p>` : ""}
  </div>`;
}

/* ===== דף הבית ===== */
function home() {
  const steps = [
    ["articles", ARTICLES.length + DISC.length, "כתבות", "השראה מהפרק, וכתבת גילוי לכל לקוח.", "#/articles"],
    ["clients", CLIENTS.length, "לקוחות בחתך חי", "מה הלקוח צריך, ומה הוא נותן לבניין.", "#/client/river"],
    ["lab", MOVES * GRADIENT.length, "צירופים במעבדה", "לקוח, רכיב ודרגה: רעיון שעוד לא נוסה.", "#/lab"],
    ["brief", MOVES, "מהלכי תכנון", "עמוד אחד לוועדה, עם דוגמה מאשדוד.", "#/brief"],
    ["timeline", TIMELINE.length, "אבני דרך", "רעיון, חוק ובניין: שלושה מסלולים.", "#/timeline"],
    ["network", Object.keys(BRIDGES).length, "גשרים", "המשך החקירה, לפריט המדויק באפליקציה אחרת.", "#/network"],
  ];
  page({
    kicker: "ארק ובינה · החזון",
    title: "<b>הלקוח השתנה.</b> האדריכלות מתכננת גם לנהר, לאצה, לתולעת ולזרע.",
    sub: `הפרק <b>${SOURCE.chapter}</b> של designboom הופך כאן לכלי עבודה: <mark>השראה, הבנה, גילוי ויישום</mark>, לכל לקוח חדש.`,
    right: ph("המסלול", "6 דפים, 6 תפקידים") + steps.map(([r, n, u, p, href]) => `<a class="step" href="${href}"><span class="n">${n}</span><span><h3>${ROLES[r].step}: ${u}</h3><p>${p}</p></span></a>`).join(""),
    focus: ph("מכונת הגרדיאנט", "גרירה לסיבוב") + `<div class="machine">
      <div class="hud"><div class="lvl" id="lvl"></div><p id="lvlline"></p></div>
      <canvas id="gl" aria-label="גוש בניין שנפתח מ-0, מרחב מחוטא, עד 1, מרחב חי"></canvas>
      <div class="slider"><span class="lbl">0 · מחוטא</span><input id="g" type="range" min="0" max="1" step="0.01" value="0.5" aria-label="הגרדיאנט בין מרחב מחוטא למרחב חי"><span class="lbl">1 · חי</span></div>
      <div class="bars" id="bars"></div></div>`,
    left: ph("בעיה, פתרון, תובנה") + `<div class="psi">
      <div class="p"><span class="t">בעיה</span><b>מידה אחת, לקוח אחד</b>מוויטרוביוס ועד המודולור, כל מידה נגזרה מגוף האדם.</div>
      <div class="s"><span class="t">פתרון</span><b>גרדיאנט במקום גבול</b>כל תכונה של האתר על רצף 0 עד 1: פוריות, לחות, אור.</div>
      <div class="i"><span class="t">תובנה</span><b><mark>האדם זז מהמרכז, לא יוצא מהתמונה.</mark></b>האדריכל עובר מיצירה לאוצרות.</div></div>`
      + ph("הלקוחות", `${CLIENTS.length}`) + clientStack(null, c => `#/client/${c.id}`),
  });
  const input = $("#g");
  let machine;
  const show = () => {
    const g = +input.value, L = level(g);
    $("#lvl").innerHTML = `<b>${g.toFixed(2)}</b>${L.name}`;
    $("#lvlline").textContent = L.line;
    const lerp = k => Math.round(GRADIENT[0][k] + (GRADIENT[4][k] - GRADIENT[0][k]) * g);
    $("#bars").innerHTML = [["נקבוביות", lerp("porosity"), "%", 75], ["לחות קרקע", lerp("moisture"), "%", 80], ["מינים באתר", lerp("species"), "", 40]]
      .map(([n, v, u, max]) => `<div class="bar"><div class="lbl">${n}</div><div class="num">${v}${u}</div><div class="track"><div class="fill" style="width:${v / max * 100}%"></div></div></div>`).join("");
    machine?.set(g);
  };
  import("./gradient3d.js").then(m => { if (!$("#gl")) return; machine = m.mountGradient($("#gl")); show(); cleanups.push(() => machine.destroy()); })
    .catch(() => $("#gl")?.replaceWith(Object.assign(document.createElement("div"), { className: "gradscale" })));
  input.addEventListener("input", show);
  show();
}

/* ===== הלקוחות: הבנה. המוקד הוא החתך ===== */
function client(id) {
  const c = byId(id) || CLIENTS[0];
  const i = CLIENTS.indexOf(c);
  const arts = ARTICLES.filter(a => a.client === c.id);
  page({
    role: "clients",
    kicker: ` · לקוח ${i + 1} מתוך ${CLIENTS.length} · ${c.name}`,
    title: `<b>${c.insight}</b>`,
    sub: c.mechanism,
    meta: `צריך: ${c.need}<br>נותן: ${c.gives}`,
    right: ph("הלקוחות") + clientStack(c.id, x => `#/client/${x.id}`)
      + `<div class="card"><span class="lbl">ידע</span><p class="fact">${md(c.fact)}</p><div class="src">${c.source}</div></div>
         <div class="card"><span class="lbl">תקדים</span><p class="fact">${md(c.precedent)}</p></div>`,
    focus: ph("המנגנון בחתך", c.ashdod.site) + sectionSVG(c)
      + `<div class="two"><div class="card" style="--c:${c.color}"><span class="lbl">ארבעה מהלכי תכנון</span><div class="moves">${ELEMENTS.map(e => `<div class="move"><span class="el">${e.name}</span><span>${c.moves[e.id]}</span></div>`).join("")}</div></div>
         <div class="stack" style="align-content:start;gap:12px"><div class="ashdod"><span class="lbl">דוגמה מהעיר</span><h3>${c.ashdod.site}</h3><p style="margin-top:6px">${c.ashdod.line}</p></div>
         <div class="card flash"><span class="lbl">ההברקה</span><p><mark>${FLASH[c.id]}</mark></p></div></div></div>`,
    left: ph("תמונה") + slotHTML(`img:${c.id}:facade`, buildPrompt(c, "facade", .75), c.name, { mid: true })
      + `<div class="stack"><a class="btn primary" href="#/article/d-${c.id}">כתבת הגילוי</a><a class="btn" href="#/lab?c=${c.id}">למעבדה</a><a class="btn" href="#/brief?c=${c.id}&e=ground&g=0.75">תדריך</a>${arts.map(a => `<a class="btn" href="#/article/${a.id}"><span>השראה: ${a.title}</span></a>`).join("")}</div>`
      + ph("המשך החקירה") + `<p class="why">${c.question}</p>` + bridgesOf(c).map(k => bridgeCard(c, k)).join(""),
  });
}

/* ===== מעבדה: גילוי. המוקד הוא מפת הצירופים ===== */
const TENSION = { roof: "האדם רוצה מערכות, שמש ונוף על הגג.", facade: "האדם רוצה אור, נוף ובידוד בחזית.", ground: "האדם רוצה חניה וזכויות בנייה במגרש.", street: "האדם רוצה תנועה מהירה ובטוחה ברחוב." };
const SCALE = { roof: "קנה מידה: הבניין מלמעלה", facade: "קנה מידה: הבניין מבחוץ", ground: "קנה מידה: המגרש", street: "קנה מידה: העיר" };
function readState(params, def) {
  return { c: byId(params.get("c"))?.id || def.c, e: ELEMENTS.find(x => x.id === params.get("e"))?.id || def.e, g: level(+(params.get("g") ?? def.g)).v };
}
function lab(params) {
  const s = readState(params, { c: "river", e: "roof", g: .5 });
  const c = byId(s.c), e = ELEMENTS.find(x => x.id === s.e), L = level(s.g);
  const other = CLIENTS.filter(x => x.id !== c.id)[(CLIENTS.indexOf(c) + ELEMENTS.indexOf(e)) % (CLIENTS.length - 1)];
  const h = o => `#/lab?c=${o.c ?? s.c}&e=${o.e ?? s.e}&g=${o.g ?? s.g}`;
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const sur = { c: pick(CLIENTS.filter(x => x.id !== c.id)).id, e: pick(ELEMENTS.filter(x => x.id !== e.id)).id, g: pick(GRADIENT.slice(1)).v };
  page({
    role: "lab",
    kicker: ` · ${c.name} × ${e.name} × ${L.v}`,
    title: `מה אם ה<b>${e.name}</b> היה עובד גם בשביל ה<b>${c.name}</b>?`,
    sub: `${L.name}: ${L.line}`,
    meta: `${MOVES} מהלכים<br>${GRADIENT.length} דרגות`,
    right: ph("שלוש שאלות, גילוי אחד")
      + `<div class="card explain"><b>לקוח: למי?</b><p>שורה בטבלה. כל לקוח מבקש משהו אחר מהבניין.</p></div>`
      + `<div class="card explain"><b>רכיב: איפה בבניין?</b><p>עמודה בטבלה. גג, חזית, קרקע ורחוב הם ארבעה קני מידה, מהבניין ועד העיר.</p></div>`
      + `<div class="card explain"><b>דרגה: כמה נותנים?</b><p>מ-0, מרחב מחוטא, עד 1, מרחב חי. <mark>כל דרגה היא החלטת תכנון, כמו אחוזי בנייה.</mark></p></div>`
      + gradLine(L.v, x => h({ g: x.v }))
      + `<a class="btn primary" href="${h(sur)}">צירוף מפתיע</a>` + why("לקוח ורכיב שלא היית מצמידה. משם נולדים רעיונות."),
    focus: `<div class="quad">
        <div class="q p"><b>הקונפליקט</b><p>${TENSION[e.id]} ה${c.name} צריך ${c.need}.</p></div>
        <div class="q s"><b>המהלך</b><p>${c.moves[e.id]}</p></div>
        <div class="q i"><b>התובנה</b><p><mark>${c.insight}</mark></p></div>
        <div class="q x" style="--c:${other.color}"><b>צירוף נוסף: ${other.name}</b><p>${other.moves[e.id]}</p></div>
      </div>`
      + ph("מפת הצירופים", "שורה: לקוח · עמודה: רכיב · תא: מהלך") + `<div class="matrix lab"><table>
        <thead><tr><th></th>${ELEMENTS.map(x => `<th><a href="${h({ e: x.id })}" ${x.id === e.id ? 'aria-current="true"' : ""}>${x.name}<small>${SCALE[x.id].replace("קנה מידה: ", "")}</small></a></th>`).join("")}</tr></thead>
        <tbody>${CLIENTS.map(x => `<tr><th class="rowh"><a href="${h({ c: x.id })}" style="color:${x.color}" ${x.id === c.id ? 'aria-current="true"' : ""}>${x.name}</a></th>${ELEMENTS.map(y =>
          `<td><a class="mcell${x.id === c.id && y.id === e.id ? " on" : ""}${x.id === c.id || y.id === e.id ? " near" : ""}" style="--c:${x.color}" href="${h({ c: x.id, e: y.id })}" title="${x.moves[y.id]}">${x.moves[y.id]}</a></td>`).join("")}</tr>`).join("")}</tbody></table></div>`,
    left: ph("תמונה של הגילוי") + slotHTML(`img:${c.id}:${e.id}`, buildPrompt(c, e.id, L.v), c.name, { mid: true })
      + `<div class="stack"><a class="btn primary" href="#/brief?c=${c.id}&e=${e.id}&g=${L.v}">תדריך מהגילוי</a><a class="btn" href="#/article/d-${c.id}">כתבת הגילוי</a></div>`
      + ph("המשך החקירה") + bridgeCard(c, bridgesOf(c)[0]),
  });
}

/* ===== תדריך: יישום. המוקד הוא הגיליון, והמהלך הנבחר בראשו ===== */
function brief(params) {
  const s = readState(params, { c: "river", e: "ground", g: .75 });
  const c = byId(s.c), e = ELEMENTS.find(x => x.id === s.e), L = level(s.g);
  const hh = o => `#/brief?c=${o.c ?? s.c}&e=${o.e ?? s.e}&g=${o.g ?? s.g}`;
  page({
    role: "brief",
    kicker: ` · ${c.ashdod.site}`,
    title: `תדריך לכל מגרש: <b>שני לקוחות</b>, האדם וה${c.name}`,
    sub: "בוחרים לקוח, רכיב ודרגה. המהלך הנבחר עולה לראש העמוד, במרקר.",
    right: ph("לקוח") + clientStack(c.id, x => hh({ c: x.id })) + ph("רכיב", "איפה בבניין") + elementLine(e.id, x => hh({ e: x.id })) + ph("דרגה", "כמה נותנים") + gradLine(L.v, x => hh({ g: x.v })),
    focus: `<article class="sheet" style="--c:${c.color}">
      <div class="runhead"><span>תדריך תכנון · ארק ובינה</span><span>${c.ashdod.site}</span></div>
      <h1>${c.ashdod.site}</h1><p class="deck">${c.ashdod.line}</p>
      <div class="chosen"><span class="lbl">המהלך הנבחר · ${e.name} · דרגה ${L.v}, ${L.name}</span><p><mark>${c.moves[e.id]}</mark></p><p class="small">${TENSION[e.id]} ה${c.name} צריך ${c.need}.</p></div>
      <h2>ארבעה מהלכי תכנון</h2>
      <div class="moves">${ELEMENTS.map(x => `<div class="move${x.id === e.id ? " picked" : ""}"><span class="el" style="color:${c.color}">${x.name}</span><span>${c.moves[x.id]}</span></div>`).join("")}</div>
      <div class="cols">
        <div><h2>היעד על הגרדיאנט: ${L.v}</h2><p>${L.line}</p><div class="gradscale" style="margin:10px 0"></div><p>${md(c.fact)}</p><p class="src">${c.source}</p></div>
        <figure class="mirror">${sectionSVG(c)}<figcaption>המנגנון בחתך. ${c.mechanism}</figcaption></figure>
      </div>
      <h2>מי מבקש מה</h2>
      <table class="tbl"><thead><tr><th>לקוח</th><th>צריך</th><th>נותן לאתר</th></tr></thead><tbody>
        <tr><td><b>האדם</b></td><td>${TENSION[e.id].replace("האדם רוצה ", "")}</td><td>שימוש, ערך כלכלי, חיים עירוניים</td></tr>
        <tr><td><b style="color:${c.color}">ה${c.name}</b></td><td>${c.need}</td><td>${c.gives}</td></tr></tbody></table>
      <div class="cols"><div><h2>שאלת מחקר</h2><p>${c.question}</p></div><div><h2>הייקו</h2><p class="haiku">${c.haiku.join("<br>")}</p></div></div>
      <div class="foot"><span>מקור הרעיון: ${SOURCE.chapter}, ${SOURCE.publisher}</span><span>${new Date().toLocaleDateString("he-IL")}</span></div>
    </article>`,
    left: ph("הפקה") + `<div class="stack"><button class="btn primary" data-print>הדפסה ושמירה כקובץ</button></div>`
      + ph("תמונה לתדריך", "נכנסת לגיליון") + slotHTML(`img:${c.id}:${e.id}`, buildPrompt(c, e.id, L.v), c.name, { compact: true }),
  });
  mirrorImage();
  const ch = app.querySelector(".chosen");
  if (ch) { ch.classList.add("pulse"); app.querySelector(".pf").scrollTo({ top: 0 }); }
}

/* התמונה מהמסגרת נכנסת לגיליון, כדי שההדפסה תכלול אותה */
function mirrorImage() {
  const fig = app.querySelector(".mirror"), frame = app.querySelector(".slot .slot-frame");
  if (!fig || !frame) return;
  const sync = () => {
    const src = frame.querySelector("img,video"); if (!src) return;
    const cur = fig.querySelector(".m");
    if (cur?.src === src.src) return;
    [...fig.children].forEach(n => { if (n.tagName !== "FIGCAPTION") n.remove(); });
    const m = src.tagName === "VIDEO"
      ? Object.assign(document.createElement("video"), { src: src.src, muted: true, loop: true, autoplay: src.autoplay, playsInline: true, controls: true })
      : Object.assign(new Image(), { src: src.src, alt: src.alt });
    m.className = "m"; m.style.cssText = "width:100%;display:block;aspect-ratio:1/1;object-fit:cover;background:#000";
    fig.prepend(m);
  };
  const mo = new MutationObserver(sync); mo.observe(frame, { childList: true }); cleanups.push(() => mo.disconnect());
}

/* ===== כתבות: הבסיס. שתי סדרות: השראה מהפרק, והגילויים שלנו ===== */
function seriesPicker(cur, activeId) {
  const list = cur === "d"
    ? DISC.map(d => `<a class="opt" style="--c:${d.c.color}" href="#/article/${d.id}" ${d.id === activeId ? 'aria-current="page"' : ""}><i class="sw"></i><span>${d.c.name}: ${d.c.insight}</span></a>`)
    : ARTICLES.map(x => `<a class="opt" href="#/article/${x.id}" ${x.id === activeId ? 'aria-current="page"' : ""}><small class="num">${x.n}</small><span>${x.title}</span></a>`);
  return `<div class="line series"><a class="opt" href="#/articles?s=i" ${cur === "i" ? 'aria-current="page"' : ""}><span>השראה מהפרק</span></a><a class="opt" href="#/articles?s=d" ${cur === "d" ? 'aria-current="page"' : ""}><span>הגילויים שלנו</span></a></div>`
    + why(cur === "d" ? "<b>גילוי:</b> מה הלקוח מלמד אותנו, וההברקה התכנונית שיוצאת ממנו. נכתב מתוך המעבדה." : "<b>השראה:</b> מה אחרים כבר עשו, מתוך הפרק של designboom. בסיס לרעיונות.")
    + `<div class="stack">${list.join("")}</div>`;
}
function article(id) {
  const d = DISC.find(x => x.id === id);
  if (d) return discovery(d);
  const a = ARTICLES.find(x => x.id === id) || ARTICLES[0];
  const c = byId(a.client);
  const post = `${a.title}\n${a.deck}\n\n${a.lead.replace(/<[^>]+>/g, "").replace(/\*\*/g, "")}\n\nתובנה: ${a.insight}\n\n${a.haiku.join("\n")}\n\nמקור: designboom, ${SOURCE.chapter}\n${a.url}`;
  page({
    role: "articles",
    kicker: ` · השראה ${a.n} מתוך ${ARTICLES.length} · ${a.section}`,
    title: `כתבות מהפרק <b>${SOURCE.chapter}</b>`,
    sub: "מה אחרים כבר בנו וחשבו. כל כתבה מובילה לגילוי אצלנו.",
    meta: `${a.who.he}<br>${a.date}`,
    right: seriesPicker("i", a.id),
    focus: `<article class="sheet">
      <div class="runhead"><span>השראה · ${a.section} · ${a.date}</span><span>designboom · ${SOURCE.chapter}</span></div>
      <h1>${a.title}</h1><p class="deck">${a.deck}</p>
      <p class="lead">${md(a.lead)}</p>
      <div class="cols">
        <div>${a.body.map(s => `<h2>${s.h}</h2>${s.p.map(p => `<p>${md(p)}</p>`).join("")}`).join("")}
          ${a.pull ? `<div class="pull"><p class="he">"${a.pull.he}"</p>${a.pull.en ? `<p class="en">"${a.pull.en}"</p>` : ""}<p class="by">${a.pull.by}</p></div>` : ""}
          <h2>מה זה אומר לתכנון</h2><p>${a.apply}</p>
        </div>
        <div>
          <figure class="mirror"><div class="slot-frame ghost" aria-hidden="true"><div class="how"><b>מקום לתמונה</b></div></div><figcaption>${a.who.he}, ${a.who.role}. ${a.who.place}.</figcaption></figure>
          <div class="box"><h3>${a.box.h}</h3>${a.box.items.map(t => `<p style="margin-top:4px">${t}</p>`).join("")}</div>
          <p style="margin-top:16px"><span class="insight">${a.insight}</span></p>
          <p class="haiku" style="margin-top:16px">${a.haiku.join("<br>")}</p>
        </div>
      </div>
      <div class="foot"><span>מקור: <a href="${a.url}" target="_blank" rel="noopener">designboom</a>, ${SOURCE.publisher}</span><span>ארק ובינה · השראה ${a.n}</span></div>
    </article>`,
    left: ph("הפקה לפרסום") + `<div class="stack">
        <button class="btn primary" data-print>הדפסה ושמירה כקובץ</button>
        <button class="btn" data-copy="${encodeURIComponent(post)}" data-msg="טקסט הפוסט הועתק">העתקת טקסט לפוסט</button>
        <a class="btn" href="${a.url}" target="_blank" rel="noopener">הכתבה המקורית</a></div>`
      + ph("תמונה לכתבה", "נכנסת לגיליון") + slotHTML(`article:${a.id}`, articlePrompt(a), a.title, { compact: true })
      + (c ? ph("מההשראה לגילוי") + `<div class="stack"><a class="btn primary" href="#/article/d-${c.id}">כתבת הגילוי: ${c.name}</a><a class="btn" href="#/lab?c=${c.id}">המעבדה: ${c.name}</a></div>` : "")
      + `<div class="card"><span class="lbl">לבדיקה לפני פרסום</span><p style="font-size:13.5px">${a.check}</p></div>`,
  });
  mirrorImage();
}
function discovery(d) {
  const c = d.c;
  const insp = ARTICLES.filter(a => a.client === c.id);
  const post = `${c.insight}\n\nההברקה: ${FLASH[c.id]}\n\n${c.mechanism}\n\n${c.haiku.join("\n")}\n\nארק ובינה: ${BACK}/#/article/${d.id}`;
  page({
    role: "articles",
    kicker: ` · גילוי ${d.n} מתוך ${DISC.length} · ${c.name}`,
    title: `הגילויים שלנו: <b>${c.name}</b>`,
    sub: "מה הלקוח מלמד, וההברקה התכנונית שיוצאת ממנו.",
    meta: `${c.ashdod.site}`,
    right: seriesPicker("d", d.id),
    focus: `<article class="sheet" style="--c:${c.color}">
      <div class="runhead"><span>גילוי ${d.n} · ${c.name}</span><span>ארק ובינה · הגילויים שלנו</span></div>
      <h1>${c.insight}</h1>
      <div class="chosen"><span class="lbl">ההברקה</span><p><mark>${FLASH[c.id]}</mark></p></div>
      <p class="lead">${md(c.fact)}</p>
      <div class="cols">
        <div>
          <h2>המנגנון</h2><p>${c.mechanism}</p><p>${md(c.precedent)}</p>
          <h2>הקונפליקט</h2><p>${TENSION.ground} ה${c.name} צריך ${c.need}.</p>
          <h2>ארבעה מהלכים</h2><div class="moves">${ELEMENTS.map(x => `<div class="move"><span class="el" style="color:${c.color}">${x.name}</span><span>${c.moves[x.id]}</span></div>`).join("")}</div>
          <h2>באשדוד</h2><p><b>${c.ashdod.site}.</b> ${c.ashdod.line}</p>
        </div>
        <div>
          <figure class="mirror">${sectionSVG(c)}<figcaption>המנגנון בחתך.</figcaption></figure>
          <div class="box"><h3>מה ה${c.name} נותן לעיר</h3>${c.gives.split(/,\s*/).map(t => `<p style="margin-top:4px">${t}</p>`).join("")}</div>
          <div class="box"><h3>השאלה הפתוחה</h3><p>${c.question}</p></div>
          <p class="haiku" style="margin-top:16px">${c.haiku.join("<br>")}</p>
        </div>
      </div>
      <div class="foot"><span>${c.source}${insp.length ? ` · השראה: ${insp.map(a => a.title).join(", ")}` : ""}</span><span>ההברקה היא רעיון תכנוני, לא עובדה</span></div>
    </article>`,
    left: ph("הפקה לפרסום") + `<div class="stack">
        <button class="btn primary" data-print>הדפסה ושמירה כקובץ</button>
        <button class="btn" data-copy="${encodeURIComponent(post)}" data-msg="טקסט הפוסט הועתק">העתקת טקסט לפוסט</button></div>`
      + ph("תמונה לכתבה", "נכנסת לגיליון") + slotHTML(`img:${c.id}:facade`, buildPrompt(c, "facade", .75), c.name, { compact: true })
      + ph("מהגילוי למעבדה", "ארבעה צירופים") + `<div class="stack">${ELEMENTS.map(x => `<a class="btn" href="#/lab?c=${c.id}&e=${x.id}&g=0.75">${c.name} × ${x.name}</a>`).join("")}</div>`
      + (insp.length ? ph("ההשראה מהפרק") + `<div class="stack">${insp.map(a => `<a class="btn" href="#/article/${a.id}"><span>${a.title}</span></a>`).join("")}</div>` : ""),
  });
  mirrorImage();
}

/* ===== מרעיון לחוק: הקשר. שלושה מסלולים על ציר אחד ===== */
function timeline(params) {
  const sel = Math.min(TIMELINE.length - 1, Math.max(0, +(params.get("i") ?? TIMELINE.findIndex(t => t.y === 2017))));
  const t = TIMELINE[sel];
  const count = k => TIMELINE.filter(x => x.lane === k).length;
  const first = k => TIMELINE.find(x => x.lane === k && (k !== "law" || x.y > 2005)).y;
  page({
    role: "timeline",
    kicker: ` · ${TIMELINE[0].y} עד ${TIMELINE.at(-1).y}`,
    title: "<b>הרעיון הגיע ראשון</b>, החוק אחריו, והבניין רק עכשיו.",
    sub: `${count("idea")} רעיונות, ${count("law")} חוקים ו-${count("built")} בניינים. זכויות הטבע נכנסו לחוק מ-<b>${first("law")}</b>, ובניינים שמשרתים לקוח לא־אנושי מופיעים מ-<b>${first("built")}</b>.`,
    meta: `${TIMELINE.length} אבני דרך`,
    right: ph("שלושה מסלולים") + Object.entries(LANES).map(([k, L]) => `<div class="lanecard" style="--c:${L.color}"><span class="n">${count(k)}</span><span><b>${L.name}</b><small>${{ idea: "ספר, מאמר, ועידה", law: "חוק, חוקה, מדיניות", built: "מבנה שנבנה" }[k]}</small></span></div>`).join("")
      + ph("ציטוטים מהפרק") + SOURCE.quotes.map(q => `<div class="quote"><p class="he">"${q.he}"</p><p class="src">${q.by}</p></div>`).join(""),
    focus: `<div class="tl3">
      <div class="tl3h"><span>${LANES.idea.name}</span><span>שנה</span><span>${LANES.law.name}</span><span>${LANES.built.name}</span></div>
      ${TIMELINE.map((x, i) => `<a class="tl3r${i === sel ? " on" : ""}" href="#/timeline?i=${i}" style="--c:${LANES[x.lane].color}">
        <span class="c idea">${x.lane === "idea" ? x.t.split(" (")[0] : ""}</span><span class="y">${x.y}</span><span class="c law">${x.lane === "law" ? x.t.split(" (")[0] : ""}</span><span class="c built">${x.lane === "built" ? x.t.split(" (")[0] : ""}</span></a>`).join("")}
      <a class="tl3r next" href="#/lab"><span class="c idea"></span><span class="y">?</span><span class="c law"></span><span class="c built">הבניין הבא שלך: למעבדה</span></a>
    </div>`,
    left: ph("אבן הדרך", LANES[t.lane].name) + `<div class="card tdetail" style="--c:${LANES[t.lane].color}"><span class="ty">${t.y}</span><h3>${t.t}</h3><p>${t.d}</p></div>`
      + `<div class="card"><span class="lbl">מה זה אומר לנו · פרשנות</span><p><mark>${t.so}</mark></p></div>`
      + `<div class="line"><a class="btn" href="#/timeline?i=${Math.max(0, sel - 1)}">הקודם</a><a class="btn" href="#/timeline?i=${Math.min(TIMELINE.length - 1, sel + 1)}">הבא</a></div>`
      + ph("הצעד הבא") + `<div class="stack"><a class="btn primary" href="#/lab">מי הלקוח של 2026? למעבדה</a><a class="btn" href="#/article/planet-in-the-room">כתבת הפתיחה של הפרק</a></div>`,
  });
  app.querySelector(".tl3r.on")?.scrollIntoView({ block: "nearest" });
}

/* ===== הרשת: המשך. אפליקציות בשורות, לקוחות בעמודות ===== */
function network(params) {
  const keys = appsUsed();
  const selC = byId(params.get("c")) || CLIENTS[0];
  const selA = keys.includes(params.get("a")) ? params.get("a") : bridgesOf(selC)[0];
  const exact = Object.values(BRIDGES).filter(b => b.exact).length;
  page({
    role: "network",
    kicker: ` · ${keys.length} אפליקציות × ${CLIENTS.length} לקוחות`,
    title: "כל לקוח <b>ממשיך לפריט מדויק</b> באפליקציה אחרת.",
    sub: "לא קישור לדף הבית: תשובה ספציפית כאן, הפריט המדויק שם, ושדרוג מוצע לאפליקציה השותפה.",
    meta: `${Object.keys(BRIDGES).length} גשרים<br>${exact} מדויקים`,
    right: ph("לקוח") + clientStack(selC.id, c => `#/network?c=${c.id}`),
    focus: ph("מי ממשיך לאן", "כהה: פריט מדויק · בהיר: הקרוב ביותר") + `<div class="matrix net"><table>
      <thead><tr><th></th>${CLIENTS.map(c => `<th><a href="#/network?c=${c.id}" style="color:${c.color}" ${c.id === selC.id ? 'aria-current="true"' : ""}>${c.name}</a></th>`).join("")}<th>גשרים</th></tr></thead>
      <tbody>${keys.map(k => `<tr${k === selA ? ' class="on"' : ""}><th class="rowh">${APPS[k].name.split(/[:(]/)[0].trim()}<small>${APPS[k].lens}</small></th>${CLIENTS.map(c => {
        const b = BRIDGES[`${c.id}:${k}`];
        return `<td>${b ? `<a class="cell ${b.exact ? "k1" : "k2"}" style="--c:${c.color}" href="#/network?c=${c.id}&a=${k}" ${c.id === selC.id && k === selA ? 'aria-pressed="true"' : ""} title="${b.item}" aria-label="${c.name} אל ${APPS[k].name}"></a>` : `<span class="dot0"></span>`}</td>`;
      }).join("")}<td class="cnt">${CLIENTS.filter(c => BRIDGES[`${c.id}:${k}`]).length}</td></tr>`).join("")}</tbody></table></div>`
      + `<div class="card"><span class="lbl">איך הגשר עובד</span><p style="font-size:14px">כל קישור נושא את השאלה ואת הדרך חזרה. אפליקציה שותפה מציגה פס: "הגעת מארק ובינה", עם השאלה וכפתור חזרה.</p></div>`,
    left: ph(`המשך החקירה: ${selC.name}`) + why(selC.question) + bridgesOf(selC).map(k => bridgeCard(selC, k, k === selA)).join(""),
  });
}

/* ===== ניתוב, עם מעבר מונפש בין מסכים ===== */
function render() {
  cleanups.forEach(f => { try { f(); } catch { /* */ } }); cleanups = [];
  const h = location.hash.replace(/^#\/?/, "");
  const [path, qs] = h.split("?");
  const params = new URLSearchParams(qs || "");
  const [r, id] = path.split("/");
  const cur = { client: "clients", article: "articles" }[r] || r;
  document.querySelectorAll("#mainnav a").forEach(a => a.dataset.r === cur ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current"));
  ({
    clients: () => client("river"), client: () => client(id), lab: () => lab(params), brief: () => brief(params),
    articles: () => article(params.get("s") === "d" ? DISC[0].id : ARTICLES[0].id), article: () => article(id),
    timeline: () => timeline(params), network: () => network(params),
  }[r] || home)();
  const dn = DISC.find(d => d.id === id);
  const title = { clients: "הלקוחות", client: byId(id)?.name, lab: "מעבדת גילויים", brief: "תדריך", articles: "כתבות", article: dn ? `גילוי: ${dn.c.name}` : ARTICLES.find(a => a.id === id)?.title, timeline: "מרעיון לחוק", network: "הרשת" }[r];
  document.title = title ? `${title} · ארק ובינה` : "ארק ובינה: אדריכלות למהפכה הבאה";
  return r;
}
let last = null;
function route() {
  const go = () => { const r = render(); if (r !== last) scrollTo(0, 0); last = r; };
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (document.startViewTransition && !reduce && last !== null) document.startViewTransition(go); else go();
}
app.addEventListener("click", e => {
  const b = e.target.closest("[data-copy]"); if (b) copy(decodeURIComponent(b.dataset.copy), b.dataset.msg || "הפרומפט הועתק. אחרי היצירה: Ctrl+V במסגרת");
  if (e.target.closest("[data-print]")) print();
});
addEventListener("hashchange", route);
route();

customElements.whenDefined("ai-menu").then(() => {
  const m = document.querySelector("ai-menu");
  if (m) m.items = [{ label: "ריפו הפרויקט", hint: "GitHub", href: "https://github.com/Anat1969/ArcAndBina-GH" }];
});
if ("serviceWorker" in navigator && location.hostname !== "localhost") navigator.serviceWorker.register("/sw.js");
