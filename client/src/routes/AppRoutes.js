import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import HomePage from '../pages/public/HomePage';
import AboutPage from '../pages/public/AboutPage';
import ServicesPage from '../pages/public/ServicesPage';
import ContactPage from '../pages/public/ContactPage';
import LoginPage from '../pages/public/LoginPage';
import RegisterPage from '../pages/public/RegisterPage';
import ForgotPasswordPage from '../pages/public/ForgotPasswordPage';
import ResetPasswordPage from '../pages/public/ResetPasswordPage';
import CustomerDashboard from '../pages/customer/DashboardPage';
import CustomerProfile from '../pages/customer/ProfilePage';
import ProvidersPage from '../pages/customer/ProvidersPage';
import BookingPage from '../pages/customer/BookingPage';
import HistoryPage from '../pages/customer/HistoryPage';
import ProviderDashboard from '../pages/provider/DashboardPage';
import AdminDashboard from '../pages/admin/DashboardPage';
import ProviderManagementPage from '../pages/admin/ProviderManagementPage';
import UserManagementPage from '../pages/admin/UserManagementPage';
import ProtectedRoute from '../components/ProtectedRoute';
import { AuthContext } from '../context/AuthContext';

function AppRoutes() {
  const { user } = useContext(AuthContext);

  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={[ 'customer', 'provider', 'admin' ]}>
              {user?.role === 'admin' ? <AdminDashboard /> : user?.role === 'provider' ? <ProviderDashboard /> : <CustomerDashboard />}
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={<ProtectedRoute roles={[ 'customer', 'provider', 'admin' ]}><CustomerProfile /></ProtectedRoute>}
        />
        <Route
          path="/providers"
          element={<ProtectedRoute roles={[ 'customer', 'admin' ]}><ProvidersPage /></ProtectedRoute>}
        />
        <Route
          path="/book"
          element={<ProtectedRoute roles={[ 'customer' ]}><BookingPage /></ProtectedRoute>}
        />
        <Route
          path="/history"
          element={<ProtectedRoute roles={[ 'customer' ]}><HistoryPage /></ProtectedRoute>}
        />
        <Route
          path="/provider-dashboard"
          element={<ProtectedRoute roles={[ 'provider' ]}><ProviderDashboard /></ProtectedRoute>}
        />
        <Route
          path="/admin-dashboard"
          element={<ProtectedRoute roles={[ 'admin' ]}><AdminDashboard /></ProtectedRoute>}
        />
        <Route
          path="/admin/providers"
          element={<ProtectedRoute roles={[ 'admin' ]}><ProviderManagementPage /></ProtectedRoute>}
        />
        <Route
          path="/admin/users"
          element={<ProtectedRoute roles={[ 'admin' ]}><UserManagementPage /></ProtectedRoute>}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default AppRoutes;
