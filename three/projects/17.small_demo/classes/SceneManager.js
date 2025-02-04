// classes/SceneManager.js
import * as THREE from 'https://unpkg.com/three@0.125.1/build/three.module.js';

export class SceneManager {
  constructor() {
    this.scene = new THREE.Scene();
    this.setupEnvironment();
  }

  setupEnvironment() {
    // Create a ground plane
    const groundGeo = new THREE.PlaneGeometry(255, 255);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
    this.ground = ground;

    // Add ambient lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    // Add a directional (sun) light with shadows
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    this.scene.add(directionalLight);
  }

  getScene() {
    return this.scene;
  }

  getGround() {
    return this.ground;
  }
}
