import * as THREE from 'https://unpkg.com/three@0.125.1/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.125.1/examples/jsm/loaders/GLTFLoader.js';

/**
 * A loader class that handles loading a GLTF model, and setting up animations.
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
        // Enable shadows on meshes
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        this.scene.add(model);

        // Set up animation mixer and actions (if available)
        let mixer = null;
        let actions = {};
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          gltf.animations.forEach((clip) => {
            actions[clip.name] = mixer.clipAction(clip);
          });
          // Optionally start with a default animation (e.g. "stand")
          if (actions['stand']) {
            actions['stand'].play();
          }
        }
        onLoad(model, mixer, actions);
      },
      undefined,
      (error) => {
        console.error('Error loading model:', error);
      }
    );
  }
}

/**
 * A simple camera/renderer class that creates an orthographic camera (for an isometric view)
 * and handles window resizing.
 */
class CameraRenderer {
    constructor(canvas) {
      this.canvas = canvas;
      this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true });
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(window.devicePixelRatio);
  
      // Set up an orthographic camera
      this.camera = new THREE.OrthographicCamera(
        window.innerWidth / -100,
        window.innerWidth / 100,
        window.innerHeight / 100,
        window.innerHeight / -100,
        0.1,
        1000
      );
      
      // Define an offset vector for the camera relative to the player.
      // Adjust this offset to get the desired isometric view.
      this.offset = new THREE.Vector3(10, 10, 10);
  
      // Initial camera position is player-independent until updated.
      this.camera.position.copy(this.offset);
      this.camera.lookAt(0, 0, 0);
  
      window.addEventListener('resize', () => {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        // For an orthographic camera, update the view frustum as well.
        this.camera.left = window.innerWidth / -100;
        this.camera.right = window.innerWidth / 100;
        this.camera.top = window.innerHeight / 100;
        this.camera.bottom = window.innerHeight / -100;
        this.camera.updateProjectionMatrix();
      });
    }
  
    /**
     * Updates the camera's position to follow the target (e.g., player model)
     * and ensures the camera always looks at the target.
     *
     * @param {THREE.Object3D} target - The object for the camera to follow.
     */
    update(target) {
      if (target) {
        // Set the camera position as the target's position plus the offset.
        this.camera.position.copy(target.position).add(this.offset);
        // Make the camera look at the target's current position.
        this.camera.lookAt(target.position);
      }
    }
}

// --------------------- Scene Setup --------------------- //

const scene = new THREE.Scene();

// Create a grass ground (tile)
const grassGeometry = new THREE.PlaneGeometry(255, 255);
const grassMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
const grassTile = new THREE.Mesh(grassGeometry, grassMaterial);
grassTile.rotation.x = -Math.PI / 2;
grassTile.position.set(0, 0, 0);
grassTile.receiveShadow = true;
scene.add(grassTile);

// Add some basic lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const sunlight = new THREE.DirectionalLight(0xffffff, 1);
sunlight.position.set(10, 20, 10);
sunlight.castShadow = true;
sunlight.shadow.mapSize.width = 2048;
sunlight.shadow.mapSize.height = 2048;
sunlight.shadow.camera.near = 0.5;
sunlight.shadow.camera.far = 50;
sunlight.shadow.camera.left = -10;
sunlight.shadow.camera.right = 10;
sunlight.shadow.camera.top = 10;
sunlight.shadow.camera.bottom = -10;
scene.add(sunlight);

// Get the canvas element and set up the camera/renderer
const canvas = document.getElementById('starfield-canvas');
const camRenderer = new CameraRenderer(canvas);
const camera = camRenderer.camera;
const renderer = camRenderer.renderer;

// --------------------- Global Variables --------------------- //

let player = null;
let playerMixer = null;
let playerActions = {};
let currentAction = null;
const movementSpeed = 0.05;
let targetPosition = null; // The destination the player should move toward

// For click-to-move raycasting
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// --------------------- Health Bar (Optional) --------------------- //
function createHealthBar(model) {
  const healthBar = document.createElement('div');
  healthBar.className = 'health-bar';
  healthBar.style.position = 'absolute';
  healthBar.style.width = '50px';
  healthBar.style.height = '5px';
  healthBar.style.backgroundColor = 'red';
  document.body.appendChild(healthBar);
  model.userData.healthBar = healthBar;
}

function updateHealthBar(model) {
  if (!model.userData.healthBar) return;
  // Position the bar above the model (adjust as needed)
  const pos = model.position.clone();
  pos.y += 2;
  pos.project(camera);
  const x = (pos.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-pos.y * 0.5 + 0.5) * window.innerHeight;
  model.userData.healthBar.style.left = `${x - 25}px`;
  model.userData.healthBar.style.top = `${y - 5}px`;
}

// --------------------- Click-to-Move --------------------- //
// A flag to track if the mouse button is held down
let isMouseDown = false;

// A helper function that updates the target position based on the current mouse event
function updateTargetPosition(event) {
  // Convert mouse coordinates to normalized device coordinates (-1 to +1)
  const rect = canvas.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / canvas.clientWidth) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / canvas.clientHeight) * 2 + 1;

  // Cast a ray from the camera using the mouse's normalized device coordinates
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(grassTile);
  if (intersects.length > 0) {
    targetPosition = intersects[0].point;
  }
}

// Start tracking on mousedown
canvas.addEventListener('mousedown', (event) => {
  isMouseDown = true;
  updateTargetPosition(event);
});

// Update the target position continuously as the mouse moves while held down
canvas.addEventListener('mousemove', (event) => {
  if (isMouseDown) {
    updateTargetPosition(event);
  }
});

// Stop tracking on mouseup and when the mouse leaves the canvas
canvas.addEventListener('mouseup', () => {
  isMouseDown = false;
});
canvas.addEventListener('mouseout', () => {
  isMouseDown = false;
});


// --------------------- Model Loading --------------------- //

const modelLoader = new ModelLoader(scene);
// For example purposes, we load one model as the "player"
// (You can load more models similarly.)
const models = [
  {
    path: '../../models/catwoman_rigged.glb',
    position: { x: 0, y: 0, z: 0 },
    scale: 1
  }
];

modelLoader.loadModel(models[0], (model, mixer, actions) => {
  player = model;
  playerMixer = mixer;
  playerActions = actions;
  // Start with the "stand" animation if available
  if (actions['stand']) {
    actions['stand'].play();
    currentAction = actions['stand'];
  }
  // (Optional) Add a health bar for the player
//   createHealthBar(player);
});

// --------------------- Animation and Movement Loop --------------------- //

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  if (playerMixer) playerMixer.update(delta);

  // --- Click-to-Move Logic --- //
  if (player && targetPosition) {
    // Calculate the vector from the player to the target position
    const direction = new THREE.Vector3().subVectors(targetPosition, player.position);
    const distance = direction.length();

    if (distance > 0.1) { // Continue moving if the destination is not reached
      direction.normalize();
      player.position.addScaledVector(direction, movementSpeed);

      // Smoothly rotate the player to face the movement direction
      const targetQuaternion = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        direction
      );
      player.quaternion.slerp(targetQuaternion, 0.1);

      // If not already playing the "run" animation, transition to it
      if (playerActions['run'] && currentAction !== playerActions['run']) {
        if (currentAction) currentAction.fadeOut(0.2);
        playerActions['run'].reset().fadeIn(0.2).play();
        currentAction = playerActions['run'];
      }
    } else {
      // Destination reached – clear target and switch to "stand" animation
      targetPosition = null;
      if (playerActions['stand'] && currentAction !== playerActions['stand']) {
        if (currentAction) currentAction.fadeOut(0.2);
        playerActions['stand'].reset().fadeIn(0.2).play();
        currentAction = playerActions['stand'];
      }
    }

  }

  camRenderer.update(player);
    // Update health bar position
    // if (player) updateHealthBar(player);

  renderer.render(scene, camera);
}

animate();
