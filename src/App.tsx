
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/RouteGuard';
import DashboardPage from './pages/DashboardPage';
import AssessmentManagementPage from './pages/AssessmentManagementPage';
import TopicManagementPage from './pages/TopicManagementPage';
import QuestionManagementPage from './pages/QuestionManagementPage';
import UsersManagementPage from './pages/UsersManagementPage';
import AssignClientsPage from './pages/AssignClientsPage';
import LoginPage from './pages/LoginPage';
import NotFound from './pages/NotFound';
import Index from './pages/Index';
import MyAssessmentsPage from './pages/MyAssessmentsPage';
import AssessmentTopicsPage from './pages/AssessmentTopicsPage';
import TopicQuestionsPage from './pages/TopicQuestionsPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<ProtectedRoute requiredRole="client"><Index /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/my-assessments" element={<ProtectedRoute requiredRole="client"><MyAssessmentsPage /></ProtectedRoute>} />
          <Route path="/assessment-topics/:assessmentId" element={<ProtectedRoute requiredRole="client"><AssessmentTopicsPage /></ProtectedRoute>} />
          <Route path="/topic-questions/:topicId" element={<ProtectedRoute requiredRole="client"><TopicQuestionsPage /></ProtectedRoute>} />

          {/* Admin-only routes */}
          <Route path="/assessments" element={<ProtectedRoute requiredRole="admin"><AssessmentManagementPage /></ProtectedRoute>} />
          <Route path="/topics" element={<ProtectedRoute requiredRole="admin"><TopicManagementPage /></ProtectedRoute>} />
          <Route path="/questions" element={<ProtectedRoute requiredRole="admin"><QuestionManagementPage /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute requiredRole="admin"><UsersManagementPage /></ProtectedRoute>} />
          <Route path="/assign-clients" element={<ProtectedRoute requiredRole="admin"><AssignClientsPage /></ProtectedRoute>} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
