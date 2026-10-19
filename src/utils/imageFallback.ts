/**
 * Fallback image data URI & helper for VAYRO Market
 * Ensures that if any external photo fails to load or the network glitches,
 * a clean, branded, high-contrast SVG placeholder is shown instead of a broken icon.
 */

export const FALLBACK_IMAGE_DATA_URI =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750" fill="%23F0EEE6"><rect width="600" height="750" fill="%23F0EEE6"/><rect x="20" y="20" width="560" height="710" fill="none" stroke="%23E2E5DE" stroke-width="2" stroke-dasharray="8 8"/><circle cx="300" cy="330" r="48" fill="%23E2E5DE"/><path d="M280 340 L300 315 L320 340 Z" fill="%23646A63"/><circle cx="288" cy="312" r="5" fill="%23646A63"/><text x="50%" y="430" dominant-baseline="middle" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, Cairo, sans-serif" font-size="22" font-weight="900" fill="%2320241F" letter-spacing="1">VAYRO MARKET</text><text x="50%" y="465" dominant-baseline="middle" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, Cairo, sans-serif" font-size="14" font-weight="600" fill="%23646A63">صورة المنتج قيد التحديث</text></svg>';

export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = e.currentTarget;
  if (target.src !== FALLBACK_IMAGE_DATA_URI) {
    target.src = FALLBACK_IMAGE_DATA_URI;
  }
};
