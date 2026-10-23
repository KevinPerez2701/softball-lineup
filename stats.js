/* Diamante 10 — estadísticas de bateo (spec 001).
   Solo lógica pura: sin DOM, sin Firebase, sin reloj (las horas llegan como
   parámetro). index.html lo carga como script normal y los tests con require. */
var Stats = {};

/* ============ hoja: resultados, filas, innings, cuadre ============ */


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
