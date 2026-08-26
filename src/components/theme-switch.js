import { select } from '../utils/dom.js';

const STORAGE_KEY = 'idd-theme';
const TRANSITION_MS = 500;

const readCssVariable = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export function initThemeSwitch() {
  const root = document.documentElement;
  const toggleButton = select('#theme-toggle');
  const themeColorMeta = select('meta[name="theme-color"]');
  const changeListeners = new Set();

  const currentTheme = () => (root.dataset.theme === 'dark' ? 'dark' : 'light');

  const syncBrowserChrome = () => {
    toggleButton.setAttribute('aria-pressed', String(currentTheme() === 'dark'));
    themeColorMeta.content = readCssVariable('--bg');
  };

  const applyTheme = (theme) => {
    root.classList.add('theme-switching');
    if (theme === 'dark') root.dataset.theme = 'dark';
    else delete root.dataset.theme;

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {}

    syncBrowserChrome();
    changeListeners.forEach((listener) => listener(theme));
    setTimeout(() => root.classList.remove('theme-switching'), TRANSITION_MS);
  };

  toggleButton.addEventListener('click', () => {
    applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
  });

  syncBrowserChrome();

  return {
    currentTheme,
    onChange: (listener) => changeListeners.add(listener),
    sceneColors: () => ({
      name: currentTheme(),
      background: readCssVariable('--scene-bg'),
    }),
  };
}
