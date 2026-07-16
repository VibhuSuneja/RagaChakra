import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [mbti, setMbtiState] = useState(localStorage.getItem('ragachakra_mbti') || '');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const navigate = useNavigate();

  const setMbti = (newMbti) => {
    localStorage.setItem('ragachakra_mbti', newMbti);
    setMbtiState(newMbti);
  };

  const handleResetMBTI = () => {
    localStorage.removeItem('ragachakra_mbti');
    localStorage.removeItem('ragachakra_client_id');
    localStorage.removeItem('mbtiType');
    localStorage.removeItem('clientId');
    localStorage.removeItem('raga_mbti');
    localStorage.removeItem('raga_client_id');
    setMbtiState('');
    setIsDemoMode(false);
    navigate('/mbti');
  };

  return (
    <UserContext.Provider value={{ mbti, setMbti, handleResetMBTI, isDemoMode, setIsDemoMode }}>
      {children}
    </UserContext.Provider>
  );
};
