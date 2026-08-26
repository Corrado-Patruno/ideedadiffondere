import { select } from '../utils/dom.js';

export function initMobileMenu() {
  const toggleButton = select('#menu-toggle');
  const menu = select('#mobile-menu');
  if (!toggleButton || !menu) return;

  const setOpen = (isOpen) => {
    document.body.classList.toggle('menu-open', isOpen);
    toggleButton.setAttribute('aria-expanded', String(isOpen));
    toggleButton.setAttribute('aria-label', isOpen ? 'Chiudi menu' : 'Apri menu');
  };

  toggleButton.addEventListener('click', () => {
    setOpen(!document.body.classList.contains('menu-open'));
  });

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link) return;
    if (menu.contains(link) || link.matches('a[href="#top"]')) setOpen(false);
  });

  addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false);
  });
}
