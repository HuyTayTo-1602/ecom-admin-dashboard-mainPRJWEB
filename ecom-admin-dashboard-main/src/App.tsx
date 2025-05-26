import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import MobileNav from './components/MobileNav';
import AdminRoutes from './routes/AdminRoutes';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

const App: React.FC = () => {
  // Initialize dark mode from localStorage on app load
  useEffect(() => {
    const savedPreference = localStorage.getItem('darkMode');
    if (savedPreference === 'true') {
      document.documentElement.classList.add('dark');
    } else if (savedPreference === null) {
      // If no preference is set, check system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route path="/admin/*" element={<ProtectedRoute />}>
          <Route
            path="*"
            element={
              <div className="flex w-full">
                <Sidebar />
                <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                  <Navbar />
                  <main className="p-4 overflow-auto pb-20 md:pb-4 transition-colors duration-200">
                    <AdminRoutes />
                  </main>
                  <MobileNav />
                </div>
              </div>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
};

export default App;