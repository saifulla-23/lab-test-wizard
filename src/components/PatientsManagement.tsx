import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, Calendar, TestTube, Save, Edit, Trash2, Copy, Plus, Minus } from "lucide-react";
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
  const [selectedTests, setSelectedTests] = useState<{ [patientId: string]: Test[] }>({});
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
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

  const handleAddTestToPatient = (patientId: string, test: Test) => {
    setSelectedTests(prev => {
      const patientTests = prev[patientId] || [];
      if (!patientTests.some(t => t.id === test.id)) {
        return { ...prev, [patientId]: [...patientTests, test] };
      }
      return prev;
    });
  };

  const handleRemoveTestFromPatient = (patientId: string, testId: string) => {
    setSelectedTests(prev => ({
      ...prev,
      [patientId]: (prev[patientId] || []).filter(t => t.id !== testId)
    }));
  };

  const handleSaveTestsForPatient = async (patientId: string) => {
    const patientTests = selectedTests[patientId] || [];
    if (patientTests.length === 0) {
      toast({
        title: "Error",
        description: "Please select tests for the patient",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('patient_test_selections')
        .insert([{
          patient_id: patientId,
          tests: patientTests as any,
          status: 'pending'
        }]);

      if (error) throw error;

      setSelectedTests(prev => ({ ...prev, [patientId]: [] }));
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

  const handleCopyPatientTests = (patientId: string) => {
    const patientTests = selectedTests[patientId] || [];
    const patient = patients.find(p => p.id === patientId);
    
    if (patientTests.length === 0) {
      toast({
        title: "Error",
        description: "No tests selected to copy",
        variant: "destructive",
      });
      return;
    }

    const categorizedTests = categories.reduce((acc, category) => {
      const categoryTests = patientTests.filter(test => test.category_id === category.id);
      if (categoryTests.length > 0) {
        acc[category.name] = categoryTests.map(test => `${test.name}${test.code ? ` (${test.code})` : ''}`);
      }
      return acc;
    }, {} as Record<string, string[]>);

    const copyText = `Patient: ${patient?.name} (${patient?.patient_id})
Date: ${new Date().toLocaleDateString()}

Test Categories and Tests:
${Object.entries(categorizedTests).map(([category, tests]) => 
  `${category}:\n${tests.map(test => `  - ${test}`).join('\n')}`
).join('\n\n')}`;

    navigator.clipboard.writeText(copyText).then(() => {
      toast({
        title: "Success",
        description: "Patient test details copied to clipboard",
      });
    }).catch(() => {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    });
  };

  const handleDeletePatient = async (patientId: string) => {
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', patientId);

      if (error) throw error;

      setPatients(prev => prev.filter(p => p.id !== patientId));
      setSelectedTests(prev => {
        const { [patientId]: removed, ...rest } = prev;
        return rest;
      });
      
      toast({
        title: "Success",
        description: "Patient deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast({
        title: "Error",
        description: "Failed to delete patient",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePatient = async () => {
    if (!editingPatient) return;

    try {
      const { error } = await supabase
        .from('patients')
        .update({
          patient_id: editingPatient.patient_id,
          name: editingPatient.name,
          date_of_birth: editingPatient.date_of_birth,
          gender: editingPatient.gender,
          phone: editingPatient.phone,
          address: editingPatient.address
        })
        .eq('id', editingPatient.id);

      if (error) throw error;

      setPatients(prev => prev.map(p => p.id === editingPatient.id ? editingPatient : p));
      setEditingPatient(null);
      
      toast({
        title: "Success",
        description: "Patient updated successfully",
      });
    } catch (error) {
      console.error('Error updating patient:', error);
      toast({
        title: "Error",
        description: "Failed to update patient",
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
      </Card>

      {/* Edit Patient Dialog */}
      {editingPatient && (
        <Dialog open={!!editingPatient} onOpenChange={() => setEditingPatient(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Patient</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit_patient_id">Patient ID</Label>
                <Input
                  id="edit_patient_id"
                  value={editingPatient.patient_id}
                  onChange={(e) => setEditingPatient(prev => prev ? { ...prev, patient_id: e.target.value } : null)}
                  placeholder="Enter patient ID"
                />
              </div>
              <div>
                <Label htmlFor="edit_name">Name</Label>
                <Input
                  id="edit_name"
                  value={editingPatient.name}
                  onChange={(e) => setEditingPatient(prev => prev ? { ...prev, name: e.target.value } : null)}
                  placeholder="Enter patient name"
                />
              </div>
              <div>
                <Label htmlFor="edit_date_of_birth">Date of Birth</Label>
                <Input
                  id="edit_date_of_birth"
                  type="date"
                  value={editingPatient.date_of_birth || ""}
                  onChange={(e) => setEditingPatient(prev => prev ? { ...prev, date_of_birth: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit_gender">Gender</Label>
                <Input
                  id="edit_gender"
                  value={editingPatient.gender || ""}
                  onChange={(e) => setEditingPatient(prev => prev ? { ...prev, gender: e.target.value } : null)}
                  placeholder="Enter gender"
                />
              </div>
              <div>
                <Label htmlFor="edit_phone">Phone</Label>
                <Input
                  id="edit_phone"
                  value={editingPatient.phone || ""}
                  onChange={(e) => setEditingPatient(prev => prev ? { ...prev, phone: e.target.value } : null)}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="edit_address">Address</Label>
                <Input
                  id="edit_address"
                  value={editingPatient.address || ""}
                  onChange={(e) => setEditingPatient(prev => prev ? { ...prev, address: e.target.value } : null)}
                  placeholder="Enter address"
                />
              </div>
              <Button onClick={handleUpdatePatient} className="w-full">
                Update Patient
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-xl bg-gradient-to-r from-medical-blue to-medical-green bg-clip-text text-transparent">
            Patients List
          </CardTitle>
        </CardHeader>
        <CardContent>
          {patients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No patients added yet.</p>
              <p>Use the Add Patient button above to create new patients.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {patients.map((patient) => (
                <Card key={patient.id} className="border-l-4 border-l-primary">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{patient.name}</h3>
                        <p className="text-sm text-muted-foreground">ID: {patient.patient_id}</p>
                        <p className="text-xs text-muted-foreground">
                          Added: {new Date(patient.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingPatient(patient)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeletePatient(patient.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {patient.date_of_birth && (
                          <div>
                            <span className="font-medium">DOB: </span>
                            {new Date(patient.date_of_birth).toLocaleDateString()}
                          </div>
                        )}
                        {patient.gender && (
                          <div>
                            <span className="font-medium">Gender: </span>
                            {patient.gender}
                          </div>
                        )}
                        {patient.phone && (
                          <div>
                            <span className="font-medium">Phone: </span>
                            {patient.phone}
                          </div>
                        )}
                        {patient.address && (
                          <div className="col-span-2">
                            <span className="font-medium">Address: </span>
                            {patient.address}
                          </div>
                        )}
                      </div>

                      {/* Test Categories and Selection */}
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-3">Test Categories & Selection</h4>
                        <Accordion type="single" collapsible className="w-full">
                          {categories.map((category) => {
                            const categoryTests = getTestsForCategory(category.id);
                            const selectedPatientTests = selectedTests[patient.id] || [];
                            
                            return (
                              <AccordionItem key={category.id} value={category.id}>
                                <AccordionTrigger>
                                  <div className="flex items-center justify-between w-full">
                                    <span>{category.name}</span>
                                    <Badge variant="secondary" className="ml-2">
                                      {categoryTests.length} tests
                                    </Badge>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-2">
                                    {categoryTests.map((test) => {
                                      const isSelected = selectedPatientTests.some(t => t.id === test.id);
                                      return (
                                        <div key={test.id} className="flex items-center justify-between p-2 border rounded">
                                          <div>
                                            <span className="font-medium">{test.name}</span>
                                            {test.code && (
                                              <Badge variant="outline" className="ml-2">
                                                {test.code}
                                              </Badge>
                                            )}
                                            {test.description && (
                                              <p className="text-sm text-muted-foreground mt-1">
                                                {test.description}
                                              </p>
                                            )}
                                          </div>
                                          <Button
                                            size="sm"
                                            variant={isSelected ? "destructive" : "default"}
                                            onClick={() => 
                                              isSelected 
                                                ? handleRemoveTestFromPatient(patient.id, test.id)
                                                : handleAddTestToPatient(patient.id, test)
                                            }
                                          >
                                            {isSelected ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                          </Button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            );
                          })}
                        </Accordion>
                      </div>

                      {/* Selected Tests Summary and Actions */}
                      {selectedTests[patient.id] && selectedTests[patient.id].length > 0 && (
                        <div className="border-t pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium">
                              Selected Tests ({selectedTests[patient.id].length})
                            </h4>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCopyPatientTests(patient.id)}
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Details
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleSaveTestsForPatient(patient.id)}
                              >
                                <Save className="h-4 w-4 mr-2" />
                                Save Tests
                              </Button>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {selectedTests[patient.id].map((test) => (
                              <Badge key={test.id} variant="secondary">
                                {test.name}
                                {test.code && ` (${test.code})`}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};