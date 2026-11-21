/* Banger Maker — lógica de la app (sin dependencias) */
(() => {
'use strict';

const VERSION = '1.0.0';
const K = { data: 'bm:data', settings: 'bm:settings', cloud: 'bm:cloud', dirty: 'bm:dirty' };
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
  check: '<path d="M5 12.5l4.5 4.5L19 7"/>'
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
const settings = Object.assign(
  { theme: 'dark', font: 'mono', size: 18, ytKey: '', repeat: true },
  lsGet(K.settings, {})
);

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
  return { id: uid(), kind: 'note', folderId: folderId || null, title: '', body: '', beat: null, createdAt: t, updatedAt: t, deleted: false };
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

/* ---------- carpetas y notas: acciones ---------- */
async function createFolder() {
  const name = await promptSheet({ title: 'Nueva carpeta', placeholder: 'Por ejemplo: Trap', okLabel: 'Crear', maxLength: 40 });
  if (!name) return null;
  const t = now();
  const f = { id: uid(), kind: 'folder', name, createdAt: t, updatedAt: t, deleted: false };
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
    { icon: 'trash', label: 'Eliminar carpeta', danger: true, run: () => deleteFolder(f) }
  ]);
}
function noteMenu(n) {
  menuSheet(n.title || 'Sin título', [
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
  $('#btn-folder-back').hidden = !inFolder;
  $('#btn-folder-menu').hidden = !inFolder;
  $('#folder-name').hidden = !inFolder;
  $('#brand').hidden = inFolder;
  $('#sync-pill').hidden = inFolder;
  $('#btn-new-folder').hidden = inFolder;
  if (inFolder) $('#folder-name').textContent = folder.name;

  const all = liveNotes();
  const q = norm(ui.query.trim());
  $('#search-wrap').hidden = inFolder || all.length === 0;

  const rowFor = n => {
    const fol = folderById(n.folderId);
    return h('div', { class: 'note-row' },
      h('button', { class: 'note-main', onclick: () => openNote(n.id) },
        h('div', { class: 'note-title' + (n.title ? '' : ' empty') }, n.title || 'Sin título'),
        previewOf(n) ? h('div', { class: 'note-preview' }, previewOf(n)) : null,
        h('div', { class: 'note-meta' },
          n.beat ? h('span', { class: 'chip' }, icon('music', 14), h('span', null, n.beat.title || 'Beat de YouTube')) : null,
          q && fol ? h('span', null, fol.name) : null,
          h('span', null, fmtDate(n.updatedAt)))),
      h('button', { class: 'icon-btn sm row-menu', 'aria-label': 'Opciones de la nota', onclick: () => noteMenu(n) }, icon('more', 20)));
  };
  const byDate = (a, b) => b.updatedAt - a.updatedAt;

  if (q) {
    const hitsF = liveFolders().filter(f => norm(f.name).includes(q));
    const hitsN = all.filter(n => norm(n.title).includes(q) || norm(n.body).includes(q)).sort(byDate);
    if (!hitsF.length && !hitsN.length) {
      root.append(h('div', { class: 'empty-state' }, h('strong', null, 'No hay resultados'), `No encontré nada con «${ui.query.trim()}».`));
      return;
    }
    if (hitsF.length) root.append(h('div', { class: 'section-label' }, 'Carpetas'), tilesFor(hitsF));
    if (hitsN.length) root.append(h('div', { class: 'section-label' }, 'Notas'), ...hitsN.map(rowFor));
    return;
  }

  if (inFolder) {
    const notes = all.filter(n => n.folderId === folder.id).sort(byDate);
    if (!notes.length) {
      root.append(h('div', { class: 'empty-state' }, h('strong', null, 'Esta carpeta está vacía'), 'Tocá «Nueva nota» para escribir sobre un beat.'));
    } else root.append(...notes.map(rowFor));
    return;
  }

  const folders = liveFolders().sort((a, b) => a.name.localeCompare(b.name, 'es'));
  const loose = all.filter(n => !folderById(n.folderId)).sort(byDate);
  if (!folders.length && !loose.length) {
    root.append(h('div', { class: 'empty-state' }, h('strong', null, 'Todavía no hay notas'),
      'Creá una nota para escribir sobre un beat, o una carpeta para ordenarlas por tema.'));
    return;
  }
  if (folders.length) root.append(h('div', { class: 'section-label' }, 'Carpetas'), tilesFor(folders));
  if (loose.length) root.append(h('div', { class: 'section-label' }, folders.length ? 'Sin carpeta' : 'Notas'), ...loose.map(rowFor));
}

function tilesFor(folders) {
  const count = f => liveNotes().filter(n => n.folderId === f.id).length;
  return h('div', { class: 'tiles' }, folders.map(f => {
    const c = count(f);
    return h('div', { class: 'tile', style: `--tape:${tapeFor(f.id)}` },
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

function showEditor(id) {
  const n = db.notes.find(x => x.id === id && !x.deleted);
  if (!n) { showList(null); return; }
  if (E.note && E.note !== n) leaveEditor();
  E.note = n;
  ui.view = 'editor';
  $('#view-list').hidden = true;
  $('#view-editor').hidden = false;
  titleInput().value = n.title;
  bodyInput().value = n.body;
  bodyInput().scrollTop = 0;
  updateCounts();
  setSaveState('saved');
  renderBeatStrip({ autoplay: false });
  keepAwake(true);
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
  destroyPlayer();
  keepAwake(false);
  E.note = null;
  if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
}

function renderBeatStrip({ autoplay = false } = {}) {
  const n = E.note;
  if (!n) return;
  const has = !!n.beat;
  $('#beat-empty').hidden = has;
  $('#beat-wrap').hidden = !has;
  updateChip();
  if (has) mountPlayer(n.beat, { autoplay }); else destroyPlayer();
}

/* pantalla encendida mientras escribís */
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

/* ---------- reproductor de YouTube ---------- */
const P = { player: null, ready: false, vid: null, a: null, b: null, rate: 1, dragging: false, timer: null, dur: 0, playing: false, token: 0, apiPromise: null };

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
  m.onclick = retry ? () => { if (E.note && E.note.beat) mountPlayer(E.note.beat, { autoplay: false }); } : null;
}

function setPlayIcon(playing) {
  P.playing = playing;
  const b = $('#c-play');
  b.innerHTML = svg(playing ? 'pause' : 'play', 20);
  b.setAttribute('aria-label', playing ? 'Pausar' : 'Reproducir');
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

function destroyPlayer() {
  P.token++;
  clearInterval(P.timer); P.timer = null;
  try { if (P.player && P.player.destroy) P.player.destroy(); } catch { /* ya no existe */ }
  P.player = null; P.ready = false; P.vid = null; P.playing = false;
  const holder = $('#yt-holder');
  if (holder) holder.replaceChildren();
}

async function mountPlayer(beat, { autoplay = false } = {}) {
  destroyPlayer();
  const token = P.token;
  P.vid = beat.id; P.a = beat.a ?? null; P.b = beat.b ?? null; P.rate = 1; P.dur = 0; P.dragging = false;
  setPlayIcon(false); updateTimeUI(0); updateLoopUI(); setSpeedLabel(); showPlayerMsg('');
  $('#yt-holder').replaceChildren(h('div', { id: 'yt-target' }));
  try { await loadYTApi(); } catch {
    if (token === P.token) showPlayerMsg('Sin conexión. Tus notas funcionan igual. Tocá acá para reintentar el beat.', true);
    return;
  }
  if (token !== P.token || !E.note) return;
  const vars = { playsinline: 1, controls: 0, disablekb: 1, fs: 0, rel: 0, modestbranding: 1, iv_load_policy: 3, autoplay: autoplay ? 1 : 0 };
  if (/^https?:/.test(location.origin)) vars.origin = location.origin;
  P.player = new window.YT.Player('yt-target', {
    width: '200', height: '200', videoId: beat.id, playerVars: vars,
    events: {
      onReady: () => {
        if (token !== P.token) return;
        P.ready = true;
        P.timer = setInterval(tick, 150);
        if (autoplay) { try { P.player.playVideo(); } catch { /* sin permiso */ } }
        syncTitleFromPlayer();
      },
      onStateChange: e => {
        if (token !== P.token) return;
        const s = e.data;
        if (s === 1) setPlayIcon(true);
        else if (s === 2 || s === 5) setPlayIcon(false);
        else if (s === 0) onEnded();
        if (s === 1) syncTitleFromPlayer();
      },
      onError: e => {
        if (token !== P.token) return;
        const c = e.data;
        showPlayerMsg(
          c === 101 || c === 150 ? 'El dueño de este video no deja reproducirlo acá. Elegí otro beat.' :
          c === 100 || c === 2 ? 'Este video no está disponible. Elegí otro beat.' :
          'No se pudo reproducir. Revisá tu conexión.');
      }
    }
  });
}

function syncTitleFromPlayer() {
  const n = E.note;
  if (!n || !n.beat || n.beat.title || !P.player || !P.player.getVideoData) return;
  try {
    const t = (P.player.getVideoData() || {}).title;
    if (t) { n.beat.title = t; touch(n); updateChip(); }
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
  const n = E.note;
  if (!n || !n.beat) return;
  n.beat.a = P.a; n.beat.b = P.b;
  touch(n);
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
  $('#c-mark').addEventListener('click', withFocus(() => { if (E.note) markTime(); }));

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
  renderBeatStrip({ autoplay: true });
  if (!n.beat.title) {
    fetchTitle(info.id).then(t => {
      if (t && E.note === n && n.beat && n.beat.id === info.id && !n.beat.title) { n.beat.title = t; touch(n); updateChip(); }
    });
  }
}

function clearBeat() {
  const n = E.note;
  if (!n) return;
  n.beat = null; touch(n); persistNow();
  renderBeatStrip();
}

function openBeatSheet() {
  const n = E.note;
  if (!n) return;
  showSheet((panel, close) => {
    const pick = info => { close(); chooseBeat(info); };
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
      h('h2', { class: 'sheet-title' }, 'Elegir beat'),
      h('div', { class: 'stack' }, input,
        h('div', { class: 'btn-row' },
          h('button', { class: 'btn btn-ghost', onclick: paste }, icon('paste', 20), 'Pegar link'),
          h('button', { class: 'btn btn-primary', onclick: go }, icon('search', 20), 'Buscar'))),
      msg, results,
      used.length ? h('div', { class: 'list-label' }, 'Beats que ya usaste') : null,
      used.length ? h('div', { class: 'beat-list' }, used.map(b => beatItem(b, `${b.count} ${b.count === 1 ? 'nota' : 'notas'}`, () => pick(b)))) : null,
      n.beat ? h('div', { class: 'actions', style: 'margin-top:10px' },
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
    { icon: 'music', label: n.beat ? 'Cambiar beat' : 'Elegir beat', run: openBeatSheet },
    { icon: 'move', label: 'Mover a carpeta', run: () => moveSheet(n) },
    { icon: 'copy', label: 'Copiar texto', run: copyNoteText },
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

function applySettings() {
  const r = document.documentElement;
  r.dataset.theme = settings.theme;
  r.dataset.font = settings.font;
  r.style.setProperty('--note-size', settings.size + 'px');
  r.style.setProperty('--note-lh', Math.round(settings.size * 1.78) + 'px');
  const dark = settings.theme === 'dark' || (settings.theme === 'auto' && !matchMedia('(prefers-color-scheme: light)').matches);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = dark ? '#171933' : '#f1f2fa';
}

function seg(options, current, onPick) {
  return h('div', { class: 'seg', role: 'group' }, options.map(([val, label]) =>
    h('button', { 'aria-pressed': String(current === val), onclick: () => onPick(val) }, label)));
}

function exportData() {
  const payload = { app: 'banger-maker', version: 1, exportedAt: new Date().toISOString(), folders: db.folders, notes: db.notes };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
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
      const merge = (list, arr, kind) => list.forEach(it => {
        if (!it || typeof it.id !== 'string') return;
        const cur = arr.find(x => x.id === it.id);
        if (!cur) { arr.push({ ...it, kind }); dirty.add(it.id); if (!it.deleted) added++; }
        else if ((it.updatedAt || 0) > (cur.updatedAt || 0)) { Object.assign(cur, it, { kind }); dirty.add(it.id); }
      });
      merge(j.folders, db.folders, 'folder');
      merge(j.notes, db.notes, 'note');
      persistNow(); cloudSchedule(500); renderList();
      toast(added ? `Se importaron ${added} elementos` : 'No había nada nuevo para importar');
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
      h('div', { class: 'set-group' }, h('h3', null, 'Apariencia'),
        h('div', { class: 'set-row' }, h('span', { class: 'set-label' }, 'Tema'),
          seg([['dark', 'Oscuro'], ['light', 'Claro'], ['auto', 'Del celular']], settings.theme, v => { settings.theme = v; applySettings(); saveSettings(); redo(); })),
        h('div', { class: 'set-row' }, h('span', { class: 'set-label' }, 'Letra del bloc'),
          seg([['mono', 'Máquina'], ['sans', 'Normal']], settings.font, v => { settings.font = v; applySettings(); saveSettings(); redo(); })),
        h('div', { class: 'set-row' }, h('span', { class: 'set-label' }, 'Tamaño de letra'), size, sample)),
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
function applyRemote(r) {
  if (!r || typeof r.id !== 'string') return false;
  const arr = r.kind === 'folder' ? db.folders : db.notes;
  const local = arr.find(x => x.id === r.id);
  if (!local) { arr.push(r); return true; }
  if ((r.updatedAt || 0) > (local.updatedAt || 0)) {
    const beatChanged = !!(local.beat && local.beat.id) !== !!(r.beat && r.beat.id) || (local.beat && r.beat && local.beat.id !== r.beat.id);
    Object.assign(local, r);
    dirty.delete(r.id);
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
      if (beatChanged) renderBeatStrip();
    }
    return true;
  }
  if ((r.updatedAt || 0) < (local.updatedAt || 0)) dirty.add(r.id);
  else dirty.delete(r.id);
  return false;
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
        const payload = JSON.parse(JSON.stringify(it));
        return fsM.setDoc(fsM.doc(cloud.fs, 'users', cloud.user.uid, 'items', id), payload)
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

/* ---------- navegación ---------- */
function showList(folderId) {
  if (E.note) leaveEditor();
  ui.view = 'list';
  ui.folderId = folderId || null;
  ui.query = '';
  $('#search').value = '';
  $('#view-editor').hidden = true;
  $('#view-list').hidden = false;
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
  $('#beat-empty').addEventListener('click', openBeatSheet);
  $('#beat-chip').addEventListener('click', openBeatSheet);

  titleInput().addEventListener('input', onEdit);
  bodyInput().addEventListener('input', onEdit);
  titleInput().addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); bodyInput().focus(); } });

  bindPlayer();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { flushEdit(); if (cloud.cfg) cloudSchedule(0); }
    else if (ui.view === 'editor') keepAwake(true);
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

  if (wasShare) {
    const yt = parseYouTube(shared);
    if (yt) receiveBeat(yt); else toast('No encontré un link de YouTube en lo que compartiste.');
  }
  registerSW();
  cloudInit();
}

boot();
})();
