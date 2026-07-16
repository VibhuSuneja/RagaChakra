import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const QUESTIONS = [
  {
    axis: 'ie',
    title: 'Energy Flow',
    question: 'How do you typically recharge your energy?',
    emoji: '⚡',
    options: [
      { value: 'I', label: 'Introversion (I)', desc: 'Reflecting in quiet settings, focusing on inner world.' },
      { value: 'E', label: 'Extraversion (E)', desc: 'Interacting with others, engaging with outer environments.' }
    ]
  },
  {
    axis: 'sn',
    title: 'Information Gathering',
    question: 'What kind of details do you naturally pay attention to?',
    emoji: '🔍',
    options: [
      { value: 'S', label: 'Sensing (S)', desc: 'Concrete facts, real-world data, and present realities.' },
      { value: 'N', label: 'Intuition (N)', desc: 'Underlying patterns, future possibilities, and big-picture ideas.' }
    ]
  },
  {
    axis: 'tf',
    title: 'Decision Making',
    question: 'What guides your choices and evaluations most?',
    emoji: '⚖️',
    options: [
      { value: 'T', label: 'Thinking (T)', desc: 'Logical consistency, objective analysis, and fairness.' },
      { value: 'F', label: 'Feeling (F)', desc: 'Personal values, empathy, and the impact on relationships.' }
    ]
  },
  {
    axis: 'jp',
    title: 'Lifestyle Structure',
    question: 'How do you prefer to manage your daily life and tasks?',
    emoji: '🗓️',
    options: [
      { value: 'J', label: 'Judging (J)', desc: 'Sticking to plans, structure, and clear deadlines.' },
      { value: 'P', label: 'Perceiving (P)', desc: 'Keeping options open, adapting spontaneously, and exploring.' }
    ]
  }
];

// Personality type descriptions for the confirmation screen
const MBTI_DESCRIPTIONS = {
  INTJ: { name: 'The Architect', rasa: 'Veera (Heroic)', raga: 'Malkauns' },
  INTP: { name: 'The Logician', rasa: 'Adbhuta (Wonder)', raga: 'Bhairav' },
  ENTJ: { name: 'The Commander', rasa: 'Veera (Heroic)', raga: 'Darbari' },
  ENTP: { name: 'The Debater', rasa: 'Adbhuta (Wonder)', raga: 'Yaman' },
  INFJ: { name: 'The Advocate', rasa: 'Shringara (Love)', raga: 'Yaman' },
  INFP: { name: 'The Mediator', rasa: 'Karuna (Compassion)', raga: 'Bhimpalasi' },
  ENFJ: { name: 'The Protagonist', rasa: 'Shringara (Love)', raga: 'Bilawal' },
  ENFP: { name: 'The Campaigner', rasa: 'Hasya (Joy)', raga: 'Kafi' },
  ISTJ: { name: 'The Logistician', rasa: 'Shanta (Peace)', raga: 'Bhairav' },
  ISFJ: { name: 'The Defender', rasa: 'Shanta (Peace)', raga: 'Todi' },
  ESTJ: { name: 'The Executive', rasa: 'Veera (Heroic)', raga: 'Bilawal' },
  ESFJ: { name: 'The Consul', rasa: 'Hasya (Joy)', raga: 'Bhimpalasi' },
  ISTP: { name: 'The Virtuoso', rasa: 'Hasya (Joy)', raga: 'Kafi' },
  ISFP: { name: 'The Adventurer', rasa: 'Shringara (Love)', raga: 'Bhimpalasi' },
  ESTP: { name: 'The Entrepreneur', rasa: 'Veera (Heroic)', raga: 'Kafi' },
  ESFP: { name: 'The Entertainer', rasa: 'Hasya (Joy)', raga: 'Bilawal' },
};

import { useUser } from '../context/UserContext';

export default function MBTICapture({ onSave }) {
  const navigate = useNavigate();
  const { setMbti } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({ ie: '', sn: '', tf: '', jp: '' });
  const [direction, setDirection] = useState(1);

  const handleSelectOption = (axis, value) => {
    setAnswers(prev => ({ ...prev, [axis]: value }));
    setDirection(1);
    if (currentStep < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentStep(prev => prev + 1), 300);
    } else {
      setTimeout(() => setCurrentStep(QUESTIONS.length), 300);
    }
  };

  const saveProfile = (mbti) => {
    let cid = localStorage.getItem('ragachakra_client_id');
    if (!cid) {
      cid = generateUUID();
    }
    setMbti(mbti);
    localStorage.setItem('ragachakra_client_id', cid);

    const rawBaseUrl = import.meta.env.VITE_API_URL || '';
    const baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
    fetch(`${baseUrl}/api/mbti`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // keepalive: true ensures request completes even after navigate() fires
      keepalive: true,
      body: JSON.stringify({ clientId: cid, mbtiType: mbti })
    })
      .then(res => {
        if (!res.ok) {
          // 503 = offline/demo mode — not an error, just log it
          console.info('RagaChakra: Server sync skipped (offline mode), MBTI saved locally.');
        }
      })
      .catch(() => {
        // Network failure — MBTI already saved to localStorage above, so this is fine
        console.info('RagaChakra: Server unreachable, MBTI saved locally.');
      });

    if (onSave) {
      onSave(mbti);
    } else {
      navigate('/');
    }
  };

  const handleConfirm = () => {
    const mbti = `${answers.ie}${answers.sn}${answers.tf}${answers.jp}`;
    saveProfile(mbti);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    }
  };

  const progressPercentage = (currentStep / QUESTIONS.length) * 100;
  const currentMbti = `${answers.ie || '_'}${answers.sn || '_'}${answers.tf || '_'}${answers.jp || '_'}`;
  const finalMbti = `${answers.ie}${answers.sn}${answers.tf}${answers.jp}`;
  const mbtiInfo = MBTI_DESCRIPTIONS[finalMbti];

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0, filter: 'blur(4px)' }),
    center: { x: 0, opacity: 1, filter: 'blur(0px)' },
    exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0, filter: 'blur(4px)' }),
  };

  return (
    <div className="fade-in" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      background: 'linear-gradient(-45deg, #0D0B2B, #1A1344, #0a1128, #180524)',
      backgroundSize: '400% 400%',
    }}>
      <div style={{ width: '100%', maxWidth: '560px' }}>
        
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '2rem' }}
        >
          <h1 className="logo" style={{ fontSize: '2rem' }}>RagaChakra</h1>
          <p className="text-muted" style={{ margin: 0, fontSize: '0.95rem' }}>
            Personality Calibration
          </p>
        </motion.header>

        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ padding: '2rem', overflow: 'hidden', position: 'relative' }}
        >
          {/* Progress bar */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '8px' }} className="text-muted">
              <span>Personality Alignment</span>
              <span style={{ fontWeight: 'bold', letterSpacing: '2px', color: 'var(--color-accent)', fontSize: '1rem' }}>
                {currentMbti}
              </span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
              <motion.div
                style={{ height: '100%', background: 'linear-gradient(90deg, var(--color-accent), #f59e0b)', borderRadius: '3px' }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait" custom={direction}>
            {currentStep < QUESTIONS.length ? (
              <motion.div
                key={currentStep}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ fontSize: '2rem' }}>{QUESTIONS[currentStep].emoji}</span>
                  <span style={{ color: 'var(--color-accent)', fontWeight: 'bold', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginLeft: '0.5rem' }}>
                    {QUESTIONS[currentStep].title}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.4rem', marginTop: '0.25rem', marginBottom: '1.75rem', lineHeight: 1.3 }}>
                  {QUESTIONS[currentStep].question}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {QUESTIONS[currentStep].options.map(opt => (
                    <motion.button
                      key={opt.value}
                      whileHover={{ scale: 1.02, borderColor: 'rgba(232, 137, 12, 0.6)' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectOption(QUESTIONS[currentStep].axis, opt.value)}
                      style={{
                        background: answers[QUESTIONS[currentStep].axis] === opt.value ? 'rgba(232, 137, 12, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        border: answers[QUESTIONS[currentStep].axis] === opt.value ? '1.5px solid var(--color-accent)' : '1px solid rgba(255, 255, 255, 0.08)',
                        color: 'var(--color-text-primary)',
                        padding: '1.25rem 1.5rem',
                        borderRadius: '12px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        outline: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        width: '100%',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <strong style={{ fontSize: '1.05rem', color: answers[QUESTIONS[currentStep].axis] === opt.value ? 'var(--color-accent)' : 'inherit' }}>
                        {opt.label}
                      </strong>
                      <span className="text-muted" style={{ fontSize: '0.875rem', lineHeight: 1.4 }}>{opt.desc}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="confirmation"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                style={{ textAlign: 'center' }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✨</div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Your Profile: <span style={{ color: 'var(--color-accent)' }}>{finalMbti}</span></h2>
                {mbtiInfo && (
                  <div className="glass-card" style={{ padding: '1.25rem', margin: '1.5rem 0', background: 'rgba(232, 137, 12, 0.08)', border: '1px solid rgba(232, 137, 12, 0.25)' }}>
                    <p style={{ fontWeight: 'bold', fontSize: '1.1rem', margin: 0 }}>{mbtiInfo.name}</p>
                    <p className="text-muted" style={{ margin: '4px 0 0 0', fontSize: '0.9rem' }}>Primary Resonance: {mbtiInfo.rasa}</p>
                    <p className="text-muted" style={{ margin: '2px 0 0 0', fontSize: '0.85rem' }}>Likely Match: {mbtiInfo.raga}</p>
                  </div>
                )}
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: '0 8px 20px rgba(232, 137, 12, 0.4)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleConfirm}
                  className="btn-primary"
                  style={{ width: '100%', fontSize: '1.05rem', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Sparkles size={18} /> Reveal My Ragas
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.25rem', marginTop: '2rem' }}>
            {currentStep > 0 && currentStep <= QUESTIONS.length ? (
              <button onClick={handleBack} className="btn-text" style={{ padding: 0, fontSize: '0.9rem' }}>
                ← Back
              </button>
            ) : <div />}
            
            {currentStep < QUESTIONS.length && (
              <button onClick={() => saveProfile('INFJ')} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}>
                Demo: Skip to INFJ
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
