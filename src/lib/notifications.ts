import { LocalNotifications, PermissionStatus } from '@capacitor/local-notifications';
import { store } from './store';
import type { Medication } from '@/types';

let scheduledIds: number[] = [];

export async function requestNotificationPermission(): Promise<boolean> {
  const status: PermissionStatus = await LocalNotifications.requestPermissions();
  return status.display === 'granted';
}

export async function getPermissionStatus(): Promise<string> {
  const status = await LocalNotifications.checkPermissions();
  return status.display;
}

function parseMinutes(reminderBefore: string): number {
  switch (reminderBefore) {
    case '0': return 0;
    case '5': return 5;
    case '10': return 10;
    case '15': return 15;
    case '30': return 30;
    case '60': return 60;
    case '120': return 120;
    default: return 5;
  }
}

function getNotificationBody(meds: Medication[], isArabic: boolean): { title: string; body: string } {
  if (meds.length === 1) {
    const med = meds[0];
    return {
      title: isArabic ? '⏰ موعد الدواء' : '⏰ Medication Reminder',
      body: isArabic
        ? `الآن موعد جرعة ${med.name} - ${med.dosage} ${med.form}`
        : `Time to take ${med.name} - ${med.dosage} ${med.form}`,
    };
  }
  const names = meds.map(m => m.name);
  return {
    title: isArabic ? '⏰ موعد الأدوية' : '⏰ Medications Reminder',
    body: isArabic
      ? `موعد الأدوية: ${names.join('، ')}`
      : `Time to take: ${names.join(', ')}`,
  };
}

export async function scheduleMedicationNotifications() {
  // إلغاء الإشعارات القديمة
  if (scheduledIds.length > 0) {
    await LocalNotifications.cancel({ notifications: scheduledIds.map(id => ({ id })) });
    scheduledIds = [];
  }

  const status = await LocalNotifications.checkPermissions();
  if (status.display !== 'granted') return;

  const settings = store.getSettings();
  if (!settings.notifications) return;

  const medications = store.getMedications();
  const reminderMinutes = parseMinutes(settings.reminderBefore);
  const now = new Date();
  const isArabic = settings.language === 'ar';

  // تجميع الأدوية حسب وقت الإشعار
  const timeGroups: Record<string, Medication[]> = {};

  medications.forEach((med) => {
    med.times.forEach((timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) return;

      const doseTime = new Date();
      doseTime.setHours(hours, minutes, 0, 0);

      const notifyTime = new Date(doseTime.getTime() - reminderMinutes * 60 * 1000);
      if (notifyTime.getTime() <= now.getTime()) {
        notifyTime.setDate(notifyTime.getDate() + 1);
      }

      const key = `${notifyTime.getHours()}:${notifyTime.getMinutes()}`;
      if (!timeGroups[key]) timeGroups[key] = [];
      timeGroups[key].push(med);
    });
  });

  // جدولة الإشعارات
  const notifications = Object.entries(timeGroups).map(([key, meds], index) => {
    const [h, m] = key.split(':').map(Number);
    const scheduleTime = new Date();
    scheduleTime.setHours(h, m, 0, 0);
    if (scheduleTime.getTime() <= now.getTime()) {
      scheduleTime.setDate(scheduleTime.getDate() + 1);
    }

    const { title, body } = getNotificationBody(meds, isArabic);
    const id = index + 1;
    scheduledIds.push(id);

    return {
      id,
      title,
      body,
      schedule: { at: scheduleTime, repeats: true, every: 'day' as const },
      sound: 'default',
      smallIcon: 'ic_stat_icon_config_sample',
    };
  });

  // إشعار المخزون المنخفض — كل يوم 9 صباحاً
  const lowStockMeds = medications.filter(med =>
    med.stock > 0 && med.stock <= 5
  );

  if (lowStockMeds.length > 0) {
    const stockTime = new Date();
    stockTime.setHours(9, 0, 0, 0);
    if (stockTime.getTime() <= now.getTime()) {
      stockTime.setDate(stockTime.getDate() + 1);
    }

    const stockId = 9999;
    scheduledIds.push(stockId);
    const names = lowStockMeds.map(m => m.name).join(isArabic ? '، ' : ', ');

    notifications.push({
      id: stockId,
      title: isArabic ? '⚠️ تنبيه المخزون' : '⚠️ Stock Alert',
      body: isArabic
        ? `مخزون منخفض: ${names}`
        : `Low stock: ${names}`,
      schedule: { at: stockTime, repeats: true, every: 'day' as const },
      sound: 'default',
      smallIcon: 'ic_stat_icon_config_sample',
    });
  }

  // ملخص يومي بأدوية اليوم
  if (settings.dailySummary && medications.length > 0) {
    const [sumH, sumM] = (settings.dailySummaryTime || '08:00').split(':').map(Number);
    const summaryTime = new Date();
    summaryTime.setHours(sumH, sumM, 0, 0);
    if (summaryTime.getTime() <= now.getTime()) {
      summaryTime.setDate(summaryTime.getDate() + 1);
    }

    const summaryId = 9998;
    scheduledIds.push(summaryId);

    const medList = medications.map(m => {
      const timesStr = m.times.join(isArabic ? '، ' : ', ');
      return `${m.name} (${timesStr})`;
    }).join('\n');

    const totalDoses = medications.reduce((sum, m) => sum + m.times.length, 0);

    notifications.push({
      id: summaryId,
      title: isArabic ? `📋 ملخص أدوية اليوم (${totalDoses} جرعة)` : `📋 Today's Medications (${totalDoses} doses)`,
      body: medList,
      schedule: { at: summaryTime, repeats: true, every: 'day' as const },
      sound: 'default',
      smallIcon: 'ic_stat_icon_config_sample',
    });
  }

  if (notifications.length > 0) {
    await LocalNotifications.schedule({ notifications });
  }

  return scheduledIds.length;
}

export async function startNotificationLoop() {
  await scheduleMedicationNotifications();
}
