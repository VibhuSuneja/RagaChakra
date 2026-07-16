import { useCallback, useEffect, useRef } from 'react';

export function useGuideVoice() {
  const synthRef = useRef(null);
  const voiceRef = useRef(null);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      
      const loadVoices = () => {
        const voices = synthRef.current.getVoices();
        // Try to find a calm, deep, or British male voice for a more "guide-like" feel
        const preferredVoices = voices.filter(v => 
          v.name.includes('UK English Male') || 
          v.name.includes('Google UK English Male') || 
          v.name.includes('Daniel') ||
          (v.lang.includes('en-GB') && v.name.includes('Male'))
        );
        
        // Fallback to the first available english voice, or default
        voiceRef.current = preferredVoices[0] || voices.find(v => v.lang.startsWith('en')) || voices[0];
      };

      // Voices load asynchronously in some browsers
      loadVoices();
      if (synthRef.current.onvoiceschanged !== undefined) {
        synthRef.current.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  const speak = useCallback((text) => {
    if (!synthRef.current) return;
    
    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (voiceRef.current) {
      utterance.voice = voiceRef.current;
    }
    
    // Make the voice sound calm and guided
    utterance.rate = 0.85; // slightly slower
    utterance.pitch = 0.9; // slightly deeper
    utterance.volume = 0.7; // not too loud compared to the singing bowl

    synthRef.current.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
  }, []);

  return { speak, stop };
}
