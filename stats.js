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
  rec.rows.forEach(function(r){ r.pas.forEach(function(p){ if(p.inn > m) m = p.inn; }); });
  return m;
};

// Muta y devuelve el mismo rec: innings sube al mayor turno; us/them quedan con largo innings.
Stats.fit = function(rec){
  var g = rec.game, n, i;
  g.innings = Math.max(g.innings, Stats.minInnings(rec));
  n = g.innings;
  ["us", "them"].forEach(function(k){
    var a = (g[k] || []).slice(0, n);
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


/* ============ juegos: historial y ficha del jugador ============ */


if(typeof module !== "undefined") module.exports = Stats;
