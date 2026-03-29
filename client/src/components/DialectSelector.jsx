import React from 'react';

const DIALECTS = [
  {
    id: 'andreessen',
    label: 'Andreessenese',
    tooltip: 'Civilization-scale takes. Manifestos only.',
  },
  {
    id: 'tanglish',
    label: 'Tanglish',
    tooltip: 'Passionate. Unhinged. Has a YouTube video about this.',
  },
  {
    id: 'navali',
    label: 'Navali',
    tooltip: "One aphorism per sentence. Sounds deep. Isn't.",
  },
  {
    id: 'chamath',
    label: 'Chamath-ic',
    tooltip: 'Everything is a structural dislocation. Talks in innings.',
  },
  {
    id: 'pg',
    label: 'PG Mode',
    tooltip: 'Deceptively simple sentences. Still condescending.',
  },
  {
    id: 'illscience',
    label: '@illscience',
    tooltip: "Multi-armed bandits. Laws of physics. The only art left.",
  },
];

export default function DialectSelector({ active, onChange }) {
  return (
    <div className="lang-target" role="tablist" aria-label="Dialect selector">
      {DIALECTS.map((d) => (
        <button
          key={d.id}
          role="tab"
          aria-selected={active === d.id}
          className={`dialect-pill${active === d.id ? ' active' : ''}`}
          onClick={() => onChange(d.id)}
          data-tooltip={d.tooltip}
        >
          {d.label}
        </button>
      ))}
    </div>
  );
}
