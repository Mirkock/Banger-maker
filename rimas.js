/* Banger Maker — motor de rimas en español (oído argentino).
   Separa sílabas, encuentra la sílaba tónica y compara la parte que rima.
   No usa internet: todo lo que hace este archivo es cálculo local. */
(function (root) {
  'use strict';

  const STRONG = 'aeoáéó';
  const isVowelCh = c => 'aeiouáéíóúü'.includes(c);
  const isStrong = c => STRONG.includes(c);
  const isAccWeak = c => c === 'í' || c === 'ú';
  const isAcc = c => 'áéíóú'.includes(c);
  const BASE = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', ü: 'u' };

  // grupos de consonantes que no se separan: pr, br, tr, pl, bl, cl...
  const INSEP = new Set(['pl', 'bl', 'fl', 'kl', 'gl', 'pr', 'br', 'fr', 'kr', 'gr', 'tr', 'dr']);

  function clean(word) {
    return String(word || '').toLowerCase().normalize('NFC').replace(/[^a-záéíóúüñ]/g, '');
  }

  /* convierte letras en sonidos: {v:'a', acc:true} para vocales, {c:'s'} para consonantes */
  function tokenize(s) {
    const t = [];
    const n = s.length;
    for (let i = 0; i < n; i++) {
      const ch = s[i], nx = s[i + 1] || '', pv = s[i - 1] || '';
      const last = i === n - 1;
      if (isVowelCh(ch)) {
        // la u de "que, qui, gue, gui" no suena
        if (ch === 'u' && (pv === 'q' || pv === 'g') && 'eiéí'.includes(nx)) continue;
        t.push({ v: BASE[ch] || ch, acc: isAcc(ch), diaer: ch === 'ü', pos: i });
        continue;
      }
      if (ch === 'y') {
        // "y" final o antes de consonante suena como i (hoy, rey, Tony)
        if (last || !isVowelCh(nx)) { t.push({ v: 'i', acc: false, y: true, pos: i }); continue; }
        t.push({ c: 'y', pos: i }); continue;
      }
      if (ch === 'h') { t.push({ c: '', h: true, pos: i }); continue; }
      if (ch === 'c' && nx === 'h') { t.push({ c: 'ch', pos: i }); i++; continue; }
      if (ch === 'l' && nx === 'l') { t.push({ c: 'y', pos: i }); i++; continue; }      // ll = y (se dice igual)
      if (ch === 'r' && nx === 'r') { t.push({ c: 'R', pos: i }); i++; continue; }
      if (ch === 'r') {
        const prev = t.length ? t[t.length - 1] : null;
        const strong = !prev || (prev.c && 'nls'.includes(prev.c));
        t.push({ c: strong ? 'R' : 'r', pos: i }); continue;
      }
      if (ch === 'c') { t.push({ c: 'eiéí'.includes(nx) ? 's' : 'k', pos: i }); continue; }   // seseo
      if (ch === 'z' || ch === 's') { t.push({ c: 's', pos: i }); continue; }
      if (ch === 'v' || ch === 'b') { t.push({ c: 'b', pos: i }); continue; }               // b = v
      if (ch === 'q' || ch === 'k') { t.push({ c: 'k', pos: i }); continue; }
      if (ch === 'j') { t.push({ c: 'x', pos: i }); continue; }
      if (ch === 'g') { t.push({ c: 'eiéí'.includes(nx) ? 'x' : 'g', pos: i }); continue; }
      if (ch === 'x') { t.push({ c: 'ks', pos: i }); continue; }
      if (ch === 'w') { t.push({ c: 'w', pos: i }); continue; }
      t.push({ c: ch, pos: i });           // p t d f l m n ñ
    }
    return t;
  }

  /* agrupa vocales en núcleos (diptongos, triptongos y hiatos) */
  const isWeakTk = tk => (tk.v === 'i' || tk.v === 'u') && !tk.acc;   // i/u sin tilde
  function nucleiOf(tokens) {
    const nuclei = [];
    let cur = null, prevIdx = -2;
    tokens.forEach((tk, i) => {
      if (tk.v === undefined) { cur = null; return; }
      if (cur && prevIdx === i - 1) {
        const last = cur.toks[cur.toks.length - 1];
        const hasStrong = cur.toks.some(x => !isWeakTk(x));
        let join = false;
        if (hasStrong) join = isWeakTk(tk) && isWeakTk(last) === false;     // a/e/o + i/u (una sola)
        else if (isWeakTk(tk)) join = tk.v !== last.v;                       // iu, ui
        else join = !tk.acc || !(tk.v === 'i' || tk.v === 'u');              // i/u + a/e/o (no í/ú)
        if (join) { cur.toks.push(tk); cur.acc = cur.acc || tk.acc; prevIdx = i; return; }
      }
      cur = { toks: [tk], acc: tk.acc, start: i };
      nuclei.push(cur);
      prevIdx = i;
    });
    return nuclei;
  }

  /* sílabas: devuelve cuántas son y cuál lleva el golpe (la tónica) */
  function syllabify(s) {
    const tokens = tokenize(s);
    const nuclei = nucleiOf(tokens);
    const n = nuclei.length;
    if (!n) return { tokens, nuclei, n: 0, stress: -1, syl: [] };

    // partir consonantes entre núcleos
    const syl = nuclei.map(nu => ({ nucleus: nu, onset: [], coda: [] }));
    for (let k = 0; k < n; k++) {
      const from = nuclei[k].start + nuclei[k].toks.length;
      const to = k + 1 < n ? nuclei[k + 1].start : tokens.length;
      const cl = tokens.slice(from, to).filter(x => x.c !== undefined);
      if (k === n - 1) { syl[k].coda = cl; continue; }
      if (cl.length === 0) continue;
      if (cl.length === 1) { syl[k + 1].onset = cl; continue; }
      const a = cl[cl.length - 2], b = cl[cl.length - 1];
      if (INSEP.has(a.c + b.c) && !a.h && !b.h) { syl[k].coda = cl.slice(0, -2); syl[k + 1].onset = cl.slice(-2); }
      else { syl[k].coda = cl.slice(0, -1); syl[k + 1].onset = [b]; }
    }
    syl[0].onset = tokens.slice(0, nuclei[0].start).filter(x => x.c !== undefined).concat(syl[0].onset);

    // sílaba tónica
    let stress = nuclei.findIndex(nu => nu.acc);
    if (stress < 0) {
      if (n === 1) stress = 0;
      else {
        const lastCh = s[s.length - 1];
        stress = ('aeiouáéíóúüns'.includes(lastCh)) ? n - 2 : n - 1;
      }
    }
    return { tokens, nuclei, n, stress, syl };
  }

  /* la vocal que cuenta en la rima asonante */
  function assonVowel(nu, stressed) {
    const vs = nu.toks.map(t => t.v);
    const strongs = nu.toks.filter(t => t.v === 'a' || t.v === 'e' || t.v === 'o');
    let v;
    if (strongs.length) v = strongs[0].v;                 // en un diptongo cuenta la fuerte
    else v = vs.length > 1 ? vs[vs.length - 1] : vs[0];   // iu, ui: cuenta la última
    if (!stressed) v = v === 'i' ? 'e' : v === 'u' ? 'o' : v; // sin acento, e≈i y o≈u
    return v;
  }

  /* qué vocal del núcleo lleva el golpe: la que tiene tilde, si no la fuerte (a, e, o), si no la última */
  function stressedTok(nu) {
    let i = nu.toks.findIndex(t => t.acc);
    if (i >= 0) return i;
    i = nu.toks.findIndex(t => !isWeakTk(t));
    return i >= 0 ? i : nu.toks.length - 1;
  }

  const cache = new Map();

  /* analiza una palabra. say = cómo suena (para nombres y marcas en inglés) */
  function analyze(word, opts) {
    opts = opts || {};
    const say = opts.say, flexS = !!opts.flexS;
    const key = String(word) + '\u0001' + (say || '') + '\u0001' + (flexS ? 1 : 0);
    if (cache.has(key)) return cache.get(key);
    // si es un nombre con varias palabras y no hay "se pronuncia", rima la última palabra
    const lastW = String(word || '').trim().split(/\s+/).pop();
    const s = clean(say || lastW);
    const out = { w: String(word || ''), n: 0, stress: -1, kc: '', ka: '', ok: false, rimaEscrita: '' };
    if (s.length) {
      const sy = syllabify(s);
      if (sy.n) {
        out.ok = true; out.n = sy.n; out.stress = sy.stress;
        const nuS = sy.nuclei[sy.stress];
        const from = nuS.start + stressedTok(nuS);   // la rima empieza en la vocal acentuada (no en la semivocal previa)
        let kc = '';
        for (let i = from; i < sy.tokens.length; i++) {
          const t = sy.tokens[i];
          kc += t.v !== undefined ? t.v : t.c;
        }
        if (flexS && kc.length > 1 && kc.endsWith('s') && 'aeiou'.includes(kc[kc.length - 2])) kc = kc.slice(0, -1);
        out.kc = kc;
        let ka = '';
        for (let k = sy.stress; k < sy.n; k++) ka += assonVowel(sy.nuclei[k], k === sy.stress);
        out.ka = ka;
        const base = clean(lastW);
        out.rimaEscrita = say ? '' : base.slice(Math.min(base.length, (sy.tokens[from] ? sy.tokens[from].pos : 0)));
        out.sy = sy;
      }
    }
    cache.set(key, out);
    return out;
  }

  const syllableCount = (word, say) => analyze(word, { say }).n;

  /* ¿rima b con a?  'cons' | 'ason' | null */
  function relation(a, b) {
    if (!a.ok || !b.ok) return null;
    if (a.kc && a.kc === b.kc) return 'cons';
    if (a.ka && a.ka === b.ka) return 'ason';
    return null;
  }

  /* ---------- patrones de búsqueda para listas grandes (Datamuse, español) ---------- */
  // letras que suenan igual → alternativas de escritura
  function spellingVariants(part, limit) {
    const slots = [];
    const out = [];
    let i = 0;
    const alts = [];
    while (i < part.length) {
      const two = part.slice(i, i + 2), ch = part[i], nx = part[i + 1] || '';
      if (two === 'll') { alts.push(['ll', 'y']); i += 2; continue; }
      if (ch === 'b' || ch === 'v') { alts.push(['b', 'v']); i++; continue; }
      if ((ch === 'c' && 'eiéí'.includes(nx))) { alts.push(['c', 's', 'z']); i++; continue; }
      if (ch === 's' || ch === 'z') { alts.push(['s', 'z'].concat('eiéí'.includes(nx) ? ['c'] : [])); i++; continue; }
      if (ch === 'j' || (ch === 'g' && 'eiéí'.includes(nx))) { alts.push(ch === 'j' ? ['j', 'g'] : ['g', 'j']); i++; continue; }
      alts.push([ch]); i++;
    }
    const build = (idx, acc) => {
      if (out.length >= (limit || 8)) return;
      if (idx === alts.length) { out.push(acc); return; }
      for (const a of alts[idx]) { if (out.length >= (limit || 8)) return; build(idx + 1, acc + a); }
    };
    build(0, '');
    // la ortografía original primero
    out.sort((x, y) => (x === part ? -1 : y === part ? 1 : 0));
    return out;
  }

  /* patrones tipo "*ado" para la rima consonante */
  function consonantPatterns(word, say, limit) {
    const a = analyze(word, { say: undefined });
    if (!a.ok) return [];
    const part = a.rimaEscrita;
    if (!part) return [];
    return spellingVariants(part, limit || 8).map(p => '*' + p);
  }

  /* patrones con comodines "?" para la rima asonante */
  function assonantPatterns(word, say) {
    const a = analyze(say || word);
    if (!a.ok || !a.ka) return [];
    const vs = a.ka.split('');
    const alt = v => (v === 'e' ? ['e', 'i'] : v === 'i' ? ['i', 'e'] : v === 'o' ? ['o', 'u'] : v === 'u' ? ['u', 'o'] : [v]);
    const pats = new Set();
    const acc = { a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú' };
    if (vs.length === 1) {
      [vs[0], acc[vs[0]]].forEach(v => { ['', '?', '??'].forEach(t => pats.add('*' + v + t)); });
    } else if (vs.length === 2) {
      (alt(vs[1])).forEach(w => {
        ['?', '??'].forEach(mid => ['', 's', 'n'].forEach(t => pats.add('*' + vs[0] + mid + w + t)));
      });
    } else {
      const [v0, v1, v2] = vs;
      alt(v2).forEach(w => alt(v1).forEach(x => {
        ['?', '??'].forEach(m1 => ['?', '??'].forEach(m2 => pats.add('*' + (acc[v0] || v0) + m1 + x + m2 + w)));
      }));
    }
    return [...pats].slice(0, 12);
  }

  /* ---------- armar la lista de sugerencias ---------- */
  const PRIORITY = { mias: 8, notas: 6, jerga: 4, informal: 3, marcas: 4, famosos: 4, formal: 0, comun: 1 };

  function rank(target, cands, opt) {
    const o = Object.assign({ mode: 'cons', syl: [1, 2, 3, 4], cats: null, subs: null, flexS: false, limit: 80 }, opt || {});
    const t = analyze(target.w || target, { say: target.say, flexS: o.flexS });
    if (!t.ok) return { target: t, items: [] };
    const seen = new Set([clean(target.w || target)]);
    const items = [];
    for (const c of cands) {
      const w = c.w;
      const lw = clean(w);
      if (!lw || seen.has(lw)) continue;
      const a = analyze(w, { say: c.say, flexS: o.flexS });
      if (!a.ok) continue;
      const rel = relation(t, a);
      if (!rel) continue;
      if (o.mode === 'cons' && rel !== 'cons') continue;
      if (o.mode === 'ason' && rel !== 'ason') continue;
      const n = c.n || a.n;
      const nb = n >= 4 ? 4 : n;
      if (o.syl && o.syl.length && !o.syl.includes(nb)) continue;
      if (o.cats && c.cat && !o.cats.includes(c.cat)) continue;
      if (c.cat === 'famosos' && o.subs && c.sub && !o.subs.includes(c.sub)) continue;
      seen.add(lw);
      let score = rel === 'cons' ? 100 : 50;
      if (n === t.n) score += 10;
      score += PRIORITY[c.cat] || 0;
      if (c.f) score += Math.min(10, Math.log10(c.f + 1) * 3);
      if (c.mine) score += 4;
      items.push({ w, cat: c.cat, sub: c.sub, n, rel, score, mine: !!c.mine });
    }
    items.sort((x, y) => y.score - x.score || x.w.localeCompare(y.w, 'es'));
    return { target: t, items: items.slice(0, o.limit) };
  }

  const API = { clean, analyze, syllabify, syllableCount, relation, rank, consonantPatterns, assonantPatterns, spellingVariants };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else root.Rimas = API;
})(typeof window !== 'undefined' ? window : globalThis);
