# Demo manual — Spec 001 (estadísticas)

Cómo correrla: desde la raíz del repo `python3 -m http.server 8000 < /dev/null` y abrir http://localhost:8000
en Chrome. "A" = Chrome con DevTools en modo dispositivo a 360 px; "B" = otro perfil de Chrome (o Edge) con la
misma cuenta. Al terminar, cerrar el servidor (Ctrl+C). El gesto "atrás" de Android y el aspecto real en el
teléfono se ven después del push, en la URL de Pages.

Marca cada paso con ✔ o anota lo que viste.

## Preparación
1. En A inicia sesión. Ten ≥ 11 jugadores en el Roster; pon fecha y rival en la pestaña Juego.
2. (RF-12) "Alineación nueva" y, con el orden vacío, "Anotar estadísticas" → "Primero arma el orden al bate", no
   abre nada. Luego arma un orden de 9 con BD activado, uno sin posición (solo batea), 7 innings.
3. (RF-33) Abre "Anotar estadísticas" y toca Guardar sin turnos → "Anota al menos un turno", la hoja sigue abierta.

## Captura
4. (RF-1) Una fila por bateador en el orden, con número · nombre y posición: "BD" el designado, "—" el que solo
   batea. 7 columnas; fecha y marcador vienen del juego.
5. (RF-2) Celda vacía: 12 resultados (Rolling, Fly, Línea…), "Anotó carrera" apagado, CI 0, BR 0; "Listo"
   desactivado hasta elegir. Rolling → "Rol". 1B con carrera → "1B•".
6. (RF-28) Celda con 1 turno: Editar, Borrar y "Otro turno en este inning". Agrega el 2º; al reabrir ya no sale
   "Otro turno".
7. (RF-3/27) Edita uno de los dos (pásalo a 2B): cambia solo ese. Borra el otro: queda uno.
8. (NFR) A 360 px desliza la tabla: solo se mueve la tabla, la columna Bateador queda fija, la página no se mueve
   de lado.

## Juego de 7 innings con sustituto y descuadre
9. (RF-4/36) Fila 5 → ⋯ → "Agregar sustituto": solo jugadores sin fila. Elige uno: aparece justo debajo con "—".
   Al abrir de nuevo, ya no se ofrece.
10. (RF-29) En una fila con turnos, ⋯ no ofrece "Quitar fila". Agrega otro sustituto de prueba y quítalo.
11. (RF-5/6) Copia los 7 innings. En el 3 marca a propósito una carrera de más → encabezado "3" en rojo con "+1".
12. (RF-6/30) Corrígelo en la fila Nosotros del inning 3 → el rojo desaparece. Crea un "−1" en otro inning y
    corrígelo desde la celda.
13. (RF-30/31/38) "+ Inning" agrega la columna 8 con 0. Anota un turno en el 8: "− Inning" no baja de 8. Borra
    ese turno: baja hasta 3 y no menos. En 12 sale "Máximo 12 innings".
14. (RF-34) Borra la fecha y Guardar → "Ponle fecha al juego", hoja abierta, datos intactos. Vuelve a ponerla.
15. Escribe letras en una casilla del marcador: solo quedan números.
16. (RF-7/32/4) Guardar → "Estadísticas guardadas", la hoja se cierra. En Juego: fecha, innings y carreras
    coinciden con la hoja. En Orden el sustituto no aparece.
17. (RF-8) Cambia una carrera en Juego y agrega un jugador al orden. "Anotar estadísticas": misma hoja con sus
    turnos, marcador actualizado, jugador nuevo al final, posiciones y sustituto iguales. Edita un turno y guarda.
18. (RF-11) Cambia una celda y Cerrar → "¿Salir sin guardar? Se pierden los cambios.". Repite con Esc (tres
    veces seguidas también), y tocando el fondo oscuro. Sin cambios, Cerrar cierra directo.
19. (RF-15/39, consola) Con un cambio en la hoja, corre
    `var o=Storage.prototype.setItem; Storage.prototype.setItem=function(k,v){ if(k.indexOf(".stats.v1")>0) throw 0; return o.call(this,k,v); }`
    y Guardar → "No se pudo guardar en este navegador", hoja igual. Repite con `.current.v7`: mismo aviso y el
    juego no cambia en Juegos. Luego `Storage.prototype.setItem=o` y guarda normal.

## Alineaciones guardadas
20. (RF-10) Guarda la alineación. "Alineación nueva", arma orden, "Anotar estadísticas" → hoja nueva. Guarda: en
    Juegos hay 2 y el primero no cambió.
21. (RF-9) Abre en Guardados la alineación del paso 20 → "Anotar estadísticas" abre el juego 1 con sus turnos.
22. (RF-9) Una alineación guardada antes de anotar → hoja nueva.
23. (RF-35) Borra en Juegos el juego enlazado al partido actual y "Anotar estadísticas" → hoja nueva. Guárdala:
    aparece uno nuevo, y "Anotar" vuelve a abrir ese mismo.

## Vistas
24. (RF-17) ☰ → "Estadísticas" (en escritorio, el botón de la barra): vistas "Jugadores" y "Juegos".
25. (RF-18/19) Una fila por jugador con turnos (el que no bateó no sale); columnas JJ…OPS; Equipo con JJ = número
    de juegos. Cuenta a mano dos jugadores: VB = AP − BB − SF, promedios tipo ".333". Solo BB → "—" en AVE, SLG,
    OPS. A 360 px solo la tabla se desliza de lado.
26. (RF-20) Por defecto AVE ▼. HR: mayor a menor; otra vez: al revés. "—" siempre al final. Jugador A-Z y Z-A;
    empates por nombre.
27. (RF-21) Renombra a un jugador en el Roster → nombre nuevo en la tabla. Borra del Roster a uno con turnos →
    sale con el nombre de su juego más reciente.
28. (RF-22) Toca un jugador: fecha, rival, VB, H, CA, CI, BB, K y secuencia ("1B• · K · Rol"), del más nuevo al
    más viejo. Total = su fila. "← Jugadores" regresa.
29. (RF-23) Juegos: el más nuevo primero, fecha, rival, marcador, G/P/E; arriba récord G-P-E y carreras a favor y
    en contra, cuadran a mano.
30. (RF-24/32) Abre un juego viejo: trae su marcador guardado; edita y guarda: la pestaña Juego no cambia. Abre el
    del partido actual: trae el marcador actual y al guardar se actualiza Juego.
31. (RF-25) ✕ en un juego → "¿Borrar las estadísticas de este juego? No se puede deshacer.". Borrar: desaparece de
    Juegos y Jugadores. Recarga: sigue borrado. En B tampoco aparece.
32. (RF-26) Borra todos → las dos vistas dicen "Todavía no hay juegos anotados".

## Sin señal y dos dispositivos
33. (RF-13) A sin red (DevTools → Offline), anota y guarda. Recarga: abre sin red y el juego está. Vuelve la red:
    el juego aparece en B.
34. (RF-14) Con un juego ya sincronizado antes, deja A y B sin red. A anota "Rival A", B anota "Rival B". Vuelve la
    red primero en A, luego en B: los dos ven los dos juegos. Repite volviendo primero B.
35. (RF-37) Con la hoja abierta en A, guarda o borra otro juego desde B: la hoja de A no cambia. Guarda en A:
    Juegos muestra los dos cambios.
36. (RF-13) Sin red y con un juego sin subir, Cerrar sesión: no deja. Con red sí, y en localStorage ya no queda
    la clave `…stats.v1`.
37. (RF-16) Respaldo: el texto trae `"stats"`. Importa uno sin `"stats"`: los juegos siguen igual. Importa en B un
    respaldo de A con un juego que B no tiene: aparece. Uno borrado después del respaldo no revive.

## Resultado
- Fecha: ____  Pasos ✔: __/37  Fallas (paso → qué se vio):
