import { GLTFLoader } from 'https://unpkg.com/three@0.125.1/examples/jsm/loaders/GLTFLoader.js';
/**
 * A simple model loader that loads a GLTF model into the scene.
 */
class ModelLoader {
  constructor(scene) {
    this.scene = scene;
    this.loader = new GLTFLoader();
  }

  loadModel(config, onLoad) {
    this.loader.load(
      config.path,
      (gltf) => {
        const model = gltf.scene;
        model.position.set(config.position.x, config.position.y, config.position.z);
        model.scale.set(config.scale, config.scale, config.scale);
        // // Enable shadows on all meshes
        // model.traverse((child) => {
        //   if (child.isMesh) {
        //     child.castShadow = true;
        //     child.receiveShadow = true;
        //   }
        // });
        this.scene.add(model);

        // // Optionally set up animations if available
        // let mixer = null;
        // let actions = {};
        // if (gltf.animations && gltf.animations.length > 0) {
        //   mixer = new THREE.AnimationMixer(model);
        //   gltf.animations.forEach((clip) => {
        //     actions[clip.name] = mixer.clipAction(clip);
        //   });
        //   // If a "stand" animation exists, play it by default.
        //   if (actions['stand']) {
        //     actions['stand'].play();
        //   }
        // }
        // onLoad(model, mixer, actions);
      },
      undefined,
      (error) => {
        console.error('Error loading model:', error);
      }
    );
  }
}

export { ModelLoader };