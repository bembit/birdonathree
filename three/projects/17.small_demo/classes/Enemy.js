// classes/Enemy.js
import * as THREE from 'https://unpkg.com/three@0.125.1/build/three.module.js';
import { HealthBar } from './HealthBar.js';

// enemy type to extend enemy and load model based on type ?
export class Enemy {
  constructor(modelLoader, config, gameManager) {
    this.modelLoader = modelLoader;
    this.config = config;
    this.health = 50;
    this.speed = 0.01;
    this.mixer = null;
    this.actions = {};
    this.currentAction = null;
    this.model = null;
    this.healthBar = null;
    this.attackDistance = 2;
    this.gameManager = gameManager;

    // Set up attack cooldown properties:
    this.attackSpeed = 1; // Attacks per second (adjust as needed)
    this.attackCooldown = 1 / this.attackSpeed; // Cooldown duration in seconds
    this.lastAttackTime = 0; // Timestamp of the last attack (in seconds)
    // Load the enemy model.
    this.load();
  }

  async load() {
    try {
      const { model, mixer, actions } = await this.modelLoader.loadModel(this.config);
      this.model = model;
      this.mixer = mixer;
      this.actions = actions;
      // Start with an "idle" animation if available.
      if (actions['idle']) {
        actions['idle'].play();
        this.currentAction = actions['idle'];
      }
      this.healthBar = new HealthBar(this.model);
    } catch (err) {
      console.error('Failed to load enemy model', err);
    }
  }

  update(delta, player) {
    if (!this.model) return;
    if (this.mixer) this.mixer.update(delta);

    // Simple AI: move toward the player when not too close.
    if (player && player.getObject()) {
      const playerPos = player.getObject().position;
      const direction = new THREE.Vector3().subVectors(playerPos, this.model.position);
      const distance = direction.length();
      if (distance > this.attackDistance) {
        direction.normalize();
        this.model.position.addScaledVector(direction, this.speed);
        // Rotate to face the player.
        const targetQuat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 0, 1),
          direction
        );
        this.model.quaternion.slerp(targetQuat, 0.1);
        // Play a "walk" animation if available.
        if (this.actions['walk'] && this.currentAction !== this.actions['walk']) {
          if (this.currentAction) this.currentAction.fadeOut(0.2);
          this.actions['walk'].reset().fadeIn(0.2).play();
          this.currentAction = this.actions['walk'];
        }
      } else {
        // timeout the attack to avoid spamming
        // when in range, check if the cooldown has passed before attacking.
        const currentTime = performance.now() / 1000; // Get current time in seconds.
        if (currentTime - this.lastAttackTime >= this.attackCooldown) {
          this.attack(player);
          this.lastAttackTime = currentTime;
        }
      }
    }
    if (this.healthBar) this.healthBar.update();
  }

  attack(target) {
    console.log('Enemy attacks', target);
    if (this.actions['walk'] && this.currentAction !== this.actions['punch']) {
      if (this.currentAction) this.currentAction.fadeOut(0.2);
      this.actions['punch'].reset().play();
      this.currentAction = this.actions['punch'];
    }
    if (target.takeDamage) {
      target.takeDamage(25);
    }
  }

  takeDamage(amount) {
    this.health -= amount;
    console.log(`Enemy health: ${this.health}`);
    if (this.healthBar) this.healthBar.setHealth(this.health);
    if (this.health <= 0) {
      this.die();
    }
  }

  die() {
    console.log('Enemy died!');
    if (this.model && this.model.parent) {
      this.model.parent.remove(this.model);
    }
    if (this.gameManager) {
      this.gameManager.enemyDied(this);
    }
  }
}
