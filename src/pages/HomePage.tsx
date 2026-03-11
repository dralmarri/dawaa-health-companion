import { useNavigate } from "react-router-dom";
import { Pill, Heart, CalendarDays, FlaskConical, Plus } from "lucide-react";
import { store } from "@/lib/store";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";

const HomePage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const medications = store.getMedications();
  const doseRecords = store.getDoseRecords();
  const today = format(new Date(), "yyyy-MM-dd");
  const todayRecords = doseRecords.filter((d) => d.date === today);

  const scheduled = todayRecords.length;
  const taken = todayRecords.filter((d) => d.status === "taken").length;
  const missed = todayRecords.filter((d) => d.status === "missed").length;

  const quickLinks = [
    { label: t.medications, icon: Pill, path: "/medications", color: "text-primary" },
    { label: t.bloodPressure, icon: Heart, path: "/blood-pressure", color: "text-heart" },
    { label: t.appointments, icon: CalendarDays, path: "/appointments", color: "text-warning" },
    { label: t.labTests, icon: FlaskConical, path: "/lab-tests", color: "text-primary" },
  ];

  return (
    <div className="pb-24 px-4">
      <div className="pt-6 pb-4">
        <h1 className="text-3xl font-bold text-foreground">
          {t.appName} <span className="text-2xl">💊</span>
        </h1>
        <p className="text-muted-foreground">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-bold text-foreground mb-3">{t.todaySummary}</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-secondary rounded-2xl p-4 text-center">
            <div className="text-3xl font-bold text-summary-schedule">{scheduled}</div>
            <div className="text-sm text-muted-foreground mt-1">{t.schedule}</div>
          </div>
          <div className="bg-summary-taken rounded-2xl p-4 text-center">
            <div className="text-3xl font-bold text-summary-taken-foreground">{taken}</div>
            <div className="text-sm text-muted-foreground mt-1">{t.taken}</div>
          </div>
          <div className="bg-summary-missed rounded-2xl p-4 text-center">
            <div className="text-3xl font-bold text-summary-missed-foreground">{missed}</div>
            <div className="text-sm text-muted-foreground mt-1">{t.missed}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {quickLinks.map((link) => (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            className="bg-card rounded-2xl p-5 flex flex-col items-center gap-2 border border-border hover:border-primary/30 transition-colors"
          >
            <link.icon className={`w-7 h-7 ${link.color}`} />
            <span className="text-sm font-semibold text-foreground">{link.label}</span>
          </button>
        ))}
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-bold text-foreground mb-3">{t.upcomingDoses}</h2>
        <div className="bg-card rounded-2xl border border-border p-6">
          {medications.length === 0 ? (
            <p className="text-center text-muted-foreground">{t.noDosesToday}</p>
          ) : (
            <div className="space-y-3">
              {medications.slice(0, 3).map((med) => (
                <div key={med.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {med.imageUrl ? (
                      <img src={med.imageUrl} alt={med.name} className="w-10 h-10 rounded-lg object-cover border border-border" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Pill className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-foreground">{med.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {med.dosage} {med.form} · {med.times[0]}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => navigate("/medications/add")}
        className="fixed bottom-20 ltr:right-4 rtl:left-4 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center z-40"
      >
        <Plus className="w-7 h-7" />
      </button>
    </div>
  );
};

export default HomePage;
