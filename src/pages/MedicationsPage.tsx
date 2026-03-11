import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pill, Pencil, Trash2 } from "lucide-react";
import { store } from "@/lib/store";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Medication } from "@/types";

const MedicationsPage = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const [medications, setMedications] = useState<Medication[]>(store.getMedications());

  const handleDelete = (id: string) => {
    const confirmed = window.confirm(isRTL ? "هل أنت متأكد من حذف هذا الدواء؟" : "Are you sure you want to delete this medication?");
    if (!confirmed) return;
    store.deleteMedication(id);
    setMedications(store.getMedications());
  };

  return (
    <div className="pb-28">
      <PageHeader title={t.medications} onAdd={() => navigate("/medications/add")} />

      {medications.length === 0 ? (
        <EmptyState
          icon={<Pill className="w-16 h-16" />}
          title={t.noMedications}
          subtitle={t.addFirstMedication}
          actionLabel={t.addMedication}
          onAction={() => navigate("/medications/add")}
        />
      ) : (
        <div className="px-4 space-y-3 mt-4">
          {medications.map((med) => (
            <div key={med.id} className="bg-card rounded-2xl border border-border p-4">
              <div className="flex items-start gap-3">
                {med.imageUrl ? (
                  <img src={med.imageUrl} alt={med.name} className="w-16 h-16 rounded-xl object-cover border border-border flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Pill className="w-7 h-7 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground text-lg truncate">{med.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {med.form} · {med.dosage} · {med.frequency}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t.times}: {med.times.join(", ")} · {t.stock}: {med.stock}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => navigate(`/medications/add?edit=${med.id}`)}
                        className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20"
                        aria-label={isRTL ? "تعديل الدواء" : "Edit medication"}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(med.id)}
                        className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20"
                        aria-label={isRTL ? "حذف الدواء" : "Delete medication"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicationsPage;
