import React from 'react';
import { Link } from 'react-router-dom';

export default function RagaCard({ raga, score, reasoning, isHero }) {
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
    <div 
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
  );
}
