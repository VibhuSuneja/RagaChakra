import React from 'react';
import { PlayCircle, StopCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DemoModeToggle({ isDemoMode, onToggle }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 }}
      onClick={onToggle}
      className={isDemoMode ? "btn-primary hover-scale" : "btn-primary hover-scale"}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 20px',
        borderRadius: '50px',
        fontWeight: 'bold',
        zIndex: 50,
        backgroundColor: isDemoMode ? '#ef4444' : 'var(--color-accent)',
        borderColor: isDemoMode ? '#ef4444' : 'var(--color-accent)',
        color: isDemoMode ? '#fff' : 'var(--color-bg)',
        boxShadow: isDemoMode ? '0 0 20px rgba(239, 68, 68, 0.5)' : '0 0 20px rgba(232, 137, 12, 0.5)',
      }}
    >
      {isDemoMode ? <StopCircle size={20} /> : <PlayCircle size={20} />}
      {isDemoMode ? 'Exit Demo Mode' : 'Start Judge Demo'}
    </motion.button>
  );
}
