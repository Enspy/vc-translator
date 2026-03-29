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
    tooltip: 'Arrogant. Defensive. Has mentioned his gstack unprompted.',
  },
  {
    id: 'navali',
    label: 'Navali',
    tooltip: "One aphorism per sentence. Sounds deep. Isn't.",
  },
  {
    id: 'chamath',
    label: 'Chamathic',
    tooltip: 'Everything is a structural dislocation. Talks in innings.',
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
