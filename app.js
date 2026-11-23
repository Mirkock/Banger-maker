/* Banger Maker — lógica de la app (sin dependencias) */
(() => {
'use strict';

const VERSION = '3.1.0';
const K = { data: 'bm:data', settings: 'bm:settings', cloud: 'bm:cloud', dirty: 'bm:dirty', dict: 'bm:dict' };
const RIMA_CATS = [['formal', 'Formal'], ['informal', 'Informal'], ['jerga', 'Jerga'], ['marcas', 'Marcas'], ['famosos', 'Famosos']];
const RIMA_SUBS = [['videojuegos', 'Videojuegos'], ['musicaAR', 'Música argentina'], ['musicaUS', 'Música de EE. UU.'], ['futbol', 'Fútbol'], ['historicos', 'Historia'], ['cine', 'Cine y series']];
const DICT_CATS = [['informal', 'Informal'], ['jerga', 'Jerga'], ['marcas', 'Marca'], ['famosos', 'Famoso o famosa'], ['formal', 'Formal']];
const SORT_BY = [['modified', 'Modificación'], ['created', 'Creación'], ['name', 'Nombre']];
const DEFAULT_SORT = { notes: { by: 'modified', dir: 'desc' }, folders: { by: 'name', dir: 'asc' } };
const DEFAULT_RIMAS = { on: true, lang: 'es', mode: 'both', syl: [1, 2, 3, 4], cats: RIMA_CATS.map(c => c[0]), subs: RIMA_SUBS.map(c => c[0]), notas: true, net: true, flexS: true, dmKey: '' };
const FB_BASE = 'https://www.gstatic.com/firebasejs/10.14.1/';
const TAPES = ['#ffc93c', '#ff7a8a', '#6fe0b5', '#7fb2ff', '#c79bff', '#ffa95c'];
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5];

/* ---------- utilidades ---------- */
const $ = (s, r = document) => r.querySelector(s);
const now = () => Date.now();
const uid = () => now().toString(36) + Math.random().toString(36).slice(2, 8);
const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
const truncate = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
const thumbUrl = id => `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;

function lsGet(k, fb) {
  try { const v = localStorage.getItem(k); return v == null ? fb : JSON.parse(v); } catch { return fb; }
}
function lsSet(k, v) {
  try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; }
}

function fmtTime(t) {
  t = Math.max(0, Math.floor(t || 0));
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
  const ss = String(s).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}

const dfShort = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' });
const dfHour = new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
function fmtDate(ts) {
  const d = new Date(ts), n = new Date();
  const day = x => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((day(n) - day(d)) / 86400000);
  if (diff === 0) return 'hoy ' + dfHour.format(d);
  if (diff === 1) return 'ayer';
  if (d.getFullYear() === n.getFullYear()) return dfShort.format(d).replace('.', '');
  return `${d.getDate()}/${d.getMonth() + 1}/${String(d.getFullYear()).slice(2)}`;
}

/* ---------- armado de DOM seguro ---------- */
function h(tag, props, ...kids) {
  const e = document.createElement(tag);
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (v == null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'style') e.style.cssText = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else if (k === 'value' || k === 'checked' || k === 'disabled') e[k] = v;
      else e.setAttribute(k, v === true ? '' : v);
    }
  }
  for (const c of kids.flat(Infinity)) {
    if (c == null || c === false) continue;
    e.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return e;
}

/* ---------- íconos ---------- */
const FOLDER = '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>';
const ICONS = {
  back: '<path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>',
  more: '<circle cx="12" cy="5" r="1.7" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.7" fill="currentColor" stroke="none"/><circle cx="12" cy="19" r="1.7" fill="currentColor" stroke="none"/>',
  sort: '<path d="M8 5v14M8 5L5 8.5M8 5l3 3.5M16 19V5M16 19l-3-3.5M16 19l3-3.5"/>',
  sliders: '<path d="M4 6h9M17 6h3"/><circle cx="15" cy="6" r="2"/><path d="M4 12h2M10 12h10"/><circle cx="8" cy="12" r="2"/><path d="M4 18h11M19 18h1"/><circle cx="17" cy="18" r="2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  folder: FOLDER,
  folderPlus: FOLDER + '<path d="M12 11v5M9.5 13.5h5"/>',
  move: FOLDER + '<path d="M9 13h7M13 10l3 3-3 3"/>',
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  play: '<path d="M7 4.5v15l13-7.5z" fill="currentColor" stroke="none"/>',
  pause: '<rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/>',
  pencil: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  paste: '<rect x="6" y="5" width="12" height="16" rx="2"/><path d="M9 5V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1"/>',
  cloud: '<path d="M7 18a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 10.5 4 4 0 0 1 17.5 18z"/>',
  download: '<path d="M12 4v11M7.5 11l4.5 4.5 4.5-4.5M5 19h14"/>',
  upload: '<path d="M12 16V5M7.5 9L12 4.5 16.5 9M5 19h14"/>',
  rhyme: '<circle cx="9" cy="12" r="5.5"/><circle cx="15" cy="12" r="5.5"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="M21 16l-5-5-8 9"/>'
};
function svg(name, size = 24) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
}
function icon(name, size = 22) {
  const s = h('span', { class: 'ic' });
  s.innerHTML = svg(name, size);
  return s;
}
function hydrateIcons() {
  document.querySelectorAll('[data-icon]').forEach(el => {
    el.innerHTML = svg(el.dataset.icon, +el.dataset.size || 24);
  });
}

/* ---------- datos ---------- */
let db = lsGet(K.data, null);
if (!db || !Array.isArray(db.notes) || !Array.isArray(db.folders)) db = { notes: [], folders: [] };
const dirty = new Set(lsGet(K.dirty, []));
const storedSettings = lsGet(K.settings, {});
const settings = Object.assign(
  { style: 'noche', calm: false, font: 'mono', size: 18, ytKey: '', repeat: true, dimHome: 0.35, dimEditor: 0.5, bgHome: false, bgEditor: false },
  storedSettings
);
// viene de la versión 1: el tema claro pasa a ser Acuarela
if (!storedSettings.style && storedSettings.theme) {
  const light = storedSettings.theme === 'light' || (storedSettings.theme === 'auto' && matchMedia('(prefers-color-scheme: light)').matches);
  settings.style = light ? 'acuarela' : 'noche';
}
delete settings.theme;
settings.rimas = Object.assign({}, DEFAULT_RIMAS, storedSettings.rimas || {});
['syl', 'cats', 'subs'].forEach(k => { if (!Array.isArray(settings.rimas[k])) settings.rimas[k] = DEFAULT_RIMAS[k].slice(); });
// cómo se ordenan las notas y las carpetas (cada una por separado)
settings.sort = {};
['notes', 'folders'].forEach(k => {
  const s0 = Object.assign({}, DEFAULT_SORT[k], (storedSettings.sort || {})[k] || {});
  if (!SORT_BY.some(x => x[0] === s0.by)) s0.by = DEFAULT_SORT[k].by;
  if (s0.dir !== 'asc' && s0.dir !== 'desc') s0.dir = DEFAULT_SORT[k].dir;
  settings.sort[k] = s0;
});
let dict = lsGet(K.dict, []);
if (!Array.isArray(dict)) dict = [];

const liveNotes = () => db.notes.filter(n => !n.deleted);
const liveFolders = () => db.folders.filter(f => !f.deleted);
const findItem = id => db.notes.find(n => n.id === id) || db.folders.find(f => f.id === id) || null;
const folderById = id => (id ? liveFolders().find(f => f.id === id) || null : null);
const tapeFor = id => { let s = 0; for (const c of id) s = (s * 31 + c.charCodeAt(0)) >>> 0; return TAPES[s % TAPES.length]; };

let saveTimer = null;
function persistNow() {
  clearTimeout(saveTimer); saveTimer = null;
  const ok = lsSet(K.data, db) && lsSet(K.dirty, [...dirty]);
  setSaveState(ok ? 'saved' : 'error');
}
function persistSoon() { clearTimeout(saveTimer); saveTimer = setTimeout(persistNow, 350); }
function saveSettings() { lsSet(K.settings, settings); }

function touch(item) {
  item.updatedAt = Math.max(now(), (item.updatedAt || 0) + 1);
  dirty.add(item.id);
  persistSoon();
  cloudSchedule(1500);
}

function newNoteObj(folderId) {
  const t = now();
  return { id: uid(), kind: 'note', folderId: folderId || null, title: '', body: '', beat: null, cover: null, createdAt: t, updatedAt: t, deleted: false };
}

// al arrancar: sacar notas vacías que nunca se tocaron
db.notes = db.notes.filter(n => !(!n.title && !n.body && !n.beat && n.updatedAt === n.createdAt && !dirty.has(n.id)));

const ui = { view: 'list', folderId: null, query: '' };

/* ---------- hojas (diálogos desde abajo) ---------- */
let sheet = null;
let ignorePop = false;

function showSheet(build, opts = {}) {
  return new Promise(resolve => {
    if (sheet) {
      const prev = sheet.resolve;
      sheet.resolve = resolve;
      sheet.kind = opts.kind || '';
      sheet.panel.replaceChildren(h('div', { class: 'grip' }));
      prev(undefined);
    } else {
      const panel = h('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true' }, h('div', { class: 'grip' }));
      const overlay = h('div', { class: 'overlay', onclick: e => { if (e.target === overlay) closeSheet(); } }, panel);
      $('#sheet-root').append(overlay);
      sheet = { overlay, panel, resolve, kind: opts.kind || '' };
    }
    build(sheet.panel, v => closeSheet(v));
  });
}
function closeSheet(v) {
  if (!sheet) return;
  const s = sheet;
  sheet = null;
  s.overlay.remove();
  s.resolve(v);
}

function promptSheet({ title, value = '', placeholder = '', okLabel = 'Guardar', maxLength = 60 }) {
  return showSheet((panel, close) => {
    const input = h('input', { class: 'field', type: 'text', placeholder, maxlength: maxLength, autocomplete: 'off', enterkeyhint: 'done' });
    input.value = value;
    const ok = () => { const v = input.value.trim(); if (!v) { input.focus(); return; } close(v); };
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); ok(); } });
    panel.append(
      h('h2', { class: 'sheet-title' }, title),
      h('div', { class: 'stack' }, input,
        h('div', { class: 'btn-row' },
          h('button', { class: 'btn btn-ghost', onclick: () => close() }, 'Cancelar'),
          h('button', { class: 'btn btn-primary', onclick: ok }, okLabel)))
    );
    setTimeout(() => { input.focus(); input.select(); }, 60);
  });
}

function confirmSheet({ title, text, okLabel = 'Eliminar', danger = true }) {
  return showSheet((panel, close) => {
    panel.append(
      h('h2', { class: 'sheet-title' }, title),
      text ? h('p', { class: 'hint' }, text) : null,
      h('div', { class: 'btn-row' },
        h('button', { class: 'btn btn-ghost', onclick: () => close(false) }, 'Cancelar'),
        h('button', { class: 'btn ' + (danger ? 'btn-danger' : 'btn-primary'), onclick: () => close(true) }, okLabel))
    );
  }).then(v => v === true);
}

function menuSheet(title, items) {
  return showSheet((panel, close) => {
    if (title) panel.append(h('h2', { class: 'sheet-title' }, title));
    panel.append(h('div', { class: 'actions' }, items.filter(Boolean).map(it =>
      h('button', {
        class: 'action' + (it.danger ? ' danger' : '') + (it.current ? ' current' : ''),
        onclick: () => { close(); it.run && it.run(); }
      }, icon(it.icon, 22), h('span', null, it.label))
    )));
  });
}

/* ---------- avisos ---------- */
let toastTimer = null;
function hideToast() { $('#toast').hidden = true; }
function toast(msg, action) {
  const t = $('#toast');
  t.replaceChildren(h('span', null, msg));
  if (action) t.append(h('button', { class: 'toast-action', onclick: () => { hideToast(); action.run(); } }, action.label));
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hideToast, action ? 6500 : 3000);
}


/* ---------- imágenes (portadas y fondos): quedan guardadas en el celular ---------- */
const memImg = new Map();
let idbP = null;
function idb() {
  if (!idbP) {
    idbP = new Promise((res, rej) => {
      if (!window.indexedDB) { rej(new Error('sin idb')); return; }
      const rq = indexedDB.open('banger-maker', 2);
      rq.onupgradeneeded = () => {
        ['img', 'rimas'].forEach(n => { if (!rq.result.objectStoreNames.contains(n)) rq.result.createObjectStore(n); });
      };
      rq.onsuccess = () => res(rq.result);
      rq.onerror = () => rej(rq.error);
      rq.onblocked = () => rej(new Error('bloqueada'));
    });
  }
  return idbP;
}
async function idbDo(mode, fn, store = 'img') {
  const d = await idb();
  return new Promise((res, rej) => {
    const tx = d.transaction(store, mode);
    const rq = fn(tx.objectStore(store));
    tx.oncomplete = () => res(rq && rq.result);
    tx.onerror = tx.onabort = () => rej(tx.error);
  });
}
async function imgPut(key, blob) { memImg.set(key, blob); try { await idbDo('readwrite', s => s.put(blob, key)); } catch { /* queda en memoria mientras la app esté abierta */ } }
async function imgGet(key) {
  try { const b = await idbDo('readonly', s => s.get(key)); if (b) return b; } catch { /* sigue */ }
  return memImg.get(key) || null;
}
async function imgDel(key) { memImg.delete(key); try { await idbDo('readwrite', s => s.delete(key)); } catch { /* nada */ } }

function loadImage(file) {
  return new Promise((res, rej) => {
    const u = URL.createObjectURL(file);
    const im = new Image();
    im.onload = () => { URL.revokeObjectURL(u); res(im); };
    im.onerror = () => { URL.revokeObjectURL(u); rej(new Error('imagen')); };
    im.src = u;
  });
}
const canvasBlob = (c, q) => new Promise(r => c.toBlob(r, 'image/jpeg', q));

async function resizeBlob(file, maxSide, q) {
  const im = await loadImage(file);
  const k = Math.min(1, maxSide / Math.max(im.naturalWidth, im.naturalHeight));
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(im.naturalWidth * k));
  c.height = Math.max(1, Math.round(im.naturalHeight * k));
  c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
  return canvasBlob(c, q);
}

const blobToDataUrl = b => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => rej(r.error); r.readAsDataURL(b); });
async function dataUrlToBlob(u) { return (await fetch(u)).blob(); }

function pickImage() {
  return new Promise(res => {
    const input = h('input', { type: 'file', accept: 'image/*' });
    input.addEventListener('change', () => res((input.files && input.files[0]) || null));
    input.addEventListener('cancel', () => res(null));
    input.click();
  });
}

/* ---------- portadas ---------- */
const coverUrl = new Map(); // id -> dirección temporal de la imagen
function setCoverUrl(id, blob) {
  const old = coverUrl.get(id);
  if (old) URL.revokeObjectURL(old);
  coverUrl.set(id, URL.createObjectURL(blob));
}
async function storeCover(id, blob) { await imgPut('cover:' + id, blob); setCoverUrl(id, blob); }
async function dropCover(id) {
  await imgDel('cover:' + id);
  const old = coverUrl.get(id);
  if (old) URL.revokeObjectURL(old);
  coverUrl.delete(id);
}
async function preloadCovers() {
  let any = false;
  for (const it of [...db.notes, ...db.folders]) {
    if (!it.cover || it.deleted || coverUrl.has(it.id)) continue;
    const b = await imgGet('cover:' + it.id);
    if (b) { setCoverUrl(it.id, b); any = true; }
  }
  return any;
}
const coverBg = id => (coverUrl.has(id) ? `background-image:url("${coverUrl.get(id)}")` : null);
function refreshList() { if (ui.view === 'list') renderList(); }

/* portada que llega de la nube o de una copia de seguridad */
function remoteCover(it, data, changed) {
  if (!it.cover) { if (coverUrl.has(it.id)) dropCover(it.id).then(refreshList); return; }
  if (data && (changed || !coverUrl.has(it.id))) {
    dataUrlToBlob(data).then(b => storeCover(it.id, b)).then(refreshList).catch(() => { /* imagen dañada */ });
  }
}
async function coverData(id) {
  try { const b = await imgGet('cover:' + id); return b ? await blobToDataUrl(b) : undefined; } catch { return undefined; }
}

/* recorte 4:3: arrastrar para encuadrar, pellizcar o deslizar para acercar */
function cropSheet(file, mode) {
  return showSheet((panel, close) => {
    const W = 640, H = 480;
    const canvas = h('canvas', { width: W, height: H });
    const box = h('div', { class: 'crop' }, canvas);
    const zoomIn = h('input', { class: 'plain', type: 'range', min: 1, max: 4, step: 0.01, value: 1, 'aria-label': 'Acercar' });
    const ok = h('button', { class: 'btn btn-primary', disabled: true }, 'Usar portada');
    let img = null, cx = 0, cy = 0, zoom = 1;

    const scale = () => Math.max(W / img.naturalWidth, H / img.naturalHeight) * zoom;
    const render = (ctx, guide) => {
      const s = scale();
      cx = clamp(cx, W / 2 / s, img.naturalWidth - W / 2 / s);
      cy = clamp(cy, H / 2 / s, img.naturalHeight - H / 2 / s);
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
      ctx.drawImage(img, W / 2 - cx * s, H / 2 - cy * s, img.naturalWidth * s, img.naturalHeight * s);
      if (guide) {
        ctx.fillStyle = 'rgba(0,0,0,.55)';
        if (mode === 'folder') { const band = W * 0.4, top = (H - band) / 2; ctx.fillRect(0, 0, W, top); ctx.fillRect(0, H - top, W, top); }
        else { const side = (W - H) / 2; ctx.fillRect(0, 0, side, H); ctx.fillRect(W - side, 0, side, H); }
      }
    };
    const draw = () => { if (img) render(canvas.getContext('2d'), true); };

    const pts = new Map();
    let lastD = 0;
    box.addEventListener('pointerdown', e => { try { box.setPointerCapture(e.pointerId); } catch { /* ignore */ } pts.set(e.pointerId, [e.clientX, e.clientY]); lastD = 0; });
    box.addEventListener('pointermove', e => {
      if (!img || !pts.has(e.pointerId)) return;
      const prev = pts.get(e.pointerId), k = W / box.clientWidth;
      pts.set(e.pointerId, [e.clientX, e.clientY]);
      if (pts.size === 1) {
        const s = scale();
        cx -= (e.clientX - prev[0]) * k / s;
        cy -= (e.clientY - prev[1]) * k / s;
      } else if (pts.size === 2) {
        const [p, q] = [...pts.values()];
        const d = Math.hypot(p[0] - q[0], p[1] - q[1]);
        if (lastD) { zoom = clamp(zoom * d / lastD, 1, 4); zoomIn.value = zoom; }
        lastD = d;
      }
      draw();
    });
    const up = e => { pts.delete(e.pointerId); lastD = 0; };
    box.addEventListener('pointerup', up);
    box.addEventListener('pointercancel', up);
    zoomIn.addEventListener('input', () => { zoom = +zoomIn.value; draw(); });

    ok.addEventListener('click', () => {
      if (!img) return;
      const out = document.createElement('canvas');
      out.width = W; out.height = H;
      render(out.getContext('2d'), false);
      canvasBlob(out, 0.78).then(b => close(b));
    });

    panel.append(
      h('h2', { class: 'sheet-title' }, mode === 'folder' ? 'Portada de la carpeta' : 'Portada de la nota'),
      h('p', { class: 'hint' }, mode === 'folder'
        ? 'Arrastrá para encuadrar. Lo que queda en la franja clara es lo que se ve arriba de la carpeta.'
        : 'Arrastrá para encuadrar. Lo que queda en el cuadrado claro es lo que se ve en la lista.'),
      box, zoomIn,
      h('div', { class: 'btn-row', style: 'margin-top:12px' },
        h('button', { class: 'btn btn-ghost', onclick: () => close() }, 'Cancelar'), ok)
    );

    loadImage(file).then(im => {
      img = im; cx = im.naturalWidth / 2; cy = im.naturalHeight / 2;
      ok.disabled = false; draw();
    }).catch(() => { toast('No pude abrir esa imagen'); close(); });
  });
}

async function pickCover(it) {
  const file = await pickImage();
  if (!file) return;
  const blob = await cropSheet(file, it.kind === 'folder' ? 'folder' : 'note');
  if (!blob) return;
  try {
    await storeCover(it.id, blob);
    it.cover = uid(); touch(it); persistNow(); refreshList();
    toast('Portada lista');
  } catch { toast('No se pudo guardar la portada'); }
}

async function removeCover(it) {
  await dropCover(it.id);
  it.cover = null; touch(it); persistNow(); refreshList();
  toast('Portada quitada');
}

function coverMenu(it) {
  if (!it.cover || !coverUrl.has(it.id)) { pickCover(it); return; }
  showSheet((panel, close) => {
    panel.append(
      h('h2', { class: 'sheet-title' }, 'Portada'),
      h('div', { class: 'cover-prev', style: coverBg(it.id) }),
      h('div', { class: 'actions' },
        h('button', { class: 'action', onclick: () => { close(); pickCover(it); } }, icon('image', 22), h('span', null, 'Cambiar portada')),
        h('button', { class: 'action danger', onclick: () => { close(); removeCover(it); } }, icon('trash', 22), h('span', null, 'Quitar portada')))
    );
  });
}

/* ---------- fondos propios (inicio y bloc, separados) ---------- */
const BGS = { home: { el: '#bg-home', flag: 'bgHome', url: null }, editor: { el: '#bg-editor', flag: 'bgEditor', url: null } };

async function applyBackground(which) {
  const B = BGS[which], el = $(B.el), photo = $('.photo', el);
  if (B.url) { URL.revokeObjectURL(B.url); B.url = null; }
  const blob = settings[B.flag] ? await imgGet('bg-' + which) : null;
  if (blob) {
    B.url = URL.createObjectURL(blob);
    photo.style.backgroundImage = `url("${B.url}")`;
    el.classList.add('has-photo');
  } else {
    photo.style.backgroundImage = '';
    el.classList.remove('has-photo');
    if (settings[B.flag]) { settings[B.flag] = false; saveSettings(); }
  }
}

async function chooseBackground(which) {
  const file = await pickImage();
  if (!file) return false;
  try {
    await imgPut('bg-' + which, await resizeBlob(file, 1600, 0.8));
    settings[BGS[which].flag] = true; saveSettings();
    await applyBackground(which);
    return true;
  } catch { toast('No pude usar esa imagen'); return false; }
}

async function removeBackground(which) {
  await imgDel('bg-' + which);
  settings[BGS[which].flag] = false; saveSettings();
  await applyBackground(which);
}



/* ---------- carpetas y notas: acciones ---------- */
async function createFolder() {
  const name = await promptSheet({ title: 'Nueva carpeta', placeholder: 'Por ejemplo: Trap', okLabel: 'Crear', maxLength: 40 });
  if (!name) return null;
  const t = now();
  const f = { id: uid(), kind: 'folder', name, cover: null, createdAt: t, updatedAt: t, deleted: false };
  db.folders.push(f);
  touch(f); persistNow();
  if (ui.view === 'list') renderList();
  return f;
}

async function renameFolder(f) {
  const name = await promptSheet({ title: 'Cambiar nombre', value: f.name, maxLength: 40 });
  if (!name || name === f.name) return;
  f.name = name; touch(f); persistNow();
  renderList();
}

async function deleteFolder(f) {
  const notes = liveNotes().filter(n => n.folderId === f.id);
  const ok = await confirmSheet({
    title: `¿Eliminar «${truncate(f.name, 28)}»?`,
    text: notes.length
      ? `También se eliminan las ${notes.length} ${notes.length === 1 ? 'nota' : 'notas'} de adentro.`
      : 'La carpeta está vacía.'
  });
  if (!ok) return;
  f.deleted = true; touch(f);
  notes.forEach(n => { n.deleted = true; touch(n); });
  persistNow();
  if (ui.folderId === f.id) { history.back(); } else { renderList(); }
  toast('Carpeta eliminada', {
    label: 'Deshacer',
    run: () => { f.deleted = false; touch(f); notes.forEach(n => { n.deleted = false; touch(n); }); persistNow(); renderList(); }
  });
}

function deleteNote(n, fromEditor) {
  n.deleted = true; touch(n); persistNow();
  if (fromEditor) history.back(); else renderList();
  toast('Nota eliminada', {
    label: 'Deshacer',
    run: () => { n.deleted = false; touch(n); persistNow(); if (ui.view === 'list') renderList(); }
  });
}

async function moveSheet(n) {
  const pick = folderId => { n.folderId = folderId; touch(n); persistNow(); if (ui.view === 'list') renderList(); toast(folderId ? `Movida a «${folderById(folderId).name}»` : 'Movida a Sin carpeta'); };
  const cur = folderById(n.folderId) ? n.folderId : null;
  const folders = liveFolders().sort((a, b) => a.name.localeCompare(b.name, 'es'));
  menuSheet('Mover a…', [
    { icon: cur === null ? 'check' : 'folder', label: 'Sin carpeta', current: cur === null, run: () => pick(null) },
    ...folders.map(f => ({ icon: cur === f.id ? 'check' : 'folder', label: f.name, current: cur === f.id, run: () => pick(f.id) })),
    { icon: 'folderPlus', label: 'Nueva carpeta…', run: async () => { const f = await createFolder(); if (f) pick(f.id); } }
  ]);
}

function folderMenu(f) {
  menuSheet(f.name, [
    { icon: 'pencil', label: 'Cambiar nombre', run: () => renameFolder(f) },
    { icon: 'image', label: 'Portada', run: () => coverMenu(f) },
    { icon: 'trash', label: 'Eliminar carpeta', danger: true, run: () => deleteFolder(f) }
  ]);
}
function noteMenu(n) {
  menuSheet(n.title || 'Sin título', [
    { icon: 'image', label: 'Portada', run: () => coverMenu(n) },
    { icon: 'move', label: 'Mover a carpeta', run: () => moveSheet(n) },
    { icon: 'trash', label: 'Eliminar nota', danger: true, run: () => deleteNote(n, false) }
  ]);
}



/* ---------- lista ---------- */
function previewOf(n) {
  const line = (n.body || '').split('\n').map(l => l.trim()).find(Boolean) || '';
  return truncate(line, 110);
}

function renderList() {
  const root = $('#list-body');
  root.replaceChildren();
  let folder = ui.folderId ? folderById(ui.folderId) : null;
  if (ui.folderId && !folder) ui.folderId = null;

  const inFolder = !!folder;
  updateHeader();

  const all = liveNotes();
  const q = norm(ui.query.trim());
  $('#search-wrap').hidden = inFolder || all.length === 0;

  const rowFor = n => {
    const fol = folderById(n.folderId);
    return h('div', { class: 'note-row' },
      n.cover && coverUrl.has(n.id) ? h('button', { class: 'row-thumb', style: coverBg(n.id), 'aria-label': 'Abrir nota', onclick: () => openNote(n.id) }) : null,
      h('button', { class: 'note-main', onclick: () => openNote(n.id) },
        h('div', { class: 'note-title' + (n.title ? '' : ' empty') }, n.title || 'Sin título'),
        previewOf(n) ? h('div', { class: 'note-preview' }, previewOf(n)) : null,
        h('div', { class: 'note-meta' },
          n.beat ? h('span', { class: 'chip' }, icon('music', 14), h('span', null, n.beat.title || 'Beat de YouTube')) : null,
          q && fol ? h('span', null, fol.name) : null,
          h('span', null, fmtDate(n.updatedAt)))),
      h('button', { class: 'icon-btn sm row-menu', 'aria-label': 'Opciones de la nota', onclick: () => noteMenu(n) }, icon('more', 20)));
  };
  if (q) {
    const hitsF = sortList(liveFolders().filter(f => norm(f.name).includes(q)), 'folders');
    const hitsN = sortList(all.filter(n => norm(n.title).includes(q) || norm(n.body).includes(q)), 'notes');
    if (!hitsF.length && !hitsN.length) {
      root.append(h('div', { class: 'empty-state' }, h('strong', null, 'No hay resultados'), `No encontré nada con «${ui.query.trim()}».`));
      return;
    }
    if (hitsF.length) root.append(h('div', { class: 'section-label' }, 'Carpetas'), tilesFor(hitsF));
    if (hitsN.length) root.append(h('div', { class: 'section-label' }, 'Notas'), ...hitsN.map(rowFor));
    return;
  }

  if (inFolder) {
    if (folder.cover && coverUrl.has(folder.id)) root.append(h('div', { class: 'folder-cover', style: coverBg(folder.id) }));
    const notes = sortList(all.filter(n => n.folderId === folder.id), 'notes');
    if (!notes.length) {
      root.append(h('div', { class: 'empty-state' }, h('strong', null, 'Esta carpeta está vacía'), 'Tocá «Nueva nota» para escribir sobre un beat.'));
    } else root.append(notes.length > 1 ? sectionHead('Notas', 'notes', notes.length) : null, ...notes.map(rowFor));
    return;
  }

  const folders = sortList(liveFolders(), 'folders');
  const loose = sortList(all.filter(n => !folderById(n.folderId)), 'notes');
  if (!folders.length && !loose.length) {
    root.append(h('div', { class: 'empty-state' }, h('img', { class: 'empty-char', src: 'logo-full.png', alt: '', width: 74, height: 156 }), h('strong', null, 'Todavía no hay notas'),
      'Creá una nota para escribir sobre un beat, o una carpeta para ordenarlas por tema.'));
    return;
  }
  if (folders.length) root.append(sectionHead('Carpetas', 'folders', folders.length), tilesFor(folders));
  if (loose.length) root.append(sectionHead(folders.length ? 'Sin carpeta' : 'Notas', 'notes', loose.length), ...loose.map(rowFor));
}

/* ---------- orden de notas y carpetas ---------- */
function folderStamps() {
  // una carpeta cuenta como modificada cuando se cambia ella o cualquiera de sus notas
  const m = new Map();
  liveFolders().forEach(f => m.set(f.id, f.updatedAt || 0));
  liveNotes().forEach(n => { if (m.has(n.folderId) && (n.updatedAt || 0) > m.get(n.folderId)) m.set(n.folderId, n.updatedAt); });
  return m;
}

function sortList(list, kind) {
  const { by, dir } = settings.sort[kind];
  const sign = dir === 'asc' ? 1 : -1;
  const stamps = kind === 'folders' && by === 'modified' ? folderStamps() : null;
  const nameOf = it => String(kind === 'folders' ? it.name : it.title || '').trim();
  const when = it => (by === 'created' ? it.createdAt || 0 : stamps ? stamps.get(it.id) || 0 : it.updatedAt || 0);
  return list.sort((a, b) => {
    if (by === 'name') {
      const na = nameOf(a), nb = nameOf(b);
      if (!na !== !nb) return na ? -1 : 1;                 // lo que no tiene nombre va siempre al final
      const c = na.localeCompare(nb, 'es', { numeric: true, sensitivity: 'base' });
      if (c) return c * sign;
    } else {
      const c = when(a) - when(b);
      if (c) return c * sign;
    }
    return (b.updatedAt || 0) - (a.updatedAt || 0);
  });
}

function sortLabel(kind) {
  const { by, dir } = settings.sort[kind];
  if (by === 'name') return dir === 'asc' ? 'Nombre: A–Z' : 'Nombre: Z–A';
  return (by === 'created' ? 'Creación' : 'Modificación') + (dir === 'desc' ? ': recientes' : ': antiguas');
}

function sectionHead(label, kind, count) {
  const what = kind === 'folders' ? 'carpetas' : 'notas';
  return h('div', { class: 'section-label section-head' },
    h('span', null, label),
    count > 1
      ? h('button', { class: 'sort-btn', type: 'button', 'aria-label': `Ordenar ${what}. Ahora: ${sortLabel(kind)}`, onclick: () => openSortSheet(kind) },
        icon('sort', 16), sortLabel(kind))
      : null);
}

function openSortSheet(kind) {
  const s = settings.sort[kind];
  const set = (by, dir) => { s.by = by; s.dir = dir; saveSettings(); renderList(); openSortSheet(kind); };
  showSheet(panel => {
    panel.append(
      h('h2', { class: 'sheet-title' }, kind === 'folders' ? 'Ordenar carpetas' : 'Ordenar notas'),
      h('div', { class: 'set-group' },
        h('div', { class: 'set-row' }, h('span', { class: 'set-label' }, 'Ordenar por'),
          seg(SORT_BY, s.by, v => { if (v !== s.by) set(v, v === 'name' ? 'asc' : 'desc'); })),
        h('div', { class: 'set-row' }, h('span', { class: 'set-label' }, 'Orden'),
          seg(s.by === 'name' ? [['asc', 'A → Z'], ['desc', 'Z → A']] : [['desc', 'Más nuevas primero'], ['asc', 'Más viejas primero']], s.dir, v => set(s.by, v))),
        kind === 'folders' && s.by === 'modified'
          ? h('p', { class: 'hint tight' }, 'La fecha de una carpeta es la última vez que se cambió ella o cualquiera de las notas de adentro.')
          : null,
        s.by === 'name' ? h('p', { class: 'hint tight' }, 'Lo que no tiene nombre queda siempre al final.') : null));
  }, { kind: 'sort' });
}

function tilesFor(folders) {
  const count = f => liveNotes().filter(n => n.folderId === f.id).length;
  return h('div', { class: 'tiles' }, folders.map(f => {
    const c = count(f);
    const cv = !!f.cover && coverUrl.has(f.id);
    return h('div', { class: 'tile' + (cv ? ' has-cover' : ''), style: `--tape:${tapeFor(f.id)}` },
      cv ? h('div', { class: 'tile-cover', style: coverBg(f.id) }) : null,
      h('button', { class: 'tile-main', onclick: () => openFolder(f.id) },
        h('span', { class: 'tile-name' }, f.name),
        h('span', { class: 'tile-count' }, c === 0 ? 'Vacía' : c === 1 ? '1 nota' : `${c} notas`)),
      h('button', { class: 'icon-btn sm tile-menu', 'aria-label': 'Opciones de ' + f.name, onclick: () => folderMenu(f) }, icon('more', 20)));
  }));
}



/* ---------- editor ---------- */
const E = { note: null, timer: null };
const titleInput = () => $('#note-title');
const bodyInput = () => $('#note-body');

function setSaveState(state) {
  const s = $('#save-state');
  if (!s) return;
  s.dataset.state = state;
  s.textContent = state === 'saving' ? 'Guardando…' : state === 'error' ? 'No se pudo guardar' : 'Guardado';
}

function updateCounts() {
  const tag = /^\[\d{1,2}:\d{2}(?::\d{2})?\]\s*/;
  const n = bodyInput().value.split('\n').filter(l => l.replace(tag, '').trim()).length;
  $('#counts').textContent = n ? `${n} ${n === 1 ? 'barra' : 'barras'}` : '';
}

function onEdit() {
  const n = E.note;
  if (!n) return;
  n.title = titleInput().value;
  n.body = bodyInput().value;
  touch(n);
  setSaveState('saving');
  updateCounts();
}
function flushEdit() { if (E.note) persistNow(); }

function updateChip() {
  const b = E.note && E.note.beat;
  $('#beat-chip-text').textContent = b ? (b.title || 'Beat de YouTube') : 'Sin beat';
}

/* barra de arriba: cambia según la pantalla */
function updateHeader() {
  const ed = ui.view === 'editor';
  const folder = !ed && ui.folderId ? folderById(ui.folderId) : null;
  const inF = !!folder;
  $('#btn-editor-back').hidden = !ed;
  $('#note-title').hidden = !ed;
  $('#btn-editor-menu').hidden = !ed;
  $('#top-spacer').hidden = ed;
  $('#brand').hidden = ed || inF;
  $('#sync-pill').hidden = ed || inF;
  $('#btn-folder-back').hidden = !inF;
  $('#folder-name').hidden = !inF;
  $('#btn-folder-menu').hidden = !inF;
  $('#btn-new-folder').hidden = inF;
  if (inF) $('#folder-name').textContent = folder.name;
}

function setView(v) {
  ui.view = v;
  document.documentElement.dataset.view = v;
  $('#view-list').hidden = v !== 'list';
  $('#view-editor').hidden = v !== 'editor';
  updateHeader();
  syncStrip();
  updateAwake();
  updateRhymeVisibility();
}

function showEditor(id) {
  const n = db.notes.find(x => x.id === id && !x.deleted);
  if (!n) { showList(null); return; }
  if (E.note && E.note !== n) leaveEditor();
  E.note = n;
  RB.pinned = null; RB.sig = '';
  setView('editor');
  titleInput().value = n.title;
  bodyInput().value = n.body;
  bodyInput().scrollTop = 0;
  updateCounts();
  setSaveState('saved');
  adoptNoteBeat(n);
}

/* al abrir una nota: el beat que suena no se corta si hay otro sonando */
function adoptNoteBeat(n) {
  const nb = n.beat;
  if (nb) {
    if (P.beat && P.beat.id === nb.id) {
      P.noteId = n.id; P.a = nb.a ?? null; P.b = nb.b ?? null;
      if (!P.beat.title && nb.title) P.beat.title = nb.title;
      updateLoopUI();
    } else if (!P.beat || !P.playing) {
      loadBeat(nb, { autoplay: false, noteId: n.id });
    }
  }
  syncStrip();
}

function leaveEditor() {
  const n = E.note;
  if (!n) return;
  clearTimeout(E.timer);
  const empty = !n.title.trim() && !n.body.trim() && !n.beat;
  if (empty && !n.deleted) {
    if (n.updatedAt === n.createdAt && !dirty.has(n.id)) db.notes.splice(db.notes.indexOf(n), 1);
    else { n.deleted = true; touch(n); }
  }
  persistNow();
  E.note = null;
  if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
}

/* pantalla encendida mientras escribís o mientras suena un beat */
let wake = null;
async function keepAwake(on) {
  try {
    if (on) {
      if (!wake && 'wakeLock' in navigator) {
        wake = await navigator.wakeLock.request('screen');
        wake.addEventListener('release', () => { wake = null; });
      }
    } else if (wake) { await wake.release(); wake = null; }
  } catch { /* no pasa nada si el celular no lo permite */ }
}
function updateAwake() { keepAwake(ui.view === 'editor' || P.playing); }



/* ---------- reproductor de YouTube (uno solo para toda la app) ---------- */
// El reproductor vive en un único lugar del documento y nunca se mueve:
// por eso el beat sigue sonando al cambiar de pantalla.
const P = { player: null, ready: false, creating: false, gen: 0, beat: null, noteId: null, loadedId: null, want: null, a: null, b: null, rate: 1, dragging: false, timer: null, dur: 0, playing: false, apiPromise: null };

function loadYTApi() {
  if (window.YT && window.YT.Player) return Promise.resolve();
  if (P.apiPromise) return P.apiPromise;
  P.apiPromise = new Promise((resolve, reject) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { if (prev) prev(); resolve(); };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.onerror = () => { P.apiPromise = null; s.remove(); reject(new Error('sin conexión')); };
    document.head.append(s);
  });
  return P.apiPromise;
}

function showPlayerMsg(text, retry) {
  const m = $('#player-msg');
  m.hidden = !text;
  m.textContent = text || '';
  m.style.cursor = retry ? 'pointer' : '';
  m.onclick = retry ? retryBeat : null;
}

function setPlayIcon(playing) {
  const changed = P.playing !== playing;
  P.playing = playing;
  const b = $('#c-play');
  b.innerHTML = svg(playing ? 'pause' : 'play', 20);
  b.setAttribute('aria-label', playing ? 'Pausar' : 'Reproducir');
  if (changed) updateAwake();
}

function updateTimeUI(t) {
  const d = P.dur || 0;
  $('#t-cur').textContent = fmtTime(t);
  $('#t-dur').textContent = fmtTime(d);
  const pct = d ? clamp(t / d, 0, 1) * 100 : 0;
  $('#seek-fill').style.width = pct + '%';
  $('#seek-thumb').style.left = pct + '%';
  const inp = $('#seek-input');
  inp.max = d || 1;
  if (!P.dragging) inp.value = t;
}

function updateLoopUI() {
  const d = P.dur || 0;
  const has = P.a != null && P.b != null && d > 0;
  const el = $('#seek-loop');
  el.hidden = !has;
  if (has) { el.style.left = (P.a / d * 100) + '%'; el.style.width = ((P.b - P.a) / d * 100) + '%'; }
  $('#c-a').classList.toggle('on', P.a != null);
  $('#c-b').classList.toggle('on', P.b != null);
}

function setSpeedLabel() { $('#c-speed').textContent = P.rate + 'x'; }

function updateNowPlaying() { $('#np-title').textContent = P.beat ? (P.beat.title || 'Beat de YouTube') : ''; }

/* qué se ve arriba: reproductor, "elegir beat" o el aviso de beat distinto */
function syncStrip() {
  const inEd = ui.view === 'editor' && !!E.note;
  const loaded = !!P.beat;
  $('#strip').hidden = !(loaded || inEd);
  $('#np-bar').hidden = !loaded;
  $('#beat-empty').hidden = loaded || !inEd;
  $('#beat-wrap').hidden = !loaded;
  const nb = inEd ? E.note.beat : null;
  const mismatch = inEd && loaded && !(nb && nb.id === P.beat.id);
  $('#beat-mismatch').hidden = !mismatch;
  if (mismatch) {
    $('#mm-text').textContent = nb ? 'Suena otro beat.' : 'Esta nota no tiene beat.';
    $('#btn-swap').textContent = nb ? 'Cambiar al de esta nota' : 'Usar el que suena';
  }
  updateNowPlaying();
  updateChip();
}

/* la nota a la que pertenece el beat que suena (si todavía lo tiene) */
function ownerNote() {
  const ok = n => !!(n && !n.deleted && n.beat && P.beat && n.beat.id === P.beat.id);
  if (ok(E.note)) return E.note;
  const n = P.noteId ? db.notes.find(x => x.id === P.noteId) : null;
  return ok(n) ? n : null;
}

function loadBeat(beat, { autoplay = false, noteId = null } = {}) {
  const same = !!(P.beat && P.beat.id === beat.id && P.loadedId === beat.id);
  P.beat = { id: beat.id, title: beat.title || (same && P.beat.title) || '' };
  P.noteId = noteId;
  P.a = beat.a ?? null; P.b = beat.b ?? null;
  if (!same) {
    P.rate = 1; P.dur = 0; P.dragging = false;
    setPlayIcon(false); updateTimeUI(0); setSpeedLabel(); showPlayerMsg('');
  }
  P.want = { id: beat.id, autoplay };
  updateLoopUI();
  syncStrip();
  ensurePlayer();
}

function closePlayer() {
  P.gen++;
  clearInterval(P.timer); P.timer = null;
  try { if (P.player && P.player.destroy) P.player.destroy(); } catch { /* ya no existe */ }
  P.player = null; P.ready = false; P.creating = false; P.loadedId = null; P.want = null;
  P.beat = null; P.noteId = null; P.a = P.b = null; P.dur = 0;
  setPlayIcon(false);
  const holder = $('#yt-holder');
  if (holder) holder.replaceChildren();
  showPlayerMsg('');
  syncStrip();
}

function retryBeat() {
  if (!P.beat) return;
  showPlayerMsg('');
  P.loadedId = null;
  P.want = { id: P.beat.id, autoplay: false };
  ensurePlayer();
}

async function ensurePlayer() {
  if (P.ready) { applyWant(); return; }
  if (P.creating) return;
  P.creating = true;
  const gen = P.gen;
  try { await loadYTApi(); } catch {
    if (gen === P.gen) {
      P.creating = false;
      if (P.beat) showPlayerMsg('Sin conexión. Tus notas funcionan igual. Tocá acá para reintentar el beat.', true);
    }
    return;
  }
  if (gen !== P.gen) return;
  const w = P.want;
  if (!w) { P.creating = false; return; }
  P.loadedId = w.id;
  $('#yt-holder').replaceChildren(h('div', { id: 'yt-target' }));
  const vars = { playsinline: 1, controls: 0, disablekb: 1, fs: 0, rel: 0, modestbranding: 1, iv_load_policy: 3, autoplay: w.autoplay ? 1 : 0 };
  if (/^https?:/.test(location.origin)) vars.origin = location.origin;
  P.player = new window.YT.Player('yt-target', {
    width: '200', height: '200', videoId: w.id, playerVars: vars,
    events: {
      onReady: () => {
        if (gen !== P.gen) return;
        P.ready = true; P.creating = false;
        P.timer = setInterval(tick, 150);
        applyWant();
        syncTitleFromPlayer();
      },
      onStateChange: e => {
        if (gen !== P.gen) return;
        const s = e.data;
        if (s === 1) { setPlayIcon(true); syncTitleFromPlayer(); }
        else if (s === 2 || s === 5) setPlayIcon(false);
        else if (s === 0) onEnded();
      },
      onError: e => {
        if (gen !== P.gen) return;
        const c = e.data;
        showPlayerMsg(
          c === 101 || c === 150 ? 'El dueño de este video no deja reproducirlo acá. Elegí otro beat.' :
          c === 100 || c === 2 ? 'Este video no está disponible. Elegí otro beat.' :
          'No se pudo reproducir. Revisá tu conexión.');
      }
    }
  });
}

/* cuando el reproductor ya existe, cambiar de video sin volver a crearlo */
function applyWant() {
  const w = P.want;
  if (!w || !P.ready || !P.player) return;
  P.want = null;
  try {
    if (w.id !== P.loadedId) {
      P.loadedId = w.id;
      const args = { videoId: w.id, startSeconds: 0 };
      if (w.autoplay) P.player.loadVideoById(args); else P.player.cueVideoById(args);
      P.player.setPlaybackRate(1);
    } else if (w.autoplay) P.player.playVideo();
  } catch { /* se puede reintentar tocando el mensaje */ }
}

function syncTitleFromPlayer() {
  if (!P.beat || P.beat.title || !P.player || !P.player.getVideoData) return;
  try {
    const t = (P.player.getVideoData() || {}).title;
    if (!t) return;
    P.beat.title = t;
    updateNowPlaying();
    const n = ownerNote();
    if (n && !n.beat.title) { n.beat.title = t; touch(n); updateChip(); }
  } catch { /* todavía sin datos */ }
}

function curTime() { try { return (P.ready && P.player.getCurrentTime()) || 0; } catch { return 0; } }

function tick() {
  const p = P.player;
  if (!P.ready || !p || !p.getCurrentTime) return;
  let t = 0, d = 0;
  try { t = p.getCurrentTime() || 0; d = p.getDuration() || 0; } catch { return; }
  if (d && d !== P.dur) { P.dur = d; updateLoopUI(); }
  if (!P.dragging) updateTimeUI(t);
  if (P.playing && P.a != null && P.b != null && t >= P.b) p.seekTo(P.a, true);
}

function onEnded() {
  setPlayIcon(false);
  if (!settings.repeat || !P.player) return;
  try { P.player.seekTo(P.a != null ? P.a : 0, true); P.player.playVideo(); } catch { /* ignore */ }
}

function seekTo(t) {
  if (!P.ready) return;
  const d = P.dur || Infinity;
  try { P.player.seekTo(clamp(t, 0, d), true); } catch { /* ignore */ }
  updateTimeUI(clamp(t, 0, d));
}

function saveLoop() {
  const n = ownerNote();
  if (n) { n.beat.a = P.a; n.beat.b = P.b; touch(n); }
  updateLoopUI();
}

/* los botones del reproductor no deben cerrar el teclado */
function withFocus(fn) {
  return () => {
    const ta = bodyInput();
    const had = document.activeElement === ta;
    fn();
    if (had && document.activeElement !== ta) ta.focus({ preventScroll: true });
  };
}

function markTime() {
  const ta = bodyInput();
  const tag = '[' + fmtTime(curTime()) + '] ';
  const v = ta.value, s = ta.selectionStart, e = ta.selectionEnd;
  const start = v.lastIndexOf('\n', s - 1) + 1;
  const m = v.slice(start).match(/^\[\d{1,2}:\d{2}(?::\d{2})?\]\s?/);
  const removed = m ? m[0].length : 0;
  ta.value = v.slice(0, start) + tag + v.slice(start + removed);
  const shift = pos => (pos <= start + removed ? start + tag.length : pos + tag.length - removed);
  ta.setSelectionRange(shift(s), shift(e));
  onEdit();
}

/* botón del aviso: pasar al beat de la nota, o dejar este beat en la nota */
function swapBeat() {
  const n = E.note;
  if (!n) return;
  if (n.beat) loadBeat(n.beat, { autoplay: true, noteId: n.id });
  else if (P.beat) {
    n.beat = { id: P.beat.id, title: P.beat.title, a: P.a, b: P.b };
    P.noteId = n.id;
    touch(n); persistNow(); syncStrip();
  }
}

function bindPlayer() {
  const c = $('#beat-wrap .controls');
  c.addEventListener('mousedown', e => { if (e.target.closest('button')) e.preventDefault(); });

  $('#c-play').addEventListener('click', withFocus(() => {
    if (!P.ready) return;
    try { P.playing ? P.player.pauseVideo() : P.player.playVideo(); } catch { /* ignore */ }
  }));
  $('#c-back').addEventListener('click', withFocus(() => seekTo(curTime() - 10)));
  $('#c-fwd').addEventListener('click', withFocus(() => seekTo(curTime() + 10)));

  $('#c-a').addEventListener('click', withFocus(() => {
    if (!P.ready) return;
    const t = curTime();
    if (P.b != null && t >= P.b) P.b = null;
    P.a = t; saveLoop(); toast('Inicio del loop en ' + fmtTime(t));
  }));
  $('#c-b').addEventListener('click', withFocus(() => {
    if (!P.ready) return;
    const t = curTime();
    if (P.a == null) P.a = 0;
    if (t <= P.a + 0.5) { toast('El final tiene que quedar después del inicio'); return; }
    P.b = t; saveLoop(); toast(`Loop de ${fmtTime(P.a)} a ${fmtTime(P.b)}`);
  }));
  $('#c-clear').addEventListener('click', withFocus(() => {
    if (P.a == null && P.b == null) return;
    P.a = P.b = null; saveLoop(); toast('Loop quitado');
  }));

  $('#c-speed').addEventListener('click', withFocus(() => {
    P.rate = SPEEDS[(Math.max(0, SPEEDS.indexOf(P.rate)) + 1) % SPEEDS.length];
    try { if (P.ready) P.player.setPlaybackRate(P.rate); } catch { /* ignore */ }
    setSpeedLabel();
  }));
  $('#c-mark').addEventListener('click', withFocus(() => {
    if (E.note) markTime(); else toast('Abrí una nota para marcar el tiempo');
  }));

  const seek = $('#seek-input');
  seek.addEventListener('input', () => { P.dragging = true; updateTimeUI(+seek.value); });
  seek.addEventListener('change', () => { seekTo(+seek.value); P.dragging = false; });
}



/* ---------- beats: links, búsqueda, compartir ---------- */
function parseYouTube(input) {
  if (!input) return null;
  const s = String(input).trim();
  const urls = s.match(/https?:\/\/[^\s<>"']+/g) || (/^(www\.|m\.|music\.)?(youtube\.com|youtu\.be)\//i.test(s) ? [s] : []);
  for (const c of urls) {
    const raw = c.replace(/[),.;]+$/, '');
    let u;
    try { u = new URL(/^https?:/i.test(raw) ? raw : 'https://' + raw); } catch { continue; }
    const host = u.hostname.replace(/^(www|m|music)\./, '');
    let id = null;
    if (host === 'youtu.be') id = u.pathname.slice(1).split('/')[0];
    else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      if (u.pathname === '/watch') id = u.searchParams.get('v');
      else { const m = u.pathname.match(/^\/(?:shorts|embed|live|v)\/([\w-]{11})/); if (m) id = m[1]; }
    }
    if (id && /^[\w-]{11}$/.test(id)) return { id };
  }
  return null;
}

async function fetchTitle(id) {
  try {
    const c = new AbortController();
    const to = setTimeout(() => c.abort(), 6000);
    const r = await fetch('https://www.youtube.com/oembed?format=json&url=' + encodeURIComponent('https://www.youtube.com/watch?v=' + id), { signal: c.signal });
    clearTimeout(to);
    if (!r.ok) return '';
    return (await r.json()).title || '';
  } catch { return ''; }
}

async function searchYouTube(q) {
  const url = 'https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddable=true&maxResults=15&q=' +
    encodeURIComponent(q) + '&key=' + encodeURIComponent(settings.ytKey);
  const r = await fetch(url);
  if (!r.ok) throw new Error(r.status === 403 || r.status === 400 ? 'key' : 'net');
  const j = await r.json();
  return (j.items || []).filter(i => i.id && i.id.videoId).map(i => ({
    id: i.id.videoId, title: decodeEntities(i.snippet.title), channel: i.snippet.channelTitle
  }));
}
function decodeEntities(s) { const t = document.createElement('textarea'); t.innerHTML = s; return t.value; }

function usedBeats() {
  const map = new Map();
  liveNotes().sort((a, b) => b.updatedAt - a.updatedAt).forEach(n => {
    if (!n.beat) return;
    const e = map.get(n.beat.id) || { id: n.beat.id, title: n.beat.title || 'Beat de YouTube', count: 0 };
    e.count++; map.set(n.beat.id, e);
  });
  return [...map.values()].slice(0, 12);
}

function beatItem(info, sub, onPick) {
  return h('button', { class: 'beat-item', onclick: onPick },
    h('img', { class: 'beat-thumb', src: thumbUrl(info.id), alt: '', loading: 'lazy' }),
    h('span', { class: 'beat-info' }, h('b', null, info.title), sub ? h('small', null, sub) : null));
}


function chooseBeat(info) {
  const n = E.note;
  if (!n) return;
  n.beat = { id: info.id, title: info.title || '', a: null, b: null };
  touch(n);
  loadBeat(n.beat, { autoplay: true, noteId: n.id });
  if (!n.beat.title) {
    fetchTitle(info.id).then(t => {
      if (!t || !n.beat || n.beat.id !== info.id || n.beat.title) return;
      n.beat.title = t; touch(n); updateChip();
      if (P.beat && P.beat.id === info.id && !P.beat.title) { P.beat.title = t; updateNowPlaying(); }
    });
  }
}

function clearBeat() {
  const n = E.note;
  if (!n) return;
  const was = n.beat && n.beat.id;
  n.beat = null; touch(n); persistNow();
  if (P.beat && P.beat.id === was) closePlayer(); else syncStrip();
}

/* forPlayer: cambiar el beat que suena (desde la lista) sin tocar ninguna nota */
function openBeatSheet({ forPlayer = false } = {}) {
  const n = forPlayer ? null : E.note;
  if (!forPlayer && !n) return;
  showSheet((panel, close) => {
    const pick = info => { close(); if (forPlayer) loadBeat({ id: info.id, title: info.title || '' }, { autoplay: true }); else chooseBeat(info); };
    const input = h('input', { class: 'field', type: 'search', placeholder: 'Buscá un beat o pegá un link', autocomplete: 'off', enterkeyhint: 'search' });
    const msg = h('p', { class: 'hint' });
    const results = h('div', { class: 'beat-list' });

    const go = async () => {
      const q = input.value.trim();
      if (!q) return;
      const yt = parseYouTube(q);
      if (yt) { pick({ id: yt.id, title: '' }); return; }
      if (settings.ytKey) {
        msg.textContent = 'Buscando…'; results.replaceChildren();
        try {
          const list = await searchYouTube(q);
          msg.textContent = list.length ? '' : 'No encontré videos para esa búsqueda.';
          results.replaceChildren(...list.map(v => beatItem(v, v.channel, () => pick(v))));
        } catch (e) {
          msg.textContent = e.message === 'key'
            ? 'La clave de YouTube no funciona o se acabó el límite de hoy. Revisala en Ajustes.'
            : 'No pude buscar. Revisá tu conexión.';
        }
      } else {
        window.open('https://www.youtube.com/results?search_query=' + encodeURIComponent(q), '_blank', 'noopener');
        msg.textContent = 'Se abrió YouTube. Cuando elijas un beat, tocá Compartir y elegí Banger Maker.';
      }
    };
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); go(); } });
    input.addEventListener('input', () => {
      if (/youtu/i.test(input.value)) { const yt = parseYouTube(input.value); if (yt) pick({ id: yt.id, title: '' }); }
    });

    const paste = async () => {
      try {
        const yt = parseYouTube(await navigator.clipboard.readText());
        if (yt) pick({ id: yt.id, title: '' });
        else msg.textContent = 'No hay un link de YouTube copiado todavía.';
      } catch { msg.textContent = 'No pude leer el portapapeles. Pegá el link en el cuadro de arriba.'; }
    };

    const used = usedBeats();
    panel.append(
      h('h2', { class: 'sheet-title' }, forPlayer ? 'Cambiar el beat que suena' : 'Elegir beat'),
      h('div', { class: 'stack' }, input,
        h('div', { class: 'btn-row' },
          h('button', { class: 'btn btn-ghost', onclick: paste }, icon('paste', 20), 'Pegar link'),
          h('button', { class: 'btn btn-primary', onclick: go }, icon('search', 20), 'Buscar'))),
      msg, results,
      used.length ? h('div', { class: 'list-label' }, 'Beats que ya usaste') : null,
      used.length ? h('div', { class: 'beat-list' }, used.map(b => beatItem(b, `${b.count} ${b.count === 1 ? 'nota' : 'notas'}`, () => pick(b)))) : null,
      n && n.beat ? h('div', { class: 'actions', style: 'margin-top:10px' },
        h('button', { class: 'action danger', onclick: () => { close(); clearBeat(); } }, icon('x', 22), h('span', null, 'Quitar el beat de esta nota'))) : null
    );
    if (!settings.ytKey) msg.textContent = 'Tip: en YouTube tocá Compartir y elegí Banger Maker para traer el beat directo.';
  });
}


/* beat que llega desde el botón Compartir de YouTube */
function receiveBeat(yt) {
  const info = { id: yt.id, title: '' };
  const titleEl = h('b', null, 'Cargando…');
  fetchTitle(yt.id).then(t => { info.title = t; titleEl.textContent = t || 'Beat de YouTube'; });
  const last = liveNotes().filter(n => n.title || n.body).sort((a, b) => b.updatedAt - a.updatedAt)[0];
  showSheet((panel, close) => {
    panel.append(
      h('h2', { class: 'sheet-title' }, 'Beat recibido'),
      h('div', { class: 'recv' }, h('img', { class: 'beat-thumb', src: thumbUrl(yt.id), alt: '' }), h('div', { class: 'beat-info' }, titleEl)),
      h('div', { class: 'stack' },
        h('button', { class: 'btn btn-primary btn-block', onclick: () => { close(); newNote(null, info); } }, 'Nueva nota con este beat'),
        last ? h('button', { class: 'btn btn-ghost btn-block', onclick: () => { close(); openNote(last.id); chooseBeat(info); } },
          `Ponerlo en «${truncate(last.title || 'Sin título', 24)}»`) : null,
        h('button', { class: 'btn btn-ghost btn-block', onclick: () => close() }, 'Cancelar'))
    );
  });
}



/* ---------- menú del editor ---------- */
async function copyNoteText() {
  const n = E.note;
  const text = [n.title, n.body].filter(Boolean).join('\n\n');
  try { await navigator.clipboard.writeText(text); toast('Texto copiado'); }
  catch { toast('No pude copiar el texto'); }
}

function editorMenu() {
  const n = E.note;
  if (!n) return;
  menuSheet(null, [
    { icon: 'music', label: n.beat ? 'Cambiar beat' : 'Elegir beat', run: () => openBeatSheet() },
    { icon: 'image', label: 'Portada de la nota', run: () => coverMenu(n) },
    { icon: 'move', label: 'Mover a carpeta', run: () => moveSheet(n) },
    { icon: 'copy', label: 'Copiar texto', run: copyNoteText },
    P.beat ? { icon: 'x', label: 'Cerrar el reproductor', run: closePlayer } : null,
    { icon: 'trash', label: 'Eliminar nota', danger: true, run: () => deleteNote(n, true) }
  ]);
}

/* ---------- ajustes ---------- */
let installPrompt = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installPrompt = e; });

const RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}`;

const STYLES = [
  { id: 'noche', name: 'Noche', desc: 'Violeta y dorado', bg: '#171933', c1: '#5c50e6', c2: '#d64896', c3: '#2e80dc', accent: '#ffc93c' },
  { id: 'lava', name: 'Lava', desc: 'Rojos y naranjas', bg: '#1d0f1c', c1: '#ff5f6d', c2: '#ffb347', c3: '#b02a7a', accent: '#ff9a5c' },
  { id: 'nebulosa', name: 'Nebulosa', desc: 'Azul eléctrico y rosa', bg: '#0f1030', c1: '#6a5cff', c2: '#ff6ec7', c3: '#3fd0e0', accent: '#b8a1ff' },
  { id: 'bosque', name: 'Bosque', desc: 'Verdes, tranquilo', bg: '#0c1f1d', c1: '#1fa08a', c2: '#b4e36a', c3: '#2a6fb3', accent: '#7be0b0' },
  { id: 'atardecer', name: 'Atardecer', desc: 'Durazno y violeta', bg: '#1a1230', c1: '#ff7e8b', c2: '#ffb36b', c3: '#7b5cff', accent: '#ffb08a' },
  { id: 'acuarela', name: 'Acuarela', desc: 'Claro y pastel', bg: '#f3f1fb', c1: '#ffaacd', c2: '#aad7ff', c3: '#c8b4ff', accent: '#ffd166' }
];

function applySettings() {
  const r = document.documentElement;
  const st = STYLES.find(s => s.id === settings.style) || STYLES[0];
  settings.style = st.id;
  r.dataset.style = st.id;
  r.dataset.calm = settings.calm ? '1' : '0';
  r.dataset.font = settings.font;
  r.style.setProperty('--note-size', settings.size + 'px');
  r.style.setProperty('--note-lh', Math.round(settings.size * 1.6) + 'px');
  r.style.setProperty('--dim-home', settings.dimHome);
  r.style.setProperty('--dim-editor', settings.dimEditor);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = st.bg;
}

function seg(options, current, onPick) {
  return h('div', { class: 'seg', role: 'group' }, options.map(([val, label]) =>
    h('button', { 'aria-pressed': String(current === val), onclick: () => onPick(val) }, label)));
}

async function exportData() {
  const withCover = async it => (it.cover ? { ...it, coverData: await coverData(it.id) } : it);
  const payload = {
    app: 'banger-maker', version: 3, exportedAt: new Date().toISOString(), dict,
    folders: await Promise.all(db.folders.map(withCover)),
    notes: await Promise.all(db.notes.map(withCover))
  };
  const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
  const a = h('a', { href: URL.createObjectURL(blob), download: `banger-maker-${new Date().toISOString().slice(0, 10)}.json` });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  toast('Copia guardada en tus descargas');
}

function importData() {
  const input = h('input', { type: 'file', accept: 'application/json,.json' });
  input.addEventListener('change', async () => {
    const file = input.files && input.files[0];
    if (!file) return;
    try {
      const j = JSON.parse(await file.text());
      if (!Array.isArray(j.notes) || !Array.isArray(j.folders)) throw new Error('formato');
      let added = 0;
      const merge = (list, arr, kind) => list.forEach(raw => {
        if (!raw || typeof raw.id !== 'string') return;
        const it = { ...raw, kind };
        const cd = it.coverData; delete it.coverData;
        const cur = arr.find(x => x.id === it.id);
        if (!cur) { arr.push(it); dirty.add(it.id); if (!it.deleted) added++; remoteCover(it, cd, true); }
        else if ((it.updatedAt || 0) > (cur.updatedAt || 0)) { Object.assign(cur, it); dirty.add(it.id); remoteCover(cur, cd, true); }
      });
      merge(j.folders, db.folders, 'folder');
      merge(j.notes, db.notes, 'note');
      let words = 0;
      (Array.isArray(j.dict) ? j.dict : []).forEach(d => {
        if (!d || typeof d.w !== 'string' || !d.w.trim()) return;
        const lang = d.lang === 'en' ? 'en' : 'es';
        if (dict.some(x => x.lang === lang && x.w.toLowerCase() === d.w.toLowerCase())) return;
        dict.push({ id: uid(), w: d.w.trim().slice(0, 40), say: String(d.say || '').slice(0, 40), cat: DICT_CATS.some(c => c[0] === d.cat) ? d.cat : 'informal', lang, t: now() });
        words++;
      });
      if (words) { saveDict(); RB.sig = ''; }
      persistNow(); cloudSchedule(500); refreshList();
      toast(added || words ? `Se importó ${[added ? added + ' elementos' : '', words ? words + ' palabras del diccionario' : ''].filter(Boolean).join(' y ')}` : 'No había nada nuevo para importar');
    } catch { toast('Ese archivo no es una copia de Banger Maker'); }
  });
  input.click();
}

function parseFirebaseConfig(text) {
  const cfg = {};
  const re = /["']?(\w+)["']?\s*:\s*["']([^"']*)["']/g;
  let m;
  while ((m = re.exec(text))) cfg[m[1]] = m[2];
  if (!cfg.apiKey || !cfg.projectId) return null;
  if (!cfg.authDomain) cfg.authDomain = cfg.projectId + '.firebaseapp.com';
  const keep = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  return Object.fromEntries(keep.filter(k => cfg[k]).map(k => [k, cfg[k]]));
}

function cloudSection() {
  const kids = [h('h3', null, 'Nube')];
  const stateText = { off: 'Sin conectar', signedout: 'Falta entrar con Google', syncing: 'Sincronizando…', synced: 'Todo guardado en la nube', offline: 'Sin conexión: se sincroniza cuando vuelva', error: 'No se pudo sincronizar' }[cloud.state] || '';
  if (!cloud.cfg) {
    const ta = h('textarea', { class: 'field', placeholder: 'Pegá acá el bloque firebaseConfig', spellcheck: 'false', autocapitalize: 'off' });
    kids.push(
      h('p', { class: 'hint' }, 'Guardá tus notas en tu cuenta de Google para no perderlas y verlas en otros dispositivos. Se activa con un proyecto gratis de Firebase.'),
      h('details', null, h('summary', null, 'Cómo activarla (5 pasos)'),
        h('ol', null,
          h('li', null, 'Entrá a console.firebase.google.com y creá un proyecto.'),
          h('li', null, 'Authentication → Comenzar → activá el método Google.'),
          h('li', null, 'Firestore Database → Crear base de datos → pestaña Reglas: pegá las reglas de abajo y publicá.'),
          h('li', null, 'Configuración del proyecto → Tus apps → Web (</>): registrá la app y copiá el bloque firebaseConfig.'),
          h('li', null, 'Authentication → Configuración → Dominios autorizados: agregá el dominio donde está esta app.'))),
      h('button', { class: 'btn btn-ghost btn-block', style: 'margin-bottom:12px', onclick: async () => { try { await navigator.clipboard.writeText(RULES); toast('Reglas copiadas'); } catch { toast('No pude copiar'); } } }, icon('copy', 20), 'Copiar las reglas de Firestore'),
      ta,
      h('button', { class: 'btn btn-primary btn-block', style: 'margin-top:12px', onclick: () => {
        const cfg = parseFirebaseConfig(ta.value);
        if (!cfg) { toast('No encontré apiKey y projectId en lo que pegaste'); return; }
        lsSet(K.cloud, cfg); location.reload();
      } }, 'Conectar')
    );
  } else {
    kids.push(h('div', { class: 'status-line', 'data-state': cloud.state }, h('span', { class: 'dot' }), h('span', null, stateText)));
    if (cloud.detail) kids.push(h('p', { class: 'hint' }, cloud.detail));
    if (cloud.user) {
      kids.push(h('p', { class: 'hint' }, 'Cuenta: ' + (cloud.user.email || 'Google')),
        h('div', { class: 'btn-row' },
          h('button', { class: 'btn btn-ghost', onclick: () => cloudSync() }, 'Sincronizar'),
          h('button', { class: 'btn btn-ghost', onclick: () => cloudSignOut() }, 'Salir')));
    } else {
      kids.push(h('button', { class: 'btn btn-primary btn-block', onclick: () => cloudSignIn() }, 'Entrar con Google'));
    }
    kids.push(h('button', { class: 'btn btn-ghost btn-block', style: 'margin-top:10px', onclick: async () => {
      if (await confirmSheet({ title: '¿Quitar la conexión?', text: 'Tus notas siguen en este celular. Solo se deja de sincronizar.', okLabel: 'Quitar', danger: false })) {
        try { localStorage.removeItem(K.cloud); } catch { /* ignore */ }
        location.reload();
      }
    } }, 'Quitar conexión con Firebase'));
  }
  return h('div', { class: 'set-group' }, kids);
}

function styleCard(s, redo) {
  const sw = `background:radial-gradient(circle at 16% 24%, ${s.c1} 0, transparent 62%), radial-gradient(circle at 90% 80%, ${s.c2} 0, transparent 58%), radial-gradient(circle at 62% -10%, ${s.c3} 0, transparent 55%), ${s.bg}`;
  return h('button', {
    class: 'style-card', 'data-style-id': s.id, 'aria-pressed': String(settings.style === s.id),
    onclick: () => { settings.style = s.id; applySettings(); saveSettings(); redo(); }
  },
  h('div', { class: 'style-sw', style: sw }, h('i', { style: `background:${s.accent}` })),
  h('b', null, s.name), h('small', null, s.desc));
}

function bgRow(which, label, redo) {
  const B = BGS[which], on = !!settings[B.flag];
  const dimKey = which === 'home' ? 'dimHome' : 'dimEditor';
  const dim = h('input', { class: 'plain', type: 'range', min: 0, max: 0.8, step: 0.05, value: settings[dimKey], 'aria-label': 'Oscurecer la foto' });
  dim.addEventListener('input', () => { settings[dimKey] = +dim.value; applySettings(); saveSettings(); });
  return h('div', { class: 'set-row' },
    h('span', { class: 'set-label' }, label),
    h('div', { class: 'bg-row' },
      h('div', { class: 'bg-prev', style: on && B.url ? `background-image:url("${B.url}")` : null }),
      h('button', { class: 'btn btn-ghost', 'data-bg': which, onclick: async () => { if (await chooseBackground(which)) redo(); } }, icon('image', 20), on ? 'Cambiar' : 'Elegir foto'),
      on ? h('button', { class: 'btn btn-ghost', onclick: async () => { await removeBackground(which); redo(); } }, 'Quitar') : null),
    on ? h('span', { class: 'set-label' }, 'Oscurecer la foto') : null,
    on ? dim : null);
}

function openSettings() {
  const prevScroll = sheet && sheet.kind === 'settings' ? sheet.panel.scrollTop : 0;
  const redo = () => openSettings();
  showSheet(panel => {
    const sample = h('div', { class: 'sample' }, 'Escribo a las 5 am, el beat me hace caso');
    const keyInput = h('input', { class: 'field', type: 'password', placeholder: 'Clave de la API de YouTube (opcional)', autocomplete: 'off', value: settings.ytKey });
    keyInput.addEventListener('change', () => { settings.ytKey = keyInput.value.trim(); saveSettings(); toast(settings.ytKey ? 'Clave guardada' : 'Clave borrada'); });
    const size = h('input', { class: 'plain', type: 'range', min: 15, max: 26, step: 1, value: settings.size, 'aria-label': 'Tamaño de letra' });
    size.addEventListener('input', () => { settings.size = +size.value; applySettings(); saveSettings(); });

    panel.append(
      h('h2', { class: 'sheet-title' }, 'Ajustes'),
      h('div', { class: 'set-group' }, h('h3', null, 'Estilo'),
        h('div', { class: 'styles' }, STYLES.map(s => styleCard(s, redo))),
        h('div', { class: 'set-row' }, h('span', { class: 'set-label' }, 'Modo ahorro: fondo quieto, sin movimiento'),
          seg([[false, 'Apagado'], [true, 'Activado']], !!settings.calm, v => { settings.calm = v; applySettings(); saveSettings(); redo(); }))),
      h('div', { class: 'set-group' }, h('h3', null, 'Fondos con tus fotos'),
        bgRow('home', 'Fondo del inicio', redo),
        bgRow('editor', 'Fondo del bloc', redo)),
      h('div', { class: 'set-group' }, h('h3', null, 'Bloc de notas'),
        h('div', { class: 'set-row' }, h('span', { class: 'set-label' }, 'Letra'),
          seg([['mono', 'Máquina'], ['sans', 'Normal']], settings.font, v => { settings.font = v; applySettings(); saveSettings(); redo(); })),
        h('div', { class: 'set-row' }, h('span', { class: 'set-label' }, 'Tamaño de letra'), size, sample)),
      h('div', { class: 'set-group' }, h('h3', null, 'Rimas'),
        h('div', { class: 'set-row' }, h('span', { class: 'set-label' }, 'Sugerencias de rimas mientras escribís'),
          seg([[true, 'Activadas'], [false, 'Apagadas']], !!settings.rimas.on, v => { settings.rimas.on = v; saveSettings(); updateRhymeVisibility(); redo(); })),
        h('button', { class: 'btn btn-ghost btn-block', onclick: openRimasSheet }, icon('sliders', 20), 'Filtros y diccionario')),
      h('div', { class: 'set-group' }, h('h3', null, 'Beat'),
        h('div', { class: 'set-row' }, h('span', { class: 'set-label' }, 'Repetir el beat cuando termina'),
          seg([[true, 'Sí'], [false, 'No']], settings.repeat, v => { settings.repeat = v; saveSettings(); redo(); }))),
      cloudSection(),
      h('div', { class: 'set-group' }, h('h3', null, 'Buscar dentro de la app'),
        h('p', { class: 'hint' }, 'Sin clave, Buscar abre YouTube y traés el beat con Compartir. Con una clave gratis de YouTube Data API v3 los resultados aparecen acá (alcanza para unas 100 búsquedas por día).'),
        keyInput),
      h('div', { class: 'set-group' }, h('h3', null, 'Copia de seguridad'),
        h('div', { class: 'btn-row' },
          h('button', { class: 'btn btn-ghost', onclick: exportData }, icon('download', 20), 'Exportar'),
          h('button', { class: 'btn btn-ghost', onclick: importData }, icon('upload', 20), 'Importar'))),
      h('div', { class: 'set-group' }, h('h3', null, 'Instalación'),
        matchMedia('(display-mode: standalone)').matches
          ? h('p', { class: 'hint' }, 'Banger Maker ya está instalada en este celular.')
          : installPrompt
            ? h('button', { class: 'btn btn-primary btn-block', onclick: async () => { installPrompt.prompt(); await installPrompt.userChoice.catch(() => {}); installPrompt = null; redo(); } }, 'Instalar en este celular')
            : h('p', { class: 'hint' }, 'En Chrome tocá el menú ⋮ y elegí «Instalar app» o «Agregar a la pantalla principal».')),
      h('div', { class: 'version' }, 'Banger Maker ' + VERSION)
    );
    panel.scrollTop = prevScroll;
  }, { kind: 'settings' });
}


/* ---------- nube (Firebase: Google + Firestore) ---------- */
const cloud = { cfg: lsGet(K.cloud, null), mods: null, app: null, auth: null, fs: null, user: null, unsub: null, state: 'off', detail: '', first: true, pushTimer: null };

const SYNC_LABEL = { off: 'Sin nube', signedout: 'Entrar', syncing: 'Sincronizando', synced: 'En la nube', offline: 'Sin conexión', error: 'Error de nube' };
function setSync(state, detail = '') {
  cloud.state = state; cloud.detail = detail;
  const pill = $('#sync-pill');
  if (pill) { pill.dataset.state = state; pill.textContent = SYNC_LABEL[state] || ''; }
  if (sheet && sheet.kind === 'settings' && !sheet.panel.contains(document.activeElement)) openSettings();
}

function cloudError(e) {
  const c = (e && e.code) || '';
  if (c === 'auth/unauthorized-domain') return 'Este sitio no está autorizado. Agregalo en Authentication → Configuración → Dominios autorizados.';
  if (c === 'auth/operation-not-allowed') return 'Falta activar Google en Authentication → Método de acceso.';
  if (c === 'permission-denied' || c === 'firestore/permission-denied') return 'Firestore rechazó el acceso. Revisá que pegaste las reglas de seguridad.';
  if (c === 'auth/network-request-failed') return 'No hay conexión con Google.';
  return (e && e.message) || 'Error desconocido';
}

async function cloudLoad() {
  if (cloud.mods) return cloud.mods;
  const [appM, authM, fsM] = await Promise.all([
    import(FB_BASE + 'firebase-app.js'),
    import(FB_BASE + 'firebase-auth.js'),
    import(FB_BASE + 'firebase-firestore.js')
  ]);
  cloud.mods = { appM, authM, fsM };
  return cloud.mods;
}

async function cloudInit() {
  if (!cloud.cfg) { setSync('off'); return; }
  if (!navigator.onLine) { setSync('offline'); return; }
  try {
    setSync('syncing');
    const { appM, authM, fsM } = await cloudLoad();
    if (!cloud.app) {
      cloud.app = appM.initializeApp(cloud.cfg);
      cloud.auth = authM.getAuth(cloud.app);
      cloud.fs = fsM.getFirestore(cloud.app);
      authM.onAuthStateChanged(cloud.auth, user => {
        cloud.user = user;
        if (user) cloudSubscribe(); else { cloudUnsubscribe(); setSync('signedout'); }
      });
    }
  } catch (e) { setSync(navigator.onLine ? 'error' : 'offline', cloudError(e)); }
}

async function cloudSignIn() {
  try {
    await cloudInit();
    if (!cloud.auth) return;
    const { authM } = cloud.mods;
    const provider = new authM.GoogleAuthProvider();
    try { await authM.signInWithPopup(cloud.auth, provider); }
    catch (e) {
      if (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment') await authM.signInWithRedirect(cloud.auth, provider);
      else if (e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request') throw e;
    }
  } catch (e) { setSync('error', cloudError(e)); }
}

async function cloudSignOut() {
  try { await cloud.mods.authM.signOut(cloud.auth); toast('Saliste. Tus notas siguen en este celular.'); } catch (e) { setSync('error', cloudError(e)); }
}

function cloudUnsubscribe() { if (cloud.unsub) { cloud.unsub(); cloud.unsub = null; } }

function cloudSubscribe() {
  cloudUnsubscribe();
  const { fsM } = cloud.mods;
  cloud.first = true;
  setSync('syncing');
  const col = fsM.collection(cloud.fs, 'users', cloud.user.uid, 'items');
  cloud.unsub = fsM.onSnapshot(col, onRemote, e => setSync('error', cloudError(e)));
}

/* trae lo que cambió en la nube; gana siempre lo más nuevo */
function applyRemote(raw) {
  if (!raw || typeof raw.id !== 'string') return false;
  const r = { ...raw };
  const cd = r.coverData; delete r.coverData;
  const arr = r.kind === 'folder' ? db.folders : db.notes;
  const local = arr.find(x => x.id === r.id);
  if (!local) { arr.push(r); remoteCover(r, cd, true); return true; }
  if ((r.updatedAt || 0) > (local.updatedAt || 0)) {
    const beatChanged = !!(local.beat && local.beat.id) !== !!(r.beat && r.beat.id) || (local.beat && r.beat && local.beat.id !== r.beat.id);
    const oldCover = local.cover;
    Object.assign(local, r);
    dirty.delete(r.id);
    remoteCover(local, cd, local.cover !== oldCover);
    if (E.note === local) {
      if (local.deleted) { toast('Esta nota se eliminó en otro dispositivo'); history.back(); return true; }
      // la nube solo gana si es más nueva que lo último escrito acá, así que es seguro reemplazar el texto
      const ta = bodyInput();
      if (ta.value !== local.body) {
        const pos = ta.selectionStart;
        ta.value = local.body;
        ta.setSelectionRange(Math.min(pos, ta.value.length), Math.min(pos, ta.value.length));
      }
      if (titleInput().value !== local.title) titleInput().value = local.title;
      updateCounts();
      if (beatChanged) adoptNoteBeat(local);
    }
    return true;
  }
  if ((r.updatedAt || 0) < (local.updatedAt || 0)) dirty.add(r.id);
  else dirty.delete(r.id);
  return false;
}

/* lo que se sube: el elemento y, si tiene, su portada */
async function payloadFor(it) {
  const p = JSON.parse(JSON.stringify(it));
  if (it.cover) { const d = await coverData(it.id); if (d) p.coverData = d; }
  return p;
}

function onRemote(snap) {
  let changed = false;
  snap.docChanges().forEach(ch => { if (ch.type !== 'removed' && applyRemote(ch.doc.data())) changed = true; });
  if (cloud.first) {
    cloud.first = false;
    const remote = new Set(snap.docs.map(d => d.id));
    [...db.notes, ...db.folders].forEach(it => { if (!remote.has(it.id)) dirty.add(it.id); });
  }
  persistNow();
  if (changed && ui.view === 'list') renderList();
  cloudSchedule(100);
}

function cloudSchedule(ms) {
  if (!cloud.cfg) return;
  clearTimeout(cloud.pushTimer);
  cloud.pushTimer = setTimeout(cloudPush, ms);
}

function withTimeout(p, ms) {
  return Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(Object.assign(new Error('Tardó demasiado'), { code: 'timeout' })), ms))]);
}

async function cloudPush() {
  if (!cloud.user || !cloud.fs) return;
  if (!navigator.onLine) { setSync('offline'); return; }
  const ids = [...dirty];
  if (!ids.length) { setSync('synced'); return; }
  setSync('syncing');
  const { fsM } = cloud.mods;
  try {
    for (let i = 0; i < ids.length; i += 20) {
      await withTimeout(Promise.all(ids.slice(i, i + 20).map(id => {
        const it = findItem(id);
        if (!it) { dirty.delete(id); return null; }
        const ts = it.updatedAt;
        return payloadFor(it)
          .then(payload => fsM.setDoc(fsM.doc(cloud.fs, 'users', cloud.user.uid, 'items', id), payload))
          .then(() => { if (it.updatedAt === ts) dirty.delete(id); });
      }).filter(Boolean)), 20000);
    }
    persistNow();
    if (dirty.size) cloudSchedule(1500); else setSync('synced');
  } catch (e) {
    setSync(navigator.onLine && e.code !== 'timeout' ? 'error' : 'offline', cloudError(e));
  }
}

function cloudSync() { cloudInit().then(() => cloudSchedule(0)); }

window.addEventListener('online', () => { if (cloud.cfg) { cloudInit().then(() => cloudSchedule(500)); } });
window.addEventListener('offline', () => { if (cloud.cfg) setSync('offline'); });
setInterval(() => { if (cloud.cfg && cloud.user && dirty.size) cloudSchedule(0); }, 60000);



/* ---------- rimas: sugerencias mientras escribís ---------- */
const RM = window.Rimas;
const RD = window.RIMAS_DATOS || { famosos: {} };
const catLabel = id => (DICT_CATS.find(c => c[0] === id) || [0, id])[1];
const RB = { sig: '', token: 0, timer: null, pinned: null, word: '' };
let dictVer = 0;
const saveDict = () => { lsSet(K.dict, dict); dictVer++; };

/* ---- palabras que tengo: listas de la app + mi diccionario + lo que escribí en mis notas ---- */
let SEED = null;
function seedCands() {
  if (SEED) return SEED;
  SEED = [];
  ['comun', 'formal', 'informal', 'jerga', 'marcas'].forEach(k => (RD[k] || []).forEach(e => SEED.push({ w: e.w, say: e.say, cat: k })));
  Object.entries(RD.famosos || {}).forEach(([sub, list]) => list.forEach(e => SEED.push({ w: e.w, say: e.say, cat: 'famosos', sub })));
  return SEED;
}

let seedSay = null;
function sayFor(word) {
  const k = word.toLowerCase();
  const d = dict.find(x => x.lang === 'es' && x.say && x.w.toLowerCase() === k);
  if (d) return d.say;
  if (!seedSay) { seedSay = new Map(); seedCands().forEach(c => { if (c.say && !/\s/.test(c.w)) seedSay.set(c.w.toLowerCase(), c.say); }); }
  return seedSay.get(k);
}

const noteWords = new Map();
const wordsOf = text => new Set(text.toLowerCase().match(/[a-záéíóúüñ]{3,18}/g) || []);
function notesVocab(partialCut) {
  const all = new Set();
  for (const n of liveNotes()) {
    let ws;
    if (E.note === n) ws = wordsOf(partialCut != null ? partialCut : n.body);
    else {
      const c = noteWords.get(n.id);
      if (c && c.u === n.updatedAt) ws = c.ws;
      else { ws = wordsOf(n.title + ' ' + n.body); noteWords.set(n.id, { u: n.updatedAt, ws }); }
    }
    ws.forEach(w => all.add(w));
  }
  return all;
}

/* ---- ¿con qué palabra rimo? ---- */
const TIME_TAG = /^\s*\[\d{1,2}:\d{2}(?::\d{2})?\]\s*/;
function lastWord(s) {
  const m = s.replace(TIME_TAG, '').match(/(\p{L}+(?:['’]\p{L}+)*)[^\p{L}]*$/u);
  return m ? m[1] : '';
}
function findTarget() {
  const ta = bodyInput();
  const v = ta.value;
  const pos = ta.selectionStart == null ? v.length : ta.selectionStart;
  const lines = v.slice(0, pos).split('\n');
  const before = lines[lines.length - 1];
  const prev = lines.length > 1 ? lastWord(lines[lines.length - 2]) : '';
  const hasText = before.replace(TIME_TAG, '').trim().length > 0;
  const partial = (before.match(/\p{L}+$/u) || [''])[0];
  const cut = partial ? v.slice(0, pos - partial.length) + v.slice(pos) : v;
  if (prev) return { word: prev, cut };            // estás escribiendo la barra que tiene que rimar con la de arriba
  if (hasText) { const w = lastWord(before); return w ? { word: w, cut } : null; }
  return null;
}

/* ---- internet: Datamuse (guarda lo ya buscado para usarlo sin conexión) ---- */
const DM_URL = 'https://api.datamuse.com/words';
const netMem = new Map();
async function dmGet(params) {
  const u = new URL(DM_URL);
  Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, v));
  if (settings.rimas.dmKey) u.searchParams.set('k', settings.rimas.dmKey);
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 8000);
  try {
    const r = await fetch(u, { signal: ctl.signal });
    if (!r.ok) throw new Error('http ' + r.status);
    return await r.json();
  } finally { clearTimeout(t); }
}
const freqOf = it => { const t = (it.tags || []).find(x => typeof x === 'string' && x.startsWith('f:')); return t ? parseFloat(t.slice(2)) || 0 : 0; };

async function fetchEs(word, say, mode) {
  const pats = [];
  if (mode !== 'ason') pats.push(...RM.consonantPatterns(word, undefined, 3));
  if (mode !== 'cons') pats.push(...RM.assonantPatterns(word, say).slice(0, 4));
  if (!pats.length) return [];
  const lists = await Promise.all(pats.map(p => dmGet({ v: 'es', sp: p, md: 'f', max: 600 }).catch(() => null)));
  if (lists.every(l => l === null)) throw new Error('sin red');
  const best = new Map();
  lists.forEach(l => (l || []).forEach(it => {
    const w = it.word;
    if (typeof w !== 'string' || !/^[a-záéíóúüñ]{2,16}$/.test(w)) return;
    const f = freqOf(it);
    if (!best.has(w) || best.get(w) < f) best.set(w, f);
  }));
  return [...best].map(([w, f]) => ({ w, f })).sort((a, b) => b.f - a.f).slice(0, 1500);
}

async function fetchEn(word, mode) {
  const [perf, near] = await Promise.all([
    mode === 'ason' ? [] : dmGet({ rel_rhy: word, md: 'fs', max: 400 }),
    mode === 'cons' ? [] : dmGet({ rel_nry: word, md: 'fs', max: 300 })
  ]);
  const conv = (l, rel) => l.filter(it => typeof it.word === 'string' && !/\s/.test(it.word))
    .map(it => ({ w: it.word, n: it.numSyllables || 0, f: freqOf(it), rel }));
  return conv(perf, 'cons').concat(conv(near, 'ason'));
}

async function rimasStore(mode, fn) { try { return await idbDo(mode, fn, 'rimas'); } catch { return null; } }
async function netFor(word, say) {
  const o = settings.rimas;
  const key = `${o.lang}|${o.mode}|${norm(word)}`;
  if (netMem.has(key)) return netMem.get(key);
  const saved = await rimasStore('readonly', s => s.get(key));
  const fresh = saved && now() - saved.t < 30 * 86400000;
  if (fresh) { netMem.set(key, saved.d); return saved.d; }
  if (!navigator.onLine) return saved ? saved.d : null;
  try {
    const d = o.lang === 'en' ? await fetchEn(word, o.mode) : await fetchEs(word, say, o.mode);
    netMem.set(key, d);
    rimasStore('readwrite', s => s.put({ t: now(), d }, key));
    return d;
  } catch { return saved ? saved.d : null; }
}
function rimasPrune() {
  rimasStore('readwrite', s => {
    const rq = s.openCursor();
    rq.onsuccess = () => {
      const c = rq.result;
      if (!c) return;
      if (!c.value || now() - c.value.t > 30 * 86400000) c.delete();
      c.continue();
    };
    return rq;
  });
}

/* ---- inglés: parecido por cómo termina la palabra (aproximado) ---- */
function enKey(w) {
  w = w.toLowerCase().replace(/[^a-z]/g, '');
  const m = w.match(/[aeiouy]+[^aeiouy]+e$/) || w.match(/[aeiouy]+[^aeiouy]*$/);
  return m ? m[0] : w;
}
function enSyl(w) {
  w = w.toLowerCase().replace(/[^a-z]/g, '');
  let n = (w.match(/[aeiouy]+/g) || []).length;
  if (n > 1 && /[^aeiouy]e$/.test(w) && !/[^aeiouy]le$/.test(w)) n--;
  return Math.max(1, n);
}

/* ---- armar la lista ---- */
function wantedCats() {
  const o = settings.rimas;
  const cats = o.cats.slice();
  if (cats.includes('formal') || cats.includes('informal')) cats.push('comun');
  if (o.notas) cats.push('notas');
  return cats;
}

function rankEs(word, net, cut) {
  const o = settings.rimas;
  const cands = dict.filter(d => d.lang === 'es').map(d => ({ w: d.w, say: d.say || undefined, cat: d.cat, mine: true }));
  seedCands().forEach(c => cands.push(c));
  if (o.notas) notesVocab(cut).forEach(w => cands.push({ w, cat: 'notas' }));
  if (net) net.forEach(it => cands.push({ w: it.w, f: it.f, cat: 'comun' }));
  return RM.rank({ w: word, say: sayFor(word) }, cands, {
    mode: o.mode, syl: o.syl, cats: wantedCats(), subs: o.subs, flexS: !!o.flexS, limit: 70
  }).items;
}

function rankEn(word, net, cut) {
  const o = settings.rimas;
  const tw = word.toLowerCase().replace(/’/g, "'"), tk = enKey(tw), tn = enSyl(tw);
  const cats = wantedCats();
  const perf = new Set(), nearS = new Set();
  (net || []).forEach(it => (it.rel === 'cons' ? perf : nearS).add(it.w.toLowerCase()));
  const seen = new Set([tw]);
  const items = [];
  const add = (w, cat, n, rel, extra) => {
    const lw = w.toLowerCase();
    if (seen.has(lw) || !rel) return;
    if (o.mode === 'cons' && rel !== 'cons') return;
    if (o.mode === 'ason' && rel !== 'ason') return;
    if (cats.length && !cats.includes(cat)) return;
    const nb = n >= 4 ? 4 : n;
    if (o.syl.length && !o.syl.includes(nb)) return;
    seen.add(lw);
    let score = rel === 'cons' ? 100 : 50;
    if (n === tn) score += 10;
    score += extra.bonus || 0;
    if (extra.f) score += Math.min(10, Math.log10(extra.f + 1) * 3);
    items.push({ w, cat, n, rel, mine: !!extra.mine, score });
  };
  const relFor = lw => (perf.has(lw) || enKey(lw) === tk ? 'cons' : nearS.has(lw) ? 'ason' : null);
  dict.filter(d => d.lang === 'en').forEach(d => {
    const lw = d.w.toLowerCase();
    if (/\s/.test(lw)) return;
    add(d.w, d.cat, enSyl(lw), relFor(lw), { mine: true, bonus: 8 });
  });
  if (o.notas) notesVocab(cut).forEach(w => add(w, 'notas', enSyl(w), relFor(w), { bonus: 6 }));
  (net || []).forEach(it => add(it.w, 'comun', it.n || enSyl(it.w), it.rel, { f: it.f }));
  items.sort((a, b) => b.score - a.score || a.w.localeCompare(b.w));
  return items.slice(0, 70);
}

/* ---- la barra ---- */
function rhymeOn() { return !!settings.rimas.on && ui.view === 'editor'; }

function updateRhymeVisibility() {
  const show = rhymeOn();
  const bar = $('#rhyme-bar');
  if (bar) bar.hidden = !show;
  const b = $('#btn-rhymes');
  if (b) b.setAttribute('aria-pressed', String(!!settings.rimas.on));
  if (show) scheduleRhyme(0, true);
}

function scheduleRhyme(delay, force) {
  clearTimeout(RB.timer);
  RB.timer = setTimeout(() => refreshRhyme(force), delay == null ? 160 : delay);
}

function renderRhymes(word, items, busy) {
  const list = $('#rhyme-list');
  if (!list) return;
  const tb = $('#rhyme-target');
  tb.replaceChildren(icon('rhyme', 17), h('span', { class: 'w' }, word ? truncate(word, 16) : 'Rimas'));
  tb.classList.toggle('pinned', !!RB.pinned);
  tb.setAttribute('aria-label', word ? `Rimar con ${word}. Tocá para elegir otra palabra` : 'Elegir una palabra para rimar');
  const kids = [];
  if (!word) kids.push(h('span', { class: 'rmsg' }, 'Escribí una barra y te sugiero rimas'));
  else if (!items.length) {
    kids.push(h('span', { class: 'rmsg' },
      busy ? 'Buscando…' : !settings.rimas.cats.length ? 'Elegí algún tipo de palabra' : `Sin rimas con «${truncate(word, 18)}» con estos filtros`));
  } else {
    items.forEach(it => kids.push(h('button', {
      class: 'rchip' + (it.rel === 'ason' ? ' ason' : '') + (it.mine ? ' mine' : ''), 'data-w': it.w, type: 'button'
    }, it.w)));
    if (busy) kids.push(h('span', { class: 'rmsg' }, '…'));
  }
  list.replaceChildren(...kids);
  list.scrollLeft = 0;
}

async function refreshRhyme(force) {
  if (!rhymeOn()) return;
  const o = settings.rimas;
  const tg = RB.pinned ? { word: RB.pinned, cut: null } : findTarget();
  const word = tg ? tg.word : '';
  const sig = [o.lang, o.mode, o.syl.join(), o.cats.join(), o.subs.join(), o.notas, o.net, o.flexS, word, dictVer].join('|');
  if (sig === RB.sig && !force) return;
  RB.sig = sig;
  const my = ++RB.token;
  if (!word) { renderRhymes('', [], false); return; }
  const rank = net => (o.lang === 'en' ? rankEn(word, net, tg.cut) : rankEs(word, net, tg.cut));
  const cached = netMem.get(`${o.lang}|${o.mode}|${norm(word)}`);
  renderRhymes(word, rank(o.net ? cached : null), o.net && !cached);
  if (!o.net || cached) return;
  const net = await netFor(word, o.lang === 'es' ? sayFor(word) : undefined);
  if (my !== RB.token || !rhymeOn()) return;
  renderRhymes(word, rank(net), false);
}

/* tocar una sugerencia la escribe donde está el cursor */
function insertRhyme(word) {
  const ta = bodyInput();
  const v = ta.value;
  let s = ta.selectionStart, e = ta.selectionEnd;
  if (s === e) {
    const part = (v.slice(0, s).match(/\p{L}+$/u) || [''])[0];
    if (part && norm(word).startsWith(norm(part))) s -= part.length;        // completa lo que venías escribiendo
  }
  const before = v.slice(0, s);
  const lead = before && !/[\s(¿¡"“‘'\[-]$/.test(before) ? ' ' : '';
  const text = lead + word;
  ta.focus({ preventScroll: true });
  ta.setSelectionRange(s, e);
  let ok = false;
  try { ok = document.execCommand('insertText', false, text); } catch { ok = false; }
  if (!ok || ta.value === v) {
    ta.value = before + text + v.slice(e);
    const p = before.length + text.length;
    ta.setSelectionRange(p, p);
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

function targetMenu() {
  menuSheet('Rimar con…', [
    { icon: 'pencil', label: 'Elegir otra palabra', run: pinWord },
    RB.pinned ? { icon: 'rhyme', label: 'Volver al automático', run: () => { RB.pinned = null; RB.sig = ''; scheduleRhyme(0); } } : null,
    { icon: 'sliders', label: 'Filtros y diccionario', run: openRimasSheet }
  ]);
}
async function pinWord() {
  const v = await promptSheet({ title: 'Rimar con…', value: RB.pinned || RB.word || '', placeholder: 'Escribí una palabra', okLabel: 'Buscar rimas', maxLength: 30 });
  if (!v) return;
  const w = lastWord(v);
  if (!w) { toast('Escribí una palabra con letras'); return; }
  RB.pinned = w; RB.sig = ''; scheduleRhyme(0);
}

function bindRhymes() {
  const ta = bodyInput();
  ta.addEventListener('input', () => scheduleRhyme(180));
  ['keyup', 'click', 'focus'].forEach(ev => ta.addEventListener(ev, () => scheduleRhyme(120)));
  document.addEventListener('selectionchange', () => { if (document.activeElement === ta) scheduleRhyme(220); });
  const bar = $('#rhyme-bar');
  // tocar la barra no debe cerrar el teclado
  bar.addEventListener('mousedown', e => { if (e.target.closest('button')) e.preventDefault(); });
  $('#rhyme-list').addEventListener('click', e => { const c = e.target.closest('.rchip'); if (c) insertRhyme(c.dataset.w); });
  $('#rhyme-target').addEventListener('click', targetMenu);
  $('#rhyme-filter').addEventListener('click', openRimasSheet);
  $('#btn-rhymes').addEventListener('click', () => {
    settings.rimas.on = !settings.rimas.on;
    saveSettings();
    updateRhymeVisibility();
    toast(settings.rimas.on ? 'Rimas activadas' : 'Rimas apagadas');
  });
}

/* ---- hoja: filtros ---- */
const fchip = (label, on, run) => h('button', { class: 'fchip', type: 'button', 'aria-pressed': String(!!on), onclick: run }, label);
function toggleIn(arr, v) { const i = arr.indexOf(v); if (i < 0) arr.push(v); else arr.splice(i, 1); }

function openRimasSheet() {
  const o = settings.rimas;
  const prev = sheet && sheet.kind === 'rimas' ? sheet.panel.scrollTop : 0;
  const redo = () => { saveSettings(); RB.sig = ''; updateRhymeVisibility(); scheduleRhyme(0); openRimasSheet(); };
  showSheet(panel => {
    const key = h('input', { class: 'field', type: 'password', placeholder: 'Clave de Datamuse (opcional)', autocomplete: 'off', value: o.dmKey || '' });
    key.addEventListener('change', () => { o.dmKey = key.value.trim(); saveSettings(); netMem.clear(); RB.sig = ''; scheduleRhyme(0); toast(o.dmKey ? 'Clave guardada' : 'Clave borrada'); });
    panel.append(
      h('h2', { class: 'sheet-title' }, 'Rimas'),
      h('div', { class: 'set-group' },
        h('div', { class: 'set-row' }, h('span', { class: 'set-label' }, 'Sugerencias mientras escribís'),
          seg([[true, 'Activadas'], [false, 'Apagadas']], !!o.on, v => { o.on = v; redo(); })),
        h('div', { class: 'set-row' }, h('span', { class: 'set-label' }, 'Idioma de la rima'),
          seg([['es', 'Español'], ['en', 'English']], o.lang, v => { o.lang = v; redo(); })),
        h('div', { class: 'set-row' }, h('span', { class: 'set-label' }, 'Tipo de rima'),
          seg([['cons', 'Consonante'], ['ason', 'Asonante'], ['both', 'Las dos']], o.mode, v => { o.mode = v; redo(); }),
          h('p', { class: 'hint tight' }, 'Consonante: suena igual desde la vocal fuerte (plata – mata). Asonante: coinciden solo las vocales (plata – casa). Las asonantes salen con borde punteado.')),
        h('div', { class: 'set-row' }, h('span', { class: 'set-label' }, 'Sílabas de la palabra que rima'),
          h('div', { class: 'fchips' }, [1, 2, 3, 4].map(n => fchip(n === 4 ? '4 o más' : String(n), o.syl.includes(n), () => { toggleIn(o.syl, n); redo(); })))),
        h('div', { class: 'set-row' }, h('span', { class: 'set-label' }, 'Tipo de palabra'),
          h('div', { class: 'fchips' }, RIMA_CATS.map(([id, label]) => fchip(label, o.cats.includes(id), () => { toggleIn(o.cats, id); redo(); }))),
          o.cats.includes('famosos')
            ? h('div', { class: 'fchips sub' }, RIMA_SUBS.map(([id, label]) => fchip(label, o.subs.includes(id), () => { toggleIn(o.subs, id); redo(); })))
            : null,
          h('p', { class: 'hint tight' }, 'Famosos incluye personajes de videojuegos, músicos argentinos y de Estados Unidos, fútbol, historia y cine. El tipo se aplica a mis listas y a tu diccionario; lo que viene de internet cuenta como palabra común.')),
        h('div', { class: 'set-row' }, h('span', { class: 'set-label' }, 'De dónde saco palabras'),
          h('div', { class: 'fchips' },
            fchip('Mis notas', o.notas, () => { o.notas = !o.notas; redo(); }),
            fchip('Internet', o.net, () => { o.net = !o.net; redo(); }))),
        h('div', { class: 'set-row' }, h('span', { class: 'set-label' }, 'Ignorar la S del final (casa – cosas)'),
          seg([[true, 'Sí'], [false, 'No']], !!o.flexS, v => { o.flexS = v; redo(); }))),
      h('div', { class: 'set-group' }, h('h3', null, 'Mi diccionario'),
        h('p', { class: 'hint' }, `Tus propias palabras: jerga de tu barrio, nombres, marcas. Tenés ${dict.length}.`),
        h('button', { class: 'btn btn-primary btn-block', onclick: openDictSheet }, icon('pencil', 20), 'Abrir mi diccionario')),
      o.net ? h('div', { class: 'set-group' }, h('h3', null, 'Internet (Datamuse)'),
        h('p', { class: 'hint' }, 'Las rimas de internet vienen de Datamuse y se guardan en el celular para usarlas sin conexión. Si Datamuse te pide una clave, pegala acá.'),
        key) : null
    );
    panel.scrollTop = prev;
  }, { kind: 'rimas' });
}

/* ---- hoja: mi diccionario ---- */
const DRAFT = { w: '', say: '', cat: 'informal', lang: null };

function openDictSheet() {
  const prev = sheet && sheet.kind === 'dict' ? sheet.panel.scrollTop : 0;
  const redo = () => openDictSheet();
  showSheet(panel => {
    if (!DRAFT.lang) DRAFT.lang = settings.rimas.lang;
    const en = DRAFT.lang === 'en';
    const wIn = h('input', { class: 'field', type: 'text', maxlength: 40, autocomplete: 'off', autocapitalize: 'none', enterkeyhint: 'done',
      placeholder: en ? 'Palabra o nombre (ej.: Kendrick)' : 'Palabra o nombre (ej.: Duki)', value: DRAFT.w });
    wIn.addEventListener('input', () => { DRAFT.w = wIn.value; });
    const sIn = en ? null : h('input', { class: 'field', type: 'text', maxlength: 40, autocomplete: 'off', autocapitalize: 'none',
      placeholder: 'Cómo suena (ej.: náiki)', value: DRAFT.say });
    if (sIn) sIn.addEventListener('input', () => { DRAFT.say = sIn.value; });
    const add = () => {
      const w = wIn.value.trim().replace(/\s+/g, ' ');
      if (w.length < 2 || !/\p{L}/u.test(w)) { toast('Escribí una palabra de al menos 2 letras'); wIn.focus(); return; }
      const say = sIn ? sIn.value.trim() : '';
      const k = w.toLowerCase();
      const cur = dict.find(d => d.lang === DRAFT.lang && d.w.toLowerCase() === k);
      if (cur) { cur.say = say; cur.cat = DRAFT.cat; cur.w = w; } else dict.push({ id: uid(), w, say, cat: DRAFT.cat, lang: DRAFT.lang, t: now() });
      saveDict();
      DRAFT.w = ''; DRAFT.say = '';
      RB.sig = ''; scheduleRhyme(0);
      toast(cur ? 'Palabra actualizada' : 'Palabra agregada');
      redo();
    };
    wIn.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); add(); } });
    const mine = dict.slice().sort((a, b) => (b.t || 0) - (a.t || 0));
    panel.append(
      h('h2', { class: 'sheet-title' }, 'Mi diccionario'),
      h('p', { class: 'hint tight' }, 'Lo que agregues acá aparece primero entre las sugerencias. En «Cómo suena» escribí la pronunciación como se diría en español, con tilde en la vocal fuerte (Nike → náiki).'),
      h('div', { class: 'stack' },
        wIn, sIn,
        h('div', { class: 'set-row' }, h('span', { class: 'set-label' }, 'Idioma'),
          seg([['es', 'Español'], ['en', 'English']], DRAFT.lang, v => { DRAFT.lang = v; redo(); })),
        h('div', { class: 'set-row' }, h('span', { class: 'set-label' }, 'Tipo'),
          h('div', { class: 'fchips' }, DICT_CATS.map(([id, label]) => fchip(label, DRAFT.cat === id, () => { DRAFT.cat = id; redo(); })))),
        h('button', { class: 'btn btn-primary btn-block', onclick: add }, icon('plus', 20), 'Agregar')),
      h('div', { class: 'set-group' }, h('h3', null, mine.length ? `Mis palabras (${mine.length})` : 'Todavía no agregaste palabras'),
        h('div', { class: 'dict-list' }, mine.map(d => h('div', { class: 'dict-row' },
          h('div', { class: 'dict-main' },
            h('strong', null, d.w),
            h('span', { class: 'dict-sub' }, [d.say ? `suena «${d.say}»` : '', catLabel(d.cat), d.lang === 'en' ? 'English' : 'Español'].filter(Boolean).join(' · '))),
          h('button', { class: 'icon-btn sm', 'aria-label': 'Borrar ' + d.w, onclick: () => {
            const i = dict.indexOf(d);
            if (i < 0) return;
            dict.splice(i, 1); saveDict(); RB.sig = ''; scheduleRhyme(0);
            toast('Palabra borrada', { label: 'Deshacer', run: () => { dict.push(d); saveDict(); RB.sig = ''; scheduleRhyme(0); if (sheet && sheet.kind === 'dict') redo(); } });
            redo();
          } }, icon('trash', 20)))))),
      h('div', { class: 'btn-row' }, h('button', { class: 'btn btn-ghost', onclick: openRimasSheet }, 'Volver a Rimas'))
    );
    panel.scrollTop = prev;
  }, { kind: 'dict' });
}

/* ---------- navegación ---------- */
function showList(folderId) {
  if (E.note) leaveEditor();
  ui.folderId = folderId || null;
  ui.query = '';
  $('#search').value = '';
  setView('list');
  renderList();
}

function openFolder(id) {
  try { history.pushState({ v: 'list', f: id }, '', location.pathname); } catch { /* ignore */ }
  showList(id);
}

function openNote(id) {
  try { history.pushState({ v: 'editor', n: id }, '', location.pathname); } catch { /* ignore */ }
  showEditor(id);
}

function newNote(folderId, beat) {
  const n = newNoteObj(folderId === undefined ? ui.folderId : folderId);
  db.notes.push(n);
  persistSoon();
  openNote(n.id);
  if (beat) chooseBeat(beat);
}

function onPop(e) {
  if (ignorePop) { ignorePop = false; return; }
  if (sheet) { ignorePop = true; history.forward(); closeSheet(); return; }
  const st = e.state;
  if (!st || st.s === 'root') { history.back(); return; }
  if (st.v === 'editor') showEditor(st.n); else showList(st.f);
}

/* ---------- teclado y tamaño de pantalla ---------- */
function setupViewport() {
  const vv = window.visualViewport;
  const root = document.documentElement;
  let baseH = 0, baseW = 0;
  const update = () => {
    const hh = vv ? vv.height : window.innerHeight;
    const ww = vv ? vv.width : window.innerWidth;
    if (Math.abs(ww - baseW) > 2) { baseW = ww; baseH = 0; }
    baseH = Math.max(baseH, hh, window.innerHeight);
    root.style.setProperty('--app-h', hh + 'px');
    root.style.setProperty('--app-top', (vv ? vv.offsetTop : 0) + 'px');
    root.classList.toggle('kbd', baseH - hh > 140);
  };
  if (vv) { vv.addEventListener('resize', update); vv.addEventListener('scroll', update); }
  window.addEventListener('resize', update);
  update();
}

/* ---------- conexión de botones ---------- */
function bind() {
  $('#btn-new-note').addEventListener('click', () => newNote());
  $('#btn-new-folder').addEventListener('click', createFolder);
  $('#btn-settings').addEventListener('click', openSettings);
  $('#sync-pill').addEventListener('click', openSettings);
  $('#btn-folder-back').addEventListener('click', () => history.back());
  $('#btn-folder-menu').addEventListener('click', () => { const f = folderById(ui.folderId); if (f) folderMenu(f); });
  $('#search').addEventListener('input', e => { ui.query = e.target.value; renderList(); });

  $('#btn-editor-back').addEventListener('click', () => history.back());
  $('#btn-editor-menu').addEventListener('click', editorMenu);
  $('#beat-empty').addEventListener('click', () => openBeatSheet());
  $('#beat-chip').addEventListener('click', () => openBeatSheet());

  $('#np-change').addEventListener('click', () => openBeatSheet({ forPlayer: true }));
  $('#np-close').addEventListener('click', closePlayer);
  $('#btn-swap').addEventListener('click', swapBeat);

  titleInput().addEventListener('input', onEdit);
  bodyInput().addEventListener('input', onEdit);
  titleInput().addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); bodyInput().focus(); } });

  // al escribir en el bloc con el teclado abierto se esconde la barra de arriba para ganar renglones
  const root = document.documentElement;
  bodyInput().addEventListener('focus', () => root.classList.add('typing'));
  bodyInput().addEventListener('blur', () => root.classList.remove('typing'));

  bindPlayer();
  bindRhymes();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { flushEdit(); if (cloud.cfg) cloudSchedule(0); }
    else updateAwake();
  });
  window.addEventListener('pagehide', flushEdit);
}

function registerSW() {
  if ('serviceWorker' in navigator && /^https?:/.test(location.protocol)) {
    navigator.serviceWorker.register('sw.js').catch(() => { /* la app funciona igual sin esto */ });
  }
}

/* ---------- arranque ---------- */
function boot() {
  applySettings();
  hydrateIcons();
  bind();
  setupViewport();
  applyBackground('home');
  applyBackground('editor');

  const params = new URLSearchParams(location.search);
  const wasShare = params.has('url') || params.has('text') || params.has('title');
  const shared = [params.get('url'), params.get('text'), params.get('title')].filter(Boolean).join(' ');

  try {
    history.replaceState({ s: 'root' }, '', location.pathname);
    history.pushState({ v: 'list', f: null }, '', location.pathname);
  } catch { /* ignore */ }
  window.addEventListener('popstate', onPop);

  setSync(cloud.cfg ? 'syncing' : 'off');
  showList(null);
  preloadCovers().then(any => { if (any) refreshList(); }).catch(() => { /* sin portadas */ });

  if (wasShare) {
    const yt = parseYouTube(shared);
    if (yt) receiveBeat(yt); else toast('No encontré un link de YouTube en lo que compartiste.');
  }
  registerSW();
  cloudInit();
  setTimeout(rimasPrune, 5000);
}

boot();
})();
