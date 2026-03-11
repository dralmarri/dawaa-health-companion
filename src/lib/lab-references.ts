// Normal reference ranges for common lab tests
export interface LabReference {
  name: string;
  aliases: string[];
  unit: string;
  normalRange: { min: number; max: number };
  category: string;
}

export const labReferences: LabReference[] = [
  // Complete Blood Count (CBC)
  { name: "WBC", aliases: ["white blood cells", "white blood cell count", "wbc count", "leucocytes"], unit: "×10³/µL", normalRange: { min: 4.5, max: 11.0 }, category: "CBC" },
  { name: "RBC", aliases: ["red blood cells", "red blood cell count", "rbc count", "erythrocytes"], unit: "×10⁶/µL", normalRange: { min: 4.5, max: 5.5 }, category: "CBC" },
  { name: "Hemoglobin", aliases: ["hgb", "hb", "haemoglobin"], unit: "g/dL", normalRange: { min: 12.0, max: 17.5 }, category: "CBC" },
  { name: "Hematocrit", aliases: ["hct", "packed cell volume", "pcv"], unit: "%", normalRange: { min: 36, max: 50 }, category: "CBC" },
  { name: "Platelets", aliases: ["plt", "platelet count", "thrombocytes"], unit: "×10³/µL", normalRange: { min: 150, max: 400 }, category: "CBC" },
  { name: "MCV", aliases: ["mean corpuscular volume"], unit: "fL", normalRange: { min: 80, max: 100 }, category: "CBC" },
  { name: "MCH", aliases: ["mean corpuscular hemoglobin"], unit: "pg", normalRange: { min: 27, max: 33 }, category: "CBC" },
  { name: "MCHC", aliases: ["mean corpuscular hemoglobin concentration"], unit: "g/dL", normalRange: { min: 32, max: 36 }, category: "CBC" },
  { name: "Neutrophils", aliases: ["neut", "neutrophil count"], unit: "%", normalRange: { min: 40, max: 70 }, category: "CBC" },
  { name: "Lymphocytes", aliases: ["lymph", "lymphocyte count"], unit: "%", normalRange: { min: 20, max: 40 }, category: "CBC" },

  // Liver Function
  { name: "ALT", aliases: ["alanine aminotransferase", "sgpt", "gpt"], unit: "U/L", normalRange: { min: 7, max: 56 }, category: "Liver" },
  { name: "AST", aliases: ["aspartate aminotransferase", "sgot", "got"], unit: "U/L", normalRange: { min: 10, max: 40 }, category: "Liver" },
  { name: "ALP", aliases: ["alkaline phosphatase"], unit: "U/L", normalRange: { min: 44, max: 147 }, category: "Liver" },
  { name: "Bilirubin Total", aliases: ["total bilirubin", "tbil", "t.bil"], unit: "mg/dL", normalRange: { min: 0.1, max: 1.2 }, category: "Liver" },
  { name: "Bilirubin Direct", aliases: ["direct bilirubin", "dbil", "d.bil", "conjugated bilirubin"], unit: "mg/dL", normalRange: { min: 0, max: 0.3 }, category: "Liver" },
  { name: "Albumin", aliases: ["alb"], unit: "g/dL", normalRange: { min: 3.5, max: 5.5 }, category: "Liver" },
  { name: "Total Protein", aliases: ["tp", "protein total"], unit: "g/dL", normalRange: { min: 6.0, max: 8.3 }, category: "Liver" },
  { name: "GGT", aliases: ["gamma-glutamyl transferase", "gamma gt"], unit: "U/L", normalRange: { min: 9, max: 48 }, category: "Liver" },

  // Kidney Function
  { name: "Creatinine", aliases: ["creat", "cr"], unit: "mg/dL", normalRange: { min: 0.7, max: 1.3 }, category: "Kidney" },
  { name: "BUN", aliases: ["blood urea nitrogen", "urea nitrogen"], unit: "mg/dL", normalRange: { min: 7, max: 20 }, category: "Kidney" },
  { name: "Urea", aliases: ["blood urea"], unit: "mg/dL", normalRange: { min: 15, max: 45 }, category: "Kidney" },
  { name: "Uric Acid", aliases: ["urate"], unit: "mg/dL", normalRange: { min: 3.5, max: 7.2 }, category: "Kidney" },
  { name: "eGFR", aliases: ["estimated glomerular filtration rate", "gfr"], unit: "mL/min", normalRange: { min: 90, max: 120 }, category: "Kidney" },

  // Lipid Panel
  { name: "Total Cholesterol", aliases: ["cholesterol", "tc", "chol"], unit: "mg/dL", normalRange: { min: 0, max: 200 }, category: "Lipids" },
  { name: "LDL", aliases: ["ldl cholesterol", "low density lipoprotein", "ldl-c"], unit: "mg/dL", normalRange: { min: 0, max: 100 }, category: "Lipids" },
  { name: "HDL", aliases: ["hdl cholesterol", "high density lipoprotein", "hdl-c"], unit: "mg/dL", normalRange: { min: 40, max: 60 }, category: "Lipids" },
  { name: "Triglycerides", aliases: ["tg", "trigs"], unit: "mg/dL", normalRange: { min: 0, max: 150 }, category: "Lipids" },

  // Diabetes
  { name: "Glucose Fasting", aliases: ["fasting glucose", "fbs", "fasting blood sugar", "glucose"], unit: "mg/dL", normalRange: { min: 70, max: 100 }, category: "Diabetes" },
  { name: "HbA1c", aliases: ["hemoglobin a1c", "glycated hemoglobin", "a1c", "hba1c"], unit: "%", normalRange: { min: 4.0, max: 5.6 }, category: "Diabetes" },

  // Thyroid
  { name: "TSH", aliases: ["thyroid stimulating hormone", "thyrotropin"], unit: "mIU/L", normalRange: { min: 0.4, max: 4.0 }, category: "Thyroid" },
  { name: "Free T4", aliases: ["ft4", "free thyroxine", "t4 free"], unit: "ng/dL", normalRange: { min: 0.8, max: 1.8 }, category: "Thyroid" },
  { name: "Free T3", aliases: ["ft3", "free triiodothyronine", "t3 free"], unit: "pg/mL", normalRange: { min: 2.3, max: 4.2 }, category: "Thyroid" },

  // Electrolytes
  { name: "Sodium", aliases: ["na", "na+"], unit: "mEq/L", normalRange: { min: 136, max: 145 }, category: "Electrolytes" },
  { name: "Potassium", aliases: ["k", "k+"], unit: "mEq/L", normalRange: { min: 3.5, max: 5.0 }, category: "Electrolytes" },
  { name: "Chloride", aliases: ["cl", "cl-"], unit: "mEq/L", normalRange: { min: 98, max: 106 }, category: "Electrolytes" },
  { name: "Calcium", aliases: ["ca", "ca2+", "ca++"], unit: "mg/dL", normalRange: { min: 8.5, max: 10.5 }, category: "Electrolytes" },
  { name: "Magnesium", aliases: ["mg", "mg2+"], unit: "mg/dL", normalRange: { min: 1.7, max: 2.2 }, category: "Electrolytes" },
  { name: "Phosphorus", aliases: ["phos", "phosphate"], unit: "mg/dL", normalRange: { min: 2.5, max: 4.5 }, category: "Electrolytes" },

  // Iron
  { name: "Iron", aliases: ["serum iron", "fe"], unit: "µg/dL", normalRange: { min: 60, max: 170 }, category: "Iron" },
  { name: "Ferritin", aliases: ["serum ferritin"], unit: "ng/mL", normalRange: { min: 12, max: 300 }, category: "Iron" },
  { name: "TIBC", aliases: ["total iron binding capacity"], unit: "µg/dL", normalRange: { min: 250, max: 370 }, category: "Iron" },

  // Vitamins
  { name: "Vitamin D", aliases: ["25-oh vitamin d", "25-hydroxyvitamin d", "vit d", "vitamin d3"], unit: "ng/mL", normalRange: { min: 30, max: 100 }, category: "Vitamins" },
  { name: "Vitamin B12", aliases: ["cobalamin", "vit b12"], unit: "pg/mL", normalRange: { min: 200, max: 900 }, category: "Vitamins" },
  { name: "Folate", aliases: ["folic acid", "vitamin b9"], unit: "ng/mL", normalRange: { min: 2.7, max: 17.0 }, category: "Vitamins" },

  // Inflammation
  { name: "CRP", aliases: ["c-reactive protein", "c reactive protein"], unit: "mg/L", normalRange: { min: 0, max: 3.0 }, category: "Inflammation" },
  { name: "ESR", aliases: ["erythrocyte sedimentation rate", "sed rate"], unit: "mm/hr", normalRange: { min: 0, max: 20 }, category: "Inflammation" },

  // Coagulation
  { name: "PT", aliases: ["prothrombin time"], unit: "seconds", normalRange: { min: 11, max: 13.5 }, category: "Coagulation" },
  { name: "INR", aliases: ["international normalized ratio"], unit: "", normalRange: { min: 0.8, max: 1.1 }, category: "Coagulation" },
  { name: "aPTT", aliases: ["activated partial thromboplastin time", "ptt"], unit: "seconds", normalRange: { min: 25, max: 35 }, category: "Coagulation" },

  // Cardiac
  { name: "Troponin", aliases: ["troponin i", "troponin t", "hs-troponin"], unit: "ng/mL", normalRange: { min: 0, max: 0.04 }, category: "Cardiac" },
  { name: "CK", aliases: ["creatine kinase", "cpk"], unit: "U/L", normalRange: { min: 22, max: 198 }, category: "Cardiac" },
  { name: "LDH", aliases: ["lactate dehydrogenase"], unit: "U/L", normalRange: { min: 140, max: 280 }, category: "Cardiac" },

  // PSA
  { name: "PSA", aliases: ["prostate specific antigen"], unit: "ng/mL", normalRange: { min: 0, max: 4.0 }, category: "Tumor Markers" },
];

export interface AnalyzedResult {
  testName: string;
  value: number;
  unit: string;
  normalRange: { min: number; max: number };
  status: "normal" | "low" | "high";
  category: string;
}

export function matchLabTest(name: string): LabReference | null {
  const lower = name.toLowerCase().trim();
  return labReferences.find(
    (ref) =>
      ref.name.toLowerCase() === lower ||
      ref.aliases.some((a) => a === lower || lower.includes(a) || a.includes(lower))
  ) || null;
}

export function analyzeValue(testName: string, value: number): AnalyzedResult | null {
  const ref = matchLabTest(testName);
  if (!ref) return null;

  let status: "normal" | "low" | "high" = "normal";
  if (value < ref.normalRange.min) status = "low";
  else if (value > ref.normalRange.max) status = "high";

  return {
    testName: ref.name,
    value,
    unit: ref.unit,
    normalRange: ref.normalRange,
    status,
    category: ref.category,
  };
}

// Extract test name-value pairs from text
export function extractLabValues(text: string): AnalyzedResult[] {
  const results: AnalyzedResult[] = [];
  const lines = text.split(/\n/);

  for (const line of lines) {
    // Try patterns like "Test Name: 5.5" or "Test Name  5.5  mg/dL" or "Test Name ..... 5.5"
    for (const ref of labReferences) {
      const allNames = [ref.name, ...ref.aliases];
      for (const name of allNames) {
        const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(
          `${escapedName}[\\s.:;\\-_]*[\\s.]*?(\\d+\\.?\\d*)`,
          "i"
        );
        const match = line.match(regex);
        if (match) {
          const value = parseFloat(match[1]);
          if (!isNaN(value) && !results.find((r) => r.testName === ref.name)) {
            const analyzed = analyzeValue(ref.name, value);
            if (analyzed) results.push(analyzed);
          }
          break;
        }
      }
    }
  }

  return results;
}

// Parse JSON lab results (common formats)
export function parseJsonLabResults(data: unknown): AnalyzedResult[] {
  const results: AnalyzedResult[] = [];

  if (Array.isArray(data)) {
    for (const item of data) {
      if (typeof item === "object" && item !== null) {
        const name = (item as Record<string, unknown>).name || (item as Record<string, unknown>).test || (item as Record<string, unknown>).testName || "";
        const value = (item as Record<string, unknown>).value || (item as Record<string, unknown>).result || 0;
        if (typeof name === "string" && (typeof value === "number" || typeof value === "string")) {
          const numValue = typeof value === "number" ? value : parseFloat(value);
          if (!isNaN(numValue)) {
            const analyzed = analyzeValue(name, numValue);
            if (analyzed) results.push(analyzed);
          }
        }
      }
    }
  } else if (typeof data === "object" && data !== null) {
    // Handle { "testName": value } format
    for (const [key, val] of Object.entries(data as Record<string, unknown>)) {
      if (typeof val === "number" || (typeof val === "string" && !isNaN(parseFloat(val)))) {
        const numValue = typeof val === "number" ? val : parseFloat(val);
        const analyzed = analyzeValue(key, numValue);
        if (analyzed) results.push(analyzed);
      } else if (typeof val === "object" && val !== null) {
        // Handle nested: { results: [...] }
        const nested = parseJsonLabResults(val);
        results.push(...nested);
      }
    }
  }

  return results;
}
