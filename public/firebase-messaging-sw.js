// firebase-messaging-sw.js

// קובץ זה נטען רק בדפדפן ולכן אין צורך בתנאי typeof window
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// הגדרות Firebase שלך
firebase.initializeApp({
  apiKey: "AIzaSyCR_HBolUKab92805Sj6Py5xcRMuZk0Ams",
  authDomain: "my-business-management-e899f.firebaseapp.com",
  projectId: "my-business-management-e899f",
  storageBucket: "my-business-management-e899f.firebasestorage.app",
  messagingSenderId: "484449450524",
  appId: "1:484449450524:web:072cc573f397d52eaafdd9",
});

// קבלת המודול של messaging
const messaging = firebase.messaging();

// קבלת התראה כשהאפליקציה ברקע
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192.png',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
