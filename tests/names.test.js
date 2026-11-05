var test = require("node:test");
var assert = require("node:assert");
var Stats = require("../stats.js");

test("shortName: today's outputs", function(){
  assert.strictEqual(Stats.shortName("Kevin Perez"), "K. Perez");
  assert.strictEqual(Stats.shortName("Kevin"), "Kevin");
  assert.strictEqual(Stats.shortName("Ana María Gil"), "A. María Gil");
  // no cabe en 13: 3 palabras usa la 2.ª, 4 o más la 3.ª
  assert.strictEqual(Stats.shortName("Kevin Perez Gonzalez"), "K. Perez");
  assert.strictEqual(Stats.shortName("Juan Carlos Rodriguez Fernandez"), "J. Rodriguez");
  assert.strictEqual(Stats.shortName(""), "");
  assert.strictEqual(Stats.shortName("   "), "");
  assert.strictEqual(Stats.shortName(null), "");
});

test("shortNames: no collision leaves short names unchanged", function(){
  assert.deepStrictEqual(Stats.shortNames(["Kevin Perez", "Ana Gil", "Luis"]), ["K. Perez", "A. Gil", "Luis"]);
  assert.deepStrictEqual(Stats.shortNames([]), []);
});

test("shortNames: collision becomes first word + surname initial", function(){
  assert.deepStrictEqual(Stats.shortNames(["Kevin Pérez", "Keven Pérez"]), ["Kevin P.", "Keven P."]);
  // la inicial sale de la palabra que usó shortName (aquí la 3.ª de 4), no de la última ni de la 2.ª
  assert.deepStrictEqual(Stats.shortNames(["Juan Carlos Rodriguez Fernandez", "Jose Rodriguez"]), ["Juan R.", "Jose R."]);
});

test("shortNames: two colliding pairs never end up with the same form", function(){
  assert.deepStrictEqual(
    Stats.shortNames(["Kevin Perez", "Keven Perez", "Kevin Pinto", "Kira Pinto"]),
    ["Kevin Perez", "Keven P.", "Kevin Pinto", "Kira P."]);
});

test("shortNames: still equal falls back to the full names", function(){
  assert.deepStrictEqual(
    Stats.shortNames(["Kevin Perez Gonzalez", "Kevin Perez Garcia"]),
    ["Kevin Perez Gonzalez", "Kevin Perez Garcia"]);
});

test("shortNames: only the colliding ones change", function(){
  assert.deepStrictEqual(
    Stats.shortNames(["Kevin Pérez", "Ana Gil", "Keven Pérez"]),
    ["Kevin P.", "A. Gil", "Keven P."]);
});

test("shortNames: empty names do not collide and input is not mutated", function(){
  var input = ["", "  ", "Ana Gil"];
  assert.deepStrictEqual(Stats.shortNames(input), ["", "", "A. Gil"]);
  assert.deepStrictEqual(input, ["", "  ", "Ana Gil"]);
});
