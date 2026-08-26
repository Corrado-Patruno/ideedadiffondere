import { select } from '../utils/dom.js';
import { scrollToTop } from '../utils/motion.js';

export const RESET_INTRO_EVENT = 'idd:reset-intro';

export function initSiteNav() {
  const nav = select('#site-nav');
  const introTrack = select('#intro-track');

  const syncScrolledState = () => {
    const contentReachesViewport = introTrack.offsetHeight - innerHeight * 1.15;
    nav.classList.toggle('scrolled', scrollY > contentReachesViewport);
  };

  addEventListener('scroll', syncScrolledState, { passive: true });
  syncScrolledState();

  document.addEventListener('click', (event) => {
    if (!event.target.closest('a[href="#top"]')) return;
    event.preventDefault();
    const jumpedInstantly = scrollToTop();
    if (jumpedInstantly) document.dispatchEvent(new CustomEvent(RESET_INTRO_EVENT));
    syncScrolledState();
  });
}
