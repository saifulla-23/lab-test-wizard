import { LabTestWizard } from "@/components/LabTestWizard";
import { Stethoscope, FlaskConical } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-medical-blue-light/10 to-medical-green-light/10">
      {/* Header */}
      <header className="bg-gradient-to-r from-medical-blue to-medical-green text-white shadow-medical">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-8 w-8" />
              <FlaskConical className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Lab Test Wizard</h1>
              <p className="text-white/80">Professional Laboratory Test Selection System</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <LabTestWizard />
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-card border-t border-border">
        <div className="container mx-auto px-4 py-4 text-center text-muted-foreground">
          <p>Professional Lab Test Management System • Built for Medical Excellence</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
