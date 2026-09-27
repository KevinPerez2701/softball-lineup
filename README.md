# Diamante 10

Armador de alineaciones de **softball** (10 posiciones, incluido el *short fielder*).
Hecho para llevarlo al dugout: se arma en el navegador, se guarda en el navegador y se imprime en una hoja.

## Qué hace

- **Diamante interactivo** con las 10 posiciones: `P · C · 1B · 2B · 3B · SS · LF · CF · RF · SF`.
  Toca una posición para asignar jugador, o arrastra desde el roster. Arrastrar entre dos posiciones las intercambia.
- **Roster** con nombre y número. Se queda guardado en el navegador; no hay que reescribirlo cada juego.
- **Orden al bate** reordenable (arrastrar o flechas). Quien batea sin posición defensiva sale marcado como **EH**.
- **Banca** calculada sola: todo el que no esté en el campo.
- **Carreras por inning** (7 innings de softball, con extras hasta 12) y marcador final automático.
- **Imprimir / PDF**: una hoja carta lista para el anotador, con notas y firmas.
- **Guardar alineaciones** con nombre para reabrirlas después, y **respaldo** en texto para pasar el roster a otro dispositivo.

## Uso

No hay que instalar nada. Abre la página y listo: arranca en blanco, y lo primero es cargar a tus jugadores en **Roster del equipo** (quedan guardados para cada partido).

En el teléfono la app se usa por pestañas, abajo: **Juego** (marcador y carreras), **Campo** (diamante) y **Orden** (orden al bate y banca). Arriba, **Compartir** agrupa imagen, térmica e impresión, y el menú **☰** el resto (guardar, abrir, respaldo, roster).
Todo se guarda en el `localStorage` del navegador: los datos no salen de tu equipo, pero tampoco se sincronizan entre dispositivos — para eso está el botón **Respaldo** (copiar el texto y pegarlo en el otro navegador).

### Instalar como app

Es una PWA: en Chrome/Edge (Android o escritorio) aparece el botón **Instalar** en la barra; en iPhone, *Compartir → Agregar a inicio*.
Una vez abierta con conexión, funciona **sin señal**: el service worker guarda la página y las tipografías, y cada vez que hay red descarga la versión nueva para la siguiente apertura.

## Estructura

La app es un solo archivo, `index.html`, sin dependencias ni build. La única carga externa son las tipografías de Google Fonts; si no cargan, la página funciona igual con las fuentes del sistema.

Para la parte instalable:

- `manifest.webmanifest` — nombre, colores e iconos de la app.
- `sw.js` — service worker (caché para uso sin conexión). Si agregas archivos a la app, súmalos a `ASSETS` y sube `VERSION`.
- `icons/` — iconos de la app (192, 512, maskable, Apple y favicon).

Para editarlo: abre `index.html`, todo está adentro — tokens de color al principio del `<style>`, coordenadas de las posiciones en el arreglo `POS` del `<script>`.

## Licencia

MIT.
