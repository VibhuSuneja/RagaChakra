import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, PlayCircle, ArrowRight, Clock, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import YouTubeEmbed from '../components/YouTubeEmbed';

export default function RecommendationExperience({ recommendation, alternative, praharContext }) {
  const navigate = useNavigate();

  if (!recommendation) return null;

  const { raga, confidence, whyBullets, tomorrowPreview } = recommendation;

  const handleBeginRitual = () => {
    navigate('/ritual', { state: { recommendation } });
  };

  return (
    <motion.div 
      className="recommendation-experience"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', width: '100%', maxWidth: '800px', margin: '0 auto' }}
    >
      {/* HEADER CARD */}
      <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center', background: 'rgba(20, 20, 30, 0.7)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 className="text-muted" style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)' }}>Today's Ritual</h3>
        <h1 style={{ fontSize: 'var(--text-5xl)', margin: 'var(--space-2) 0', color: 'var(--color-accent-primary)' }}>
          {raga.name}
        </h1>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)', alignItems: 'center' }}>
          <span className="badge badge-accent" style={{ fontSize: 'var(--text-sm)' }}>
            <Clock size={14} style={{ marginRight: '4px' }}/> {praharContext?.praharName || 'Current Prahar'}
          </span>
          <span 
            className="badge badge-success" 
            style={{ fontSize: 'var(--text-sm)', cursor: 'help' }}
            title="Calculated from:&#10;✓ Time alignment&#10;✓ Mood alignment&#10;✓ Traditional suitability&#10;✓ Listening history"
          >
            Confidence {confidence}%
          </span>
        </div>
      </div>

      {/* EXPLAINABILITY CARD */}
      <div className="card" style={{ padding: 'var(--space-5)' }}>
        <h3 style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Info size={20} className="text-accent"/> Why this recommendation?
        </h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {whyBullets?.map((bullet, idx) => (
            <motion.li 
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + (idx * 0.1) }}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', fontSize: 'var(--text-lg)' }}
            >
              <CheckCircle2 size={24} className="text-success" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{bullet}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* EMBEDDED AUDIO */}
      <div className="card" style={{ padding: 'var(--space-5)' }}>
        <h3 style={{ marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <PlayCircle size={20} className="text-accent" /> Listen
        </h3>
        <p className="text-muted" style={{ marginBottom: 'var(--space-4)' }}>Preview the raga before beginning your timed ritual.</p>
        <YouTubeEmbed raga={raga} />
      </div>

      {/* PRIMARY CTA */}
      <motion.button 
        className="btn btn-primary"
        style={{ padding: 'var(--space-4)', fontSize: 'var(--text-xl)', width: '100%', justifyContent: 'center' }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleBeginRitual}
      >
        Begin Ritual <ArrowRight size={24} style={{ marginLeft: 'var(--space-2)' }}/>
      </motion.button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
        {/* ALTERNATIVE */}
        {alternative && (
          <div className="card" style={{ padding: 'var(--space-4)', background: 'rgba(255,255,255,0.02)' }}>
            <h4 className="text-muted" style={{ marginBottom: 'var(--space-2)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Alternative</h4>
            <h3 style={{ margin: '0 0 var(--space-2) 0' }}>{alternative.raga.name}</h3>
            <p className="text-muted" style={{ fontSize: 'var(--text-sm)', margin: 0 }}>{alternative.reason}</p>
          </div>
        )}

        {/* TOMORROW PREVIEW */}
        {tomorrowPreview && (
          <div className="card" style={{ padding: 'var(--space-4)', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(232, 137, 12, 0.2)' }}>
            <h4 className="text-muted" style={{ marginBottom: 'var(--space-2)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--color-accent-primary)' }}>Tomorrow Preview</h4>
            <p style={{ fontSize: 'var(--text-sm)', margin: 0 }}>{tomorrowPreview}</p>
          </div>
        )}
      </div>

    </motion.div>
  );
}
