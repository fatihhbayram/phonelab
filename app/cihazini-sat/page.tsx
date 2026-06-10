// /cihazini-sat — server component: sayfa metadata'sı + client kabuğu.
// (Legal sayfalardaki server-page + client-shell deseni; metadata client'ta export edilemez.)
import type { Metadata } from 'next';
import CihaziniSatClient from './CihaziniSatClient';

export const metadata: Metadata = {
  title: 'Cihazını Sat — Apple Cihaz Alımı · PhoneLab',
  description:
    'iPhone, iPad ve Apple Watch cihazınızı satın. Modelinizi ve durumunu birkaç adımda seçin, alım teklifinizi WhatsApp üzerinden hızlıca alın. Maltepe, İstanbul.',
  openGraph: {
    title: 'Cihazını Sat — Apple Cihaz Alımı · PhoneLab',
    description:
      'Apple cihazınızı satın: birkaç adımda seçim yapın, teklifinizi WhatsApp’tan alın.',
  },
};

export default function CihaziniSatPage() {
  return <CihaziniSatClient />;
}
