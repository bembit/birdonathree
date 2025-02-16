// classes/AttackController.js
import * as THREE from 'https://unpkg.com/three@0.125.1/build/three.module.js';

export class AttackController {
  /**
   * @param {Player} player - The attacking player instance.
   * @param {Enemy} target - The enemy instance to attack.
   * @param {THREE.Camera} camera - The camera used for raycasting.
   * @param {HTMLElement} domElement - The DOM element (canvas) to listen for clicks.
   */
  constructor(player, target, camera, domElement) {
    this.player = player;
    this.target = target;
    this.camera = camera;
    this.domElement = domElement;

    // Bind the method so that 'this' remains the instance.
    this.onMouseDown = this.onMouseDown.bind(this);
    this.domElement.addEventListener('mousedown', this.onMouseDown);
  }

  onMouseDown(event) {
    // Only respond to left clicks!
    if (event.button !== 0) return;

    const rect = this.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    // Intersect the enemy's model (or a group containing it).
    const intersects = raycaster.intersectObject(this.target.getObject(), true);
    if (intersects.length > 0) {
      // Get the enemy's world position.
      const enemyPos = this.target.getObject().position.clone();

      // Stop player movement and make sure the player is facing the enemy.
      this.player.stopMovement();
      this.player.faceTarget(enemyPos);

      // Trigger the attack.
      this.player.attack(this.target);
    }
  }

  dispose() {
    this.domElement.removeEventListener('mousedown', this.onMouseDown);
  }
}