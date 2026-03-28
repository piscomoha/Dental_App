import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import Patients from './pages/Patients';
import Treatments from './pages/Treatments';
import Documents from './pages/Documents';
import SecretaryDashboard from './pages/SecretaryDashboard';
import PatientDashboard from './pages/PatientDashboard';
import Layout from './components/Layout';
import SplashScreen from './components/SplashScreen';
import LogoutScreen from './components/LogoutScreen';
import { DataSyncProvider } from './context/DataSyncContext';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Restore authentication between page reloads / navigation
  useEffect(() => {
    const stored = localStorage.getItem('authUser');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { name: string; role: string };
        if (parsed?.name && parsed?.role) {
          setUser(parsed);
          setIsAuthenticated(true);
        }
      } catch {
        localStorage.removeItem('authUser');
      }
    }
  }, []);

  // Keep auth in sync with localStorage
  useEffect(() => {
    if (isAuthenticated && user) {
      localStorage.setItem('authUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('authUser');
    }
  }, [isAuthenticated, user]);

  const handleLogin = (userData: { name: string; role: string }) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
  };

  const completeLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setIsLoggingOut(false);
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <>
      {isLoggingOut && <LogoutScreen onComplete={completeLogout} />}
      <DataSyncProvider>
        <BrowserRouter>
          <Routes>
            <Route 
              path="/login" 
              element={
                isAuthenticated ? 
                  <Navigate to="/" replace /> : 
                  <Login onLogin={handleLogin} />
              } 
            />
            <Route 
              path="/" 
              element={
                isAuthenticated ? 
                  <Layout user={user} onLogout={handleLogout} /> : 
                  <Navigate to="/login" replace />
              }
            >
              <Route index element={user?.role === 'Receptionist' ? <Navigate to="/secretariat" replace /> : <Dashboard />} />
              <Route path="rendez-vous" element={<Appointments />} />
              <Route path="patients" element={<Patients />} />
              <Route path="soins" element={<Treatments />} />
              <Route path="documents" element={<Documents />} />
              <Route path="secretariat" element={<SecretaryDashboard />} />
              <Route path="espace-patient" element={<PatientDashboard />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </DataSyncProvider>
    </>
  );
}

export default App;
