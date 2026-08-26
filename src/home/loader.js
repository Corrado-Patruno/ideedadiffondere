import { INTRO_MIN_DURATION_MS } from '../config.js';
import { select } from '../utils/dom.js';
import { clamp } from '../utils/math.js';

export function createIntroLoader() {
  const root = document.documentElement;
  const loader = select('#loader');
  const progressBar = select('#loader-bar');
  const startedAt = performance.now();

  let loadedPercent = 0;
  let finished = false;

  const paint = (percent) => {
    const value = Math.round(clamp(percent, 0, 100));
    loader.style.setProperty('--p', value);
    progressBar.setAttribute('aria-valuenow', String(value));
  };

  const finish = () => {
    if (finished) return;
    finished = true;
    paint(100);
    root.classList.remove('is-loading');
    document.body.classList.add('is-ready');
  };

  const paintNextFrame = () => {
    const minimumDurationPercent = ((performance.now() - startedAt) / INTRO_MIN_DURATION_MS) * 100;
    paint(Math.min(loadedPercent, minimumDurationPercent));
    if (!finished) requestAnimationFrame(paintNextFrame);
  };

  return {
    start: paintNextFrame,
    finishNow: finish,
    reportLoaded: (percent) => {
      loadedPercent = percent;
    },
    finishAfterMinimumDuration: () => {
      const remaining = INTRO_MIN_DURATION_MS - (performance.now() - startedAt);
      setTimeout(finish, Math.max(0, remaining));
    },
  };
}
