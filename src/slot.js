/* מסגרת התמונה: הפרומפט בכפתור, והתמונה חוזרת לאותה מסגרת.
   הדבקה (Ctrl+V) בכל מקום בדף, גרירה, או בחירת קובץ. התמונות נשמרות משותפות לכל המכשירים
   (Supabase: דלי arcbina, טבלה arcbina_images, קריאה ציבורית והוספה בלבד).
   גם סרטון: MP4, WEBM או MOV, עד 50MB. סרטון מוצג בלולאה שקטה, עם פקדים. */
const SB = "https://ktqmwpbzcnzkhjskqisy.supabase.co";
const KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0cW13cGJ6Y256a2hqc2txaXN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxODM4OTgsImV4cCI6MjEwNTc1OTg5OH0.uPKn4hrLk16jhDoajMjPl4OmV5j1b3bMIECVmOdhWGI";
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };
const pub = path => `${SB}/storage/v1/object/public/arcbina/${path}`;
const safe = s => s.replace(/[^a-z0-9-]+/gi, "-").toLowerCase();

const IMG = /^image\/(png|jpeg|webp|gif)$/, VID = /^video\/(mp4|webm|quicktime)$/;
const isVideo = path => /\.(mp4|webm|mov)$/i.test(path);
const ACCEPT = "image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm,video/quicktime";

export function slotHTML(slot, p, title = "התמונה", opt = {}) {
  const cls = opt.compact ? " compact" : opt.mid ? " mid" : "";
  return `<div class="slot${cls}" data-slot="${slot}">
    <div class="slot-frame" tabindex="0" role="button" aria-label="מסגרת ${title}: הדבקה, גרירה או בחירת קובץ">
      <div class="how"><b>${opt.compact ? "הדבקה כאן" : "כאן מדביקים תמונה או סרטון"}</b>
        <ol><li>העתקת הפרומפט בכפתור למטה</li><li>יצירה במידג'רני: תמונה, או סרטון מהתמונה</li><li>חזרה לכאן: Ctrl+V לתמונה, גרירה או לחיצה על המסגרת לתמונה ולסרטון</li></ol>
      </div>
      <input type="file" accept="${ACCEPT}" hidden>
    </div>
    <div class="thumbs"></div>
    <p class="distill">${p.distill}</p>
    <div class="stack slot-actions">
      <button class="btn primary" data-copy="${encodeURIComponent(p.prompt)}" title="${p.prompt.replace(/"/g, "&quot;")}">העתקת הפרומפט</button>
      <div class="line">
        <a class="btn" href="https://www.midjourney.com/imagine" target="_blank" rel="noopener">פתיחת מידג'רני</a>
        <button class="btn" data-pick>תמונה או סרטון</button>
      </div>
    </div>
  </div>`;
}

async function list(slot) {
  const r = await fetch(`${SB}/rest/v1/arcbina_images?slot=eq.${encodeURIComponent(slot)}&order=created_at.desc&limit=6&select=path`, { headers: H });
  return r.ok ? r.json() : [];
}

async function upload(slot, file, prompt) {
  const video = VID.test(file.type);
  if (!video && !IMG.test(file.type)) throw new Error("תמונה (PNG, JPG, WEBP, GIF) או סרטון (MP4, WEBM, MOV)");
  if (file.size > (video ? 50 : 8) * 1024 * 1024) throw new Error(video ? "סרטון עד 50MB" : "תמונה עד 8MB");
  const ext = { jpeg: "jpg", quicktime: "mov" }[file.type.split("/")[1]] || file.type.split("/")[1];
  const path = `img/${safe(slot)}/${crypto.randomUUID()}.${ext}`;
  const up = await fetch(`${SB}/storage/v1/object/arcbina/${path}`, { method: "POST", headers: { ...H, "Content-Type": file.type, "x-upsert": "false" }, body: file });
  if (!up.ok) throw new Error("ההעלאה נכשלה");
  const row = await fetch(`${SB}/rest/v1/arcbina_images`, { method: "POST", headers: { ...H, "Content-Type": "application/json", Prefer: "return=minimal" }, body: JSON.stringify({ slot, path, prompt: (prompt || "").slice(0, 2000), kind: video ? "video" : "image" }) });
  if (!row.ok) throw new Error("השמירה נכשלה");
  return path;
}

/* מחבר את המסגרת שבדף. מחזיר פונקציית ניקוי */
export function mountSlot(root, toast) {
  const el = root.querySelector(".slot");
  if (!el) return () => {};
  const slot = el.dataset.slot;
  const frame = el.querySelector(".slot-frame"), input = el.querySelector("input[type=file]"), thumbs = el.querySelector(".thumbs");
  const prompt = decodeURIComponent(el.querySelector("[data-copy]").dataset.copy);
  const how = frame.querySelector(".how");
  let paths = [];

  const show = path => {
    frame.querySelector("img,video")?.remove();
    if (!path) { how.hidden = false; return; }
    how.hidden = true;
    let m;
    if (isVideo(path)) {
      m = Object.assign(document.createElement("video"), { src: pub(path), muted: true, loop: true, autoplay: !matchMedia("(prefers-reduced-motion: reduce)").matches, playsInline: true, controls: true });
      m.setAttribute("aria-label", "הסרטון שנוצר מהפרומפט");
      m.addEventListener("click", e => e.stopPropagation());
    } else { m = new Image(); m.alt = "התמונה שנוצרה מהפרומפט"; m.src = pub(path); }
    frame.prepend(m);
    thumbs.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", b.dataset.p === path));
  };
  const drawThumbs = () => {
    thumbs.innerHTML = paths.length > 1 ? paths.map(p => `<button data-p="${p}" aria-label="${isVideo(p) ? "סרטון קודם" : "תמונה קודמת"}">${isVideo(p) ? `<video src="${pub(p)}#t=0.1" muted preload="metadata"></video>` : `<img src="${pub(p)}" alt="">`}</button>`).join("") : "";
  };
  const refresh = async () => { try { paths = (await list(slot)).map(r => r.path); drawThumbs(); show(paths[0]); } catch { /* בלי רשת: המסגרת נשארת ריקה */ } };
  const take = async file => {
    if (!file) return;
    const busy = Object.assign(document.createElement("div"), { className: "busy", textContent: VID.test(file.type) ? "מעלה את הסרטון..." : "שומר את התמונה..." });
    frame.append(busy);
    try { const p = await upload(slot, file, prompt); paths.unshift(p); paths = paths.slice(0, 6); drawThumbs(); show(p); toast(isVideo(p) ? "הסרטון נשמר במסגרת" : "התמונה נשמרה במסגרת"); }
    catch (e) { toast(e.message || "השמירה נכשלה"); }
    finally { busy.remove(); }
  };

  frame.addEventListener("click", () => input.click());
  frame.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.click(); } });
  el.querySelector("[data-pick]").addEventListener("click", () => input.click());
  input.addEventListener("change", () => take(input.files[0]));
  frame.addEventListener("dragover", e => { e.preventDefault(); frame.classList.add("drag"); });
  frame.addEventListener("dragleave", () => frame.classList.remove("drag"));
  frame.addEventListener("drop", e => { e.preventDefault(); frame.classList.remove("drag"); take([...e.dataTransfer.files].find(f => IMG.test(f.type) || VID.test(f.type))); });
  thumbs.addEventListener("click", e => { const b = e.target.closest("button"); if (b) show(b.dataset.p); });
  const onPaste = e => {
    if (e.target.closest?.("input,textarea")) return;
    const f = [...(e.clipboardData?.files || [])].find(x => IMG.test(x.type) || VID.test(x.type));
    if (f) { e.preventDefault(); take(f); }
  };
  document.addEventListener("paste", onPaste);
  refresh();
  return () => document.removeEventListener("paste", onPaste);
}
