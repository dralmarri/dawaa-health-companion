// RxNorm API - US National Library of Medicine medication database
const RXNORM_BASE = "https://rxnav.nlm.nih.gov/REST";

export async function searchMedications(query: string): Promise<string[]> {
  if (!query || query.length < 2) return [];
  try {
    const res = await fetch(
      `${RXNORM_BASE}/approximateTerm.json?term=${encodeURIComponent(query)}&maxEntries=8`
    );
    const data = await res.json();
    const candidates = data?.approximateGroup?.candidate;
    if (!candidates || !Array.isArray(candidates)) return [];
    
    // Get unique names
    const names = new Set<string>();
    for (const c of candidates) {
      if (c.name) {
        // Clean up name - take first word/phrase before technical details
        const clean = cleanMedName(c.name);
        if (clean) names.add(clean);
      }
    }
    return Array.from(names).slice(0, 8);
  } catch (err) {
    console.error("RxNorm search error:", err);
    return fallbackSearch(query);
  }
}

export async function isKnownMedication(name: string): Promise<boolean> {
  if (!name || name.trim().length < 2) return false;
  try {
    const res = await fetch(
      `${RXNORM_BASE}/rxcui.json?name=${encodeURIComponent(name.trim())}&search=2`
    );
    const data = await res.json();
    const group = data?.idGroup;
    return !!(group?.rxnormId && group.rxnormId.length > 0);
  } catch (err) {
    console.error("RxNorm validation error:", err);
    return fallbackIsKnown(name);
  }
}

function cleanMedName(raw: string): string {
  // Remove dosage info, keep the drug name
  // e.g. "Paracetamol 500 MG Oral Tablet" -> "Paracetamol"
  // But keep compound names like "Amoxicillin / Clavulanate"
  const parts = raw.split(/\s+\d/);
  return parts[0].trim();
}

// Fallback local list for offline/error scenarios
const fallbackMeds: string[] = [
  "Panadol", "Paracetamol", "Acetaminophen", "Aspirin", "Ibuprofen", "Advil", "Brufen",
  "Voltaren", "Diclofenac", "Naproxen", "Amoxicillin", "Augmentin", "Azithromycin",
  "Ciprofloxacin", "Metronidazole", "Amlodipine", "Lisinopril", "Losartan", "Metoprolol",
  "Metformin", "Glimepiride", "Insulin", "Atorvastatin", "Rosuvastatin", "Simvastatin",
  "Omeprazole", "Esomeprazole", "Pantoprazole", "Salbutamol", "Montelukast",
  "Cetirizine", "Loratadine", "Sertraline", "Fluoxetine", "Escitalopram",
  "Levothyroxine", "Vitamin D", "Vitamin B12", "Folic Acid", "Iron", "Calcium",
];

function fallbackSearch(query: string): string[] {
  const lower = query.toLowerCase();
  return fallbackMeds.filter((m) => m.toLowerCase().includes(lower)).slice(0, 8);
}

function fallbackIsKnown(name: string): boolean {
  return fallbackMeds.some((m) => m.toLowerCase() === name.trim().toLowerCase());
}
