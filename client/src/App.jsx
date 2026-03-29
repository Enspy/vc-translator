import React, { useState, useRef, useCallback } from 'react';
import DialectSelector from './components/DialectSelector';
import InputPanel from './components/InputPanel';
import OutputPanel from './components/OutputPanel';
import { translate } from './lib/api';

const LOADING_MESSAGES = [
  'Restructuring incentive frameworks…',
  "Consulting Schumpeter's ghost…",
  'Deriving from first principles…',
  'Deploying conviction capital…',
  'Reframing the problem space…',
  'Running Monte Carlo on your take…',
];

export default function App() {
  const [input, setInput] = useState('');
  const [dialect, setDialect] = useState('andreessen');
  // words: array of { id: number, text: string }
  const [words, setWords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');

  const loadingIntervalRef = useRef(null);
  const wordBuffer = useRef('');
  const wordCounter = useRef(0);

  const startLoadingMessages = () => {
    let i = Math.floor(Math.random() * LOADING_MESSAGES.length);
    setLoadingMsg(LOADING_MESSAGES[i]);
    loadingIntervalRef.current = setInterval(() => {
      i = (i + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[i]);
    }, 2200);
  };

  const stopLoadingMessages = () => {
    clearInterval(loadingIntervalRef.current);
    loadingIntervalRef.current = null;
    setLoadingMsg('');
  };

  const flushBuffer = (final = false) => {
    const buf = wordBuffer.current;
    if (!buf) return;

    // Split on whitespace boundaries, keeping the delimiters as separate tokens
    const parts = final ? [buf] : buf.split(/(\s+)/);
    const toFlush = final ? parts : parts.slice(0, -1);
    wordBuffer.current = final ? '' : (parts[parts.length - 1] ?? '');

    if (toFlush.length > 0) {
      const newWords = toFlush
        .filter(t => t.length > 0)
        .map(text => ({ id: wordCounter.current++, text }));
      if (newWords.length > 0) {
        setWords(prev => [...prev, ...newWords]);
      }
    }
  };

  const handleTranslate = useCallback(async () => {
    if (!input.trim()) {
      setError('Even VCs need something to translate.');
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }

    setError('');
    setWords([]);
    wordBuffer.current = '';
    wordCounter.current = 0;
    setIsLoading(true);
    startLoadingMessages();

    await translate(
      input,
      dialect,
      (chunk) => {
        wordBuffer.current += chunk;
        flushBuffer(false);
      },
      () => {
        flushBuffer(true);
        setIsLoading(false);
        stopLoadingMessages();
      },
      (errMsg) => {
        flushBuffer(true);
        setIsLoading(false);
        stopLoadingMessages();
        setError(errMsg || 'The algorithm failed. A sign, perhaps, that we are too early.');
      }
    );
  }, [input, dialect]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <nav className="nav">
        <span className="nav-logo">🧠</span>
        <span className="nav-title">VCTranslate</span>
      </nav>

      <div className="lang-bar">
        <div className="lang-source">
          <span className="lang-source-label">Plain English</span>
        </div>
        <span className="lang-swap" aria-hidden="true">⇌</span>
        <DialectSelector active={dialect} onChange={setDialect} />
      </div>

      <div className="panels-wrapper">
        <InputPanel
          value={input}
          onChange={setInput}
          onTranslate={handleTranslate}
          isLoading={isLoading}
          error={error}
          shake={shake}
          onClearError={() => setError('')}
        />
        <OutputPanel
          words={words}
          isLoading={isLoading}
          loadingMsg={loadingMsg}
        />
      </div>
    </div>
  );
}
