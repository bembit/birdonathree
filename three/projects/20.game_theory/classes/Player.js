// classes/Player.js
import * as THREE from 'https://unpkg.com/three@0.125.1/build/three.module.js';
import { HealthBar } from './HealthBar.js';
import { KnifeProjectile } from './bonus/KnifeProjectile.js';

export class Player {
  /**
   * @param {ModelLoader} modelLoader 
   * @param {Object} config 
   * @param {GameManager} gameManager 
   * @param {Array} projectiles - Array to store projectile instances.
   */
  constructor(modelLoader, config, gameManager, projectiles) {
    this.modelLoader = modelLoader;
    this.config = config;
    this.health = 100;
    this.speed = 0.05;
    // this.speed = 0.25; // run around speed to test
    this.targetPosition = null;
    this.mixer = null;
    this.actions = {};
    this.currentAction = null;
    this.model = null;
    this.healthBar = null;
    this.gameManager = gameManager;
    // Should have stats / modifiers later in another class?
    // Plus inventory I already have elsewhere.
    this.isAttacking = false;

    this.projectiles = projectiles;
    
    // Load the player model
    this.load();
  }

  async load() {
    try {
      const { model, mixer, actions } = await this.modelLoader.loadModel(this.config);
      this.model = model;
      this.mixer = mixer;
      this.actions = actions;
      // Start with a default "stand" animation if available.
      if (actions['stand']) {
        actions['stand'].play();
        this.currentAction = actions['stand'];
      }
      // Create health bar for player.
      this.healthBar = new HealthBar(this.model);
    } catch (err) {
      console.error('Failed to load player model', err);
    }
  }

  // Returns the underlying THREE.Object3D so the camera can follow it.
  getObject() {
    return this.model;
  }

  // This could be / should be a separate class of movement controller.
  // We have to handle/ignore clicks outside of running game state.
  // Move on hold optional.
  // If no target move, if target and in distance attack, if target an not in distance move there / attack..
  // Handle click input to set a movement target.

  // Implementation for movement.
  // handleClick(event, camera, renderer) {

  //   if(this.isAttacking) {
  //     return;
  //   }

  //   if (!this.model) return;
  //   const rect = renderer.domElement.getBoundingClientRect();
  //   const mouse = new THREE.Vector2(
  //     ((event.clientX - rect.left) / rect.width) * 2 - 1,
  //     -((event.clientY - rect.top) / rect.height) * 2 + 1
  //   );
  //   const raycaster = new THREE.Raycaster();
  //   raycaster.setFromCamera(mouse, camera);
  //   // Here we assume that the ground or other clickable objects are among the scenes children.
  //   // Ideally loot, interactable objects later.
  //   const intersects = raycaster.intersectObjects(this.model.parent.children, true);
  //   if (intersects.length > 0) {
  //     this.targetPosition = intersects[0].point;
  //   }
  // }

  // Implementation for combined movement and/or loot pickup.
  handleClick(event, camera, renderer) {
    // Ignore movement inputs while attacking.
    if (this.isAttacking) return;
    if (!this.model) return;
  
    const rect = renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
  
    // Intersect objects in the scene.
    const intersects = raycaster.intersectObjects(this.model.parent.children, true);
  
    if (intersects.length > 0) {
      // Check if any intersected object is a loot drop.
      for (let i = 0; i < intersects.length; i++) {
        const obj = intersects[i].object;
        if (obj.userData.lootDrop) {
          // Block on full health.
          if(this.health === 100) {
            console.log("You are already at full health!");
            return;
          }
          // Loot was clicked: pick it up.
          obj.userData.lootDrop.onPickup();
          
          if(this.health <=  80) {
            this.health += 20;
            console.log("Health:", this.health);
          } else {
            this.health = 100;
            console.log("Health:", this.health);
          }
          this.healthBar.setHealth(this.health);
          return; // Do not set movement target!
        }
      }
      // Otherwise, set target for movement.
      this.targetPosition = intersects[0].point;
    }
  }
  
  update(delta) {
    if (!this.model) return;
    if (this.mixer) this.mixer.update(delta);

    // Animations split.
    // Check if close to enemy, and if we are left clicking to attack the target.
    // Attack could be it's own thing too.
    if (this.targetPosition && !this.isAttacking) {
      const direction = new THREE.Vector3().subVectors(this.targetPosition, this.model.position);
       // Zero out the Y component so the model only rotates horizontally. Fix the upside down flip bug on interaction.
      direction.y = 0;
      const distance = direction.length();
      if (distance > 0.1) {
        direction.normalize();
        this.model.position.addScaledVector(direction, this.speed);
        // Rotate the model to face the movement direction.
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

  // Position is needed for both player and enemy to make it the way I want.
  attack(target) {
    console.log('Player attacks', target);
    // Make an attack animation of some sort. Like 1 second or 2 second punch.

    if(this.isAttacking) {
      return;
    }

    this.isAttacking = true;

    if (this.actions['run'] && this.currentAction !== this.actions['punch']) {
      if (this.currentAction) this.currentAction.fadeOut(0.2);
      this.actions['punch'].reset().play();
      this.currentAction = this.actions['punch'];
    }
    if (target.takeDamage) {
      target.takeDamage(17);
    }

    // Calculate the direction for the projectile.
    // For example, shoot from the player towards the target's position.
    const startPos = this.model.position.clone();
    const targetPos = target.getObject().position.clone();
    const direction = new THREE.Vector3().subVectors(targetPos, startPos).normalize();
    // Optionally offset the startPos so the projectile appears from the player's hand.
    startPos.y += 1; // adjust as needed
    // Create a new knife projectile and push it to the array of main.js.
    const projectile = new KnifeProjectile(startPos, direction, 30, this.model.parent);
    this.projectiles.push(projectile);

    // Reset the attacking state after a delay (or tie this to the animation's end).
    setTimeout(() => {
      this.isAttacking = false;
      // set animation back to idle
      if (this.actions['punch'] && this.currentAction !== this.actions['stand']) {
        if (this.currentAction) this.currentAction.fadeOut(0.2);
        this.actions['stand'].reset().play();
        this.currentAction = this.actions['stand'];
      }
    }, 1000); // 1.5 seconds
  }

  // Handle taking damage and updating the health bar.
  takeDamage(amount) {
    // Reduce by modifiers.
    this.health -= amount;
    console.log(`Player health: ${this.health}`);
    if (this.healthBar) this.healthBar.setHealth(this.health);
    if (this.health <= 0) {
      this.die();
    }
  }

  // Helper method to stop movement.
  stopMovement() {
    this.targetPosition = null;
  }

  // While attacking, stop/block any other actions like movement, and FACE the enemy.
  faceTarget(targetPosition) {
    if (!this.model) return;
    const direction = new THREE.Vector3().subVectors(targetPosition, this.model.position);
    direction.y = 0; // Lock rotation to horizontal plane.
    direction.normalize();
    const targetQuaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1), // +Z is forward.
      direction
    );
    // Instantly set the rotation or slerp for smooth rotation.
    this.model.quaternion.copy(targetQuaternion);
  }

  // Game over state on death. Highscore check maybe.
  die() {
    console.log('Player died!');
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
