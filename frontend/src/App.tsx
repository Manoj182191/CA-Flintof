import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Pages
import DashboardPage from './pages/DashboardPage';
import WorldPage from './pages/WorldPage';
import CharacterPage from './pages/CharacterPage';
import EconomyPage from './pages/EconomyPage';
import AdminPage from './pages/AdminPage';

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

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <DashboardPage />
            </Layout>
          }
        />
        <Route
          path="/world"
          element={
            <Layout>
              <WorldPage />
            </Layout>
          }
        />
        <Route
          path="/character"
          element={
            <Layout>
              <CharacterPage />
            </Layout>
          }
        />
        <Route
          path="/economy"
          element={
            <Layout>
              <EconomyPage />
            </Layout>
          }
        />
        <Route
          path="/admin"
          element={
            <Layout>
              <AdminPage />
            </Layout>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
