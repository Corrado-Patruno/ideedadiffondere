export const DEBUG = new URLSearchParams(location.search).has('debug');

export const CASTLE_MODEL_URL = '/model/castello.glb';

export const INTRO_MIN_DURATION_MS = 2000;

export const RENDER = {
  fieldOfView: 45,
  maxPixelRatio: 2,
};

export const INTRO = {
  smoothing: 4.5,
  heroFadeEnd: 0.18,
  pathEnd: 0.8,
  gateAlignStart: 0.5,
  gateAlignEnd: 0.72,
  doorwayFadeStart: 0.74,
  doorwayFadeEnd: 0.9,
  orbitInfluenceEnd: 0.1,
};

export const ORBIT = {
  maxPitchOffset: 0.5,
  minPolarAngle: 0.35,
  maxPolarAngle: 1.3,
  minZoom: 0.7,
  maxZoom: 1.25,
  damping: 5,
  dragSpeed: 0.005,
  idleSway: 0.035,
};

export const GATE = {
  direction: [0, 0, 1],
  radialDistance: 0.7,
  lateralOffset: -0.0334,
  heightFactor: 0.5,
};

export const CURSOR_TRAIL = {
  nodeCount: 26,
  followWhileMoving: 0.16,
  followWhileStill: 0.5,
  headWidth: 16,
  ribbonOpacity: 0.24,
  fullSpeed: 26,
  idleSpeed: 0.4,
  glowRadius: 42,
  glowSpread: 0.5,
  glowOpacity: 0.9,
};

export const LIGHTING = {
  light: { key: 1.8, rim: 0.55, ambient: 0.55 },
  dark: { key: 1.1, rim: 0.4, ambient: 0.3 },
};
