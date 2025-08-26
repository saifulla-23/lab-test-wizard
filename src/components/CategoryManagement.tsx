import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  const [showAddTest, setShowAddTest] = useState(false);
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

  const handleAddTest = async () => {
    if (!newTest.name.trim() || !newTest.category_id) {
      toast({
        title: "Error",
        description: "Test name and category are required",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('custom_tests')
      .insert([newTest]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add test",
        variant: "destructive",
      });
      return;
    }

    setNewTest({ name: "", code: "", description: "", category_id: "" });
    setShowAddTest(false);
    fetchTests();
    toast({
      title: "Success",
      description: "Test added successfully",
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Categories Management */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg text-medical-blue">Test Categories</CardTitle>
            <Button
              size="sm"
              onClick={() => setShowAddCategory(true)}
              className="bg-medical-blue hover:bg-medical-blue/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
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
            <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">{category.name}</div>
                {category.description && (
                  <div className="text-sm text-muted-foreground">{category.description}</div>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDeleteCategory(category.id)}
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Tests Management */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg text-medical-green">Available Tests</CardTitle>
            <Button
              size="sm"
              onClick={() => setShowAddTest(true)}
              className="bg-medical-green hover:bg-medical-green/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Test
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {showAddTest && (
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
                <select
                  className="w-full p-2 border rounded-md"
                  value={newTest.category_id}
                  onChange={(e) => setNewTest({ ...newTest, category_id: e.target.value })}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <Textarea
                  placeholder="Description (optional)"
                  value={newTest.description}
                  onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddTest}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowAddTest(false)}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {tests.map((test) => {
            const category = categories.find(c => c.id === test.category_id);
            return (
              <div key={test.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{test.name}</div>
                  {test.code && <div className="text-sm text-medical-green">Code: {test.code}</div>}
                  {category && <div className="text-sm text-muted-foreground">Category: {category.name}</div>}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteTest(test.id)}
                  className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};