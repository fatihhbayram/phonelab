// PhoneLab — site-wide constants (placeholder phone/WhatsApp until provided)

export const WA_NUMBER = '905345913671';

export const WA_LINK =
  `https://wa.me/${WA_NUMBER}?text=` +
  encodeURIComponent('Merhaba PhoneLab, cihazım için bilgi almak istiyorum.');

export function waLinkFor(message: string) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
}
