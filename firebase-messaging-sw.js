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
    const videoUrl = payload.data?.video_call_url || null;
    
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

// Handle notification clicks (mobile and desktop)
self.addEventListener('notificationclick', (event) => {
    console.log('📱 Notification clicked:', event);
    event.notification.close();
    
    const videoUrl = event.notification.data?.video_call_url;
    console.log('🎥 Video URL from notification:', videoUrl);
    
    if (videoUrl) {
        // Open the app and start video call immediately
        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
                // Check if app is already open
                for (let i = 0; i < clientList.length; i++) {
                    const client = clientList[i];
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        console.log('✅ App already open, focusing and starting video call');
                        client.focus();
                        // Send message to start video call
                        client.postMessage({ 
                            type: 'START_VIDEO_CALL', 
                            videoUrl: videoUrl 
                        });
                        return;
                    }
                }
                // App is not open - open it with video URL parameter
                console.log('📱 Opening app with video URL parameter');
                if (clients.openWindow) {
                    const url = self.location.origin + self.location.pathname + '?video=' + encodeURIComponent(videoUrl);
                    console.log('🔗 Opening URL:', url);
                    return clients.openWindow(url);
                }
            })
        );
    } else {
        // No video URL - just open the app
        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
                for (let i = 0; i < clientList.length; i++) {
                    const client = clientList[i];
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow(self.location.origin);
                }
            })
        );
    }
});
