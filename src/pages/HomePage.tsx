import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pill, Heart, CalendarDays, FlaskConical, Plus, Check, X, AlertTriangle } from "lucide-react";
import { store } from "@/lib/store";
import { generateTodayDoses, markDoseTaken, markDoseMissed } from "@/lib/dose-tracker";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import type { DoseRecord } from "@/types";

const HomePage = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const [todayDoses, setTodayDoses] = useState<DoseRecord[]>([]);

  useEffect(() => {
    const doses = generateTodayDoses();
    setTodayDoses(doses);

    // Refresh every minute to auto-mark missed
    const interval = setInterval(() => {
      setTodayDoses(generateTodayDoses());
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const today = format(new Date(), "yyyy-MM-dd");
  const scheduled = todayDoses.length;
  const taken = todayDoses.filter((d) => d.status === "taken").length;
  const missed = todayDoses.filter((d) => d.status === "missed").length;

  const handleTaken = (id: string) => {
    const { lowStockMed } = markDoseTaken(id);
    setTodayDoses(generateTodayDoses());
    toast.success(isRTL ? "تم تسجيل الجرعة ✓" : "Dose recorded ✓");
    if (lowStockMed) {
      toast.warning(
        isRTL
          ? `⚠️ مخزون ${lowStockMed.name} منخفض! متبقي ${lowStockMed.stock} فقط (${lowStockMed.percent}%)`
          : `⚠️ ${lowStockMed.name} stock is low! Only ${lowStockMed.stock} left (${lowStockMed.percent}%)`,
        { duration: 6000 }
      );
    }
  };

  const handleMissed = (id: string) => {
    markDoseMissed(id);
    setTodayDoses(generateTodayDoses());
  };

  const quickLinks = [
    { label: t.medications, icon: Pill, path: "/medications", color: "text-primary" },
    { label: t.bloodPressure, icon: Heart, path: "/blood-pressure", color: "text-heart" },
    { label: t.appointments, icon: CalendarDays, path: "/appointments", color: "text-warning" },
    { label: t.labTests, icon: FlaskConical, path: "/lab-tests", color: "text-primary" },
  ];

  // Sort doses: pending first, then by time
  const sortedDoses = [...todayDoses].sort((a, b) => {
    const statusOrder = { pending: 0, missed: 1, taken: 2 };
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;
    return a.scheduledTime.localeCompare(b.scheduledTime);
  });

  return (
    <div className="pb-28 px-4">
      <div className="pt-6 pb-4">
        <h1 className="text-3xl font-bold text-foreground">
          {t.appName} <span className="text-2xl">💊</span>
        </h1>
        <p className="text-muted-foreground">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      {/* Summary */}
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

      {/* Low Stock Alerts */}
      {(() => {
        const meds = store.getMedications();
        const lowStockMeds = meds.filter(m => {
          const initial = m.initialStock || m.stock;
          return initial > 0 && (m.stock / initial) <= 0.2;
        });
        if (lowStockMeds.length === 0) return null;
        return (
          <div className="mb-6 space-y-2">
            {lowStockMeds.map(m => (
              <div key={m.id} className="bg-warning/10 border border-warning/30 rounded-2xl p-4 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
                <p className="text-sm font-medium text-foreground">
                  {isRTL
                    ? `مخزون "${m.name}" منخفض — متبقي ${m.stock} فقط`
                    : `"${m.name}" stock is low — only ${m.stock} left`}
                </p>
              </div>
            ))}
          </div>
        );
      })()}
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

      {/* Today's Doses */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-foreground mb-3">{t.upcomingDoses}</h2>
        <div className="bg-card rounded-2xl border border-border">
          {sortedDoses.length === 0 ? (
            <p className="text-center text-muted-foreground p-6">{t.noDosesToday}</p>
          ) : (
            <div className="divide-y divide-border">
              {sortedDoses.map((dose) => {
                const med = store.getMedications().find(m => m.id === dose.medicationId);
                return (
                  <div key={dose.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {med?.imageUrl ? (
                        <img src={med.imageUrl} alt={dose.medicationName} className="w-10 h-10 rounded-lg object-cover border border-border flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Pill className="w-5 h-5 text-primary" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{dose.medicationName}</p>
                        <p className="text-sm text-muted-foreground">
                          {dose.scheduledTime}
                          {med && ` · ${med.dosage} ${med.form}`}
                        </p>
                      </div>
                    </div>

                    {dose.status === "pending" ? (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleTaken(dose.id)}
                          className="w-9 h-9 rounded-full bg-summary-taken flex items-center justify-center hover:opacity-80 transition-opacity"
                          aria-label={isRTL ? "تم أخذها" : "Mark taken"}
                        >
                          <Check className="w-5 h-5 text-summary-taken-foreground" />
                        </button>
                        <button
                          onClick={() => handleMissed(dose.id)}
                          className="w-9 h-9 rounded-full bg-summary-missed flex items-center justify-center hover:opacity-80 transition-opacity"
                          aria-label={isRTL ? "فائتة" : "Mark missed"}
                        >
                          <X className="w-5 h-5 text-summary-missed-foreground" />
                        </button>
                      </div>
                    ) : (
                      <span className={`text-xs font-medium px-3 py-1.5 rounded-full flex-shrink-0 ${
                        dose.status === "taken"
                          ? "bg-summary-taken text-summary-taken-foreground"
                          : "bg-summary-missed text-summary-missed-foreground"
                      }`}>
                        {dose.status === "taken" ? (isRTL ? "✓ تم" : "✓ Taken") : (isRTL ? "✗ فائتة" : "✗ Missed")}
                      </span>
                    )}
                  </div>
                );
              })}
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
