import React, { useEffect, useRef } from 'react';
import CopyButton from './CopyButton';

export default function OutputPanel({ words, isLoading, loadingMsg }) {
  const bodyRef = useRef(null);
  const prevWordCount = useRef(0);

  // Auto-scroll to bottom as new words arrive
  useEffect(() => {
    if (bodyRef.current && words.length > prevWordCount.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
    prevWordCount.current = words.length;
  }, [words.length]);

  const hasOutput = words.length > 0;
  const copyText = words.map(w => w.text).join('');

  const renderBody = () => {
    if (hasOutput) {
      return (
        <div className="output-text">
          {words.map((w, i) => {
            const isNew = i >= words.length - 8; // only animate the latest batch
            return (
              <span key={w.id} className={isNew ? 'word-new' : undefined}>
                {w.text}
              </span>
            );
          })}
        </div>
      );
    }
    if (isLoading) {
      return <div className="output-loading-label">{loadingMsg || 'Translating…'}</div>;
    }
    return <div className="output-placeholder">Translation</div>;
  };

  return (
    <div className="panel panel-right">
      <div className="output-body" ref={bodyRef}>
        {renderBody()}
      </div>
      <div className="output-footer">
        {hasOutput && !isLoading && <CopyButton text={copyText} />}
      </div>
    </div>
  );
}
