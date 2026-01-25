// firebase-messaging-sw.js
// Put this file in the ROOT of your doctor web app (same folder as index.html)

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase (same config as in index.html)
firebase.initializeApp({
    apiKey: "AIzaSyD1ih39qUdc429FJL6lu-_U1SiVVIU1GbI",
    authDomain: "ai-dobot.firebaseapp.com",
    projectId: "ai-dobot",
    storageBucket: "ai-dobot.firebasestorage.app",
    messagingSenderId: "110620790793",
    appId: "1:110620790793:web:6c0034d575a5016b6ea8d8"
});

const messaging = firebase.messaging();

// Handle background messages (when browser is not focused)
messaging.onBackgroundMessage((payload) => {
    console.log('Background notification:', payload);
    
    const notificationTitle = payload.notification.title || '🚨 New Patient Call';
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/icon.png',
        badge: '/badge.png',
        tag: 'patient-call-' + Date.now(),
        requireInteraction: true,
        vibrate: [200, 100, 200],
        data: payload.data
    };
    
    return self.registration.showNotification(notificationTitle, notificationOptions);
});
