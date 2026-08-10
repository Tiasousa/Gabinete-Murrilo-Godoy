// ============================================================
// SERVICE WORKER — GABINETE DIGITAL MURILLO GODOY
// PWA + Firebase Cloud Messaging em segundo plano
// ============================================================

importScripts(
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js'
);

importScripts(
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js'
);

// Mesmo projeto Firebase usado pelo index.html
firebase.initializeApp({
  apiKey: "AIzaSyD23LG4NhHDRfiHeXCSumKyTiXRV_yk5bc",
  authDomain: "gabinete-murillo-godoy.firebaseapp.com",
  projectId: "gabinete-murillo-godoy",
  storageBucket: "gabinete-murillo-godoy.firebasestorage.app",
  messagingSenderId: "1039162247732",
  appId: "1:1039162247732:web:900c8f90cd7b210930d861"
});

const messaging = firebase.messaging();

// ------------------------------------------------------------
// INSTALAÇÃO / ATUALIZAÇÃO DO PWA
// ------------------------------------------------------------

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Sempre prioriza a versão online
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// ------------------------------------------------------------
// NOTIFICAÇÃO RECEBIDA COM O APP EM SEGUNDO PLANO
// ------------------------------------------------------------

messaging.onBackgroundMessage((payload) => {
  console.log(
    '[FCM] Notificação recebida em segundo plano:',
    payload
  );

  const notification = payload.notification || {};
  const data = payload.data || {};

  const titulo =
    notification.title ||
    'Agenda — Gabinete Digital';

  const opcoes = {
    body:
      notification.body ||
      'Você tem compromisso na agenda hoje.',

    icon: './icon-192.png',
    badge: './icon-192.png',

    data: {
      url: data.url || './'
    },

    tag: 'agenda-gabinete',

    renotify: true
  };

  return self.registration.showNotification(
    titulo,
    opcoes
  );
});

// ------------------------------------------------------------
// CLIQUE NA NOTIFICAÇÃO
// ------------------------------------------------------------

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url =
    event.notification.data?.url || './';

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((janelas) => {

      for (const janela of janelas) {
        if ('focus' in janela) {
          janela.navigate(url);
          return janela.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
