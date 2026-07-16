import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Clock from '../components/Clock';
import RagaCard from '../components/RagaCard';
import AiThinkingLoader from '../components/AiThinkingLoader';
import DemoModeToggle from '../components/DemoModeToggle';
import ScheduleTimeline from '../components/ScheduleTimeline';
import useGeolocation from '../hooks/useGeolocation';
import { useUser } from '../context/UserContext';
import { fetchCurrentRaga } from '../services/ragaService';

export default function Dashboard() {
  const navigate = useNavigate();
  const { mbti, handleResetMBTI, isDemoMode, setIsDemoMode } = useUser();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAiThinking, setShowAiThinking] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [praharInfo, setPraharInfo] = useState(null);
  const [memoryCard, setMemoryCard] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ragachakra_memory_card');
      if (stored) {
        setMemoryCard(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to parse memory card', e);
    }
  }, []);

  const geo = useGeolocation();

  const getRasaColor = (rasas) => {
    if (!rasas || rasas.length === 0) return 'transparent';
    const firstRasa = rasas[0].toLowerCase();
    switch (firstRasa) {
      case 'shringara': return 'rgba(236, 72, 153, 0.25)';
      case 'shanta': return 'rgba(56, 189, 248, 0.25)';
      case 'veera': return 'rgba(245, 158, 11, 0.25)';
      case 'karuna': return 'rgba(129, 140, 248, 0.25)';
      case 'adbhuta': return 'rgba(168, 85, 247, 0.25)';
      default: return 'rgba(232, 137, 12, 0.2)';
    }
  };

  const topRasaColor = recommendations.length > 0 && !showAiThinking
    ? getRasaColor(recommendations[0].raga.rasa) 
    : 'transparent';

  useEffect(() => {
    if (!mbti && !isDemoMode) return;

    if (isDemoMode) {
      setLoading(false);
      setShowAiThinking(true);
      
      setRecommendations([
        {
          raga: { _id: 'mock-malkauns', name: 'Malkauns', thaat: 'Bhairavi', prahar: [8], rasa: ['Veera', 'Shanta'], ascendingNotes: 'S G M D N S' },
          score: 0.99,
          reasoning: 'Malkauns resonates perfectly with the profound quiet of midnight and your cognitive traits.'
        },
        {
          raga: { _id: 'mock-darbari', name: 'Darbari Kanada', thaat: 'Asavari', prahar: [8], rasa: ['Karuna', 'Bhakti'], ascendingNotes: 'S R G M P D N S' },
          score: 0.92,
          reasoning: 'Darbari matches the introspective nature of the late night hours.'
        }
      ]);
      setCurrentTimeStr('12:00:00 AM');
      setPraharInfo({ praharIndex: 8, praharName: 'Midnight (Prahar 8)' });
      return;
    }

    setLoading(true);
    const clientId = localStorage.getItem('ragachakra_client_id') || 'temp-id';
    const lat = geo.coordinates?.lat ?? 28.6139;
    const lng = geo.coordinates?.lng ?? 77.2090;
    const tz = geo.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';

    fetchCurrentRaga(lat, lng, tz, clientId)
      .then(data => {
        setRecommendations(data.recommendations || []);
        setCurrentTimeStr(data.localTimeStr || new Date().toLocaleTimeString());
        setPraharInfo(data.praharContext || null);
        setLoading(false);
        setShowAiThinking(true);
      })
      .catch(err => {
        console.warn('Failed to fetch recommendations from server, using local fallbacks:', err);
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
        setShowAiThinking(true);
      });
  }, [mbti, geo.coordinates, geo.timezone, isDemoMode]);

  return (
    <div className="app-container fade-in" style={{ position: 'relative', zIndex: 1 }}>
      <div 
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          width: '120vw',
          height: '120vh',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, ${topRasaColor} 0%, transparent 60%)`,
          filter: 'blur(100px)',
          zIndex: -1,
          pointerEvents: 'none',
          transition: 'background 2s ease-in-out'
        }}
      />
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
          {praharInfo && <ScheduleTimeline currentPraharIndex={praharInfo.praharIndex} />}
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* MEMORY CARD */}
          {memoryCard && !loading && !showAiThinking && (
            <div className="card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(232, 137, 12, 0.3)', padding: 'var(--space-5)' }}>
              <h4 className="text-muted" style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 'var(--space-2)' }}>Yesterday</h4>
              <p style={{ margin: '0 0 var(--space-2) 0', fontSize: 'var(--text-base)' }}>You listened to {memoryCard.ragaName}.</p>
              <p style={{ margin: '0 0 var(--space-3) 0', fontSize: 'var(--text-base)', fontStyle: 'italic', color: 'rgba(255,255,255,0.8)' }}>"{memoryCard.summary}"</p>
              <button className="btn-text text-accent" onClick={() => localStorage.removeItem('ragachakra_memory_card') || setMemoryCard(null)} style={{ padding: 0, fontSize: 'var(--text-xs)' }}>Dismiss</button>
            </div>
          )}

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
          ) : showAiThinking ? (
            <AiThinkingLoader onComplete={() => setShowAiThinking(false)} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {recommendations.length > 0 ? (
                <>
                  <RagaCard
                    raga={recommendations[0].raga}
                    score={recommendations[0].score || 0.92}
                    reasoning={recommendations[0].reasoning || "Matches your current mood and prahar."}
                    isHero={true}
                    recommendationFull={recommendations[0]}
                  />
                  
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
                            score={rec.score || 0.85} 
                            reasoning={rec.reasoning || "An alternative match."} 
                            isHero={false}
                            recommendationFull={rec}
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
      <DemoModeToggle isDemoMode={isDemoMode} onToggle={() => setIsDemoMode(!isDemoMode)} />
    </div>
  );
}
