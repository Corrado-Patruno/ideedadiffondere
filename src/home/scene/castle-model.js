import { Box3, Sphere, Vector3 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { GATE } from '../../config.js';

const MAX_REPORTED_PROGRESS = 99;

export async function loadCastle(url, onProgress) {
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);

  const gltf = await new Promise((resolve, reject) => {
    loader.load(
      url,
      resolve,
      (event) => {
        if (event.total > 0) {
          onProgress?.(Math.min(MAX_REPORTED_PROGRESS, (event.loaded / event.total) * 100));
        }
      },
      reject
    );
  });

  const object = gltf.scene;
  const centre = new Box3().setFromObject(object).getCenter(new Vector3());
  object.position.sub(centre);
  object.updateMatrixWorld(true);

  const box = new Box3().setFromObject(object);
  const { radius } = box.getBoundingSphere(new Sphere());

  onProgress?.(100);
  return { object, box, radius };
}

export function computeGate(radius, box) {
  const direction = new Vector3(...GATE.direction).setY(0).normalize();
  const side = new Vector3().crossVectors(new Vector3(0, 1, 0), direction).normalize();
  const height = box.max.y - box.min.y;

  const position = direction
    .clone()
    .multiplyScalar(radius * GATE.radialDistance)
    .addScaledVector(side, radius * GATE.lateralOffset)
    .setY(box.min.y + height * GATE.heightFactor);

  return { position, direction };
}
