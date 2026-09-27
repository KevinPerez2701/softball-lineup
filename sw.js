/* Diamante 10 — service worker.
   En el dugout la señal va y viene. La página se pide a la red primero (con
   señal siempre se ve la última versión) y, si no responde en unos segundos,
   se abre desde la caché. El resto de archivos sale de la caché al instante
   y se actualiza por detrás. Sube VERSION cuando cambie la lista de archivos. */
var VERSION = "v3";
var SHELL = "diamante10-shell-" + VERSION;
var CDN = "diamante10-cdn";
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
        if(k !== SHELL && k !== CDN) return caches.delete(k);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

/* Red primero, con límite de tiempo; si falla o tarda, lo guardado. */
function networkFirst(req, cacheName, key, ms){
  return caches.open(cacheName).then(function(cache){
    var net = fetch(req).then(function(res){
      if(res && res.ok) cache.put(key, res.clone());
      return res;
    });
    var slow = new Promise(function(resolve){ setTimeout(resolve, ms); });
    return Promise.race([net.catch(function(){ return null; }), slow]).then(function(res){
      if(res) return res;
      return cache.match(key).then(function(hit){ return hit || net; });
    });
  });
}

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
      ev.respondWith(networkFirst(req, SHELL, "./", 3500));
      return;
    }
    ev.respondWith(staleWhileRevalidate(req, SHELL));
    return;
  }

  /* Tipografías y el SDK de Firebase: sin ellos la app no abre sin señal.
     Las llamadas a la base y al login (googleapis.com) nunca pasan por aquí. */
  if(url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com" ||
     (url.hostname === "www.gstatic.com" && url.pathname.indexOf("/firebasejs/") === 0)){
    ev.respondWith(staleWhileRevalidate(req, CDN));
  }
});
