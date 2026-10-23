/* Diamante 10 — estadísticas de bateo (spec 001).
   Solo lógica pura: sin DOM, sin Firebase, sin reloj (las horas llegan como
   parámetro). index.html lo carga como script normal y los tests con require. */
var Stats = {};

/* ============ hoja: resultados, filas, innings, cuadre ============ */
Stats.CODES = [
  {code:"1B", pick:"1B", cell:"1B"}, {code:"2B", pick:"2B", cell:"2B"},
  {code:"3B", pick:"3B", cell:"3B"}, {code:"HR", pick:"HR", cell:"HR"},
  {code:"BB", pick:"BB", cell:"BB"}, {code:"K", pick:"K", cell:"K"},
  {code:"RO", pick:"Rolling", cell:"Rol"}, {code:"FL", pick:"Fly", cell:"Fly"},
  {code:"LI", pick:"Línea", cell:"Lín"}, {code:"E", pick:"E", cell:"E"},
  {code:"BO", pick:"BO", cell:"BO"}, {code:"SF", pick:"SF", cell:"SF"}
];

Stats.cellLabel = function(pa){
  var i, c = pa.code;
  for(i = 0; i < Stats.CODES.length; i++) if(Stats.CODES[i].code === pa.code){ c = Stats.CODES[i].cell; break; }
  return pa.run ? c + "•" : c;
};

// Devuelve un array nuevo; las filas guardadas se conservan tal cual (mismo objeto).
Stats.refreshRows = function(rows, lineup){
  var seen = {}, out = [], i, p;
  for(i = 0; i < rows.length; i++){
    if(seen[rows[i].pid]) continue;
    seen[rows[i].pid] = true; out.push(rows[i]);
  }
  for(i = 0; i < lineup.length; i++){
    p = lineup[i];
    if(seen[p.pid]) continue;
    seen[p.pid] = true;
    out.push({pid:p.pid, num:p.num, name:p.name, pos:p.pos, pas:[]});
  }
  return out;
};

Stats.minInnings = function(rec){
  var m = 3;
  rec.rows.forEach(function(r){
    r.pas.forEach(function(p){ if(p.inn > m) m = p.inn; });
    (r.ro || []).forEach(function(o){ if(o.inn > m) m = o.inn; });
  });
  return m;
};

// Muta y devuelve el mismo rec: innings sube al mayor turno; us/them quedan con largo innings.
Stats.fit = function(rec){
  var g = rec.game, n, i;
  g.innings = Math.max(g.innings, Stats.minInnings(rec));
  n = g.innings;
  ["us", "them"].forEach(function(k){
    // estados viejos pueden traer carreras como texto: "3" + "2" sumaría "32"
    var a = (g[k] || []).slice(0, n).map(function(v){ return parseInt(v, 10) || 0; });
    for(i = a.length; i < n; i++) a.push(0);
    g[k] = a;
  });
  return rec;
};

Stats.runCheck = function(rec){
  var g = rec.game, out = [], i;
  for(i = 0; i < g.innings; i++) out.push({sheet:0, board:g.us[i] || 0, diff:0});
  rec.rows.forEach(function(r){
    r.pas.forEach(function(p){ if(p.run && out[p.inn - 1]) out[p.inn - 1].sheet++; });
  });
  out.forEach(function(o){ o.diff = o.sheet - o.board; });
  return out;
};

Stats.signed = function(n){
  return n > 0 ? "+" + n : n < 0 ? "−" + (-n) : "";
};

Stats.hasPA = function(rec){
  return rec.rows.some(function(r){ return r.pas.length > 0; });
};

/* ---- outs y outs corriendo (spec 002) ---- */
Stats.RO_KINDS = [
  {kind:"CS", pick:"Atrapado robando", cell:"AR"},
  {kind:"PO", pick:"Sorprendido en base", cell:"Sor"},
  {kind:"OB", pick:"Out corriendo las bases", cell:"OC"}
];

Stats.roLabel = function(kind){
  var i;
  for(i = 0; i < Stats.RO_KINDS.length; i++) if(Stats.RO_KINDS[i].kind === kind) return Stats.RO_KINDS[i].cell;
  return kind;
};

Stats.defaultOuts = function(code){
  return ["K", "RO", "FL", "LI", "SF", "BO"].indexOf(code) >= 0 ? 1 : 0;
};

Stats.paOuts = function(pa){
  return typeof pa.outs === "number" ? pa.outs : Stats.defaultOuts(pa.code);
};

Stats.inningOuts = function(rec, inn){
  var n = 0;
  rec.rows.forEach(function(r){
    r.pas.forEach(function(p){ if(p.inn === inn) n += Stats.paOuts(p); });
    (r.ro || []).forEach(function(o){ if(o.inn === inn) n++; });
  });
  return n;
};

// warn: outs !== 3 en un inning anterior al último con turno u out corriendo (el último nunca avisa)
Stats.outsCheck = function(rec){
  var out = [], last = 0, i;
  rec.rows.forEach(function(r){
    r.pas.forEach(function(p){ if(p.inn > last) last = p.inn; });
    (r.ro || []).forEach(function(o){ if(o.inn > last) last = o.inn; });
  });
  for(i = 1; i <= rec.game.innings; i++){
    var n = Stats.inningOuts(rec, i);
    out.push({outs: n, warn: n !== 3 && i < last});
  }
  return out;
};

Stats.openInning = function(rec){
  var i;
  for(i = 1; i <= rec.game.innings; i++) if(Stats.inningOuts(rec, i) < 3) return i;
  return rec.game.innings + 1;
};

Stats.cellLines = function(row, inn){
  var out = [];
  row.pas.forEach(function(p){
    if(p.inn === inn) out.push({ord: typeof p.ord === "number" ? p.ord : null, text: Stats.cellLabel(p)});
  });
  (row.ro || []).forEach(function(o){
    if(o.inn === inn) out.push({ord: null, text: Stats.roLabel(o.kind)});
  });
  return out;
};

Stats.rowEmpty = function(row){
  return !row.pas.length && !(row.ro || []).length;
};


/* ============ modo guiado: orden al bate ============ */
// Turnos: una fila sin sub + las sub de abajo; una sub en el índice 0 abre su propio turno.
Stats.slots = function(rows){
  var out = [];
  rows.forEach(function(r, i){
    if(!r.sub || !out.length) out.push([i]);
    else out[out.length - 1].push(i);
  });
  return out;
};

// La fila activa es la más baja del turno con algún turno al bate; si no hay, la primera.
Stats.activeRow = function(rows, slot){
  var act = slot[0];
  slot.forEach(function(i){ if(rows[i].pas.length) act = i; });
  return act;
};

// Bateador que le toca: anchor es un objeto PA (se busca por identidad) o null.
Stats.dueBatter = function(rec, inn, anchor){
  var rows = rec.rows, slots = Stats.slots(rows), ai = -1, best = null, k;
  if(anchor) rows.forEach(function(r, i){ if(r.pas.indexOf(anchor) >= 0) ai = i; });
  if(ai < 0){
    // sin ancla (o borrada): la PA con mayor ord del último inning que tenga ord
    rows.forEach(function(r, i){
      r.pas.forEach(function(p){
        if(typeof p.ord !== "number") return;
        if(!best || p.inn > best.inn || (p.inn === best.inn && p.ord > best.ord)){ best = p; ai = i; }
      });
    });
  }
  var s = 0; // sin ancla: el primer turno
  if(ai >= 0) slots.forEach(function(sl, j){ if(sl.indexOf(ai) >= 0) s = j + 1; });
  for(k = 0; k < slots.length; k++){
    var ri = Stats.activeRow(rows, slots[(s + k) % slots.length]), n = 0;
    rows[ri].pas.forEach(function(p){ if(p.inn === inn) n++; });
    if(n < 2) return ri;
  }
  return null;
};

Stats.nextOrd = function(rec, inn){
  var n = 0;
  rec.rows.forEach(function(r){
    r.pas.forEach(function(p){ if(p.inn === inn && typeof p.ord === "number") n++; });
  });
  return n + 1;
};

// Muta: tras quitar la PA con ord removedOrd, cierra el hueco en ese inning.
Stats.renumberOrd = function(rec, inn, removedOrd){
  rec.rows.forEach(function(r){
    r.pas.forEach(function(p){
      if(p.inn === inn && typeof p.ord === "number" && p.ord > removedOrd) p.ord--;
    });
  });
};


/* ============ mezcla entre dispositivos ============ */
Stats.merge = function(a, b){
  function ts(e){ return e.deletedAt || e.savedAt; }
  a = a || []; b = b || [];
  var out = [], at = Object.create(null), i;
  for(i = 0; i < a.length; i++){ at[a[i].id] = out.length; out.push(a[i]); }
  for(i = 0; i < b.length; i++){
    var e = b[i], k = at[e.id];
    if(k === undefined){ at[e.id] = out.length; out.push(e); continue; }
    var cur = out[k];
    // más reciente gana; en empate gana el marcador de borrado
    if(ts(e) > ts(cur) || (ts(e) === ts(cur) && e.deletedAt && !cur.deletedAt)) out[k] = e;
  }
  return out;
};
Stats.live = function(entries){
  return (entries || []).filter(function(e){ return !e.deletedAt; });
};


/* ============ jugadores: totales, promedios, orden ============ */
// Orden RF-23: fecha desc, luego savedAt desc. Devuelve una copia.
Stats.byNewest = function(records){
  return records.slice().sort(function(a, b){
    return a.game.date < b.game.date ? 1 : a.game.date > b.game.date ? -1 :
           a.savedAt < b.savedAt ? 1 : a.savedAt > b.savedAt ? -1 : 0;
  });
};

// c: {h, ab, bb, sf, tb}. OPS = (h+bb)/od + tb/ab con enteros: sumar floats redondea mal los .xxx5.
Stats.rates = function(c){
  var od = c.ab + c.bb + c.sf;
  function round3(n, d){ return d === 0 ? null : Math.round(n * 1000 / d) / 1000; }
  return {
    avg: round3(c.h, c.ab),
    obp: round3(c.h + c.bb, od),
    slg: round3(c.tb, c.ab),
    ops: round3((c.h + c.bb) * c.ab + c.tb * od, od * c.ab)
  };
};

Stats.fmt = function(x){
  return x === null ? "—" : x.toFixed(3).replace(/^0\./, ".");
};

Stats.players = function(entries, team){
  var COUNT_KEYS = ["pa", "ab", "h", "b2", "b3", "hr", "r", "rbi", "bb", "k", "sb", "sf", "tb", "cs"];
  var TB_WEIGHT = {"1B": 1, "2B": 2, "3B": 3, "HR": 4};
  function withRates(o){
    var r = Stats.rates(o);
    o.avg = r.avg; o.obp = r.obp; o.slg = r.slg; o.ops = r.ops;
    return o;
  }
  function zeroCounts(o){
    COUNT_KEYS.forEach(function(key){ o[key] = 0; });
    return o;
  }
  var recs = Stats.byNewest(Stats.live(entries)), acc = {}, rows = [], tm = {}, tot = zeroCounts({g: recs.length});
  (team || []).forEach(function(p){ tm[p.id] = p; });
  recs.forEach(function(rec){
    rec.rows.forEach(function(row){
      var a = acc[row.pid], ros = row.ro || [];
      if(!row.pas.length && !ros.length) return;
      if(!a){
        // recs va de nuevo a viejo: la primera fila con turnos u outs corriendo fija la etiqueta (RF-21)
        a = acc[row.pid] = zeroCounts({pid: row.pid, num: row.num, name: row.name, g: 0});
        rows.push(a);
      }
      a.g++;
      ros.forEach(function(o){ if(o.kind === "CS") a.cs++; });
      row.pas.forEach(function(p){
        a.pa++;
        if(p.run) a.r++;
        a.rbi += p.rbi; a.sb += p.sb;
        if(p.code === "BB") a.bb++;
        else if(p.code === "SF") a.sf++;
        else if(p.code === "K") a.k++;
        if(TB_WEIGHT[p.code]){ a.h++; a.tb += TB_WEIGHT[p.code]; }
        if(p.code === "2B") a.b2++;
        else if(p.code === "3B") a.b3++;
        else if(p.code === "HR") a.hr++;
      });
    });
  });
  rows.forEach(function(a){
    var t = tm[a.pid];
    if(t){ a.num = t.num; a.name = t.name; }
    a.ab = a.pa - a.bb - a.sf;
    COUNT_KEYS.forEach(function(key){ tot[key] += a[key]; });
    withRates(a);
  });
  return {rows: rows, team: withRates(tot)};
};

// Nulos siempre al final y empates por nombre asc, sin importar la dirección.
Stats.sortPlayers = function(rows, key, desc){
  return rows.slice().sort(function(a, b){
    var x = a[key], y = b[key], d;
    if(x === null || y === null){
      if(x !== y) return x === null ? 1 : -1;
    } else {
      d = key === "name" ? x.localeCompare(y, "es") : x - y;
      if(d) return desc ? -d : d;
    }
    return a.name.localeCompare(b.name, "es");
  });
};


/* ============ juegos: historial y ficha del jugador ============ */
// El marcador sale de game.us/them guardados, no de las marcas de carrera de la hoja.
Stats.games = function(entries){
  function sum(a){ return a.reduce(function(s, n){ return s + n; }, 0); }
  var out = {list: [], w: 0, l: 0, t: 0, runsFor: 0, runsAgainst: 0};
  Stats.byNewest(Stats.live(entries)).forEach(function(rec){
    var g = rec.game, us = sum(g.us), them = sum(g.them), res = us > them ? "W" : us < them ? "L" : "T";
    out.list.push({id: rec.id, date: g.date, opp: g.opp, savedAt: rec.savedAt, us: us, them: them, result: res});
    out[res.toLowerCase()]++;
    out.runsFor += us; out.runsAgainst += them;
  });
  return out;
};

Stats.playerGames = function(entries, pid){
  var HITS = {"1B": 1, "2B": 1, "3B": 1, "HR": 1};
  var KEYS = ["ab", "h", "r", "rbi", "bb", "k"];
  var out = {lines: [], total: {ab: 0, h: 0, r: 0, rbi: 0, bb: 0, k: 0}};
  Stats.byNewest(Stats.live(entries)).forEach(function(rec){
    rec.rows.forEach(function(row){
      var ros = row.ro || [];
      if(row.pid !== pid || (!row.pas.length && !ros.length)) return;
      var line = {id: rec.id, date: rec.game.date, opp: rec.game.opp, ab: row.pas.length, h: 0, r: 0, rbi: 0, bb: 0, k: 0};
      row.pas.forEach(function(p){
        if(HITS[p.code]) line.h++;
        if(p.run) line.r++;
        line.rbi += p.rbi;
        if(p.code === "BB"){ line.bb++; line.ab--; }
        else if(p.code === "SF") line.ab--;
        else if(p.code === "K") line.k++;
      });
      // por entrada: turnos en orden de captura y luego sus outs corriendo (RF-13); k y el índice desempatan
      line.seq = row.pas.map(function(p, i){ return {inn: p.inn, k: 0, i: i, text: Stats.cellLabel(p)}; })
        .concat(ros.map(function(o, i){ return {inn: o.inn, k: 1, i: i, text: Stats.roLabel(o.kind)}; }))
        .sort(function(a, b){ return a.inn - b.inn || a.k - b.k || a.i - b.i; })
        .map(function(x){ return x.text; }).join(" · ");
      out.lines.push(line);
      KEYS.forEach(function(key){ out.total[key] += line[key]; });
    });
  });
  return out;
};


if(typeof module !== "undefined") module.exports = Stats;
