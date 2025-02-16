// classes/ModelLoader.js
import * as THREE from 'https://unpkg.com/three@0.125.1/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.125.1/examples/jsm/loaders/GLTFLoader.js';

export class ModelLoader {
  constructor(scene) {
    this.scene = scene;
    this.loader = new GLTFLoader();
  }

  loadModel(config) {
    return new Promise((resolve, reject) => {
      this.loader.load(
        config.path,
        (gltf) => {
          const model = gltf.scene;
          model.position.set(config.position.x, config.position.y, config.position.z);
          model.scale.set(config.scale, config.scale, config.scale);

          // Enable shadows for all meshes
          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          this.scene.add(model);

          let mixer = null;
          let actions = {};
          if (gltf.animations && gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(model);
            gltf.animations.forEach((clip) => {
              actions[clip.name] = mixer.clipAction(clip);
            });
            // Optionally start a default animation (e.g., "stand")
            if (actions['stand']) {
              actions['stand'].play();
            }
          }
          resolve({ model, mixer, actions });
        },
        undefined,
        (error) => {
          console.error('Error loading model:', error);
          reject(error);
        }
      );
    });
  }
}
