import * as THREE from 'https://unpkg.com/three@0.125.1/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.125.1/examples/jsm/loaders/GLTFLoader.js';


class ModelLoader {
    constructor(scene) {
      this.scene = scene; // init scene
      this.loader = new GLTFLoader();
      this.assets = {}; // keep track of "global" assets
      // this.mixers = []; // keep track of animation mixers
    }
  
    // reference - continue this loader and add to "blog"
    loadModel(path, name, options = {}) {
      return new Promise((resolve, reject) => {
        this.loader.load(
          path,
          (gltf) => {
            const model = gltf.scene;
            model.name = name;
  
            // apply options
            this.applyOptions(model, options);
  
            // this.checkShadows(model);

            // this.handleAnimations(model);

            this.scene.add(model);
            this.assets[name] = model;
            resolve(model);
          },
          undefined,
          (error) => reject(error)
        );
      });
    }

    // checkShadows(model) {
    //     // const light = new THREE.DirectionalLight(0xffffff, 1);
    //     // light.position.set(0, 10, 0);
    //     // model.add(light);
    //     model.traverse((child) => {
    //         if (child.isMesh) {
    //             child.castShadow = true;
    //             child.receiveShadow = true;
    //         }
    //     });
    //     // shadows are in meshes, not in the model itself
    //     // model.receiveShadow = true;
    // }

    handleAnimations(model) {
        const mixer = new THREE.AnimationMixer(model);
        const actions = {};
        // check if model has animations
        if (!model.animations) return;

        model.animations.forEach((clip) => {
            const action = mixer.clipAction(clip);
            actions[clip.name] = action;
            console.log(clip.name);
        });
        // if it has at least one animation, play it
        actions[model.animations[0].name].play();
        mixers.push(mixer);
        modelAnimations[config.path] = { mixer, actions };
    }

    // if (gltf.animations.length > 0) {
    //   const mixer = new THREE.AnimationMixer(model);
    //   const actions = {};

    //   gltf.animations.forEach((clip) => {
    //       const action = mixer.clipAction(clip);
    //       actions[clip.name] = action;
    //       console.log(clip.name);
    //   });

    //   actions[gltf.animations[4].name].play(); // play the "stand" animation
    //   mixers.push(mixer);
    //   modelAnimations[config.path] = { mixer, actions };
    // }

    // maybe animations should be optional too. or yeah, handle creatures in a different loader?
    applyOptions(model, options) {
      const { position, rotation, scale, castShadow, receiveShadow, targetable, destructible, lootable } = options;
  
      // set position, rotation, and scale
      if (position) model.position.set(...position);
      if (rotation) model.rotation.set(...rotation);
      if (scale) model.scale.set(...scale);
  
      // set shadow properties
      // might handle this globally and not optionally
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = !!castShadow;
          child.receiveShadow = !!receiveShadow;
        }
      });
  
      // custom properties to the model
      if (targetable) model.userData.targetable = true;
      if (destructible) model.userData.destructible = true;
      if (lootable) model.userData.lootable = true;
  
      // initialization for options
      this.initializeOptions(model, options);
    }
  
    initializeOptions(model, options) {
      if (options.highlightable) {
        // add a glow effect or an outline
        model.userData.highlightable = true;
      }
      if (options.onClick) {
        model.userData.onClick = options.onClick;
      }
      // add other feature-specific setup here
    }
  
    getModel(name) {
      return this.assets[name] || null;
    }
  
    removeModel(name) {
      const model = this.getModel(name);
      if (model) {
        this.scene.remove(model);
        delete this.assets[name];
      }
    }
}

// future idea
class HighlightableModel extends ModelLoader {
  applyOptions(model, options) {
      super.applyOptions(model, options);
      if (options.highlightColor) {
      model.userData.highlightColor = options.highlightColor;

      // add highlight logic
      model.traverse((child) => {
          if (child.isMesh) {
              child.onBeforeRender = () => {
                  // outline shader
              };
          }
      });
    }
  }
}

// click handler as event listener
function handleClick(event, raycaster, camera, scene) {
    const pointer = new THREE.Vector2();
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
    raycaster.setFromCamera(pointer, camera);
  
    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
      const target = intersects[0].object;
      if (target.userData.onClick) {
        target.userData.onClick(target);
      }
    }
  }

export { ModelLoader };
