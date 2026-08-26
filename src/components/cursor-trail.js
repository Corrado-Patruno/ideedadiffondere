import { CURSOR_TRAIL } from '../config.js';
import { clamp } from '../utils/math.js';
import { hasFinePointer, prefersReducedMotion } from '../utils/motion.js';

const GLOW_FALLOFF = [
  [0, 1],
  [0.06, 0.93],
  [0.12, 0.74],
  [0.2, 0.5],
  [0.3, 0.29],
  [0.45, 0.13],
  [0.65, 0.04],
  [0.85, 0.01],
  [1, 0],
];

const DEFAULT_FOREGROUND = [20, 20, 18];
const DEFAULT_BACKGROUND = [241, 239, 233];
const MAX_PIXEL_RATIO = 2;

function toRgbChannels(cssColor, fallback) {
  const hex = String(cssColor).trim().replace('#', '');
  if (/^[0-9a-f]{3}$/i.test(hex)) return [...hex].map((digit) => parseInt(digit + digit, 16));
  if (/^[0-9a-f]{6}$/i.test(hex)) {
    const packed = parseInt(hex, 16);
    return [(packed >> 16) & 255, (packed >> 8) & 255, packed & 255];
  }
  const numbers = String(cssColor).match(/\d+(\.\d+)?/g);
  return numbers?.length >= 3 ? numbers.slice(0, 3).map(Number) : fallback;
}

const approach = (current, target, rate) => current + (target - current) * rate;

export function initCursorTrail() {
  const noTrail = { syncTheme() {} };
  if (!hasFinePointer() || prefersReducedMotion()) return noTrail;

  const canvas = document.createElement('canvas');
  canvas.className = 'cursor-trail';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  document.documentElement.classList.add('has-cursor-trail');

  const context = canvas.getContext('2d');
  const chain = Array.from({ length: CURSOR_TRAIL.nodeCount }, () => ({ x: 0, y: 0 }));
  const halfWidths = new Float32Array(chain.length);
  const footer = document.querySelector('.site-footer');
  const pointer = { x: 0, y: 0 };

  let animationFrame = 0;
  let chainSeeded = false;
  let speedFactor = 0;
  let presence = 0;
  let pointerInside = false;
  let footerBlend = 0;
  let foreground = DEFAULT_FOREGROUND;
  let background = DEFAULT_BACKGROUND;
  let channels = DEFAULT_FOREGROUND.join(', ');

  const syncTheme = () => {
    const styles = getComputedStyle(document.documentElement);
    foreground = toRgbChannels(styles.getPropertyValue('--fg'), DEFAULT_FOREGROUND);
    background = toRgbChannels(styles.getPropertyValue('--bg'), DEFAULT_BACKGROUND);
  };

  const resizeCanvas = () => {
    const pixelRatio = Math.min(devicePixelRatio || 1, MAX_PIXEL_RATIO);
    canvas.width = Math.round(innerWidth * pixelRatio);
    canvas.height = Math.round(innerHeight * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.lineCap = 'round';
    context.lineJoin = 'round';
  };

  const distanceBetween = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  function measureTaper() {
    let totalLength = 0;
    for (let i = 1; i < chain.length; i++) totalLength += distanceBetween(chain[i], chain[i - 1]);

    let walked = 0;
    for (let i = 0; i < chain.length; i++) {
      if (i > 0) walked += distanceBetween(chain[i], chain[i - 1]);
      halfWidths[i] = totalLength > 0 ? (CURSOR_TRAIL.headWidth / 2) * (1 - walked / totalLength) : 0;
    }
  }

  function edgePoint(index, side) {
    const previous = chain[Math.max(0, index - 1)];
    const next = chain[Math.min(chain.length - 1, index + 1)];
    const dx = next.x - previous.x;
    const dy = next.y - previous.y;
    const length = Math.hypot(dx, dy) || 1;
    const half = halfWidths[index];
    return [chain[index].x - (dy / length) * half * side, chain[index].y + (dx / length) * half * side];
  }

  function fillRibbon(head) {
    measureTaper();
    context.globalAlpha = CURSOR_TRAIL.ribbonOpacity * presence;
    context.fillStyle = `rgb(${channels})`;
    context.beginPath();

    for (let i = 0; i < chain.length; i++) {
      const [x, y] = edgePoint(i, 1);
      if (i === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    for (let i = chain.length - 1; i >= 0; i--) {
      const [x, y] = edgePoint(i, -1);
      context.lineTo(x, y);
    }

    context.closePath();
    context.moveTo(head.x + CURSOR_TRAIL.headWidth / 2, head.y);
    context.arc(head.x, head.y, CURSOR_TRAIL.headWidth / 2, 0, Math.PI * 2);
    context.fill();
    context.globalAlpha = 1;
  }

  function fillGlow(head) {
    const radius = CURSOR_TRAIL.glowRadius * (1 + CURSOR_TRAIL.glowSpread * speedFactor);
    const gradient = context.createRadialGradient(head.x, head.y, 0, head.x, head.y, radius);
    const coreOpacity = CURSOR_TRAIL.glowOpacity * presence;

    for (const [stop, falloff] of GLOW_FALLOFF) {
      gradient.addColorStop(stop, `rgba(${channels}, ${coreOpacity * falloff})`);
    }

    context.fillStyle = gradient;
    context.beginPath();
    context.arc(head.x, head.y, radius, 0, Math.PI * 2);
    context.fill();
  }

  function draw() {
    animationFrame = 0;
    context.clearRect(0, 0, innerWidth, innerHeight);

    const head = chain[0];
    const previousHead = { x: head.x, y: head.y };
    head.x = pointer.x;
    head.y = pointer.y;

    const speed = distanceBetween(head, previousHead);
    const targetSpeedFactor = clamp(speed / CURSOR_TRAIL.fullSpeed, 0, 1);
    speedFactor = approach(speedFactor, targetSpeedFactor, targetSpeedFactor > speedFactor ? 0.5 : 0.25);
    presence = approach(presence, pointerInside ? 1 : 0, 0.12);

    const footerBox = footer?.getBoundingClientRect();
    const overFooter = footerBox && head.y >= footerBox.top && head.y <= footerBox.bottom ? 1 : 0;
    footerBlend = approach(footerBlend, overFooter, 0.18);
    channels = foreground
      .map((channel, i) => Math.round(channel + (background[i] - channel) * footerBlend))
      .join(', ');

    const follow =
      CURSOR_TRAIL.followWhileStill +
      (CURSOR_TRAIL.followWhileMoving - CURSOR_TRAIL.followWhileStill) * speedFactor;
    for (let i = 1; i < chain.length; i++) {
      chain[i].x = approach(chain[i].x, chain[i - 1].x, follow);
      chain[i].y = approach(chain[i].y, chain[i - 1].y, follow);
    }

    if (presence > 0.01) {
      fillRibbon(head);
      fillGlow(head);
    }

    const tailGap = distanceBetween(pointer, chain[chain.length - 1]);
    const stillBlending = Math.abs(overFooter - footerBlend) > 0.01;
    const keepAnimating =
      presence > 0.01 ||
      speedFactor > 0.01 ||
      speed > CURSOR_TRAIL.idleSpeed ||
      tailGap > 1 ||
      stillBlending;

    if (keepAnimating) animationFrame = requestAnimationFrame(draw);
  }

  const wake = () => {
    if (!animationFrame) animationFrame = requestAnimationFrame(draw);
  };

  addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerType !== 'mouse') return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointerInside = true;
      if (!chainSeeded) {
        chainSeeded = true;
        chain.forEach((node) => {
          node.x = pointer.x;
          node.y = pointer.y;
        });
      }
      wake();
    },
    { passive: true }
  );

  const handlePointerLeft = () => {
    pointerInside = false;
    wake();
  };

  document.addEventListener('mouseleave', handlePointerLeft);
  addEventListener('blur', handlePointerLeft);
  addEventListener('resize', resizeCanvas);

  syncTheme();
  resizeCanvas();

  return { syncTheme };
}
