// Common medications database for autocomplete and validation
export const commonMedications: string[] = [
  // Pain & Fever
  "Panadol", "Paracetamol", "Acetaminophen", "Aspirin", "Ibuprofen", "Advil", "Brufen",
  "Voltaren", "Diclofenac", "Naproxen", "Celebrex", "Celecoxib", "Tramadol", "Morphine",
  "Codeine", "Ponstan", "Mefenamic Acid", "Ketoprofen", "Piroxicam", "Meloxicam",

  // Antibiotics
  "Amoxicillin", "Augmentin", "Amoxiclav", "Azithromycin", "Zithromax", "Ciprofloxacin",
  "Cipro", "Levofloxacin", "Metronidazole", "Flagyl", "Doxycycline", "Clindamycin",
  "Cephalexin", "Cefuroxime", "Ceftriaxone", "Clarithromycin", "Erythromycin",
  "Trimethoprim", "Nitrofurantoin", "Penicillin", "Flucloxacillin", "Gentamicin",

  // Heart & Blood Pressure
  "Amlodipine", "Norvasc", "Lisinopril", "Enalapril", "Ramipril", "Losartan", "Valsartan",
  "Telmisartan", "Atenolol", "Metoprolol", "Bisoprolol", "Carvedilol", "Propranolol",
  "Nifedipine", "Diltiazem", "Verapamil", "Hydrochlorothiazide", "Furosemide", "Lasix",
  "Spironolactone", "Indapamide", "Digoxin", "Warfarin", "Clopidogrel", "Plavix",
  "Rivaroxaban", "Xarelto", "Apixaban", "Eliquis", "Enoxaparin", "Clexane",

  // Diabetes
  "Metformin", "Glucophage", "Glimepiride", "Amaryl", "Gliclazide", "Diamicron",
  "Sitagliptin", "Januvia", "Empagliflozin", "Jardiance", "Dapagliflozin", "Forxiga",
  "Insulin Glargine", "Lantus", "Insulin Aspart", "NovoRapid", "Insulin Lispro", "Humalog",
  "Pioglitazone", "Liraglutide", "Victoza", "Semaglutide", "Ozempic",

  // Cholesterol
  "Atorvastatin", "Lipitor", "Rosuvastatin", "Crestor", "Simvastatin", "Zocor",
  "Pravastatin", "Ezetimibe", "Zetia", "Fenofibrate", "Gemfibrozil",

  // Stomach & GI
  "Omeprazole", "Losec", "Esomeprazole", "Nexium", "Pantoprazole", "Lansoprazole",
  "Ranitidine", "Famotidine", "Antacid", "Gaviscon", "Domperidone", "Motilium",
  "Metoclopramide", "Ondansetron", "Zofran", "Loperamide", "Imodium", "Lactulose",
  "Bisacodyl", "Senna", "Mebeverine", "Duspatalin", "Sucralfate",

  // Respiratory
  "Salbutamol", "Ventolin", "Salmeterol", "Fluticasone", "Seretide",
  "Budesonide", "Symbicort", "Montelukast", "Singulair", "Theophylline",
  "Ipratropium", "Tiotropium", "Spiriva", "Prednisolone", "Dexamethasone",

  // Allergy
  "Cetirizine", "Zyrtec", "Loratadine", "Claritin", "Fexofenadine", "Telfast",
  "Desloratadine", "Aerius", "Chlorpheniramine", "Diphenhydramine", "Benadryl",
  "Hydroxyzine", "Promethazine", "Phenergan",

  // Mental Health
  "Sertraline", "Zoloft", "Fluoxetine", "Prozac", "Escitalopram", "Lexapro",
  "Paroxetine", "Paxil", "Citalopram", "Venlafaxine", "Effexor", "Duloxetine",
  "Cymbalta", "Amitriptyline", "Mirtazapine", "Bupropion", "Wellbutrin",
  "Alprazolam", "Xanax", "Diazepam", "Valium", "Lorazepam", "Clonazepam",
  "Quetiapine", "Seroquel", "Olanzapine", "Risperidone", "Aripiprazole",
  "Lithium", "Carbamazepine", "Tegretol", "Valproate", "Lamotrigine",

  // Thyroid
  "Levothyroxine", "Eltroxin", "Euthyrox", "Carbimazole", "Propylthiouracil",

  // Vitamins & Supplements
  "Vitamin D", "Vitamin D3", "Vitamin B12", "Vitamin C", "Folic Acid",
  "Iron", "Ferrous Sulfate", "Calcium", "Calcium Carbonate", "Zinc",
  "Magnesium", "Omega 3", "Fish Oil", "Multivitamin", "Vitamin B Complex",
  "Vitamin E", "Vitamin A", "Biotin", "Potassium",

  // Other Common
  "Prednisone", "Prednisolone", "Hydrocortisone", "Betamethasone",
  "Allopurinol", "Colchicine", "Methotrexate", "Hydroxychloroquine",
  "Sildenafil", "Viagra", "Tadalafil", "Cialis",
  "Tamsulosin", "Finasteride", "Dutasteride",
  "Gabapentin", "Pregabalin", "Lyrica",
  "Acyclovir", "Valacyclovir", "Fluconazole",
  "Permethrin", "Ivermectin",
  "Eye Drops", "Ear Drops",
];

export function searchMedications(query: string): string[] {
  if (!query || query.length < 2) return [];
  const lower = query.toLowerCase();
  return commonMedications
    .filter((med) => med.toLowerCase().includes(lower))
    .slice(0, 8);
}

export function isKnownMedication(name: string): boolean {
  return commonMedications.some(
    (med) => med.toLowerCase() === name.trim().toLowerCase()
  );
}
