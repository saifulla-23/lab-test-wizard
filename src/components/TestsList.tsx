import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LabTest } from "@/data/labTests";
import { Plus, FileText } from "lucide-react";

interface TestsListProps {
  tests: LabTest[];
  selectedTests: LabTest[];
  onSelectTest: (test: LabTest) => void;
}

export const TestsList = ({ tests, selectedTests, onSelectTest }: TestsListProps) => {
  const isSelected = (test: LabTest) => selectedTests.some(selected => selected.id === test.id);

  return (
    <Card className="shadow-card border-medical-blue/20">
      <CardHeader className="bg-medical-blue-light/30 border-b border-medical-blue/20">
        <CardTitle className="flex items-center gap-2 text-medical-blue">
          <FileText className="h-5 w-5" />
          Available Tests
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {tests.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Select a category to view available tests
            </p>
          ) : (
            tests.map((test) => (
              <div
                key={test.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-medical-blue-light/10 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground">{test.name}</span>
                    {test.code && (
                      <Badge variant="secondary" className="text-xs">
                        {test.code}
                      </Badge>
                    )}
                  </div>
                  {test.description && (
                    <p className="text-sm text-muted-foreground">{test.description}</p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant={isSelected(test) ? "secondary" : "default"}
                  onClick={() => onSelectTest(test)}
                  disabled={isSelected(test)}
                  className="ml-3 shrink-0"
                >
                  {isSelected(test) ? "Added" : <Plus className="h-4 w-4" />}
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};