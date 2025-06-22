import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthContext } from './contexts/AuthContext';
import AuthProvider from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/PatientDashboard';
import CaretakerDashboard from './pages/CaretakerDashboard';
import LoadingSpinner from './components/LoadingSpinner';

function AppRoutes() {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={!user ? <Login /> : (
          user.role === 'patient' ? <Navigate to="/dashboard" replace /> : <Navigate to="/caretaker" replace />
        )}
      />
      <Route
        path="/register"
        element={!user ? <Register /> : (
          user.role === 'patient' ? <Navigate to="/dashboard" replace /> : <Navigate to="/caretaker" replace />
        )}
      />
      
      {/* Patient Dashboard */}
      <Route
        path="/dashboard"
        element={user && user.role === 'patient' ? <PatientDashboard /> : <Navigate to="/login" replace />}
      />

      {/* Caretaker Dashboard */}
      <Route
        path="/caretaker"
        element={user && user.role === 'caretaker' ? <CaretakerDashboard /> : <Navigate to="/login" replace />}
      />

      {/* Root Route */}
      <Route
        path="/"
        element={
          user
            ? user.role === 'patient'
              ? <Navigate to="/dashboard" replace />
              : <Navigate to="/caretaker" replace />
            : <Navigate to="/login" replace />
        }
      />
    </Routes>
  );
}


function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <AppRoutes />
      </div>
    </AuthProvider>
  );
}

export default App;