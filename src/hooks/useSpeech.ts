import { useCallback, useEffect, useState } from 'react';
import { SETTINGS_KEY } from '../constants';

export const useSpeech = () => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const savedSettings = window.localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings) as { voiceURI?: string };
        setSelectedVoiceURI(settings.voiceURI || '');
      } catch (error) {
        console.error(error);
      }
    }

    const updateVoices = () => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;
      const availableVoices = window.speechSynthesis.getVoices();
      const enVoices = availableVoices.filter((voice) => voice.lang.startsWith('en'));
      setVoices(enVoices.length > 0 ? enVoices : availableVoices);
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify({ voiceURI: selectedVoiceURI }));
  }, [selectedVoiceURI]);

  const speak = useCallback(
    (text: string) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = voices.find((item) => item.voiceURI === selectedVoiceURI);
      if (voice) {
        utterance.voice = voice;
      } else {
        utterance.lang = 'en-US';
      }
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    },
    [voices, selectedVoiceURI],
  );

  return {
    voices,
    selectedVoiceURI,
    setSelectedVoiceURI,
    speak,
  };
};
