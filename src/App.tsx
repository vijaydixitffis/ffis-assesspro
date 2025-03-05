
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/auth';
import { Toaster } from '@/components/ui/sonner';
import { ProtectedRoute } from '@/components/RouteGuard';
import Footer from '@/components/layout/Footer';

// Pages
import Index from '@/pages/Index';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import AssessmentManagementPage from '@/pages/AssessmentManagementPage';
import TopicManagementPage from '@/pages/TopicManagementPage';
import QuestionManagementPage from '@/pages/QuestionManagementPage';
import UsersManagementPage from '@/pages/UsersManagementPage';
import AssignClientsPage from '@/pages/AssignClientsPage';
import MyAssessmentsPage from '@/pages/MyAssessmentsPage';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/assessments" element={
                <ProtectedRoute requiredRole="admin">
                  <AssessmentManagementPage />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/topics" element={
                <ProtectedRoute requiredRole="admin">
                  <TopicManagementPage />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/questions" element={
                <ProtectedRoute requiredRole="admin">
                  <QuestionManagementPage />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/users" element={
                <ProtectedRoute requiredRole="admin">
                  <UsersManagementPage />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/assign-clients" element={
                <ProtectedRoute requiredRole="admin">
                  <AssignClientsPage />
                </ProtectedRoute>
              } />
              
              <Route path="/my-assessments" element={
                <ProtectedRoute requiredRole="client">
                  <MyAssessmentsPage />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Footer />
        </div>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
