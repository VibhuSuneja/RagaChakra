import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BrainCircuit, Activity, CheckCircle2 } from 'lucide-react';
import { useUser } from '../context/UserContext';

export default function AiThinkingLoader({ onComplete }) {
  const { mood } = useUser();
  const [currentStep, setCurrentStep] = useState(0);

  const thinkingSteps = [
    { id: 1, text: "Calibrating solar position & Prahar...", icon: <Activity size={18} /> },
    { id: 2, text: `Mapping emotional resonance for your ${mood || 'current'} state...`, icon: <Sparkles size={18} /> },
    { id: 3, text: "Synthesizing optimal Raga matches...", icon: <BrainCircuit size={18} /> },
    { id: 4, text: "Crafting your personalized ritual...", icon: <CheckCircle2 size={18} /> }
  ];

  useEffect(() => {
    if (currentStep < thinkingSteps.length) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [currentStep, onComplete, thinkingSteps.length]);

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-8)', minHeight: '300px', textAlign: 'center' }}>
      <motion.div
        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        style={{ marginBottom: 'var(--space-4)', color: 'var(--color-accent-primary)' }}
      >
        <Sparkles size={48} />
      </motion.div>
      
      <h3 style={{ marginBottom: 'var(--space-5)' }}>AI is crafting your experience</h3>
      
      <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', textAlign: 'left' }}>
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
                    gap: 'var(--space-3)',
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    border: isActive ? '1px solid var(--color-accent-primary)' : 'var(--border-light)',
                    backgroundColor: isActive ? 'var(--color-accent-glow)' : 'transparent',
                    color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'
                  }}
                >
                  <div style={{ color: isActive ? 'var(--color-accent-primary)' : (isPast ? 'var(--color-success)' : 'inherit') }}>
                    {isPast ? <CheckCircle2 size={18} /> : step.icon}
                  </div>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{step.text}</span>
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
