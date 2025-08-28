import { useState, useEffect, useRef } from "react";
import { Plus, Edit, Trash2, Save, X, ChevronDown, ChevronRight, Upload, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import * as XLSX from 'xlsx';

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface Test {
  id: string;
  name: string;
  category_id: string;
  code?: string;
  description?: string;
}

interface CategoryManagementProps {
  onCategoriesUpdate: () => void;
}

export const CategoryManagement = ({ onCategoriesUpdate }: CategoryManagementProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingTest, setEditingTest] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [newTest, setNewTest] = useState({ name: "", code: "", description: "", category_id: "" });
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddTest, setShowAddTest] = useState<string | null>(null);
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [editCategoryData, setEditCategoryData] = useState<{ id: string; name: string; description: string }>({ id: "", name: "", description: "" });
  const [editTestData, setEditTestData] = useState<{ id: string; name: string; code: string; description: string }>({ id: "", name: "", code: "", description: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
    fetchTests();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('custom_categories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching categories:', error);
      return;
    }
    setCategories(data || []);
  };

  const fetchTests = async () => {
    const { data, error } = await supabase
      .from('custom_tests')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching tests:', error);
      return;
    }
    setTests(data || []);
  };

  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('custom_categories')
      .insert([newCategory]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
      });
      return;
    }

    setNewCategory({ name: "", description: "" });
    setShowAddCategory(false);
    fetchCategories();
    onCategoriesUpdate();
    toast({
      title: "Success",
      description: "Category added successfully",
    });
  };

  const handleUpdateCategory = async () => {
    if (!editCategoryData.name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('custom_categories')
      .update({ name: editCategoryData.name, description: editCategoryData.description })
      .eq('id', editCategoryData.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
      return;
    }

    setEditingCategory(null);
    fetchCategories();
    onCategoriesUpdate();
    toast({
      title: "Success",
      description: "Category updated successfully",
    });
  };

  const handleAddTest = async (categoryId: string) => {
    if (!newTest.name.trim()) {
      toast({
        title: "Error",
        description: "Test name is required",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('custom_tests')
      .insert([{ ...newTest, category_id: categoryId }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add test",
        variant: "destructive",
      });
      return;
    }

    setNewTest({ name: "", code: "", description: "", category_id: "" });
    setShowAddTest(null);
    fetchTests();
    toast({
      title: "Success",
      description: "Test added successfully",
    });
  };

  const handleUpdateTest = async () => {
    if (!editTestData.name.trim()) {
      toast({
        title: "Error",
        description: "Test name is required",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('custom_tests')
      .update({ 
        name: editTestData.name, 
        code: editTestData.code, 
        description: editTestData.description 
      })
      .eq('id', editTestData.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update test",
        variant: "destructive",
      });
      return;
    }

    setEditingTest(null);
    fetchTests();
    toast({
      title: "Success",
      description: "Test updated successfully",
    });
  };

  const handleDeleteCategory = async (id: string) => {
    const { error } = await supabase
      .from('custom_categories')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
      return;
    }

    fetchCategories();
    fetchTests();
    onCategoriesUpdate();
    toast({
      title: "Success",
      description: "Category deleted successfully",
    });
  };

  const handleDeleteTest = async (id: string) => {
    const { error } = await supabase
      .from('custom_tests')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete test",
        variant: "destructive",
      });
      return;
    }

    fetchTests();
    toast({
      title: "Success",
      description: "Test deleted successfully",
    });
  };

  const getTestsForCategory = (categoryId: string) => {
    return tests.filter(test => test.category_id === categoryId);
  };

  const startEditCategory = (category: Category) => {
    setEditCategoryData({
      id: category.id,
      name: category.name,
      description: category.description || ""
    });
    setEditingCategory(category.id);
  };

  const startEditTest = (test: Test) => {
    setEditTestData({
      id: test.id,
      name: test.name,
      code: test.code || "",
      description: test.description || ""
    });
    setEditingTest(test.id);
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        'Category Name': 'Example Category 1',
        'Category Description': 'Description for category 1',
        'Test Name': 'Test 1',
        'Test Code': 'T001',
        'Test Description': 'Description for test 1'
      },
      {
        'Category Name': 'Example Category 1',
        'Category Description': 'Description for category 1',
        'Test Name': 'Test 2',
        'Test Code': 'T002',
        'Test Description': 'Description for test 2'
      },
      {
        'Category Name': 'Example Category 2',
        'Category Description': 'Description for category 2',
        'Test Name': 'Test 3',
        'Test Code': 'T003',
        'Test Description': 'Description for test 3'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Categories and Tests');
    XLSX.writeFile(workbook, 'lab_tests_template.xlsx');
    
    toast({
      title: "Success",
      description: "Template downloaded successfully",
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Process the uploaded data
      const categoryMap = new Map<string, string>();
      
      for (const row of jsonData as any[]) {
        const categoryName = row['Category Name']?.toString().trim();
        const categoryDescription = row['Category Description']?.toString().trim() || '';
        const testName = row['Test Name']?.toString().trim();
        const testCode = row['Test Code']?.toString().trim() || '';
        const testDescription = row['Test Description']?.toString().trim() || '';

        if (!categoryName || !testName) continue;

        // Create or get category
        let categoryId = categoryMap.get(categoryName);
        if (!categoryId) {
          const { data: categoryData, error: categoryError } = await supabase
            .from('custom_categories')
            .insert([{ name: categoryName, description: categoryDescription }])
            .select()
            .single();

          if (categoryError) {
            // Category might already exist, try to find it
            const { data: existingCategory } = await supabase
              .from('custom_categories')
              .select('id')
              .eq('name', categoryName)
              .single();
            
            categoryId = existingCategory?.id;
          } else {
            categoryId = categoryData.id;
          }
          
          if (categoryId) {
            categoryMap.set(categoryName, categoryId);
          }
        }

        // Create test if category exists
        if (categoryId) {
          await supabase
            .from('custom_tests')
            .insert([{
              name: testName,
              code: testCode,
              description: testDescription,
              category_id: categoryId
            }]);
        }
      }

      fetchCategories();
      fetchTests();
      onCategoriesUpdate();
      
      toast({
        title: "Success",
        description: "Excel file uploaded and processed successfully",
      });
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Error",
        description: "Failed to process Excel file",
        variant: "destructive",
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl bg-gradient-to-r from-medical-blue to-medical-green bg-clip-text text-transparent">
              Test Categories & Tests Management
            </CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={downloadTemplate}
                className="bg-medical-green hover:bg-medical-green/90 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
              <Button
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="bg-medical-blue hover:bg-medical-blue/90 text-white"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Excel
              </Button>
              <Button
                size="sm"
                onClick={() => setShowAddCategory(true)}
                className="bg-medical-blue hover:bg-medical-blue/90 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </CardHeader>
        <CardContent className="space-y-4">
          {showAddCategory && (
            <Card className="border-medical-blue/20">
              <CardContent className="p-4 space-y-3">
                <Input
                  placeholder="Category name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                />
                <Textarea
                  placeholder="Description (optional)"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddCategory}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowAddCategory(false)}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {categories.map((category) => (
            <Card key={category.id} className="border-medical-blue/20">
              <Collapsible
                open={openCategories.includes(category.id)}
                onOpenChange={() => toggleCategory(category.id)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="pb-3 cursor-pointer hover:bg-medical-blue-light/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {openCategories.includes(category.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <div>
                          <CardTitle className="text-lg text-medical-blue">{category.name}</CardTitle>
                          {category.description && (
                            <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button size="sm" variant="outline" onClick={() => startEditCategory(category)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteCategory(category.id)}
                          className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {editingCategory === category.id && (
                      <Card className="border-medical-green/20 mb-4">
                        <CardContent className="p-4 space-y-3">
                          <Input
                            placeholder="Category name"
                            value={editCategoryData.name}
                            onChange={(e) => setEditCategoryData({ ...editCategoryData, name: e.target.value })}
                          />
                          <Textarea
                            placeholder="Description (optional)"
                            value={editCategoryData.description}
                            onChange={(e) => setEditCategoryData({ ...editCategoryData, description: e.target.value })}
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleUpdateCategory}>
                              <Save className="h-4 w-4 mr-2" />
                              Update
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingCategory(null)}>
                              <X className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-md font-medium text-medical-green">Tests in this category</h4>
                        <Button
                          size="sm"
                          onClick={() => setShowAddTest(category.id)}
                          className="bg-medical-green hover:bg-medical-green/90 text-white"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Test
                        </Button>
                      </div>

                      {showAddTest === category.id && (
                        <Card className="border-medical-green/20">
                          <CardContent className="p-4 space-y-3">
                            <Input
                              placeholder="Test name"
                              value={newTest.name}
                              onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
                            />
                            <Input
                              placeholder="Test code (optional)"
                              value={newTest.code}
                              onChange={(e) => setNewTest({ ...newTest, code: e.target.value })}
                            />
                            <Textarea
                              placeholder="Description (optional)"
                              value={newTest.description}
                              onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleAddTest(category.id)}>
                                <Save className="h-4 w-4 mr-2" />
                                Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setShowAddTest(null)}>
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {getTestsForCategory(category.id).map((test) => (
                        <div key={test.id} className="border rounded-lg p-3">
                          {editingTest === test.id ? (
                            <Card className="border-medical-green/20">
                              <CardContent className="p-4 space-y-3">
                                <Input
                                  placeholder="Test name"
                                  value={editTestData.name}
                                  onChange={(e) => setEditTestData({ ...editTestData, name: e.target.value })}
                                />
                                <Input
                                  placeholder="Test code (optional)"
                                  value={editTestData.code}
                                  onChange={(e) => setEditTestData({ ...editTestData, code: e.target.value })}
                                />
                                <Textarea
                                  placeholder="Description (optional)"
                                  value={editTestData.description}
                                  onChange={(e) => setEditTestData({ ...editTestData, description: e.target.value })}
                                />
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={handleUpdateTest}>
                                    <Save className="h-4 w-4 mr-2" />
                                    Update
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => setEditingTest(null)}>
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{test.name}</div>
                                {test.code && <div className="text-sm text-medical-green">Code: {test.code}</div>}
                                {test.description && <div className="text-sm text-muted-foreground">{test.description}</div>}
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => startEditTest(test)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteTest(test.id)}
                                  className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {getTestsForCategory(category.id).length === 0 && (
                        <p className="text-muted-foreground text-center py-4">No tests in this category yet</p>
                      )}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}

          {categories.length === 0 && (
            <p className="text-muted-foreground text-center py-8">No categories created yet. Add your first category above!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};