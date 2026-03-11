import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import ChipSelector from "@/components/ChipSelector";
import { store } from "@/lib/store";
import type { Medication } from "@/types";

const forms = ["Pills", "Capsules", "Liquid", "Injection", "Drops", "Cream", "Inhaler", "Patches"] as const;
const frequencies = [
  "Once daily", "Twice daily", "Three times daily", "Four times daily",
  "Every X hours", "Specific days", "Every week", "Every 2 weeks", "Every month",
];
const mealOptions = ["No preference", "Before meal", "After meal", "With meal"] as const;

const AddMedicationPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [name, setName] = useState("");
  const [form, setForm] = useState<Medication["form"]>("Pills");
  const [dosage, setDosage] = useState(1);
  const [frequency, setFrequency] = useState("Once daily");
  const [times, setTimes] = useState(["08:00"]);
  const [mealRelation, setMealRelation] = useState<Medication["mealRelation"]>("No preference");
  const [notes, setNotes] = useState("");
  const [stock, setStock] = useState(30);

  const stepLabels = ["Basic Info", "Frequency", "Stock", "Confirm"];

  const handleSave = () => {
    const med: Medication = {
      id: crypto.randomUUID(),
      name, form, dosage, frequency, times, mealRelation, notes, stock,
      createdAt: new Date().toISOString(),
    };
    store.saveMedication(med);
    navigate("/medications");
  };

  const canNext = () => {
    if (step === 1) return name.trim().length > 0;
    return true;
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center px-4 pt-4 pb-2">
        <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} className="text-foreground">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-foreground mx-auto">Add Medication</h1>
        <div className="w-6" />
      </div>

      {/* Progress */}
      <div className="px-4 mb-2">
        <div className="flex gap-2 mb-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${i < step ? "bg-primary" : "bg-border"}`}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          {step}/{totalSteps} — {stepLabels[step - 1]}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-4 overflow-y-auto">
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="text-base font-bold text-foreground block mb-2">
                Medication Name *
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Panadol, Aspirin..."
                className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-base font-bold text-foreground block mb-2">Form</label>
              <ChipSelector
                options={[...forms]}
                value={form}
                onChange={(v) => setForm(v as Medication["form"])}
              />
            </div>
            <div>
              <label className="text-base font-bold text-foreground block mb-2">
                Dosage
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  value={dosage}
                  onChange={(e) => setDosage(Number(e.target.value))}
                  className="w-24 px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <span className="text-sm text-muted-foreground px-3 py-2 bg-accent rounded-lg">
                  {form.toLowerCase()}
                </span>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <label className="text-base font-bold text-foreground block mb-2">Frequency</label>
              <ChipSelector options={frequencies} value={frequency} onChange={setFrequency} />
            </div>
            <div>
              <label className="text-base font-bold text-foreground block mb-2">Times</label>
              {times.map((t, i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <input
                    type="time"
                    value={t}
                    onChange={(e) => {
                      const newTimes = [...times];
                      newTimes[i] = e.target.value;
                      setTimes(newTimes);
                    }}
                    className="px-4 py-3 rounded-xl border border-border bg-card text-foreground flex-1 focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="text-base font-bold text-foreground block mb-2">Meal Relation</label>
              <ChipSelector
                options={[...mealOptions]}
                value={mealRelation}
                onChange={(v) => setMealRelation(v as Medication["mealRelation"])}
              />
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
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div>
              <label className="text-base font-bold text-foreground block mb-2">Current Stock</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={0}
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  className="flex-1 px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <span className="text-sm text-muted-foreground px-3 py-2 bg-accent rounded-lg">
                  {form.toLowerCase()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                You will be alerted when stock reaches 20%
              </p>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-xl font-bold text-foreground text-center mb-6">Confirm</h2>
            <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Medication Name</span>
                <span className="font-bold text-foreground flex items-center gap-1">
                  {name} <Check className="w-4 h-4 text-primary" />
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Form</span>
                <span className="font-bold text-foreground">{form}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dosage</span>
                <span className="font-bold text-foreground">{dosage} {form.toLowerCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Frequency</span>
                <span className="font-bold text-foreground">{frequency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Times</span>
                <span className="font-bold text-foreground">{times.join(", ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stock</span>
                <span className="font-bold text-foreground">{stock} {form.toLowerCase()}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Button */}
      <div className="px-4 pb-6 pt-2">
        <button
          onClick={() => step < totalSteps ? setStep(step + 1) : handleSave()}
          disabled={!canNext()}
          className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg disabled:opacity-50"
        >
          {step < totalSteps ? "Next" : "Save"}
        </button>
      </div>
    </div>
  );
};

export default AddMedicationPage;
