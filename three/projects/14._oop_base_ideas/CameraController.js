// cameraController.js
import * as THREE from 'https://unpkg.com/three@0.125.1/build/three.module.js';

export class CameraController {
  constructor(camera, canvas) {
    this.camera = camera;
    this.canvas = canvas;

    // Track mouse position and movement
    this.mouse = new THREE.Vector2();
    this.previousMouse = new THREE.Vector2();
    this.rotationSpeed = 0.002;
    this.zoomSpeed = 0.1;

    this.isRotating = false;

    // Event listeners for mouse actions
    this.addEventListeners();
  }

  addEventListeners() {
    this.canvas.addEventListener('mousedown', (event) => this.onMouseDown(event));
    this.canvas.addEventListener('mousemove', (event) => this.onMouseMove(event));
    this.canvas.addEventListener('mouseup', () => this.onMouseUp());
    this.canvas.addEventListener('wheel', (event) => this.onMouseWheel(event));
  }

  onMouseDown(event) {
    this.isRotating = true;
    this.previousMouse.set(event.clientX, event.clientY);
  }

  onMouseMove(event) {
    if (!this.isRotating) return;

    const deltaX = event.clientX - this.previousMouse.x;
    const deltaY = event.clientY - this.previousMouse.y;

    this.previousMouse.set(event.clientX, event.clientY);

    const rotationAngleX = deltaX * this.rotationSpeed;
    const rotationAngleY = deltaY * this.rotationSpeed;

    // Horizontal rotation (around Y-axis)
    this.camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationAngleX);

    // Vertical rotation (limit for smooth movement)
    const axis = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion).normalize();
    this.camera.position.applyAxisAngle(axis, rotationAngleY);

    this.camera.lookAt(0, 0, 0); // Always look at the center
  }

  onMouseUp() {
    this.isRotating = false;
  }

  onMouseWheel(event) {
    const zoomChange = event.deltaY * this.zoomSpeed * 0.01;
    this.camera.zoom = Math.max(0.5, Math.min(3, this.camera.zoom - zoomChange));
    this.camera.updateProjectionMatrix();
  }

  update() {
    // Custom updates if needed in the game loop
  }
}
