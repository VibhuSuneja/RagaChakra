import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function ScheduleTimeline({ currentPraharIndex }) {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const clientId = localStorage.getItem('ragachakra_client_id') || 'temp-id';
    const baseUrl = import.meta.env.VITE_API_URL || '';
    fetch(`${baseUrl}/api/raga/schedule/daily?clientId=${clientId}`)
      .then(res => res.json())
      .then(data => {
        if (data.schedule) {
          setSchedule(data.schedule);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch schedule', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-muted" style={{ fontSize: '0.9rem' }}>Loading your musical day...</div>;
  }

  if (!schedule || schedule.length === 0) return null;

  return (
    <div className="glass-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
      <h3 style={{ marginBottom: '1rem', color: 'var(--color-accent)' }}>Your Musical Day</h3>
      <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        A 24-hour circadian map of ragas perfectly attuned to your temperament.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {schedule.map((item, idx) => {
          const { prahar, recommendation } = item;
          const isCurrent = prahar.praharIndex === currentPraharIndex;
          
          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                background: isCurrent ? 'rgba(232, 137, 12, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                border: isCurrent ? '1px solid rgba(232, 137, 12, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                gap: '1rem'
              }}
            >
              <div style={{ width: '120px', flexShrink: 0, fontSize: '0.85rem', color: isCurrent ? 'var(--color-accent)' : 'var(--color-text-muted)', fontWeight: isCurrent ? 'bold' : 'normal' }}>
                {prahar.praharName}
              </div>
              <div style={{ flexGrow: 1 }}>
                {recommendation ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600' }}>{recommendation.raga.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {recommendation.raga.rasa.join(', ')}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted" style={{ fontSize: '0.85rem' }}>No raga scheduled</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
