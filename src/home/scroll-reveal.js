import { selectAll } from '../utils/dom.js';

const REVEAL_SELECTOR = '[data-reveal]';
const VISIBLE_CLASS = 'is-in';

const inReadingOrder = (a, b) =>
  a.boundingClientRect.top - b.boundingClientRect.top ||
  a.boundingClientRect.left - b.boundingClientRect.left;

export function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      // `--d` è la posizione nel gruppo che entra ora, non l'indice assoluto:
      // ogni riga riparte da zero e il ritardo non cresce con le schede.
      entries
        .filter((entry) => entry.isIntersecting)
        .sort(inReadingOrder)
        .forEach((entry, position) => {
          entry.target.style.setProperty('--d', String(position));
          entry.target.classList.add(VISIBLE_CLASS);
          observer.unobserve(entry.target);
        });
    },
    { threshold: 0.15, rootMargin: '0px 0px -5% 0px' }
  );

  selectAll(REVEAL_SELECTOR).forEach((element) => observer.observe(element));
}

export function revealVisibleWithoutAnimation() {
  const root = document.documentElement;
  root.classList.add('reveal-instant');

  selectAll(REVEAL_SELECTOR).forEach((element) => {
    const box = element.getBoundingClientRect();
    if (box.top < innerHeight && box.bottom > 0) element.classList.add(VISIBLE_CLASS);
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => root.classList.remove('reveal-instant'));
  });
}
