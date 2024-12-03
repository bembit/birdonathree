import * as THREE from 'https://unpkg.com/three@0.125.1/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.125.1/examples/jsm/loaders/GLTFLoader.js';

class StaticModelLoader {
    constructor(scene) {
      this.scene = scene; // init scene
      this.loader = new GLTFLoader();
      this.assets = {}; // keep track of "global" assets
      this.mixers = []; 
    }

    loadModel(path, name, options = {}) {
      return new Promise((resolve, reject) => {
        this.loader.load(
          path,
          (gltf) => {
            const model = gltf.scene;
            model.name = name;
            this.applyOptions(model, options);
            this.scene.add(model);
            this.assets[name] = model;
    
            resolve(model);
          },
          undefined,
          (error) => reject(error)
        );
      });
    }

    playAnimation(name, animationName) {
      const asset = this.assets[name];
      if (!asset || !asset.actions[animationName]) return;
    
      // fade out the current action and play the new one
      for (let actionName in asset.actions) {
        if (actionName !== animationName) {
          asset.actions[actionName].fadeOut(0.5);
        }
      }
    
      const action = asset.actions[animationName];
      action.reset().fadeIn(0.5).play();
    }

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
class HighlightableModel extends StaticModelLoader {
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

export { StaticModelLoader };
