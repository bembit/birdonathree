// src/main.js
import * as THREE from 'https://unpkg.com/three@0.125.1/build/three.module.js';

import { GameManager } from './classes/GameManager.js';
import { ModelLoader } from './classes/ModelLoader.js';
import { CameraRenderer } from './classes/CameraRenderer.js';
import { SceneManager } from './classes/SceneManager.js';
import { Player } from './classes/Player.js';
import { Enemy } from './classes/Enemy.js';

const canvas = document.getElementById('game-canvas');

// Create the scene with a ground plane and lights.
const sceneManager = new SceneManager();
const scene = sceneManager.getScene();

// Define your environment assets.
const environmentAssets = [
  { path: './assets/models/nature_pack/Flower1.glb', scale: 0 },
  { path: './assets/models/nature_pack/Flower2.glb', scale: 0 },
  { path: './assets/models/nature_pack/Flower3.glb', scale: 0 },
  { path: './assets/models/nature_pack/Flower4.glb', scale: 0 },
  { path: './assets/models/nature_pack/Flower5.glb', scale: 0 },
  { path: './assets/models/nature_pack/Rock2.glb', scale: 1 },
  // { path: '../assets/models/npcs/car.glb', scale: 2 },
  { path: './assets/models/nature_pack/Tree5_Yellow.glb', scale: 1.5, y: 3 },
  { path: './assets/models/nature_pack/Tree2_Green.glb', scale: 1.5, y: 4 }
];

// Randomly add environment objects.
// Obviously, this is a very simple example. In a real game, you would want to render like this.
sceneManager.addEnvironmentObjects(environmentAssets, 256);

// Set up camera and renderer.
const camRenderer = new CameraRenderer(canvas);
const camera = camRenderer.camera;
const renderer = camRenderer.renderer;

// Expose the camera globally so that UI can use it.
window.camera = camera;

// Instances.
const modelLoader = new ModelLoader(scene);
const gameManager = new GameManager();

gameManager.setResetCallback(() => {
  console.log("Reset callback called: reinit game objects...")
  player.reset();
  enemy.reset();
})



// Create player and enemy instance – note atm. the configuration object
// tells the loader which model file to use and where to place it.
const player = new Player(modelLoader, {
  path: './assets/models/characters/catwoman.glb',
  position: { x: 0, y: 0, z: 0 },
  scale: 1,
}, gameManager);

const enemy = new Enemy(modelLoader, {
  path: './assets/models/characters/revflash.glb',
  position: { x: 5, y: 0, z: 5 },
  scale: 1,
}, gameManager);

// Game loop: update animations, movement, AI, and render the scene.
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  // Update both player and enemy.
  if (gameManager.isPlaying()) {
    player.update(delta);
    enemy.update(delta, player);
  }

  // Update camera to follow the player.
  camRenderer.update(player.getObject());

  renderer.render(scene, camera);
}
animate();

// Events:
// Click-to-move input for the player.
window.addEventListener('click', (event) => {
  player.handleClick(event, camera, renderer);
});

// Key bindings / options temp. 
window.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() === 's') {
    // Start the game only if not already running.
    gameManager.startGame();
  }
  if (event.key.toLowerCase() === 'p') {
    gameManager.togglePause();
  }
  if (event.key.toLowerCase() === 'r') {
    // Reset the game if it is in a game over state.
    gameManager.resetGame();
  }
});

// Last basic mouse interactions before coming up with a movement controller.
canvas.addEventListener('mousedown', (event) => {
  // Check for left mouse button.
  if (event.button === 0) {
    const rect = canvas.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    // If you have multiple enemies, you could pass an array of their models.
    const enemyIntersects = raycaster.intersectObject(enemy.getObject(), true);
    if (enemyIntersects.length > 0) {
      // Enemy is being hovered when the left mouse button is pressed.
      // Call the player's attack method and pass in the enemy as the target.
      player.attack(enemy);
    }
  }
});
