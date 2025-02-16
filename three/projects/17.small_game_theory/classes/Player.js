// classes/Player.js
import * as THREE from 'https://unpkg.com/three@0.125.1/build/three.module.js';
import { HealthBar } from './HealthBar.js';

export class Player {
  constructor(modelLoader, config, gameManager) {
    this.modelLoader = modelLoader;
    this.config = config;
    this.health = 100;
    this.speed = 0.05;
    this.targetPosition = null;
    this.mixer = null;
    this.actions = {};
    this.currentAction = null;
    this.model = null;
    this.healthBar = null;
    this.gameManager = gameManager;
    // should have stats later
    // this.armour = 0; // etc. dodge etc.

    // Load the player model
    this.load();
  }

  async load() {
    try {
      const { model, mixer, actions } = await this.modelLoader.loadModel(this.config);
      this.model = model;
      this.mixer = mixer;
      this.actions = actions;
      // Start with a default "stand" animation if available
      if (actions['stand']) {
        actions['stand'].play();
        this.currentAction = actions['stand'];
      }
      // Create a health bar UI element linked to this model
      this.healthBar = new HealthBar(this.model);
    } catch (err) {
      console.error('Failed to load player model', err);
    }
  }

  // Returns the underlying THREE.Object3D so the camera can follow it.
  getObject() {
    return this.model;
  }

  // this could be a separate class of movement controller?
  // we have to handle/ignore clicks outside of running game state.
  // Handle click input to set a movement target.
  handleClick(event, camera, renderer) {
    if (!this.model) return;
    const rect = renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    // Here we assume that the ground or other clickable objects are among the scene’s children.
    const intersects = raycaster.intersectObjects(this.model.parent.children, true);
    if (intersects.length > 0) {
      this.targetPosition = intersects[0].point;
    }
  }

  update(delta) {
    if (!this.model) return;
    if (this.mixer) this.mixer.update(delta);

    // check if close to enemy, and if we are left clicking to attack the target
    // attack could be it's own thing too

    if (this.targetPosition) {
      const direction = new THREE.Vector3().subVectors(this.targetPosition, this.model.position);
      const distance = direction.length();
      if (distance > 0.1) {
        direction.normalize();
        this.model.position.addScaledVector(direction, this.speed);
        // Smoothly rotate the model to face the movement direction.
        const targetQuat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 0, 1),
          direction
        );
        this.model.quaternion.slerp(targetQuat, 0.1);
        // Play the "run" animation if available.
        if (this.actions['run'] && this.currentAction !== this.actions['run']) {
          if (this.currentAction) this.currentAction.fadeOut(0.2);
          this.actions['run'].reset().fadeIn(0.2).play();
          this.currentAction = this.actions['run'];
        }
      } else {
        // When the destination is reached, switch back to the "stand" animation.
        this.targetPosition = null;
        if (this.actions['stand'] && this.currentAction !== this.actions['stand']) {
          if (this.currentAction) this.currentAction.fadeOut(0.2);
          this.actions['stand'].reset().fadeIn(0.2).play();
          this.currentAction = this.actions['stand'];
        }
      }
    }
    // Update the position of the health bar.
    if (this.healthBar) this.healthBar.update();
  }

  // Example attack method: triggers an attack animation and inflicts damage.
  attack(target) {
    console.log('Player attacks', target);
    if (this.actions['attack']) {
      this.actions['punch'].reset().play();
      this.currentAction = this.actions['punch'];
    }
    if (target.takeDamage) {
      target.takeDamage(10);
    }
  }

  // Handle taking damage and updating the health bar.
  takeDamage(amount) {
    // reduce by armour and so on? dodge, block, etc.
    this.health -= amount;
    console.log(`Player health: ${this.health}`);
    if (this.healthBar) this.healthBar.setHealth(this.health);
    if (this.health <= 0) {
      this.die();
    }
  }

  die() {
    console.log('Player died!');

    // game over state
    if(this.gameManager) {
      this.gameManager.gameOver();
    }
  }

  reset() {
    this.health = 100;
    this.speed = 0.05;
    this.targetPosition = null;
    // this.mixer = null;
    this.model.position.set(0, 0, 0);
    if (this.healthBar) {
      // this.healthBar.setHealth(this.health);
      this.healthBar.dispose();
    }
    this.healthBar = new HealthBar(this.model);
  }
}
