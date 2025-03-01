
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/RouteGuard';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import IndexPage from './pages/Index';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NotFound from './pages/NotFound';
import TopicManagementPage from './pages/TopicManagementPage';
import AssessmentManagementPage from './pages/AssessmentManagementPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<IndexPage />} />
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/topics" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <TopicManagementPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/assessments" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AssessmentManagementPage />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
        <Toaster position="top-right" />
      </AuthProvider>
    </Router>
  );
}

export default App;
