
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import Objections from './pages/Objections';
import IARoones from './pages/IARoones';
import Roleplay from './pages/Roleplay';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import { Toaster, toast } from 'sonner';
import { isAfter } from 'date-fns';

const DynamicToaster = () => {
  const { user } = useAuth();
  return <Toaster position="top-right" richColors theme={user?.themeMode === 'light' ? 'light' : 'dark'} />;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, logout } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-roones-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-roones-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check for expiration
  if (user.expiresAt && isAfter(new Date(), new Date(user.expiresAt))) {
    // If expired, logout and redirect with message
    setTimeout(() => {
      logout();
      toast.error('Seu período de acesso expirou. Entre em contato com a administração da Roones para renovar.');
    }, 100);
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-roones-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-roones-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ROONES_ADMIN' && user.role !== 'VERTUS_ADMIN')) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

export default function App() {
  return (
    <DataProvider>
      <AuthProvider>
        <div className="mesh-bg" />
        <DynamicToaster />
        <Router>
          <Routes>
            {/* Public Conversion Landing Page for Instagram Link in Bio */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/link" element={<LandingPage />} />
            <Route path="/bio" element={<LandingPage />} />

            <Route path="/login" element={<Login />} />
            
            <Route element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route path="/ia" element={<IARoones />} />
              <Route path="/roleplay" element={<Roleplay />} />
              <Route path="/objections" element={<Objections />} />
              <Route path="/perfil" element={<Profile />} />
              <Route path="/admin" element={
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              } />
              <Route path="/trilhas" element={<Navigate to="/ia" replace />} />
              <Route path="/aulas" element={<Navigate to="/ia" replace />} />
              <Route path="/ranking" element={<Navigate to="/ia" replace />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </DataProvider>
  );
}
