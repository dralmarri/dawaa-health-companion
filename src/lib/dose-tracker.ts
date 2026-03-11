import { store } from './store';
import { format } from 'date-fns';
import type { DoseRecord } from '@/types';

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
    med.times.forEach(time => {
      // Check if a record already exists for this med+time+today
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

  return store.getDoseRecords().filter(r => r.date === today);
}

/**
 * Mark a dose as taken
 */
export function markDoseTaken(recordId: string) {
  const records = store.getDoseRecords();
  const record = records.find(r => r.id === recordId);
  if (record) {
    record.status = 'taken';
    record.takenAt = format(new Date(), 'HH:mm');
    store.saveDoseRecord(record);

    // Decrease stock
    const med = store.getMedications().find(m => m.id === record.medicationId);
    if (med && med.stock > 0) {
      med.stock -= 1;
      store.saveMedication(med);
    }
  }
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
