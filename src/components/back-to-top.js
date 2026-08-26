import { scrollToTop } from '../utils/motion.js';

const ARROW_ICON = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M12 19V5m0 0-6 6m6-6 6 6" />
  </svg>`;

const DEFAULT_THRESHOLD = () => innerHeight * 0.8;

export function initBackToTop({ threshold = DEFAULT_THRESHOLD, handlesOwnScroll = false } = {}) {
  const button = document.createElement('a');
  button.className = 'back-to-top';
  button.href = '#top';
  button.setAttribute('aria-label', 'Torna su');
  button.innerHTML = ARROW_ICON;
  document.body.appendChild(button);

  const syncVisibility = () => button.classList.toggle('is-visible', scrollY > threshold());

  addEventListener('scroll', syncVisibility, { passive: true });
  addEventListener('resize', syncVisibility);
  syncVisibility();

  if (handlesOwnScroll) {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      scrollToTop();
    });
  }
}
