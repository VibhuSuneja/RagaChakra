import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import Clock from './components/Clock';
import MBTICapture from './components/MBTICapture';
import RagaCard from './components/RagaCard';
import RagaDetail from './components/RagaDetail';
import useGeolocation from './hooks/useGeolocation';

const VALID_MBTI_TYPES = [
  'ISTJ', 'ISFJ', 'INFJ', 'INTJ', 'ISTP', 'ISFP', 'INFP', 'INTP',
  'ESTP', 'ESFP', 'ENFP', 'ENTP', 'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'
];

// Route Guard to verify user has MBTI stored in localStorage
function RequireMBTI({ children }) {
  const mbti = localStorage.getItem('ragachakra_mbti');
  if (!mbti || !VALID_MBTI_TYPES.includes(mbti.toUpperCase())) {
    localStorage.removeItem('ragachakra_mbti');
    return <Navigate to="/mbti" replace />;
  }
  return children;
}

function Dashboard() {
  const navigate = useNavigate();
  const [mbti, setMbti] = useState(localStorage.getItem('ragachakra_mbti') || '');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [praharInfo, setPraharInfo] = useState(null);

  const geo = useGeolocation();

  const handleResetMBTI = () => {
    localStorage.removeItem('ragachakra_mbti');
    localStorage.removeItem('ragachakra_client_id');
    // Also remove deprecated keys for thoroughness
    localStorage.removeItem('mbtiType');
    localStorage.removeItem('clientId');
    localStorage.removeItem('raga_mbti');
    localStorage.removeItem('raga_client_id');
    setMbti('');
    navigate('/mbti');
  };

  useEffect(() => {
    if (!mbti) return;

    setLoading(true);
    const clientId = localStorage.getItem('ragachakra_client_id') || 'temp-id';
    
    // Default Delhi fallback coordinates if geolocation is loading/failed
    const lat = geo.coordinates?.lat ?? 28.6139;
    const lng = geo.coordinates?.lng ?? 77.2090;
    const tz = geo.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';

    fetch(`/api/raga/current?lat=${lat}&lng=${lng}&tz=${tz}&clientId=${clientId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Server error fetching recommendations.');
        }
        return res.json();
      })
      .then(data => {
        setRecommendations(data.recommendations || []);
        setCurrentTimeStr(data.localTimeStr || new Date().toLocaleTimeString());
        setPraharInfo(data.praharContext || null);
        setLoading(false);
      })
      .catch(err => {
        console.warn('Failed to fetch recommendations from server, using local fallbacks:', err);
        // Fallback mock recommendations for standalone UI test
        setRecommendations([
          {
            raga: { _id: 'mock-yaman-id', name: 'Yaman', thaat: 'Kalyan', prahar: [5], rasa: ['Shringara'], ascendingNotes: 'S R G M# P...' },
            score: 0.98,
            reasoning: 'Yaman is highly aligned with your MBTI profile and matches the dusk mood.'
          },
          {
            raga: { _id: 'mock-bhupali-id', name: 'Bhupali', thaat: 'Kalyan', prahar: [4, 5], rasa: ['Shringara', 'Shanta'], ascendingNotes: 'S R G P D...' },
            score: 0.85,
            reasoning: 'Bhupali shares Kalyan notes and is suitable for late afternoon listening.'
          }
        ]);
        setLoading(false);
      });
  }, [mbti, geo.coordinates, geo.timezone]);

  return (
    <div className="app-container fade-in">
      <header className="header">
        <div>
          <h1 className="logo" style={{ marginBottom: 0 }}>RagaChakra</h1>
          <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>
            Circadian Hindustani Raga Recommendation Engine
          </p>
        </div>
        {mbti && (
          <div className="mbti-badge">
            <span>Profile: <strong>{mbti}</strong></span>
            <button className="btn-text" onClick={handleResetMBTI}>Change</button>
          </div>
        )}
      </header>

      <main className="dashboard-grid">
        <section className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignSelf: 'start' }}>
          <div>
            <h2>Circadian Position</h2>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.25rem 0', color: 'var(--color-accent)' }}>
              {currentTimeStr || new Date().toLocaleTimeString()}
            </p>
            {praharInfo && (
              <p className="text-muted" style={{ margin: 0 }}>
                Prahar: <strong>{praharInfo.praharName || `Prahar ${praharInfo.praharIndex}`}</strong>
              </p>
            )}
            {geo.error && (
              <p style={{ color: '#ffcc00', fontSize: '0.8rem', marginTop: '0.5rem', marginBottom: 0 }}>
                ⚠️ {geo.error}
              </p>
            )}
          </div>
          <Clock praharIndex={praharInfo?.praharIndex} />
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card">
            <h2>Your Recommendations</h2>
            <p className="text-muted" style={{ margin: 0 }}>
              Showing personalized ragas based on your personality type and the current solar position.
            </p>
          </div>

          {loading ? (
            <div className="glass-card" style={{ textAlign: 'center' }}>
              <p style={{ margin: 0 }}>Loading recommendations...</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {recommendations.length > 0 ? (
                <>
                  {/* Hero card for top match */}
                  <RagaCard
                    raga={recommendations[0].raga}
                    score={recommendations[0].score}
                    reasoning={recommendations[0].reasoning}
                    isHero={true}
                  />
                  
                  {/* Grid for secondary recommendations */}
                  {recommendations.length > 1 && (
                    <div>
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '1.2rem', letterSpacing: '0.5px' }} className="text-muted">
                        Other Recommended Ragas
                      </h3>
                      <div className="responsive-grid">
                        {recommendations.slice(1).map((rec, index) => (
                          <RagaCard 
                            key={rec.raga?._id || index} 
                            raga={rec.raga} 
                            score={rec.score} 
                            reasoning={rec.reasoning} 
                            isHero={false}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="glass-card" style={{ textAlign: 'center' }}>
                  <p style={{ margin: 0 }}>No recommendations found for this Prahar.</p>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
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
          {/* Redirect any other path to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
