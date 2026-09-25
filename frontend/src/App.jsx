import React from 'react';
import { HashRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { StudentProvider } from './context/StudentContext';
import { NotificationProvider } from './context/NotificationContext';
import { AppRoutes } from './routes/AppRoutes';
import { Toast } from './components/ui/Toast';

export function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <StudentProvider>
          <NotificationProvider>
            <AppRoutes />
            <Toast />
          </NotificationProvider>
        </StudentProvider>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;
