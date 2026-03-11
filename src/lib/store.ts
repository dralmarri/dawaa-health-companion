import { Medication, BloodPressureReading, Appointment, LabTest, DoseRecord, AppSettings } from '@/types';

const KEYS = {
  medications: 'dawaa_medications',
  readings: 'dawaa_readings',
  appointments: 'dawaa_appointments',
  labTests: 'dawaa_labTests',
  doseRecords: 'dawaa_doseRecords',
  settings: 'dawaa_settings',
};

function get<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch { return fallback; }
}

function set<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const store = {
  getMedications: (): Medication[] => get(KEYS.medications, []),
  saveMedication: (med: Medication) => {
    const all = store.getMedications();
    const idx = all.findIndex(m => m.id === med.id);
    if (idx >= 0) all[idx] = med; else all.push(med);
    set(KEYS.medications, all);
  },
  deleteMedication: (id: string) => {
    set(KEYS.medications, store.getMedications().filter(m => m.id !== id));
  },

  getReadings: (): BloodPressureReading[] => get(KEYS.readings, []),
  saveReading: (r: BloodPressureReading) => {
    const all = store.getReadings();
    all.unshift(r);
    set(KEYS.readings, all);
  },
  deleteReading: (id: string) => {
    set(KEYS.readings, store.getReadings().filter(r => r.id !== id));
  },

  getAppointments: (): Appointment[] => get(KEYS.appointments, []),
  saveAppointment: (a: Appointment) => {
    const all = store.getAppointments();
    const idx = all.findIndex(x => x.id === a.id);
    if (idx >= 0) all[idx] = a; else all.push(a);
    set(KEYS.appointments, all);
  },
  deleteAppointment: (id: string) => {
    set(KEYS.appointments, store.getAppointments().filter(a => a.id !== id));
  },

  getLabTests: (): LabTest[] => get(KEYS.labTests, []),
  saveLabTest: (t: LabTest) => {
    const all = store.getLabTests();
    all.push(t);
    set(KEYS.labTests, all);
  },
  deleteLabTest: (id: string) => {
    set(KEYS.labTests, store.getLabTests().filter(t => t.id !== id));
  },

  getDoseRecords: (): DoseRecord[] => get(KEYS.doseRecords, []),
  saveDoseRecord: (d: DoseRecord) => {
    const all = store.getDoseRecords();
    const idx = all.findIndex(x => x.id === d.id);
    if (idx >= 0) all[idx] = d; else all.push(d);
    set(KEYS.doseRecords, all);
  },

  getSettings: (): AppSettings => get(KEYS.settings, {
    language: 'en',
    userName: '',
    notifications: true,
    voiceNotifications: false,
    reminderBefore: '5 minutes',
    escalationOnMissed: false,
  }),
  saveSettings: (s: AppSettings) => set(KEYS.settings, s),
};
