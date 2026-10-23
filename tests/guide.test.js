var test = require("node:test");
var assert = require("node:assert");
var Stats = require("../stats.js");

function pa(inn, ord){
  var p = {inn: inn, code: "1B", run: false, rbi: 0, sb: 0};
  if(ord !== undefined) p.ord = ord;
  return p;
}
function row(name, pas, sub){
  var r = {pid: name, num: name, name: name, pos: "", pas: pas || []};
  if(sub) r.sub = true;
  return r;
}
function rec(rows){
  return {id: "r1", game: {innings: 3}, rows: rows};
}

test("slots: sub rows join the row above", function(){
  var rows = [row("A"), row("B", [], true), row("C"), row("D", [], true), row("E", [], true), row("F")];
  assert.deepStrictEqual(Stats.slots(rows), [[0, 1], [2, 3, 4], [5]]);
});

test("slots: rows without sub flag (spec 001 data) are one slot each", function(){
  assert.deepStrictEqual(Stats.slots([row("A"), row("B"), row("C")]), [[0], [1], [2]]);
});

test("slots: a leading sub row starts its own slot", function(){
  assert.deepStrictEqual(Stats.slots([row("A", [], true), row("B", [], true), row("C")]), [[0, 1], [2]]);
});

test("activeRow: the lowest row of the slot with a PA, else the first", function(){
  var rows = [row("A", [pa(1)]), row("B", [pa(1)], true), row("C", [], true), row("D")];
  assert.strictEqual(Stats.activeRow(rows, [0, 1, 2]), 1);
  assert.strictEqual(Stats.activeRow([row("A"), row("B", [], true)], [0, 1]), 0);
});

test("dueBatter: empty sheet, no anchor => first slot", function(){
  assert.strictEqual(Stats.dueBatter(rec([row("A"), row("B"), row("C")]), 1, null), 0);
});

test("dueBatter: anchor in the middle => next slot", function(){
  var a = pa(1, 1), r = rec([row("A", [pa(1, 0)]), row("B", [a]), row("C")]);
  assert.strictEqual(Stats.dueBatter(r, 1, a), 2);
});

test("dueBatter: anchor on the last slot wraps to the first", function(){
  var a = pa(1, 3), r = rec([row("A"), row("B"), row("C", [a])]);
  assert.strictEqual(Stats.dueBatter(r, 1, a), 0);
});

test("dueBatter: anchor on a sub row uses its slot", function(){
  var a = pa(1, 1), r = rec([row("A"), row("B", [], true), row("C", [a], true), row("D")]);
  assert.strictEqual(Stats.dueBatter(r, 1, a), 3);
});

test("dueBatter: deleted anchor falls back to the highest ord of the latest inning with ord", function(){
  var r = rec([row("A", [pa(1, 1), pa(2, 2)]), row("B", [pa(2, 1)]), row("C", [pa(1, 2)]), row("D")]);
  // inning 2 is the latest with ord; highest ord (2) is on row A => next is B
  assert.strictEqual(Stats.dueBatter(r, 2, pa(2, 9)), 1);
});

test("dueBatter: no anchor, old record without ord => first slot", function(){
  var r = rec([row("A", [pa(1)]), row("B", [pa(1)]), row("C")]);
  assert.strictEqual(Stats.dueBatter(r, 1, null), 0);
});

test("dueBatter: slot whose sub has a PA => the sub's index", function(){
  var b = pa(1, 2), r = rec([row("A"), row("B", [b]), row("C"), row("S", [pa(2)], true), row("D")]);
  assert.strictEqual(Stats.dueBatter(r, 1, b), 3);
});

test("dueBatter: candidate with 2 PAs in this inning is skipped", function(){
  var a = pa(1, 1), r = rec([row("A", [a]), row("B", [pa(1, 2), pa(1, 3)]), row("C")]);
  assert.strictEqual(Stats.dueBatter(r, 1, a), 2);
  // PAs of other innings do not count
  var r2 = rec([row("A", [a]), row("B", [pa(2), pa(3)]), row("C")]);
  assert.strictEqual(Stats.dueBatter(r2, 1, a), 1);
});

test("dueBatter: every slot full in this inning => null", function(){
  var a = pa(1, 1), r = rec([row("A", [a, pa(1, 4)]), row("B", [pa(1, 2), pa(1, 3)])]);
  assert.strictEqual(Stats.dueBatter(r, 1, a), null);
});

test("nextOrd: counts PAs with numeric ord in the inning, ignoring ord-less ones", function(){
  var r = rec([row("A", [pa(1, 1), pa(1), pa(2, 1)]), row("B", [pa(1, 2)])]);
  assert.strictEqual(Stats.nextOrd(r, 1), 3);
  assert.strictEqual(Stats.nextOrd(r, 2), 2);
  assert.strictEqual(Stats.nextOrd(r, 3), 1);
});

test("renumberOrd: closes the gap, keeping order; other innings and ord-less PAs untouched", function(){
  // the PA with ord 2 was removed already: remaining 1, 3, 4
  var other = pa(2, 3), none = pa(1);
  var r = rec([row("A", [pa(1, 1), pa(1, 3), other]), row("B", [pa(1, 4), none])]);
  Stats.renumberOrd(r, 1, 2);
  assert.deepStrictEqual([r.rows[0].pas[0].ord, r.rows[0].pas[1].ord, r.rows[1].pas[0].ord], [1, 2, 3]);
  assert.strictEqual(other.ord, 3);
  assert.strictEqual("ord" in none, false);
});
