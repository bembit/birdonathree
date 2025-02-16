// classes/KnifeProjectile.js
import * as THREE from 'https://unpkg.com/three@0.125.1/build/three.module.js';

export class KnifeProjectile {
  /**
   * @param {THREE.Vector3} startPos - Starting position (from the player).
   * @param {THREE.Vector3} direction - Direction vector (normalized) in which to shoot the projectile.
   * @param {number} speed - Movement speed.
   * @param {THREE.Scene} scene - The scene to which this projectile will be added.
   */
  constructor(startPos, direction, speed, scene) {
    this.scene = scene;
    this.direction = direction.clone().normalize();
    this.speed = speed;
    this.life = 2; // seconds before auto-destruction
    this.age = 0;
    
    // For demonstration, we'll use a simple cylinder as the knife.
    // You can load a custom model instead.
    this.geometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8);
    this.material = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    
    // Position the projectile at the starting point.
    this.mesh.position.copy(startPos);
    
    // Orient the knife so its "length" is along the direction.
    // For a cylinder, default orientation is along Y. We need to rotate it.
    const axis = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, this.direction);
    this.mesh.quaternion.copy(quaternion);
    
    // Enable shadows if needed.
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = false;
    
    // Add the projectile to the scene.
    this.scene.add(this.mesh);
    
    // Flag for later removal.
    this.alive = true;
  }
  
  update(delta) {
    if (!this.alive) return;
    
    // Move the projectile in its direction.
    const displacement = this.direction.clone().multiplyScalar(this.speed * delta);
    this.mesh.position.add(displacement);
    
    // Update age and check for life expiration.
    this.age += delta;
    if (this.age >= this.life) {
      this.destroy();
    }
  }
  
  destroy() {
    this.alive = false;
    this.scene.remove(this.mesh);
    this.geometry.dispose();
    this.material.dispose();
  }
}
