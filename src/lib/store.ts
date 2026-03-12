import { Preferences } from '@capacitor/preferences';
import { Medication, BloodPressureReading, Appointment, LabTest, DoseRecord, AppSettings } from '@/types';

const KEYS = {
  medications: 'dawaa_medications',
  readings: 'dawaa_readings',
  appointments: 'dawaa_appointments',
  labTests: 'dawaa_labTests',
  doseRecords: 'dawaa_doseRecords',
  settings: 'dawaa_settings',
};

const defaultSettings: AppSettings = {
  language: 'en',
  userName: '',
  notifications: true,
  voiceNotifications: false,
  reminderBefore: '5',
  escalationOnMissed: false,
};

// ── Sync cache (in-memory) ─────────────────────────────────────────
const cache: Record<string, unknown> = {};

async function loadAll() {
  for (const key of Object.values(KEYS)) {
    const { value } = await Preferences.get({ key });
    if (value) {
      try { cache[key] = JSON.parse(value); } catch { cache[key] = null; }
    }
  }
}

function getCache<T>(key: string, fallback: T): T {
  return (cache[key] as T) ?? fallback;
}

async function setCache<T>(key: string, value: T) {
  cache[key] = value;
  await Preferences.set({ key, value: JSON.stringify(value) });
}

// استدعِ هذه الدالة مرة واحدة عند بدء التطبيق
export async function initStore() {
  await loadAll();
}

// ── Store API ──────────────────────────────────────────────────────
export const store = {
  getMedications: (): Medication[] =>
    getCache(KEYS.medications, []),

  saveMedication: async (med: Medication) => {
    const all = store.getMedications();
    const idx = all.findIndex(m => m.id === med.id);
    if (idx >= 0) all[idx] = med; else all.push(med);
    await setCache(KEYS.medications, all);
  },

  deleteMedication: async (id: string) => {
    await setCache(KEYS.medications, store.getMedications().filter(m => m.id !== id));
  },

  getReadings: (): BloodPressureReading[] =>
    getCache(KEYS.readings, []),

  saveReading: async (r: BloodPressureReading) => {
    const all = store.getReadings();
    all.unshift(r);
    await setCache(KEYS.readings, all);
  },

  deleteReading: async (id: string) => {
    await setCache(KEYS.readings, store.getReadings().filter(r => r.id !== id));
  },

  getAppointments: (): Appointment[] =>
    getCache(KEYS.appointments, []),

  saveAppointment: async (a: Appointment) => {
    const all = store.getAppointments();
    const idx = all.findIndex(x => x.id === a.id);
    if (idx >= 0) all[idx] = a; else all.push(a);
    await setCache(KEYS.appointments, all);
  },

  deleteAppointment: async (id: string) => {
    await setCache(KEYS.appointments, store.getAppointments().filter(a => a.id !== id));
  },

  getLabTests: (): LabTest[] =>
    getCache(KEYS.labTests, []),

  saveLabTest: async (t: LabTest) => {
    const all = store.getLabTests();
    all.push(t);
    await setCache(KEYS.labTests, all);
  },

  deleteLabTest: async (id: string) => {
    await setCache(KEYS.labTests, store.getLabTests().filter(t => t.id !== id));
  },

  getDoseRecords: (): DoseRecord[] =>
    getCache(KEYS.doseRecords, []),

  saveDoseRecord: async (d: DoseRecord) => {
    const all = store.getDoseRecords();
    const idx = all.findIndex(x => x.id === d.id);
    if (idx >= 0) all[idx] = d; else all.push(d);
    await setCache(KEYS.doseRecords, all);
  },

  getSettings: (): AppSettings =>
    getCache(KEYS.settings, defaultSettings),

  saveSettings: async (s: AppSettings) =>
    await setCache(KEYS.settings, s),
};
