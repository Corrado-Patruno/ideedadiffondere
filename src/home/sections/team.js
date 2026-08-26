import { teamMembers } from '../../data/content.js';
import { escapeHtml, escapeUrl, select, selectAll } from '../../utils/dom.js';
import { initialsOf } from '../../utils/format.js';

// Il nome è già scritto sotto la foto: l'immagine resta decorativa (alt vuoto).
const photo = (member) => {
  const content = `
      <img src="${escapeUrl(member.photo)}" alt="" loading="lazy" />
      <span class="initials" aria-hidden="true">${escapeHtml(initialsOf(member.name))}</span>`;

  if (!member.linkedin) return `<div class="team-photo">${content}</div>`;

  return `
    <a class="team-photo" href="${escapeUrl(member.linkedin)}" target="_blank" rel="noopener"
       aria-label="${escapeHtml(member.name)} su LinkedIn">${content}
    </a>`;
};

const memberCard = (member) => `
  <article class="team-card" data-reveal>
    ${photo(member)}
    <div class="team-meta">
      <span class="team-name">${escapeHtml(member.name)}</span>
      ${member.role ? `<span class="team-role">${escapeHtml(member.role)}</span>` : ''}
    </div>
  </article>`;

export function renderTeam() {
  const grid = select('#team-grid');
  grid.innerHTML = teamMembers.map(memberCard).join('');

  selectAll('img', grid).forEach((image) => {
    image.addEventListener('error', () => image.classList.add('broken'));
  });
}
