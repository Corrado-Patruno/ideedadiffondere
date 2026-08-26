import '../styles/entry-home.css';

import { jumpToCurrentAnchor } from '../utils/anchor.js';
import { select } from '../utils/dom.js';

import { initBackToTop } from '../components/back-to-top.js';
import { initCursorTrail } from '../components/cursor-trail.js';
import { initMobileMenu } from '../components/mobile-menu.js';
import { initThemeSwitch } from '../components/theme-switch.js';

import { initContactForm } from './sections/contact-form.js';
import { createIntroLoader } from './loader.js';
import { createCastleViewer } from './scene/castle-viewer.js';
import { renderHomeSections } from './sections/index.js';
import { initScrollReveal, revealVisibleWithoutAnimation } from './scroll-reveal.js';
import { initSiteNav } from './site-nav.js';

const root = document.documentElement;
const skipIntro = root.classList.contains('no-intro');

root.classList.remove('pre-css');

const theme = initThemeSwitch();
initSiteNav();
initMobileMenu();
renderHomeSections();
initScrollReveal();
initContactForm();

const introTrack = select('#intro-track');
initBackToTop({ threshold: () => introTrack.offsetHeight - innerHeight * 0.5 });

const cursorTrail = initCursorTrail();
theme.onChange(() => cursorTrail.syncTheme());

const loader = createIntroLoader();

if (skipIntro) {
  loader.finishNow();
  jumpToCurrentAnchor();
  revealVisibleWithoutAnimation();
} else {
  loader.start();
}

const finishIntro = () => {
  if (!skipIntro) loader.finishAfterMinimumDuration();
};

createCastleViewer({ onProgress: loader.reportLoaded })
  .then((viewer) => {
    viewer.setTheme(theme.sceneColors());
    theme.onChange(() => viewer.setTheme(theme.sceneColors()));
    root.classList.add('scene-in');
    finishIntro();
  })
  .catch((error) => {
    console.error('[IDD] scena 3D non disponibile:', error);
    loader.reportLoaded(100);
    finishIntro();
  });
