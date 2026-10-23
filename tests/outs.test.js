var test = require("node:test");
var assert = require("node:assert");
var Stats = require("../stats.js");

function pa(inn, code, extra){
  var p = {inn: inn, code: code, run: false, rbi: 0, sb: 0}, k;
  for(k in (extra || {})) p[k] = extra[k];
  return p;
}
function rec(innings, rows){
  return {id: "r1", savedAt: "2026-10-01T00:00:00.000Z",
    game: {date: "2026-10-01", team: "A", opp: "B", home: true, innings: innings, us: [], them: []}, rows: rows};
}
// n outs en el inning inn, en una sola fila, con ponches (1 out cada uno)
function ks(inn, n){
  var a = [], i;
  for(i = 0; i < n; i++) a.push(pa(inn, "K"));
  return a;
}

test("RF-7 RO_KINDS y roLabel", function(){
  assert.deepStrictEqual(Stats.RO_KINDS, [
    {kind: "CS", pick: "Atrapado robando", cell: "AR"},
    {kind: "PO", pick: "Sorprendido en base", cell: "Sor"},
    {kind: "OB", pick: "Out corriendo las bases", cell: "OC"}]);
  assert.strictEqual(Stats.roLabel("CS"), "AR");
  assert.strictEqual(Stats.roLabel("PO"), "Sor");
  assert.strictEqual(Stats.roLabel("OB"), "OC");
  assert.strictEqual(Stats.roLabel("ZZ"), "ZZ");
});

test("RF-6 defaultOuts: 1 para K RO FL LI SF BO, 0 para el resto", function(){
  ["K", "RO", "FL", "LI", "SF", "BO"].forEach(function(c){ assert.strictEqual(Stats.defaultOuts(c), 1, c); });
  ["1B", "2B", "3B", "HR", "BB", "E", "", "XX"].forEach(function(c){ assert.strictEqual(Stats.defaultOuts(c), 0, c); });
});

test("RF-6/12 paOuts: outs guardado gana, sin outs usa el default", function(){
  assert.strictEqual(Stats.paOuts(pa(1, "RO", {outs: 2})), 2);
  assert.strictEqual(Stats.paOuts(pa(1, "K", {outs: 0})), 0);
  assert.strictEqual(Stats.paOuts(pa(1, "K")), 1);
  assert.strictEqual(Stats.paOuts(pa(1, "1B")), 0);
});

test("RF-8 inningOuts suma turnos y outs corriendo; filas sin ro sirven", function(){
  var r = rec(3, [
    {pid: "a", pas: [pa(1, "K"), pa(2, "1B"), pa(1, "RO", {outs: 2})], ro: [{inn: 1, kind: "CS"}, {inn: 2, kind: "PO"}]},
    {pid: "b", pas: [pa(1, "BB")]}]);
  assert.strictEqual(Stats.inningOuts(r, 1), 4);
  assert.strictEqual(Stats.inningOuts(r, 2), 1);
  assert.strictEqual(Stats.inningOuts(r, 3), 0);
});

test("RF-8 outsCheck: [3,2,3,1,0] con la última entrada en el 4 avisa solo el 2", function(){
  var r = rec(5, [{pid: "a", pas: ks(1, 3).concat(ks(2, 2), ks(3, 3), ks(4, 1))}]);
  assert.deepStrictEqual(Stats.outsCheck(r), [
    {outs: 3, warn: false}, {outs: 2, warn: true}, {outs: 3, warn: false},
    {outs: 1, warn: false}, {outs: 0, warn: false}]);
});

test("RF-8 outsCheck: 4 outs en un inning anterior avisa; la última entrada puede ser un out corriendo", function(){
  var r = rec(3, [{pid: "a", pas: ks(1, 4), ro: [{inn: 2, kind: "CS"}]}]);
  assert.deepStrictEqual(Stats.outsCheck(r), [
    {outs: 4, warn: true}, {outs: 1, warn: false}, {outs: 0, warn: false}]);
});

test("RF-8 outsCheck: hoja vacía sin avisos; walk-off con 1 out no avisa", function(){
  assert.deepStrictEqual(Stats.outsCheck(rec(3, [{pid: "a", pas: []}])),
    [{outs: 0, warn: false}, {outs: 0, warn: false}, {outs: 0, warn: false}]);
  var r = rec(3, [{pid: "a", pas: ks(1, 3).concat(ks(2, 3), ks(3, 1))}]);
  assert.deepStrictEqual(Stats.outsCheck(r).map(function(o){ return o.warn; }), [false, false, false]);
});

test("RF-8 outsCheck: más de 3 outs avisa también en el último inning", function(){
  var r = rec(2, [{pid: "a", pas: ks(1, 3).concat(ks(2, 4))}]);
  assert.deepStrictEqual(Stats.outsCheck(r).map(function(o){ return o.warn; }), [false, true]);
});

test("RF-1 openInning: primer inning con menos de 3 outs, innings+1 si todos cerrados, 1 si vacía", function(){
  assert.strictEqual(Stats.openInning(rec(3, [{pid: "a", pas: ks(1, 3).concat(ks(2, 3), ks(3, 1))}])), 3);
  assert.strictEqual(Stats.openInning(rec(3, [{pid: "a", pas: ks(1, 3).concat(ks(2, 3), ks(3, 3))}])), 4);
  assert.strictEqual(Stats.openInning(rec(3, [{pid: "a", pas: []}])), 1);
  assert.strictEqual(Stats.openInning(rec(3, [{pid: "a", pas: ks(1, 2)}])), 1);
});

test("RF-9/16 cellLines: turnos en orden, luego outs corriendo; sin ord da null", function(){
  var row = {pid: "a", pas: [pa(2, "K"), pa(1, "1B", {ord: 1, run: true}), pa(1, "RO")],
    ro: [{inn: 1, kind: "PO"}, {inn: 2, kind: "CS"}, {inn: 1, kind: "CS"}]};
  assert.deepStrictEqual(Stats.cellLines(row, 1), [
    {ord: 1, text: "1B•"}, {ord: null, text: "Rol"}, {ord: null, text: "Sor"}, {ord: null, text: "AR"}]);
  assert.deepStrictEqual(Stats.cellLines(row, 2), [{ord: null, text: "K"}, {ord: null, text: "AR"}]);
  assert.deepStrictEqual(Stats.cellLines({pid: "b", pas: [pa(3, "BB", {ord: 2})]}, 3), [{ord: 2, text: "BB"}]);
  assert.deepStrictEqual(Stats.cellLines({pid: "b", pas: []}, 1), []);
});

test("RF-17 rowEmpty: un out corriendo cuenta como contenido", function(){
  assert.strictEqual(Stats.rowEmpty({pid: "a", pas: []}), true);
  assert.strictEqual(Stats.rowEmpty({pid: "a", pas: [], ro: []}), true);
  assert.strictEqual(Stats.rowEmpty({pid: "a", pas: [], ro: [{inn: 1, kind: "CS"}]}), false);
  assert.strictEqual(Stats.rowEmpty({pid: "a", pas: [pa(1, "K")]}), false);
});

test("RF-17 minInnings cuenta outs corriendo", function(){
  assert.strictEqual(Stats.minInnings(rec(3, [{pid: "a", pas: [pa(2, "K")], ro: [{inn: 5, kind: "CS"}]}])), 5);
  assert.strictEqual(Stats.minInnings(rec(3, [{pid: "a", pas: [pa(2, "K")], ro: []}])), 3);
});
