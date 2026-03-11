import { useState } from "react";
import { CalendarDays, X } from "lucide-react";
import { store } from "@/lib/store";
import { format } from "date-fns";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import ChipSelector from "@/components/ChipSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Appointment } from "@/types";

const AppointmentsPage = () => {
  const { t, isRTL } = useLanguage();
  const [appointments, setAppointments] = useState(store.getAppointments());
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState<"all" | "upcoming" | "completed">("all");

  const specialtyMap: Record<string, string> = {
    "General Practitioner": t.generalPractitioner, "Dentist": t.dentist,
    "Cardiologist": t.cardiologist, "Dermatologist": t.dermatologist,
    "Ophthalmologist": t.ophthalmologist, "Orthopedist": t.orthopedist,
    "Neurologist": t.neurologist, "Other": t.other,
  };
  const specialtyKeys = Object.keys(specialtyMap);
  const specialtyLabels = Object.values(specialtyMap);

  const reminderMap: Record<string, string> = {
    "At time": t.atTime, "15 minutes": t.min15, "30 minutes": t.min30,
    "60 minutes": t.min60, "120 minutes": t.min120,
  };
  const reminderKeys = Object.keys(reminderMap);
  const reminderLabels = Object.values(reminderMap);

  const [specialty, setSpecialty] = useState("General Practitioner");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [time, setTime] = useState("09:00");
  const [location, setLocation] = useState("");
  const [reminder, setReminder] = useState("30 minutes");
  const [notes, setNotes] = useState("");

  const tabLabels = { all: t.all, upcoming: t.upcoming, completed: t.completed };

  const filtered = appointments.filter((a) => {
    if (tab === "upcoming") return !a.completed && a.date >= format(new Date(), "yyyy-MM-dd");
    if (tab === "completed") return a.completed;
    return true;
  });

  const handleSave = () => {
    const apt: Appointment = {
      id: crypto.randomUUID(), specialty, date, time, location,
      reminderBefore: reminder, notes, completed: false,
    };
    store.saveAppointment(apt);
    setAppointments(store.getAppointments());
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    const confirmed = window.confirm(isRTL ? "هل أنت متأكد من حذف هذا الموعد؟" : "Are you sure you want to delete this appointment?");
    if (!confirmed) return;
    store.deleteAppointment(id);
    setAppointments(store.getAppointments());
  };

  const toggleComplete = (id: string) => {
    const apt = appointments.find((a) => a.id === id);
    if (apt) {
      apt.completed = !apt.completed;
      store.saveAppointment(apt);
      setAppointments(store.getAppointments());
    }
  };

  return (
    <div className="pb-24">
      <PageHeader title={t.appointments} showBack onAdd={() => setShowForm(true)} />

      <div className="px-4 flex gap-2 mb-4">
        {(["all", "upcoming", "completed"] as const).map((tKey) => (
          <button key={tKey} onClick={() => setTab(tKey)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              tab === tKey ? "bg-chip-active text-chip-active-foreground border-chip-active" : "bg-chip text-chip-foreground border-border"
            }`}>
            {tabLabels[tKey]}
          </button>
        ))}
      </div>

      {filtered.length === 0 && !showForm ? (
        <EmptyState icon={<CalendarDays className="w-16 h-16" />} title={t.noAppointments} subtitle={t.addFirstAppointment}
          actionLabel={t.addAppointment} onAction={() => setShowForm(true)} />
      ) : (
        <div className="px-4 space-y-3">
          {filtered.map((apt) => (
            <div key={apt.id} className="bg-card rounded-2xl border border-border p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-foreground">{specialtyMap[apt.specialty] || apt.specialty}</h3>
                  <p className="text-sm text-muted-foreground">{format(new Date(apt.date), "MMM d, yyyy")} · {apt.time}</p>
                  {apt.location && <p className="text-sm text-muted-foreground">📍 {apt.location}</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggleComplete(apt.id)}
                    className={`text-xs px-2 py-1 rounded-full ${apt.completed ? "bg-summary-taken text-summary-taken-foreground" : "bg-accent text-accent-foreground"}`}>
                    {apt.completed ? `✓ ${t.done}` : t.markDone}
                  </button>
                  <button onClick={() => handleDelete(apt.id)} className="text-destructive/60 hover:text-destructive">🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-foreground/50 z-[60] flex items-end">
          <div className="bg-card w-full max-h-[90vh] rounded-t-3xl overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">{t.addAppointment}</h2>
              <button onClick={() => setShowForm(false)}><X className="w-6 h-6 text-foreground" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-base font-bold text-foreground block mb-2">{t.specialty}</label>
                <ChipSelector options={specialtyLabels} value={specialtyMap[specialty]}
                  onChange={(v) => setSpecialty(specialtyKeys[specialtyLabels.indexOf(v)])} />
              </div>
              <div>
                <label className="text-base font-bold text-foreground block mb-2">{t.appointmentDate} *</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-base font-bold text-foreground block mb-2">{t.appointmentTime} *</label>
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-base font-bold text-foreground block mb-2">{t.location}</label>
                <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t.location}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-base font-bold text-foreground block mb-2">{t.reminderBefore}</label>
                <ChipSelector options={reminderLabels} value={reminderMap[reminder]}
                  onChange={(v) => setReminder(reminderKeys[reminderLabels.indexOf(v)])} />
              </div>
              <div>
                <label className="text-base font-bold text-foreground block mb-2">{t.notes}</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t.notes + "..."} rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              </div>
              <button onClick={handleSave} className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg">{t.save}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;
