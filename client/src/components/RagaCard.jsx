import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ShareInsightModal from './ShareInsightModal';

export default function RagaCard({ raga, score, reasoning, isHero, index = 0 }) {
  const [showInsight, setShowInsight] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  if (!raga) return null;

  // Format prahar display (e.g., [1, 2] -> "Prahar 1, 2")
  const formatPrahar = (p) => {
    if (Array.isArray(p)) {
      return `Prahar ${p.join(', ')}`;
    }
    return p;
  };

  const matchPercentage = Math.round(score * 100);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      whileHover={{ y: -8, scale: 1.02, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)' }}
      className={`glass-card hover-scale ${isHero ? 'hero-raga-card' : ''}`}
      style={{ 
        padding: isHero ? '2rem' : '1.25rem', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1rem',
        border: isHero ? '2px solid rgba(232, 137, 12, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
        background: isHero ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(232, 137, 12, 0.05) 100%)' : 'rgba(255, 255, 255, 0.05)'
      }}
    >
      {isHero && (
        <div style={{ 
          alignSelf: 'flex-start', 
          background: 'var(--color-accent)', 
          color: '#000', 
          fontWeight: 'bold', 
          fontSize: '0.75rem', 
          padding: '4px 10px', 
          borderRadius: '20px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '-0.25rem'
        }}>
          Top Circadian Match
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 style={{ margin: 0, fontSize: isHero ? '2rem' : '1.25rem' }}>{raga.name}</h3>
        <span style={{ 
          color: 'var(--color-accent)', 
          fontWeight: 'bold', 
          fontSize: isHero ? '1.2rem' : '1rem' 
        }}>
          {matchPercentage}% Match
        </span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.85rem' }}>
        <span style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '3px 8px', borderRadius: '4px' }}>
          <strong>Thaat:</strong> {raga.thaat}
        </span>
        <span style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '3px 8px', borderRadius: '4px' }}>
          <strong>Time:</strong> {formatPrahar(raga.prahar)}
        </span>
        {raga.isSandhiPrakash && (
          <span style={{ background: 'rgba(232, 137, 12, 0.15)', color: 'var(--color-accent)', padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(232, 137, 12, 0.3)' }}>
            Sandhi Prakash ({raga.sandhiType})
          </span>
        )}
      </div>

      {raga.rasa && raga.rasa.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {raga.rasa.map((rs) => (
            <span 
              key={rs} 
              style={{ 
                fontSize: '0.75rem', 
                background: 'rgba(255, 255, 255, 0.04)', 
                color: 'var(--color-text-muted)', 
                border: '1px solid rgba(255, 255, 255, 0.05)', 
                padding: '2px 8px', 
                borderRadius: '12px' 
              }}
            >
              {rs}
            </span>
          ))}
        </div>
      )}

      <p style={{ 
        fontSize: isHero ? '1.05rem' : '0.92rem', 
        margin: 0, 
        flexGrow: 1,
        lineHeight: '1.6' 
      }} className="text-muted">
        {reasoning}
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
        <div style={{ fontSize: '0.85rem', fontFamily: 'monospace' }} className="text-muted">
          Aroha: {raga.ascendingNotes || 'S R G M...'}
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {isHero && (
            <>
              <button 
                onClick={() => {
                  if (aiExplanation) return;
                  setAiLoading(true);
                  setAiExplanation('');
                  
                  const clientId = localStorage.getItem('ragachakra_client_id') || 'temp-id';
                  const mbti = localStorage.getItem('ragachakra_mbti') || 'User';
                  const baseUrl = import.meta.env.VITE_API_URL || '';
                  const url = `${baseUrl}/api/raga/ai/explain?ragaName=${encodeURIComponent(raga.name)}&mbti=${encodeURIComponent(mbti)}&timeLabel=this%20prahar`;
                  
                  const source = new EventSource(url);
                  source.onmessage = (event) => {
                    if (event.data === '[DONE]') {
                      source.close();
                      setAiLoading(false);
                      return;
                    }
                    try {
                      const data = JSON.parse(event.data);
                      if (data.error) {
                        setAiExplanation(data.error);
                        source.close();
                        setAiLoading(false);
                      } else if (data.text) {
                        setAiExplanation((prev) => prev + data.text);
                      }
                    } catch (e) {
                      console.error('Error parsing SSE', e);
                    }
                  };
                  source.onerror = (e) => {
                    console.error('SSE Error', e);
                    source.close();
                    setAiLoading(false);
                  };
                }}
                disabled={aiLoading || !!aiExplanation}
                style={{
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(232, 137, 12, 0.2) 100%)',
                  border: '1px solid rgba(168, 85, 247, 0.4)',
                  color: '#fff',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  cursor: (aiLoading || !!aiExplanation) ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  opacity: (aiLoading || !!aiExplanation) ? 0.6 : 1
                }}
              >
                ✨ Why this Raga?
              </button>
              <button 
                onClick={() => setShowInsight(true)}
                style={{
                  background: 'rgba(232, 137, 12, 0.1)',
                  border: '1px solid rgba(232, 137, 12, 0.4)',
                  color: 'var(--color-accent)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = 'rgba(232, 137, 12, 0.2)'}
                onMouseOut={(e) => e.target.style.background = 'rgba(232, 137, 12, 0.1)'}
              >
                Share Insight
              </button>
            </>
          )}
          <Link 
            to={`/raga/${raga._id}`} 
            style={{ 
              color: 'var(--color-accent)', 
              fontWeight: '600', 
              fontSize: '0.9rem', 
              display: 'inline-flex', 
              alignItems: 'center',
              gap: '4px' 
            }}
          >
            View Details <span>→</span>
          </Link>
        </div>
      </div>
      
      <AnimatePresence>
        {(aiExplanation || aiLoading) && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              marginTop: '0.5rem',
              padding: '1rem',
              background: 'rgba(168, 85, 247, 0.1)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '0.95rem',
              lineHeight: '1.5',
              fontStyle: 'italic'
            }}
          >
            <span style={{ fontWeight: 'bold', color: '#e8890c', fontStyle: 'normal', marginRight: '8px' }}>✨ Gemini Says:</span>
            {aiExplanation}
            {aiLoading && <span style={{ display: 'inline-block', width: '8px', height: '14px', background: '#e8890c', marginLeft: '4px', animation: 'blink 1s step-end infinite' }} />}
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {showInsight && (
          <ShareInsightModal 
            raga={raga} 
            matchPercentage={matchPercentage} 
            reasoning={reasoning} 
            onClose={() => setShowInsight(false)} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
