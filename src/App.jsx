import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import OverviewPage from './pages/OverviewPage';
import MarketplacePage from './pages/Marketplacepage';
import MarketplaceCategoriesPage from './pages/MarketplaceCategoriesPage';
import SolarPackagesPage from './pages/SolarPackagesPage';
import BNPLApplicationsPage from './pages/BNPLApplicationsPage';
import OrdersPage from './pages/OrdersPage';
import UsersPage from './pages/UsersPage';
import BranchManagersPage from './pages/BranchManagersPage';
import BranchManagerDashboard from './pages/BranchManagerDashboard';
import BranchManagerBNPLPage from './pages/BranchManagerBNPLPage';
import BranchManagerOrdersPage from './pages/BranchManagerOrdersPage';
import BranchManagerCustomersPage from './pages/BranchManagerCustomersPage';
import EligibilitySurveyFormPage from './pages/EligibilitySurveyFormPage';
import SettingsPage from './pages/SettingsPage';
import AdminProfilePage from './pages/AdminProfilePage';
import AdminsPage from './pages/AdminsPage';
import PaymentSchedulesPage from './pages/PaymentSchedulesPage';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" reverseOrder={false} />
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* ── Admin-only routes ── */}
          <Route path="/" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <OverviewPage />
            </ProtectedRoute>
          } />
          <Route path="/marketplace" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <MarketplacePage />
            </ProtectedRoute>
          } />
          <Route path="/marketplace/categories" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <MarketplaceCategoriesPage />
            </ProtectedRoute>
          } />
          <Route path="/products" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <SolarPackagesPage />
            </ProtectedRoute>
          } />
          <Route path="/bnpl" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <BNPLApplicationsPage />
            </ProtectedRoute>
          } />
          <Route path="/payment-schedules" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <PaymentSchedulesPage />
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <OrdersPage />
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UsersPage />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <SettingsPage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={['admin', 'branch_manager']}>
              <AdminProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/admins" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminsPage />
            </ProtectedRoute>
          } />
          <Route path="/branch-managers" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <BranchManagersPage />
            </ProtectedRoute>
          } />

          {/* ── Branch Manager routes ── */}
          <Route path="/branch-manager/dashboard" element={
            <ProtectedRoute allowedRoles={['branch_manager']}>
              <BranchManagerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/branch-manager/bnpl" element={
            <ProtectedRoute allowedRoles={['branch_manager']}>
              <BranchManagerBNPLPage />
            </ProtectedRoute>
          } />
          <Route path="/branch-manager/orders" element={
            <ProtectedRoute allowedRoles={['branch_manager']}>
              <BranchManagerOrdersPage />
            </ProtectedRoute>
          } />
          <Route path="/branch-manager/customers" element={
            <ProtectedRoute allowedRoles={['branch_manager']}>
              <BranchManagerCustomersPage />
            </ProtectedRoute>
          } />
          <Route path="/branch-manager/eligibility-survey" element={
            <ProtectedRoute allowedRoles={['branch_manager']}>
              <EligibilitySurveyFormPage />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
