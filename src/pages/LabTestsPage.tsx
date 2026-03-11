import { useState, useRef } from "react";
import { FlaskConical, X, Upload, FileText, AlertTriangle, CheckCircle2, ArrowDown, ArrowUp, Loader2 } from "lucide-react";
import { store } from "@/lib/store";
import { format } from "date-fns";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { useLanguage } from "@/contexts/LanguageContext";
import { extractLabValues, parseJsonLabResults, type AnalyzedResult } from "@/lib/lab-references";
import type { LabTest } from "@/types";

const LabTestsPage = () => {
  const { t, isRTL } = useLanguage();
  const [tests, setTests] = useState(store.getLabTests());
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [analysisResults, setAnalysisResults] = useState<AnalyzedResult[]>([]);
  const [fileName, setFileName] = useState("");
  const [showResults, setShowResults] = useState<string | null>(null);
  const [savedResults, setSavedResults] = useState<Record<string, AnalyzedResult[]>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setAnalyzing(true);
    setAnalysisResults([]);

    try {
      if (file.type === "application/pdf") {
        const { extractTextFromPdf } = await import("@/lib/pdf-parser");
        const text = await extractTextFromPdf(file);
        const results = extractLabValues(text);
        setAnalysisResults(results);
      } else if (file.type === "application/json" || file.name.endsWith(".json")) {
        const text = await file.text();
        const data = JSON.parse(text);
        const results = parseJsonLabResults(data);
        setAnalysisResults(results);
      } else if (file.type === "text/plain" || file.type === "text/csv") {
        const text = await file.text();
        const results = extractLabValues(text);
        setAnalysisResults(results);
      } else if (file.type.startsWith("image/")) {
        // OCR for images
        setOcrProgress(0);
        const { createWorker } = await import("tesseract.js");
        const worker = await createWorker("eng", undefined, {
          logger: (m: { status: string; progress: number }) => {
            if (m.status === "recognizing text") {
              setOcrProgress(Math.round(m.progress * 100));
            }
          },
        });
        const { data } = await worker.recognize(file);
        await worker.terminate();
        const results = extractLabValues(data.text);
        setAnalysisResults(results);
      }
    } catch (err) {
      console.error("File analysis error:", err);
    } finally {
      setAnalyzing(false);
      setOcrProgress(0);
    }

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const testId = crypto.randomUUID();
    const test: LabTest = {
      id: testId,
      name: name.trim(),
      notes: notes + (analysisResults.length > 0 ? `\n[${t.analyzedResults}: ${analysisResults.length}]` : ""),
      date: new Date().toISOString(),
    };
    store.saveLabTest(test);

    if (analysisResults.length > 0) {
      // Save results to localStorage
      const allResults = JSON.parse(localStorage.getItem("dawaa_lab_results") || "{}");
      allResults[testId] = analysisResults;
      localStorage.setItem("dawaa_lab_results", JSON.stringify(allResults));
      setSavedResults((prev) => ({ ...prev, [testId]: analysisResults }));
    }

    setTests(store.getLabTests());
    setShowForm(false);
    setName("");
    setNotes("");
    setAnalysisResults([]);
    setFileName("");
  };

  const handleDelete = (id: string) => {
    store.deleteLabTest(id);
    // Also delete saved results
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
        {/* Summary */}
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

        {/* Abnormal first */}
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

        {/* Normal results collapsed */}
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
              <button onClick={() => { setShowForm(false); setAnalysisResults([]); setFileName(""); }}>
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>

            <div>
              <label className="text-base font-bold text-foreground block mb-2">{t.testName} *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. CBC, TSH, ALT"
                className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="text-base font-bold text-foreground block mb-2">
                {t.uploadFile}
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
              >
                {analyzing ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">{t.analyzingFile}</p>
                  </div>
                ) : fileName ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="w-8 h-8 text-primary" />
                    <p className="text-sm font-medium text-foreground">{fileName}</p>
                    <p className="text-xs text-muted-foreground">{t.clickToChange}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{t.uploadLabFile}</p>
                    <p className="text-xs text-muted-foreground">PDF, JSON, TXT, CSV</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.json,.txt,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Analysis Results Preview */}
            {analysisResults.length > 0 && (
              <div className="bg-muted/50 rounded-xl p-4">
                <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-primary" />
                  {t.analysisResults} ({analysisResults.length} {t.testsFound})
                </h3>
                <ResultsView results={analysisResults} />
              </div>
            )}

            {analysisResults.length === 0 && fileName && !analyzing && (
              <div className="bg-muted/50 rounded-xl p-4 text-center">
                <AlertTriangle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">{t.noResultsFound}</p>
              </div>
            )}

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
                onClick={() => { setShowForm(false); setName(""); setNotes(""); setAnalysisResults([]); setFileName(""); }}
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
