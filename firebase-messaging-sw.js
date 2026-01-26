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
    
    // Ensure data object exists and includes video_call_url
    const notificationData = payload.data || {};
    if (videoUrl && !notificationData.video_call_url) {
        notificationData.video_call_url = videoUrl;
    }
    
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/icon.png',
        badge: '/badge.png',
        tag: 'patient-call-' + Date.now(),
        requireInteraction: true,
        vibrate: [200, 100, 200],
        data: notificationData  // Use the enhanced data object
    };
    
    console.log('📱 Showing notification with data:', notificationData);
    
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks (mobile and desktop)
self.addEventListener('notificationclick', (event) => {
    console.log('📱 Notification clicked:', event);
    event.notification.close();
    
    // Get video URL from notification data
    const notificationData = event.notification.data || {};
    const videoUrl = notificationData.video_call_url || null;
    console.log('🎥 Video URL from notification:', videoUrl);
    console.log('📦 Full notification data:', notificationData);
    
    // Get the app URL - use registration scope (most reliable)
    // Registration scope is the base URL where the service worker is registered
    let appUrl = self.registration.scope;
    
    // Remove trailing slash if present (we'll add it back if needed)
    if (appUrl.endsWith('/')) {
        appUrl = appUrl.slice(0, -1);
    }
    
    // For GitHub Pages, the scope might be the directory, so we need index.html
    // But first try without it, as many setups work with just the directory
    console.log('🔗 App URL (from scope):', appUrl);
    console.log('📍 Service worker scope:', self.registration.scope);
    console.log('📍 Current location:', self.location.href);
    
    event.waitUntil(
        clients.matchAll({ 
            type: 'window', 
            includeUncontrolled: true 
        }).then((clientList) => {
            console.log('📱 Found clients:', clientList.length);
            
            // Check if app is already open
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                const clientUrl = new URL(client.url);
                const appUrlObj = new URL(appUrl);
                
                // Check if client belongs to our app
                if (clientUrl.origin === appUrlObj.origin && 'focus' in client) {
                    console.log('✅ App already open, focusing and starting video call');
                    client.focus();
                    
                    // Send message to start video call if URL exists
                    if (videoUrl) {
                        client.postMessage({ 
                            type: 'START_VIDEO_CALL', 
                            videoUrl: videoUrl 
                        }).catch(err => {
                            console.error('Error sending message:', err);
                        });
                    }
                    return;
                }
            }
            
            // App is not open - open it
            console.log('📱 App not open, opening with video URL parameter');
            
            // Construct URL - try multiple formats for compatibility
            let urlToOpen = appUrl;
            
            // Add video parameter if exists
            if (videoUrl) {
                const separator = urlToOpen.includes('?') ? '&' : '?';
                urlToOpen = urlToOpen + separator + 'video=' + encodeURIComponent(videoUrl);
            }
            
            console.log('🔗 Opening URL:', urlToOpen);
            
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen).then((windowClient) => {
                    console.log('✅ Window opened successfully');
                    return windowClient;
                }).catch(err => {
                    console.error('❌ Error opening window:', err);
                    // Fallback 1: Try without video parameter
                    console.log('🔄 Fallback: Trying without video parameter');
                    return clients.openWindow(appUrl).catch(err2 => {
                        console.error('❌ Fallback also failed:', err2);
                        // Fallback 2: Try with index.html
                        const fallbackUrl = appUrl + '/index.html' + (videoUrl ? '?video=' + encodeURIComponent(videoUrl) : '');
                        console.log('🔄 Fallback 2: Trying with index.html:', fallbackUrl);
                        return clients.openWindow(fallbackUrl);
                    });
                });
            } else {
                console.error('❌ clients.openWindow is not available');
            }
        }).catch(err => {
            console.error('Error in notification click handler:', err);
        })
    );
});
