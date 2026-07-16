import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Onboarding from './features/Onboarding';
import RagaDetail from './components/RagaDetail';
import Dashboard from './features/Dashboard';
import RitualView from './features/RitualView';
import { UserProvider, useUser } from './context/UserContext';

// Route Guard to verify user has completed onboarding
function RequireOnboarding({ children }) {
  const { onboardingComplete } = useUser();
  if (!onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }
  return children;
}

// Hidden Judge Mode Enabler
function JudgeModeEnabler() {
  const { setUserName, setMood, setMbti, completeOnboarding, setIsDemoMode } = useUser();
  const navigate = useNavigate();
  const location = window.location; // using window since useLocation might be slow to setup

  const activateJudgeMode = React.useCallback(() => {
    console.log("🏆 Judge Mode Activated!");
    setUserName('Judge');
    setMood('overwhelmed');
    setMbti('INFP');
    completeOnboarding();
    setIsDemoMode(true);
    navigate('/');
  }, [setUserName, setMood, setMbti, completeOnboarding, setIsDemoMode, navigate]);

  React.useEffect(() => {
    // 1. Check URL param ?judge=true
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('judge') === 'true') {
      activateJudgeMode();
      // Clean up URL so it doesn't trigger again
      window.history.replaceState({}, document.title, "/");
    }

    // 2. Global hotkey listener (Ctrl + Shift + D)
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        activateJudgeMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activateJudgeMode]);

  return null;
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary" id="fallback-ui" style={{ padding: '40px', textAlign: 'center', color: '#F5F0E8', backgroundColor: '#0D0B2B' }}>
          <h2>Something went wrong.</h2>
          <p>The application encountered an unexpected rendering error.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <UserProvider>
          <JudgeModeEnabler />
          <Routes>
            <Route 
              path="/" 
              element={
                <RequireOnboarding>
                  <Dashboard />
                </RequireOnboarding>
              } 
            />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route 
              path="/raga/:id" 
              element={
                <RequireOnboarding>
                  <RagaDetail />
                </RequireOnboarding>
              } 
            />
            <Route 
              path="/ritual" 
              element={
                <RequireOnboarding>
                  <RitualView />
                </RequireOnboarding>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </UserProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
