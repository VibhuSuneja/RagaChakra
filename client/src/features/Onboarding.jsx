import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { saveMbti } from '../services/ragaService';

const MOODS = [
  { id: 'calm', emoji: '🙂', label: 'Calm' },
  { id: 'anxious', emoji: '😟', label: 'Anxious' },
  { id: 'tired', emoji: '😴', label: 'Tired' },
  { id: 'focus', emoji: '🎯', label: 'Need Focus' },
  { id: 'curious', emoji: '✨', label: 'Curious' }
];

const MBTI_QUESTIONS = [
  { axis: 'ie', emoji: '⚡', title: 'Energy', q: 'How do you recharge?', opts: [{v:'I', l:'Introversion (Quiet)'}, {v:'E', l:'Extraversion (Social)'}] },
  { axis: 'sn', emoji: '🔍', title: 'Information', q: 'What do you notice?', opts: [{v:'S', l:'Sensing (Facts)'}, {v:'N', l:'Intuition (Patterns)'}] },
  { axis: 'tf', emoji: '⚖️', title: 'Decisions', q: 'How do you decide?', opts: [{v:'T', l:'Thinking (Logic)'}, {v:'F', l:'Feeling (Empathy)'}] },
  { axis: 'jp', emoji: '🗓️', title: 'Structure', q: 'How do you live?', opts: [{v:'J', l:'Judging (Planned)'}, {v:'P', l:'Perceiving (Spontaneous)'}] }
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { setUserName, setMood, setMbti, completeOnboarding } = useUser();
  
  const [step, setStep] = useState('name');
  const [tempName, setTempName] = useState('');
  const [mbtiAnswers, setMbtiAnswers] = useState({ ie: '', sn: '', tf: '', jp: '' });
  const [mbtiIndex, setMbtiIndex] = useState(0);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (tempName.trim()) {
      setUserName(tempName.trim());
      setStep('mood');
    }
  };

  const handleMoodSelect = (moodId) => {
    setMood(moodId);
    setStep('mbti_prompt');
  };

  const skipMbti = () => {
    completeOnboarding();
    navigate('/');
  };

  const handleMbtiSelect = (axis, val) => {
    setMbtiAnswers(prev => ({ ...prev, [axis]: val }));
    if (mbtiIndex < 3) {
      setTimeout(() => setMbtiIndex(prev => prev + 1), 300);
    } else {
      setTimeout(() => setStep('mbti_result'), 300);
    }
  };

  const finishMbti = () => {
    const finalType = `${mbtiAnswers.ie}${mbtiAnswers.sn}${mbtiAnswers.tf}${mbtiAnswers.jp}`;
    setMbti(finalType);
    saveMbti(finalType).catch(() => {}); // Fire and forget
    completeOnboarding();
    navigate('/');
  };

  const variants = {
    enter: { opacity: 0, y: 20, filter: 'blur(4px)' },
    center: { opacity: 1, y: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, y: -20, filter: 'blur(4px)' }
  };

  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <AnimatePresence mode="wait">
          
          {step === 'name' && (
            <motion.div key="name" variants={variants} initial="enter" animate="center" exit="exit" className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>👋</div>
              <h2>Hello. What should we call you?</h2>
              <form onSubmit={handleNameSubmit} style={{ marginTop: 'var(--space-5)' }}>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Your first name" 
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  autoFocus
                  style={{ textAlign: 'center', fontSize: 'var(--text-xl)' }}
                />
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 'var(--space-4)' }} disabled={!tempName.trim()}>
                  Continue <ArrowRight size={18} />
                </button>
              </form>
            </motion.div>
          )}

          {step === 'mood' && (
            <motion.div key="mood" variants={variants} initial="enter" animate="center" exit="exit" className="card" style={{ textAlign: 'center' }}>
              <h2>How are you feeling right now?</h2>
              <p className="text-muted">This helps us craft your listening ritual.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
                {MOODS.map(m => (
                  <button 
                    key={m.id} 
                    className="card card-interactive" 
                    style={{ padding: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)', background: 'var(--color-bg-main)' }}
                    onClick={() => handleMoodSelect(m.id)}
                  >
                    <span style={{ fontSize: '1.5rem' }}>{m.emoji}</span>
                    <span style={{ fontSize: 'var(--text-lg)', fontWeight: 500 }}>{m.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'mbti_prompt' && (
            <motion.div key="mbti_prompt" variants={variants} initial="enter" animate="center" exit="exit" className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-4)', color: 'var(--color-accent-primary)' }}>
                <Sparkles size={48} />
              </div>
              <h2>Personalize your journey?</h2>
              <p className="text-muted" style={{ marginBottom: 'var(--space-5)' }}>
                RagaChakra can tune recommendations to your cognitive personality (MBTI). It takes 30 seconds.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <button className="btn btn-primary" onClick={() => setStep('mbti_quiz')}>
                  Yes, calibrate my profile
                </button>
                <button className="btn btn-ghost" onClick={skipMbti}>
                  No thanks, just take me in
                </button>
              </div>
            </motion.div>
          )}

          {step === 'mbti_quiz' && (
            <motion.div key={`quiz_${mbtiIndex}`} variants={variants} initial="enter" animate="center" exit="exit" className="card">
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <span style={{ fontSize: '1.5rem' }}>{MBTI_QUESTIONS[mbtiIndex].emoji}</span>
                <span className="badge badge-accent" style={{ marginLeft: 'var(--space-2)' }}>{MBTI_QUESTIONS[mbtiIndex].title}</span>
              </div>
              <h3 style={{ marginBottom: 'var(--space-5)' }}>{MBTI_QUESTIONS[mbtiIndex].q}</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {MBTI_QUESTIONS[mbtiIndex].opts.map(opt => (
                  <button 
                    key={opt.v} 
                    className="card card-interactive"
                    style={{ 
                      padding: 'var(--space-4)', 
                      textAlign: 'left',
                      border: mbtiAnswers[MBTI_QUESTIONS[mbtiIndex].axis] === opt.v ? '1px solid var(--color-accent-primary)' : 'var(--border-light)',
                      background: mbtiAnswers[MBTI_QUESTIONS[mbtiIndex].axis] === opt.v ? 'var(--color-accent-glow)' : 'var(--color-bg-main)'
                    }}
                    onClick={() => handleMbtiSelect(MBTI_QUESTIONS[mbtiIndex].axis, opt.v)}
                  >
                    <strong>{opt.l}</strong>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'mbti_result' && (
            <motion.div key="mbti_result" variants={variants} initial="enter" animate="center" exit="exit" className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--space-3)' }}>✨</div>
              <h2>Profile Calibrated</h2>
              <p className="text-muted">Your personality type is:</p>
              <h1 style={{ color: 'var(--color-accent-primary)', fontSize: 'var(--text-4xl)', margin: 'var(--space-4) 0' }}>
                {mbtiAnswers.ie}{mbtiAnswers.sn}{mbtiAnswers.tf}{mbtiAnswers.jp}
              </h1>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={finishMbti}>
                Begin My Ritual <ArrowRight size={18} />
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
