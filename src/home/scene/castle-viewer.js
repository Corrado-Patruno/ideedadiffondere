import { CASTLE_MODEL_URL, DEBUG, INTRO } from '../../config.js';
import { select } from '../../utils/dom.js';
import { clamp, smoothstep } from '../../utils/math.js';
import { RESET_INTRO_EVENT } from '../site-nav.js';
import { CameraDirector } from './camera-director.js';
import { computeGate, loadCastle } from './castle-model.js';
import { SceneManager } from './scene-manager.js';

const HERO_FADE_START = 0.02;
const HERO_DRIFT_PX = -50;
const GRAB_CURSOR_UNTIL = 0.05;
const OFFSCREEN_MARGIN_PX = 50;

export async function createCastleViewer({ onProgress } = {}) {
  const canvas = select('#scena-3d');
  const introTrack = select('#intro-track');
  const manager = new SceneManager(canvas);
  const director = new CameraDirector(manager.camera, canvas);

  const scrollRange = () => Math.max(introTrack.offsetHeight - innerHeight, 1);
  const scrollProgress = () => clamp(scrollY / scrollRange(), 0, 1);

  addEventListener('scroll', () => director.setProgress(scrollProgress()), { passive: true });
  document.addEventListener(RESET_INTRO_EVENT, () => director.jumpTo(0));
  director.setProgress(scrollProgress());

  const doorwayFade = select('#intro-fade');
  const heroInner = select('.hero-inner');
  const heroHint = select('.hero-hint');
  const progressTrack = select('#intro-progress');
  const progressFill = select('#intro-progress span');

  manager.onFrame = (deltaSeconds) => {
    director.update(deltaSeconds);
    if (!director.ready) return;

    const progress = clamp(director.progress, 0, 1);
    const heroVisibility = 1 - smoothstep(HERO_FADE_START, INTRO.heroFadeEnd, progress);

    heroInner.style.opacity = heroVisibility;
    heroInner.style.transform = `translateY(${progress * HERO_DRIFT_PX}px)`;
    heroHint.style.opacity = heroVisibility;

    doorwayFade.style.opacity = smoothstep(INTRO.doorwayFadeStart, INTRO.doorwayFadeEnd, progress);

    progressFill.style.transform = `scaleY(${progress})`;
    progressTrack.style.opacity = progress > 0.01 && progress < 0.99 ? '1' : '0';

    document.body.classList.toggle('at-top', progress < GRAB_CURSOR_UNTIL);

    const canvasFullyCovered =
      director.rawProgress >= 1 && scrollY > scrollRange() + OFFSCREEN_MARGIN_PX;
    manager.renderEnabled = !canvasFullyCovered;
  };

  const { object, box, radius } = await loadCastle(CASTLE_MODEL_URL, onProgress);
  manager.scene.add(object);
  manager.setWorldScale(radius);

  const gate = computeGate(radius, box);
  director.setWorld({ radius, gate });

  if (DEBUG) {
    window.__idd = {
      manager,
      director,
      gate,
      radius,
      goTo: (progress) => scrollTo(0, progress * scrollRange()),
    };
    console.info('[IDD] debug attivo — window.__idd', { radius, gate });
  }

  return { setTheme: (colors) => manager.setTheme(colors) };
}
