import { cleanWhatsAppNumber } from '../utils/helpers';
import { cloudSyncService } from './cloudSyncService';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * PushNotificationService
 * 
 * Manages Browser Push Notifications via Service Worker & Notification API:
 * - Service Worker registration & lifecycle
 * - VAPID Web Push subscription registration to Supabase database
 * - Notification permission request & state tracking
 * - Dispatches rich push notifications for Approaching Birthdays (Tomorrow & Today)
 * - Click redirection to Student Profile (/student/{id}) or WhatsApp (https://wa.me/{phone})
 */
class PushNotificationService {
  constructor() {
    this.swRegistration = null;
    this.isSupported = typeof window !== 'undefined' && 'Notification' in window;
    this.hasServiceWorker = typeof window !== 'undefined' && 'serviceWorker' in navigator;
    this.init();
  }

  async init() {
    if (this.hasServiceWorker) {
      try {
        this.swRegistration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        console.log('Hostel Push Service Worker registered successfully');
      } catch (err) {
        console.warn('Service Worker registration skipped or failed:', err);
      }
    }
  }

  getPermissionState() {
    if (!this.isSupported) return 'unsupported';
    return Notification.permission; // 'default' | 'granted' | 'denied'
  }

  async requestPermission(userEmail = '') {
    if (!this.isSupported) {
      return { success: false, status: 'unsupported', message: 'Browser does not support notifications' };
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        await this.subscribeUser(userEmail);
      }
      return {
        success: permission === 'granted',
        status: permission,
        message: permission === 'granted' ? 'Notification permission granted' : 'Notification permission was denied',
      };
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      return { success: false, status: 'error', error: err.message };
    }
  }

  async subscribeUser(userEmail = '') {
    if (!this.isSupported || !this.swRegistration) return null;
    const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BJxWdLKAC1vVLJ7vIf1irjJhic9hsdwLqFIHLOvXoRrvzLRkzk-KIieYwHs1g95aOS5a79Pg8FR1KFnHBd5FSCg';
    try {
      const convertedKey = urlBase64ToUint8Array(vapidKey);
      let subscription = await this.swRegistration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await this.swRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedKey,
        });
      }
      if (subscription) {
        await cloudSyncService.savePushSubscription(userEmail, subscription.toJSON());
        return subscription;
      }
    } catch (err) {
      console.warn('Failed to subscribe to Web Push:', err?.message);
    }
    return null;
  }

  /**
   * Dispatches a rich browser push notification for a resident's birthday
   */
  async sendBirthdayNotification({ student, isToday, isTomorrow, force = false }) {
    if (!this.isSupported || Notification.permission !== 'granted') {
      return { sent: false, reason: 'Permission not granted' };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const dedupeKey = `hs_pushed_${todayStr}_${student.id}_${isToday ? 'today' : 'tomorrow'}`;

    // Deduplication check: prevent multiple duplicate push alerts per day unless forced
    if (!force && localStorage.getItem(dedupeKey)) {
      return { sent: false, reason: 'Already pushed today' };
    }

    const title = isToday
      ? `Birthday Reminder 🎂 Today!`
      : `Birthday Reminder 🎂 Tomorrow!`;

    const body = isToday
      ? `${student.full_name}'s birthday is today! (Room ${student.room_number}, Floor ${student.floor_number})`
      : `${student.full_name}'s birthday is tomorrow. (Room ${student.room_number}, Floor ${student.floor_number})`;

    const cleanPhone = cleanWhatsAppNumber(student.whatsapp_number || student.student_mobile);
    const profileUrl = `${window.location.origin}/student/${student.id}`;
    const whatsappUrl = `https://wa.me/${cleanPhone}`;

    const notificationOptions = {
      body,
      icon: student.profile_image_url || '/logo.png',
      badge: '/favicon.png',
      tag: `birthday-${student.id}-${todayStr}`,
      renotify: true,
      data: {
        url: profileUrl,
        whatsappUrl: whatsappUrl,
        studentId: student.id,
        isToday,
        isTomorrow,
      },
      actions: [
        { action: 'view_profile', title: 'View Profile' },
        { action: 'wish_whatsapp', title: 'Wish on WhatsApp' },
      ],
    };

    try {
      if (this.swRegistration && 'showNotification' in this.swRegistration) {
        await this.swRegistration.showNotification(title, notificationOptions);
      } else {
        // Fallback for standard Window Notification constructor
        const notif = new Notification(title, {
          body,
          icon: student.profile_image_url || '/logo.png',
          badge: '/favicon.png',
          data: notificationOptions.data,
        });

        notif.onclick = (event) => {
          event.preventDefault();
          window.focus();
          window.location.href = `/student/${student.id}`;
        };
      }

      // Mark as pushed for today
      localStorage.setItem(dedupeKey, 'true');
      return { sent: true, title, studentId: student.id };
    } catch (err) {
      console.error('Failed to trigger push notification:', err);
      return { sent: false, error: err.message };
    }
  }

  /**
   * Trigger a test notification to verify browser notification integration
   */
  async sendTestNotification() {
    if (!this.isSupported || Notification.permission !== 'granted') {
      const res = await this.requestPermission();
      if (!res.success) return res;
    }

    const testOptions = {
      body: "Rahul Patel's birthday is tomorrow. Click to open student profile.",
      icon: '/logo.png',
      badge: '/favicon.png',
      data: {
        url: `${window.location.origin}/birthdays`,
      },
      actions: [
        { action: 'view_profile', title: 'View Profile' },
        { action: 'wish_whatsapp', title: 'Wish on WhatsApp' },
      ],
    };

    if (this.swRegistration && 'showNotification' in this.swRegistration) {
      await this.swRegistration.showNotification('Birthday Reminder 🎂 (Test Alert)', testOptions);
    } else {
      const n = new Notification('Birthday Reminder 🎂 (Test Alert)', testOptions);
      n.onclick = () => {
        window.focus();
        window.location.href = '/birthdays';
      };
    }

    return { success: true };
  }
}

export const pushNotificationService = new PushNotificationService();
export { PushNotificationService };
