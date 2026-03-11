import { CalendarDays } from "lucide-react";
import { store } from "@/lib/store";
import EmptyState from "@/components/EmptyState";

const HistoryPage = () => {
  const records = store.getDoseRecords();

  return (
    <div className="pb-24">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-3xl font-bold text-foreground">Dose History</h1>
      </div>

      {records.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="w-16 h-16" />}
          title="No history yet"
          subtitle="Your dose history will appear here"
        />
      ) : (
        <div className="px-4 space-y-3">
          {records.map((rec) => (
            <div key={rec.id} className="bg-card rounded-2xl border border-border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-foreground">{rec.medicationName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {rec.date} · {rec.scheduledTime}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  rec.status === "taken"
                    ? "bg-summary-taken text-summary-taken-foreground"
                    : rec.status === "missed"
                    ? "bg-summary-missed text-summary-missed-foreground"
                    : "bg-accent text-accent-foreground"
                }`}>
                  {rec.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
