/* Diamante 10 — service worker.
   En el dugout la señal va y viene: la app se sirve siempre desde la caché
   (abre al instante y sin conexión) y, en paralelo, se pide la versión nueva
   para la próxima vez. Sube VERSION cuando cambie la lista de archivos. */
var VERSION = "v1";
var SHELL = "diamante10-shell-" + VERSION;
var FONTS = "diamante10-fonts";
var ASSETS = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
  "icons/apple-touch-icon.png",
  "icons/favicon-32.png"
];

self.addEventListener("install", function(ev){
  ev.waitUntil(
    caches.open(SHELL)
      .then(function(c){ return c.addAll(ASSETS); })
      .then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function(ev){
  ev.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        if(k !== SHELL && k !== FONTS) return caches.delete(k);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

/* Responde con lo guardado y actualiza la caché por detrás. */
function staleWhileRevalidate(req, cacheName, key){
  return caches.open(cacheName).then(function(cache){
    return cache.match(key || req, {ignoreSearch: true}).then(function(hit){
      var fresh = fetch(req).then(function(res){
        if(res && (res.ok || res.type === "opaque")) cache.put(key || req, res.clone());
        return res;
      }).catch(function(){ return hit; });
      return hit || fresh;
    });
  });
}

self.addEventListener("fetch", function(ev){
  var req = ev.request;
  if(req.method !== "GET") return;
  var url = new URL(req.url);

  if(url.origin === self.location.origin){
    /* Toda navegación dentro del alcance es la misma página. */
    if(req.mode === "navigate"){
      ev.respondWith(staleWhileRevalidate(req, SHELL, "./"));
      return;
    }
    ev.respondWith(staleWhileRevalidate(req, SHELL));
    return;
  }

  if(url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com"){
    ev.respondWith(staleWhileRevalidate(req, FONTS));
  }
});
