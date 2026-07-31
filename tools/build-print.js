/* מחולל גיליון הדפסה — מריצים: node tools/build-print.js
   מייצר print.html סטטי, מוכן להדפסה, ללא תלות ב-JS או בשרת.
   הקבצים questions.js ו-questions-hard.js מגדירים שניהם `const BANK`,
   ולכן אי אפשר לטעון את שניהם באותו דף; כאן מחלצים כל אחד בנפרד ומטמיעים. */
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..');
const load = f => eval(fs.readFileSync(path.join(DIR, f), 'utf8') + '; BANK');

const REG = load('questions.js');
const HARD = load('questions-hard.js');

const TOPICS = [
  'מצגת 1 — מבוא ותיאוריות',
  'מצגת 2 — תאגיד ומוסר',
  'מצגת 3 — ציות ולמידה ארגונית',
  'מצגת 4 — חוק, CSR וממשל',
  'מצגת 5 — דת, תרבות והתפתחות מוסרית',
];

/* מספר השאלות הצפוי במבחן לכל נושא — מסיכום ההכנה של המרצה */
const BLUEPRINT = {
  'מצגת 1 — מבוא ותיאוריות': '11 שאלות (40–50% מהמבחן)',
  'מצגת 2 — תאגיד ומוסר': '6 שאלות',
  'מצגת 3 — ציות ולמידה ארגונית': '3 שאלות',
  'מצגת 4 — חוק, CSR וממשל': '3 שאלות',
  'מצגת 5 — דת, תרבות והתפתחות מוסרית': '2 שאלות',
};

const L = ['א', 'ב', 'ג', 'ד', 'ה'];
const esc = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

let n = 0;
const section = (title, bank, hard) => {
  let h = `<h2 class="topic">${esc(title)}`;
  if (!hard && BLUEPRINT[title]) h += `<span class="bp">צפי במבחן: ${esc(BLUEPRINT[title])}</span>`;
  h += `</h2>`;
  const qs = bank.filter(q => q.t === title);
  if (!qs.length) return '';
  h += qs.map(q => {
    n++;
    const opts = q.o.map((o, j) =>
      `<li class="${j === q.c ? 'right' : ''}"><span class="ltr">${L[j]}.</span> ${esc(o)}</li>`).join('');
    return `<article class="q">
  <div class="qh"><span class="num">${n}</span><span class="qt">${esc(q.q)}</span></div>
  <ol class="opts">${opts}</ol>
  <div class="ans"><b>תשובה: ${L[q.c]}</b> — ${esc(q.o[q.c])}<div class="ex">${esc(q.e)}</div></div>
</article>`;
  }).join('\n');
  return `<section class="sec">${h}</section>`;
};

/* המפתח נאסף תוך כדי הבנייה, ולכן חייב לרוץ לפני שמרכיבים אותו */
const KEY = [];
const collect = (bank, title) => bank.filter(q => q.t === title).forEach(q => KEY.push(L[q.c]));

const body = [
  ...TOPICS.map(t => { const s = section(t, REG, false); collect(REG, t); return s; }),
  `<section class="sec"><h2 class="topic">מאגר טריקי — שאלות קשות<span class="bp">עד 4 שאלות קשות במבחן</span></h2></section>`,
  ...TOPICS.map(t => { const s = section(t, HARD, true); collect(HARD, t); return s; }),
].filter(Boolean).join('\n');

/* מפתח תשובות דחוס — מה שהופך את מצב התרגול העצמי לשמיש */
const keyCells = KEY.map((a, i) => `<span class="kc"><b>${i + 1}</b>${a}</span>`).join('');
const keySection = `<section class="sec"><h2 class="topic">מפתח תשובות<span class="bp">${KEY.length} שאלות</span></h2>
<div class="key">${keyCells}</div></section>`;

const counts = TOPICS.map(t =>
  `<tr><td>${esc(t)}</td><td>${REG.filter(q => q.t === t).length}</td><td>${HARD.filter(q => q.t === t).length}</td><td>${BLUEPRINT[t] || '—'}</td></tr>`).join('');

const html = `<!doctype html>
<html lang="he" dir="rtl"><head><meta charset="utf-8">
<title>אתיקה עסקית — גיליון תרגול להדפסה</title>
<style>
@page { size: A4; margin: 14mm 12mm; }
* { box-sizing: border-box; }
body { font-family: "Segoe UI", "Arial Hebrew", Arial, sans-serif; font-size: 10.5pt;
  line-height: 1.4; color: #000; background: #fff; margin: 0; padding: 18px; }
.wrap { max-width: 190mm; margin: 0 auto; }
h1 { font-size: 20pt; margin: 0 0 4px; }
.sub { color: #444; font-size: 10pt; margin-bottom: 14px; }
.note { border: 1px solid #000; padding: 10px 12px; margin-bottom: 16px; font-size: 10pt; }
.note > b { display: block; margin-bottom: 4px; }
table.toc { width: 100%; border-collapse: collapse; font-size: 10pt; margin-bottom: 8px; }
table.toc th, table.toc td { border: 1px solid #999; padding: 4px 7px; text-align: right; }
table.toc th { background: #eee; }
h2.topic { font-size: 13pt; border-bottom: 2px solid #000; padding-bottom: 4px;
  margin: 0 0 12px; display: flex; justify-content: space-between; align-items: baseline; gap: 10px; }
h2.topic .bp { font-size: 9.5pt; font-weight: 400; color: #444; white-space: nowrap; }
.sec { break-before: page; }
.sec:first-of-type { break-before: auto; }
article.q { break-inside: avoid; margin-bottom: 13px; padding-bottom: 3px; }
.qh { display: flex; gap: 7px; align-items: baseline; margin-bottom: 4px; }
.num { font-weight: 700; min-width: 22px; }
.qt { font-weight: 600; }
ol.opts { list-style: none; margin: 0 0 5px; padding-inline-start: 29px; }
ol.opts li { margin-bottom: 1px; }
.ltr { font-weight: 700; display: inline-block; min-width: 15px; }
/* הדגשת התשובה הנכונה ברשימה — רק כשהתשובות מוצגות, אחרת התרגול העצמי מתייתר */
body:not(.hide-ans) ol.opts li.right { font-weight: 700; }
body:not(.hide-ans) ol.opts li.right::after { content: " ✔"; }
.ans { border-inline-start: 3px solid #000; background: #f4f4f4; padding: 5px 9px;
  margin-inline-start: 29px; font-size: 9.5pt; }
.ex { margin-top: 2px; color: #222; }
/* מצב תרגול עצמי — מסתיר תשובות (מסומן ב-body) */
body.hide-ans .ans { display: none; }
body.hide-ans article.q { margin-bottom: 9px; }
.only-self { display: none; }
body.hide-ans .only-full { display: none; }
body.hide-ans .only-self { display: block; }
.key { display: flex; flex-wrap: wrap; gap: 2px 0; font-size: 9.5pt; }
.key .kc { width: 11.11%; padding: 1px 0; white-space: nowrap; }
.key .kc b { display: inline-block; min-width: 30px; color: #555; font-weight: 400; }
.controls { border: 2px solid #000; padding: 12px; margin-bottom: 18px; font-size: 11pt; }
.controls button { font: inherit; padding: 6px 14px; margin-inline-end: 8px; cursor: pointer; }
@media print { .controls { display: none; } body { padding: 0; } }
</style></head><body>
<div class="wrap">

<div class="controls">
  <b>לפני ההדפסה:</b>
  <button onclick="document.body.classList.remove('hide-ans');window.print()">הדפס עם תשובות והסברים</button>
  <button onclick="document.body.classList.add('hide-ans');window.print()">הדפס בלי תשובות (לתרגול עצמי)</button>
  <div style="margin-top:8px;font-size:10pt;color:#444">
    טיפ: בחלון ההדפסה של הדפדפן כדאי לכבות "כותרות עליונות ותחתונות" ולסמן "הדפס רקעים" כדי שתיבות התשובה יישארו מודגשות.
  </div>
</div>

<h1>אתיקה עסקית — גיליון תרגול להדפסה</h1>
<div class="sub">ד"ר רון ברגר · קוד 865562901 · ${REG.length + HARD.length} שאלות · המבחן: 2.8.26, 25 שאלות, 5 מסיחים</div>

<div class="note">
  <b>איך ללמוד מהדף</b>
  <span class="only-full">התשובה וההסבר מופיעים בתיבה האפורה מתחת לכל שאלה. כסו אותה בדף נייר, ענו בראש, ורק אז הזיזו את הנייר.
  התשובה הנכונה מסומנת ב-✔ גם ברשימת המסיחים.</span>
  <span class="only-self">גרסת תרגול עצמי — בלי תשובות. סמנו את תשובתכם ליד כל שאלה, ובדקו מול <b>מפתח התשובות</b> שבסוף הדף.</span>
  <br><br>
  <b>לא ייכללו במבחן:</b> מצגת 6 · שיתוף ערכים · דילמת האסיר · מהתפתחות ה-CSR — רק שנות ה-70–80.
</div>

<table class="toc">
  <tr><th>נושא</th><th>שאלות</th><th>קשות</th><th>צפי במבחן</th></tr>
  ${counts}
</table>

${body}
${keySection}

</div></body></html>`;

fs.writeFileSync(path.join(DIR, 'print.html'), html, 'utf8');
console.log(`print.html נוצר — ${n} שאלות (${REG.length} רגיל + ${HARD.length} קשה)`);
