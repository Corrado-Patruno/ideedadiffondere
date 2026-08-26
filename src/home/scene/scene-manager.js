import { AmbientLight, Clock, Color, DirectionalLight, Fog, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { LIGHTING, RENDER } from '../../config.js';

const MAX_FRAME_DELTA_S = 0.05;

export class SceneManager {
  #clock = new Clock();

  constructor(canvas) {
    this.renderer = new WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, RENDER.maxPixelRatio));

    this.scene = new Scene();
    this.camera = new PerspectiveCamera(RENDER.fieldOfView, innerWidth / innerHeight, 0.5, 5000);

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

    this.renderer.setAnimationLoop(() => this.#renderFrame());
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

  #renderFrame() {
    const deltaSeconds = Math.min(this.#clock.getDelta(), MAX_FRAME_DELTA_S);
    this.onFrame?.(deltaSeconds);
    if (this.renderEnabled) this.renderer.render(this.scene, this.camera);
  }

  #fitToViewport() {
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(innerWidth, innerHeight);
  }
}
