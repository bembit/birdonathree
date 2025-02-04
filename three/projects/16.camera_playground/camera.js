import * as THREE from 'https://unpkg.com/three@0.125.1/build/three.module.js';
import { ModelLoader } from './modelLoader.js';

/**
 * A simple camera/renderer class that creates an orthographic camera
 * (suitable for an isometric view) and handles window resizing.
 * This version has been modified so the orthographic frustum can be updated
 * dynamically via a user-controlled divisor.
 */
class CameraRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // Use a divisor to compute the orthographic frustum from window dimensions.
    this.orthoDivisor = 100;

    // Set up an orthographic camera.
    this.camera = new THREE.OrthographicCamera(
      window.innerWidth / -this.orthoDivisor,
      window.innerWidth / this.orthoDivisor,
      window.innerHeight / this.orthoDivisor,
      window.innerHeight / -this.orthoDivisor,
      0.1,
      1000
    );

    // Define an offset vector for the camera relative to the target.
    this.offset = new THREE.Vector3(10, 10, 10);

    // Initial camera position & orientation.
    this.camera.position.copy(this.offset);
    this.camera.lookAt(0, 0, 0);

    // Adjust the renderer and camera when the window resizes.
    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.updateCameraProjection();
    });
  }

  // Updates the orthographic camera's frustum.
  updateCameraProjection() {
    this.camera.left = window.innerWidth / -this.orthoDivisor;
    this.camera.right = window.innerWidth / this.orthoDivisor;
    this.camera.top = window.innerHeight / this.orthoDivisor;
    this.camera.bottom = window.innerHeight / -this.orthoDivisor;
    this.camera.updateProjectionMatrix();
  }

  /**
   * Update the camera’s position to follow the given target.
   * @param {THREE.Object3D} target - The object for the camera to follow.
   */
  update(target) {
    if (target) {
      this.camera.position.copy(target.position).add(this.offset);
      this.camera.lookAt(target.position);
    }
  }
}

// ------------------- Minimal Scene Setup ------------------- //

// Create a new Three.js scene.
const scene = new THREE.Scene();

// (Optional) Add an ambient light so the model is visible.
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

// Get the canvas element and initialize the camera/renderer.
const canvas = document.getElementById('demo-canvas');
const camRenderer = new CameraRenderer(canvas);
const camera = camRenderer.camera;
const renderer = camRenderer.renderer;

// Create and use the model loader to load a model.
const modelLoader = new ModelLoader(scene);
const modelConfig = {
  path: '../../models/catwoman_rigged.glb', // ← Update with your model path
  position: { x: 0, y: 0, z: 0 },
  scale: 1
};

let loadedModel = null;
modelLoader.loadModel(modelConfig, (model, mixer, actions) => {
  loadedModel = model;
});

// ------------------- Animation Loop ------------------- //

function animate() {
  requestAnimationFrame(animate);
  // Uncomment the following if you wish to have the camera follow the model:
  // if (loadedModel) {
  //   camRenderer.update(loadedModel);
  // }
  renderer.render(scene, camera);
}

animate();

// ------------------- UI Controls ------------------- //

// Get references to the UI elements.
const offsetXSlider = document.getElementById('offsetX');
const offsetYSlider = document.getElementById('offsetY');
const offsetZSlider = document.getElementById('offsetZ');
const nearSlider = document.getElementById('near');
const farSlider = document.getElementById('far');
const divisorSlider = document.getElementById('divisor');

const offsetXValue = document.getElementById('offsetX-value');
const offsetYValue = document.getElementById('offsetY-value');
const offsetZValue = document.getElementById('offsetZ-value');
const nearValue = document.getElementById('near-value');
const farValue = document.getElementById('far-value');
const divisorValue = document.getElementById('divisor-value');

// Update camera offset.
offsetXSlider.addEventListener('input', () => {
  const val = parseFloat(offsetXSlider.value);
  camRenderer.offset.x = val;
  offsetXValue.textContent = val;
});
offsetYSlider.addEventListener('input', () => {
  const val = parseFloat(offsetYSlider.value);
  camRenderer.offset.y = val;
  offsetYValue.textContent = val;
});
offsetZSlider.addEventListener('input', () => {
  const val = parseFloat(offsetZSlider.value);
  camRenderer.offset.z = val;
  offsetZValue.textContent = val;
});

// Update near and far clipping planes.
nearSlider.addEventListener('input', () => {
  const val = parseFloat(nearSlider.value);
  camera.near = val;
  camera.updateProjectionMatrix();
  nearValue.textContent = val;
});
farSlider.addEventListener('input', () => {
  const val = parseFloat(farSlider.value);
  camera.far = val;
  camera.updateProjectionMatrix();
  farValue.textContent = val;
});

// Update the orthographic divisor.
divisorSlider.addEventListener('input', () => {
  const val = parseFloat(divisorSlider.value);
  camRenderer.orthoDivisor = val;
  camRenderer.updateCameraProjection();
  divisorValue.textContent = val;
});