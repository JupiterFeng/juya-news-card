const COMMON_TEMPLATE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=Poppins:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&family=Exo+2:wght@400;600;700&family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@500;700;900&family=Press+Start+2P&family=VT323&family=Fira+Code:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&family=Bebas+Neue&family=Space+Grotesk:wght@400;500;700&family=Fredoka+One&family=Nunito:wght@400;600;700;800&family=Quicksand:wght@500;600;700&family=Playfair+Display:wght@400;500;600;700;900&family=Lora:wght@400;500;600&family=Righteous&family=Noto+Sans+SC:wght@400;500;700&display=swap';
const COMMON_TEMPLATE_FONTS_ID = 'p2v-common-template-fonts';

function appendNonBlockingStylesheet(id: string, href: string): void {
  if (document.getElementById(id)) return;

  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = href;
  link.media = 'print';
  link.onload = () => {
    link.media = 'all';
  };
  document.head.appendChild(link);
}

export function scheduleNonCriticalAssetsLoad(): void {
  if (typeof window === 'undefined') return;
  const loadFonts = () => appendNonBlockingStylesheet(COMMON_TEMPLATE_FONTS_ID, COMMON_TEMPLATE_FONTS_URL);

  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(() => loadFonts(), { timeout: 1200 });
    return;
  }
  window.setTimeout(loadFonts, 320);
}
