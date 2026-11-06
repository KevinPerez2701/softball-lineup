var test = require("node:test");
var assert = require("node:assert");
var Stats = require("../stats.js");

test("stats.js se carga en Node", function(){
  assert.strictEqual(typeof Stats, "object");
});

function pa(inn, code, run){ return {inn: inn, code: code, run: !!run, rbi: 0, sb: 0}; }
function rec(innings, us, them, rows){
  return {id: "r1", savedAt: "2026-10-01T00:00:00.000Z",
    game: {date: "2026-10-01", team: "A", opp: "B", home: true, innings: innings, us: us, them: them}, rows: rows || []};
}

test("RF-2 CODES: 13 entries, textos de picker y celda, grupo y title", function(){
  assert.deepStrictEqual(Stats.CODES.map(function(c){ return c.code; }),
    ["1B","2B","3B","HR","BB","K","RO","FL","LI","E","JS","BO","SF"]);
  var by = {};
  Stats.CODES.forEach(function(c){ by[c.code] = c; });
  assert.strictEqual(Object.keys(by).length, 13);
  ["1B","2B","3B","HR","BB","K","E","JS","BO"].forEach(function(k){
    assert.strictEqual(by[k].pick, k); assert.strictEqual(by[k].cell, k);
  });
  assert.deepStrictEqual([by.SF.pick, by.SF.cell], ["Fly sac.", "FS"]);
  assert.strictEqual(by.BO.legacy, true);
  assert.strictEqual(Stats.CODES.filter(function(c){ return c.legacy; }).length, 1);
  assert.deepStrictEqual([by.RO.pick, by.RO.cell], ["Rolling", "Rol"]);
  assert.deepStrictEqual([by.FL.pick, by.FL.cell], ["Fly", "Fly"]);
  assert.deepStrictEqual([by.LI.pick, by.LI.cell], ["Línea", "Lín"]);
  // 005 RF-1: solo JS lleva title
  assert.strictEqual(by.JS.title, "Jugada de selección");
  Stats.CODES.forEach(function(c){ if(c.code !== "JS") assert.strictEqual(c.title, undefined, c.code); });
  // 005 RF-6: grupo de cada entrada
  var groups = {};
  Stats.CODES.forEach(function(c){ groups[c.code] = c.group; });
  assert.deepStrictEqual(groups, {"1B":"Hit","2B":"Hit","3B":"Hit",HR:"Hit",BB:"Se embasa",E:"Se embasa",JS:"Se embasa",
    K:"Out",RO:"Out",FL:"Out",LI:"Out",BO:"Out",SF:"Sacrificio"});
});

test("RF-2 cellLabel: etiqueta de celda y marca de carrera", function(){
  assert.strictEqual(Stats.cellLabel(pa(1, "RO")), "Rol");
  assert.strictEqual(Stats.cellLabel(pa(1, "LI")), "Lín");
  assert.strictEqual(Stats.cellLabel(pa(1, "1B", true)), "1B•");
  assert.strictEqual(Stats.cellLabel(pa(1, "K", false)), "K");
  assert.strictEqual(Stats.cellLabel(pa(1, "SF", true)), "FS•");
  assert.strictEqual(Stats.cellLabel(pa(1, "JS")), "JS");
  assert.strictEqual(Stats.cellLabel(pa(1, "JS", true)), "JS•");
});

test("RF-6 PICK_CODES: 12 entries, sin BO, mismo orden", function(){
  assert.deepStrictEqual(Stats.PICK_CODES.map(function(c){ return c.code; }),
    ["1B","2B","3B","HR","BB","K","RO","FL","LI","E","JS","SF"]);
  assert.strictEqual(Stats.PICK_CODES.length, 12);
});

test("005 RF-6 pickRows: cuatro filas con rótulo, BO al final de Out", function(){
  assert.deepStrictEqual(Stats.PICK_GROUPS, ["Hit", "Se embasa", "Out", "Sacrificio"]);
  function rows(codes){
    return Stats.pickRows(codes).map(function(r){ return [r.label, r.codes.map(function(c){ return c.code; })]; });
  }
  assert.deepStrictEqual(rows(Stats.PICK_CODES), [
    ["Hit", ["1B","2B","3B","HR"]], ["Se embasa", ["BB","E","JS"]],
    ["Out", ["K","RO","FL","LI"]], ["Sacrificio", ["SF"]]]);
  assert.deepStrictEqual(rows(Stats.CODES), [
    ["Hit", ["1B","2B","3B","HR"]], ["Se embasa", ["BB","E","JS"]],
    ["Out", ["K","RO","FL","LI","BO"]], ["Sacrificio", ["SF"]]]);
  assert.strictEqual(Stats.pickRows(Stats.PICK_CODES)[1].codes[2], Stats.CODES[10]);
});

test("RF-8 COL_TITLES: los 17 nombres", function(){
  assert.deepStrictEqual(Stats.COL_TITLES, {
    JJ: "Juegos jugados", AP: "Apariciones al plato", VB: "Veces al bate", H: "Hits", "2B": "Dobles",
    "3B": "Triples", HR: "Jonrones", CA: "Carreras anotadas", CI: "Carreras impulsadas", BB: "Bases por bolas",
    K: "Ponches", BR: "Bases robadas", AR: "Atrapado robando", AVE: "Promedio de bateo (H ÷ VB)",
    OBP: "Promedio de embasado", SLG: "Slugging (bases totales ÷ VB)", OPS: "OBP + SLG"});
  assert.strictEqual(Object.keys(Stats.COL_TITLES).length, 17);
});

test("RF-17 STAT_COLS: AVE, AP y luego OBP, SLG, OPS", function(){
  assert.deepStrictEqual(Stats.STAT_COLS.map(function(c){ return c[1]; }),
    ["AVE","AP","OBP","SLG","OPS","JJ","VB","H","2B","3B","HR","CA","CI","BB","K","BR","AR"]);
  assert.deepStrictEqual(Stats.STAT_COLS.map(function(c){ return c[0]; }),
    ["avg","pa","obp","slg","ops","g","ab","h","b2","b3","hr","r","rbi","bb","k","sb","cs"]);
  Stats.STAT_COLS.forEach(function(c){ assert.ok(c[1] in Stats.COL_TITLES, c[1]); });
  // solo las cuatro tasas van sin bandera de entero
  assert.deepStrictEqual(Stats.STAT_COLS.filter(function(c){ return !c[2]; }).map(function(c){ return c[1]; }),
    ["AVE","OBP","SLG","OPS"]);
  var g = rec(3, [0, 0, 0], [0, 0, 0], [{pid: "p1", num: 7, name: "Ana", pos: null, pas: [pa(1, "1B")]}]);
  var r = Stats.players([g], [{id: "p1", num: 7, name: "Ana"}]).rows[0];
  Stats.STAT_COLS.forEach(function(c){ assert.ok(c[0] in r, c[0]); });
});

test("RF-14/15 pickResult: HR marca carrera y CI, y al salir restaura", function(){
  var f = Stats.pickResult({code: "1B", run: false, rbi: 0, outs: 0}, "HR");
  assert.deepStrictEqual([f.code, f.run, f.rbi, f.outs], ["HR", true, 1, 0]);
  // CI ya puesto se conserva
  f = Stats.pickResult({code: "1B", run: false, rbi: 3, outs: 0}, "HR");
  assert.deepStrictEqual([f.run, f.rbi], [true, 3]);
  // HR -> K restaura y vuelven los outs de K
  f = Stats.pickResult({code: "1B", run: false, rbi: 0, outs: 0}, "HR");
  Stats.pickResult(f, "K");
  assert.deepStrictEqual([f.code, f.run, f.rbi, f.outs, "hrPrev" in f], ["K", false, 0, 1, false]);
  // lo editado mientras es HR se pierde al salir: valen los previos al HR
  f = Stats.pickResult({code: "1B", run: true, rbi: 2, outs: 0}, "HR");
  f.run = false; f.rbi = 4;
  Stats.pickResult(f, "2B");
  assert.deepStrictEqual([f.code, f.run, f.rbi, "hrPrev" in f], ["2B", true, 2, false]);
  // abierto como HR (sin hrPrev): salir no toca carrera ni CI
  f = Stats.pickResult({code: "HR", run: true, rbi: 2, outs: 0}, "1B");
  assert.deepStrictEqual([f.code, f.run, f.rbi], ["1B", true, 2]);
  // HR -> HR no hace nada
  f = Stats.pickResult({code: "1B", run: false, rbi: 0, outs: 0}, "HR");
  var snap = JSON.stringify(f);
  assert.strictEqual(Stats.pickResult(f, "HR"), f);
  assert.strictEqual(JSON.stringify(f), snap);
  // cambio sin HR reinicia outs
  f = Stats.pickResult({code: "K", run: false, rbi: 0, outs: 1}, "1B");
  assert.deepStrictEqual([f.code, f.outs, f.run, f.rbi], ["1B", 0, false, 0]);
});

test("RF-1/8/36 refreshRows: vacío copia la alineación", function(){
  var lineup = [{pid: "a", num: "1", name: "Ana", pos: "P"}, {pid: "b", num: "2", name: "Bea", pos: "DH"}];
  var out = Stats.refreshRows([], lineup);
  assert.deepStrictEqual(out, [
    {pid: "a", num: "1", name: "Ana", pos: "P", pas: []},
    {pid: "b", num: "2", name: "Bea", pos: "DH", pas: []}]);
  assert.notStrictEqual(out[0], lineup[0]);
});

test("RF-8/36 refreshRows: conserva filas, agrega nuevos, quita duplicados", function(){
  var stored = [
    {pid: "b", num: "2", name: "Bea", pos: null, pas: [pa(1, "1B")], sub: true},
    {pid: "x", num: "9", name: "Fuera", pos: "CF", pas: []},
    {pid: "b", num: "2", name: "Bea", pos: "P", pas: []}];
  var lineup = [{pid: "a", num: "1", name: "Ana", pos: "P"}, {pid: "b", num: "7", name: "Beatriz", pos: "DH"},
    {pid: "c", num: "3", name: "Cris", pos: "SS"}];
  var out = Stats.refreshRows(stored, lineup);
  assert.deepStrictEqual(out.map(function(r){ return r.pid; }), ["b", "x", "a", "c"]);
  // RF-8 (2026-11-06): la fila de quien sigue en el orden toma número, nombre y posición de la alineación
  assert.deepStrictEqual([out[0].num, out[0].name, out[0].pos], ["7", "Beatriz", "DH"]);
  assert.strictEqual(out[0].pas.length, 1);
  assert.strictEqual(out[0].sub, true);
  assert.strictEqual(out[1].pos, "CF"); // ya no está en el orden: conserva lo suyo
  assert.deepStrictEqual(out[2], {pid: "a", num: "1", name: "Ana", pos: "P", pas: []});
  assert.strictEqual(stored.length, 3);
  assert.strictEqual(stored[0].pos, null); // no toca las filas de quien llama
});

test("RF-36 refreshRows: duplicados dentro de la alineación o las filas", function(){
  var lineup = [{pid: "a", num: "1", name: "Ana", pos: "P"}, {pid: "a", num: "1", name: "Ana", pos: "C"}];
  assert.strictEqual(Stats.refreshRows([], lineup).length, 1);
});

test("RF-31/38 fit: sube innings al mayor turno y rellena us/them", function(){
  var r = rec(7, [1, 0, 0, 0, 0, 0, 2], [0, 0, 0, 0, 0, 0, 0],
    [{pid: "a", num: "1", name: "Ana", pos: "P", pas: [pa(9, "HR", true)]}]);
  var out = Stats.fit(r);
  assert.strictEqual(out, r);
  assert.strictEqual(out.game.innings, 9);
  assert.deepStrictEqual(out.game.us, [1, 0, 0, 0, 0, 0, 2, 0, 0]);
  assert.strictEqual(out.game.them.length, 9);
});

test("RF-38 fit: trunca us/them a innings", function(){
  var r = rec(3, [1, 2, 3, 4, 5], [1], []);
  Stats.fit(r);
  assert.strictEqual(r.game.innings, 3);
  assert.deepStrictEqual(r.game.us, [1, 2, 3]);
  assert.deepStrictEqual(r.game.them, [1, 0, 0]);
});

test("RF-38 fit: carreras guardadas como texto pasan a número", function(){
  var r = rec(3, ["3", "", null], ["2"], []);
  Stats.fit(r);
  assert.deepStrictEqual(r.game.us, [3, 0, 0]);
  assert.deepStrictEqual(r.game.them, [2, 0, 0]);
});

test("RF-30 minInnings: max(3, inning más alto con turno)", function(){
  assert.strictEqual(Stats.minInnings(rec(7, [], [], [])), 3);
  var rows = [{pid: "a", pas: [pa(2, "K")]}, {pid: "b", pas: [pa(5, "BB")]}];
  assert.strictEqual(Stats.minInnings(rec(7, [], [], rows)), 5);
});

test("spec 002 RF-17 minInnings cuenta outs corriendo (inning 6 => 6)", function(){
  var rows = [{pid: "a", pas: [pa(2, "K")], ro: [{inn: 6, kind: "CS"}]}];
  assert.strictEqual(Stats.minInnings(rec(7, [], [], rows)), 6);
});

test("spec 002 RF-21 hasPA sigue contando solo turnos (solo outs corriendo => false)", function(){
  assert.strictEqual(Stats.hasPA(rec(3, [], [], [{pid: "a", pas: [], ro: [{inn: 1, kind: "CS"}]}])), false);
});

test("RF-5/6 runCheck: cuenta carreras por inning vs pizarra", function(){
  var rows = [
    {pid: "a", pas: [pa(1, "1B", true), pa(3, "K", false)]},
    {pid: "b", pas: [pa(1, "BB", true), pa(1, "2B", true)]}];
  var out = Stats.runCheck(rec(3, [1, 0], [0, 0, 0], rows));
  assert.deepStrictEqual(out, [
    {sheet: 3, board: 1, diff: 2},
    {sheet: 0, board: 0, diff: 0},
    {sheet: 0, board: 0, diff: 0}]);
  var neg = Stats.runCheck(rec(2, [3, 0], [], []));
  assert.strictEqual(neg[0].diff, -3);
});

test("RF-6 signed: +n, U+2212 para negativo, vacío en 0", function(){
  assert.strictEqual(Stats.signed(1), "+1");
  assert.strictEqual(Stats.signed(-2), "−2");
  assert.strictEqual(Stats.signed(0), "");
});

test("RF-33 hasPA", function(){
  assert.strictEqual(Stats.hasPA(rec(3, [], [], [])), false);
  assert.strictEqual(Stats.hasPA(rec(3, [], [], [{pid: "a", pas: []}])), false);
  assert.strictEqual(Stats.hasPA(rec(3, [], [], [{pid: "a", pas: []}, {pid: "b", pas: [pa(1, "K")]}])), true);
});

test("RF-6 cellName: celda vacía", function(){
  assert.strictEqual(Stats.cellName({name: "Ana", pas: []}, 3), "Ana, inning 3, sin turnos");
  assert.strictEqual(Stats.cellName({name: "Ana", pas: [pa(1, "K")]}, 3), "Ana, inning 3, sin turnos");
});

test("RF-6 cellName: turno con ord, título del código y carrera", function(){
  var row = {name: "Ana", pas: [{inn: 3, ord: 2, code: "RO", run: false}]};
  assert.strictEqual(Stats.cellName(row, 3), "Ana, inning 3, turno 2: Rolling");
  row = {name: "Ana", pas: [{inn: 3, ord: 1, code: "JS", run: false}]};
  assert.strictEqual(Stats.cellName(row, 3), "Ana, inning 3, turno 1: Jugada de selección");
  row = {name: "Ana", pas: [{inn: 3, ord: 1, code: "HR", run: true}]};
  assert.strictEqual(Stats.cellName(row, 3), "Ana, inning 3, turno 1: HR, anotó carrera");
});

test("RF-6 cellName: ordena por ord; sin ord al final, sin número", function(){
  var row = {name: "Ana", pas: [
    {inn: 3, code: "1B", run: false},
    {inn: 3, ord: 5, code: "K", run: false},
    {inn: 3, ord: 2, code: "BB", run: false},
    {inn: 4, ord: 1, code: "HR", run: false}]};
  assert.strictEqual(Stats.cellName(row, 3), "Ana, inning 3, turno 2: BB, turno 5: K, turno: 1B");
});

test("RF-6 cellName: outs corriendo y código desconocido", function(){
  var row = {name: "Ana", pas: [], ro: [{inn: 3, kind: "CS"}, {inn: 2, kind: "PO"}]};
  assert.strictEqual(Stats.cellName(row, 3), "Ana, inning 3, Atrapado robando");
  row = {name: "Ana", pas: [{inn: 3, ord: 1, code: "ZZ", run: false}], ro: [{inn: 3, kind: "XX"}]};
  assert.strictEqual(Stats.cellName(row, 3), "Ana, inning 3, turno 1: ZZ, XX");
});
