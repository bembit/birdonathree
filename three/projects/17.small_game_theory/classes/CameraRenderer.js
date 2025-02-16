// classes/CameraRenderer.js
import * as THREE from 'https://unpkg.com/three@0.125.1/build/three.module.js';

export class CameraRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
  
    // Create an orthographic camera
    this.camera = new THREE.OrthographicCamera(
      window.innerWidth / -100,
      window.innerWidth / 100,
      window.innerHeight / 100,
      window.innerHeight / -100,
      0.1,
      1000
    );
    
    // Set a camera offset so that it follows the target (player)
    this.offset = new THREE.Vector3(10, 10, 10);
    this.camera.position.copy(this.offset);
    this.camera.lookAt(0, 0, 0);
  
    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.left = window.innerWidth / -100;
      this.camera.right = window.innerWidth / 100;
      this.camera.top = window.innerHeight / 100;
      this.camera.bottom = window.innerHeight / -100;
      this.camera.updateProjectionMatrix();
    });
  }
  
  cameraZoom(zoom) {
    // would be nice to zoom in and out a bit
  }
  
  update(target) {
    if (target) {
      // Move the camera relative to the target’s position.
      this.camera.position.copy(target.position).add(this.offset);
      this.camera.lookAt(target.position);
    }
  }
}
