import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import YouTubeEmbed from './YouTubeEmbed';
import { ArrowRight } from 'lucide-react';

export default function RagaDetail() {
  const { id } = useParams();
  const [raga, setRaga] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { state } = useLocation();
  const navigate = useNavigate();
  const recommendation = state?.recommendation;

  // Format prahar display (e.g., [1, 2] -> "Prahar 1, 2")
  const formatPrahar = (p) => {
    if (Array.isArray(p)) {
      return `Prahar ${p.join(', ')}`;
    }
    return p;
  };

  useEffect(() => {
    setLoading(true);
    const rawBaseUrl = import.meta.env.VITE_API_URL || '';
    const baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
    fetch(`${baseUrl}/api/raga/${id}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Raga details not found on server.');
        }
        return res.json();
      })
      .then(data => {
        setRaga(data);
        setLoading(false);
      })
      .catch(err => {
        console.warn('Failed to fetch raga details from server, using local mock:', err);
        // High quality fallback mock data
        setRaga({
          _id: id,
          name: 'Yaman',
          thaat: 'Kalyan',
          prahar: [5],
          rasa: ['Shringara', 'Adbhuta'],
          ascendingNotes: 'S R G M# P D N S\'',
          descendingNotes: 'S\' N D P M# G R S',
          audioRefs: [
            'Ustad Rashid Khan — Yaman',
            'https://www.youtube.com/results?search_query=raga+yaman+classical'
          ],
          isSandhiPrakash: true,
          sandhiType: 'dusk'
        });
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="app-container">
        <div className="glass-card fade-in" style={{ textAlign: 'center', marginTop: '40px' }}>
          <h2>Loading Raga Details...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div style={{ marginBottom: '24px' }}>
        <Link to="/" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <span>&larr;</span> Back to Dashboard
        </Link>
      </div>

      <div className="glass-card fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{raga.name}</h2>
          
          {raga.rasa && raga.rasa.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '0.5rem' }}>
              {raga.rasa.map((rs) => (
                <span 
                  key={rs} 
                  style={{ 
                    fontSize: '0.8rem', 
                    background: 'rgba(232, 137, 12, 0.12)', 
                    color: 'var(--color-accent)', 
                    border: '1px solid rgba(232, 137, 12, 0.25)', 
                    padding: '3px 10px', 
                    borderRadius: '12px' 
                  }}
                >
                  {rs}
                </span>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '1.5rem' }}>
          <div>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }} className="text-muted">Thaat</h4>
            <p style={{ fontSize: '1.25rem', fontWeight: '500', margin: 0 }}>{raga.thaat}</p>
          </div>
          <div>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }} className="text-muted">Prahar Alignment</h4>
            <p style={{ fontSize: '1.25rem', fontWeight: '500', margin: 0 }}>{formatPrahar(raga.prahar)}</p>
          </div>
          <div>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }} className="text-muted">Scale Structure</h4>
            <p style={{ fontSize: '1.25rem', fontWeight: '500', margin: 0, textTransform: 'capitalize' }}>{raga.tetrachord || 'both'}</p>
          </div>
          {raga.isSandhiPrakash && (
            <div>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }} className="text-muted">Sandhi Prakash</h4>
              <p style={{ fontSize: '1.25rem', fontWeight: '500', margin: 0, color: 'var(--color-accent)' }}>
                {raga.sandhiType === 'dawn' ? 'Dawn Transition' : 'Dusk Transition'}
              </p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Arohana (Ascending Scale)</h4>
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '16px 20px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '1.5rem',
              letterSpacing: '4px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              color: 'var(--color-accent)'
            }}>
              {raga.ascendingNotes || 'S R G M P D N S\''}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Avarohana (Descending Scale)</h4>
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '16px 20px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '1.5rem',
              letterSpacing: '4px',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              {raga.descendingNotes || 'S\' N D P M G R S'}
            </div>
          </div>
        </div>

        {raga.audioRefs && raga.audioRefs.length > 0 && (
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '1.5rem' }}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>References & Recordings</h4>
            <ul style={{ listStyleType: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: 0, margin: 0 }}>
              {raga.audioRefs.map((ref, idx) => {
                const isUrl = typeof ref === 'string' && (ref.startsWith('http://') || ref.startsWith('https://'));
                return (
                  <li key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ color: 'var(--color-accent)' }}>&bull;</span>
                    {isUrl ? (
                      <a href={ref} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)', textDecoration: 'underline', fontSize: '0.95rem' }}>
                        Search / Listen to performance
                      </a>
                    ) : (
                      <span style={{ fontSize: '0.95rem' }}>{ref}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '1.5rem', textAlign: 'center' }}>
          <button 
            className="btn btn-primary"
            style={{ padding: 'var(--space-4)', fontSize: 'var(--text-xl)', width: '100%', maxWidth: '400px', justifyContent: 'center', margin: '0 auto' }}
            onClick={() => {
              navigate('/ritual', { state: { recommendation: recommendation || { raga, score: 0.9, reasoning: 'Direct navigation' } } });
            }}
          >
            Begin Ritual <ArrowRight size={24} style={{ marginLeft: 'var(--space-2)' }}/>
          </button>
        </div>
      </div>
    </div>
  );
}
