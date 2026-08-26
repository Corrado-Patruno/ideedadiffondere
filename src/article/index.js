import '../styles/entry-article.css';

import { initBackToTop } from '../components/back-to-top.js';
import { initCursorTrail } from '../components/cursor-trail.js';
import { initMobileMenu } from '../components/mobile-menu.js';
import { initThemeSwitch } from '../components/theme-switch.js';

import { renderArticle } from './view.js';

const theme = initThemeSwitch();
const cursorTrail = initCursorTrail();
theme.onChange(() => cursorTrail.syncTheme());

renderArticle();
initMobileMenu();
initBackToTop({ handlesOwnScroll: true });

document.documentElement.classList.remove('pre-css');
