import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const UserContext = createContext();
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const navigate = useNavigate();

  // Identity
  const [mbti, setMbtiState] = useState(localStorage.getItem('ragachakra_mbti') || '');
  const [userName, setUserNameState] = useState(localStorage.getItem('ragachakra_name') || '');

  // Mood — set at onboarding and updated each session
  const [mood, setMoodState] = useState(localStorage.getItem('ragachakra_mood') || '');

  // Onboarding: tracks if user has completed it (name + mood minimum; MBTI optional)
  const [onboardingComplete, setOnboardingCompleteState] = useState(
    localStorage.getItem('ragachakra_onboarded') === 'true'
  );

  // Demo Mode
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Listening history (client-side cache — syncs with server on reflect calls)
  const [listeningHistory, setListeningHistory] = useState(
    JSON.parse(localStorage.getItem('ragachakra_history') || '[]')
  );

  // ── Setters ─────────────────────────────────────────────────────────────
  const setMbti = useCallback((newMbti) => {
    if (newMbti) {
      localStorage.setItem('ragachakra_mbti', newMbti);
    } else {
      localStorage.removeItem('ragachakra_mbti');
    }
    setMbtiState(newMbti || '');
  }, []);

  const setUserName = useCallback((name) => {
    localStorage.setItem('ragachakra_name', name);
    setUserNameState(name);
  }, []);

  const setMood = useCallback((newMood) => {
    localStorage.setItem('ragachakra_mood', newMood);
    setMoodState(newMood);
  }, []);

  const completeOnboarding = useCallback(() => {
    localStorage.setItem('ragachakra_onboarded', 'true');
    setOnboardingCompleteState(true);
  }, []);

  const addToHistory = useCallback((entry) => {
    setListeningHistory(prev => {
      const updated = [...prev, { ...entry, listenedAt: new Date().toISOString() }].slice(-50);
      localStorage.setItem('ragachakra_history', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // ── Reset (full app reset) ───────────────────────────────────────────────
  const handleResetMBTI = useCallback(() => {
    // Clear all known localStorage keys
    [
      'ragachakra_mbti', 'ragachakra_client_id', 'ragachakra_name',
      'ragachakra_mood', 'ragachakra_onboarded', 'ragachakra_history',
      'mbtiType', 'clientId', 'raga_mbti', 'raga_client_id',
    ].forEach(k => localStorage.removeItem(k));

    setMbtiState('');
    setUserNameState('');
    setMoodState('');
    setOnboardingCompleteState(false);
    setListeningHistory([]);
    setIsDemoMode(false);
    navigate('/onboarding');
  }, [navigate]);

  return (
    <UserContext.Provider value={{
      // Identity
      mbti, setMbti,
      userName, setUserName,
      // Mood
      mood, setMood,
      // Onboarding
      onboardingComplete, completeOnboarding,
      // Demo Mode
      isDemoMode, setIsDemoMode,
      // History
      listeningHistory, addToHistory,
      // Reset
      handleResetMBTI,
    }}>
      {children}
    </UserContext.Provider>
  );
};
