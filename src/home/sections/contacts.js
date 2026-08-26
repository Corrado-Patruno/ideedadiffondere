import { contacts } from '../../data/content.js';
import { escapeHtml, escapeUrl, select } from '../../utils/dom.js';

export function renderContacts() {
  select('#contatti-info').innerHTML = `
    <div class="info-row">
      <span class="info-label">Email</span>
      <a class="info-value" href="mailto:${escapeHtml(contacts.email)}">
        ${escapeHtml(contacts.email)}
      </a>
    </div>
    <div class="info-row">
      <span class="info-label">Instagram</span>
      <a class="info-value" href="${escapeUrl(contacts.instagram.url)}" target="_blank" rel="noopener">
        ${escapeHtml(contacts.instagram.handle)}
      </a>
    </div>`;
}
