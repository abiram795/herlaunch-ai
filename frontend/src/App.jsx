import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { listenToAuth } from './firebase';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import StartupWorkspace from './pages/StartupWorkspace';
import SharkTank from './pages/SharkTank';
import CoFounder from './pages/CoFounder';
import FundingNavigator from './pages/FundingNavigator';
import Profile from './pages/Profile';

const App = () => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeStartupId, setActiveStartupId] = useState(null);

  useEffect(() => {
    const unsubscribe = listenToAuth((currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSelectStartup = (id) => {
    setActiveStartupId(id);
  };

  return (
    <ThemeProvider>
      <Router>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          
          <Navbar />
          
          <div className="app-container" style={{ paddingTop: '70px', flex: 1 }}>
            
            {/* Render Sidebar only for authenticated users */}
            {user && (
              <Sidebar 
                activeStartupId={activeStartupId} 
                onSelectStartup={handleSelectStartup} 
              />
            )}

            <main 
              className="main-content" 
              style={{
                marginLeft: user ? '260px' : '0px',
                paddingTop: '2rem'
              }}
            >
              <Routes>
                {/* Public Route */}
                <Route path="/" element={<Landing />} />

                {/* Protected Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard 
                      activeStartupId={activeStartupId} 
                      onSelectStartup={handleSelectStartup} 
                    />
                  </ProtectedRoute>
                } />

                <Route path="/workspace/:id" element={
                  <ProtectedRoute>
                    <StartupWorkspace />
                  </ProtectedRoute>
                } />

                <Route path="/shark-tank/:id" element={
                  <ProtectedRoute>
                    <SharkTank />
                  </ProtectedRoute>
                } />

                <Route path="/cofounder/:id" element={
                  <ProtectedRoute>
                    <CoFounder />
                  </ProtectedRoute>
                } />

                <Route path="/funding" element={
                  <ProtectedRoute>
                    <FundingNavigator />
                  </ProtectedRoute>
                } />

                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />

                {/* Fallback Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>

        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;
