import { useState } from "react";
import { FlaskConical, X } from "lucide-react";
import { store } from "@/lib/store";
import { format } from "date-fns";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { useLanguage } from "@/contexts/LanguageContext";
import type { LabTest } from "@/types";

const LabTestsPage = () => {
  const { t } = useLanguage();
  const [tests, setTests] = useState(store.getLabTests());
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    if (!name.trim()) return;
    const test: LabTest = { id: crypto.randomUUID(), name: name.trim(), notes, date: new Date().toISOString() };
    store.saveLabTest(test);
    setTests(store.getLabTests());
    setShowForm(false);
    setName(""); setNotes("");
  };

  const handleDelete = (id: string) => { store.deleteLabTest(id); setTests(store.getLabTests()); };

  return (
    <div className="pb-24">
      <PageHeader title={t.labTests} showBack onAdd={() => setShowForm(true)} />
      {tests.length === 0 && !showForm ? (
        <EmptyState icon={<FlaskConical className="w-16 h-16" />} title={t.noLabTests} subtitle={t.addFirstLabTest}
          actionLabel={t.addLabTest} onAction={() => setShowForm(true)} />
      ) : (
        <div className="px-4 space-y-3 mt-4">
          {tests.map((test) => (
            <div key={test.id} className="bg-card rounded-2xl border border-border p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-foreground">{test.name}</h3>
                  <p className="text-sm text-muted-foreground">{format(new Date(test.date), "MMM d, yyyy")}</p>
                  {test.notes && <p className="text-sm text-muted-foreground mt-1">{test.notes}</p>}
                </div>
                <button onClick={() => handleDelete(test.id)} className="text-destructive/60 hover:text-destructive">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="px-4 mt-4">
          <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">{t.addLabTest}</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-foreground" /></button>
            </div>
            <div>
              <label className="text-base font-bold text-foreground block mb-2">{t.testName} *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. CBC, TSH, ALT"
                className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-base font-bold text-foreground block mb-2">{t.notes}</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t.notes + "..."} rows={3}
                className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={!name.trim()} className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground font-bold disabled:opacity-50">{t.save}</button>
              <button onClick={() => { setShowForm(false); setName(""); setNotes(""); }} className="flex-1 py-3 rounded-2xl bg-muted text-foreground font-bold">{t.cancel}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabTestsPage;
