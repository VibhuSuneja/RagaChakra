import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    options: [
      { value: 'I', label: 'Introversion (I)', desc: 'Reflecting in quiet settings, focusing on my inner world.' },
      { value: 'E', label: 'Extraversion (E)', desc: 'Interacting with others, engaging with outer environments.' }
    ]
  },
  {
    axis: 'sn',
    title: 'Information Gathering',
    question: 'What kind of details do you naturally pay attention to?',
    options: [
      { value: 'S', label: 'Sensing (S)', desc: 'Concrete facts, real-world data, and present realities.' },
      { value: 'N', label: 'Intuition (N)', desc: 'Underlying patterns, future possibilities, and big-picture ideas.' }
    ]
  },
  {
    axis: 'tf',
    title: 'Decision Making',
    question: 'What guides your choices and evaluations most?',
    options: [
      { value: 'T', label: 'Thinking (T)', desc: 'Logical consistency, objective analysis, and fairness.' },
      { value: 'F', label: 'Feeling (F)', desc: 'Personal values, empathy, and the impact on relationships.' }
    ]
  },
  {
    axis: 'jp',
    title: 'Lifestyle Structure',
    question: 'How do you prefer to manage your daily life and tasks?',
    options: [
      { value: 'J', label: 'Judging (J)', desc: 'Sticking to plans, structure, and clear deadlines.' },
      { value: 'P', label: 'Perceiving (P)', desc: 'Keeping options open, adapting spontaneously, and exploring.' }
    ]
  }
];

export default function MBTICapture({ onSave }) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({ ie: '', sn: '', tf: '', jp: '' });

  const handleSelectOption = (axis, value) => {
    setAnswers(prev => ({ ...prev, [axis]: value }));
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Last step answered, automatically advance to confirmation
      setCurrentStep(QUESTIONS.length);
    }
  };

  const saveProfile = (mbti) => {
    let cid = localStorage.getItem('ragachakra_client_id');
    if (!cid) {
      cid = generateUUID();
    }
    
    localStorage.setItem('ragachakra_mbti', mbti);
    localStorage.setItem('ragachakra_client_id', cid);

    // POST to /api/mbti (Express backend)
    fetch('/api/mbti', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: cid, mbtiType: mbti })
    }).catch(err => {
      console.warn('Could not post MBTI to server, saved locally:', err);
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

  const handleQuickMock = () => {
    saveProfile('INFJ');
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const progressPercentage = ((currentStep) / QUESTIONS.length) * 100;

  return (
    <div className="fade-in app-container" style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '80vh' }}>
      
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 className="logo">RagaChakra</h1>
        <p className="text-muted" style={{ margin: 0 }}>Circadian Hindustani Raga Recommendation Engine</p>
      </header>

      <div className="glass-card" style={{ padding: '2rem', minHeight: '380px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        
        {/* Progress Bar */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }} className="text-muted">
            <span>Personality Alignment</span>
            <span>{currentStep === QUESTIONS.length ? 'Ready' : `Question ${currentStep + 1} of 4`}</span>
          </div>
          <div style={{ height: '4px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progressPercentage}%`, background: 'var(--color-accent)', transition: 'width 0.3s ease' }}></div>
          </div>
        </div>

        {currentStep < QUESTIONS.length ? (
          // Active Question
          <div className="fade-in" key={currentStep}>
            <span style={{ color: 'var(--color-accent)', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {QUESTIONS[currentStep].title}
            </span>
            <h3 style={{ fontSize: '1.5rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
              {QUESTIONS[currentStep].question}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {QUESTIONS[currentStep].options.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleSelectOption(QUESTIONS[currentStep].axis, opt.value)}
                  className="hover-scale"
                  style={{
                    background: answers[QUESTIONS[currentStep].axis] === opt.value ? 'rgba(232, 137, 12, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: answers[QUESTIONS[currentStep].axis] === opt.value ? '1px solid var(--color-accent)' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: 'var(--color-text-primary)',
                    padding: '1.25rem',
                    borderRadius: '10px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    outline: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    width: '100%'
                  }}
                >
                  <strong style={{ fontSize: '1.1rem', color: answers[QUESTIONS[currentStep].axis] === opt.value ? 'var(--color-accent)' : 'inherit' }}>
                    {opt.label}
                  </strong>
                  <span className="text-muted" style={{ fontSize: '0.9rem' }}>{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Confirmation screen
          <div className="fade-in" style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Ready to Align</h3>
            <p className="text-muted" style={{ fontSize: '1.05rem', marginBottom: '2rem' }}>
              Your selected configuration: <strong style={{ color: 'var(--color-accent)', fontSize: '1.4rem' }}>{`${answers.ie}${answers.sn}${answers.tf}${answers.jp}`}</strong>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button onClick={handleConfirm} className="btn-primary" style={{ width: '100%', fontSize: '1.1rem', padding: '12px' }}>
                Reveal Recommendations &rarr;
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', marginTop: '2rem' }}>
          {currentStep > 0 && currentStep <= QUESTIONS.length ? (
            <button onClick={handleBack} className="btn-text" style={{ padding: 0 }}>
              &larr; Back
            </button>
          ) : <div />}
          
          {currentStep < QUESTIONS.length && (
            <button onClick={handleQuickMock} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}>
              Skip to INFJ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
