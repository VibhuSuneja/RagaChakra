import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BrainCircuit, Activity, CheckCircle2 } from 'lucide-react';

const thinkingSteps = [
  { id: 1, text: "Analyzing MBTI cognitive functions...", icon: <BrainCircuit size={18} /> },
  { id: 2, text: "Calculating solar position & Prahar...", icon: <Activity size={18} /> },
  { id: 3, text: "Mapping emotional resonance (Rasa)...", icon: <Sparkles size={18} /> },
  { id: 4, text: "Synthesizing optimal Raga matches...", icon: <CheckCircle2 size={18} /> }
];

export default function AiThinkingLoader({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep < thinkingSteps.length) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 1200);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [currentStep, onComplete]);

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', minHeight: '300px' }}>
      <motion.div
        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        style={{ marginBottom: '1.5rem', color: 'var(--color-accent)' }}
      >
        <BrainCircuit size={48} />
      </motion.div>
      
      <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>AI is crafting your experience</h3>
      
      <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left' }}>
        <AnimatePresence>
          {thinkingSteps.map((step, index) => {
            const isActive = index === currentStep && currentStep < thinkingSteps.length;
            const isPast = index < currentStep;
            if (index <= currentStep) {
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: isActive ? '1px solid var(--color-accent)' : '1px solid rgba(255,255,255,0.1)',
                    backgroundColor: isActive ? 'rgba(232, 137, 12, 0.1)' : 'transparent',
                    color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-muted)'
                  }}
                >
                  <div style={{ color: isActive ? 'var(--color-accent)' : (isPast ? '#4ade80' : 'inherit') }}>
                    {isPast ? <CheckCircle2 size={18} /> : step.icon}
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{step.text}</span>
                </motion.div>
              );
            }
            return null;
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
