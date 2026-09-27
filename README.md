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

Se entra con **correo y contraseña**. El acceso es solo por invitación: no hay registro público, las cuentas se crean en la consola de Firebase (Authentication → Usuarios → Agregar usuario). Cada cuenta ve solo sus jugadores y alineaciones.

La primera vez arranca en blanco: lo primero es cargar a tus jugadores en **Roster del equipo** (quedan guardados para cada partido).

En el teléfono la app se usa por pestañas, abajo: **Juego** (marcador y carreras), **Campo** (diamante) y **Orden** (orden al bate y banca). Arriba, **Compartir** agrupa imagen, térmica e impresión, y el menú **☰** el resto (guardar, abrir, respaldo, roster).
Los datos se guardan en tu cuenta (Firestore) y se sincronizan solos entre tus dispositivos. El teléfono guarda una copia local, así que sin señal la app abre y funciona igual; los cambios suben cuando vuelve la conexión. Al cerrar sesión, la copia local de ese usuario se borra del dispositivo. **Respaldo** sigue disponible como copia extra en texto.

### Instalar como app

Es una PWA: en Chrome/Edge (Android o escritorio) aparece el botón **Instalar** en la barra; en iPhone, *Compartir → Agregar a inicio*.
Una vez abierta con conexión, funciona **sin señal**: el service worker guarda la página y las tipografías, y cada vez que hay red descarga la versión nueva para la siguiente apertura.

## Estructura

La app es un solo archivo, `index.html`, sin build. Cargas externas: las tipografías de Google Fonts y el SDK de Firebase (desde `www.gstatic.com`), ambos guardados por el service worker para el uso sin señal.

Cuenta y datos (Firebase, proyecto `artful-zone-461419-t1`):

- Login con correo/contraseña; el registro público está desactivado.
- Cada usuario escribe en `users/{uid}/data/{current|team|saved}` (cada documento guarda el JSON en el campo `json`).
- `firestore.rules` — copia de las reglas publicadas: cada usuario solo lee y escribe lo suyo. Si lo cambias, pégalo en Firestore → Reglas y publica.
- La configuración web de Firebase en `index.html` es pública por diseño; lo que protege los datos son las reglas.

Para la parte instalable:

- `manifest.webmanifest` — nombre, colores e iconos de la app.
- `sw.js` — service worker (caché para uso sin conexión). Si agregas archivos a la app, súmalos a `ASSETS` y sube `VERSION`.
- `icons/` — iconos de la app (192, 512, maskable, Apple y favicon).

Para editarlo: abre `index.html`, todo está adentro — tokens de color al principio del `<style>`, coordenadas de las posiciones en el arreglo `POS` del `<script>`.

## Licencia

MIT.
