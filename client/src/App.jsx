import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MBTICapture from './components/MBTICapture';
import RagaDetail from './components/RagaDetail';
import Dashboard from './features/Dashboard';
import { UserProvider, useUser } from './context/UserContext';

const VALID_MBTI_TYPES = [
  'ISTJ', 'ISFJ', 'INFJ', 'INTJ', 'ISTP', 'ISFP', 'INFP', 'INTP',
  'ESTP', 'ESFP', 'ENFP', 'ENTP', 'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'
];

// Route Guard to verify user has MBTI stored
function RequireMBTI({ children }) {
  const { mbti } = useUser();
  if (!mbti || !VALID_MBTI_TYPES.includes(mbti.toUpperCase())) {
    return <Navigate to="/mbti" replace />;
  }
  return children;
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
          <Routes>
            <Route 
              path="/" 
              element={
                <RequireMBTI>
                  <Dashboard />
                </RequireMBTI>
              } 
            />
            <Route path="/mbti" element={<MBTICapture />} />
            <Route 
              path="/raga/:id" 
              element={
                <RequireMBTI>
                  <RagaDetail />
                </RequireMBTI>
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
