import { useCallback, useEffect, useRef, useState } from 'react';

export function useSpeech(language: string) {
  const generation = useRef(0);
  const activeAudio = useRef<HTMLAudioElement | null>(null);
  const pending = useRef<(() => void) | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState('');
  const stop = useCallback(() => {
    generation.current++;
    activeAudio.current?.pause();
    activeAudio.current = null;
    pending.current?.();
    pending.current = null;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);
  useEffect(() => {
    const hidden = () => { if (document.hidden) stop(); };
    document.addEventListener('visibilitychange', hidden);
    return () => { document.removeEventListener('visibilitychange', hidden); stop(); };
  }, [stop]);
  const say = useCallback((text: string, url: string | null, rate = 0.8): Promise<void> => new Promise(resolve => {
    let finished = false;
    const done = () => { if (finished) return; finished = true; if (pending.current === done) pending.current = null; resolve(); };
    pending.current = done;
    if (url) {
      const audio = new Audio(url); activeAudio.current = audio;
      audio.onended = done;
      audio.onerror = () => { setError('That recording could not play.'); done(); };
      audio.play().catch(() => { setError('Tap again to play the recording.'); done(); });
    } else if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language; utterance.rate = rate;
      const voices = window.speechSynthesis.getVoices();
      utterance.voice = voices.find(v => v.lang === language) || voices.find(v => v.lang.startsWith('en')) || null;
      utterance.onend = done;
      utterance.onerror = done;
      window.speechSynthesis.speak(utterance);
    } else { setError('Speech is unavailable in this browser. Try Chrome or Safari.'); done(); }
  }), [language]);
  return { generation, speaking, setSpeaking, error, setError, stop, say };
}
