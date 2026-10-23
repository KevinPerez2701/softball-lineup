# Demo manual — Spec 002 (anotar por inning con outs)

Con sesión iniciada. Escritorio: `python3 -m http.server 8001` desde la carpeta del repo y http://localhost:8001
(Ctrl+C al terminar), o la URL de Pages después del push. Teléfono: la URL de Pages. Recarga una vez para que tome
el service worker v5. Marca cada paso con ✔ o anota lo que viste.

## Juego viejo (spec 001)
1. Arriba de la hoja debe verse el botón "Anotar por inning".
2. ☰ → Estadísticas → Juegos → Abrir el juego que ya tenías. Las celdas se ven como antes, sin número de turno;
   bajo cada inning sale "n out". Puede salir algún "⚠" donde hubo doble play no anotado: es lo esperado.
   Cerrar → **no** pregunta "¿Salir sin guardar?".
3. Toca una celda con turno → Editar → Listo sin cambiar nada → Cerrar: tampoco pregunta.

## Juego nuevo de 7 innings, todo con "Anotar por inning"
4. Arma el orden, "Anotar estadísticas" → "Anotar por inning". Encabezado "Inning 1 · 0 out · Al bate: <1.º>",
   botones Listo, Out corriendo, Otro bateador, Terminar; selector "Outs en la jugada" 0–3.
5. K → pasa al 2.º. Elige 1B: outs en 0; cambia a Rolling: outs en 1.
6. Doble play: Rolling con outs 2 → el inning cierra con 3 y pasa al inning 2 con el siguiente del orden.
7. Atrapado robando que cierra el inning: con 2 outs, Out corriendo → corredor → "Atrapado robando" → inning 3
   con **el mismo bateador que estaba al bate**.
8. Sustituto: Otro bateador → Agregar sustituto → elige jugador: aparece bajo el que tocaba y batea ahora. En la
   siguiente vuelta le toca **al sustituto**, no al titular.
9. Otro bateador → elige una fila: el orden sigue desde ella.
10. Al tercer out del 7.º: "¿Hubo otro inning?". Sí → columna 8 y sigue. Al cerrar el 8.º, No → vuelve a la hoja.
11. Terminar a mitad de un inning (o Esc / tocar fuera) → queda la hoja. "Anotar por inning" otra vez → sigue con
    el bateador que va después del último anotado.

## Hoja
12. Innings cerrados dicen "3 out". Borra un turno de un inning anterior → "⚠ 2 out" en rojo; la diferencia de
    carreras sigue aparte y Guardar no se bloquea.
13. Cada celda: número chico, resultado, "•" de carrera; outs corriendo (AR/Sor/OC) después de los turnos.
14. En un inning con turnos 1..5 borra el 2: los 3, 4, 5 pasan a 2, 3, 4.
15. Celda con 2 turnos → ofrece "Out corriendo" (no "Otro turno"). Agrega "Sorprendido en base": dice "Sor".
    Bórralo con su "Borrar".
16. Celda con solo un out corriendo → el out con "Borrar", "Anotar turno" y "Out corriendo". Fuera del modo, una
    celda vacía también ofrece "Out corriendo".
17. "− Inning" no quita un inning que solo tiene un out corriendo; ⋯ de una fila con solo un out corriendo no
    ofrece "Quitar fila".
18. Hoja nueva con solo un out corriendo → Guardar → "Anota al menos un turno".

## Estadísticas
19. Guarda el juego. ☰ → Estadísticas → Jugadores: columna "AR" después de "BR", total en Equipo, ordena como
    número. Un emergente con solo un out corriendo sale con AP 0 y VB 0.
20. Detalle del atrapado robando: la secuencia muestra "AR" después de los turnos de ese inning; VB/H no cambian.

## Cierre
21. Con el modo activo, atrás (Android) o Esc: termina el modo; al cerrar la hoja con cambios pregunta
    "¿Salir sin guardar?".
22. Repite 4–8 en el teléfono. No dejes ningún servidor local corriendo.

## Resultado
- Fecha: 2026-10-23 (escritorio, Chrome, en prod, por Claude con la sesión de Kevin)  Pasos ✔: 21/22 (falta 22, teléfono)
  Fallas (paso → qué se vio):
  - Antes del paso 1, primera carga tras el deploy → la hoja no abría ("Stats.cellLines is not a function"): index.html
    nuevo con stats.js viejo de la caché. Al recargar funcionó. Corregido en sw.js (stats.js de la red primero).
  - Juego nuevo: se usó una hoja vacía de prueba ("PRUEBA DEMO") abierta desde Juegos para no tocar el juego actual;
    se guardó para los pasos 19–20 y luego se borró.
