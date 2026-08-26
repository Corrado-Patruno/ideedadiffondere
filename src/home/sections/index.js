import { renderContacts } from './contacts.js';
import { renderEvents } from './events.js';
import { renderPress } from './press.js';
import { renderTeam } from './team.js';
import { renderTicker } from './ticker.js';

// Stesso ordine delle sezioni nella pagina.
export function renderHomeSections() {
  renderTicker();
  renderEvents();
  renderPress();
  renderTeam();
  renderContacts();
}
