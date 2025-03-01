
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import { ProtectedRoute as RouteGuard } from '@/components/RouteGuard';

// Pages
import Index from '@/pages/Index';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import AssessmentManagementPage from '@/pages/AssessmentManagementPage';
import TopicManagementPage from '@/pages/TopicManagementPage';
import QuestionManagementPage from '@/pages/QuestionManagementPage';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/dashboard" element={
            <RouteGuard>
              <DashboardPage />
            </RouteGuard>
          } />
          
          <Route path="/admin/assessments" element={
            <RouteGuard requiredRole="admin">
              <AssessmentManagementPage />
            </RouteGuard>
          } />
          
          <Route path="/admin/topics" element={
            <RouteGuard requiredRole="admin">
              <TopicManagementPage />
            </RouteGuard>
          } />
          
          <Route path="/admin/questions" element={
            <RouteGuard requiredRole="admin">
              <QuestionManagementPage />
            </RouteGuard>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
