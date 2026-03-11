import { store } from './store';

let timers: ReturnType<typeof setTimeout>[] = [];

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function getPermissionStatus(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

function parseMinutes(reminderBefore: string): number {
  switch (reminderBefore) {
    case 'At time': return 0;
    case '5 minutes': return 5;
    case '10 minutes': return 10;
    case '15 minutes': return 15;
    default: return 5;
  }
}

function showNotification(title: string, body: string, voiceEnabled: boolean) {
  if (Notification.permission !== 'granted') return;
  
  const notification = new Notification(title, {
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: `med-${Date.now()}`,
    requireInteraction: true,
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };

  // Voice notification
  if (voiceEnabled && 'speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(body);
    utterance.lang = store.getSettings().language === 'ar' ? 'ar-SA' : 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }
}

export function scheduleMedicationNotifications() {
  // Clear existing timers
  timers.forEach(clearTimeout);
  timers = [];

  const settings = store.getSettings();
  if (!settings.notifications) return;
  if (Notification.permission !== 'granted') return;

  const medications = store.getMedications();
  const reminderMinutes = parseMinutes(settings.reminderBefore);
  const now = new Date();
  const isArabic = settings.language === 'ar';

  medications.forEach((med) => {
    med.times.forEach((timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) return;

      const doseTime = new Date();
      doseTime.setHours(hours, minutes, 0, 0);

      // Subtract reminder offset
      const notifyTime = new Date(doseTime.getTime() - reminderMinutes * 60 * 1000);
      const delay = notifyTime.getTime() - now.getTime();

      if (delay > 0 && delay < 24 * 60 * 60 * 1000) {
        const timer = setTimeout(() => {
          const title = isArabic ? '⏰ موعد الدواء' : '⏰ Medication Reminder';
          const body = isArabic
            ? `حان وقت تناول ${med.name} - ${med.dosage} ${med.form}`
            : `Time to take ${med.name} - ${med.dosage} ${med.form}`;
          showNotification(title, body, settings.voiceNotifications);
        }, delay);
        timers.push(timer);
      }
    });
  });

  // Schedule stock alerts (once per day at 9 AM)
  const stockCheckTime = new Date();
  stockCheckTime.setHours(9, 0, 0, 0);
  if (stockCheckTime.getTime() <= now.getTime()) {
    stockCheckTime.setDate(stockCheckTime.getDate() + 1);
  }
  const stockDelay = stockCheckTime.getTime() - now.getTime();
  
  const stockTimer = setTimeout(() => {
    medications.forEach((med) => {
      if (med.stock > 0 && med.stock <= Math.ceil(med.stock * 0.2 + 1)) {
        const title = isArabic ? '⚠️ تنبيه المخزون' : '⚠️ Stock Alert';
        const body = isArabic
          ? `مخزون ${med.name} منخفض: ${med.stock} متبقي`
          : `${med.name} stock is low: ${med.stock} remaining`;
        showNotification(title, body, false);
      }
    });
  }, stockDelay);
  timers.push(stockTimer);

  return timers.length;
}

// Re-schedule every day at midnight
export function startNotificationLoop() {
  scheduleMedicationNotifications();

  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const msUntilMidnight = midnight.getTime() - now.getTime();

  setTimeout(() => {
    startNotificationLoop();
  }, msUntilMidnight);
}
