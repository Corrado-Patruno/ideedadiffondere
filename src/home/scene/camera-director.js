import { CatmullRomCurve3, MathUtils, Spherical, Vector3 } from 'three';
import { INTRO, ORBIT } from '../../config.js';
import { clamp, smoothstep } from '../../utils/math.js';

const { damp } = MathUtils;

const CURVE_SUBDIVISIONS = 400;
const CURVE_TENSION = 0.25;
const ORBIT_DEAD_ZONE = 0.05;
const SWAY_SPEED = 0.25;
const SWAY_DAMPING = 3;
const PITCH_TO_DRAG_RATIO = 0.6;
const ZOOM_SENSITIVITY = 0.0025;

export class CameraDirector {
  #spherical = new Spherical();
  #gateAxis = null;

  constructor(camera, canvas) {
    this.camera = camera;
    this.canvas = canvas;

    this.ready = false;
    this.rawProgress = 0;
    this.progress = 0;
    this.orbitInfluence = 1;

    this.yaw = 0;
    this.yawTarget = 0;
    this.pitch = 0;
    this.pitchTarget = 0;
    this.zoom = 1;
    this.zoomTarget = 1;
    this.dragging = false;
    this.swayAmplitude = 1;
    this.elapsed = 0;

    this.#bindPointerInput();
  }

  setProgress(progress) {
    this.rawProgress = clamp(progress, 0, 1);
  }

  jumpTo(progress) {
    this.rawProgress = clamp(progress, 0, 1);
    this.progress = this.rawProgress;
  }

  setWorld({ radius, gate }) {
    const up = new Vector3(0, 1, 0);
    const forward = gate.direction.clone().setY(0).normalize();
    const side = new Vector3().crossVectors(up, forward).normalize();
    const gatePoint = gate.position.clone();

    const pointAt = (alongGate, lateral, height) =>
      new Vector3()
        .addScaledVector(forward, radius * alongGate)
        .addScaledVector(side, radius * lateral)
        .setY(radius * height);

    const offsetFromGate = (alongGate, height = 0) =>
      gatePoint
        .clone()
        .addScaledVector(forward, radius * alongGate)
        .add(new Vector3(0, radius * height, 0));

    this.cameraPath = this.#curve([
      pointAt(1.15, 1.25, 0.72),
      pointAt(1.5, 0.6, 0.34),
      pointAt(1.45, 0, 0.09),
      offsetFromGate(0.5, 0.012),
      offsetFromGate(0.1, 0.002),
      offsetFromGate(-0.2),
      offsetFromGate(-0.45),
    ]);

    const centre = new Vector3(0, radius * 0.04, 0);
    this.lookPath = this.#curve([
      centre.clone(),
      centre.clone(),
      gatePoint.clone().multiplyScalar(0.35).setY(radius * 0.025),
      offsetFromGate(0.1),
      gatePoint.clone(),
      offsetFromGate(-0.5),
      offsetFromGate(-0.8),
    ]);

    this.#gateAxis = {
      direction: forward.clone(),
      origin: gatePoint.clone(),
      offset: gatePoint.dot(forward),
    };

    this.progress = this.rawProgress;
    this.ready = true;
  }

  update(deltaSeconds) {
    if (!this.ready) return;
    this.elapsed += deltaSeconds;

    this.progress = damp(this.progress, this.rawProgress, INTRO.smoothing, deltaSeconds);
    const progress = clamp(this.progress, 0, 1);
    const influence = 1 - smoothstep(0, INTRO.orbitInfluenceEnd, progress);
    this.orbitInfluence = influence;

    const pathProgress = clamp(progress / INTRO.pathEnd, 0, 1);
    const position = this.cameraPath.getPointAt(pathProgress);
    const lookTarget = this.lookPath.getPointAt(pathProgress);
    this.#snapToGateAxis(position, pathProgress);
    this.#snapToGateAxis(lookTarget, pathProgress);

    this.yaw = damp(this.yaw, this.yawTarget * influence, ORBIT.damping, deltaSeconds);
    this.pitch = damp(this.pitch, this.pitchTarget * influence, ORBIT.damping, deltaSeconds);
    this.zoom = damp(this.zoom, 1 + (this.zoomTarget - 1) * influence, ORBIT.damping, deltaSeconds);
    this.swayAmplitude = damp(this.swayAmplitude, this.dragging ? 0 : 1, SWAY_DAMPING, deltaSeconds);

    const offset = position.sub(lookTarget);
    if (influence > 0.001) {
      const sway = Math.sin(this.elapsed * SWAY_SPEED) * ORBIT.idleSway * influence * this.swayAmplitude;
      const spherical = this.#spherical.setFromVector3(offset);
      spherical.theta += this.yaw + sway;
      spherical.phi = clamp(spherical.phi + this.pitch, ORBIT.minPolarAngle, ORBIT.maxPolarAngle);
      spherical.radius *= this.zoom;
      offset.setFromSpherical(spherical);
    }

    this.camera.position.copy(lookTarget).add(offset);
    this.camera.lookAt(lookTarget);
  }

  #curve(points) {
    const curve = new CatmullRomCurve3(points, false, 'catmullrom', CURVE_TENSION);
    curve.arcLengthDivisions = CURVE_SUBDIVISIONS;
    return curve;
  }

  #snapToGateAxis(point, pathProgress) {
    if (!this.#gateAxis) return;
    const blend = smoothstep(INTRO.gateAlignStart, INTRO.gateAlignEnd, pathProgress);
    if (blend <= 0) return;

    const { direction, origin, offset } = this.#gateAxis;
    const projected = origin.clone().addScaledVector(direction, point.dot(direction) - offset);
    projected.y = point.y;
    point.lerp(projected, blend);
  }

  #canOrbit() {
    return this.orbitInfluence >= ORBIT_DEAD_ZONE;
  }

  #bindPointerInput() {
    this.canvas.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'touch' || event.button !== 0 || !this.#canOrbit()) return;
      this.dragging = true;
      this.canvas.setPointerCapture(event.pointerId);
      document.body.classList.add('is-grabbing');
    });

    this.canvas.addEventListener('pointermove', (event) => {
      if (!this.dragging) return;
      this.yawTarget -= event.movementX * ORBIT.dragSpeed;
      this.pitchTarget = clamp(
        this.pitchTarget + event.movementY * ORBIT.dragSpeed * PITCH_TO_DRAG_RATIO,
        -ORBIT.maxPitchOffset,
        ORBIT.maxPitchOffset
      );
    });

    const endDrag = () => {
      this.dragging = false;
      document.body.classList.remove('is-grabbing');
    };
    this.canvas.addEventListener('pointerup', endDrag);
    this.canvas.addEventListener('pointercancel', endDrag);

    addEventListener(
      'wheel',
      (event) => {
        if (!event.ctrlKey || !this.#canOrbit()) return;
        event.preventDefault();
        this.zoomTarget = clamp(
          this.zoomTarget * Math.exp(event.deltaY * ZOOM_SENSITIVITY),
          ORBIT.minZoom,
          ORBIT.maxZoom
        );
      },
      { passive: false }
    );
  }
}
