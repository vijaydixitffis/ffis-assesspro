
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import RouteGuard from './components/RouteGuard';
import IndexPage from './pages/Index';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NotFound from './pages/NotFound';
import TopicManagementPage from './pages/TopicManagementPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/dashboard" 
            element={
              <RouteGuard>
                <DashboardPage />
              </RouteGuard>
            } 
          />
          <Route 
            path="/admin/topics" 
            element={
              <RouteGuard>
                <TopicManagementPage />
              </RouteGuard>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster position="top-right" />
      </AuthProvider>
    </Router>
  );
}

export default App;
