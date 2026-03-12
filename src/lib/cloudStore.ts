import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Medication, BloodPressureReading, Appointment, LabTest, DoseRecord, AppSettings } from "@/types";

// ── Generic helpers ────────────────────────────────────────────────

async function saveDoc<T extends { id: string }>(uid: string, col: string, item: T) {
  await setDoc(doc(db, "users", uid, col, item.id), item);
}

async function deleteDocById(uid: string, col: string, id: string) {
  await deleteDoc(doc(db, "users", uid, col, id));
}

async function getDocs_<T>(uid: string, col: string): Promise<T[]> {
  const snap = await getDocs(collection(db, "users", uid, col));
  return snap.docs.map((d) => d.data() as T);
}

// ── Cloud Store API ────────────────────────────────────────────────

export const cloudStore = {
  // Medications
  getMedications: (uid: string) => getDocs_<Medication>(uid, "medications"),
  saveMedication: (uid: string, med: Medication) => saveDoc(uid, "medications", med),
  deleteMedication: (uid: string, id: string) => deleteDocById(uid, "medications", id),

  // Blood Pressure
  getReadings: (uid: string) => getDocs_<BloodPressureReading>(uid, "readings"),
  saveReading: (uid: string, r: BloodPressureReading) => saveDoc(uid, "readings", r),
  deleteReading: (uid: string, id: string) => deleteDocById(uid, "readings", id),

  // Appointments
  getAppointments: (uid: string) => getDocs_<Appointment>(uid, "appointments"),
  saveAppointment: (uid: string, a: Appointment) => saveDoc(uid, "appointments", a),
  deleteAppointment: (uid: string, id: string) => deleteDocById(uid, "appointments", id),

  // Lab Tests
  getLabTests: (uid: string) => getDocs_<LabTest>(uid, "labTests"),
  saveLabTest: (uid: string, t: LabTest) => saveDoc(uid, "labTests", t),
  deleteLabTest: (uid: string, id: string) => deleteDocById(uid, "labTests", id),

  // Dose Records
  getDoseRecords: (uid: string) => getDocs_<DoseRecord>(uid, "doseRecords"),
  saveDoseRecord: (uid: string, d: DoseRecord) => saveDoc(uid, "doseRecords", d),

  // Settings
  getSettings: async (uid: string): Promise<AppSettings | null> => {
    const snap = await getDoc(doc(db, "users", uid, "settings", "main"));
    return snap.exists() ? (snap.data() as AppSettings) : null;
  },
  saveSettings: (uid: string, s: AppSettings) =>
    setDoc(doc(db, "users", uid, "settings", "main"), s),

  // Lab Results (stored in localStorage but synced separately)
  getLabResults: async (uid: string): Promise<Record<string, any>> => {
    const snap = await getDoc(doc(db, "users", uid, "labResults", "main"));
    return snap.exists() ? (snap.data() as Record<string, any>) : {};
  },
  saveLabResults: (uid: string, results: Record<string, any>) =>
    setDoc(doc(db, "users", uid, "labResults", "main"), results),
};
