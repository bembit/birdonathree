import * as THREE from 'https://unpkg.com/three@0.125.1/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.125.1/examples/jsm/loaders/GLTFLoader.js';

export class PlayerCharacter {
  constructor(scene, path, name) {
    this.scene = scene;
    this.loader = new GLTFLoader();
    this.mixer = null;
    this.actions = {};
    this.currentAction = null;

    this.loader.load(
      path,
      (gltf) => {
        this.model = gltf.scene;
        this.model.name = name;
        this.scene.add(this.model);

        if (gltf.animations && gltf.animations.length > 0) {
          this.mixer = new THREE.AnimationMixer(this.model);

          gltf.animations.forEach((clip) => {
            const action = this.mixer.clipAction(clip);
            this.actions[clip.name] = action;
            console.log(clip.name);
          });

          // stand
          this.playAnimation('stand');
        }
      },
      undefined,
      (error) => {
        console.error('Error loading player character:', error);
      }
    );
  }

  playAnimation(name) {
    if (this.currentAction) {
      this.currentAction.fadeOut(0.5);
    }
    this.currentAction = this.actions[name];
    if (this.currentAction) {
      this.currentAction.reset().fadeIn(0.5).play();
    }
  }

  update(deltaTime) {
    if (this.mixer) {
      this.mixer.update(deltaTime);
    }
  }
}
