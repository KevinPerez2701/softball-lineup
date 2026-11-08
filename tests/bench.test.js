var test = require("node:test");
var assert = require("node:assert");
var Stats = require("../stats.js");

var A = {id: "a", num: "1", name: "Ana"}, B = {id: "b", num: "2", name: "Bea"}, C = {id: "c", num: "3", name: "Cris"};

test("RF-6 absent: conserva el orden del equipo sin importar el orden del roster", function(){
  assert.deepStrictEqual(Stats.absent([A, B, C], [{id: "b"}]), [A, C]);
  assert.deepStrictEqual(Stats.absent([A, B, C], [{id: "c"}, {id: "a"}]), [B]);
  assert.deepStrictEqual(Stats.absent([C, A, B], [{id: "a"}]), [C, B]); // equipo sin ordenar: no ordena por nombre ni número
});

test("RF-6 absent: equipo vacío da []", function(){
  assert.deepStrictEqual(Stats.absent([], [{id: "a"}]), []);
});

test("RF-6 absent: todos presentes da []", function(){
  assert.deepStrictEqual(Stats.absent([A, B], [{id: "b"}, {id: "a"}]), []);
});

test("RF-6/9 absent: roster vacío devuelve todo el equipo", function(){
  assert.deepStrictEqual(Stats.absent([A, B, C], []), [A, B, C]);
});

test("RF-6 absent: un roster con nombre viejo pero id igual queda excluido", function(){
  assert.deepStrictEqual(Stats.absent([A, B], [{id: "a", num: "9", name: "Vieja"}]), [B]);
});

test("RF-6 absent: devuelve los objetos del equipo, con su nombre y número", function(){
  var out = Stats.absent([A, B], [{id: "a", num: "9", name: "Vieja"}]);
  assert.strictEqual(out[0], B);
  assert.strictEqual(out[0].name, "Bea");
  assert.strictEqual(out[0].num, "2");
});

test("RF-6 absent: null o undefined se tratan como []", function(){
  assert.deepStrictEqual(Stats.absent(null, [{id: "a"}]), []);
  assert.deepStrictEqual(Stats.absent(undefined, undefined), []);
  assert.deepStrictEqual(Stats.absent([A], null), [A]);
  assert.deepStrictEqual(Stats.absent([A], undefined), [A]);
});

test("RF-6/9 absentTitle: 'No vinieron (n)' con jugadores", function(){
  assert.strictEqual(Stats.absentTitle([A, B], [{id: "c"}]), "No vinieron (2)");
  assert.strictEqual(Stats.absentTitle([A], [{id: "c"}]), "No vinieron (1)");
});

test("RF-6/9 absentTitle: 'Equipo (n)' sin jugadores en el partido", function(){
  assert.strictEqual(Stats.absentTitle([A, B, C], []), "Equipo (3)");
  assert.strictEqual(Stats.absentTitle([A], null), "Equipo (1)");
});

// ---------- spec 010 RF-36: agregar varios de golpe ----------
test("RF-36 batchAdd: agrega al final del roster en orden del equipo, no en el de los ids", function(){
  var r = Stats.batchAdd([{id: "b", num: "2", name: "Bea"}], [A, B, C], ["c", "a"]);
  assert.deepStrictEqual(r.roster.map(function(p){ return p.id; }), ["b", "a", "c"]);
  assert.deepStrictEqual(r.added, ["Ana", "Cris"]);
  assert.deepStrictEqual(r.roster[1], {id: "a", num: "1", name: "Ana"});
});

test("RF-36 batchAdd: omite presentes e ids que no están en el equipo; no muta el roster", function(){
  var roster = [{id: "a", num: "1", name: "Ana"}];
  var r = Stats.batchAdd(roster, [A, B], ["a", "zz", "b"]);
  assert.deepStrictEqual(r.added, ["Bea"]);
  assert.strictEqual(r.roster.length, 2);
  assert.strictEqual(roster.length, 1);
  assert.deepStrictEqual(Stats.batchAdd(roster, [A, B], []).added, []);
  assert.deepStrictEqual(Stats.batchAdd(null, null, null), {roster: [], added: []});
});

test("RF-36 batchAdd: número vacío queda como cadena vacía", function(){
  var r = Stats.batchAdd([], [{id: "n", name: "Nora"}], ["n"]);
  assert.deepStrictEqual(r.roster, [{id: "n", num: "", name: "Nora"}]);
});

test("RF-36 addedMsg: singular con nombre, plural con cuenta", function(){
  assert.strictEqual(Stats.addedMsg(["Ana"]), "Ana agregado al partido");
  assert.strictEqual(Stats.addedMsg(["Ana", "Bea"]), "2 agregados al partido");
  assert.strictEqual(Stats.addedMsg(["a", "b", "c"]), "3 agregados al partido");
});
