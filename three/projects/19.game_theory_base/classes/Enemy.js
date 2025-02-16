// classes/Enemy.js

import * as THREE from 'https://unpkg.com/three@0.125.1/build/three.module.js';
import { HealthBar } from './HealthBar.js';

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
    this.attackDamage = 25;
    this.gameManager = gameManager;

    // Set up attack cooldown properties demo/test - marked as refactor.
    this.attackSpeed = 1; // Attacks per second
    this.attackCooldown = 1 / this.attackSpeed; // Cooldown duration in seconds.
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
      // Start with an "idle" animation if available - not necessary unless in depth AI is implemented.
      if (actions['idle']) {
        actions['idle'].play();
        this.currentAction = actions['idle'];
      }
      // Init health bar.
      this.healthBar = new HealthBar(this.model);
    } catch (err) {
      console.error('Failed to load enemy model', err);
    }
  }

  update(delta, player) {
    if (!this.model) return;
    if (this.mixer) this.mixer.update(delta);

    // Simple AI: move toward the player when not too close - distance and attackDistance.
    if (player && player.getObject()) {
      const playerPos = player.getObject().position;
      const direction = new THREE.Vector3().subVectors(playerPos, this.model.position);
      // Same fix as Player.js - test.
      direction.y = 0;
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
        // Timeout the attack to avoid spamming -> by attack cooldown.
        // When in range, check if the cooldown has passed before attacking.
        const currentTime = performance.now() / 1000; // Get current time in seconds.
        if (currentTime - this.lastAttackTime >= this.attackCooldown) {
          this.attack(player);
          this.lastAttackTime = currentTime;
        }
      }
    }
    if (this.healthBar) this.healthBar.update();
  }

  // Hit chance, etc. to be calculated before attack.
  attack(target) {
    console.log('Enemy attacks', target);
    if (this.actions['walk'] && this.currentAction !== this.actions['punch']) {
      if (this.currentAction) this.currentAction.fadeOut(0.2);
      this.actions['punch'].reset().play();
      this.currentAction = this.actions['punch'];
    }

    if (target.takeDamage) {
      target.takeDamage(this.calculatedTotalDamage());
    }

  }
  // Move to separate class, could be used by all enemies / player,
  // add extra calculations -> optionally, later.
  calculatedTotalDamage() {
    return this.attackDamage;
  }

  takeDamage(amount) {
    this.health -= amount;
    console.log(`Enemy health: ${this.health}`);
    if (this.healthBar) this.healthBar.setHealth(this.health);
    if (this.health <= 0) {
      this.die();
    }
  }

  // When enemy is dead, remove from scene.
  // Spawn another maybe?
  die() {
    console.log('Enemy died!');
    if (this.model && this.model.parent) {
      // Remove or just reset? 
      // this.model.parent.remove(this.model);
    }
    if (this.gameManager) {
      // Come up with something.
      this.gameManager.enemyDied(this);
    }
  }

  // Check what else could we need here.
  reset() {
    this.health = 50;
    this.speed = 0.01;
    // this.mixer = null;
    // this.actions = {};
    // this.currentAction = null;
    this.model.position.set(5, 0, 5);
    if (this.healthBar) {
      // this.healthBar.setHealth(this.health);
      this.healthBar.dispose();
    }
    this.healthBar = new HealthBar(this.model);
  }

  // Returns the underlying THREE.Object3D so we can attack it.
  getObject() {
    return this.model;
  }
}
