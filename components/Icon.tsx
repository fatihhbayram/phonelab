// PhoneLab — Lucide-style inline icon set (ported from the design example)
import type { ReactElement } from 'react';

export type IconName =
  | 'arrowRight' | 'check' | 'shield' | 'clock' | 'phone' | 'mapPin' | 'star'
  | 'instagram' | 'google' | 'menu' | 'sun' | 'moon' | 'whatsapp'
  | 'smartphone' | 'tablet' | 'watch' | 'laptop' | 'screen' | 'battery'
  | 'camera' | 'cpu' | 'wrench' | 'truck' | 'packageCheck' | 'sparkle' | 'zap'
  | 'github' | 'linkedin' | 'youtube';

const paths: Record<IconName, ReactElement> = {
  arrowRight: <path d="M5 12h14M13 5l7 7-7 7" />,
  check: <><circle cx="12" cy="12" r="9" /><path d="M9 12l2 2 4-4" /></>,
  shield: <path d="M12 2l9 4v6c0 5-4 8.5-9 10-5-1.5-9-5-9-10V6l9-4z" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  phone: <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012 4.1 2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 1.9.7 2.8a2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.5c.9.3 1.8.6 2.8.7A2 2 0 0122 16.9z" />,
  mapPin: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></>,
  star: <path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 18l-6.2 3.2L7 14.2l-5-4.9 6.9-1L12 2z" fill="currentColor" />,
  instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" /></>,
  google: <path d="M22 12a10 10 0 11-5-8.7l-3 3A6 6 0 1018 12h-6" />,
  menu: <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  moon: <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />,
  whatsapp: <path d="M17.5 14.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08s-1.26-.47-2.4-1.48c-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51H7.9c-.2 0-.52.07-.8.37s-1.03 1.02-1.03 2.48 1.06 2.88 1.2 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.62.7.23 1.35.2 1.86.12.57-.08 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.34zM12 2a10 10 0 00-8.5 15.3L2 22l4.9-1.3A10 10 0 1012 2z" fill="currentColor" stroke="none" />,
  smartphone: <><rect x="6" y="2" width="12" height="20" rx="3" /><line x1="10.5" y1="18.5" x2="13.5" y2="18.5" /></>,
  tablet: <><rect x="4" y="2" width="16" height="20" rx="3" /><line x1="10.5" y1="18.5" x2="13.5" y2="18.5" /></>,
  watch: <><rect x="7" y="7" width="10" height="10" rx="3" /><path d="M9 7l.5-3.5a1 1 0 011-.9h3a1 1 0 011 .9L15 7M15 17l-.5 3.5a1 1 0 01-1 .9h-3a1 1 0 01-1-.9L9 17" /></>,
  laptop: <><rect x="4" y="5" width="16" height="11" rx="2" /><path d="M2 20h20M2 20l1.5-2h17L22 20" /></>,
  screen: <><rect x="6" y="2" width="12" height="20" rx="3" /><path d="M9 6h6M9 9h6M9 12h3" /></>,
  battery: <><rect x="2" y="7" width="17" height="10" rx="2.5" /><path d="M22 10v4" /><path d="M6 10v4M9.5 10v4" stroke="currentColor" /></>,
  camera: <><path d="M3 8a2 2 0 012-2h2l1.5-2h7L17 6h2a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><circle cx="12" cy="12.5" r="3.5" /></>,
  cpu: <><rect x="6" y="6" width="12" height="12" rx="2" /><path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" /><rect x="9.5" y="9.5" width="5" height="5" rx="1" /></>,
  wrench: <path d="M14.5 5.5a3.5 3.5 0 00-4.6 4.3L3 16.7 6.3 20l6.9-6.9a3.5 3.5 0 004.3-4.6l-2.3 2.3-2-.5-.5-2 2.3-2.3z" />,
  truck: <><rect x="1" y="6" width="13" height="10" rx="1.5" /><path d="M14 9h4l3 3v4h-7z" /><circle cx="6" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></>,
  packageCheck: <><path d="M21 8v8a2 2 0 01-1 1.7l-7 4a2 2 0 01-2 0l-7-4A2 2 0 013 16V8a2 2 0 011-1.7l7-4a2 2 0 012 0l4.5 2.6" /><path d="M9 11.5l2 2L21 5" /></>,
  sparkle: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />,
  zap: <path d="M13 2L4 14h7l-1 8 9-12h-7z" />,
  github: <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />,
  linkedin: <><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></>,
  youtube: <><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-2C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.41 19c1.71.46 8.59.46 8.59.46s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" stroke="none" /></>,
};

export default function Icon({ name, size = 20, stroke = 1.5 }: { name: IconName; size?: number; stroke?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'inline-block', flexShrink: 0 }}
    >
      {paths[name] ?? null}
    </svg>
  );
}
