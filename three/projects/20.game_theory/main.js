// src/main.js
import * as THREE from 'https://unpkg.com/three@0.125.1/build/three.module.js';

import { GameManager } from './classes/GameManager.js';
import { ModelLoader } from './classes/ModelLoader.js';
import { CameraRenderer } from './classes/CameraRenderer.js';
import { SceneManager } from './classes/SceneManager.js';
import { Player } from './classes/Player.js';
import { Enemy } from './classes/Enemy.js';
import { AttackController } from './classes/AttackController.js';

const canvas = document.getElementById('game-canvas');

// Create the scene with a ground plane and lights.
const sceneManager = new SceneManager();
const scene = sceneManager.getScene();

// Define your environment assets. Or use the default ones link in README.md.
const environmentAssets = [
  { path: './assets/models/nature_pack/Flower1.glb', scale: 0 },
  { path: './assets/models/nature_pack/Rock2.glb', scale: 1 },
  { path: './assets/models/nature_pack/Tree5_Yellow.glb', scale: 1.5, y: 3 },
  { path: './assets/models/nature_pack/Tree2_Green.glb', scale: 1.5, y: 4 }
];

// Randomly add environment objects.
// Obviously, this is a very simple example. In a real game, you wouldn't want to render like this.
sceneManager.addEnvironmentObjects(environmentAssets, 16);

// Set up camera and renderer.
const camRenderer = new CameraRenderer(canvas);
const camera = camRenderer.camera;
const renderer = camRenderer.renderer;

// Expose the camera globally so that UI can use it.
window.camera = camera;

// Instances.
const modelLoader = new ModelLoader(scene);
const gameManager = new GameManager();

const projectiles = [];

gameManager.setResetCallback(() => {
  console.log("Reset callback called: reinit game objects...")
  player.reset();
  enemy.reset();

  // Quite hacky, but it works, removing loot by userData.
  // Also quite expensive when we have a lot of stuff on screen.
  // Making an array of lootDrops and remove them from the scene would be better. TBC.
  for (let i = scene.children.length - 1; i >= 0; i--) {
    let obj = scene.children[i];
    console.log(obj);
    if (obj.userData.lootDrop) {
        scene.remove(obj);
    }
  }
})

// Create player and enemy instance – note atm. the configuration object
// tells the loader which model file to use and where to place it.
const player = new Player(modelLoader, {
  path: './assets/models/characters/catwoman.glb',
  position: { x: 0, y: 0, z: 0 },
  scale: 1,
}, gameManager, projectiles);

const enemy = new Enemy(modelLoader, {
  path: './assets/models/characters/revflash.glb',
  position: { x: 5, y: 0, z: 5 },
  scale: 1,
}, gameManager);

const attackController = new AttackController(player, enemy, camera, canvas);

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

  // Update all active projectiles.
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const proj = projectiles[i];
    if (proj.alive) {
      proj.update(delta);
    } else {
      // Remove dead projectiles from the array.
      projectiles.splice(i, 1);
    }
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
// Just leaving it here for now.
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
