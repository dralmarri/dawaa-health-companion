import { useState } from "react";
import { CalendarDays, X } from "lucide-react";
import { store } from "@/lib/store";
import { format } from "date-fns";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import ChipSelector from "@/components/ChipSelector";
import type { Appointment } from "@/types";

const specialties = [
  "General Practitioner", "Dentist", "Cardiologist", "Dermatologist",
  "Ophthalmologist", "Orthopedist", "Neurologist", "Other",
];
const reminderOptions = ["At time", "15 minutes", "30 minutes", "60 minutes", "120 minutes"];

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState(store.getAppointments());
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState<"all" | "upcoming" | "completed">("all");

  const [specialty, setSpecialty] = useState("General Practitioner");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [time, setTime] = useState("09:00");
  const [location, setLocation] = useState("");
  const [reminder, setReminder] = useState("30 minutes");
  const [notes, setNotes] = useState("");

  const filtered = appointments.filter((a) => {
    if (tab === "upcoming") return !a.completed && a.date >= format(new Date(), "yyyy-MM-dd");
    if (tab === "completed") return a.completed;
    return true;
  });

  const handleSave = () => {
    const apt: Appointment = {
      id: crypto.randomUUID(),
      specialty, date, time, location, reminderBefore: reminder, notes, completed: false,
    };
    store.saveAppointment(apt);
    setAppointments(store.getAppointments());
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setSpecialty("General Practitioner");
    setDate(format(new Date(), "yyyy-MM-dd"));
    setTime("09:00");
    setLocation("");
    setReminder("30 minutes");
    setNotes("");
  };

  const handleDelete = (id: string) => {
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
      <PageHeader title="Appointments" showBack onAdd={() => setShowForm(true)} />

      {/* Tabs */}
      <div className="px-4 flex gap-2 mb-4">
        {(["all", "upcoming", "completed"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors capitalize ${
              tab === t
                ? "bg-chip-active text-chip-active-foreground border-chip-active"
                : "bg-chip text-chip-foreground border-border"
            }`}
          >
            {t === "all" ? "All" : t === "upcoming" ? "Upcoming" : "Completed"}
          </button>
        ))}
      </div>

      {filtered.length === 0 && !showForm ? (
        <EmptyState
          icon={<CalendarDays className="w-16 h-16" />}
          title="No appointments"
          subtitle="Add your first appointment"
          actionLabel="Add Appointment"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="px-4 space-y-3">
          {filtered.map((apt) => (
            <div key={apt.id} className="bg-card rounded-2xl border border-border p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-foreground">{apt.specialty}</h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(apt.date), "MMM d, yyyy")} at {apt.time}
                  </p>
                  {apt.location && (
                    <p className="text-sm text-muted-foreground">📍 {apt.location}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleComplete(apt.id)}
                    className={`text-xs px-2 py-1 rounded-full ${
                      apt.completed ? "bg-summary-taken text-summary-taken-foreground" : "bg-accent text-accent-foreground"
                    }`}
                  >
                    {apt.completed ? "✓ Done" : "Mark done"}
                  </button>
                  <button onClick={() => handleDelete(apt.id)} className="text-destructive/60 hover:text-destructive">
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-foreground/50 z-50 flex items-end">
          <div className="bg-card w-full max-h-[90vh] rounded-t-3xl overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Add Appointment</h2>
              <button onClick={() => setShowForm(false)}><X className="w-6 h-6 text-foreground" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-base font-bold text-foreground block mb-2">Specialty</label>
                <ChipSelector options={specialties} value={specialty} onChange={setSpecialty} />
              </div>
              <div>
                <label className="text-base font-bold text-foreground block mb-2">Appointment Date *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-base font-bold text-foreground block mb-2">Appointment Time *</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-base font-bold text-foreground block mb-2">Location</label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. City Hospital"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-base font-bold text-foreground block mb-2">Reminder before dose</label>
                <ChipSelector options={reminderOptions} value={reminder} onChange={setReminder} />
              </div>
              <div>
                <label className="text-base font-bold text-foreground block mb-2">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
              <button
                onClick={handleSave}
                className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;
