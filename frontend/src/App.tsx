import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import DashboardPage from './pages/DashboardPage';
import WorldPage from './pages/WorldPage';
import CharacterPage from './pages/CharacterPage';
import EconomyPage from './pages/EconomyPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MFAPage from './pages/MFAPage';
import CompaniesPage from './pages/CompaniesPage';
import LedgersPage from './pages/LedgersPage';
import JournalVoucherPage from './pages/JournalVoucherPage';
import AccountingDashboardPage from './pages/AccountingDashboardPage';
import LedgerDetailsPage from './pages/LedgerDetailsPage';
import SmartVoucherPage from './pages/SmartVoucherPage';
import TrialBalancePage from './pages/TrialBalancePage';
import VoucherListPage from './pages/VoucherListPage';

// GST
import GSTDashboardPage from './pages/GSTDashboardPage';
import GSTR1Page from './pages/GSTR1Page';
import GSTR3BPage from './pages/GSTR3BPage';
import GSTR9Page from './pages/GSTR9Page';
import GSTReconciliationPage from './pages/GSTReconciliationPage';

// Payroll
import EmployeeDirectoryPage from './pages/EmployeeDirectoryPage';
import AttendanceLeavesHubPage from './pages/AttendanceLeavesHubPage';
import PayslipCenterPage from './pages/PayslipCenterPage';

// Inventory
import InventoryIntelligencePage from './pages/InventoryIntelligencePage';
import StockAdjustmentCenterPage from './pages/StockAdjustmentCenterPage';

// Components
import Navbar from './components/Navbar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => (
  <div className="min-h-screen bg-dark-900 text-gray-300 relative overflow-hidden">
    <div className="particle-bg" />
    <Navbar />
    <main className="pt-20 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
      <AnimatePresence mode="wait">
        {children}
      </AnimatePresence>
    </main>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/mfa" element={<MFAPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/companies"
            element={
              <ProtectedRoute>
                <Layout>
                  <CompaniesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/world"
            element={
              <ProtectedRoute>
                <Layout>
                  <WorldPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/character"
            element={
              <ProtectedRoute>
                <Layout>
                  <CharacterPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/economy"
            element={
              <ProtectedRoute>
                <Layout>
                  <EconomyPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Layout>
                  <AdminPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ledgers"
            element={
              <ProtectedRoute>
                <LedgersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ledgers/:id"
            element={
              <ProtectedRoute>
                <LedgerDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/journal-voucher"
            element={
              <ProtectedRoute>
                <JournalVoucherPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/smart-voucher"
            element={
              <ProtectedRoute>
                <SmartVoucherPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/accounting/trial-balance"
            element={
              <ProtectedRoute>
                <TrialBalancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/accounting/vouchers"
            element={
              <ProtectedRoute>
                <VoucherListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/accounting"
            element={
              <ProtectedRoute>
                <AccountingDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gst"
            element={
              <ProtectedRoute>
                <GSTDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gst/gstr1"
            element={
              <ProtectedRoute>
                <GSTR1Page />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gst/gstr3b"
            element={
              <ProtectedRoute>
                <GSTR3BPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gst/gstr9"
            element={
              <ProtectedRoute>
                <GSTR9Page />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gst/reconciliation"
            element={
              <ProtectedRoute>
                <GSTReconciliationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payroll/employees"
            element={
              <ProtectedRoute>
                <EmployeeDirectoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payroll/attendance-leaves"
            element={
              <ProtectedRoute>
                <AttendanceLeavesHubPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payroll/payslips"
            element={
              <ProtectedRoute>
                <PayslipCenterPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <InventoryIntelligencePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/stock-adjustment"
            element={
              <ProtectedRoute>
                <StockAdjustmentCenterPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;

