import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext'; // Import useApp
import Sidebar from './components/Sidebar';
import AIChatSidebar from './components/AIChatSidebar';
import JobFeed from './pages/JobFeed';
import ResumePage from './pages/ResumePage';
import ApplicationsDashboard from './pages/ApplicationsDashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage'; // Import LandingPage
import ProfilePage from './pages/ProfilePage';
import ResumeUploadModal from './components/ResumeUploadModal';
import ProtectedRoute from './components/ProtectedRoute';

const MainLayout = () => {
  const location = useLocation();
  // Pages where sidebar/app layout is NOT shown
  const isFullScreenPage = ['/', '/login', '/register'].includes(location.pathname);

  const { user } = useApp(); // To check auth status if needed

  return (
    <div className={`flex min-h-screen ${isFullScreenPage ? 'bg-white' : ''}`}>
      {!isFullScreenPage && <Sidebar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/jobs" element={<ProtectedRoute><JobFeed /></ProtectedRoute>} />
          <Route path="/resume" element={<ProtectedRoute><ResumePage /></ProtectedRoute>} />
          <Route path="/applications" element={<ProtectedRoute><ApplicationsDashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </main>
      {!isFullScreenPage && <AIChatSidebar />}
      {!isFullScreenPage && <ResumeUploadModal />}
    </div>
  );
};

import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <Router>
          <MainLayout />
        </Router>
      </ToastProvider>
    </AppProvider>
  );
}

export default App;
