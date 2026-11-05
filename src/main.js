import "./styles.css";
import { CLIENTS, ELEMENTS, GRADIENT, APPS, TIMELINE, SOURCE, BRIDGES } from "./data.js";
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

function toast(t) { const el = $("#toast"); el.textContent = t; el.classList.add("on"); clearTimeout(toast.h); toast.h = setTimeout(() => el.classList.remove("on"), 2200); }
async function copy(text, msg = "הועתק") { try { await navigator.clipboard.writeText(text); toast(msg); } catch { toast("ההעתקה נחסמה בדפדפן"); } }

/* ===== המסגרת הקבועה: עדשה, ושלושה טורים: הקשר, מוקד, הפקה ===== */
let cleanups = [];
function page({ kicker, title, sub, meta, right, focus, left }) {
  app.innerHTML = `<div class="page">
    <header class="lens enter"><div><div class="kicker">${kicker}</div><h1>${title}</h1>${sub ? `<p class="sub">${sub}</p>` : ""}</div>${meta ? `<div class="meta">${meta}</div>` : ""}</header>
    <div class="frame">
      <aside class="pane side" aria-label="הקשר">${right}</aside>
      <section class="pane focus" aria-label="מוקד">${focus}</section>
      <aside class="pane side" aria-label="הפקה">${left}</aside>
    </div></div>`;
  cleanups.push(mountSlot(app, toast));
}
const ph = (a, b = "") => `<div class="ph"><span>${a}</span><span>${b}</span></div>`;

/* בוררים: קטגוריה בעמודה אחת או בשורה אחת, כפתורים באותו גובה */
const clientStack = (active, href) => `<div class="stack">${CLIENTS.map(c =>
  `<a class="opt" style="--c:${c.color}" href="${href(c)}" ${c.id === active ? 'aria-current="page"' : ""}><i class="sw"></i><span>${c.name}</span><small>${c.latin}</small></a>`).join("")}</div>`;
const elementLine = (active, href) => `<div class="line">${ELEMENTS.map(e =>
  `<a class="opt" href="${href(e)}" ${e.id === active ? 'aria-current="page"' : ""}><span>${e.name}</span></a>`).join("")}</div>`;
const gradLine = (active, href) => `<div class="line">${GRADIENT.map(L =>
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
function bridgeCard(c, key) {
  const b = BRIDGES[`${c.id}:${key}`], a = APPS[key];
  if (!b) return "";
  return `<div class="bridge" style="--c:${c.color}">
    <span class="to">${a.lens} · ${a.name} · ${b.exact ? "פריט מדויק" : "הפריט הקרוב ביותר"}</span>
    <span class="item">${b.item}</span>
    <p>${b.answer}</p>
    <a class="btn" href="${bridgeUrl(b, c)}" target="_blank" rel="noopener">פתיחה ב${a.name.split(/[:(]/)[0].trim()}</a>
    ${b.upgrade ? `<p class="up">שדרוג מוצע שם: ${b.upgrade}</p>` : ""}
  </div>`;
}

/* ===== דף הבית ===== */
function home() {
  page({
    kicker: "ARC &amp; בינה · החזון",
    title: "<b>הלקוח השתנה.</b> האדריכלות מתכננת גם לנהר, לאצה, לתולעת ולזרע.",
    sub: `הפרק <b>${SOURCE.chapter}</b> של designboom הופך כאן לכלי עבודה: <mark>ידע, הבנה, יישום וגילוי</mark>, לכל לקוח חדש.`,
    meta: `${CLIENTS.length} לקוחות · ${ARTICLES.length} כתבות<br>${MOVES} מהלכי תכנון`,
    right: ph("המסלול", "5 צעדים") + [
      ["ידע", ARTICLES.length, "כתבות מהפרק", "עשר כתבות מעוצבות, מוכנות לפרסום.", "#/articles"],
      ["הבנה", CLIENTS.length, "לקוחות בחתך חי", "מה הלקוח צריך, ומה הוא נותן לבניין.", "#/client/river"],
      ["יישום", MOVES, "מהלכי תכנון", "גג, חזית, קרקע ורחוב, עם דוגמה מאשדוד.", "#/brief"],
      ["גילוי", MOVES * GRADIENT.length, "צירופים במעבדה", "לקוח, רכיב ודרגה: רעיון, תמונה ותדריך.", "#/lab"],
      ["רשת", Object.keys(BRIDGES).length, "גשרים לאפליקציות", "כל לקוח ממשיך לפריט מדויק באפליקציה אחרת.", "#/network"],
    ].map(([h, n, u, p, href]) => `<a class="step" href="${href}"><span class="n">${n}</span><span><h3>${h}: ${u}</h3><p>${p}</p></span></a>`).join(""),
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

/* ===== עמוד לקוח ===== */
function client(id) {
  const c = byId(id) || CLIENTS[0];
  const i = CLIENTS.indexOf(c);
  const arts = ARTICLES.filter(a => a.client === c.id);
  page({
    kicker: `לקוח ${String(i + 1).padStart(2, "0")} · ${c.name} · ${c.latin}`,
    title: `<b>${c.insight}</b>`,
    sub: c.mechanism,
    meta: `צריך: ${c.need}<br>נותן: ${c.gives}`,
    right: ph("הלקוחות", `${i + 1} / ${CLIENTS.length}`) + clientStack(c.id, x => `#/client/${x.id}`)
      + `<div class="card"><span class="lbl">ידע</span><p class="fact">${md(c.fact)}</p><div class="src">${c.source}</div></div>
         <div class="card"><span class="lbl">תקדים</span><p class="fact">${md(c.precedent)}</p></div>`,
    focus: ph("הבנה: המנגנון בחתך", c.ashdod.site) + sectionSVG(c)
      + `<div class="two"><div class="card" style="--c:${c.color}"><span class="lbl">יישום: ארבעה מהלכים</span><div class="moves">${ELEMENTS.map(e => `<div class="move"><span class="el">${e.name}</span><span>${c.moves[e.id]}</span></div>`).join("")}</div></div>
         <div class="stack" style="align-content:start;gap:12px"><div class="ashdod"><span class="lbl">דוגמה מהעיר</span><h3>${c.ashdod.site}</h3><span class="lbl">${c.ashdod.nameEn}</span><p style="margin-top:6px">${c.ashdod.line}</p></div>
         <div class="card"><span class="lbl">הייקו</span><p class="haiku">${c.haiku.join("<br>")}</p></div></div></div>`,
    left: ph("הפקה: תמונה") + slotHTML(`img:${c.id}:facade`, buildPrompt(c, "facade", .75), c.name)
      + `<div class="stack"><a class="btn primary" href="#/brief?c=${c.id}&e=ground&g=0.75">תדריך A4</a><a class="btn" href="#/lab?c=${c.id}">למעבדה</a>${arts.map(a => `<a class="btn" href="#/article/${a.id}"><span>כתבה: ${a.title}</span></a>`).join("")}</div>`
      + ph("המשך החקירה") + `<div class="card"><span class="lbl">שאלת מחקר</span><p style="font-weight:500">${c.question}</p></div>` + bridgeCard(c, c.app) + bridgeCard(c, c.app2),
  });
}

/* ===== מעבדת גילויים ===== */
const TENSION = { roof: "האדם רוצה מערכות, שמש ונוף על הגג.", facade: "האדם רוצה אור, נוף ובידוד בחזית.", ground: "האדם רוצה חניה וזכויות בנייה במגרש.", street: "האדם רוצה תנועה מהירה ובטוחה ברחוב." };
function readState(params, def) {
  return { c: byId(params.get("c"))?.id || def.c, e: ELEMENTS.find(x => x.id === params.get("e"))?.id || def.e, g: level(+(params.get("g") ?? def.g)).v };
}
const pickers = (s, base) => {
  const h = o => `#/${base}?c=${o.c ?? s.c}&e=${o.e ?? s.e}&g=${o.g ?? s.g}`;
  return ph("לקוח") + clientStack(s.c, c => h({ c: c.id })) + ph("רכיב") + elementLine(s.e, e => h({ e: e.id })) + ph("דרגה על הגרדיאנט") + gradLine(s.g, L => h({ g: L.v }));
};
function lab(params) {
  const s = readState(params, { c: "river", e: "roof", g: .5 });
  const c = byId(s.c), e = ELEMENTS.find(x => x.id === s.e), L = level(s.g);
  const other = CLIENTS.filter(x => x.id !== c.id)[(CLIENTS.indexOf(c) + ELEMENTS.indexOf(e)) % (CLIENTS.length - 1)];
  const pick = a => a[Math.floor(Math.random() * a.length)];
  page({
    kicker: `מעבדת גילויים · ${MOVES * GRADIENT.length} צירופים`,
    title: `מה אם ה<b>${e.name}</b> היה עובד גם בשביל ה<b>${c.name}</b>?`,
    sub: `${L.name}: ${L.line}`,
    meta: `${c.name} × ${e.name} × ${L.v}`,
    right: pickers(s, "lab") + `<a class="btn primary" href="#/lab?c=${pick(CLIENTS).id}&e=${pick(ELEMENTS).id}&g=${pick(GRADIENT.slice(1)).v}">גילוי אקראי</a>`,
    focus: ph("הגילוי", c.ashdod.site) + sectionSVG(c) + `<div class="tri">
      <div class="p"><b>הקונפליקט</b>${TENSION[e.id]} ה${c.name} צריך ${c.need}.</div>
      <div class="s"><b>המהלך</b>${c.moves[e.id]}</div>
      <div class="i"><b>התובנה</b><mark>${c.insight}</mark></div>
      <div class="s" style="border-color:${other.color}"><b>צירוף נוסף: ${other.name}</b>${other.moves[e.id]}</div></div>`,
    left: ph("הפקה: תמונה") + slotHTML(`img:${c.id}:${e.id}`, buildPrompt(c, e.id, L.v), c.name)
      + `<div class="stack"><a class="btn primary" href="#/brief?c=${c.id}&e=${e.id}&g=${L.v}">תדריך A4 מהגילוי</a></div>`
      + ph("המשך החקירה") + bridgeCard(c, c.app),
  });
}

/* ===== תדריך A4 ===== */
function brief(params) {
  const s = readState(params, { c: "river", e: "ground", g: .75 });
  const c = byId(s.c), e = ELEMENTS.find(x => x.id === s.e), L = level(s.g);
  page({
    kicker: "תדריך תכנון · A4",
    title: `תדריך לכל מגרש: <b>שני לקוחות</b>, האדם והטבע`,
    sub: `בוחרים לקוח, רכיב ויעד על הגרדיאנט, ומקבלים עמוד אחד לוועדה, עם המהלך המודגש במרקר.`,
    meta: `${c.ashdod.nameEn}<br>יעד ${L.v} · ${L.name}`,
    right: pickers(s, "brief"),
    focus: `<article class="sheet" style="--c:${c.color}">
      <div class="runhead"><span>תדריך תכנון · ארק ובינה</span><span>${c.ashdod.nameEn}</span></div>
      <h1>${c.ashdod.site}</h1><p class="deck">${c.ashdod.line}</p>
      <div class="cols">
        <div><h2>היעד על הגרדיאנט: ${L.v}, ${L.name}</h2><p>${L.line}</p><div class="gradscale" style="margin:10px 0"></div><p>${md(c.fact)}</p><p class="src">${c.source}</p></div>
        <figure class="mirror">${sectionSVG(c)}<figcaption>המנגנון בחתך. ${c.mechanism}</figcaption></figure>
      </div>
      <h2>מי מבקש מה</h2>
      <table class="tbl"><thead><tr><th>לקוח</th><th>צריך</th><th>נותן לאתר</th></tr></thead><tbody>
        <tr><td><b>האדם</b></td><td>${TENSION[e.id].replace("האדם רוצה ", "")}</td><td>שימוש, ערך כלכלי, חיים עירוניים</td></tr>
        <tr><td><b style="color:${c.color}">ה${c.name}</b></td><td>${c.need}</td><td>${c.gives}</td></tr></tbody></table>
      <h2>ארבעה מהלכי תכנון</h2>
      <div class="moves">${ELEMENTS.map(x => `<div class="move"><span class="el" style="color:${c.color}">${x.name}</span><span>${x.id === e.id ? `<mark>${c.moves[x.id]}</mark>` : c.moves[x.id]}</span></div>`).join("")}</div>
      <div class="cols"><div><h2>שאלת מחקר</h2><p>${c.question}</p></div><div><h2>הייקו</h2><p class="haiku">${c.haiku.join("<br>")}</p></div></div>
      <div class="foot"><span>מקור הרעיון: ${SOURCE.chapter}, ${SOURCE.publisher}</span><span>${new Date().toLocaleDateString("he-IL")}</span></div>
    </article>`,
    left: ph("הפקה") + `<div class="stack"><button class="btn primary" data-print>הדפסה ושמירה כ-PDF</button></div>`
      + ph("תמונה לתדריך") + slotHTML(`img:${c.id}:${e.id}`, buildPrompt(c, e.id, L.v), c.name),
  });
  mirrorImage();
}

/* התמונה מהמסגרת נכנסת גם לגיליון, כדי שההדפסה תכלול אותה */
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

/* ===== כתבות ===== */
function article(id) {
  const a = ARTICLES.find(x => x.id === id) || ARTICLES[0];
  const c = byId(a.client);
  const post = `${a.title}\n${a.deck}\n\n${a.lead.replace(/<[^>]+>/g, "").replace(/\*\*/g, "")}\n\nתובנה: ${a.insight}\n\n${a.haiku.join("\n")}\n\nמקור: designboom, ${SOURCE.chapter}\n${a.url}`;
  page({
    kicker: `כתבה ${a.n} מתוך ${ARTICLES.length} · ${a.section}`,
    title: `כתבות מהפרק <b>${SOURCE.chapter}</b>`,
    sub: `עשר כתבות, כל אחת בעמוד אחד: כותרת, ציטוט, מספרים, <mark>תובנה</mark>, הייקו ותמונה. מוכנות להדפסה ולפוסט.`,
    meta: `${a.who.en}<br>${a.date}`,
    right: ph("הכתבות", `${ARTICLES.length}`) + `<div class="stack">${ARTICLES.map(x => `<a class="opt" href="#/article/${x.id}" ${x.id === a.id ? 'aria-current="page"' : ""}><small style="margin:0">${x.n}</small><span>${x.title}</span></a>`).join("")}</div>`,
    focus: `<article class="sheet">
      <div class="runhead"><span>כתבה · ${a.section} · ${a.date}</span><span>designboom · ${SOURCE.chapter}</span></div>
      <h1>${a.title}</h1><p class="deck">${a.deck}</p>
      <p class="lead">${md(a.lead)}</p>
      <div class="cols">
        <div>${a.body.map(s => `<h2>${s.h}</h2>${s.p.map(p => `<p>${md(p)}</p>`).join("")}`).join("")}
          ${a.pull ? `<div class="pull"><p class="he">"${a.pull.he}"</p>${a.pull.en ? `<p class="en">"${a.pull.en}"</p>` : ""}<p class="by">${a.pull.by}</p></div>` : ""}
          <h2>מה זה אומר לתכנון</h2><p>${a.apply}</p>
        </div>
        <div>
          <figure class="mirror"><div class="slot-frame" style="pointer-events:none;cursor:default" aria-hidden="true"><div class="how"><b>מקום לתמונה</b><ol><li>הפרומפט בכפתור, בטור השמאלי</li><li>התמונה או הסרטון מודבקים שם, ונכנסים לכאן</li></ol></div></div><figcaption>${a.who.he} (${a.who.en}), ${a.who.role}. ${a.who.place}.</figcaption></figure>
          <div class="box"><h3>${a.box.h}</h3>${a.box.items.map(t => `<p style="margin-top:4px">${t}</p>`).join("")}</div>
          <p style="margin-top:16px"><span class="insight">${a.insight}</span></p>
          <p class="haiku" style="margin-top:16px">${a.haiku.join("<br>")}</p>
        </div>
      </div>
      <div class="foot"><span>מקור: <a href="${a.url}" target="_blank" rel="noopener">designboom</a>, ${SOURCE.publisher}</span><span>ארק ובינה · ${a.n}</span></div>
    </article>`,
    left: ph("הפקה לפרסום") + `<div class="stack">
        <button class="btn primary" data-print>הדפסה ושמירה כ-PDF</button>
        <button class="btn" data-copy="${encodeURIComponent(post)}" data-msg="טקסט הפוסט הועתק">העתקת טקסט לפוסט</button>
        ${c ? `<a class="btn" href="#/client/${c.id}">הלקוח בכתבה: ${c.name}</a>` : ""}
        <a class="btn" href="${a.url}" target="_blank" rel="noopener">הכתבה המקורית</a></div>`
      + ph("תמונה לכתבה") + slotHTML(`article:${a.id}`, articlePrompt(a), a.title)
      + `<div class="card"><span class="lbl">לבדיקה לפני פרסום</span><p style="font-size:13.5px">${a.check}</p></div>`,
  });
  mirrorImage();
}

/* ===== מרעיון לחוק ===== */
function timeline() {
  page({
    kicker: "מרעיון לחוק · 1962 עד 2017",
    title: "בתוך <b>55 שנה</b>, רעיון הפך לחוק.",
    sub: "ספר, תמונה וועידה פתחו את הרשימה. מ-2008 הטבע מקבל זכויות בחוקה, במדיניות ובבית המשפט. <mark>הלקוח הבא נכנס דרך התכנון.</mark>",
    meta: `${TIMELINE.length} אבני דרך<br>${TIMELINE.filter(t => t.law).length} חוקים ומדיניות`,
    right: ph("ציטוטים מהפרק") + SOURCE.quotes.map(q => `<div class="quote"><p class="he">"${q.he}"</p>${q.en ? `<p class="en">"${q.en}"</p>` : ""}<p class="src">${q.by}</p></div>`).join(""),
    focus: ph("הרשימה המתארכת", "שחור: רעיון · ירוק: חוק") + `<div class="tlv">${TIMELINE.map((t, i) => `<div class="r ${t.law ? "law" : ""} enter" style="animation-delay:${i * 80}ms"><span class="y">${t.y}</span><span class="d"></span><span><span class="t">${t.t}</span><br><span class="x">${t.d}</span></span></div>`).join("")}
      <div class="r next"><span class="y">2026</span><span class="d"></span><span><span class="t">הלקוח הבא?</span><br><span class="x">הנהר, האצה, התולעת והזרע, בתוך תכנית בניין עיר.</span></span></div></div>`,
    left: ph("מקרא") + `<div class="legend"><span><i style="background:var(--ink)"></i>רעיון: ספר, תמונה, ועידה</span><span><i style="background:var(--law)"></i>הרעיון הפך לחוק</span></div>`
      + ph("הצעד הבא") + `<div class="stack"><a class="btn primary" href="#/lab">מי הלקוח של 2026? למעבדה</a><a class="btn" href="#/article/planet-in-the-room">כתבת הפתיחה של הפרק</a></div>`,
  });
}

/* ===== הרשת: מטריצה של לקוחות ואפליקציות ===== */
function network(params) {
  const sel = byId(params.get("c")) || CLIENTS[0];
  const keys = Object.keys(APPS).filter(k => CLIENTS.some(c => c.app === k || c.app2 === k));
  const exact = Object.values(BRIDGES).filter(b => b.exact).length;
  page({
    kicker: `הרשת · ${CLIENTS.length} לקוחות × ${keys.length} אפליקציות`,
    title: "כל לקוח <b>ממשיך לפריט מדויק</b> באפליקציה אחרת.",
    sub: "לא קישור לדף הבית: תשובה ספציפית כאן, הפריט המדויק שם, ושדרוג מוצע לאפליקציה השותפה.",
    meta: `${Object.keys(BRIDGES).length} גשרים<br>${exact} מדויקים · ${Object.keys(BRIDGES).length - exact} לשדרוג`,
    right: ph("לקוח") + clientStack(sel.id, c => `#/network?c=${c.id}`),
    focus: ph("מי ממשיך לאן", "כהה: ראשי · בהיר: משני") + `<div class="matrix"><table>
      <thead><tr><th></th>${keys.map(k => `<th>${APPS[k].name.split(/[:(]/)[0].trim()}<small>${APPS[k].lens}</small></th>`).join("")}</tr></thead>
      <tbody>${CLIENTS.map(c => `<tr><th class="rowh" style="color:${c.color}">${c.name}</th>${keys.map(k => {
        const kind = c.app === k ? "k1" : c.app2 === k ? "k2" : "";
        return `<td>${kind ? `<a class="cell ${kind}" style="--c:${c.color}" href="#/network?c=${c.id}" ${c.id === sel.id ? 'aria-pressed="true"' : ""} title="${c.name} אל ${APPS[k].name}" aria-label="${c.name} אל ${APPS[k].name}"></a>` : `<span class="dot0"></span>`}</td>`;
      }).join("")}</tr>`).join("")}</tbody></table></div>`
      + `<div class="card"><span class="lbl">איך הגשר עובד</span><p style="font-size:14px">כל קישור נושא את השאלה ואת הדרך חזרה. אפליקציה שותפה שמתקינה את <b>bridge.js</b> מציגה פס עליון: "הגעת מארק ובינה", עם השאלה וכפתור חזרה. הותקן כבר בביומימטיקה לאדריכלות.</p></div>`,
    left: ph(`המשך החקירה: ${sel.name}`) + `<div class="card"><span class="lbl">שאלת מחקר</span><p style="font-weight:500">${sel.question}</p></div>` + bridgeCard(sel, sel.app) + bridgeCard(sel, sel.app2),
  });
}

/* ===== ניתוב ===== */
function route() {
  cleanups.forEach(f => { try { f(); } catch { /* */ } }); cleanups = [];
  const h = location.hash.replace(/^#\/?/, "");
  const [path, qs] = h.split("?");
  const params = new URLSearchParams(qs || "");
  const [r, id] = path.split("/");
  const cur = { client: "clients", article: "articles" }[r] || r;
  document.querySelectorAll("#mainnav a").forEach(a => a.dataset.r === cur ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current"));
  ({ clients: () => client("river"), client: () => client(id), lab: () => lab(params), brief: () => brief(params), articles: () => article(ARTICLES[0].id), article: () => article(id), timeline, network: () => network(params) }[r] || home)();
  const title = { clients: "הלקוחות", client: byId(id)?.name, lab: "מעבדת גילויים", brief: "תדריך", articles: "כתבות", article: ARTICLES.find(a => a.id === id)?.title, timeline: "מרעיון לחוק", network: "הרשת" }[r];
  document.title = title ? `${title} · ארק ובינה` : "ארק ובינה: אדריכלות למהפכה הבאה";
  scrollTo(0, 0);
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
