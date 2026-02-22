// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyD1ih39qUdc429FJL6lu-_U1SiVVIU1GbI",
    authDomain: "ai-dobot.firebaseapp.com",
    projectId: "ai-dobot",
    storageBucket: "ai-dobot.firebasestorage.app",
    messagingSenderId: "110620790793",
    appId: "1:110620790793:web:6c0034d575a5016b6ea8d8"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification?.title || '🚨 New Patient Call';
    const notificationData  = payload.data || {};
    const videoUrl          = notificationData.video_call_url || null;

    self.registration.showNotification(notificationTitle, {
        body:             payload.notification?.body || '',
        icon:             '/icon.png',
        tag:              'patient-call-' + Date.now(),
        requireInteraction: true,
        vibrate:          [200, 100, 200],
        data:             notificationData,
    });
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const videoUrl = event.notification.data?.video_call_url || null;
    let appUrl     = self.registration.scope.replace(/\/$/, '');

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
            for (const client of list) {
                if (new URL(client.url).origin === new URL(appUrl).origin && 'focus' in client) {
                    client.focus();
                    // Send full call data so the card shows name/symptoms
                    client.postMessage({ type: 'INCOMING_CALL', call: notificationData });
                    return;
                }
            }
            // App closed — open with all params in URL
            const params = new URLSearchParams();
            if (videoUrl)                         params.set('video',   videoUrl);
            if (notificationData.patient_name)    params.set('name',    notificationData.patient_name);
            if (notificationData.patient_id)      params.set('id',      notificationData.patient_id);
            if (notificationData.symptom)         params.set('symptom', notificationData.symptom);
            const url = appUrl + (params.toString() ? '?' + params.toString() : '');
            return clients.openWindow(url);
        })
    );
});
