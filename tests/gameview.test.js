var test = require("node:test");
var assert = require("node:assert");
var Stats = require("../stats.js");

function pa(inn, code, extra){
  var p = {inn: inn, code: code, run: false, rbi: 0, sb: 0};
  for(var k in extra) p[k] = extra[k];
  return p;
}

// Juego de fixture: Ana 3 turnos, Bea sustituta (sub) con un turno y un out corriendo, Cris sin turnos.
function rec(over){
  var r = {
    id: "g1", savedAt: 1000, shareId: "AAAAAAAAAAAAAAAA", extra: "x",
    game: {team: "MSO", opp: "Call", date: "2026-11-05", home: false, innings: 3, us: [2, 0, 3], them: [1, 0, 0], dh: true, at: 5},
    rows: [
      {pid: "a", num: "1", name: "Ana", pos: "SS", pas: [
        pa(1, "HR", {run: true, rbi: 2, ord: 1, outs: 0, junk: 1}), pa(2, "K", {ord: 1, outs: 1}), pa(3, "BB", {ord: 1, sb: 1, outs: 0})]},
      {pid: "b", num: "2", name: "Bea", pos: "1B", sub: true, pas: [pa(3, "1B", {run: true, rbi: 1})], ro: [{inn: 3, kind: "CS", extra: 1}]},
      {pid: "c", num: "3", name: "Cris", pos: "P", pas: []}
    ]
  };
  for(var k in over) r[k] = over[k];
  return r;
}

/* ---- tally / players ---- */
test("RF-4 tally: suma los contadores de una fila sobre acc y lo devuelve", function(){
  var acc = {pa: 0, ab: 0, h: 0, b2: 0, b3: 0, hr: 0, r: 0, rbi: 0, bb: 0, k: 0, sb: 0, sf: 0, tb: 0, cs: 0};
  var out = Stats.tally(rec().rows[0], acc);
  assert.strictEqual(out, acc);
  assert.strictEqual(acc.pa, 3); assert.strictEqual(acc.hr, 1); assert.strictEqual(acc.h, 1); assert.strictEqual(acc.tb, 4);
  assert.strictEqual(acc.r, 1); assert.strictEqual(acc.rbi, 2); assert.strictEqual(acc.bb, 1); assert.strictEqual(acc.k, 1);
  assert.strictEqual(acc.sb, 1);
  Stats.tally(rec().rows[1], acc);
  assert.strictEqual(acc.cs, 1); assert.strictEqual(acc.h, 2); assert.strictEqual(acc.pa, 4);
});

/* ---- boxScore ---- */
test("RF-4 boxScore: una fila por fila de la hoja, en orden, con sustitutas y fila vacía en ceros", function(){
  var b = Stats.boxScore(rec());
  assert.deepStrictEqual(b.rows.map(function(r){ return r.name; }), ["Ana", "Bea", "Cris"]);
  assert.deepStrictEqual(b.rows.map(function(r){ return r.num; }), ["1", "2", "3"]);
  var c = b.rows[2];
  ["pa", "ab", "h", "b2", "b3", "hr", "r", "rbi", "bb", "k", "sb", "cs"].forEach(function(k){ assert.strictEqual(c[k], 0, k); });
  assert.strictEqual(c.avg, null); assert.strictEqual(c.obp, null); assert.strictEqual(c.slg, null); assert.strictEqual(c.ops, null);
  assert.strictEqual(Stats.fmt(c.avg), "—");
  assert.strictEqual(b.rows[0].ab, 2); assert.strictEqual(b.rows[0].avg, 0.5);
});

test("RF-4 boxScore: sin pid ni datos de la entrada; el equipo es la suma de las filas", function(){
  var b = Stats.boxScore(rec());
  b.rows.forEach(function(r){ assert.ok(!("pid" in r)); });
  assert.ok(!("pid" in b.team));
  ["pa", "ab", "h", "hr", "r", "rbi", "bb", "k", "sb", "cs", "sf", "tb"].forEach(function(k){
    assert.strictEqual(b.team[k], b.rows.reduce(function(s, r){ return s + r[k]; }, 0), k);
  });
  assert.strictEqual(b.team.avg, Stats.rates(b.team).avg);
});

test("RF-4 boxScore: coincide con Stats.players en un juego (filas con turnos)", function(){
  var r = rec(), b = Stats.boxScore(r), p = Stats.players([r], []);
  var keys = ["num", "name", "pa", "ab", "h", "b2", "b3", "hr", "r", "rbi", "bb", "k", "sb", "sf", "tb", "cs", "avg", "obp", "slg", "ops"];
  assert.strictEqual(p.rows.length, 2);
  p.rows.forEach(function(x, i){
    keys.forEach(function(k){ assert.deepStrictEqual(b.rows[i][k], x[k], x.name + "." + k); });
  });
  keys.slice(2).forEach(function(k){ assert.deepStrictEqual(b.team[k], p.team[k], "team." + k); });
});

test("RF-4 BOX_COLS: las columnas de Jugadores sin JJ", function(){
  assert.strictEqual(Stats.BOX_COLS.length, Stats.STAT_COLS.length - 1);
  assert.ok(!Stats.BOX_COLS.some(function(c){ return c[1] === "JJ" || c[0] === "g"; }));
  assert.deepStrictEqual(Stats.BOX_COLS[0], ["avg", "AVE"]);
});

/* ---- resultLine / viewTitle ---- */
test("RF-2 resultLine: ganado, perdido, empate (D1), sin marcador", function(){
  function g(us, them){ return {us: us, them: them}; }
  assert.strictEqual(Stats.resultLine(g([3, 3], [2, 0])), "Ganado 6–2");
  assert.strictEqual(Stats.resultLine(g([8], [17])), "Perdido 8–17");
  assert.strictEqual(Stats.resultLine(g([1, 2], [3, 0])), "Empate 3–3");
  assert.strictEqual(Stats.resultLine(g([0, 0], [0, 0])), "Sin marcador");
  assert.strictEqual(Stats.resultLine(g(["3", "2"], ["1", "0"])), "Ganado 5–1");
  assert.strictEqual(Stats.resultLine(g(undefined, undefined)), "Sin marcador");
});

test("RF-2 viewTitle: equipo vs rival con fecha completa; sin fecha válida no hay parte de fecha", function(){
  assert.strictEqual(Stats.viewTitle({team: "MSO", opp: "Call", date: "2026-11-05"}), "MSO vs Call · 05/11/2026");
  assert.strictEqual(Stats.viewTitle({team: "", opp: "Call", date: "2026-11-05"}), "Equipo vs Call · 05/11/2026");
  assert.strictEqual(Stats.viewTitle({team: "MSO", opp: "", date: "2026-11-05"}), "MSO · 05/11/2026");
  assert.strictEqual(Stats.viewTitle({team: "", opp: "", date: "2026-11-05"}), "Estadísticas · 05/11/2026");
  assert.strictEqual(Stats.viewTitle({team: "MSO", opp: "Call", date: ""}), "MSO vs Call");
  assert.strictEqual(Stats.viewTitle({team: "MSO", opp: "Call", date: "basura"}), "MSO vs Call");
  assert.strictEqual(Stats.viewTitle({team: "MSO", opp: "Call"}), "MSO vs Call");
});

/* ---- lineScore ---- */
test("RF-3 lineScore: visitante arriba (home nosotros => ellos primero), totales", function(){
  var g = rec().game, l = Stats.lineScore(g);
  assert.strictEqual(l.innings, 3);
  assert.deepStrictEqual(l.rows.map(function(r){ return r.name; }), ["MSO", "Call"]);
  assert.deepStrictEqual(l.rows[0].runs, [2, 0, 3]); assert.strictEqual(l.rows[0].total, 5);
  assert.deepStrictEqual(l.rows[1].runs, [1, 0, 0]); assert.strictEqual(l.rows[1].total, 1);
  g.home = true;
  l = Stats.lineScore(g);
  assert.deepStrictEqual(l.rows.map(function(r){ return r.name; }), ["Call", "MSO"]);
  assert.strictEqual(l.rows[0].total, 1); assert.strictEqual(l.rows[1].total, 5);
});

test("RF-3 lineScore: nombres vacíos Nosotros/Ellos; carreras de texto y largo = innings", function(){
  var l = Stats.lineScore({team: " ", opp: "", home: false, innings: 4, us: ["2", 1], them: []});
  assert.deepStrictEqual(l.rows.map(function(r){ return r.name; }), ["Nosotros", "Ellos"]);
  assert.deepStrictEqual(l.rows[0].runs, [2, 1, 0, 0]); assert.strictEqual(l.rows[0].total, 3);
  assert.deepStrictEqual(l.rows[1].runs, [0, 0, 0, 0]); assert.strictEqual(l.rows[1].total, 0);
});

/* ---- publicCopy ---- */
test("RF-25 publicCopy: solo la lista blanca, nada más", function(){
  var c = Stats.publicCopy(rec());
  assert.deepStrictEqual(c, {
    game: {team: "MSO", opp: "Call", date: "2026-11-05", home: false, innings: 3, us: [2, 0, 3], them: [1, 0, 0]},
    rows: [
      {num: "1", name: "Ana", pos: "SS", pas: [
        {inn: 1, ord: 1, code: "HR", run: true, rbi: 2, sb: 0, outs: 0},
        {inn: 2, ord: 1, code: "K", run: false, rbi: 0, sb: 0, outs: 1},
        {inn: 3, ord: 1, code: "BB", run: false, rbi: 0, sb: 1, outs: 0}]},
      {num: "2", name: "Bea", pos: "1B", sub: true, pas: [{inn: 3, code: "1B", run: true, rbi: 1, sb: 0}], ro: [{inn: 3, kind: "CS"}]},
      {num: "3", name: "Cris", pos: "P", pas: []}
    ]
  });
  var s = JSON.stringify(c);
  ["pid", "savedAt", "shareId", "\"id\"", "extra", "junk", "dh", "\"at\""].forEach(function(k){ assert.ok(s.indexOf(k) < 0, k); });
});

test("RF-25 publicCopy: no comparte arrays con la entrada y omite claves ausentes", function(){
  var r = rec(), c = Stats.publicCopy(r);
  c.game.us[0] = 99; c.rows[0].pas[0].code = "X";
  assert.strictEqual(r.game.us[0], 2); assert.strictEqual(r.rows[0].pas[0].code, "HR");
  var m = Stats.publicCopy({game: {team: "A"}, rows: [{name: "Z", pas: []}]});
  assert.deepStrictEqual(m, {game: {team: "A"}, rows: [{name: "Z", pas: []}]});
});

/* ---- imagen ---- */
test("RF-23 imageTable: 11 columnas, o 16 con más columnas", function(){
  var t = Stats.imageTable(rec(), false), m = Stats.imageTable(rec(), true);
  assert.deepStrictEqual(t.cols, ["Jugador", "VB", "H", "2B", "3B", "HR", "CA", "CI", "BB", "K", "AVE"]);
  assert.deepStrictEqual(m.cols, t.cols.concat(["OBP", "SLG", "OPS", "BR", "AR"]));
  assert.strictEqual(Stats.IMG_COLS.length, 10); assert.strictEqual(Stats.IMG_COLS_MORE.length, 15);
  assert.strictEqual(t.rows.length, 3);
  t.rows.concat([t.team]).forEach(function(r){ assert.strictEqual(r.length, 11); });
  m.rows.concat([m.team]).forEach(function(r){ assert.strictEqual(r.length, 16); });
});

test("RF-23 imageTable: todo texto; tasas con fmt; fila vacía con —; equipo al final", function(){
  var t = Stats.imageTable(rec(), true);
  assert.deepStrictEqual(t.rows[0].slice(0, 6), ["Ana", "2", "1", "0", "0", "1"]);
  assert.strictEqual(t.rows[0][10], ".500");
  assert.strictEqual(t.rows[2][10], "—");
  assert.strictEqual(t.rows[2][1], "0");
  assert.strictEqual(t.team[0], "Equipo");
  t.rows.concat([t.team]).forEach(function(r){ r.forEach(function(v){ assert.strictEqual(typeof v, "string"); }); });
});

/* ---- fileName ---- */
test("RF-24 fileName: espacios a guion, caracteres inválidos fuera, vacíos y sin fecha", function(){
  assert.strictEqual(Stats.fileName({team: "MSO", opp: "Call", date: "2026-11-05"}), "MSO-vs-Call-05-11-2026.png");
  assert.strictEqual(Stats.fileName({team: " Los  Tigres ", opp: "Red Sox", date: "2026-11-05"}), "Los-Tigres-vs-Red-Sox-05-11-2026.png");
  assert.strictEqual(Stats.fileName({team: "A/B:C", opp: "x*y?\"z\"<>|\\", date: "2026-11-05"}), "ABC-vs-xyz-05-11-2026.png");
  assert.strictEqual(Stats.fileName({team: "", opp: "  ", date: "2026-11-05"}), "equipo-vs-rival-05-11-2026.png");
  assert.strictEqual(Stats.fileName({team: "///", opp: "Call", date: "2026-11-05"}), "equipo-vs-Call-05-11-2026.png");
  assert.strictEqual(Stats.fileName({team: "MSO", opp: "Call", date: ""}), "MSO-vs-Call.png");
  assert.strictEqual(Stats.fileName({team: "MSO", opp: "Call", date: "basura"}), "MSO-vs-Call.png");
  assert.strictEqual(Stats.fileName({}), "equipo-vs-rival.png");
});

/* ---- shareId / enlace ---- */
test("RF-12 shareId: 16 caracteres [A-Za-z0-9], determinista, bytes[i] % 62", function(){
  var bytes = [], i;
  for(i = 0; i < 16; i++) bytes.push(i * 17 + 3); // 3..258 en una lista plana
  var id = Stats.shareId(bytes);
  assert.strictEqual(id.length, 16);
  assert.match(id, /^[A-Za-z0-9]{16}$/);
  assert.strictEqual(Stats.shareId(bytes), id);
  assert.strictEqual(Stats.shareId(new Uint8Array(16)), "AAAAAAAAAAAAAAAA");
  assert.strictEqual(Stats.shareId(new Uint8Array(16).fill(61)), "9999999999999999");
  assert.strictEqual(Stats.shareId(new Uint8Array(16).fill(255)), "HHHHHHHHHHHHHHHH"); // 255 % 62 = 7
});

test("RF-12 shareId: el alfabeto es A-Z a-z 0-9 en ese orden", function(){
  var ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", a = [], i;
  for(i = 0; i < 62; i++) a.push(i);
  assert.strictEqual(Stats.shareId(a.slice(0, 16)), ALPHA.slice(0, 16));
  assert.strictEqual(Stats.shareId(a.slice(46, 62)), ALPHA.slice(46, 62));
});

test("RF-12/26 shareLink y parseShare: ida y vuelta, y rechazos", function(){
  var link = Stats.shareLink("https://x.github.io/softball-lineup/", "uid-123_AB", "abcdEFGH12345678");
  assert.strictEqual(link, "https://x.github.io/softball-lineup/ver.html#p=uid-123_AB.abcdEFGH12345678");
  var hash = link.slice(link.indexOf("#"));
  assert.deepStrictEqual(Stats.parseShare(hash), {uid: "uid-123_AB", shareId: "abcdEFGH12345678"});
  assert.deepStrictEqual(Stats.parseShare("p=u1.abcdEFGH12345678"), {uid: "u1", shareId: "abcdEFGH12345678"});
  [undefined, null, "", "#", "#p=", "#p=u1", "#p=u1.short", "#p=u1.abcdEFGH123456789", "#p=u1.abcdEFGH1234567-", "#p=.abcdEFGH12345678",
    "#q=u1.abcdEFGH12345678", "#p=u/1.abcdEFGH12345678", "#p=u1.abcdEFGH12345678.x", "#p=u1.abcdEFGH12345678 "].forEach(function(h){
    assert.strictEqual(Stats.parseShare(h), null, String(h));
  });
  assert.strictEqual(Stats.parseShare("#p=" + new Array(130).join("a") + ".abcdEFGH12345678"), null);
});

/* ---- orphans ---- */
test("RF-21 orphans: ids sin entrada viva con ese shareId; la lápida no cuenta", function(){
  var entries = [
    {id: "1", savedAt: 1, shareId: "keep", game: {}, rows: []},
    {id: "2", savedAt: 1, game: {}, rows: []},
    {id: "3", savedAt: 1, deletedAt: 5, shareId: "dead"}
  ];
  assert.deepStrictEqual(Stats.orphans(["keep", "dead", "late"], entries), ["dead", "late"]);
  assert.deepStrictEqual(Stats.orphans(["keep"], entries), []);
  assert.deepStrictEqual(Stats.orphans([], entries), []);
  assert.deepStrictEqual(Stats.orphans(["a"], []), ["a"]);
  assert.deepStrictEqual(Stats.orphans(["a"], undefined), ["a"]);
});
