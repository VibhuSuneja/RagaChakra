import { useCallback, useRef } from 'react';

export function useSingingBowl() {
  const audioCtxRef = useRef(null);

  const playBowl = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const t = ctx.currentTime;
      
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator(); // detuned for beating effect
      const osc3 = ctx.createOscillator(); // higher harmonic
      
      const gainNode = ctx.createGain();
      
      osc.connect(gainNode);
      osc2.connect(gainNode);
      osc3.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      // Fundamental frequency (e.g., F4)
      const baseFreq = 349.23;
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, t);
      
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(baseFreq + 2.5, t); // 2.5Hz beat frequency
      
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(baseFreq * 2.01, t); // octave overtone
      
      // Volume envelope: gentle strike, long resonant decay
      gainNode.gain.setValueAtTime(0, t);
      gainNode.gain.linearRampToValueAtTime(0.4, t + 0.1); // Strike
      gainNode.gain.exponentialRampToValueAtTime(0.001, t + 7.0); // 7s decay
      
      osc.start(t);
      osc2.start(t);
      osc3.start(t);
      
      osc.stop(t + 7.5);
      osc2.stop(t + 7.5);
      osc3.stop(t + 7.5);
    } catch (err) {
      console.warn("Audio play failed, likely due to browser autoplay policies", err);
    }
  }, []);

  return { playBowl };
}
