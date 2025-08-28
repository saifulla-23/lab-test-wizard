import { useState } from "react";
import { PatientsManagement } from "@/components/PatientsManagement";
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
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCategoriesUpdate = () => {
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
        
        <Tabs defaultValue="patients" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="management">Category Management</TabsTrigger>
            <TabsTrigger value="history">Patient History</TabsTrigger>
          </TabsList>

          <TabsContent value="patients" className="space-y-6">
            <PatientsManagement key={refreshKey} />
          </TabsContent>

          <TabsContent value="management">
            <CategoryManagement onCategoriesUpdate={handleCategoriesUpdate} />
          </TabsContent>

          <TabsContent value="history">
            <PatientHistory key={refreshKey} patient={null} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
