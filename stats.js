/* Diamante 10 — estadísticas de bateo (spec 001).
   Solo lógica pura: sin DOM, sin Firebase, sin reloj (las horas llegan como
   parámetro). index.html lo carga como script normal y los tests con require. */
var Stats = {};

/* ============ hoja: resultados, filas, innings, cuadre ============ */
Stats.CODES = [
  {code:"1B", pick:"1B", cell:"1B", group:"Hit"}, {code:"2B", pick:"2B", cell:"2B", group:"Hit"},
  {code:"3B", pick:"3B", cell:"3B", group:"Hit"}, {code:"HR", pick:"HR", cell:"HR", group:"Hit"},
  {code:"BB", pick:"BB", cell:"BB", group:"Se embasa"}, {code:"K", pick:"K", cell:"K", group:"Out"},
  {code:"RO", pick:"Rolling", cell:"Rol", group:"Out"}, {code:"FL", pick:"Fly", cell:"Fly", group:"Out"},
  {code:"LI", pick:"Línea", cell:"Lín", group:"Out"}, {code:"E", pick:"E", cell:"E", group:"Se embasa"},
  {code:"JS", pick:"JS", cell:"JS", group:"Se embasa", title:"Jugada de selección"},
  {code:"BO", pick:"BO", cell:"BO", group:"Out", legacy:true}, {code:"SF", pick:"Fly sac.", cell:"FS", group:"Sacrificio"}
];

// Lo que ofrece el selector: BO sigue existiendo en datos viejos pero ya no se elige.
Stats.PICK_CODES = Stats.CODES.filter(function(c){ return !c.legacy; });

// Filas rotuladas del selector (spec 005 RF-6): una por grupo, en este orden.
Stats.PICK_GROUPS = ["Hit", "Se embasa", "Out", "Sacrificio"];
Stats.pickRows = function(codes){
  return Stats.PICK_GROUPS.map(function(g){
    return {label: g, codes: codes.filter(function(c){ return c.group === g; })};
  });
};

// Nombre completo de cada columna de la tabla de estadísticas (clave = etiqueta de la columna).
Stats.COL_TITLES = {
  JJ: "Juegos jugados", AP: "Apariciones al plato", VB: "Veces al bate", H: "Hits", "2B": "Dobles",
  "3B": "Triples", HR: "Jonrones", CA: "Carreras anotadas", CI: "Carreras impulsadas", BB: "Bases por bolas",
  K: "Ponches", BR: "Bases robadas", AR: "Atrapado robando", AVE: "Promedio de bateo (H ÷ VB)",
  OBP: "Promedio de embasado", SLG: "Slugging (bases totales ÷ VB)", OPS: "OBP + SLG"
};

Stats.cellLabel = function(pa){
  var i, c = pa.code;
  for(i = 0; i < Stats.CODES.length; i++) if(Stats.CODES[i].code === pa.code){ c = Stats.CODES[i].cell; break; }
  return pa.run ? c + "•" : c;
};

// Devuelve un array nuevo; la fila de quien no está en la alineación es el mismo objeto, las demás son copias.
Stats.refreshRows = function(rows, lineup){
  var seen = {}, by = {}, out = [], i, k, p, r;
  for(i = lineup.length - 1; i >= 0; i--) by[lineup[i].pid] = lineup[i]; // el primero gana, como en las filas
  for(i = 0; i < rows.length; i++){
    if(seen[rows[i].pid]) continue;
    seen[rows[i].pid] = true;
    r = rows[i]; p = by[r.pid];
    // RF-8: quien sigue en la alineación toma de ella número, nombre y posición (se corrige la alineación después del juego)
    if(p){ r = {}; for(k in rows[i]) r[k] = rows[i][k]; r.num = p.num; r.name = p.name; r.pos = p.pos; }
    out.push(r);
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
  return ["K", "RO", "FL", "LI", "SF", "BO", "JS"].indexOf(code) >= 0 ? 1 : 0;
};

// Muta y devuelve f (formulario del selector). Elegir HR marca carrera y CI (recordando lo previo en
// hrPrev); salir de HR los restaura. Un formulario abierto ya como HR no trae hrPrev y no toca nada.
Stats.pickResult = function(f, code){
  var prev = f.code;
  if(prev === code) return f;
  f.code = code;
  f.outs = Stats.defaultOuts(code);
  if(code === "HR"){
    f.hrPrev = {run: f.run, rbi: f.rbi};
    f.run = true;
    if(!f.rbi) f.rbi = 1;
  } else if(prev === "HR" && f.hrPrev){
    f.run = f.hrPrev.run; f.rbi = f.hrPrev.rbi;
    delete f.hrPrev;
  }
  return f;
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

// warn: outs !== 3 en un inning anterior al último con turno u out corriendo, o más de 3 en cualquiera
Stats.outsCheck = function(rec){
  var out = [], last = 0, i;
  rec.rows.forEach(function(r){
    r.pas.forEach(function(p){ if(p.inn > last) last = p.inn; });
    (r.ro || []).forEach(function(o){ if(o.inn > last) last = o.inn; });
  });
  for(i = 1; i <= rec.game.innings; i++){
    var n = Stats.inningOuts(rec, i);
    out.push({outs: n, warn: (n !== 3 && i < last) || n > 3});
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
    var g = rec.game, us = sum(g.us), them = sum(g.them), none = !us && !them,
        res = none ? "" : us > them ? "W" : us < them ? "L" : "T";
    out.list.push({id: rec.id, date: g.date, opp: g.opp, savedAt: rec.savedAt, us: us, them: them, result: res,
      text: none ? "Sin marcador" : Stats.result(g)});
    // un 0–0 sin marcador se lista pero no entra al récord
    if(res) out[res.toLowerCase()]++;
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

/* ============ juegos guardados (spec 003) ============ */
/* ---- cambios sin guardar ---- */
// Compara solo los campos de la alineación; at, gameId, gameAt, start, end y nombres/números del roster no cuentan.
Stats.differs = function(a, b, ignore){
  var SIMPLE = ["team", "opp", "home", "date", "dh", "enabledSF", "enabled4F", "enabledDH", "innings"];
  var ARRAYS = ["order"];
  ignore = ignore || [];
  function skip(k){ return ignore.indexOf(k) >= 0; }
  function nul(v){ return v === undefined ? null : v; }
  function sameList(x, y){
    var i;
    x = x || []; y = y || [];
    if(x.length !== y.length) return false;
    for(i = 0; i < x.length; i++) if(x[i] !== y[i]) return false;
    return true;
  }
  function diffInts(x, y){
    var i, n;
    x = x || []; y = y || [];
    n = Math.max(x.length, y.length);
    for(i = 0; i < n; i++) if((parseInt(x[i], 10) || 0) !== (parseInt(y[i], 10) || 0)) return true;
    return false;
  }
  function ids(st){ return (st.roster || []).map(function(p){ return p.id; }); }
  var i, k, x, y;
  for(i = 0; i < SIMPLE.length; i++){
    k = SIMPLE[i];
    if(!skip(k) && nul(a[k]) !== nul(b[k])) return true;
  }
  if(!skip("statsId") && nul(a.statsId) !== nul(b.statsId)) return true;
  if(!skip("roster") && !sameList(ids(a), ids(b))) return true;
  for(i = 0; i < ARRAYS.length; i++) if(!skip(ARRAYS[i]) && !sameList(a[ARRAYS[i]], b[ARRAYS[i]])) return true;
  if(!skip("assign")){
    x = a.assign || {}; y = b.assign || {};
    // unión de claves: una posición ausente equivale a null
    for(k in x) if(nul(x[k]) !== nul(y[k])) return true;
    for(k in y) if(nul(x[k]) !== nul(y[k])) return true;
  }
  if(!skip("us") && diffInts(a.us, b.us)) return true;
  if(!skip("them") && diffInts(a.them, b.them)) return true;
  return false;
};

Stats.isEmpty = function(st, blank){
  return !Stats.differs(st, blank, ["date", "roster"]);
};

Stats.unsaved = function(st, linkedState, blank){
  return linkedState ? Stats.differs(st, linkedState) : !Stats.isEmpty(st, blank);
};

/* ---- lista de juegos {id, name, at, state}; nunca muta las entradas ---- */
Stats.upsertGame = function(list, game){
  return [game].concat((list || []).filter(function(e){ return e.id !== game.id; }));
};

// Si sobran, descarta los de menor at (en empate, el de posición posterior); kept conserva el orden.
Stats.trimGames = function(list, max){
  var idx = list.map(function(e, i){ return i; }), cut = {}, kept = [], dropped = [];
  if(list.length > max){
    idx.sort(function(i, j){
      return list[i].at < list[j].at ? -1 : list[i].at > list[j].at ? 1 : j - i;
    });
    idx.slice(0, list.length - max).forEach(function(i){ cut[i] = true; });
  }
  list.forEach(function(e, i){ (cut[i] ? dropped : kept).push(e); });
  return {kept: kept, dropped: dropped};
};

// Unión por id: gana el at más nuevo (empate: a); at desc, y el id desempata para no depender del orden.
Stats.mergeGames = function(a, b){
  var by = Object.create(null), out = [], k;
  (a || []).concat(b || []).forEach(function(e){
    if(!by[e.id] || e.at > by[e.id].at) by[e.id] = e;
  });
  for(k in by) out.push(by[k]);
  return out.sort(function(x, y){
    return x.at < y.at ? 1 : x.at > y.at ? -1 : x.id < y.id ? -1 : x.id > y.id ? 1 : 0;
  });
};

/* ---- nombres, fechas y resultado ---- */
Stats.asNew = function(st, today){
  var out = JSON.parse(JSON.stringify({
    team: st.team, opp: st.opp, home: st.home, roster: st.roster, assign: st.assign, order: st.order,
    dh: st.dh, enabledSF: st.enabledSF, enabled4F: st.enabled4F, enabledDH: st.enabledDH
  }));
  out.date = today; out.innings = 7; out.start = ""; out.end = "";
  out.us = [0, 0, 0, 0, 0, 0, 0]; out.them = [0, 0, 0, 0, 0, 0, 0];
  return out;
};

// "aaaa-mm-dd" -> "dd/mm/aaaa"
Stats.fmtDate = function(iso){
  if(!iso) return "";
  var p = iso.split("-");
  return p[2] + "/" + p[1] + "/" + p[0];
};

// Date -> "dd/mm/aaaa · h:mm a. m." con getters locales y reloj de 12 horas
Stats.fmtDateTime = function(d){
  var h = d.getHours();
  function pad2(n){ return (n < 10 ? "0" : "") + n; }
  return pad2(d.getDate()) + "/" + pad2(d.getMonth() + 1) + "/" + d.getFullYear() + " · " +
    (h % 12 || 12) + ":" + pad2(d.getMinutes()) + (h < 12 ? " a. m." : " p. m.");
};

Stats.gameName = function(st){
  return ((st.team || "").trim() || "Equipo") + " vs " + ((st.opp || "").trim() || "rival") +
    (st.date ? " · " + Stats.fmtDate(st.date) : "");
};

// "" si el marcador está 0–0; us son nuestras carreras y them las del rival
Stats.result = function(st){
  function sum(a){ return (a || []).reduce(function(s, v){ return s + (parseInt(v, 10) || 0); }, 0); }
  var us = sum(st.us), them = sum(st.them);
  if(!us && !them) return "";
  return (us > them ? "Ganado " : us < them ? "Perdido " : "Empate ") + us + "–" + them;
};

// ---------- nombres ----------

// Nombre para el recuadro del campo: siempre inicial + apellido cuando hay
// más de una palabra, para que todas las posiciones se lean igual y quepan.
Stats.shortName = function(n){
  n = (n || "").trim();
  if(!n) return "";
  var parts = n.split(/\s+/);
  if(parts.length === 1) return n;
  var ini = parts[0].charAt(0).toUpperCase() + ". ";
  var rest = parts.slice(1).join(" ");
  if((ini + rest).length <= 13) return ini + rest;
  return ini + (parts.length >= 4 ? parts[2] : parts[1]);
};

// Nombres cortos alineados con names. Si dos o más coinciden: "Kevin P.";
// si aun así coinciden, el nombre completo.
Stats.shortNames = function(names){
  var out = names.map(Stats.shortName);
  var groups = {};
  out.forEach(function(s, i){
    if(!s) return;
    (groups[s] = groups[s] || []).push(i);
  });
  // primero todas las formas nuevas, contadas entre todos los grupos: dos parejas distintas no pueden quedar iguales
  var forms = {}, seen = {};
  Object.keys(groups).forEach(function(s){
    var idx = groups[s];
    if(idx.length < 2) return;
    idx.forEach(function(i){
      var parts = names[i].trim().split(/\s+/);
      if(parts.length === 1) return;
      // parte del apellido que usó shortName (sin la inicial y el ". ")
      var surname = s.slice(parts[0].charAt(0).toUpperCase().length + 2);
      var f = parts[0] + " " + surname.charAt(0).toUpperCase() + ".";
      forms[i] = f;
      seen[f] = (seen[f] || 0) + 1;
    });
  });
  Object.keys(forms).forEach(function(i){
    out[i] = seen[forms[i]] > 1 ? names[i].trim() : forms[i];
  });
  return out;
};

if(typeof module !== "undefined") module.exports = Stats;
