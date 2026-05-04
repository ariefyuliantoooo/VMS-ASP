import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import VisitForm from './pages/VisitForm';
import VisitDetail from './pages/VisitDetail';
import SecurityDashboard from './pages/SecurityDashboard';
import PermitForm from './pages/PermitForm';
import PermitList from './pages/PermitList';
import AdminDashboard from './pages/AdminDashboard';
import GuestVisit from './pages/GuestVisit';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  
  return children;
};

// Role Protected Route Component
const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  
  return children;
};

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register-visit" element={<GuestVisit />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/visit/new" element={<ProtectedRoute><VisitForm /></ProtectedRoute>} />
            <Route path="/visit/:id" element={<ProtectedRoute><VisitDetail /></ProtectedRoute>} />
            
            <Route path="/security" element={<RoleProtectedRoute allowedRoles={['SECURITY', 'ADMIN']}><SecurityDashboard /></RoleProtectedRoute>} />
            <Route path="/admin" element={<RoleProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></RoleProtectedRoute>} />
            
            <Route path="/permits" element={<RoleProtectedRoute allowedRoles={['STAFF', 'ADMIN', 'SECURITY']}><PermitList /></RoleProtectedRoute>} />
            <Route path="/permit/new" element={<RoleProtectedRoute allowedRoles={['STAFF', 'ADMIN']}><PermitForm /></RoleProtectedRoute>} />
            
            {/* Catch All */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
