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
  return (
    <div className="bw-field">
      <span className="bw-field-label">{label}</span>
      <div className="bw-opts">
        {options.map((o) => {
          const on = o.key === value;
          return (
            <button
              key={o.key}
              type="button"
              className={'bw-opt' + (on ? ' is-on' : '')}
              aria-pressed={on}
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
