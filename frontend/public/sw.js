/**
 * Service Worker for Hari-Saurabh Hostel Management
 * Handles Browser Push Notifications & Notification Click Redirection
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Listen for push notifications (via Web Push Protocol)
self.addEventListener('push', (event) => {
  let data = {
    title: 'Hari-Saurabh Birthday Alert',
    body: 'Upcoming birthday notification for hostel resident.',
    icon: '/logo.png',
    badge: '/favicon.png',
    data: { url: '/dashboard' },
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/logo.png',
    badge: data.badge || '/favicon.png',
    vibrate: [100, 50, 100],
    data: data.data || {},
    actions: data.actions || [
      { action: 'view_profile', title: 'View Profile' },
      { action: 'wish_whatsapp', title: 'Wish on WhatsApp' },
    ],
    tag: data.tag || 'birthday-alert',
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Handle notification click events (Opens Student Profile or WhatsApp)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const notificationData = event.notification.data || {};
  const action = event.action;

  let targetUrl = notificationData.url || '/dashboard';

  // If action clicked was "Wish on WhatsApp"
  if (action === 'wish_whatsapp' && notificationData.whatsappUrl) {
    event.waitUntil(
      self.clients.openWindow(notificationData.whatsappUrl)
    );
    return;
  }

  // Default action or "View Profile" clicked -> Open student profile URL in active/new window
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
