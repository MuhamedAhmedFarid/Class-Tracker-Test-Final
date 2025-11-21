import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import Home from './pages/Home';
import Students from './pages/Students';
import StudentDetails from './pages/StudentDetails';
import Reports from './pages/Reports';
import StudentReport from './pages/StudentReport';
import FinancialDetails from './pages/FinancialDetails';
import Settings from './pages/Settings';
import { AppContextProvider } from './contexts/AppContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  return (
    <AppContextProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            {/* Student Details Stack (No Bottom Nav) */}
            <Route path="/student/:id" element={<StudentDetails />} />
            <Route path="/reports/student/:id" element={<StudentReport />} />
            <Route path="/reports/financials" element={<FinancialDetails />} />
            <Route path="/settings" element={<Settings />} />
            
            {/* Tab Layout Routes */}
            <Route
              path="/"
              element={
                <Layout>
                  <Home />
                </Layout>
              }
            />
            <Route
              path="/students"
              element={
                <Layout>
                  <Students />
                </Layout>
              }
            />
            <Route
              path="/reports"
              element={
                <Layout>
                  <Reports />
                </Layout>
              }
            />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </QueryClientProvider>
    </AppContextProvider>
  );
};

export default App;