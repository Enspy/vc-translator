import React, { useEffect, useRef } from 'react';
import CopyButton from './CopyButton';

export default function OutputPanel({ output, isLoading, loadingMsg }) {
  const bodyRef = useRef(null);

  // Auto-scroll to bottom as tokens stream in
  useEffect(() => {
    if (bodyRef.current && output) {
      const el = bodyRef.current;
      el.scrollTop = el.scrollHeight;
    }
  }, [output]);

  const renderBody = () => {
    if (output) {
      return <div className="output-text">{output}</div>;
    }
    if (isLoading) {
      return (
        <div className="output-loading">
          <div className="output-loading-label">{loadingMsg || 'Translating…'}</div>
        </div>
      );
    }
    return <div className="output-placeholder">Translation will appear here</div>;
  };

  return (
    <div className="panel">
      <div className="output-body" ref={bodyRef}>
        {renderBody()}
      </div>
      <div className="output-footer">
        {output && !isLoading && <CopyButton text={output} />}
      </div>
    </div>
  );
}
