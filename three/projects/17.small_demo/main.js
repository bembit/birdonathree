// src/main.js
import * as THREE from 'https://unpkg.com/three@0.125.1/build/three.module.js';

import { GameManager } from './classes/GameManager.js';
import { ModelLoader } from './classes/ModelLoader.js';
import { CameraRenderer } from './classes/CameraRenderer.js';
import { SceneManager } from './classes/SceneManager.js';
import { Player } from './classes/Player.js';
import { Enemy } from './classes/Enemy.js';

// Get the canvas element
const canvas = document.getElementById('game-canvas');

// Create the scene with a ground plane and lighting
const sceneManager = new SceneManager();
const scene = sceneManager.getScene();

// Set up camera and renderer
const camRenderer = new CameraRenderer(canvas);
const camera = camRenderer.camera;
const renderer = camRenderer.renderer;

// (Optional) Expose the camera globally so that health bars (or UI) can use it.
window.camera = camera;

// Create a model loader instance
const modelLoader = new ModelLoader(scene);

const gameManager = new GameManager();

// Create player instance – note that the configuration object
// tells the loader which model file to use and where to place it.
const player = new Player(modelLoader, {
  path: '../../models/catwoman_rigged.glb',
  position: { x: 0, y: 0, z: 0 },
  scale: 1,
}, gameManager);

// Create enemy instance
const enemy = new Enemy(modelLoader, {
  path: '../../models/revflash.glb',
  position: { x: 5, y: 0, z: 5 },
  scale: 1,
}, gameManager);

// a pause state would be nice
// Game loop: update animations, movement, AI, and render the scene.
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  // Update both player and enemy
  if (gameManager.isPlaying()) {
    player.update(delta);
    enemy.update(delta, player);
  }

  // Update camera to follow the player
  camRenderer.update(player.getObject());

  renderer.render(scene, camera);
}
animate();

// Example: Set up click-to-move input for the player.
window.addEventListener('click', (event) => {
  player.handleClick(event, camera, renderer);
});

// key bindings temp
window.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() === 's') {
    // For instance, pressing "s" starts the game.
    gameManager.startGame();
  }
  if (event.key.toLowerCase() === 'p') {
    gameManager.togglePause();
  }
});