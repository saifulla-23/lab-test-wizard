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

// Only custom categories and tests - no static/inborn tests
export const labTestsDatabase: LabTest[] = [];

// Only custom categories - no static ones
export const getAllCategories = (customCategories: CustomCategory[] = []): string[] => {
  return customCategories.map(c => c.name).sort();
};

// Only custom tests
export const getAllTestsByCategory = (category: string, customTests: CustomTest[] = [], customCategories: CustomCategory[] = []): LabTest[] => {
  const categoryObj = customCategories.find(c => c.name === category);
  return categoryObj 
    ? customTests.filter(t => t.category_id === categoryObj.id).map(t => ({
        id: t.id,
        name: t.name,
        category: category,
        code: t.code,
        description: t.description
      }))
    : [];
};