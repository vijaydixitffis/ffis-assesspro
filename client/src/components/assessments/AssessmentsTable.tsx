import { formatDate } from "@/utils/formatUtils";
import { AssignedAssessment } from "@/types/assessment";
import { AssessmentStatusBadge } from "./AssessmentStatusBadge";
import { AssessmentActionButtons } from "./AssessmentActionButtons";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Play, 
  Target,
  TrendingUp,
  BookOpen
} from "lucide-react";

interface AssessmentsTableProps {
  assessments: AssignedAssessment[];
  userId: string;
  onStatusUpdate: (assessmentId: string, newStatus: string) => void;
  completionMap: Record<string, boolean>;
}

export const AssessmentsTable = ({ 
  assessments, 
  userId,
  onStatusUpdate,
  completionMap,
}: AssessmentsTableProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="h-6 w-6" />;
      case 'STARTED':
        return <Play className="h-6 w-6" />;
      case 'ASSIGNED':
        return <Clock className="h-6 w-6" />;
      default:
        return <Target className="h-6 w-6" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-500 text-white';
      case 'STARTED':
        return 'bg-blue-500 text-white';
      case 'ASSIGNED':
        return 'bg-amber-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getCardBorderColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/20';
      case 'STARTED':
        return 'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/20';
      case 'ASSIGNED':
        return 'border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-900/20';
      default:
        return 'border-gray-200 hover:border-blue-300 dark:border-gray-700 dark:hover:border-blue-600';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Assessment Overview</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">Manage and track your assigned assessments</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {assessments.map((assessment) => {
          const isCompleted = assessment.status === 'COMPLETED';
          const isStarted = assessment.status === 'STARTED';
          const isAllTopicsCompleted = completionMap[assessment.id] || false;
          
          return (
            <Card 
              key={assessment.id} 
              className={`group relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer border-2 ${getCardBorderColor(assessment.status)}`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getStatusColor(assessment.status)} transition-colors duration-200`}>
                    {getStatusIcon(assessment.status)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <AssessmentStatusBadge status={assessment.status} />
                    {isAllTopicsCompleted && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {assessment.assessment_title}
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3 mb-4">
                  {assessment.scope && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                      <BookOpen className="h-4 w-4" />
                      <span className="truncate">{assessment.scope}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                    <Calendar className="h-4 w-4" />
                    <span>Assigned: {formatDate(assessment.assigned_at)}</span>
                  </div>
                  
                  {assessment.due_date && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                      <Clock className="h-4 w-4" />
                      <span>Due: {formatDate(assessment.due_date)}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <TrendingUp className="h-3 w-3" />
                    <span>Click to manage</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Play className="h-4 w-4 text-blue-500 group-hover:text-blue-600 transition-colors" />
                    <span className="text-xs text-blue-500 group-hover:text-blue-600 font-medium">
                      {isCompleted ? 'View Results' : isStarted ? 'Continue' : 'Start Assessment'}
                    </span>
                  </div>
                </div>
              </CardContent>
              
              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              
              {/* Action buttons overlay on hover */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
                  <AssessmentActionButtons 
                    assessment={assessment} 
                    userId={userId}
                    onStatusUpdate={onStatusUpdate}
                    isAllTopicsCompleted={isAllTopicsCompleted}
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
