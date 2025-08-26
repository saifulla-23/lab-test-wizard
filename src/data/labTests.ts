// Lab test database
export interface LabTest {
  id: string;
  name: string;
  category: string;
  code?: string;
  description?: string;
}

export interface CustomCategory {
  id: string;
  name: string;
  description?: string;
}

export interface CustomTest {
  id: string;
  name: string;
  category_id: string;
  code?: string;
  description?: string;
}

export const labTestsDatabase: LabTest[] = [
  // Hematology
  { id: "h1", name: "Complete Blood Count (CBC)", category: "Hematology", code: "CBC", description: "Full blood cell analysis" },
  { id: "h2", name: "Hemoglobin", category: "Hematology", code: "HGB", description: "Blood oxygen carrier protein" },
  { id: "h3", name: "Hematocrit", category: "Hematology", code: "HCT", description: "Percentage of red blood cells" },
  { id: "h4", name: "White Blood Cell Count", category: "Hematology", code: "WBC", description: "Infection fighting cells" },
  { id: "h5", name: "Platelet Count", category: "Hematology", code: "PLT", description: "Blood clotting cells" },
  { id: "h6", name: "ESR (Erythrocyte Sedimentation Rate)", category: "Hematology", code: "ESR", description: "Inflammation marker" },

  // Chemistry
  { id: "c1", name: "Basic Metabolic Panel", category: "Chemistry", code: "BMP", description: "Essential body chemistry" },
  { id: "c2", name: "Comprehensive Metabolic Panel", category: "Chemistry", code: "CMP", description: "Extended body chemistry" },
  { id: "c3", name: "Lipid Panel", category: "Chemistry", code: "LIPID", description: "Cholesterol and triglycerides" },
  { id: "c4", name: "Liver Function Tests", category: "Chemistry", code: "LFT", description: "Liver enzyme levels" },
  { id: "c5", name: "Kidney Function Tests", category: "Chemistry", code: "KFT", description: "Creatinine and BUN" },
  { id: "c6", name: "Thyroid Function Tests", category: "Chemistry", code: "TFT", description: "TSH, T3, T4 levels" },
  { id: "c7", name: "Glucose (Fasting)", category: "Chemistry", code: "FBS", description: "Blood sugar level" },
  { id: "c8", name: "HbA1c", category: "Chemistry", code: "A1C", description: "3-month glucose average" },

  // Immunology
  { id: "i1", name: "C-Reactive Protein", category: "Immunology", code: "CRP", description: "Inflammation marker" },
  { id: "i2", name: "Rheumatoid Factor", category: "Immunology", code: "RF", description: "Autoimmune marker" },
  { id: "i3", name: "Antinuclear Antibodies", category: "Immunology", code: "ANA", description: "Autoimmune screening" },
  { id: "i4", name: "Immunoglobulin Panel", category: "Immunology", code: "IG", description: "Antibody levels" },
  { id: "i5", name: "Complement C3/C4", category: "Immunology", code: "C3C4", description: "Immune system proteins" },

  // Microbiology
  { id: "m1", name: "Blood Culture", category: "Microbiology", code: "BC", description: "Bacterial infection screening" },
  { id: "m2", name: "Urine Culture", category: "Microbiology", code: "UC", description: "Urinary tract infection" },
  { id: "m3", name: "Throat Culture", category: "Microbiology", code: "TC", description: "Throat infection screening" },
  { id: "m4", name: "Stool Culture", category: "Microbiology", code: "SC", description: "Intestinal infection screening" },
  { id: "m5", name: "Gram Stain", category: "Microbiology", code: "GRAM", description: "Bacterial identification" },

  // Endocrinology
  { id: "e1", name: "Insulin Level", category: "Endocrinology", code: "INS", description: "Insulin hormone level" },
  { id: "e2", name: "Cortisol", category: "Endocrinology", code: "CORT", description: "Stress hormone" },
  { id: "e3", name: "Growth Hormone", category: "Endocrinology", code: "GH", description: "Growth regulation hormone" },
  { id: "e4", name: "Testosterone", category: "Endocrinology", code: "TEST", description: "Male hormone level" },
  { id: "e5", name: "Estrogen", category: "Endocrinology", code: "EST", description: "Female hormone level" },

  // Cardiology
  { id: "card1", name: "Troponin I", category: "Cardiology", code: "TNI", description: "Heart attack marker" },
  { id: "card2", name: "CK-MB", category: "Cardiology", code: "CKMB", description: "Heart muscle enzyme" },
  { id: "card3", name: "BNP", category: "Cardiology", code: "BNP", description: "Heart failure marker" },
  { id: "card4", name: "D-Dimer", category: "Cardiology", code: "DDIM", description: "Blood clot marker" },

  // Toxicology
  { id: "t1", name: "Drug Screen (Urine)", category: "Toxicology", code: "UDS", description: "Illegal drug detection" },
  { id: "t2", name: "Alcohol Level", category: "Toxicology", code: "ETOH", description: "Blood alcohol content" },
  { id: "t3", name: "Heavy Metals Panel", category: "Toxicology", code: "HM", description: "Lead, mercury detection" },
  { id: "t4", name: "Therapeutic Drug Monitoring", category: "Toxicology", code: "TDM", description: "Medication levels" }
];

export const getCategories = (): string[] => {
  return Array.from(new Set(labTestsDatabase.map(test => test.category))).sort();
};

export const getTestsByCategory = (category: string): LabTest[] => {
  return labTestsDatabase.filter(test => test.category === category);
};

// Combine static and custom categories
export const getAllCategories = (customCategories: CustomCategory[] = []): string[] => {
  const staticCategories = getCategories();
  const customCategoryNames = customCategories.map(c => c.name);
  return [...staticCategories, ...customCategoryNames].sort();
};

// Combine static and custom tests
export const getAllTestsByCategory = (category: string, customTests: CustomTest[] = [], customCategories: CustomCategory[] = []): LabTest[] => {
  // Get static tests
  const staticTests = getTestsByCategory(category);
  
  // Get custom tests for this category
  const categoryObj = customCategories.find(c => c.name === category);
  const customTestsForCategory = categoryObj 
    ? customTests.filter(t => t.category_id === categoryObj.id).map(t => ({
        id: t.id,
        name: t.name,
        category: category,
        code: t.code,
        description: t.description
      }))
    : [];
  
  return [...staticTests, ...customTestsForCategory];
};