import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { RouteGuard } from './components/RouteGuard';
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
          <Route element={<RouteGuard allowedRoles={['admin', 'client']} />}>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/my-assessments" element={<MyAssessmentsPage />} />
            <Route path="/assessment-topics/:assessmentId" element={<AssessmentTopicsPage />} />
            <Route path="/topic-questions/:topicId" element={<TopicQuestionsPage />} />
          </Route>

          {/* Admin-only routes */}
          <Route element={<RouteGuard allowedRoles={['admin']} />}>
            <Route path="/assessments" element={<AssessmentManagementPage />} />
            <Route path="/topics" element={<TopicManagementPage />} />
            <Route path="/questions" element={<QuestionManagementPage />} />
            <Route path="/users" element={<UsersManagementPage />} />
            <Route path="/assign-clients" element={<AssignClientsPage />} />
          </Route>

          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
