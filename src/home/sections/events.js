import { events } from '../../data/content.js';
import { escapeHtml, escapeUrl, select } from '../../utils/dom.js';
import { formatShortDate } from '../../utils/format.js';

const eventRow = (event) => `
  <a class="evento-row" href="${escapeUrl(event.link)}" target="_blank" rel="noopener"
     data-reveal>
    <span class="evento-data">
      ${event.isComingSoon ? 'Prossimamente' : escapeHtml(formatShortDate(event.date))}
    </span>
    <h3 class="evento-titolo">${escapeHtml(event.title)}</h3>
    <span class="evento-arrow" aria-hidden="true">→</span>
    <p class="evento-desc">${escapeHtml(event.description)}</p>
  </a>`;

export function renderEvents() {
  select('#eventi-list').innerHTML = events.map(eventRow).join('');
}
