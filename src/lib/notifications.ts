import { LocalNotifications, PermissionStatus } from '@capacitor/local-notifications';
import { store } from './store';
import type { Medication, Appointment } from '@/types';

let scheduledIds: number[] = [];
let listenersRegistered = false;

export async function requestNotificationPermission(): Promise<boolean> {
  const status: PermissionStatus = await LocalNotifications.requestPermissions();
  return status.display === 'granted';
}

export async function getPermissionStatus(): Promise<string> {
  const status = await LocalNotifications.checkPermissions();
  return status.display;
}

/**
 * Register foreground notification listeners so notifications display even when app is open
 */
async function registerListeners() {
  if (listenersRegistered) return;
  listenersRegistered = true;

  // Show a toast when a notification fires while the app is in the foreground
  await LocalNotifications.addListener('localNotificationReceived', (notification) => {
    console.log('[Notifications] Received in foreground:', notification.title);
  });

  await LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
    console.log('[Notifications] Action performed:', action.notification.title);
  });
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

/**
 * Generate a stable numeric ID from medication ID + time string
 */
function stableId(medId: string, timeStr: string): number {
  let hash = 0;
  const str = medId + timeStr;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash) % 100000 + 1; // Keep in a safe range, avoid 0
}

export async function scheduleMedicationNotifications() {
  // Cancel all previously scheduled notifications
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

  const notifications: Array<{
    id: number;
    title: string;
    body: string;
    schedule: { at: Date; repeats: boolean; every: 'day'; allowWhileIdle: boolean };
    sound: string;
    smallIcon: string;
  }> = [];

  // Schedule individual notifications per medication per time
  // This avoids grouping issues and ensures each dose gets its own notification
  medications.forEach((med) => {
    med.times.forEach((timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) return;

      const doseTime = new Date();
      doseTime.setHours(hours, minutes, 0, 0);

      const notifyTime = new Date(doseTime.getTime() - reminderMinutes * 60 * 1000);
      
      // If the notification time has passed today, schedule for tomorrow
      if (notifyTime.getTime() <= now.getTime()) {
        notifyTime.setDate(notifyTime.getDate() + 1);
      }

      const { title, body } = getNotificationBody([med], isArabic);
      const id = stableId(med.id, timeStr);
      scheduledIds.push(id);

      notifications.push({
        id,
        title,
        body,
        schedule: { at: notifyTime, repeats: true, every: 'day' as const, allowWhileIdle: true },
        sound: 'default',
        smallIcon: 'ic_stat_icon_config_sample',
      });
    });
  });

  // === Blood Pressure Reminders (10 AM and 9 PM daily) ===
  const bpTimes = [{ hour: 10, min: 0, id: 9990 }, { hour: 21, min: 0, id: 9991 }];
  bpTimes.forEach(({ hour, min, id }) => {
    const bpTime = new Date();
    bpTime.setHours(hour, min, 0, 0);
    if (bpTime.getTime() <= now.getTime()) {
      bpTime.setDate(bpTime.getDate() + 1);
    }
    scheduledIds.push(id);
    notifications.push({
      id,
      title: isArabic ? '🩺 تذكير قياس الضغط' : '🩺 Blood Pressure Reminder',
      body: isArabic
        ? `حان وقت قياس ضغط الدم (${hour === 10 ? 'الصباح' : 'المساء'})`
        : `Time to measure your blood pressure (${hour === 10 ? 'Morning' : 'Evening'})`,
      schedule: { at: bpTime, repeats: true, every: 'day' as const, allowWhileIdle: true },
      sound: 'default',
      smallIcon: 'ic_stat_icon_config_sample',
    });
  });

  // === Low Stock Alert (≤20% of 2-month supply) — daily at 9 AM ===
  const lowStockMeds = medications.filter(med => {
    const timesPerDay = med.times.length || 1;
    let twoMonthSupply: number;
    switch (med.frequency) {
      case 'weekly': twoMonthSupply = timesPerDay * 8; break;
      case 'every_two_weeks': twoMonthSupply = timesPerDay * 4; break;
      case 'monthly': twoMonthSupply = timesPerDay * 2; break;
      default: twoMonthSupply = timesPerDay * 60; break;
    }
    return med.stock > 0 && (med.stock / twoMonthSupply) <= 0.2;
  });

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
        ? `مخزون منخفض (أقل من 20%): ${names}`
        : `Low stock (below 20%): ${names}`,
      schedule: { at: stockTime, repeats: true, every: 'day' as const, allowWhileIdle: true },
      sound: 'default',
      smallIcon: 'ic_stat_icon_config_sample',
    });
  }

  // === Appointment Reminders (1 day before + 2 hours before) ===
  const appointments: Appointment[] = store.getAppointments?.() || [];
  const upcomingAppts = appointments.filter(a => !a.completed);

  upcomingAppts.forEach((appt) => {
    const [aH, aM] = appt.time.split(':').map(Number);
    if (isNaN(aH) || isNaN(aM)) return;

    const apptDate = new Date(appt.date);
    apptDate.setHours(aH, aM, 0, 0);

    // 1 day before
    const dayBefore = new Date(apptDate.getTime() - 24 * 60 * 60 * 1000);
    if (dayBefore.getTime() > now.getTime()) {
      const dayId = stableId(appt.id, 'day-before');
      scheduledIds.push(dayId);
      const doctorInfo = appt.doctorName ? (isArabic ? ` - د. ${appt.doctorName}` : ` - Dr. ${appt.doctorName}`) : '';
      notifications.push({
        id: dayId,
        title: isArabic ? '📅 تذكير بموعد طبي غداً' : '📅 Appointment Tomorrow',
        body: isArabic
          ? `لديك موعد ${appt.specialty}${doctorInfo} غداً الساعة ${appt.time}`
          : `You have a ${appt.specialty}${doctorInfo} appointment tomorrow at ${appt.time}`,
        schedule: { at: dayBefore, repeats: false, every: 'day' as const, allowWhileIdle: true },
        sound: 'default',
        smallIcon: 'ic_stat_icon_config_sample',
      });
    }

    // 2 hours before
    const twoHoursBefore = new Date(apptDate.getTime() - 2 * 60 * 60 * 1000);
    if (twoHoursBefore.getTime() > now.getTime()) {
      const hourId = stableId(appt.id, '2h-before');
      scheduledIds.push(hourId);
      const doctorInfo = appt.doctorName ? (isArabic ? ` - د. ${appt.doctorName}` : ` - Dr. ${appt.doctorName}`) : '';
      notifications.push({
        id: hourId,
        title: isArabic ? '📅 موعدك بعد ساعتين' : '📅 Appointment in 2 Hours',
        body: isArabic
          ? `موعد ${appt.specialty}${doctorInfo} الساعة ${appt.time}`
          : `${appt.specialty}${doctorInfo} appointment at ${appt.time}`,
        schedule: { at: twoHoursBefore, repeats: false, every: 'day' as const, allowWhileIdle: true },
        sound: 'default',
        smallIcon: 'ic_stat_icon_config_sample',
      });
    }
  });

  // Daily summary
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
      schedule: { at: summaryTime, repeats: true, every: 'day' as const, allowWhileIdle: true },
      sound: 'default',
      smallIcon: 'ic_stat_icon_config_sample',
    });
  }

  if (notifications.length > 0) {
    await LocalNotifications.schedule({ notifications });
    console.log(`[Notifications] Scheduled ${notifications.length} notifications`);
  }

  return scheduledIds.length;
}

export async function startNotificationLoop() {
  await registerListeners();
  await scheduleMedicationNotifications();
}

/**
 * Cancel today's notification for a specific medication+time.
 * The daily repeating notification will be re-scheduled for tomorrow automatically
 * via the next call to scheduleMedicationNotifications (e.g. on app reload).
 */
export async function cancelDoseNotification(medicationId: string, timeStr: string) {
  try {
    const id = stableId(medicationId, timeStr);
    await LocalNotifications.cancel({ notifications: [{ id }] });
    // Remove from tracked ids so it gets re-armed on next schedule
    scheduledIds = scheduledIds.filter(x => x !== id);
    console.log(`[Notifications] Canceled dose reminder for ${medicationId} @ ${timeStr}`);
  } catch (e) {
    console.warn('[Notifications] Failed to cancel dose notification', e);
  }
}

/**
 * Re-schedule a single dose notification (used when undoing a taken dose).
 */
export async function rescheduleAllNotifications() {
  await scheduleMedicationNotifications();
}
