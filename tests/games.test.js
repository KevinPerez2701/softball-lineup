var test = require("node:test");
var assert = require("node:assert");
var Stats = require("../stats.js");

function blank(){
  return {team: "", opp: "", home: "them", date: "", start: "", end: "", roster: [],
    assign: {P: null, C: null, "1B": null, "2B": null, "3B": null, SS: null, LF: null, CF: null, LCF: null, RCF: null, RF: null, SF: null},
    order: [], dh: null, enabledSF: true, enabled4F: false, enabledDH: false, innings: 7,
    us: [0, 0, 0, 0, 0, 0, 0], them: [0, 0, 0, 0, 0, 0, 0]};
}
function lineup(){
  var st = blank();
  st.team = "Tigres"; st.opp = "Leones"; st.date = "2026-11-05";
  st.roster = [{id: "p1", num: "1", name: "Ana"}, {id: "p2", num: "2", name: "Beto"}];
  st.assign.P = "p1"; st.assign.C = "p2";
  st.order = ["p1", "p2"]; st.dh = "p2";
  st.us = [1, 0, 2, 0, 0, 0, 0];
  return st;
}
function clone(x){ return JSON.parse(JSON.stringify(x)); }
function g(id, at){ return {id: id, name: "n" + id, at: at, state: {}}; }
function ids(list){ return list.map(function(e){ return e.id; }); }

/* ---- T1: differs / isEmpty / unsaved ---- */
test("differs: identical lineups do not differ", function(){
  assert.strictEqual(Stats.differs(lineup(), clone(lineup())), false);
});

test("differs: each compared field flips it", function(){
  var changes = {
    team: function(s){ s.team = "X"; },
    opp: function(s){ s.opp = "X"; },
    home: function(s){ s.home = "us"; },
    date: function(s){ s.date = "2026-01-01"; },
    roster: function(s){ s.roster.pop(); },
    assign: function(s){ s.assign.SS = "p1"; },
    order: function(s){ s.order.reverse(); },
    dh: function(s){ s.dh = "p1"; },
    enabledSF: function(s){ s.enabledSF = false; },
    enabled4F: function(s){ s.enabled4F = true; },
    enabledDH: function(s){ s.enabledDH = true; },
    innings: function(s){ s.innings = 9; },
    us: function(s){ s.us[0] = 5; },
    them: function(s){ s.them[6] = 1; },
    statsId: function(s){ s.statsId = "s1"; }
  };
  Object.keys(changes).forEach(function(k){
    var b = clone(lineup());
    changes[k](b);
    assert.strictEqual(Stats.differs(lineup(), b), true, k);
    assert.strictEqual(Stats.differs(b, lineup()), true, k + " (reverse)");
  });
});

test("differs: at, key order, roster names, gameId, gameAt, start, end do not count", function(){
  var a = lineup(), b = lineup();
  b.at = "2026-01-01"; b.gameId = "g1"; b.gameAt = "2026-01-01T00:00:00Z"; b.start = "10:00"; b.end = "12:00";
  b.roster = [{num: "9", name: "Otro", id: "p1"}, {name: "Z", id: "p2", num: "8"}];
  var c = {}, keys = Object.keys(a).reverse();
  keys.forEach(function(k){ c[k] = a[k]; });
  assert.strictEqual(Stats.differs(a, b), false);
  assert.strictEqual(Stats.differs(a, c), false);
});

test("differs: us/them compare as integers, missing elements are 0", function(){
  var a = lineup(), b = lineup();
  b.us = ["1", "0", "2", "0", "0", "0", "0"];
  assert.strictEqual(Stats.differs(a, b), false);
  b.us = [1, 0, 2];
  assert.strictEqual(Stats.differs(a, b), false);
  b.us = [1, 0, 2, 0, 0, 0, 1];
  assert.strictEqual(Stats.differs(a, b), true);
  var z = blank();
  z.us = ["x"];
  assert.strictEqual(Stats.differs(blank(), z), false);
});

test("differs: missing assign key equals null, statsId absent equals null", function(){
  var a = lineup(), b = lineup();
  delete b.assign.RF;
  b.statsId = null;
  assert.strictEqual(Stats.differs(a, b), false);
  b.assign.RF = "p1";
  assert.strictEqual(Stats.differs(a, b), true);
});

test("differs: ignore skips the named fields", function(){
  var a = lineup(), b = lineup();
  b.date = "2020-01-01"; b.roster = [];
  assert.strictEqual(Stats.differs(a, b), true);
  assert.strictEqual(Stats.differs(a, b, ["date", "roster"]), false);
});

test("differs: does not mutate inputs", function(){
  var a = lineup(), b = lineup();
  b.us = ["3"];
  var ca = clone(a), cb = clone(b);
  Stats.differs(a, b);
  assert.deepStrictEqual(a, ca);
  assert.deepStrictEqual(b, cb);
});

test("isEmpty: blank is empty, date and roster are ignored", function(){
  var st = blank();
  assert.strictEqual(Stats.isEmpty(st, blank()), true);
  st.date = "2026-11-05";
  st.roster = [{id: "p1", num: "1", name: "Ana"}];
  assert.strictEqual(Stats.isEmpty(st, blank()), true);
});

test("isEmpty: any other field makes it non-empty, statsId counts", function(){
  var st = blank();
  st.team = "Tigres";
  assert.strictEqual(Stats.isEmpty(st, blank()), false);
  st = blank(); st.statsId = "s1";
  assert.strictEqual(Stats.isEmpty(st, blank()), false);
  st = blank(); st.us[2] = 1;
  assert.strictEqual(Stats.isEmpty(st, blank()), false);
});

test("unsaved: linked state compares with differs, otherwise not empty", function(){
  var st = lineup(), linked = clone(lineup());
  assert.strictEqual(Stats.unsaved(st, linked, blank()), false);
  st.opp = "Otros";
  assert.strictEqual(Stats.unsaved(st, linked, blank()), true);
  assert.strictEqual(Stats.unsaved(blank(), null, blank()), false);
  assert.strictEqual(Stats.unsaved(lineup(), null, blank()), true);
  assert.strictEqual(Stats.unsaved(blank(), undefined, blank()), false);
});

/* ---- T2: upsertGame / trimGames / mergeGames ---- */
test("upsertGame: puts game first and removes the same id", function(){
  var list = [g("a", "2026-01-01"), g("b", "2026-01-02"), g("c", "2026-01-03")];
  var copy = clone(list);
  var neu = g("b", "2026-02-01");
  var out = Stats.upsertGame(list, neu);
  assert.deepStrictEqual(ids(out), ["b", "a", "c"]);
  assert.strictEqual(out[0], neu);
  assert.deepStrictEqual(list, copy);
  assert.notStrictEqual(out, list);
  assert.deepStrictEqual(ids(Stats.upsertGame(list, g("z", "2026-03-01"))), ["z", "a", "b", "c"]);
});

test("trimGames: within max keeps everything", function(){
  var list = [g("a", "2026-01-01"), g("b", "2026-01-02")];
  var r = Stats.trimGames(list, 2);
  assert.deepStrictEqual(ids(r.kept), ["a", "b"]);
  assert.deepStrictEqual(r.dropped, []);
});

test("trimGames: 201 entries drops the lowest at, not the last position", function(){
  var list = [], i;
  for(i = 0; i < 201; i++) list.push(g("g" + i, "2026-06-" + (i < 9 ? "0" : "") + "01T00:00:" + (i < 10 ? "0" : "") + (i % 60) + "Z"));
  // el más viejo queda en medio de la lista
  list[100].at = "2020-01-01T00:00:00Z";
  var copy = clone(list);
  var r = Stats.trimGames(list, 200);
  assert.strictEqual(r.kept.length, 200);
  assert.deepStrictEqual(ids(r.dropped), ["g100"]);
  assert.strictEqual(ids(r.kept).indexOf("g100"), -1);
  assert.strictEqual(r.kept[r.kept.length - 1].id, "g200");
  assert.strictEqual(r.kept[0].id, "g0");
  assert.deepStrictEqual(list, copy);
});

test("trimGames: tie on at drops the later position", function(){
  var list = [g("a", "2026-01-01"), g("b", "2026-01-01"), g("c", "2026-05-01")];
  var r = Stats.trimGames(list, 2);
  assert.deepStrictEqual(ids(r.dropped), ["b"]);
  assert.deepStrictEqual(ids(r.kept), ["a", "c"]);
});

test("trimGames: drops several, keeps original order", function(){
  var list = [g("a", "2026-03-01"), g("b", "2026-01-01"), g("c", "2026-02-01"), g("d", "2026-04-01")];
  var r = Stats.trimGames(list, 2);
  assert.deepStrictEqual(ids(r.kept), ["a", "d"]);
  assert.deepStrictEqual(ids(r.dropped).sort(), ["b", "c"]);
});

test("mergeGames: union by id, newer at wins, sorted desc, no cut", function(){
  var a = [g("x", "2026-01-01"), g("y", "2026-03-01")];
  var b = [g("x", "2026-02-01"), g("z", "2026-02-15")];
  var ca = clone(a), cb = clone(b);
  var m = Stats.mergeGames(a, b);
  assert.deepStrictEqual(ids(m), ["y", "z", "x"]);
  assert.strictEqual(m[2].at, "2026-02-01");
  assert.deepStrictEqual(a, ca);
  assert.deepStrictEqual(b, cb);
});

test("mergeGames: result independent of argument order", function(){
  var a = [g("x", "2026-01-01"), g("y", "2026-03-01")];
  var b = [g("x", "2026-02-01"), g("z", "2026-02-15")];
  assert.deepStrictEqual(Stats.mergeGames(a, b), Stats.mergeGames(b, a));
});

test("mergeGames: tie keeps a's entry, null lists are empty", function(){
  var a = [{id: "x", name: "A", at: "2026-01-01", state: {}}];
  var b = [{id: "x", name: "B", at: "2026-01-01", state: {}}];
  assert.strictEqual(Stats.mergeGames(a, b)[0].name, "A");
  assert.deepStrictEqual(Stats.mergeGames(null, undefined), []);
  assert.deepStrictEqual(ids(Stats.mergeGames(a, null)), ["x"]);
});

test("mergeGames: keeps 300 entries when two 150-lists are disjoint", function(){
  var a = [], b = [], i;
  for(i = 0; i < 150; i++){
    a.push(g("a" + i, "2026-01-01T00:" + (i < 10 ? "0" : "") + (i % 60) + ":" + (i < 100 ? "0" : "") + (i % 100 < 10 ? "0" : "") + (i % 100) + "Z"));
    b.push(g("b" + i, "2026-02-01T00:" + (i < 10 ? "0" : "") + (i % 60) + ":" + (i < 100 ? "0" : "") + (i % 100 < 10 ? "0" : "") + (i % 100) + "Z"));
  }
  var m = Stats.mergeGames(a, b);
  assert.strictEqual(m.length, 300);
  for(i = 1; i < m.length; i++) assert.ok(m[i - 1].at >= m[i].at);
});

/* ---- T3: asNew / gameName / result / fmtDate / fmtDateTime ---- */
test("asNew: keeps setup, resets score and extras, deep copy", function(){
  var st = lineup();
  st.statsId = "s1"; st.gameId = "g1"; st.gameAt = "2026-01-01T00:00:00Z";
  st.start = "10:00"; st.end = "12:00"; st.innings = 9; st.home = "us";
  st.enabled4F = true; st.enabledDH = true; st.enabledSF = false;
  var copy = clone(st);
  var n = Stats.asNew(st, "2026-12-01");
  assert.deepStrictEqual(st, copy);
  assert.strictEqual(n.date, "2026-12-01");
  assert.strictEqual(n.innings, 7);
  assert.deepStrictEqual(n.us, [0, 0, 0, 0, 0, 0, 0]);
  assert.deepStrictEqual(n.them, [0, 0, 0, 0, 0, 0, 0]);
  assert.strictEqual(n.start, ""); assert.strictEqual(n.end, "");
  assert.ok(!("statsId" in n)); assert.ok(!("gameId" in n)); assert.ok(!("gameAt" in n));
  assert.strictEqual(n.team, "Tigres"); assert.strictEqual(n.opp, "Leones"); assert.strictEqual(n.home, "us");
  assert.strictEqual(n.dh, "p2");
  assert.strictEqual(n.enabledSF, false); assert.strictEqual(n.enabled4F, true); assert.strictEqual(n.enabledDH, true);
  assert.deepStrictEqual(n.roster, st.roster);
  assert.deepStrictEqual(n.assign, st.assign);
  assert.deepStrictEqual(n.order, st.order);
  assert.notStrictEqual(n.roster, st.roster);
  assert.notStrictEqual(n.roster[0], st.roster[0]);
  assert.notStrictEqual(n.assign, st.assign);
  assert.notStrictEqual(n.order, st.order);
});

test("gameName: names, fallbacks and date suffix", function(){
  assert.strictEqual(Stats.gameName({team: " Tigres ", opp: "Leones", date: "2026-11-05"}), "Tigres vs Leones · 05/11/2026");
  assert.strictEqual(Stats.gameName({team: "", opp: "  ", date: ""}), "Equipo vs rival");
  assert.strictEqual(Stats.gameName({team: "Tigres", opp: "Leones", date: ""}), "Tigres vs Leones");
  assert.strictEqual(Stats.gameName({team: "", opp: "Leones", date: "2026-01-02"}), "Equipo vs Leones · 02/01/2026");
});

test("fmtDate: iso to dd/mm/aaaa, empty gives empty", function(){
  assert.strictEqual(Stats.fmtDate("2026-11-05"), "05/11/2026");
  assert.strictEqual(Stats.fmtDate(""), "");
  assert.strictEqual(Stats.fmtDate(undefined), "");
});

test("fmtDateTime: 12-hour clock with a. m. / p. m.", function(){
  assert.strictEqual(Stats.fmtDateTime(new Date(2026, 10, 5, 14, 5)), "05/11/2026 · 2:05 p. m.");
  assert.strictEqual(Stats.fmtDateTime(new Date(2026, 10, 5, 0, 0)), "05/11/2026 · 12:00 a. m.");
  assert.strictEqual(Stats.fmtDateTime(new Date(2026, 0, 31, 12, 30)), "31/01/2026 · 12:30 p. m.");
  assert.strictEqual(Stats.fmtDateTime(new Date(2026, 0, 1, 9, 7)), "01/01/2026 · 9:07 a. m.");
  assert.strictEqual(Stats.fmtDateTime(new Date(2026, 5, 15, 23, 59)), "15/06/2026 · 11:59 p. m.");
});

test("result: Ganado / Perdido / Empate, 0-0 empty, string scores", function(){
  assert.strictEqual(Stats.result({us: [0, 0, 0], them: [0, 0, 0]}), "");
  assert.strictEqual(Stats.result({us: [3, 0, 2], them: [1, 0, 0]}), "Ganado 5–1");
  assert.strictEqual(Stats.result({us: [1], them: [2, 3]}), "Perdido 1–5");
  assert.strictEqual(Stats.result({us: [2, 1], them: [3, 0]}), "Empate 3–3");
  assert.strictEqual(Stats.result({us: ["3", "2"], them: ["1", "0"]}), "Ganado 5–1");
  assert.strictEqual(Stats.result({us: ["3", "2"], them: [0, 0]}), "Ganado 5–0");
});
