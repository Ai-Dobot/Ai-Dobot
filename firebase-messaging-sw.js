// Firebase Messaging Service Worker
// Put this file in doctor-app/ folder (same level as index.html)

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in service worker
firebase.initializeApp({
    apiKey: "AIzaSyD1ih39qUdc429FJL6lu-_U1SiVVIU1GbI",
    authDomain: "ai-dobot.firebaseapp.com",
    projectId: "ai-dobot",
    storageBucket: "ai-dobot.firebasestorage.app",
    messagingSenderId: "110620790793",
    appId: "1:110620790793:web:6c0034d575a5016b6ea8d8"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('Background message received:', payload);
    
    const title = payload.notification.title || '🚨 New Patient Call';
    const options = {
        body: payload.notification.body,
        icon: '/icon.png',
        badge: '/badge.png',
        tag: 'patient-call',
        requireInteraction: true
    };
    
    return self.registration.showNotification(title, options);
});
