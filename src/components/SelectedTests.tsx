import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LabTest } from "@/data/labTests";
import { X, ShoppingCart, Download } from "lucide-react";

interface SelectedTestsProps {
  selectedTests: LabTest[];
  onRemoveTest: (test: LabTest) => void;
  onExport?: () => void;
}

export const SelectedTests = ({ selectedTests, onRemoveTest, onExport }: SelectedTestsProps) => {
  return (
    <Card className="shadow-card border-medical-pink-accent/30">
      <CardHeader className="bg-medical-pink border-b border-medical-pink-accent/30">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-medical-green">
            <ShoppingCart className="h-5 w-5" />
            Selected Tests ({selectedTests.length})
          </div>
          {selectedTests.length > 0 && onExport && (
            <Button
              size="sm"
              variant="outline"
              onClick={onExport}
              className="border-medical-green text-medical-green hover:bg-medical-green hover:text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {selectedTests.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No tests selected yet</p>
              <p className="text-sm text-muted-foreground">Add tests from the available list</p>
            </div>
          ) : (
            selectedTests.map((test) => (
              <div
                key={test.id}
                className="flex items-center justify-between p-3 rounded-lg bg-medical-pink border border-medical-pink-accent/30"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground">{test.name}</span>
                    {test.code && (
                      <Badge variant="outline" className="text-xs border-medical-green text-medical-green">
                        {test.code}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {test.category}
                    </Badge>
                    {test.description && (
                      <span className="text-sm text-muted-foreground">{test.description}</span>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemoveTest(test)}
                  className="ml-3 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};