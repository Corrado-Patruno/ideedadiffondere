import { select } from '../utils/dom.js';

const STORAGE_KEY = 'idd-theme';

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
    const update = () => {
      if (theme === 'dark') root.dataset.theme = 'dark';
      else delete root.dataset.theme;

      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch {}

      syncBrowserChrome();
      changeListeners.forEach((listener) => listener(theme));
    };

    // Un crossfade nativo dell'intera pagina, che non tocca (e quindi non
    // rompe) le transizioni CSS già definite sui singoli componenti.
    if (document.startViewTransition) {
      const transition = document.startViewTransition(update);
      transition.ready.catch(() => {});
      transition.finished.catch(() => {});
    } else {
      update();
    }
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
