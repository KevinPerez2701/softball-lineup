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

test("RF-2 CODES: 12 entries, textos de picker y celda", function(){
  assert.deepStrictEqual(Stats.CODES.map(function(c){ return c.code; }),
    ["1B","2B","3B","HR","BB","K","RO","FL","LI","E","BO","SF"]);
  var by = {};
  Stats.CODES.forEach(function(c){ by[c.code] = c; });
  assert.strictEqual(Object.keys(by).length, 12);
  ["1B","2B","3B","HR","BB","K","E","BO","SF"].forEach(function(k){
    assert.strictEqual(by[k].pick, k); assert.strictEqual(by[k].cell, k);
  });
  assert.deepStrictEqual([by.RO.pick, by.RO.cell], ["Rolling", "Rol"]);
  assert.deepStrictEqual([by.FL.pick, by.FL.cell], ["Fly", "Fly"]);
  assert.deepStrictEqual([by.LI.pick, by.LI.cell], ["Línea", "Lín"]);
});

test("RF-2 cellLabel: etiqueta de celda y marca de carrera", function(){
  assert.strictEqual(Stats.cellLabel(pa(1, "RO")), "Rol");
  assert.strictEqual(Stats.cellLabel(pa(1, "LI")), "Lín");
  assert.strictEqual(Stats.cellLabel(pa(1, "1B", true)), "1B•");
  assert.strictEqual(Stats.cellLabel(pa(1, "K", false)), "K");
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
    {pid: "b", num: "2", name: "Bea", pos: null, pas: [pa(1, "1B")]},
    {pid: "x", num: "9", name: "Fuera", pos: "CF", pas: []},
    {pid: "b", num: "2", name: "Bea", pos: "P", pas: []}];
  var lineup = [{pid: "a", num: "1", name: "Ana", pos: "P"}, {pid: "b", num: "2", name: "Bea", pos: "DH"},
    {pid: "c", num: "3", name: "Cris", pos: "SS"}];
  var out = Stats.refreshRows(stored, lineup);
  assert.deepStrictEqual(out.map(function(r){ return r.pid; }), ["b", "x", "a", "c"]);
  assert.strictEqual(out[0].pos, null);
  assert.strictEqual(out[0].pas.length, 1);
  assert.strictEqual(out[1].pos, "CF");
  assert.deepStrictEqual(out[2], {pid: "a", num: "1", name: "Ana", pos: "P", pas: []});
  assert.strictEqual(stored.length, 3);
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
