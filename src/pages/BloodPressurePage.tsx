import { useState } from "react";
import { Heart, Save } from "lucide-react";
import { store } from "@/lib/store";
import { format } from "date-fns";
import PageHeader from "@/components/PageHeader";
import ChipSelector from "@/components/ChipSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import type { BloodPressureReading } from "@/types";

const BloodPressurePage = () => {
  const { t } = useLanguage();
  const [readings, setReadings] = useState(store.getReadings());
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [period, setPeriod] = useState<"Morning" | "Evening">("Morning");

  const latestReading = readings[0];
  const last7 = readings.slice(0, 7);
  const avgSys = last7.length ? Math.round(last7.reduce((s, r) => s + r.systolic, 0) / last7.length) : 0;
  const avgDia = last7.length ? Math.round(last7.reduce((s, r) => s + r.diastolic, 0) / last7.length) : 0;
  const avgHr = last7.length ? Math.round(last7.reduce((s, r) => s + r.heartRate, 0) / last7.length) : 0;

  const getCategory = (sys: number) => {
    if (sys < 120) return { label: t.normal, color: "text-success" };
    if (sys < 130) return { label: t.elevated, color: "text-warning" };
    return { label: t.high, color: "text-destructive" };
  };

  const periodLabels: Record<string, string> = { Morning: t.morning, Evening: t.evening };

  const handleSave = () => {
    if (!systolic || !diastolic || !heartRate) return;
    const reading: BloodPressureReading = {
      id: crypto.randomUUID(),
      systolic: Number(systolic), diastolic: Number(diastolic), heartRate: Number(heartRate),
      period, date: format(new Date(), "yyyy-MM-dd"), time: format(new Date(), "HH:mm"),
    };
    store.saveReading(reading);
    setReadings(store.getReadings());
    setSystolic(""); setDiastolic(""); setHeartRate("");
  };

  const handleDelete = (id: string) => {
    store.deleteReading(id);
    setReadings(store.getReadings());
  };

  return (
    <div className="pb-24">
      <PageHeader title={t.bloodPressureMonitoring} showBack />
      <div className="px-4 space-y-4">
        {latestReading && (
          <div className="bg-card rounded-2xl border border-border p-5">
            <div className="flex gap-4">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{t.latestReading}</p>
                <p className="text-3xl font-bold text-foreground">{latestReading.systolic}/{latestReading.diastolic}</p>
                <p className="text-sm text-heart">♥ {latestReading.heartRate} bpm</p>
                <span className={`text-sm font-medium ${getCategory(latestReading.systolic).color}`}>{getCategory(latestReading.systolic).label}</span>
              </div>
              <div className="border-s border-border ps-4 flex-1">
                <p className="text-sm text-muted-foreground">{t.averageOfLast} {last7.length} {t.readings}</p>
                <p className="text-3xl font-bold text-foreground">{avgSys}/{avgDia}</p>
                <p className="text-sm text-heart">♥ {avgHr} bpm</p>
                <p className="text-xs text-muted-foreground">mmHg</p>
              </div>
            </div>
          </div>
        )}

        {readings.length > 0 && (
          <button onClick={() => window.print()} className="w-full py-3 rounded-2xl bg-info text-info-foreground font-semibold text-center">
            🖨️ {t.printReport}
          </button>
        )}

        <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-info rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-info-foreground" fill="currentColor" />
            </div>
            <div>
              <h2 className="font-bold text-foreground text-lg">{t.recordNewReading}</h2>
              <p className="text-sm text-muted-foreground">{t.enterBP}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-foreground flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-heart" /> {t.systolicUpper}
            </label>
            <div className="flex items-center mt-1">
              <span className="text-sm text-muted-foreground me-2">mmHg</span>
              <input type="number" value={systolic} onChange={(e) => setSystolic(e.target.value)} placeholder="120"
                className="flex-1 px-4 py-3 rounded-xl bg-accent text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-lg" />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-foreground flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-info" /> {t.diastolicLower}
            </label>
            <div className="flex items-center mt-1">
              <span className="text-sm text-muted-foreground me-2">mmHg</span>
              <input type="number" value={diastolic} onChange={(e) => setDiastolic(e.target.value)} placeholder="80"
                className="flex-1 px-4 py-3 rounded-xl bg-accent text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-lg" />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-foreground flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-heart" /> {t.heartRate}
            </label>
            <div className="flex items-center mt-1">
              <span className="text-sm text-muted-foreground me-2">bpm</span>
              <input type="number" value={heartRate} onChange={(e) => setHeartRate(e.target.value)} placeholder="72"
                className="flex-1 px-4 py-3 rounded-xl bg-accent text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-lg" />
              <Heart className="w-5 h-5 text-heart ms-2" fill="currentColor" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t.normalRange}</p>
          </div>

          <div>
            <label className="text-sm font-bold text-foreground block mb-2">{t.measurementPeriod}</label>
            <ChipSelector
              options={[t.morning, t.evening]}
              value={periodLabels[period]}
              onChange={(v) => setPeriod(v === t.morning ? "Morning" : "Evening")}
            />
          </div>

          <button onClick={handleSave} disabled={!systolic || !diastolic || !heartRate}
            className="w-full py-3 rounded-2xl bg-info text-info-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
            <Save className="w-5 h-5" /> {t.saveReading}
          </button>
        </div>

        <div className="bg-primary rounded-2xl p-5">
          <h3 className="text-lg font-bold text-primary-foreground mb-2">{t.medicalTip}</h3>
          <p className="text-primary-foreground/90 text-sm leading-relaxed">{t.medicalTipText}</p>
        </div>

        {readings.length > 0 && (
          <div className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📅</span>
              <h2 className="text-xl font-bold text-foreground">{t.readingsLog}</h2>
              <span className="text-sm bg-accent text-accent-foreground px-2 py-0.5 rounded-full ms-auto">
                {readings.length} {t.readings}
              </span>
            </div>
            <div className="space-y-3">
              {readings.map((r) => (
                <div key={r.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                  <div>
                    <p className="font-bold text-foreground">{format(new Date(r.date), "MMMM d, yyyy")}</p>
                    <p className="text-sm text-muted-foreground">{r.time}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${r.period === "Morning" ? "bg-warning/20 text-warning" : "bg-info/20 text-info"}`}>
                      {r.period === "Morning" ? "☀️" : "🌙"} {periodLabels[r.period]}
                    </span>
                  </div>
                  <div className="text-end">
                    <p className="font-bold text-foreground text-lg">{r.systolic}<span className="text-muted-foreground font-normal">/{r.diastolic}</span></p>
                    <p className="text-sm text-heart">♥ {r.heartRate} bpm</p>
                  </div>
                  <button onClick={() => handleDelete(r.id)} className="text-destructive/60 hover:text-destructive p-1 ms-2">🗑️</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BloodPressurePage;
