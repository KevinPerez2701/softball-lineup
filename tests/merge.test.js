var test = require("node:test");
var assert = require("node:assert");
var Stats = require("../stats.js");

function rec(id, savedAt, tag){
  return {id: id, savedAt: savedAt, game: {tag: tag || "x"}, rows: []};
}
function mk(id, deletedAt){ return {id: id, deletedAt: deletedAt}; }
function byId(list){
  var o = {};
  list.forEach(function(e){ o[e.id] = e; });
  return o;
}
function clone(x){ return JSON.parse(JSON.stringify(x)); }

test("merge: ids on one side only are kept from both sides", function(){
  var a = [rec("a", "2026-01-01T00:00:00Z")];
  var b = [rec("b", "2026-01-02T00:00:00Z"), mk("c", "2026-01-03T00:00:00Z")];
  var m = Stats.merge(a, b);
  assert.deepStrictEqual(m.map(function(e){ return e.id; }), ["a", "b", "c"]);
  assert.deepStrictEqual(m, a.concat(b));
});

test("merge: later savedAt wins in both directions", function(){
  var old = rec("a", "2026-01-01T00:00:00Z", "old");
  var neu = rec("a", "2026-02-01T00:00:00Z", "new");
  assert.deepStrictEqual(Stats.merge([old], [neu]), [neu]);
  assert.deepStrictEqual(Stats.merge([neu], [old]), [neu]);
});

test("merge: record saved after the marker wins over the marker", function(){
  var m = mk("a", "2026-01-01T00:00:00Z");
  var r = rec("a", "2026-02-01T00:00:00Z");
  assert.deepStrictEqual(Stats.merge([m], [r]), [r]);
  assert.deepStrictEqual(Stats.merge([r], [m]), [r]);
});

test("merge: marker later than the record wins", function(){
  var r = rec("a", "2026-01-01T00:00:00Z");
  var m = mk("a", "2026-02-01T00:00:00Z");
  assert.deepStrictEqual(Stats.merge([r], [m]), [m]);
  assert.deepStrictEqual(Stats.merge([m], [r]), [m]);
});

test("merge: equal timestamps, marker wins regardless of side", function(){
  var t = "2026-01-01T00:00:00Z";
  var r = rec("a", t);
  var m = mk("a", t);
  assert.deepStrictEqual(Stats.merge([r], [m]), [m]);
  assert.deepStrictEqual(Stats.merge([m], [r]), [m]);
});

test("merge: commutative as sets of winning entries", function(){
  var a = [rec("a", "2026-01-01T00:00:00Z"), mk("b", "2026-03-01T00:00:00Z"),
           rec("c", "2026-02-01T00:00:00Z"), rec("d", "2026-01-05T00:00:00Z")];
  var b = [mk("a", "2026-01-01T00:00:00Z"), rec("b", "2026-02-01T00:00:00Z"),
           rec("c", "2026-02-02T00:00:00Z", "other"), rec("e", "2026-01-01T00:00:00Z")];
  var ab = Stats.merge(a, b), ba = Stats.merge(b, a);
  assert.strictEqual(ab.length, ba.length);
  assert.deepStrictEqual(byId(ab), byId(ba));
});

test("merge: idempotent", function(){
  var a = [rec("a", "2026-01-01T00:00:00Z"), mk("b", "2026-01-02T00:00:00Z")];
  assert.deepStrictEqual(Stats.merge(a, a), a);
  assert.deepStrictEqual(Stats.merge(a, clone(a)), a);
});

test("merge: with empty or missing side returns the other", function(){
  var x = [rec("a", "2026-01-01T00:00:00Z"), mk("b", "2026-01-02T00:00:00Z")];
  assert.deepStrictEqual(Stats.merge(x, []), x);
  assert.deepStrictEqual(Stats.merge([], x), x);
  assert.deepStrictEqual(Stats.merge(x, null), x);
  assert.deepStrictEqual(Stats.merge(undefined, x), x);
  assert.deepStrictEqual(Stats.merge(null, undefined), []);
});

test("merge: does not mutate inputs and returns a new array", function(){
  var a = [rec("a", "2026-01-01T00:00:00Z"), mk("b", "2026-01-02T00:00:00Z")];
  var b = [mk("a", "2026-02-01T00:00:00Z"), rec("c", "2026-01-01T00:00:00Z")];
  var a0 = clone(a), b0 = clone(b);
  var m = Stats.merge(a, b);
  assert.notStrictEqual(m, a);
  assert.deepStrictEqual(a, a0);
  assert.deepStrictEqual(b, b0);
});

test("live: drops markers and keeps order", function(){
  var r1 = rec("a", "2026-01-01T00:00:00Z"), r2 = rec("c", "2026-01-02T00:00:00Z");
  assert.deepStrictEqual(Stats.live([r1, mk("b", "2026-01-03T00:00:00Z"), r2]), [r1, r2]);
  assert.deepStrictEqual(Stats.live([]), []);
});
