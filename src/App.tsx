
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import RouteGuard from '@/components/RouteGuard';

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
            <RouteGuard adminOnly>
              <AssessmentManagementPage />
            </RouteGuard>
          } />
          
          <Route path="/admin/topics" element={
            <RouteGuard adminOnly>
              <TopicManagementPage />
            </RouteGuard>
          } />
          
          <Route path="/admin/questions" element={
            <RouteGuard adminOnly>
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
