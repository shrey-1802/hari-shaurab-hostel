import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { StudentProvider } from './context/StudentContext';
import { NotificationProvider } from './context/NotificationContext';
import { AppRoutes } from './routes/AppRoutes';
import { Toast } from './components/ui/Toast';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StudentProvider>
          <NotificationProvider>
            <AppRoutes />
            <Toast />
          </NotificationProvider>
        </StudentProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
