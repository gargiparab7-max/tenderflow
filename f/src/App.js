import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Navbar } from './components/Navbar';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Marketplace } from './pages/Marketplace';
import { TenderDetail } from './pages/TenderDetail';
import { MyOrders } from './pages/MyOrders';
import { WalletPage } from './pages/Wallet';
import { Profile } from './pages/Profile';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminTenders } from './pages/AdminTenders';
import { AdminOrders } from './pages/AdminOrders';
import { AdminApproveUsers } from './pages/AdminApproveUsers';
import { AdminUsers } from './pages/AdminUsers';
import About from './pages/About';
import HowItWorks from './pages/HowItWorks';
import Pricing from './pages/Pricing';
import SuccessStories from './pages/SuccessStories';
import Careers from './pages/Careers';
import Press from './pages/Press';
import Contact from './pages/Contact';
import { isAuthenticated, isAdmin } from './utils/auth';
import { useAuth } from './hooks/useAuth';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin()) {
    return <Navigate to="/marketplace" replace />;
  }

  return children;
};

import { Footer } from './components/Footer';

// Auth Sync wrapper to listen for auth expiry
const AppWithAuthSync = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    // Listen for auth expiry event from API interceptor
    const handleAuthExpired = () => {
      logout();
      navigate('/login', { replace: true });
    };

    window.addEventListener('authExpired', handleAuthExpired);
    return () => window.removeEventListener('authExpired', handleAuthExpired);
  }, [logout, navigate]);

  return <AppRoutes />;
};

// Routes component
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/marketplace" element={<Marketplace />} />
      <Route path="/tender/:tenderId" element={<TenderDetail />} />

      {/* Shared Static Pages */}
      <Route path="/about" element={<About />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/success-stories" element={<SuccessStories />} />
      <Route path="/careers" element={<Careers />} />
      <Route path="/press" element={<Press />} />
      <Route path="/contact" element={<Contact />} />

      {/* Customer Protected Routes */}
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <MyOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/wallet"
        element={
          <ProtectedRoute>
            <WalletPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Admin Protected Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tenders"
        element={
          <ProtectedRoute adminOnly>
            <AdminTenders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <ProtectedRoute adminOnly>
            <AdminOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/approvals"
        element={
          <ProtectedRoute adminOnly>
            <AdminApproveUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute adminOnly>
            <AdminUsers />
          </ProtectedRoute>
        }
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App flex flex-col min-h-screen">
      <BrowserRouter>
        <Navbar />
        <Toaster position="top-right" richColors />
        <div className="flex-grow">
          <AppWithAuthSync />
        </div>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
