// classes/SceneManager.js
import * as THREE from 'https://unpkg.com/three@0.125.1/build/three.module.js';

import { ModelLoader } from './ModelLoader.js';

export class SceneManager {
  constructor() {
    this.scene = new THREE.Scene();
    this.setupEnvironment();

    this.modelLoader = new ModelLoader(this.scene);
  }

  setupEnvironment() {
    // Create a base ground plane.
    const groundGeo = new THREE.PlaneGeometry(255, 255);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x573031 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
    this.ground = ground;

    // Add ambient lighting.
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    // Add a directional (sun) light with shadows.
    // This needs some more understanding.
    // Moving the plane size to a variable to be used with shadows?
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    // Increase shadow map resolution if needed
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;

    // Adjust shadow camera near and far to cover the scene
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 500;

    // Expand the shadow camera frustum to cover the entire ground area
    directionalLight.shadow.camera.left = -256;
    directionalLight.shadow.camera.right = 256;
    directionalLight.shadow.camera.top = 256;
    directionalLight.shadow.camera.bottom = -256;
    
    this.scene.add(directionalLight);
  }

  getScene() {
    return this.scene;
  }

  getGround() {
    return this.ground;
  }

  /**
   * Adds a specified number of environment objects (e.g., trees and bushes)
   * at random positions on the ground.
   *
   * @param {Array} environmentAssets - Array of asset configs. Example:
   *        [{ path: './assets/models/tree.glb', scale: 1, y: 1 },
   *         { path: './assets/models/bush.glb', scale: 0.5 },
   *         ... ]
   * @param {number} count - How many objects to add.
   */
  addEnvironmentObjects(environmentAssets, count) {
    // Ground dimensions (should match your PlaneGeometry dimensions)
    const groundWidth = 255;
    const groundHeight = 255;
    const halfWidth = groundWidth / 2;
    const halfHeight = groundHeight / 2;
  
    for (let i = 0; i < count; i++) {
      // Randomly choose an asset from the array.
      const randomIndex = Math.floor(Math.random() * environmentAssets.length);
      const assetConfig = environmentAssets[randomIndex];
  
      // Generate a random position within the ground bounds.
      const x = Math.random() * groundWidth - halfWidth;
      const z = Math.random() * groundHeight - halfHeight;
  
      // Create a config for the ModelLoader.
      const config = {
        path: assetConfig.path,
        position: { 
          x: x, 
          // This to revisit.
          y: assetConfig.y || 1, 
          z: z 
        },
        scale: assetConfig.scale || 1
      };
  
      // Use ModelLoader to load the asset.
      this.modelLoader.loadModel(config, (model, mixer, actions) => {
        // Optionally add a random Y-axis rotation.
        model.rotation.y = Math.random() * Math.PI * 2;
      });
    }
  }
}
