import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, Calendar, TestTube, Save, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Patient {
  id: string;
  patient_id: string;
  name: string;
  date_of_birth?: string;
  gender?: string;
  phone?: string;
  address?: string;
  assandha_data?: any;
  created_at: string;
}

interface TestCategory {
  id: string;
  name: string;
  description?: string;
}

interface Test {
  id: string;
  name: string;
  code?: string;
  description?: string;
  category_id?: string;
}

interface PatientTest {
  id: string;
  patient_id: string;
  tests: any;
  status: string;
  created_at: string;
  notes?: string;
}

export const PatientsManagement = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [categories, setCategories] = useState<TestCategory[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [patientTests, setPatientTests] = useState<PatientTest[]>([]);
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [newPatient, setNewPatient] = useState({
    patient_id: "",
    name: "",
    date_of_birth: "",
    gender: "",
    phone: "",
    address: ""
  });
  const [selectedPatientForTests, setSelectedPatientForTests] = useState<string>("");
  const [selectedTests, setSelectedTests] = useState<Test[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [patientsResult, categoriesResult, testsResult, patientTestsResult] = await Promise.all([
        supabase.from('patients').select('*').order('created_at', { ascending: false }),
        supabase.from('custom_categories').select('*').order('name'),
        supabase.from('custom_tests').select('*').order('name'),
        supabase.from('patient_test_selections').select('*').order('created_at', { ascending: false })
      ]);

      if (patientsResult.data) setPatients(patientsResult.data);
      if (categoriesResult.data) setCategories(categoriesResult.data);
      if (testsResult.data) setTests(testsResult.data);
      if (patientTestsResult.data) setPatientTests(patientTestsResult.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    }
  };

  const handleAddPatient = async () => {
    if (!newPatient.patient_id || !newPatient.name) {
      toast({
        title: "Error",
        description: "Patient ID and name are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('patients')
        .insert([newPatient])
        .select()
        .single();

      if (error) throw error;

      setPatients(prev => [data, ...prev]);
      setNewPatient({
        patient_id: "",
        name: "",
        date_of_birth: "",
        gender: "",
        phone: "",
        address: ""
      });
      setIsAddingPatient(false);
      
      toast({
        title: "Success",
        description: "Patient added successfully",
      });
    } catch (error) {
      console.error('Error adding patient:', error);
      toast({
        title: "Error",
        description: "Failed to add patient",
        variant: "destructive",
      });
    }
  };

  const handleAddTestToPatient = (test: Test) => {
    if (!selectedTests.some(t => t.id === test.id)) {
      setSelectedTests(prev => [...prev, test]);
    }
  };

  const handleRemoveTestFromPatient = (testId: string) => {
    setSelectedTests(prev => prev.filter(t => t.id !== testId));
  };

  const handleSaveTestsForPatient = async () => {
    if (!selectedPatientForTests || selectedTests.length === 0) {
      toast({
        title: "Error",
        description: "Please select a patient and tests",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('patient_test_selections')
        .insert([{
          patient_id: selectedPatientForTests,
          tests: selectedTests as any,
          status: 'pending'
        }]);

      if (error) throw error;

      setSelectedTests([]);
      setSelectedPatientForTests("");
      fetchData();
      
      toast({
        title: "Success",
        description: "Tests saved for patient",
      });
    } catch (error) {
      console.error('Error saving tests:', error);
      toast({
        title: "Error",
        description: "Failed to save tests",
        variant: "destructive",
      });
    }
  };

  const getTestsForCategory = (categoryId: string) => {
    return tests.filter(test => test.category_id === categoryId);
  };

  const getPatientTests = (patientId: string) => {
    return patientTests.filter(pt => pt.patient_id === patientId);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl bg-gradient-to-r from-medical-blue to-medical-green bg-clip-text text-transparent">
              Patients Management
            </CardTitle>
            <Dialog open={isAddingPatient} onOpenChange={setIsAddingPatient}>
              <DialogTrigger asChild>
                <Button className="bg-medical-blue hover:bg-medical-blue/90 text-white">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Patient
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Patient</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="patient_id">Patient ID</Label>
                    <Input
                      id="patient_id"
                      value={newPatient.patient_id}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, patient_id: e.target.value }))}
                      placeholder="Enter patient ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newPatient.name}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter patient name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={newPatient.date_of_birth}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, date_of_birth: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Input
                      id="gender"
                      value={newPatient.gender}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, gender: e.target.value }))}
                      placeholder="Enter gender"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={newPatient.phone}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={newPatient.address}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Enter address"
                    />
                  </div>
                  <Button onClick={handleAddPatient} className="w-full">
                    Add Patient
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Only patient management controls are available here.</p>
            <p>Use the Add Patient button above to create new patients.</p>
            <p>All patient histories are available in the Patient History section.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};