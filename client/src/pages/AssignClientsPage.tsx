import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DashboardNav } from '@/components/DashboardNav';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

type User = {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  assignment?: {
    id: string;
    scope: string;
    status: string;
  };
};

type Assessment = {
  id: string;
  title: string;
  description: string;
};

export default function AssignClientsPage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const assessmentId = queryParams.get('assessmentId');

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>(assessmentId || '');
  const [clients, setClients] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scopeValues, setScopeValues] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (user?.role !== 'admin') {
      toast.error('You need admin privileges to access this page');
      navigate('/dashboard');
    } else {
      fetchAssessments();
      if (selectedAssessmentId) {
        fetchClients(selectedAssessmentId);
      }
    }
  }, [user, selectedAssessmentId]);

  const fetchAssessments = async () => {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select('id, title, description')
        .eq('is_active', true)
        .order('title');
      
      if (error) throw error;
      
      setAssessments(data || []);
    } catch (error) {
      console.error('Error fetching assessments:', error);
      toast.error('Failed to load assessments');
    }
  };

  const fetchClients = async (assessmentId: string) => {
    try {
      setIsLoading(true);
      
      const { data: clientsData, error: clientsError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, role, is_active')
        .eq('role', 'client')
        .eq('is_active', true)
        .order('last_name');
      
      if (clientsError) throw clientsError;
      
      if (!clientsData || clientsData.length === 0) {
        setClients([]);
        setIsLoading(false);
        return;
      }
      
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('assessment_assignments')
        .select('id, user_id, scope, status')
        .eq('assessment_id', assessmentId);
      
      if (assignmentsError) throw assignmentsError;
      
      const assignmentMap = (assignmentsData || []).reduce((map, assignment) => {
        map[assignment.user_id] = { 
          id: assignment.id, 
          scope: assignment.scope,
          status: assignment.status
        };
        return map;
      }, {} as { [key: string]: { id: string, scope: string, status: string } });
      
      const initialScopeValues = (assignmentsData || []).reduce((map, assignment) => {
        map[assignment.user_id] = assignment.scope;
        return map;
      }, {} as { [key: string]: string });
      
      setScopeValues(initialScopeValues);
      
      const clientsWithAssignments = clientsData.map(client => ({
        ...client,
        assignment: assignmentMap[client.id]
      }));
      
      setClients(clientsWithAssignments);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssessmentChange = (value: string) => {
    setSelectedAssessmentId(value);
    navigate(`/assign-clients?assessmentId=${value}`);
  };

  const handleScopeChange = (userId: string, value: string) => {
    setScopeValues({
      ...scopeValues,
      [userId]: value
    });
  };

  const toggleAssignment = async (client: User, isAssigned: boolean) => {
    try {
      if (isAssigned) {
        const { error } = await supabase
          .from('assessment_assignments')
          .delete()
          .eq('id', client.assignment?.id);
        
        if (error) throw error;
        
        toast.success(`Assessment unassigned from ${client.first_name} ${client.last_name}`);
        
        setClients(clients.map(c => 
          c.id === client.id ? { ...c, assignment: undefined } : c
        ));
        
        const newScopeValues = { ...scopeValues };
        delete newScopeValues[client.id];
        setScopeValues(newScopeValues);
      } else {
        const scope = scopeValues[client.id] || '';
        if (!scope.trim()) {
          toast.error('Scope is required');
          return;
        }
        
        const { data, error } = await supabase
          .from('assessment_assignments')
          .insert([
            { 
              assessment_id: selectedAssessmentId, 
              user_id: client.id,
              scope: scope,
              status: 'assigned',
              assigned_by: user!.id
            }
          ])
          .select('id, status')
          .single();
        
        if (error) throw error;
        
        toast.success(`Assessment assigned to ${client.first_name} ${client.last_name}`);
        
        setClients(clients.map(c => 
          c.id === client.id ? { ...c, assignment: { id: data.id, scope, status: data.status } } : c
        ));
      }
    } catch (error) {
      console.error('Error toggling assignment:', error);
      toast.error('Failed to update assignment');
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'assigned':
        return 'secondary';
      case 're-assigned':
        return 'secondary';
      case 'started':
        return 'default';
      case 'completed':
        return 'default';
      case 'rated':
        return 'outline';
      case 'closed':
        return 'default';
      default:
        return 'secondary';
    }
  };

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="flex h-screen">
      <DashboardNav />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto max-w-7xl p-6">
          <div className="flex items-center mb-6">
            <h1 className="text-2xl font-semibold">Assign Assessment to Clients</h1>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Select Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <Select 
                value={selectedAssessmentId} 
                onValueChange={handleAssessmentChange}
              >
                <SelectTrigger className="w-full md:w-[400px]">
                  <SelectValue placeholder="Select an assessment" />
                </SelectTrigger>
                <SelectContent>
                  {assessments.map(assessment => (
                    <SelectItem key={assessment.id} value={assessment.id}>
                      {assessment.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedAssessmentId ? (
            isLoading ? (
              <div className="text-center py-8">Loading clients...</div>
            ) : clients.length === 0 ? (
              <div className="text-center py-8">No active clients found</div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Clients ({clients.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Scope</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[100px] text-center">Assigned</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clients.map((client) => (
                        <TableRow key={client.id}>
                          <TableCell>
                            {client.first_name} {client.last_name}
                          </TableCell>
                          <TableCell>
                            <Input
                              placeholder="Enter scope..."
                              value={scopeValues[client.id] || ''}
                              onChange={(e) => handleScopeChange(client.id, e.target.value)}
                              className="max-w-md"
                            />
                          </TableCell>
                          <TableCell>
                            {client.assignment ? (
                              <Badge variant={getStatusBadgeColor(client.assignment.status)}>
                                {client.assignment.status}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">Not assigned</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {client.assignment || (scopeValues[client.id] && scopeValues[client.id].trim()) ? (
                              <Switch
                                checked={!!client.assignment}
                                onCheckedChange={() => toggleAssignment(client, !!client.assignment)}
                                disabled={isLoading}
                              />
                            ) : (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="inline-block cursor-not-allowed opacity-50">
                                      <Switch checked={false} disabled />
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>Enter a scope to enable assignment</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Please select an assessment to manage client assignments
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
