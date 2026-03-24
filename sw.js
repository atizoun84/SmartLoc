const CACHE_NAME = 'smartloc-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './login.html',
  './paiements.html',
  './recherche.html',
  './documents.html',
  './contrats.html',
  './contrat_locataires.html',
  './config.html',
  './comptabilite.html',
  './offline.html',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Installation : Mise en cache des ressources statiques
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activation : Nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME)
                  .map((name) => caches.delete(name))
      );
    })
  );
});

// Stratégie de Fetch : Stale-While-Revalidate
self.addEventListener('fetch', (event) => {
  // On ne gère pas les requêtes non-GET ou externes spécifiques si nécessaire
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchedResponse = fetch(event.request).then((networkResponse) => {
          // Mise à jour du cache avec la nouvelle réponse
          if (networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // Si le réseau échoue et que rien n'est en cache, on renvoie la page offline
          return cachedResponse || caches.match('./offline.html');
        });

        return cachedResponse || fetchedResponse;
      });
    })
  );
});
