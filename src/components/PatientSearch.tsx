import { useState, useEffect } from "react";
import { Search, User, Calendar, Phone, MapPin, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Patient {
  id: string;
  patient_id: string;
  name: string;
  date_of_birth?: string;
  gender?: string;
  phone?: string;
  address?: string;
  assandha_data?: any;
  created_at?: string;
  updated_at?: string;
}

interface PatientSearchProps {
  onPatientSelect: (patient: Patient) => void;
  selectedPatient?: Patient | null;
}

export const PatientSearch = ({ onPatientSelect, selectedPatient }: PatientSearchProps) => {
  const [patientId, setPatientId] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [latestTestDate, setLatestTestDate] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    fetchRecentPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      fetchLatestTestDate(selectedPatient.id);
    }
  }, [selectedPatient]);

  const fetchRecentPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      setRecentPatients(data || []);
    } catch (error) {
      console.error('Error fetching recent patients:', error);
    }
  };

  const fetchLatestTestDate = async (patientId: string) => {
    try {
      const { data, error } = await supabase
        .from('patient_test_selections')
        .select('created_at')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        setLatestTestDate(new Date(data.created_at).toLocaleDateString());
      } else {
        setLatestTestDate("No previous tests");
      }
    } catch (error) {
      console.error('Error fetching latest test date:', error);
      setLatestTestDate("Error loading date");
    }
  };

  const fetchFromAssandha = async (id: string) => {
    // Mock Assandha API response - replace with actual API call
    return {
      patient_id: id,
      name: `Patient ${id}`,
      date_of_birth: "1990-01-01",
      gender: "Male",
      phone: "+960 123-4567",
      address: "Malé, Maldives",
      assandha_data: {
        insurance_status: "active",
        policy_number: `ASS${id}`,
        coverage_type: "full"
      }
    };
  };

  const handleSearch = async () => {
    if (!patientId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a patient ID",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // First check if patient exists in our database
      const { data: existingPatient, error } = await supabase
        .from('patients')
        .select('*')
        .eq('patient_id', patientId.trim())
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (existingPatient) {
        setSearchResults([existingPatient]);
        onPatientSelect(existingPatient);
      } else {
        // Fetch from Assandha portal
        const assandhaData = await fetchFromAssandha(patientId.trim());
        
        // Save to our database
        const { data: newPatient, error: insertError } = await supabase
          .from('patients')
          .insert([assandhaData])
          .select()
          .single();

        if (insertError) throw insertError;

        setSearchResults([newPatient]);
        onPatientSelect(newPatient);
        
        toast({
          title: "Patient Found",
          description: "Patient data fetched from Assandha portal and saved.",
        });
      }
    } catch (error) {
      console.error('Error searching patient:', error);
      toast({
        title: "Error",
        description: "Failed to search patient. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-xl bg-gradient-to-r from-medical-blue to-medical-green bg-clip-text text-transparent">
          Patient Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Enter Patient ID (e.g., A123456)"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              onKeyPress={handleKeyPress}
              className="border-medical-blue/20 focus:ring-medical-blue"
            />
          </div>
          <Button 
            onClick={handleSearch}
            disabled={loading}
            className="bg-medical-blue hover:bg-medical-blue/90 text-white"
          >
            <Search className="h-4 w-4 mr-2" />
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>

        {!selectedPatient && recentPatients.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Recent Patients
            </h4>
            <div className="grid gap-2">
              {recentPatients.map((patient) => (
                <Card 
                  key={patient.id} 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => {
                    setPatientId(patient.patient_id);
                    onPatientSelect(patient);
                  }}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{patient.name}</div>
                        <div className="text-xs text-muted-foreground">ID: {patient.patient_id}</div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {new Date(patient.updated_at || patient.created_at).toLocaleDateString()}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {selectedPatient && (
          <Card className="bg-gradient-to-r from-medical-blue-light/10 to-medical-green-light/10">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg text-medical-blue">
                    {selectedPatient.name}
                  </h3>
                  <Badge variant="secondary" className="bg-medical-green/20 text-medical-green">
                    ID: {selectedPatient.patient_id}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {selectedPatient.date_of_birth && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-medical-blue" />
                      <span>DOB: {new Date(selectedPatient.date_of_birth).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  {selectedPatient.gender && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-medical-blue" />
                      <span>Gender: {selectedPatient.gender}</span>
                    </div>
                  )}
                  
                  {selectedPatient.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-medical-blue" />
                      <span>{selectedPatient.phone}</span>
                    </div>
                  )}
                  
                  {selectedPatient.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-medical-blue" />
                      <span>{selectedPatient.address}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-medical-blue" />
                    <span>Last Test: {latestTestDate}</span>
                  </div>
                </div>

                {selectedPatient.assandha_data && (
                  <div className="mt-3 p-3 bg-card rounded-lg border">
                    <h4 className="font-medium text-sm text-medical-green mb-2">Assandha Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      <div>Status: <span className="font-medium">{selectedPatient.assandha_data.insurance_status}</span></div>
                      <div>Policy: <span className="font-medium">{selectedPatient.assandha_data.policy_number}</span></div>
                      <div>Coverage: <span className="font-medium">{selectedPatient.assandha_data.coverage_type}</span></div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};