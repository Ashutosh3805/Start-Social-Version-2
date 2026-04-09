import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Startups from './components/Startups';
import Investors from './components/Investors';
import Freelancers from './components/Freelancers';
import Manufacturers from './components/Manufacturers';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import OnboardingPage from './pages/OnboardingPage';
import EditProfilePage from './pages/EditProfilePage';
import { useAuth } from './context/AuthContext';
import './App.css';

const SECTION_MAP = {
  STARTUPS: Startups,
  INVESTORS: Investors,
  FREELANCERS: Freelancers,
  MANUFACTURERS: Manufacturers,
};

// Redirect to /login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return null; // spinner could go here
  return token ? children : <Navigate to="/login" replace />;
};

function HomePage() {
  const [activeTab, setActiveTab] = useState('STARTUPS');
  const ActiveSection = SECTION_MAP[activeTab];
  return (
    <div className="app-container">
      <Navbar />
      <Hero activeTab={activeTab} onTabChange={setActiveTab} />
      <ActiveSection />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/edit"
        element={
          <ProtectedRoute>
            <EditProfilePage />
          </ProtectedRoute>
        }
      />
      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
