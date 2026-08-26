import { pressEntries } from '../../data/content.js';
import { escapeHtml, escapeUrl, select } from '../../utils/dom.js';
import { enableDragScroll } from '../../utils/drag-scroll.js';

const FALLBACK_STEP_PX = 400;

const pressCard = (entry) => {
  const linkAttrs = `href="${escapeUrl(entry.href)}" draggable="false"${
    entry.isInternal ? '' : ' target="_blank" rel="noopener"'
  }`;

  // L'immagine è un secondo link allo stesso indirizzo: nascosto agli screen
  // reader per non ripetere la voce del titolo.
  return `
  <article class="stampa-card">
    <a class="stampa-img" ${linkAttrs} tabindex="-1" aria-hidden="true">
      <img src="${escapeUrl(entry.image)}" alt="" loading="lazy" draggable="false" />
    </a>
    <div class="stampa-head">
      <span>${escapeHtml(entry.publisher)}</span>
      <span>${escapeHtml(entry.year)}</span>
    </div>
    <h3 class="stampa-titolo">${escapeHtml(entry.title)}</h3>
    <p class="stampa-estratto">${escapeHtml(entry.excerpt)}</p>
    <a class="stampa-link" ${linkAttrs}>
      ${entry.isInternal ? "Leggi l'articolo →" : "Vai all'articolo ↗"}
    </a>
  </article>`;
};

export function renderPress() {
  const carousel = select('#stampa-carousel');
  carousel.innerHTML = pressEntries.map(pressCard).join('');

  // Distanza fra due schede: comprende il gap reale, che in CSS è fluido.
  const stepWidth = () => {
    const [first, second] = carousel.querySelectorAll('.stampa-card');
    if (!first) return FALLBACK_STEP_PX;
    if (!second) return first.getBoundingClientRect().width;
    return second.getBoundingClientRect().left - first.getBoundingClientRect().left;
  };

  select('#stampa-prev').addEventListener('click', () => carousel.scrollBy({ left: -stepWidth() }));
  select('#stampa-next').addEventListener('click', () => carousel.scrollBy({ left: stepWidth() }));

  enableDragScroll(carousel);
}
