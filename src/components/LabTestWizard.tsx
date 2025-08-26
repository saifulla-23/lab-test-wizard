import { useState } from "react";
import { CategorySelector } from "./CategorySelector";
import { TestsList } from "./TestsList";
import { SelectedTests } from "./SelectedTests";
import { LabTest, getTestsByCategory } from "@/data/labTests";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, RotateCcw } from "lucide-react";

export const LabTestWizard = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedTests, setSelectedTests] = useState<LabTest[]>([]);
  const { toast } = useToast();

  const availableTests = selectedCategory ? getTestsByCategory(selectedCategory) : [];

  const handleSelectTest = (test: LabTest) => {
    if (!selectedTests.some(selected => selected.id === test.id)) {
      setSelectedTests(prev => [...prev, test]);
      toast({
        title: "Test Added",
        description: `${test.name} has been added to your selection.`,
      });
    }
  };

  const handleRemoveTest = (test: LabTest) => {
    setSelectedTests(prev => prev.filter(selected => selected.id !== test.id));
    toast({
      title: "Test Removed",
      description: `${test.name} has been removed from your selection.`,
      variant: "destructive",
    });
  };

  const handleClearAll = () => {
    setSelectedTests([]);
    toast({
      title: "All Tests Cleared",
      description: "Your test selection has been cleared.",
      variant: "destructive",
    });
  };

  const handleExport = () => {
    const exportData = selectedTests.map(test => ({
      name: test.name,
      code: test.code,
      category: test.category,
      description: test.description
    }));
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lab-tests-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Tests Exported",
      description: `${selectedTests.length} tests exported successfully.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-2xl bg-gradient-to-r from-medical-blue to-medical-green bg-clip-text text-transparent">
            Lab Test Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <CategorySelector
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
          
          {selectedTests.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCategory("")}
                className="border-muted-foreground text-muted-foreground hover:bg-muted"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Category
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator className="my-6" />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TestsList
          tests={availableTests}
          selectedTests={selectedTests}
          onSelectTest={handleSelectTest}
        />
        
        <SelectedTests
          selectedTests={selectedTests}
          onRemoveTest={handleRemoveTest}
          onExport={selectedTests.length > 0 ? handleExport : undefined}
        />
      </div>

      {/* Summary Stats */}
      {selectedTests.length > 0 && (
        <Card className="shadow-card bg-gradient-to-r from-medical-blue-light/20 to-medical-green-light/20">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-medical-blue">{selectedTests.length}</div>
                <div className="text-sm text-muted-foreground">Total Tests</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-medical-green">
                  {new Set(selectedTests.map(test => test.category)).size}
                </div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-medical-blue">
                  {selectedTests.filter(test => test.category === 'Chemistry').length}
                </div>
                <div className="text-sm text-muted-foreground">Chemistry</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-medical-green">
                  {selectedTests.filter(test => test.category === 'Hematology').length}
                </div>
                <div className="text-sm text-muted-foreground">Hematology</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};