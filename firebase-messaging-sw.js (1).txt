// firebase-messaging-sw.js - PLACE THIS FILE IN ROOT FOLDER Shopline/firebase-messaging-sw.js
// This handles push when your website is CLOSED

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCX7fx7XvW6duavBYrTrzysIQN5gPyfJGo",
  authDomain: "willwin-cart.firebaseapp.com",
  projectId: "willwin-cart",
  storageBucket: "willwin-cart.appspot.com",
  messagingSenderId: "1050842791186",
  appId: "1:1050842791186:web:example"
});

const messaging = firebase.messaging();

// Background push - when site closed, show notification
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);
  const notificationTitle = payload.notification.title || 'Shopline Kerala';
  const notificationOptions = {
    body: payload.notification.body || 'New update from Shopline Kerala',
    icon: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png',
    badge: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png',
    vibrate: [200, 100, 200],
    requireInteraction: true,
    data: payload.data
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Click on notification - open orders page
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/Shopline/seller/orders.html')
  );
});
