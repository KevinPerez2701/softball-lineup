var test = require("node:test");
var assert = require("node:assert");
var Stats = require("../stats.js");

function pa(inn, code, o){
  o = o || {};
  return {inn: inn, code: code, run: !!o.run, rbi: o.rbi || 0, sb: o.sb || 0};
}
function row(pid, num, name, pas){ return {pid: pid, num: num, name: name, pos: null, pas: pas}; }
function rec(id, date, savedAt, rows){
  return {id: id, savedAt: savedAt, game: {date: date, opp: "X", innings: 3, us: [0, 0, 0], them: [0, 0, 0]}, rows: rows};
}

// Fixture calculado a mano. Ana: 8 PA, 1 BB, 1 SF -> 6 AB; H 4; TB 1+2+4+3 = 10.
// Beto: 4 PA, 1 BB -> 3 AB; H 1. Cai: fila sin turnos (no debe salir). El marcador y su partido no cuentan.
var G1 = rec("g1", "2026-05-01", "2026-05-01T20:00:00Z", [
  row("p1", 7, "Ana", [pa(1, "1B", {run: true, rbi: 1, sb: 1}), pa(2, "BB"), pa(3, "K"), pa(3, "2B", {rbi: 2})]),
  row("p2", 9, "Beto", [pa(1, "RO"), pa(2, "FL"), pa(3, "1B"), pa(3, "BB")]),
  row("p3", 11, "Cai", [])
]);
var G2 = rec("g2", "2026-05-08", "2026-05-08T20:00:00Z", [
  row("p1", 7, "Ana", [pa(1, "HR", {run: true, rbi: 1}), pa(2, "SF", {rbi: 1}), pa(3, "E"), pa(3, "3B", {sb: 2})]),
  row("p3", 11, "Cai", [])
]);
var ENTRIES = [G1, G2, {id: "g3", deletedAt: "2026-05-10T00:00:00Z"}];
var TEAM = [{id: "p1", num: 7, name: "Ana"}, {id: "p2", num: 9, name: "Beto"}, {id: "p3", num: 11, name: "Cai"}];

function byPid(rows){
  var o = {};
  rows.forEach(function(r){ o[r.pid] = r; });
  return o;
}

test("players: counts and rates per player, zero-PA players absent", function(){
  var res = Stats.players(ENTRIES, TEAM);
  assert.deepStrictEqual(res.rows.map(function(r){ return r.pid; }).sort(), ["p1", "p2"]);
  var a = byPid(res.rows).p1, b = byPid(res.rows).p2;
  assert.deepStrictEqual(
    [a.g, a.pa, a.ab, a.h, a.b2, a.b3, a.hr, a.r, a.rbi, a.bb, a.k, a.sb, a.sf, a.tb],
    [2, 8, 6, 4, 1, 1, 1, 2, 5, 1, 1, 3, 1, 10]);
  assert.deepStrictEqual([a.avg, a.obp, a.slg, a.ops], [0.667, 0.625, 1.667, 2.292]);
  assert.deepStrictEqual(
    [b.g, b.pa, b.ab, b.h, b.r, b.rbi, b.bb, b.k, b.sb, b.sf, b.tb],
    [1, 4, 3, 1, 0, 0, 1, 0, 0, 0, 1]);
  assert.deepStrictEqual([b.avg, b.obp, b.slg, b.ops], [0.333, 0.5, 0.333, 0.833]);
  assert.strictEqual(Stats.fmt(b.avg), ".333");
});

test("players: team row sums counts, g = live records, rates from sums", function(){
  var t = Stats.players(ENTRIES, TEAM).team;
  assert.deepStrictEqual(
    [t.g, t.pa, t.ab, t.h, t.b2, t.b3, t.hr, t.r, t.rbi, t.bb, t.k, t.sb, t.sf, t.tb],
    [2, 12, 9, 5, 1, 1, 1, 2, 5, 2, 1, 3, 1, 11]);
  assert.deepStrictEqual([t.avg, t.obp, t.slg, t.ops], [0.556, 0.583, 1.222, 1.806]);
});

test("players: no live records gives empty rows and zeroed team with null rates", function(){
  var res = Stats.players([{id: "x", deletedAt: "z"}], TEAM);
  assert.deepStrictEqual(res.rows, []);
  assert.strictEqual(res.team.g, 0);
  assert.strictEqual(res.team.avg, null);
  assert.strictEqual(res.team.ops, null);
});

test("rates: rounding, 1.083, half-up and null denominators", function(){
  assert.strictEqual(Stats.rates({h: 1, ab: 3, bb: 0, sf: 0, tb: 1}).avg, 0.333);
  var r = Stats.rates({h: 6, ab: 12, bb: 0, sf: 0, tb: 7});
  assert.strictEqual(r.ops, 1.083);
  assert.strictEqual(Stats.fmt(r.ops), "1.083");
  var h = Stats.rates({h: 5, ab: 16, bb: 0, sf: 0, tb: 5});
  assert.strictEqual(h.avg, 0.313);
  assert.strictEqual(Stats.fmt(h.avg), ".313");
  var z = Stats.rates({h: 0, ab: 0, bb: 1, sf: 0, tb: 0});
  assert.strictEqual(z.avg, null);
  assert.strictEqual(z.slg, null);
  assert.strictEqual(z.obp, 1);
  assert.strictEqual(z.ops, null);
  assert.strictEqual(Stats.rates({h: 0, ab: 0, bb: 0, sf: 0, tb: 0}).obp, null);
});

test("fmt: null, zero, below one and above one", function(){
  assert.strictEqual(Stats.fmt(null), "—");
  assert.strictEqual(Stats.fmt(0), ".000");
  assert.strictEqual(Stats.fmt(1 / 3), ".333");
  assert.strictEqual(Stats.fmt(13 / 12), "1.083");
  assert.strictEqual(Stats.fmt(1), "1.000");
});

function mkRows(){
  return [
    {name: "Luis", avg: 0.3},
    {name: "Ana", avg: null},
    {name: "Zoe", avg: 0.3},
    {name: "Beto", avg: 0.5},
    {name: "Cai", avg: null}
  ];
}
function names(rows){ return rows.map(function(r){ return r.name; }); }

test("sortPlayers: avg desc puts nulls last, ties by name asc", function(){
  assert.deepStrictEqual(names(Stats.sortPlayers(mkRows(), "avg", true)), ["Beto", "Luis", "Zoe", "Ana", "Cai"]);
});

test("sortPlayers: avg asc keeps nulls last and ties by name asc", function(){
  assert.deepStrictEqual(names(Stats.sortPlayers(mkRows(), "avg", false)), ["Luis", "Zoe", "Beto", "Ana", "Cai"]);
});

test("sortPlayers: name asc and desc, input untouched", function(){
  var rows = mkRows(), before = names(rows);
  assert.deepStrictEqual(names(Stats.sortPlayers(rows, "name", false)), ["Ana", "Beto", "Cai", "Luis", "Zoe"]);
  assert.deepStrictEqual(names(Stats.sortPlayers(rows, "name", true)), ["Zoe", "Luis", "Cai", "Beto", "Ana"]);
  assert.deepStrictEqual(names(rows), before);
});

test("label: TEAM name and number win over the stored ones", function(){
  var recs = [rec("a", "2026-05-01", "2026-05-01T10:00:00Z", [row("p1", 3, "Ana vieja", [pa(1, "1B")])])];
  var r = Stats.players(recs, [{id: "p1", num: 77, name: "Ana Nueva"}]).rows[0];
  assert.strictEqual(r.name, "Ana Nueva");
  assert.strictEqual(r.num, 77);
});

test("label: player missing from TEAM takes the newest record's name and number", function(){
  var recs = [
    rec("new", "2026-06-01", "2026-06-01T10:00:00Z", [row("z", 5, "Zed Nuevo", [pa(1, "1B")])]),
    rec("old", "2026-05-01", "2026-07-01T10:00:00Z", [row("z", 4, "Zed Viejo", [pa(1, "1B")])])
  ];
  var r = Stats.players(recs, []).rows[0];
  assert.strictEqual(r.name, "Zed Nuevo");
  assert.strictEqual(r.num, 5);
});

test("label: same date is broken by later savedAt, whatever the input order", function(){
  var a = rec("a", "2026-06-01", "2026-06-01T10:00:00Z", [row("z", 4, "Zed A", [pa(1, "1B")])]);
  var b = rec("b", "2026-06-01", "2026-06-01T18:00:00Z", [row("z", 5, "Zed B", [pa(1, "1B")])]);
  assert.strictEqual(Stats.players([a, b], []).rows[0].name, "Zed B");
  assert.strictEqual(Stats.players([b, a], []).rows[0].name, "Zed B");
  assert.deepStrictEqual(Stats.byNewest([a, b]).map(function(r){ return r.id; }), ["b", "a"]);
});

test("label: a record where the player has no PA does not set the label", function(){
  var recs = [
    rec("new", "2026-06-01", "2026-06-01T10:00:00Z", [row("z", 5, "Zed Nuevo", [])]),
    rec("old", "2026-05-01", "2026-05-01T10:00:00Z", [row("z", 4, "Zed Viejo", [pa(1, "1B")])])
  ];
  assert.strictEqual(Stats.players(recs, []).rows[0].name, "Zed Viejo");
});
