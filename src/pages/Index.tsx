import { useState } from "react";
import { LabTestWizard } from "@/components/LabTestWizard";
import { PatientSearch } from "@/components/PatientSearch";
import { CategoryManagement } from "@/components/CategoryManagement";
import { PatientHistory } from "@/components/PatientHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Patient {
  id: string;
  patient_id: string;
  name: string;
  date_of_birth?: string;
  gender?: string;
  phone?: string;
  address?: string;
  assandha_data?: any;
}

const Index = () => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCategoriesUpdate = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleTestsSaved = () => {
    // Force refresh of patient history
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue-light to-medical-green-light p-4">
      <div className="container mx-auto max-w-7xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-medical-blue to-medical-green bg-clip-text text-transparent mb-2">
            Laboratory Test Management System
          </h1>
          <p className="text-lg text-muted-foreground">
            Professional lab test selection and management for healthcare assistants
          </p>
        </header>
        
        <Tabs defaultValue="tests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tests">Lab Test Selection</TabsTrigger>
            <TabsTrigger value="management">Category Management</TabsTrigger>
            <TabsTrigger value="history">Patient History</TabsTrigger>
          </TabsList>

          <TabsContent value="tests" className="space-y-6">
            <PatientSearch 
              onPatientSelect={setSelectedPatient} 
              selectedPatient={selectedPatient}
            />
            <LabTestWizard 
              key={refreshKey}
              patient={selectedPatient} 
              onSaveTests={handleTestsSaved}
            />
          </TabsContent>

          <TabsContent value="management">
            <CategoryManagement onCategoriesUpdate={handleCategoriesUpdate} />
          </TabsContent>

          <TabsContent value="history">
            <PatientHistory key={refreshKey} patient={selectedPatient} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
