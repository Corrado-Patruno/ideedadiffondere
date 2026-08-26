import { tickerWords } from '../../data/content.js';
import { escapeHtml, select } from '../../utils/dom.js';

const PIXELS_PER_SECOND = 55;
const RESIZE_DEBOUNCE_MS = 200;

const groupMarkup = () =>
  `<span class="ticker-group">${tickerWords
    .map((word) => `<span>${escapeHtml(word)}</span><span>·</span>`)
    .join('')}</span>`;

export function renderTicker() {
  const track = select('#ticker-inner');
  const group = groupMarkup();

  const build = () => {
    track.innerHTML = group;
    const groupWidth = track.firstElementChild.getBoundingClientRect().width;
    if (!groupWidth) return;

    const copiesNeeded = Math.ceil(innerWidth / groupWidth) + 1;
    track.innerHTML = group.repeat(copiesNeeded);
    track.style.setProperty('--ticker-shift', `${groupWidth}px`);
    track.style.setProperty('--ticker-dur', `${groupWidth / PIXELS_PER_SECOND}s`);
  };

  build();
  document.fonts?.ready.then(build);

  let resizeTimer;
  addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(build, RESIZE_DEBOUNCE_MS);
  });
}
