import { useState, useCallback, useEffect } from 'react';

export const useAudioUnlock = () => {
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);

  const unlockAudio = useCallback(() => {
    if (isAudioUnlocked) return;

    // Unlock standard audio
    const audio = new Audio();
    audio.play().then(() => {
      setIsAudioUnlocked(true);
      console.log("Global Audio unlocked");
    }).catch((err) => {
      if (err.name !== 'AbortError') {
        console.log("Global Audio unlock failed - waiting for interaction", err);
      }
    });

    // Unlock SpeechSynthesis
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      const utterance = new SpeechSynthesisUtterance("");
      window.speechSynthesis.speak(utterance);
    }
  }, [isAudioUnlocked]);

  useEffect(() => {
    const handleInteraction = () => {
      unlockAudio();
      // Remove listeners once unlocked
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };

    if (!isAudioUnlocked) {
      document.addEventListener('click', handleInteraction);
      document.addEventListener('touchstart', handleInteraction);
      document.addEventListener('keydown', handleInteraction);
    }

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
  }, [isAudioUnlocked, unlockAudio]);

  return { isAudioUnlocked, unlockAudio };
};
