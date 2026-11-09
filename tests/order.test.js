var test = require("node:test");
var assert = require("node:assert");
var Stats = require("../stats.js");

test("RF-1/2/3 orderAfterAssign: agrega al final los que faltan, en orden", function(){
  assert.deepStrictEqual(Stats.orderAfterAssign(["a"], ["b", "c"]), ["a", "b", "c"]);
});

test("RF-1/2/3 orderAfterAssign: quien ya está conserva su lugar", function(){
  assert.deepStrictEqual(Stats.orderAfterAssign(["a", "b", "c"], ["c", "a"]), ["a", "b", "c"]);
});

test("RF-1/2/3 orderAfterAssign: un id repetido o ya presente no se duplica; los falsy se ignoran", function(){
  assert.deepStrictEqual(Stats.orderAfterAssign(["a"], ["b", "a", "b", null, "", undefined, "c"]), ["a", "b", "c"]);
});

test("RF-1/2/3 orderAfterAssign: sin ids devuelve una copia igual, no el mismo array, sin mutar la entrada", function(){
  var order = ["a", "b"], ids = [];
  var out = Stats.orderAfterAssign(order, ids);
  assert.deepStrictEqual(out, ["a", "b"]);
  assert.notStrictEqual(out, order);
  out.push("z");
  assert.deepStrictEqual(order, ["a", "b"]);
  Stats.orderAfterAssign(order, ["c"]);
  assert.deepStrictEqual(order, ["a", "b"]);
  assert.deepStrictEqual(ids, []);
});

test("RF-1/2/3 orderAfterAssign: BD reemplazado se queda en el orden", function(){
  assert.deepStrictEqual(Stats.orderAfterAssign(["a", "b"], ["c"]), ["a", "b", "c"]);
});

test("RF-1/2/3 orderAfterAssign: intercambio de dos ya en el orden no cambia nada", function(){
  assert.deepStrictEqual(Stats.orderAfterAssign(["a", "b", "c"], ["b", "a"]), ["a", "b", "c"]);
});

test("orderReason: roster empty first, then order empty, else nothing", function(){
  assert.strictEqual(Stats.orderReason(0, 0), "Nadie marcado para este partido");
  assert.strictEqual(Stats.orderReason(0, 3), "Nadie marcado para este partido");
  assert.strictEqual(Stats.orderReason(5, 0), "El orden está vacío");
  assert.strictEqual(Stats.orderReason(5, 2), "");
});
