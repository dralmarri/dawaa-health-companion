import { useState, useMemo } from "react";
import { CalendarDays, Check, X, Clock } from "lucide-react";
import { store } from "@/lib/store";
import { generateTodayDoses } from "@/lib/dose-tracker";
import EmptyState from "@/components/EmptyState";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";

const HistoryPage = () => {
  const { t, isRTL } = useLanguage();

  // Ensure today's doses are generated
  generateTodayDoses();

  const records = store.getDoseRecords();
  const [filter, setFilter] = useState<"all" | "taken" | "missed">("all");

  // Group records by date
  const grouped = useMemo(() => {
    const filtered = filter === "all" ? records : records.filter(r => r.status === filter);
    const groups: Record<string, typeof records> = {};
    
    filtered.forEach(r => {
      if (!groups[r.date]) groups[r.date] = [];
      groups[r.date].push(r);
    });

    // Sort dates descending
    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, recs]) => ({
        date,
        records: recs.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime)),
      }));
  }, [records, filter]);

  const totalTaken = records.filter(r => r.status === "taken").length;
  const totalMissed = records.filter(r => r.status === "missed").length;
  const totalPending = records.filter(r => r.status === "pending").length;

  const filterLabels = {
    all: isRTL ? "الكل" : "All",
    taken: isRTL ? "تم أخذها" : "Taken",
    missed: isRTL ? "فائتة" : "Missed",
  };

  const formatDate = (dateStr: string) => {
    const today = format(new Date(), "yyyy-MM-dd");
    const yesterday = format(new Date(Date.now() - 86400000), "yyyy-MM-dd");
    if (dateStr === today) return isRTL ? "اليوم" : "Today";
    if (dateStr === yesterday) return isRTL ? "أمس" : "Yesterday";
    try {
      return format(new Date(dateStr), "MMM d, yyyy");
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="pb-24">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-3xl font-bold text-foreground">{t.doseHistory}</h1>
      </div>

      {/* Summary bar */}
      {records.length > 0 && (
        <div className="px-4 mb-4">
          <div className="flex gap-3">
            <div className="flex-1 bg-summary-taken rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-summary-taken-foreground">{totalTaken}</div>
              <div className="text-xs text-muted-foreground">{t.taken}</div>
            </div>
            <div className="flex-1 bg-summary-missed rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-summary-missed-foreground">{totalMissed}</div>
              <div className="text-xs text-muted-foreground">{t.missed}</div>
            </div>
            <div className="flex-1 bg-secondary rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-summary-schedule">{totalPending}</div>
              <div className="text-xs text-muted-foreground">{isRTL ? "معلقة" : "Pending"}</div>
            </div>
          </div>
        </div>
      )}

      {/* Filter chips */}
      {records.length > 0 && (
        <div className="px-4 flex gap-2 mb-4">
          {(["all", "taken", "missed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                filter === f
                  ? "bg-chip-active text-chip-active-foreground border-chip-active"
                  : "bg-chip text-chip-foreground border-border"
              }`}
            >
              {filterLabels[f]}
            </button>
          ))}
        </div>
      )}

      {records.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="w-16 h-16" />}
          title={t.noHistory}
          subtitle={isRTL ? "سيظهر سجل الجرعات هنا عند إضافة أدوية" : "Dose history will appear here when you add medications"}
        />
      ) : grouped.length === 0 ? (
        <div className="px-4">
          <p className="text-center text-muted-foreground py-8">
            {isRTL ? "لا توجد نتائج لهذا الفلتر" : "No results for this filter"}
          </p>
        </div>
      ) : (
        <div className="px-4 space-y-4">
          {grouped.map(({ date, records: dayRecords }) => (
            <div key={date}>
              <h3 className="text-sm font-bold text-muted-foreground mb-2">{formatDate(date)}</h3>
              <div className="bg-card rounded-2xl border border-border divide-y divide-border">
                {dayRecords.map((rec) => (
                  <div key={rec.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        rec.status === "taken" ? "bg-summary-taken" :
                        rec.status === "missed" ? "bg-summary-missed" : "bg-secondary"
                      }`}>
                        {rec.status === "taken" ? <Check className="w-4 h-4 text-summary-taken-foreground" /> :
                         rec.status === "missed" ? <X className="w-4 h-4 text-summary-missed-foreground" /> :
                         <Clock className="w-4 h-4 text-summary-schedule" />}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{rec.medicationName}</p>
                        <p className="text-sm text-muted-foreground">
                          {rec.scheduledTime}
                          {rec.takenAt && ` → ${rec.takenAt}`}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      rec.status === "taken" ? "bg-summary-taken text-summary-taken-foreground" :
                      rec.status === "missed" ? "bg-summary-missed text-summary-missed-foreground" :
                      "bg-secondary text-summary-schedule"
                    }`}>
                      {rec.status === "taken" ? (isRTL ? "تم" : "Taken") :
                       rec.status === "missed" ? (isRTL ? "فائتة" : "Missed") :
                       (isRTL ? "معلقة" : "Pending")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
