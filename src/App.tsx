import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { useAuthStore } from './store/authStore';
import { ThemeProvider } from './components/theme';
import { AuthPage } from './pages/AuthPage';
import { MainPage } from './pages/MainPage';
import { FeedPage } from './pages/FeedPage';
import { ChatPage } from './pages/ChatPage';
import { DMPage } from './pages/DMPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminPage } from './pages/AdminPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuthStore();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuthStore();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white">Loading...</p>
      </div>
    );
  }
  
  if (!user || !(user.isAdmin || user.email === 'admin@milichat.com')) {
    return <Navigate to="/feed" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider>
      <HelmetProvider>
        <Router>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(10px)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
            },
            success: {
              iconTheme: {
                primary: '#ff6b9d',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainPage />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/feed" replace />} />
            <Route path="feed" element={<FeedPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="chat/:roomId" element={<ChatPage />} />
            <Route path="dm" element={<DMPage />} />
            <Route path="profile/:userId" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route
              path="admin"
              element={
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              }
            />
            <Route path="support" element={<SettingsPage />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
        </HelmetProvider>
    </ThemeProvider>
  );
}

export default App;
