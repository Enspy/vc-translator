import React from 'react';

const MAX_CHARS = 500;

export default function InputPanel({
  value,
  onChange,
  onTranslate,
  isLoading,
  error,
  shake,
  onClearError,
}) {
  const charCount = value.length;
  const isOver = charCount > MAX_CHARS;

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      onTranslate();
    }
  };

  const handleChange = (e) => {
    onChange(e.target.value);
    if (error) onClearError();
  };

  return (
    <div className="panel">
      <textarea
        className={`input-textarea${shake ? ' shake' : ''}`}
        placeholder="Enter text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        maxLength={MAX_CHARS}
        aria-label="Plain English input"
        spellCheck
      />
      {error && <div className="input-error">{error}</div>}
      <div className="input-footer">
        <button
          className="translate-btn"
          onClick={onTranslate}
          disabled={isLoading}
          aria-label="Translate"
        >
          {isLoading ? 'Translating…' : 'Translate'}
        </button>
        <span className={`char-count${isOver ? ' over' : ''}`}>
          {charCount} / {MAX_CHARS}
        </span>
      </div>
    </div>
  );
}
