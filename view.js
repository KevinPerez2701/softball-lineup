/* Diamante 10 — vista de un juego (spec 010): marcador, totales y hoja por inning, solo lectura.
   La usan index.html (Estadísticas → Juegos → Ver) y ver.html (enlace público): una sola
   implementación para las dos. Solo DOM: los números salen de stats.js; sin Firebase ni estado de la app. */
var View = {};

// copia de el() de index.html
View.el = function(tag, cls, txt){
  var e = document.createElement(tag);
  if(cls) e.className = cls;
  if(txt != null) e.textContent = txt;
  return e;
};

// RF-3: visitante arriba, una columna por inning y "C"; la columna de nombres queda fija (RF-6)
View.lineScore = function(game){
  var el = View.el, ls = Stats.lineScore(game);
  var wrap = el("div", "sheet-scroll"), tb = el("table", "stat view ls"), hr = el("tr"), i;
  tb.setAttribute("aria-label", "Marcador");
  hr.appendChild(el("th"));
  for(i = 1; i <= ls.innings; i++) hr.appendChild(el("th", null, String(i)));
  hr.appendChild(el("th", null, "C"));
  var th0 = el("thead"); th0.appendChild(hr); tb.appendChild(th0);
  var tbody = el("tbody");
  ls.rows.forEach(function(r){
    var tr = el("tr"), th = el("th");
    th.scope = "row";
    th.appendChild(el("span", "nm", r.name));
    tr.appendChild(th);
    r.runs.forEach(function(n){ tr.appendChild(el("td", null, String(n))); });
    tr.appendChild(el("td", null, String(r.total)));
    tbody.appendChild(tr);
  });
  tb.appendChild(tbody);
  wrap.appendChild(tb);
  return wrap;
};

// RF-4: columnas de Jugadores sin JJ, fila "Equipo" y la clave; sin ordenar.
// En el teléfono (CSS) solo se ven las columnas de la imagen (Stats.IMG_COLS); "Más columnas" muestra el resto.
View.boxScore = function(rec){
  var el = View.el, box = Stats.boxScore(rec), out = el("div", "box");
  function extra(c){ return Stats.IMG_COLS.indexOf(c[0]) < 0; }
  // como statCell() de index.html: enteros tal cual, tasas con Stats.fmt
  function viewCell(tag, o, c){ return el(tag, extra(c) ? "xc" : null, c[2] ? String(o[c[0]]) : Stats.fmt(o[c[0]])); }
  var more = el("button", "btn btn-sm box-more", "Más columnas");
  more.type = "button";
  more.setAttribute("aria-pressed", "false");
  more.addEventListener("click", function(){
    var on = out.classList.toggle("more");
    more.textContent = on ? "Menos columnas" : "Más columnas";
    more.setAttribute("aria-pressed", String(on));
  });
  out.appendChild(more);
  var wrap = el("div", "sheet-scroll"), tb = el("table", "stat view"), hr = el("tr");
  [["name", "Jugador"]].concat(Stats.BOX_COLS).forEach(function(c){
    var th = el("th", c[0] !== "name" && extra(c) ? "xc" : null, c[1]);
    th.scope = "col";
    if(Stats.COL_TITLES[c[1]]) th.title = Stats.COL_TITLES[c[1]];
    hr.appendChild(th);
  });
  var th0 = el("thead"); th0.appendChild(hr); tb.appendChild(th0);
  var tbody = el("tbody");
  box.rows.forEach(function(p){
    var tr = el("tr"), th = el("th");
    th.scope = "row";
    th.appendChild(el("span", "nm", (p.num ? p.num + " · " : "") + p.name));
    tr.appendChild(th);
    Stats.BOX_COLS.forEach(function(c){ tr.appendChild(viewCell("td", p, c)); });
    tbody.appendChild(tr);
  });
  tb.appendChild(tbody);
  var tf = el("tfoot"), tr = el("tr"), th = el("th", null, "Equipo");
  th.scope = "row";
  tr.appendChild(th);
  Stats.BOX_COLS.forEach(function(c){ tr.appendChild(viewCell("td", box.team, c)); });
  tf.appendChild(tr); tb.appendChild(tf);
  wrap.appendChild(tb); out.appendChild(wrap);
  var key = el("details", "hint");
  key.appendChild(el("summary", null, "Qué significa cada columna"));
  Stats.BOX_COLS.forEach(function(c){ key.appendChild(el("p", null, c[1] + ": " + Stats.COL_TITLES[c[1]])); });
  out.appendChild(key);
  return out;
};

// RF-5: la hoja de captura sin controles: mismas celdas, outs por inning sin ⚠, sin marcas de cuadre
View.innGrid = function(rec){
  var el = View.el, g = rec.game, out = el("div");
  var wrap = el("div", "sheet-scroll"), t = el("table", "sheet"), hr = el("tr"), i;
  hr.appendChild(el("th", null, "Bateador"));
  for(i = 1; i <= g.innings; i++){
    var h = el("th", null, String(i)), n = Stats.inningOuts(rec, i);
    h.appendChild(el("small", "outs", n > 0 ? n + " out" : ""));
    hr.appendChild(h);
  }
  var thead = el("thead"); thead.appendChild(hr); t.appendChild(thead);
  var tbody = el("tbody");
  rec.rows.forEach(function(row){
    var tr = el("tr"), th = el("th"), rt = el("div", "rh-txt");
    th.scope = "row";
    rt.appendChild(el("span", "nm", (row.num ? row.num + " · " : "") + row.name));
    rt.appendChild(el("small", null, row.pos ? (row.pos === "DH" ? "BD" : row.pos) : "—")); // posLabel() de index.html
    th.appendChild(rt); tr.appendChild(th);
    for(var inn = 1; inn <= g.innings; inn++){
      var td = el("td"), c = el("div", "sheet-cell");
      Stats.cellLines(row, inn).forEach(function(l){
        var d = el("div");
        if(typeof l.ord === "number"){ d.appendChild(el("small", "ord", "#" + l.ord)); d.appendChild(document.createTextNode(" ")); }
        d.appendChild(document.createTextNode(l.text));
        c.appendChild(d);
      });
      td.appendChild(c); tr.appendChild(td);
    }
    tbody.appendChild(tr);
  });
  t.appendChild(tbody);
  wrap.appendChild(t); out.appendChild(wrap);
  out.appendChild(el("p", "hint", "• anotó carrera · número pequeño: orden del turno"));
  return out;
};

// "Totales" | "Por inning"; tab "box" o "inn". Marca el elegido (aria-pressed; el aspecto sale de .btn-default: borde en oscuro, relleno + borde en claro) y avisa con onChange(tab).
View.switcher = function(tab, onChange){
  var el = View.el, g = el("div", "chips"), btns = [];
  g.setAttribute("role", "group");
  g.setAttribute("aria-label", "Vista del juego");
  function mark(){
    btns.forEach(function(b){
      var on = b.dataset.tab === tab;
      b.setAttribute("aria-pressed", String(on));
      b.classList.toggle("btn-default", on);
    });
  }
  [["box", "Totales"], ["inn", "Por inning"]].forEach(function(o){
    var b = el("button", "btn btn-sm", o[1]);
    b.type = "button";
    b.dataset.tab = o[0];
    b.addEventListener("click", function(){
      if(tab === o[0]) return;
      tab = o[0]; mark(); onChange(tab);
    });
    btns.push(b); g.appendChild(b);
  });
  mark();
  return g;
};

if(typeof module !== "undefined") module.exports = View;
