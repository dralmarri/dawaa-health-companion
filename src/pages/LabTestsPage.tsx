import { useState, useRef } from "react";
import { FlaskConical, X, Upload, AlertTriangle, CheckCircle2, ArrowDown, ArrowUp, Plus, Trash2, Search, Image } from "lucide-react";
import { store } from "@/lib/store";
import { format } from "date-fns";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { useLanguage } from "@/contexts/LanguageContext";
import { analyzeValue, labReferences, type AnalyzedResult } from "@/lib/lab-references";
import type { LabTest } from "@/types";

interface ManualEntry {
  id: string;
  testName: string;
  value: string;
  isCustom: boolean;
}

const LabTestsPage = () => {
  const { t, isRTL } = useLanguage();
  const [tests, setTests] = useState(store.getLabTests());
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [showResults, setShowResults] = useState<string | null>(null);
  const [savedResults, setSavedResults] = useState<Record<string, AnalyzedResult[]>>({});
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedImageName, setAttachedImageName] = useState("");

  // Manual entry state
  const [manualEntries, setManualEntries] = useState<ManualEntry[]>([]);
  const [showTestPicker, setShowTestPicker] = useState(false);
  const [testSearch, setTestSearch] = useState("");
  const [customTestName, setCustomTestName] = useState("");

  const addManualEntry = (testName: string, isCustom: boolean) => {
    const entry: ManualEntry = { id: crypto.randomUUID(), testName, value: "", isCustom };
    setManualEntries((prev) => [...prev, entry]);
    setShowTestPicker(false);
    setTestSearch("");
    setCustomTestName("");
  };

  const updateEntryValue = (id: string, value: string) => {
    setManualEntries((prev) => prev.map((e) => (e.id === id ? { ...e, value } : e)));
  };

  const removeEntry = (id: string) => {
    setManualEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const getManualResults = (): AnalyzedResult[] => {
    return manualEntries
      .filter((e) => e.value.trim() !== "")
      .map((e) => {
        const numValue = parseFloat(e.value);
        if (isNaN(numValue)) return null;
        const analyzed = analyzeValue(e.testName, numValue);
        if (analyzed) return analyzed;
        return {
          testName: e.testName,
          value: numValue,
          unit: "",
          normalRange: { min: 0, max: 0 },
          status: "normal" as const,
          category: t.other,
        };
      })
      .filter(Boolean) as AnalyzedResult[];
  };

  const filteredTests = labReferences.filter(
    (ref) =>
      ref.name.toLowerCase().includes(testSearch.toLowerCase()) ||
      ref.aliases.some((a) => a.toLowerCase().includes(testSearch.toLowerCase())) ||
      ref.category.toLowerCase().includes(testSearch.toLowerCase())
  );

  const groupedTests = filteredTests.reduce((acc, ref) => {
    if (!acc[ref.category]) acc[ref.category] = [];
    acc[ref.category].push(ref);
    return acc;
  }, {} as Record<string, typeof labReferences>);

  const alreadyAdded = new Set(manualEntries.map((e) => e.testName));

  const compressImage = (file: File, maxWidth = 800, quality = 0.6): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement("img");
      const reader = new FileReader();
      reader.onload = () => {
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ratio = Math.min(maxWidth / img.width, maxWidth / img.height, 1);
          canvas.width = img.width * ratio;
          canvas.height = img.height * ratio;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = reject;
        img.src = reader.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileAttach = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachedImageName(file.name);
    
    if (file.type.startsWith("image/")) {
      try {
        const compressed = await compressImage(file);
        setAttachedImage(compressed);
      } catch {
        // Fallback to raw if compression fails
        const reader = new FileReader();
        reader.onload = () => setAttachedImage(reader.result as string);
        reader.readAsDataURL(file);
      }
    } else if (file.type === "application/pdf") {
      // For PDFs, store just a marker - too large for localStorage
      setAttachedImage("pdf:" + file.name);
    }
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const testId = crypto.randomUUID();
    const allResults = getManualResults();

    const test: LabTest = {
      id: testId,
      name: name.trim(),
      notes: notes.trim(),
      fileUrl: attachedImage || undefined,
      date: new Date().toISOString(),
    };
    
    try {
      store.saveLabTest(test);

      if (allResults.length > 0) {
        const stored = JSON.parse(localStorage.getItem("dawaa_lab_results") || "{}");
        stored[testId] = allResults;
        localStorage.setItem("dawaa_lab_results", JSON.stringify(stored));
        setSavedResults((prev) => ({ ...prev, [testId]: allResults }));
      }

      setTests(store.getLabTests());
      resetForm();
    } catch (err) {
      console.error("Save error:", err);
      // If localStorage quota exceeded, try saving without image
      if (attachedImage && attachedImage.length > 1000) {
        test.fileUrl = undefined;
        try {
          store.saveLabTest(test);
          if (allResults.length > 0) {
            const stored = JSON.parse(localStorage.getItem("dawaa_lab_results") || "{}");
            stored[testId] = allResults;
            localStorage.setItem("dawaa_lab_results", JSON.stringify(stored));
            setSavedResults((prev) => ({ ...prev, [testId]: allResults }));
          }
          setTests(store.getLabTests());
          resetForm();
          alert(isRTL ? "تم الحفظ بدون الصورة (المساحة ممتلئة)" : "Saved without image (storage full)");
        } catch {
          alert(isRTL ? "فشل الحفظ - المساحة ممتلئة" : "Save failed - storage full");
        }
      } else {
        alert(isRTL ? "فشل الحفظ" : "Save failed");
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setName("");
    setNotes("");
    setManualEntries([]);
    setShowTestPicker(false);
    setAttachedImage(null);
    setAttachedImageName("");
  };

  const handleDelete = (id: string) => {
    store.deleteLabTest(id);
    const allResults = JSON.parse(localStorage.getItem("dawaa_lab_results") || "{}");
    delete allResults[id];
    localStorage.setItem("dawaa_lab_results", JSON.stringify(allResults));
    setTests(store.getLabTests());
  };

  const loadSavedResults = (testId: string) => {
    if (savedResults[testId]) {
      setShowResults(showResults === testId ? null : testId);
      return;
    }
    const allResults = JSON.parse(localStorage.getItem("dawaa_lab_results") || "{}");
    if (allResults[testId]) {
      setSavedResults((prev) => ({ ...prev, [testId]: allResults[testId] }));
    }
    setShowResults(showResults === testId ? null : testId);
  };

  const getStatusIcon = (status: string) => {
    if (status === "high") return <ArrowUp className="w-4 h-4 text-destructive" />;
    if (status === "low") return <ArrowDown className="w-4 h-4 text-orange-500" />;
    return <CheckCircle2 className="w-4 h-4 text-green-500" />;
  };

  const getStatusBg = (status: string) => {
    if (status === "high") return "bg-destructive/10 border-destructive/20";
    if (status === "low") return "bg-orange-500/10 border-orange-500/20";
    return "bg-green-500/10 border-green-500/20";
  };

  const ResultsView = ({ results }: { results: AnalyzedResult[] }) => {
    const abnormal = results.filter((r) => r.status !== "normal");
    const normal = results.filter((r) => r.status === "normal");

    return (
      <div className="space-y-3 mt-3">
        <div className="flex gap-2 flex-wrap">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-600">
            ✅ {t.normalResults}: {normal.length}
          </span>
          {abnormal.length > 0 && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-destructive/10 text-destructive">
              ⚠️ {t.abnormalResults}: {abnormal.length}
            </span>
          )}
        </div>

        {abnormal.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-destructive flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" /> {t.needsAttention}
            </h4>
            {abnormal.map((r, i) => (
              <div key={i} className={`rounded-xl border p-3 ${getStatusBg(r.status)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(r.status)}
                    <span className="font-bold text-sm text-foreground">{r.testName}</span>
                    <span className="text-xs text-muted-foreground">({r.category})</span>
                  </div>
                  <span className="font-mono font-bold text-sm text-foreground">
                    {r.value} {r.unit}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t.normalRangeLabel}: {r.normalRange.min} - {r.normalRange.max} {r.unit}
                  {r.status === "high" ? ` • ${t.aboveNormal}` : ` • ${t.belowNormal}`}
                </p>
              </div>
            ))}
          </div>
        )}

        {normal.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-green-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> {t.normalResultsTitle}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {normal.map((r, i) => (
                <div key={i} className="rounded-xl border border-border bg-card/50 p-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    <span className="text-sm text-foreground">{r.testName}</span>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">
                    {r.value} {r.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const manualResults = getManualResults();

  return (
    <div className="pb-24">
      <PageHeader title={t.labTests} showBack onAdd={() => setShowForm(true)} />
      {tests.length === 0 && !showForm ? (
        <EmptyState
          icon={<FlaskConical className="w-16 h-16" />}
          title={t.noLabTests}
          subtitle={t.addFirstLabTest}
          actionLabel={t.addLabTest}
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="px-4 space-y-3 mt-4">
          {tests.map((test) => {
            const hasResults = savedResults[test.id] || JSON.parse(localStorage.getItem("dawaa_lab_results") || "{}")[test.id];
            return (
              <div key={test.id} className="bg-card rounded-2xl border border-border p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground">{test.name}</h3>
                    <p className="text-sm text-muted-foreground">{format(new Date(test.date), "MMM d, yyyy")}</p>
                    {test.notes && <p className="text-sm text-muted-foreground mt-1">{test.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {hasResults && (
                      <button
                        onClick={() => loadSavedResults(test.id)}
                        className="text-primary hover:text-primary/80 text-sm font-bold px-2 py-1 rounded-lg bg-primary/10"
                      >
                        {showResults === test.id ? t.hideResults : t.viewResults}
                      </button>
                    )}
                    <button onClick={() => handleDelete(test.id)} className="text-destructive/60 hover:text-destructive">
                      🗑️
                    </button>
                  </div>
                </div>
                {/* Show attached image */}
                {test.fileUrl && (
                  <div className="mt-3">
                    <img src={test.fileUrl} alt={test.name} className="rounded-xl max-h-60 w-full object-contain border border-border" />
                  </div>
                )}
                {showResults === test.id && savedResults[test.id] && (
                  <ResultsView results={savedResults[test.id]} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="px-4 mt-4">
          <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">{t.addLabTest}</h2>
              <button onClick={resetForm}>
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>

            <div>
              <label className="text-base font-bold text-foreground block mb-2">{t.testName} *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. CBC, Lipid Panel"
                className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Attach Image */}
            <div>
              <label className="text-base font-bold text-foreground block mb-2">📷 {isRTL ? "إرفاق صورة" : "Attach Image"}</label>
              {attachedImage ? (
                <div className="relative">
                  <img src={attachedImage} alt="attached" className="rounded-xl max-h-48 w-full object-contain border border-border" />
                  <button
                    onClick={() => { setAttachedImage(null); setAttachedImageName(""); }}
                    className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <p className="text-xs text-muted-foreground mt-1 text-center">{attachedImageName}</p>
                </div>
              ) : (
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors flex flex-col items-center gap-2"
                >
                  <Image className="w-6 h-6 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{t.uploadLabFile || "Tap to attach lab image"}</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG, WebP, PDF</p>
                </button>
              )}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileAttach}
                className="hidden"
              />
            </div>

            {/* Manual Entry */}
            <div className="space-y-3">
              <label className="text-base font-bold text-foreground block">📝 {t.manualEntry}</label>
              
              {manualEntries.map((entry) => {
                const ref = labReferences.find((r) => r.name === entry.testName);
                const numVal = parseFloat(entry.value);
                const isOutOfRange = ref && !isNaN(numVal) && (numVal < ref.normalRange.min || numVal > ref.normalRange.max);

                return (
                  <div
                    key={entry.id}
                    className={`rounded-xl border p-3 ${
                      isOutOfRange ? "border-destructive/30 bg-destructive/5" : "border-border bg-card/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{entry.testName}</span>
                        {ref && (
                          <span className="text-xs text-muted-foreground">
                            ({ref.unit} • {ref.normalRange.min}-{ref.normalRange.max})
                          </span>
                        )}
                        {entry.isCustom && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground">{t.custom}</span>
                        )}
                      </div>
                      <button onClick={() => removeEntry(entry.id)} className="text-destructive/60 hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="number"
                      step="any"
                      value={entry.value}
                      onChange={(e) => updateEntryValue(entry.id, e.target.value)}
                      placeholder={t.enterValue}
                      className={`w-full px-3 py-2 rounded-lg border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm ${
                        isOutOfRange ? "border-destructive/40" : "border-border"
                      }`}
                    />
                    {isOutOfRange && ref && (
                      <p className="text-xs text-destructive mt-1">
                        {numVal > ref.normalRange.max ? `⬆ ${t.aboveNormal}` : `⬇ ${t.belowNormal}`}
                      </p>
                    )}
                  </div>
                );
              })}

              {!showTestPicker ? (
                <button
                  onClick={() => setShowTestPicker(true)}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors flex items-center justify-center gap-2 text-sm font-bold"
                >
                  <Plus className="w-4 h-4" /> {t.addTestItem}
                </button>
              ) : (
                <div className="rounded-xl border border-border bg-card p-3 space-y-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute top-3 text-muted-foreground" style={{ [isRTL ? "right" : "left"]: "12px" }} />
                    <input
                      value={testSearch}
                      onChange={(e) => setTestSearch(e.target.value)}
                      placeholder={t.searchTests}
                      autoFocus
                      className="w-full px-4 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                      style={{ [isRTL ? "paddingRight" : "paddingLeft"]: "36px" }}
                    />
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {Object.entries(groupedTests).map(([category, refs]) => (
                      <div key={category}>
                        <p className="text-xs font-bold text-muted-foreground px-1 mb-1">{category}</p>
                        <div className="space-y-1">
                          {refs.map((ref) => (
                            <button
                              key={ref.name}
                              disabled={alreadyAdded.has(ref.name)}
                              onClick={() => addManualEntry(ref.name, false)}
                              className={`w-full text-start px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                                alreadyAdded.has(ref.name)
                                  ? "bg-muted text-muted-foreground opacity-50"
                                  : "hover:bg-primary/10 text-foreground"
                              }`}
                            >
                              <span className="font-medium">{ref.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {ref.normalRange.min}-{ref.normalRange.max} {ref.unit}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border pt-3">
                    <p className="text-xs font-bold text-muted-foreground mb-2">{t.customTest}</p>
                    <div className="flex gap-2">
                      <input
                        value={customTestName}
                        onChange={(e) => setCustomTestName(e.target.value)}
                        placeholder={t.enterCustomTestName}
                        className="flex-1 px-3 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                      />
                      <button
                        onClick={() => {
                          if (customTestName.trim()) {
                            addManualEntry(customTestName.trim(), true);
                          }
                        }}
                        disabled={!customTestName.trim()}
                        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold disabled:opacity-50"
                      >
                        {t.add}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => { setShowTestPicker(false); setTestSearch(""); }}
                    className="w-full py-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    {t.cancel}
                  </button>
                </div>
              )}

              {manualResults.length > 0 && (
                <div className="bg-muted/50 rounded-xl p-4">
                  <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                    <FlaskConical className="w-5 h-5 text-primary" />
                    {t.analysisResults} ({manualResults.length} {t.testsFound})
                  </h3>
                  <ResultsView results={manualResults} />
                </div>
              )}
            </div>

            <div>
              <label className="text-base font-bold text-foreground block mb-2">{t.notes}</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t.notes + "..."}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={!name.trim()}
                className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground font-bold disabled:opacity-50"
              >
                {t.save}
              </button>
              <button
                onClick={resetForm}
                className="flex-1 py-3 rounded-2xl bg-muted text-foreground font-bold"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabTestsPage;
