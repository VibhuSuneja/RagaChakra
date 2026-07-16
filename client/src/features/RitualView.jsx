import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, FastForward, Info, PlayCircle, Bell } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useSingingBowl } from '../hooks/useSingingBowl';
import { useGuideVoice } from '../hooks/useGuideVoice';

const STAGES = [
  { id: 'prepare', duration: 120, title: 'Close your eyes', desc: 'Find somewhere quiet. Feel your breath slow.' },
  { id: 'listen', duration: 900, title: 'Listen', desc: 'Let the raga wash over you. Do not analyze, just receive.' },
  { id: 'reflect', duration: 300, title: 'Reflect', desc: 'What did this bring to the surface?' }
];

export default function RitualView() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { mood } = useUser(); // For saving reflection context
  
  const [stageIndex, setStageIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(STAGES[0].duration);
  const [reflectionText, setReflectionText] = useState('');
  
  const currentStage = STAGES[stageIndex];
  const recommendation = state?.recommendation;
  const { playBowl } = useSingingBowl();
  const { speak, stop } = useGuideVoice();

  // Play sound & voiceover when entering a new stage
  useEffect(() => {
    if (recommendation) {
      playBowl();
      // Delay voice slightly to let the bowl ring first
      const timer = setTimeout(() => {
        speak(`${currentStage.title}. ${currentStage.desc}`);
      }, 1500);
      
      return () => {
        clearTimeout(timer);
        stop();
      };
    }
  }, [stageIndex, recommendation, playBowl, speak, stop, currentStage.title, currentStage.desc]);

  useEffect(() => {
    if (!recommendation) {
      navigate('/');
      return;
    }
    
    // Timer logic
    if (currentStage.id === 'reflect') return; // Reflection doesn't auto-advance in demo easily, we wait for submit
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleNextStage();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [stageIndex, recommendation]);

  const handleNextStage = () => {
    if (stageIndex < STAGES.length - 1) {
      setStageIndex(prev => prev + 1);
      setTimeLeft(STAGES[stageIndex + 1].duration);
    }
  };

  const skipTimer = () => {
    handleNextStage();
  };

  const handleReflectionSubmit = (e) => {
    e.preventDefault();
    if (!reflectionText.trim()) return;
    
    // In a real app, we'd send this to the backend.
    // For demo, we just save it to local storage.
    const summary = "You found stillness and a moment of genuine clarity today."; // Mock Gemini summary
    const memory = {
      date: new Date().toISOString(),
      ragaName: recommendation.raga.name,
      mood: mood,
      reflection: reflectionText,
      summary: summary
    };
    
    localStorage.setItem('ragachakra_memory_card', JSON.stringify(memory));
    navigate('/');
  };

  if (!recommendation) return null;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Progress percentage for the ring
  const progress = ((currentStage.duration - timeLeft) / currentStage.duration) * 100;

  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* Dev/Demo Tool: Skip Timer */}
      {currentStage.id !== 'reflect' && (
        <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '8px' }}>
          <button onClick={playBowl} className="btn btn-ghost" style={{ opacity: 0.5, padding: '8px' }} title="Test Sound">
            <Bell size={16}/>
          </button>
          <button onClick={skipTimer} className="btn btn-ghost" style={{ opacity: 0.5 }}>
            <FastForward size={16}/> Skip (Demo)
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStage.id}
          initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
          transition={{ duration: 0.8 }}
          className="card"
          style={{ width: '100%', maxWidth: '600px', textAlign: 'center', padding: 'var(--space-6)', background: 'rgba(20,20,30,0.8)' }}
        >
          <h4 className="text-muted" style={{ textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 'var(--space-4)' }}>
            Stage {stageIndex + 1} of 3
          </h4>
          
          <h1 style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-2)', color: 'var(--color-accent-primary)' }}>
            {currentStage.title}
          </h1>
          
          {currentStage.id === 'listen' ? (
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <p className="text-muted" style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>
                {currentStage.desc}
              </p>
              
              {(() => {
                // Find the first valid URL in audioRefs
                const url = recommendation.raga?.audioRefs?.find(ref => typeof ref === 'string' && (ref.startsWith('http://') || ref.startsWith('https://')));
                if (!url) return null;
                return (
                  <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', textDecoration: 'none' }}
                  >
                    <PlayCircle size={20} /> Listen to {recommendation.raga.name}
                  </a>
                );
              })()}
              
              {/* Context Reminder */}
              <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-3)', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', textAlign: 'left', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-accent-primary)', marginBottom: 'var(--space-2)' }}>
                  <Info size={16} /> Why {recommendation.raga.name}?
                </h4>
                <p className="text-muted" style={{ fontSize: 'var(--text-sm)', margin: 0 }}>
                  {recommendation.whyBullets?.[0] || 'Selected for your current mood and prahar.'}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-muted" style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-5)' }}>
              {currentStage.desc}
            </p>
          )}

          {currentStage.id !== 'reflect' ? (
            <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto' }}>
              <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                <circle 
                  cx="50" cy="50" r="45" 
                  fill="none" 
                  stroke="var(--color-accent-primary)" 
                  strokeWidth="2"
                  strokeDasharray="283"
                  strokeDashoffset={283 - (283 * progress) / 100}
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '2.5rem', fontWeight: '300' }}>
                {formatTime(timeLeft)}
              </div>
            </div>
          ) : (
            <form onSubmit={handleReflectionSubmit} style={{ marginTop: 'var(--space-4)' }}>
              <h3 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-xl)' }}>
                {recommendation.reflectionQuestion || "What did this raga bring to the surface?"}
              </h3>
              <textarea 
                className="input-field" 
                rows="4" 
                placeholder="Write your thoughts..." 
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                style={{ width: '100%', resize: 'none', marginBottom: 'var(--space-4)' }}
                autoFocus
              ></textarea>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={!reflectionText.trim()}>
                Complete Ritual <ArrowRight size={18} style={{ marginLeft: 'var(--space-2)' }}/>
              </button>
            </form>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
