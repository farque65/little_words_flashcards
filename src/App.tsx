import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import type { WordCard, WordCollection } from './types';
import { useSpeech } from './useSpeech';

const colors = ['#fff1cc', '#e4f3fc', '#fce7de', '#e9edf9', '#e5f3df'];
export default function App() {
  const [data, setData] = useState<WordCollection | null>(null);
  const [loadError, setLoadError] = useState('');
  const [category, setCategory] = useState('All words');
  const [deck, setDeck] = useState<WordCard[]>([]);
  const [index, setIndex] = useState(0);
  const [fullMode, setFullMode] = useState(false);
  const [segmentsVisible, setSegmentsVisible] = useState(false);
  const [activeSegment, setActiveSegment] = useState<number | null>(null);
  const [drag, setDrag] = useState(0);
  const play = useRef<HTMLElement>(null);
  const flashcard = useRef<HTMLButtonElement>(null);
  const enterButton = useRef<HTMLButtonElement>(null);
  const exitButton = useRef<HTMLButtonElement>(null);
  const gesture = useRef<{ id: number; x: number; y: number } | null>(null);
  const suppressClickUntil = useRef(0);
  const { generation, speaking, setSpeaking, error, setError, stop, say } = useSpeech(data?.language || 'en-CA');
  const item = deck[index];

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${import.meta.env.BASE_URL}words.json`, { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then((json: WordCollection) => {
        if (!Array.isArray(json.items) || !json.items.length || !json.items.every(x => typeof x.id === 'string' && typeof x.word === 'string' && typeof x.category === 'string' && Array.isArray(x.sounds))) throw new Error();
        setData(json); setDeck(json.items);
      }).catch(e => { if (e.name !== 'AbortError') setLoadError('The cards could not load. Please refresh to try again.'); });
    return () => controller.abort();
  }, []);
  const resetSpeech = useCallback(() => { stop(); setSegmentsVisible(false); setActiveSegment(null); setError(''); }, [stop, setError]);
  const move = useCallback((step: number) => {
    if (!deck.length) return;
    resetSpeech(); setIndex(i => (i + step + deck.length) % deck.length);
  }, [deck.length, resetSpeech]);
  function choose(name: string) {
    resetSpeech(); setCategory(name); setDeck(data!.items.filter(x => name === 'All words' || x.category === name)); setIndex(0);
  }
  function shuffle() {
    resetSpeech(); const copy = [...deck];
    for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; }
    setDeck(copy); setIndex(0);
  }
  async function hear() {
    if (!item) return;
    stop(); setActiveSegment(null); setError(''); const token = generation.current; setSpeaking(true);
    await say(item.speech || item.word, item.audio);
    if (token === generation.current) setSpeaking(false);
  }
  async function soundOut() {
    if (!item) return;
    stop(); setError(''); const token = generation.current; setSegmentsVisible(true);
    for (let i = 0; i < item.sounds.length; i++) {
      if (token !== generation.current) return;
      setActiveSegment(i); await say(item.sounds[i].say, item.sounds[i].audio, 0.65);
      if (token !== generation.current) return;
      setActiveSegment(null); await new Promise(r => setTimeout(r, 220));
    }
    if (token === generation.current) { setSpeaking(true); await say(item.word, item.audio, 0.7); if (token === generation.current) setSpeaking(false); }
  }
  function enterFullScreen() {
    setFullMode(true);
    try { play.current?.requestFullscreen?.().catch(() => {}); } catch { /* Use viewport mode. */ }
  }
  const exitFullScreen = useCallback(() => {
    setFullMode(false);
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    requestAnimationFrame(() => enterButton.current?.focus());
  }, []);
  useEffect(() => {
    document.body.classList.toggle('full-mode', fullMode);
    if (fullMode) exitButton.current?.focus();
    return () => { document.body.classList.remove('full-mode'); };
  }, [fullMode]);
  useEffect(() => {
    const changed = () => { if (!document.fullscreenElement) { setFullMode(false); enterButton.current?.focus(); } };
    const keyboard = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && fullMode) exitFullScreen();
      if (e.key === 'ArrowRight') { e.preventDefault(); move(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1); }
    };
    document.addEventListener('fullscreenchange', changed); document.addEventListener('keydown', keyboard);
    return () => { document.removeEventListener('fullscreenchange', changed); document.removeEventListener('keydown', keyboard); };
  }, [fullMode, exitFullScreen, move]);
  function pointerDown(e: PointerEvent<HTMLButtonElement>) {
    if (!e.isPrimary || e.button !== 0) return;
    gesture.current = { id: e.pointerId, x: e.clientX, y: e.clientY }; e.currentTarget.setPointerCapture(e.pointerId);
  }
  function pointerMove(e: PointerEvent<HTMLButtonElement>) {
    const g = gesture.current; if (!g || g.id !== e.pointerId) return;
    const dx = e.clientX - g.x, dy = e.clientY - g.y;
    if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy)) setDrag(dx);
  }
  function pointerEnd(e: PointerEvent<HTMLButtonElement>, cancelled = false) {
    const g = gesture.current; if (!g || g.id !== e.pointerId) return;
    const dx = e.clientX - g.x, dy = e.clientY - g.y; gesture.current = null; setDrag(0);
    if (Math.abs(dx) > 12 || Math.abs(dy) > 12) suppressClickUntil.current = performance.now() + 500;
    if (!cancelled && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.25) {
      move(dx < 0 ? 1 : -1);
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) flashcard.current?.animate([{ opacity: 0.3, transform: `translateX(${dx < 0 ? 30 : -30}px)` }, { opacity: 1, transform: 'translateX(0)' }], { duration: 180, easing: 'ease-out' });
    }
  }
  return <main>
    <header hidden={fullMode}><a className="brand" href="./"><span>✿</span> little words</a><span className="tag">Look. Listen. Learn.</span></header>
    <section className="intro" hidden={fullMode}><span className="eyebrow">A LITTLE PLAY, A LITTLE LEARNING</span><h1>Big discoveries.<br />Little words.</h1><p>Tap a picture and say it together.</p></section>
    <nav className="flex gap-2 overflow-auto" aria-label="Card categories" hidden={fullMode}>{data && ['All words', ...new Set(data.items.map(x => x.category))].map(name => <button key={name} className={category === name ? 'active' : ''} onClick={() => choose(name)}>{name}</button>)}</nav>
    <section className="play" ref={play} aria-label="Flashcards">
      <div className="flex justify-end mb-2.5 fullscreen-tools"><button ref={enterButton} hidden={fullMode} disabled={!item} aria-pressed={fullMode} onClick={enterFullScreen}>⛶ &nbsp; Full screen</button><button ref={exitButton} hidden={!fullMode} onClick={exitFullScreen} aria-label="Exit full screen">✕ &nbsp; Close</button></div>
      <div className="card-top flex justify-between"><span>{item?.category || 'First words'}</span><span>{item ? `${index + 1} / ${deck.length}` : ''}</span></div>
      <button ref={flashcard} className={`flashcard ${speaking ? 'speaking' : ''} ${drag ? 'dragging' : ''}`} disabled={!item} style={{ background: colors[index % colors.length], transform: drag ? `translateX(${Math.max(-120, Math.min(120, drag)) * 0.45}px) rotate(${drag * 0.015}deg)` : undefined }} aria-label={item ? `Hear ${item.word}` : 'Loading cards'} onClick={() => { if (performance.now() >= suppressClickUntil.current) void hear(); }} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={e => pointerEnd(e)} onPointerCancel={e => pointerEnd(e, true)}>
        {item?.image ? <img id="image" src={item.image} alt={item.word} /> : <span className="picture" aria-hidden="true">{item?.picture || '✿'}</span>}
        <span id="word">{item?.word || (loadError ? 'Try again' : 'Loading…')}</span><span className="tap">◖)) &nbsp; Tap to hear</span>
      </button>
      <div id="segments" className="flex flex-wrap justify-center gap-2.5 text-center" aria-live="polite">{segmentsVisible && item?.sounds.map((s, i) => <span key={`${s.label}-${i}`} className={activeSegment === i ? 'speaking' : ''}>{s.label}</span>)}</div>
      <div className="actions flex gap-2.5"><button disabled={!item} className="primary" onClick={() => void hear()}>◖)) &nbsp; Hear the word</button><button disabled={!item?.sounds.length} onClick={() => void soundOut()}>Sound it out <span>· · ·</span></button></div>
      <div className="navigation flex items-center justify-between"><button disabled={!item} aria-label="Previous card" onClick={() => move(-1)}>‹</button><span>{fullMode ? 'Swipe left or right' : 'One little word at a time'}</span><button disabled={!item} aria-label="Next card" onClick={() => move(1)}>›</button></div>
      <div className="progress"><div id="progress" style={{ width: item ? `${(index + 1) / deck.length * 100}%` : '0%' }} /></div>
      {fullMode && error && <p className="text-center text-sm mt-2" role="status">{error}</p>}
    </section>
    <footer hidden={fullMode}><span>Made for little moments together.</span><button disabled={!item} onClick={shuffle}>⤨ &nbsp; Mix it up</button></footer>
    <p className="status text-center text-sm" role="status" hidden={fullMode}>{loadError || error}</p>
  </main>;
}
