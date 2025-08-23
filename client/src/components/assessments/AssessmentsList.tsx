import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Edit, BookOpen, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useAuth } from '@/contexts/auth';

interface Assessment {
  id: string;
  title: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

interface AssessmentsListProps {
  onEdit: (assessment: Assessment) => void;
}

export default function AssessmentsList({ onEdit }: AssessmentsListProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [scopeValues, setScopeValues] = useState<{ [key: string]: string }>({});
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    fetchAssessments();
  }, []);

  // Reset to first page when page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);

  useEffect(() => {
    if (isAssigning && selectedAssessment) {
      fetchClients(selectedAssessment.id);
    } else {
      setClients([]);
      setScopeValues({});
      setSearch('');
    }
  }, [isAssigning, selectedAssessment]);

  // Calculate pagination
  const totalRecords = assessments.length;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedAssessments = assessments.slice(startIndex, endIndex);
  const startRecord = totalRecords > 0 ? startIndex + 1 : 0;
  const endRecord = Math.min(endIndex, totalRecords);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: string) => {
    setPageSize(Number(size));
  };

  const fetchAssessments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .order('title');
      
      if (error) throw error;
      
      setAssessments(data || []);
    } catch (error) {
      console.error('Error fetching assessments:', error);
      toast.error('Failed to load assessments');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClients = async (assessmentId: string) => {
    try {
      setAssignLoading(true);
      const { data: clientsData, error: clientsError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, role, is_active')
        .eq('role', 'CLIENT')
        .eq('is_active', true)
        .order('last_name');
      if (clientsError) throw clientsError;
      if (!clientsData || clientsData.length === 0) {
        setClients([]);
        setAssignLoading(false);
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
      setAssignLoading(false);
    }
  };

  const handleScopeChange = (userId: string, value: string) => {
    setScopeValues({
      ...scopeValues,
      [userId]: value
    });
  };

  const toggleAssignment = async (client: any, isAssigned: boolean) => {
    try {
      if (!selectedAssessment) return;
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
              assessment_id: selectedAssessment.id,
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

  const toggleAssessmentStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('assessments')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setAssessments(assessments.map(assessment => 
        assessment.id === id 
          ? { ...assessment, is_active: !currentStatus } 
          : assessment
      ));
      
      toast.success(`Assessment ${currentStatus ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      console.error('Error toggling assessment status:', error);
      toast.error('Failed to update assessment status');
    }
  };

  const handleManageTopics = (assessmentId: string) => {
    navigate(`/topics?assessmentId=${assessmentId}`);
  };

  const handleAssignClients = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setIsAssigning(true);
  };

  if (isLoading) {
    return <div>Loading assessments...</div>;
  }

  if (assessments.length === 0) {
    return <div>No assessments found. Create your first assessment to get started.</div>;
  }

  return (
    <div>
      <Dialog open={isAssigning} onOpenChange={setIsAssigning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign to Clients</DialogTitle>
          </DialogHeader>
          {selectedAssessment && (
            <div className="mb-4">
              <div className="font-semibold">Assessment:</div>
              <div>{selectedAssessment.title}</div>
            </div>
          )}
         <div className="mb-4">
           <Input
             placeholder="Search clients by name..."
             value={search}
             onChange={e => setSearch(e.target.value)}
             className="max-w-md"
           />
         </div>
         {assignLoading ? (
           <div className="text-center py-8">Loading clients...</div>
         ) : clients.length === 0 ? (
           <div className="text-center py-8">No active clients found</div>
         ) : (
           <div className="max-h-[400px] overflow-auto">
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
                 {clients.filter(client =>
                   `${client.first_name} ${client.last_name}`.toLowerCase().includes(search.toLowerCase())
                 ).map((client) => (
                   <TableRow key={client.id}>
                     <TableCell>
                       {client.first_name} {client.last_name}
                     </TableCell>
                     <TableCell>
                       <Input
                         placeholder="Enter scope..."
                         value={scopeValues[client.id] || ''}
                         onChange={e => handleScopeChange(client.id, e.target.value)}
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
                       <Switch
                         checked={!!client.assignment}
                         onCheckedChange={() => toggleAssignment(client, !!client.assignment)}
                       />
                     </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
           </div>
         )}
        </DialogContent>
      </Dialog>
      <div className="p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Assessment Overview</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Manage your assessment configurations and settings</p>
        </div>
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Active</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedAssessments.map((assessment) => (
            <TableRow key={assessment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <TableCell className="font-medium">{assessment.title}</TableCell>
              <TableCell>{assessment.description.length > 100 
                ? `${assessment.description.substring(0, 100)}...` 
                : assessment.description}
              </TableCell>
              <TableCell>
               <div className="flex items-center gap-2">
                 <Switch
                   checked={assessment.is_active}
                   onCheckedChange={() => toggleAssessmentStatus(assessment.id, assessment.is_active)}
                 />
                 <Badge variant={assessment.is_active ? "default" : "destructive"} className="ml-2">
                   {assessment.is_active ? "Active" : "Inactive"}
                 </Badge>
               </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                 <Button 
                   variant="outline" 
                   size="icon" 
                   onClick={() => onEdit(assessment)} 
                   title="Edit Assessment"
                   className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 dark:hover:bg-blue-900/20"
                 >
                    <Edit className="h-4 w-4" />
                  </Button>
                 <Button 
                   variant="outline" 
                   size="icon" 
                   onClick={() => handleManageTopics(assessment.id)}
                   title="Manage Topics"
                   className="hover:bg-green-50 hover:border-green-300 hover:text-green-600 dark:hover:bg-green-900/20"
                 >
                    <BookOpen className="h-4 w-4" />
                  </Button>
                 <Button 
                   variant="outline" 
                   size="icon" 
                   onClick={() => handleAssignClients(assessment)}
                   disabled={!assessment.is_active}
                   title="Assign to Clients"
                   className="hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600 dark:hover:bg-purple-900/20 disabled:opacity-50"
                 >
                    <Users className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
       </Table>
     </div>

      {/* Pagination Footer */}
     <div className="flex items-center justify-between p-4 border-t bg-gray-50 dark:bg-gray-800/50 flex-nowrap gap-4">
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm text-muted-foreground">Show</span>
          <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">entries</span>
        </div>
        
        <div className="text-sm text-muted-foreground flex-shrink-0">
          Showing {startRecord} to {endRecord} of {totalRecords} records
        </div>
        
        {totalPages > 1 && (
          <div className="flex-shrink-0">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) handlePageChange(currentPage - 1);
                  }}
                  className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(page);
                    }}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) handlePageChange(currentPage + 1);
                  }}
                  className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}
