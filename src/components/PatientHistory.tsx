import { useState, useEffect } from "react";
import { Calendar, FileText, User, Edit, Trash2, Save, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
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
  patient?: Patient | null;
}

export const PatientHistory = ({ patient }: PatientHistoryProps) => {
  const [history, setHistory] = useState<TestSelection[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingRecord, setEditingRecord] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ status: string; notes: string }>({ status: "", notes: "" });
  const { toast } = useToast();

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

  const handleUpdateRecord = async () => {
    if (!editingRecord) return;

    try {
      const { error } = await supabase
        .from('patient_test_selections')
        .update({
          status: editData.status,
          notes: editData.notes
        })
        .eq('id', editingRecord);

      if (error) throw error;

      setEditingRecord(null);
      fetchPatientHistory();
      toast({
        title: "Success",
        description: "Test record updated successfully",
      });
    } catch (error) {
      console.error('Error updating record:', error);
      toast({
        title: "Error",
        description: "Failed to update record",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    try {
      const { error } = await supabase
        .from('patient_test_selections')
        .delete()
        .eq('id', recordId);

      if (error) throw error;

      fetchPatientHistory();
      toast({
        title: "Success",
        description: "Test record deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting record:', error);
      toast({
        title: "Error",
        description: "Failed to delete record",
        variant: "destructive",
      });
    }
  };

  const startEditRecord = (record: TestSelection) => {
    setEditData({
      status: record.status,
      notes: record.notes || ""
    });
    setEditingRecord(record.id);
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
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={record.status === 'completed' ? 'default' : 'secondary'}
                        className={record.status === 'completed' ? 'bg-medical-green' : ''}
                      >
                        {record.status}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => startEditRecord(record)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteRecord(record.id)}
                        className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {editingRecord === record.id ? (
                    <div className="space-y-3 p-3 bg-muted rounded">
                      <div>
                        <label className="text-sm font-medium">Status</label>
                        <Select value={editData.status} onValueChange={(value) => setEditData({...editData, status: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Notes</label>
                        <Textarea
                          value={editData.notes}
                          onChange={(e) => setEditData({...editData, notes: e.target.value})}
                          placeholder="Add notes..."
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleUpdateRecord}>
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingRecord(null)}>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
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
                    </>
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