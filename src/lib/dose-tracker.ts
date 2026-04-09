import { store } from './store';
import { format, differenceInDays, differenceInWeeks, differenceInMonths, parseISO } from 'date-fns';
import type { DoseRecord } from '@/types';

/**
 * Check if a medication is scheduled for today based on its frequency and startDate.
 */
function isMedScheduledToday(frequency: string, startDate?: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Daily frequencies always apply
  if (['Once daily', 'Twice daily', 'Three times daily', 'Four times daily', 'Every X hours'].includes(frequency)) {
    return true;
  }

  if (!startDate) return true; // No start date = assume today

  const start = parseISO(startDate);
  start.setHours(0, 0, 0, 0);

  // Don't schedule before start date
  if (today < start) return false;

  const daysDiff = differenceInDays(today, start);

  switch (frequency) {
    case 'Every week':
      return daysDiff % 7 === 0;
    case 'Every 2 weeks':
      return daysDiff % 14 === 0;
    case 'Every month': {
      // Same day of month
      return today.getDate() === start.getDate() && differenceInMonths(today, start) >= 0;
    }
    default:
      return true;
  }
}

/**
 * Generate today's dose records from medications.
 * Only creates records that don't already exist for today.
 */
export function generateTodayDoses(): DoseRecord[] {
  const today = format(new Date(), 'yyyy-MM-dd');
  const medications = store.getMedications();
  const existing = store.getDoseRecords();

  const todayExisting = existing.filter(r => r.date === today);

  let created = false;

  medications.forEach(med => {
    // Skip if not scheduled today
    if (!isMedScheduledToday(med.frequency, med.startDate)) return;

    med.times.forEach(time => {
      const exists = todayExisting.some(
        r => r.medicationId === med.id && r.scheduledTime === time
      );

      if (!exists) {
        const record: DoseRecord = {
          id: crypto.randomUUID(),
          medicationId: med.id,
          medicationName: med.name,
          scheduledTime: time,
          status: 'pending',
          date: today,
        };
        store.saveDoseRecord(record);
        created = true;
      }
    });
  });

  // Auto-mark past pending doses as missed
  const now = new Date();
  const currentTime = format(now, 'HH:mm');
  const allRecords = store.getDoseRecords();

  allRecords.forEach(record => {
    if (record.date === today && record.status === 'pending' && record.scheduledTime < currentTime) {
      // Give 30 min grace period
      const [h, m] = record.scheduledTime.split(':').map(Number);
      const doseTime = new Date();
      doseTime.setHours(h, m + 30, 0, 0);

      if (now > doseTime) {
        record.status = 'missed';
        store.saveDoseRecord(record);
      }
    }

    // Mark yesterday's pending as missed
    if (record.date < today && record.status === 'pending') {
      record.status = 'missed';
      store.saveDoseRecord(record);
    }
  });

  // Filter out dose records for deleted medications
  const medIds = new Set(medications.map(m => m.id));
  return store.getDoseRecords().filter(r => r.date === today && medIds.has(r.medicationId));
}

/**
 * Mark a dose as taken
 */
export function markDoseTaken(recordId: string): { lowStockMed?: { name: string; stock: number; percent: number } } {
  const records = store.getDoseRecords();
  const record = records.find(r => r.id === recordId);
  let lowStockMed: { name: string; stock: number; percent: number } | undefined;
  if (record) {
    record.status = 'taken';
    record.takenAt = format(new Date(), 'HH:mm');
    store.saveDoseRecord(record);

    // Decrease stock
    const med = store.getMedications().find(m => m.id === record.medicationId);
    if (med && med.stock > 0) {
      med.stock -= 1;
      store.saveMedication(med);

      // Check low stock (20% of initial)
      const initial = med.initialStock || med.stock + 1;
      const percent = Math.round((med.stock / initial) * 100);
      if (percent <= 20) {
        lowStockMed = { name: med.name, stock: med.stock, percent };
      }
    }
  }
  return { lowStockMed };
}

/**
 * Mark a dose as missed
 */
export function markDoseMissed(recordId: string) {
  const records = store.getDoseRecords();
  const record = records.find(r => r.id === recordId);
  if (record) {
    record.status = 'missed';
    store.saveDoseRecord(record);
  }
}
