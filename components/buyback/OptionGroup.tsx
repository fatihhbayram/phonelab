'use client';

// OptionGroup — sihirbazda tek bir durum grubunu seçilebilir kartlar olarak gösterir.
// Seçenekler (key/label) GET /api/buyback/calculate metadata'sından gelir — hardcode yok.

export interface BuybackOption { key: string; label: string; factor?: number }

// Sade onay işareti (Icon.check çift-halka gösteriyor; tick rozeti için düz çizgi).
function Tick() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12l4 4 10-10" />
    </svg>
  );
}

export default function OptionGroup({
  label, options, value, onChange,
}: {
  label: string;
  options: BuybackOption[];
  value: string;
  onChange: (key: string) => void;
}) {
  const labelId = `optgrp-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div className="bw-field">
      <span className="bw-field-label" id={labelId}>{label}</span>
      <div className="bw-opts" role="radiogroup" aria-labelledby={labelId}>
        {options.map((o) => {
          const on = o.key === value;
          return (
            <button
              key={o.key}
              type="button"
              role="radio"
              aria-checked={on}
              className={'bw-opt' + (on ? ' is-on' : '')}
              onClick={() => onChange(o.key)}
            >
              <span className="bw-opt-label">{o.label}</span>
              <span className="bw-opt-tick">{on && <Tick />}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
