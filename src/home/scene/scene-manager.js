import { AmbientLight, Color, DirectionalLight, Fog, PerspectiveCamera, Scene, Timer, WebGLRenderer } from 'three';
import { LIGHTING, RENDER } from '../../config.js';

const MAX_FRAME_DELTA_S = 0.05;

export class SceneManager {
  #timer = new Timer();

  constructor(canvas) {
    const isMobile = matchMedia('(pointer: coarse)').matches;

    this.renderer = new WebGLRenderer({ canvas, antialias: !isMobile });
    this.renderer.setPixelRatio(
      Math.min(devicePixelRatio, isMobile ? RENDER.mobileMaxPixelRatio : RENDER.maxPixelRatio)
    );

    this.scene = new Scene();
    // Aspect fisso: l'inquadratura del castello non cambia mai ridimensionando
    // la finestra, si ritaglia soltanto (come un object-fit: cover).
    this.camera = new PerspectiveCamera(RENDER.fieldOfView, RENDER.referenceAspect, 0.5, 5000);

    this.lights = {
      key: new DirectionalLight(0xffffff, LIGHTING.light.key),
      rim: new DirectionalLight(0xffffff, LIGHTING.light.rim),
      ambient: new AmbientLight(0xffffff, LIGHTING.light.ambient),
    };
    this.lights.key.position.set(0.5, 1, 0.75);
    this.lights.rim.position.set(-0.6, 0.5, -0.8);
    Object.values(this.lights).forEach((light) => this.scene.add(light));

    this.onFrame = null;
    this.renderEnabled = true;

    this.#fitToViewport();
    this.#timer.connect(document);
    this.renderer.setAnimationLoop((timestamp) => this.#renderFrame(timestamp));
    addEventListener('resize', () => this.#fitToViewport());
  }

  setWorldScale(radius) {
    this.camera.near = Math.max(radius * 0.002, 0.1);
    this.camera.far = radius * 30;
    this.camera.updateProjectionMatrix();
    this.scene.fog = new Fog(0xffffff, radius * 1.6, radius * 8);
  }

  setTheme({ name, background }) {
    const color = new Color(background);
    this.scene.background = color;
    this.scene.fog?.color.copy(color);

    const intensity = LIGHTING[name] ?? LIGHTING.light;
    this.lights.key.intensity = intensity.key;
    this.lights.rim.intensity = intensity.rim;
    this.lights.ambient.intensity = intensity.ambient;
  }

  #renderFrame(timestamp) {
    this.#timer.update(timestamp);
    const deltaSeconds = Math.min(this.#timer.getDelta(), MAX_FRAME_DELTA_S);
    this.onFrame?.(deltaSeconds);
    if (this.renderEnabled) this.renderer.render(this.scene, this.camera);
  }

  // Copre sempre l'intero viewport senza mai deformare o "rimpicciolire"
  // l'inquadratura: quando la finestra ha proporzioni diverse da
  // RENDER.referenceAspect si ritaglia (come object-fit: cover), l'immagine
  // non viene mai scalata rispetto a quella di riferimento.
  #fitToViewport() {
    const viewportAspect = innerWidth / innerHeight;
    const wider = viewportAspect > RENDER.referenceAspect;
    const width = wider ? innerWidth : innerHeight * RENDER.referenceAspect;
    const height = wider ? innerWidth / RENDER.referenceAspect : innerHeight;
    this.renderer.setSize(width, height);
  }
}
