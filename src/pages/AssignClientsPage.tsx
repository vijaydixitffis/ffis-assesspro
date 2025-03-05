import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/layout/Header';

  // Function to get the appropriate badge color based on status
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ASSIGNED':
        return 'secondary';
      case 'RE-ASSIGNED':
        return 'secondary';
      case 'STARTED':
        return 'primary';
      case 'COMPLETED':
        return 'success';
      case 'RATED':
        return 'warning';
      case 'CLOSED':
        return 'default';
      default:
        return 'secondary';
    }
  };

// Function to get the status text without any special formatting
const getStatusDisplay = (status: string) => {
  return status;
};

const AssignClientsPage = () => {
  const [assessments, setAssessments] = useState([]);
  const [clients, setClients] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState('');
  const [selectedAssessmentTitle, setSelectedAssessmentTitle] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssessments();
    fetchClients();
    fetchAssignments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select('id, title');
      if (error) {
        throw error;
      }
      setAssessments(data);
    } catch (error) {
      console.error("Error fetching assessments:", error);
      toast.error("Failed to fetch assessments.");
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, first_name, last_name, email');
      if (error) {
        throw error;
      }
      setClients(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast.error("Failed to fetch clients.");
    }
  };

  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('client_assessments')
        .select('id, client_id, assessment_id, status');
      if (error) {
        throw error;
      }
      setAssignments(data);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      toast.error("Failed to fetch assignments.");
    }
  };

  const openAssignDialog = (client) => {
    setSelectedClient(client);
    setAssignDialogOpen(true);
    const assessment = assessments.find(a => a.id.toString() === selectedAssessment);
    setSelectedAssessmentTitle(assessment ? assessment.title : '');
  };

  const assignAssessment = async () => {
    if (!selectedAssessment || !selectedClient) {
      toast.error("Please select an assessment and a client.");
      return;
    }

    setAssigning(true);
    try {
      const { data, error } = await supabase
        .from('client_assessments')
        .insert([
          { 
            client_id: selectedClient.id, 
            assessment_id: parseInt(selectedAssessment),
            status: 'ASSIGNED'
          }
        ]);

      if (error) {
        throw error;
      }

      fetchAssignments();
      setAssignDialogOpen(false);
      toast.success("Assessment assigned successfully!");
    } catch (error) {
      console.error("Error assigning assessment:", error);
      toast.error("Failed to assign assessment.");
    } finally {
      setAssigning(false);
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6">Assign Assessments to Clients</h1>
        
        {/* Assessment selector */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Select Assessment</h2>
          <Select value={selectedAssessment} onValueChange={setSelectedAssessment}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Select an assessment" />
            </SelectTrigger>
            <SelectContent>
              {assessments.map((assessment) => (
                <SelectItem key={assessment.id} value={assessment.id.toString()}>
                  {assessment.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Clients table */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Clients</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => {
                const assignment = assignments.find(
                  (a) => a.client_id === client.id && a.assessment_id === parseInt(selectedAssessment)
                );
                
                return (
                  <TableRow key={client.id}>
                    <TableCell>{client.first_name} {client.last_name}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>
                      {assignment && (
                        <Badge variant="default">
                          {getStatusDisplay(assignment.status)}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {assignment ? (
                        <Button variant="outline" size="sm" disabled>
                          Already Assigned
                        </Button>
                      ) : (
                        <Button 
                          variant="default" 
                          size="sm" 
                          onClick={() => openAssignDialog(client)}
                          disabled={!selectedAssessment}
                        >
                          Assign
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        {/* Assignment dialog */}
        <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Assessment</DialogTitle>
            </DialogHeader>
            <p>
              Are you sure you want to assign {selectedAssessmentTitle} to {selectedClient?.first_name} {selectedClient?.last_name}?
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={assignAssessment} disabled={assigning}>
                {assigning ? 'Assigning...' : 'Assign'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default AssignClientsPage;
