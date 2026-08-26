import { contacts } from '../../data/content.js';
import { select } from '../../utils/dom.js';

export function initContactForm() {
  const form = select('#contact-form');
  const statusMessage = select('#form-status');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const fields = new FormData(form);
    const name = fields.get('nome');
    const email = fields.get('email');
    const message = fields.get('messaggio');

    const subject = encodeURIComponent(`Messaggio dal sito — ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);

    location.href = `mailto:${contacts.email}?subject=${subject}&body=${body}`;
    statusMessage.textContent = 'Si sta aprendo il tuo client email…';
  });
}
