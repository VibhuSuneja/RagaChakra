import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock as ClockIcon } from 'lucide-react';

/**
 * PraharCountdown - Shows a live countdown to the next Prahar transition.
 * Each Prahar is 3 hours; prahar 1 starts at sunrise.
 * Since we don't have the exact sunrise in the client, we assume equal 3-hour blocks.
 */
export default function PraharCountdown({ praharIndex }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [nextPraharName, setNextPraharName] = useState('');

  const praharNames = [
    'Dawn', 'Morning', 'Midday', 'Afternoon',
    'Dusk', 'Early Night', 'Midnight', 'Late Night'
  ];

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      
      // Each prahar is 3 hours (24/8 = 3)
      const praharDuration = 3 * 60 * 60; // in seconds
      const totalSecondsInDay = hours * 3600 + minutes * 60 + seconds;
      const secondsInCurrentPrahar = totalSecondsInDay % praharDuration;
      const secondsUntilNext = praharDuration - secondsInCurrentPrahar;

      const h = Math.floor(secondsUntilNext / 3600);
      const m = Math.floor((secondsUntilNext % 3600) / 60);
      const s = secondsUntilNext % 60;

      setTimeLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);

      const currentP = Math.floor(totalSecondsInDay / praharDuration); // 0-indexed
      const nextP = (currentP + 1) % 8;
      setNextPraharName(praharNames[nextP]);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '10px',
        padding: '10px 14px',
        marginTop: '1rem',
      }}
    >
      <ClockIcon size={16} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
      <div>
        <div className="text-muted" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Next Prahar: {nextPraharName}
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: '1.05rem', fontWeight: 'bold', color: 'var(--color-text-primary)', letterSpacing: '2px' }}>
          {timeLeft}
        </div>
      </div>
    </motion.div>
  );
}
