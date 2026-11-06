import "./styles.css";
import { CLIENTS, ELEMENTS, GRADIENT, APPS, TIMELINE, LANES, SOURCE, BRIDGES, FLASH, ROLES } from "./data.js";
import { ARTICLES } from "./articles.js";
import { sectionSVG } from "./section.js";
import { slotHTML, mountSlot } from "./slot.js";

const app = document.getElementById("app");
const $ = (s, r = document) => r.querySelector(s);
/* כל משפט בשורה חדשה: ירידת שורה אחרי נקודה בסוף משפט (לא אחרי ראשי תיבות לטיניים) */
const brk = s => s.replace(/(?<![A-Z])([.!?])\s+(?=[\u0590-\u05FF"״(<])/g, "$1<br>");
const md = s => brk(String(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>"));
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
function page({ role, kicker, title, sub, meta, right, focus, left, pager }) {
  const R = ROLES[role];
  app.innerHTML = `<div class="page${pager ? " has-pager" : ""}">
    <header class="lens"><div><div class="kicker">${R ? `<span class="role">${R.step}</span>` : ""}${kicker}</div><h1>${title}</h1>${sub ? `<p class="sub">${sub}</p>` : ""}</div>${meta ? `<div class="meta">${meta}</div>` : ""}</header>
    <div class="frame">
      <aside class="pane side pr" aria-label="הקשר">${right}</aside>
      <section class="pane focus pf" aria-label="מוקד">${focus}</section>
      <aside class="pane side pl" aria-label="הפקה">${left}</aside>
    </div>${pager ? `<nav class="pager" aria-label="ניווט ברצף"><a class="btn" href="${pager.prev}">הקודם</a><span class="pg">${pager.label}</span><a class="btn" href="${pager.next}">הבא</a></nav>` : ""}</div>`;
  cleanups.push(mountSlot(app, toast));
}
const ph = (a, b = "") => `<div class="ph"><span>${a}</span><span>${b}</span></div>`;
const why = t => `<p class="why">${md(t)}</p>`;

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
  return `<div class="bridge fix-b${on ? " on" : ""}" style="--c:${c.color}">
    <span class="to">${a.lens} · ${a.name} · ${b.exact ? "פריט מדויק" : "הפריט הקרוב ביותר"}</span>
    <span class="item">${b.item}</span>
    <p class="ans">${md(b.answer)}</p>
    <a class="btn" href="${bridgeUrl(b, c)}" target="_blank" rel="noopener">לפריט באפליקציה</a>
    ${b.upgrade ? `<p class="up">שדרוג מוצע שם: ${b.upgrade}</p>` : ""}
  </div>`;
}

/* ===== דף הבית ===== */
function home() {
  const steps = [
    ["clients", CLIENTS.length, "לקוחות בחתך חי", "מה הלקוח צריך, ומה הוא נותן לבניין.", "#/client/river"],
    ["lab", MOVES * GRADIENT.length, "צירופים במעבדה", "לקוח, רכיב ודרגה: רעיון שעוד לא נוסה.", "#/lab"],
    ["brief", MOVES, "מהלכי תכנון", "עמוד אחד לוועדה, עם דוגמה מאשדוד.", "#/brief"],
    ["timeline", TIMELINE.length, "אבני דרך", "רעיון, חוק ובניין: שלושה מסלולים.", "#/timeline"],
    ["network", Object.keys(BRIDGES).length, "גשרים", "המשך החקירה, לפריט המדויק באפליקציה אחרת.", "#/network"],
    ["essays", DISC.length, "מאמרים", "מה גילינו כאן: מאמר לכל לקוח.", "#/essays"],
    ["articles", ARTICLES.length, "כתבות", "השראה מהפרק, לחשיבה נוספת.", "#/articles"],
  ];
  page({
    kicker: "ארק ובינה · החזון",
    title: "<b>הלקוח השתנה.</b> האדריכלות מתכננת גם לנהר, לאצה, לתולעת ולזרע.",
    sub: `הפרק <b>${SOURCE.chapter}</b> של designboom הופך כאן לכלי עבודה: <mark>הבנה, גילוי, יישום וסיכום</mark>, לכל לקוח חדש.`,
    right: ph("המסלול", "7 דפים, 7 תפקידים") + steps.map(([r, n, u, p, href]) => `<a class="step" href="${href}"><span class="n">${n}</span><span><h3>${ROLES[r].step}: ${u}</h3><p>${p}</p></span></a>`).join(""),
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
    pager: { prev: `#/client/${nextOf(CLIENTS, i, -1).id}`, next: `#/client/${nextOf(CLIENTS, i, 1).id}`, label: `לקוח ${i + 1} מתוך ${CLIENTS.length}` },
    title: `<b>${c.insight}</b>`,
    sub: c.mechanism,
    meta: `צריך: ${c.need}<br>נותן: ${c.gives}`,
    right: ph("הלקוחות") + clientStack(c.id, x => `#/client/${x.id}`)
      + `<div class="card fix-l"><span class="lbl">ידע</span><p class="fact">${md(c.fact)}</p><div class="src">${c.source}</div></div>
         <div class="card fix-m"><span class="lbl">תקדים</span><p class="fact">${md(c.precedent)}</p></div>`,
    focus: ph("המנגנון בחתך", c.ashdod.site) + sectionSVG(c)
      + `<div class="two"><div class="card fix-xl" style="--c:${c.color}"><span class="lbl">ארבעה מהלכי תכנון</span><div class="moves">${ELEMENTS.map(e => `<div class="move"><span class="el">${e.name}</span><span>${c.moves[e.id]}</span></div>`).join("")}</div></div>
         <div class="stack" style="align-content:start;gap:12px"><div class="ashdod fix-m"><span class="lbl">דוגמה מהעיר</span><h3>${c.ashdod.site}</h3><p style="margin-top:6px">${md(c.ashdod.line)}</p></div>
         <div class="card flashcard fix-s"><span class="lbl">ההברקה</span><p><mark>${FLASH[c.id]}</mark></p></div></div></div>`,
    left: ph("תמונה") + slotHTML(`img:${c.id}:facade`, buildPrompt(c, "facade", .75), c.name, { mid: true })
      + `<div class="stack"><a class="btn primary" href="#/article/d-${c.id}">המאמר</a><a class="btn" href="#/lab?c=${c.id}">למעבדה</a><a class="btn" href="#/brief?c=${c.id}&e=ground&g=0.75">תדריך</a>${arts.map(a => `<a class="btn" href="#/article/${a.id}"><span>כתבה: ${a.title}</span></a>`).join("")}</div>`
      + ph("המשך החקירה") + `<p class="why">${md(c.question)}</p>` + bridgesOf(c).map(k => bridgeCard(c, k)).join(""),
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
    pager: { prev: h({ c: nextOf(CLIENTS, CLIENTS.indexOf(c), -1).id }), next: h({ c: nextOf(CLIENTS, CLIENTS.indexOf(c), 1).id }), label: `${c.name} · ${e.name}` },
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
      + `<div class="stack"><a class="btn primary" href="#/brief?c=${c.id}&e=${e.id}&g=${L.v}">תדריך מהגילוי</a><a class="btn" href="#/article/d-${c.id}">המאמר</a></div>`
      + ph("המשך החקירה") + bridgeCard(c, bridgesOf(c)[0]),
  });
}

/* ===== גיליון A4: עמוד אחד מלא, בלי חיתוך. מתכווץ עד שהכול נכנס, ומוצג בקנה מידה של המסך ===== */
const a4 = (inner, c, extra = "") => `<div class="a4wrap"><article class="sheet a4 ${extra}" ${c ? `style="--c:${c.color}"` : ""}>${inner}</article></div>`;
function fitA4() {
  const wrap = app.querySelector(".a4wrap"), sheet = wrap?.querySelector(".sheet");
  if (!sheet) return;
  /* העמוד מלא: הגודל הגדול ביותר שעדיין נכנס בעמוד אחד (חיפוש בינארי בין 0.6 ל-1.7) */
  const fits = k => { sheet.style.setProperty("--k", k.toFixed(3)); return sheet.scrollHeight <= sheet.clientHeight + 1; };
  let lo = 0.6, hi = 1.7;
  if (fits(hi)) lo = hi; else { for (let i = 0; i < 12; i++) { const m = (lo + hi) / 2; if (fits(m)) lo = m; else hi = m; } }
  fits(lo);
  sheet.dataset.fit = fits(lo) ? "ok" : "over";
  sheet.dataset.k = lo.toFixed(2);
  const place = () => {
    const r = wrap.getBoundingClientRect();
    const s = Math.min(1, r.width / 794, (r.height || 1123) / 1123);
    sheet.style.transform = `translateX(50%) scale(${s.toFixed(3)})`;
    wrap.style.setProperty("--s", s);
  };
  place();
  const ro = new ResizeObserver(place); ro.observe(wrap); cleanups.push(() => ro.disconnect());
}
const nextOf = (arr, i, d) => arr[(i + d + arr.length) % arr.length];

/* ===== תדריך: יישום. המוקד הוא הגיליון, והמהלך הנבחר בראשו ===== */
let prevBrief = null;
function brief(params) {
  const s = readState(params, { c: "river", e: "ground", g: .75 });
  const c = byId(s.c), e = ELEMENTS.find(x => x.id === s.e), L = level(s.g);
  const hh = o => `#/brief?c=${o.c ?? s.c}&e=${o.e ?? s.e}&g=${o.g ?? s.g}`;
  const ci = CLIENTS.indexOf(c);
  const ch = prevBrief ? { c: prevBrief.c !== s.c, e: prevBrief.e !== s.e, g: prevBrief.g !== s.g } : {};
  prevBrief = s;
  page({
    role: "brief",
    kicker: ` · ${c.ashdod.site}`,
    title: `תדריך לכל מגרש: <b>שני לקוחות</b>, האדם וה<b style="color:${c.color}">${c.name}</b>`,
    sub: "בוחרים לקוח, רכיב ודרגה. מה שהשתנה מהבהב בצבע של הלקוח.",
    pager: { prev: hh({ c: nextOf(CLIENTS, ci, -1).id }), next: hh({ c: nextOf(CLIENTS, ci, 1).id }), label: `לקוח ${ci + 1} מתוך ${CLIENTS.length}` },
    right: ph("לקוח") + clientStack(c.id, x => hh({ c: x.id })) + ph("רכיב", "איפה בבניין") + elementLine(e.id, x => hh({ e: x.id })) + ph("דרגה", "כמה נותנים") + gradLine(L.v, x => hh({ g: x.v })),
    focus: a4(`
      <div class="runhead"><span>תדריך תכנון · ארק ובינה</span><span>${c.ashdod.site}</span></div>
      <h1 class="${ch.c ? "flash" : ""}">${c.ashdod.site}<small>שני לקוחות: האדם וה${c.name}</small></h1>
      <p class="deck">${md(c.ashdod.line)}</p>
      <div class="chosen ${ch.c || ch.e || ch.g ? "flash" : ""}"><span class="lbl">המהלך הנבחר · ${e.name} · דרגה ${L.v}, ${L.name}</span><p class="big"><mark>${c.moves[e.id]}</mark></p><p class="small">${TENSION[e.id]}<br>ה${c.name} צריך ${c.need}.</p></div>
      <div class="cols">
        <div>
          <h2>ארבעה מהלכי תכנון</h2>
          <div class="moves ${ch.c || ch.e ? "flash" : ""}">${ELEMENTS.map(x => `<div class="move${x.id === e.id ? " picked" : ""}"><span class="el">${x.name}</span><span>${c.moves[x.id]}</span></div>`).join("")}</div>
          <h2>מי מבקש מה</h2>
          <table class="tbl ${ch.c ? "flash" : ""}"><thead><tr><th>לקוח</th><th>צריך</th><th>נותן</th></tr></thead><tbody>
            <tr><td><b>האדם</b></td><td>${TENSION[e.id].replace("האדם רוצה ", "")}</td><td>שימוש, ערך, חיים עירוניים</td></tr>
            <tr><td><b class="cc">ה${c.name}</b></td><td>${c.need}</td><td>${c.gives}</td></tr></tbody></table>
        </div>
        <div>
          <figure class="mirror">${sectionSVG(c)}<figcaption>${md(c.mechanism)}</figcaption></figure>
          <div class="goal ${ch.g ? "flash" : ""}"><h2>היעד: ${L.v}, ${L.name}</h2><p>${md(L.line)}</p><div class="gradscale"><i style="inset-inline-start:${L.v * 100}%"></i></div></div>
        </div>
      </div>
      <div class="cols tail"><div><h2>ידע</h2><p>${md(c.fact)}</p><p class="src">${c.source}</p></div><div><h2>שאלת מחקר</h2><p>${c.question}</p><p class="haiku">${c.haiku.join("<br>")}</p></div></div>
      <div class="foot"><span>מקור הרעיון: ${SOURCE.chapter}, ${SOURCE.publisher}</span><span>${new Date().toLocaleDateString("he-IL")}</span></div>`, c, "brief"),
    left: ph("הפקה") + `<div class="stack"><button class="btn primary" data-print>הדפסה ושמירה כקובץ</button></div>`
      + ph("תמונה לתדריך", "נכנסת לגיליון") + slotHTML(`img:${c.id}:${e.id}`, buildPrompt(c, e.id, L.v), c.name, { compact: true }),
  });
  mirrorImage();
  fitA4();
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
    m.className = "m";
    fig.prepend(m);
    fitA4();
  };
  const mo = new MutationObserver(sync); mo.observe(frame, { childList: true }); cleanups.push(() => mo.disconnect());
}

/* ===== מאמרים (סיכום) וכתבות (השראה): בסוף הסרגל ===== */
const MEANING = {
  essays: `<div class="card meaning"><b>מאמר: מה גילינו כאן.</b><p>${md("נכתב מתוך התוכן של האפליקציה: המנגנון, הקונפליקט, ארבעה מהלכים, אשדוד וההברקה. מאמר לכל לקוח.")}</p></div>`,
  articles: `<div class="card meaning"><b>כתבה: מה אחרים כבר עשו.</b><p>${md("מתוך הפרק של designboom. השראה לחשיבה נוספת, ולא מסקנה. כל כתבה מובילה למאמר אצלנו.")}</p></div>`,
};
function essayList(activeId) {
  return MEANING.essays + `<div class="stack">${DISC.map(d => `<a class="opt" style="--c:${d.c.color}" href="#/article/${d.id}" ${d.id === activeId ? 'aria-current="page"' : ""}><i class="sw"></i><span>${d.c.name}</span></a>`).join("")}</div>`;
}
function articleList(activeId) {
  return MEANING.articles + `<div class="stack">${ARTICLES.map(x => `<a class="opt" href="#/article/${x.id}" ${x.id === activeId ? 'aria-current="page"' : ""}><small class="num">${x.n}</small><span>${x.title}</span></a>`).join("")}</div>`;
}
function article(id) {
  const d = DISC.find(x => x.id === id);
  if (d) return discovery(d);
  const a = ARTICLES.find(x => x.id === id) || ARTICLES[0];
  const ai = ARTICLES.indexOf(a);
  const c = byId(a.client);
  const post = `${a.title}\n${a.deck}\n\n${a.lead.replace(/<[^>]+>/g, "").replace(/\*\*/g, "")}\n\nתובנה: ${a.insight}\n\n${a.haiku.join("\n")}\n\nמקור: designboom, ${SOURCE.chapter}\n${a.url}`;
  page({
    role: "articles",
    kicker: ` · כתבה ${a.n} מתוך ${ARTICLES.length} · ${a.section}`,
    title: `כתבות: <b>השראה לחשיבה נוספת</b>`,
    sub: `מה אחרים כבר בנו וחשבו, מתוך הפרק ${SOURCE.chapter}.`,
    meta: `${a.who.he}<br>${a.date}`,
    pager: { prev: `#/article/${nextOf(ARTICLES, ai, -1).id}`, next: `#/article/${nextOf(ARTICLES, ai, 1).id}`, label: `כתבה ${ai + 1} מתוך ${ARTICLES.length}` },
    right: articleList(a.id),
    focus: a4(`
      <div class="runhead"><span>כתבה · השראה · ${a.section}</span><span>designboom · ${SOURCE.chapter}</span></div>
      <h1>${a.title}</h1><p class="deck">${a.deck}</p>
      <p class="lead">${md(a.lead)}</p>
      <div class="cols">
        <div>${a.body.map(s => `<h2>${s.h}</h2>${s.p.map(p => `<p>${md(p)}</p>`).join("")}`).join("")}
          ${a.pull ? `<div class="pull"><p class="he">"${a.pull.he}"</p>${a.pull.en ? `<p class="en">"${a.pull.en}"</p>` : ""}<p class="by">${a.pull.by}</p></div>` : ""}
          <h2>מה זה אומר לתכנון</h2><p>${md(a.apply)}</p>
        </div>
        <div>
          <figure class="mirror"><div class="ph-img">מקום לתמונה</div><figcaption>${a.who.he}, ${a.who.role}. ${a.who.place}.</figcaption></figure>
          <div class="box"><h3>${a.box.h}</h3>${a.box.items.map(t => `<p>${t}</p>`).join("")}</div>
          <p class="ins"><span class="insight">${a.insight}</span></p>
          <p class="haiku">${a.haiku.join("<br>")}</p>
        </div>
      </div>
      <div class="foot"><span>מקור: designboom, ${SOURCE.publisher}</span><span>ארק ובינה · כתבה ${a.n}</span></div>`, null, "art"),
    left: ph("הפקה לפרסום") + `<div class="stack">
        <button class="btn primary" data-print>הדפסה ושמירה כקובץ</button>
        <button class="btn" data-copy="${encodeURIComponent(post)}" data-msg="טקסט הפוסט הועתק">העתקת טקסט לפוסט</button>
        <a class="btn" href="${a.url}" target="_blank" rel="noopener">הכתבה המקורית</a></div>`
      + ph("תמונה לכתבה", "נכנסת לגיליון") + slotHTML(`article:${a.id}`, articlePrompt(a), a.title, { compact: true })
      + (c ? ph("מההשראה למאמר") + `<div class="stack"><a class="btn primary" href="#/article/d-${c.id}">המאמר: ${c.name}</a><a class="btn" href="#/lab?c=${c.id}">המעבדה: ${c.name}</a></div>` : "")
      + `<div class="card fix-s"><span class="lbl">לבדיקה לפני פרסום</span><p>${md(a.check)}</p></div>`,
  });
  mirrorImage();
  fitA4();
}
function discovery(d) {
  const c = d.c, di = DISC.indexOf(d);
  const insp = ARTICLES.filter(a => a.client === c.id);
  const post = `${c.insight}\n\nההברקה: ${FLASH[c.id]}\n\n${c.mechanism}\n\n${c.haiku.join("\n")}\n\nארק ובינה: ${BACK}/#/article/${d.id}`;
  page({
    role: "essays",
    kicker: ` · מאמר ${d.n} מתוך ${DISC.length} · ${c.name}`,
    title: `מאמרים: <b>מה גילינו כאן</b>`,
    sub: "מאמר לכל לקוח, מתוך התוכן של האפליקציה, עם ההברקה התכנונית.",
    meta: c.ashdod.site,
    pager: { prev: `#/article/${nextOf(DISC, di, -1).id}`, next: `#/article/${nextOf(DISC, di, 1).id}`, label: `מאמר ${di + 1} מתוך ${DISC.length}` },
    right: essayList(d.id),
    focus: a4(`
      <div class="runhead"><span>מאמר ${d.n} · ${c.name}</span><span>ארק ובינה · מה גילינו</span></div>
      <h1>${c.insight}</h1>
      <div class="chosen"><span class="lbl">ההברקה · רעיון תכנוני, לא עובדה</span><p class="big"><mark>${FLASH[c.id]}</mark></p></div>
      <p class="lead">${md(c.fact)}</p>
      <div class="cols">
        <div>
          <h2>המנגנון</h2><p>${md(c.mechanism)}</p><p>${md(c.precedent)}</p>
          <h2>הקונפליקט</h2><p>${TENSION.ground}<br>ה${c.name} צריך ${c.need}.</p>
          <h2>ארבעה מהלכים</h2><div class="moves">${ELEMENTS.map(x => `<div class="move"><span class="el">${x.name}</span><span>${c.moves[x.id]}</span></div>`).join("")}</div>
        </div>
        <div>
          <figure class="mirror">${sectionSVG(c)}<figcaption>המנגנון בחתך.</figcaption></figure>
          <div class="box"><h3>באשדוד: ${c.ashdod.site}</h3><p>${md(c.ashdod.line)}</p></div>
          <div class="box"><h3>מה ה${c.name} נותן לעיר</h3><p>${c.gives}</p></div>
          <p class="haiku">${c.haiku.join("<br>")}</p>
        </div>
      </div>
      <div class="foot"><span>${c.source}</span><span>${insp.length ? `השראה: ${insp.map(a => a.title).join(", ")}` : "ארק ובינה"}</span></div>`, c, "essay"),
    left: ph("הפקה לפרסום") + `<div class="stack">
        <button class="btn primary" data-print>הדפסה ושמירה כקובץ</button>
        <button class="btn" data-copy="${encodeURIComponent(post)}" data-msg="טקסט הפוסט הועתק">העתקת טקסט לפוסט</button></div>`
      + ph("תמונה למאמר", "נכנסת לגיליון") + slotHTML(`img:${c.id}:facade`, buildPrompt(c, "facade", .75), c.name, { compact: true })
      + ph("מהמאמר למעבדה", "ארבעה צירופים") + `<div class="line">${ELEMENTS.map(x => `<a class="btn" href="#/lab?c=${c.id}&e=${x.id}&g=0.75">${x.name}</a>`).join("")}</div>`
      + (insp.length ? ph("כתבות השראה") + `<div class="stack">${insp.map(a => `<a class="btn" href="#/article/${a.id}"><span>${a.title}</span></a>`).join("")}</div>` : ""),
  });
  mirrorImage();
  fitA4();
}

/* ===== מרעיון לחוק: הקשר. פס שנים שנגלל, ושלושה מסלולים ===== */
function timeline(params) {
  const sel = Math.min(TIMELINE.length - 1, Math.max(0, +(params.get("i") ?? TIMELINE.findIndex(t => t.y === 2017))));
  const t = TIMELINE[sel];
  const count = k => TIMELINE.filter(x => x.lane === k).length;
  const first = k => TIMELINE.find(x => x.lane === k && (k !== "law" || x.y > 2005)).y;
  page({
    role: "timeline",
    kicker: ` · ${TIMELINE[0].y} עד ${TIMELINE.at(-1).y}`,
    title: "<b>הרעיון הגיע ראשון</b>, החוק אחריו, והבניין רק עכשיו.",
    sub: `זכויות הטבע נכנסו לחוק מ-<b>${first("law")}</b>.<br>בניינים שמשרתים לקוח לא־אנושי מופיעים מ-<b>${first("built")}</b>.`,
    meta: `${TIMELINE.length} אבני דרך`,
    pager: { prev: `#/timeline?i=${Math.max(0, sel - 1)}`, next: `#/timeline?i=${Math.min(TIMELINE.length - 1, sel + 1)}`, label: `${t.y} · ${sel + 1} מתוך ${TIMELINE.length}` },
    right: ph("שלושה מסלולים") + Object.entries(LANES).map(([k, L]) => `<div class="lanecard" style="--c:${L.color}"><span class="n">${count(k)}</span><span><b>${L.name}</b><small>${{ idea: "ספר, מאמר, ועידה", law: "חוק, חוקה, מדיניות", built: "מבנה שנבנה" }[k]}</small></span></div>`).join("")
      + why("גוללים את פס השנים בגלגלת או בגרירה. לחיצה על אבן דרך פותחת אותה משמאל."),
    focus: `<div class="strip-wrap"><div class="strip-lanes">${Object.values(LANES).map(L => `<span style="color:${L.color}">${L.name}</span>`).join("")}</div>
      <div class="strip" tabindex="0" aria-label="פס השנים">${TIMELINE.map((x, i) => `<a class="col${i === sel ? " on" : ""}" href="#/timeline?i=${i}" style="--c:${LANES[x.lane].color}">
        <span class="yr">${x.y}</span>${["idea", "law", "built"].map(k => `<span class="lanecell">${x.lane === k ? `<span class="tcard"><b>${x.t.split(" (")[0]}</b><small>${x.d}</small></span>` : ""}</span>`).join("")}</a>`).join("")}
        <a class="col next" href="#/lab"><span class="yr">?</span><span class="lanecell"></span><span class="lanecell"></span><span class="lanecell"><span class="tcard"><b>הבניין הבא שלך</b><small>למעבדה</small></span></span></a>
      </div></div>`,
    left: ph("אבן הדרך", LANES[t.lane].name) + `<div class="card tdetail fix-l" style="--c:${LANES[t.lane].color}"><span class="ty">${t.y}</span><h3>${t.t}</h3><p>${md(t.d)}</p></div>`
      + `<div class="card fix-m"><span class="lbl">מה זה אומר לנו · פרשנות</span><p><mark>${t.so}</mark></p></div>`
      + ph("הצעד הבא") + `<div class="stack"><a class="btn primary" href="#/lab">מי הלקוח של 2026? למעבדה</a><a class="btn" href="#/article/planet-in-the-room">כתבת הפתיחה של הפרק</a></div>`,
  });
  const strip = app.querySelector(".strip");
  strip.querySelector(".col.on")?.scrollIntoView({ inline: "center", block: "nearest" });
  strip.addEventListener("wheel", e => { if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { strip.scrollLeft -= e.deltaY; e.preventDefault(); } }, { passive: false });
  let drag = null;
  strip.addEventListener("pointerdown", e => { drag = { x: e.clientX, l: strip.scrollLeft, moved: false }; });
  strip.addEventListener("pointermove", e => { if (!drag) return; const dx = e.clientX - drag.x; if (Math.abs(dx) > 4) { drag.moved = true; strip.scrollLeft = drag.l - dx; } });
  addEventListener("pointerup", () => setTimeout(() => { drag = null; }, 0), { once: true });
  strip.addEventListener("click", e => { if (drag?.moved) e.preventDefault(); }, true);
}

/* ===== הרשת: המשך. אפליקציות בשורות, לקוחות בעמודות ===== */
function network(params) {
  const keys = appsUsed();
  const selC = byId(params.get("c")) || CLIENTS[0];
  const selA = keys.includes(params.get("a")) ? params.get("a") : bridgesOf(selC)[0];
  const exact = Object.values(BRIDGES).filter(b => b.exact).length;
  page({
    role: "network",
    pager: { prev: `#/network?c=${nextOf(CLIENTS, CLIENTS.indexOf(selC), -1).id}`, next: `#/network?c=${nextOf(CLIENTS, CLIENTS.indexOf(selC), 1).id}`, label: selC.name },
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
  const cur = r === "article" ? (String(id).startsWith("d-") ? "essays" : "articles") : ({ client: "clients" }[r] || r);
  document.querySelectorAll("#mainnav a").forEach(a => a.dataset.r === cur ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current"));
  ({
    clients: () => client("river"), client: () => client(id), lab: () => lab(params), brief: () => brief(params),
    articles: () => article(params.get("s") === "d" ? DISC[0].id : ARTICLES[0].id), essays: () => article(DISC[0].id), article: () => article(id),
    timeline: () => timeline(params), network: () => network(params),
  }[r] || home)();
  const dn = DISC.find(d => d.id === id);
  const title = { clients: "הלקוחות", client: byId(id)?.name, lab: "מעבדת גילויים", brief: "תדריך", articles: "כתבות", essays: "מאמרים", article: dn ? `מאמר: ${dn.c.name}` : ARTICLES.find(a => a.id === id)?.title, timeline: "מרעיון לחוק", network: "הרשת" }[r];
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
