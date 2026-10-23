var test = require("node:test");
var assert = require("node:assert");
var Stats = require("../stats.js");

test("stats.js se carga en Node", function(){
  assert.strictEqual(typeof Stats, "object");
});
