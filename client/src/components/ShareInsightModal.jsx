import React from 'react';
import { motion } from 'framer-motion';
import { X, Camera } from 'lucide-react';

export default function ShareInsightModal({ raga, matchPercentage, reasoning, onClose }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '500px',
          position: 'relative',
          padding: '3rem',
          background: 'linear-gradient(135deg, rgba(20, 15, 50, 0.9) 0%, rgba(30, 20, 60, 0.9) 100%)',
          border: '1px solid rgba(232, 137, 12, 0.4)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
        >
          <X size={24} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="logo" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>RagaChakra</h1>
          <p className="text-muted" style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px' }}>AI Resonance Analysis</p>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2.5rem', margin: '0', color: 'var(--color-text-primary)' }}>{raga.name}</h2>
          <div style={{ fontSize: '1.5rem', color: 'var(--color-accent)', fontWeight: 'bold', marginTop: '0.5rem' }}>
            {matchPercentage}% Alignment
          </div>
        </div>

        <div style={{ 
          background: 'rgba(0,0,0,0.3)', 
          padding: '1.5rem', 
          borderRadius: '12px',
          borderLeft: '4px solid var(--color-accent)',
          marginBottom: '2rem'
        }}>
          <p style={{ margin: 0, fontSize: '1.1rem', lineHeight: '1.6', fontStyle: 'italic' }}>
            "{reasoning}"
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', fontSize: '0.85rem' }}>
          <div>
            <div className="text-muted">Primary Rasa</div>
            <div style={{ fontWeight: 'bold' }}>{raga.rasa?.[0] || 'Shanta'}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="text-muted">Optimum Prahar</div>
            <div style={{ fontWeight: 'bold' }}>Prahar {raga.prahar?.[0] || 'Any'}</div>
          </div>
        </div>
        
        <div style={{ position: 'absolute', bottom: '-40px', left: '0', right: '0', textAlign: 'center', color: '#fff', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Camera size={16} /> Screenshot for Judge Panel
        </div>
      </motion.div>
    </div>
  );
}
