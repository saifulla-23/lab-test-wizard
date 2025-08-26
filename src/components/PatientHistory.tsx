import { useState, useEffect } from "react";
import { Calendar, FileText, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface Patient {
  id: string;
  patient_id: string;
  name: string;
}

interface TestSelection {
  id: string;
  selection_date: string;
  tests: any;
  status: string;
  notes?: string;
}

interface PatientHistoryProps {
  patient: Patient | null;
}

export const PatientHistory = ({ patient }: PatientHistoryProps) => {
  const [history, setHistory] = useState<TestSelection[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (patient) {
      fetchPatientHistory();
    }
  }, [patient]);

  const fetchPatientHistory = async () => {
    if (!patient) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('patient_test_selections')
        .select('*')
        .eq('patient_id', patient.id)
        .order('selection_date', { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching patient history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!patient) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg text-medical-blue">Patient History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Select a patient to view their test history
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-lg text-medical-blue flex items-center gap-2">
          <User className="h-5 w-5" />
          {patient.name} - Test History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center py-4">Loading history...</p>
        ) : history.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No test history found for this patient
          </p>
        ) : (
          <div className="space-y-4">
            {history.map((record) => (
              <Card key={record.id} className="border-l-4 border-l-medical-blue">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-medical-blue" />
                      <span className="font-medium">
                        {new Date(record.selection_date).toLocaleDateString()}
                      </span>
                    </div>
                    <Badge 
                      variant={record.status === 'completed' ? 'default' : 'secondary'}
                      className={record.status === 'completed' ? 'bg-medical-green' : ''}
                    >
                      {record.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-medical-green" />
                      <span className="font-medium">Tests Ordered:</span>
                    </div>
                    <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-1 text-sm">
                      {Array.isArray(record.tests) ? record.tests.map((test: any, index: number) => (
                        <div key={index} className="text-muted-foreground">
                          • {test.name} {test.code && `(${test.code})`}
                        </div>
                      )) : (
                        <div className="text-muted-foreground">No tests data available</div>
                      )}
                    </div>
                  </div>

                  {record.notes && (
                    <div className="mt-3 p-2 bg-muted rounded text-sm">
                      <strong>Notes:</strong> {record.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};