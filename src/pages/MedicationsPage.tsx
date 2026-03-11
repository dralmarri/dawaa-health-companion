import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pill } from "lucide-react";
import { store } from "@/lib/store";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import type { Medication } from "@/types";

const MedicationsPage = () => {
  const navigate = useNavigate();
  const [medications] = useState<Medication[]>(store.getMedications());

  return (
    <div className="pb-24">
      <PageHeader title="Medications" onAdd={() => navigate("/medications/add")} />

      {medications.length === 0 ? (
        <EmptyState
          icon={<Pill className="w-16 h-16" />}
          title="No medications"
          subtitle="Add your first medication"
          actionLabel="Add Medication"
          onAction={() => navigate("/medications/add")}
        />
      ) : (
        <div className="px-4 space-y-3 mt-4">
          {medications.map((med) => (
            <div
              key={med.id}
              className="bg-card rounded-2xl border border-border p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-foreground text-lg">{med.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {med.form} · {med.dosage} {med.form.toLowerCase()} · {med.frequency}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Times: {med.times.join(", ")} · Stock: {med.stock}
                  </p>
                </div>
                <Pill className="w-6 h-6 text-primary" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicationsPage;
