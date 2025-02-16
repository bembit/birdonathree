// classes/LootDrop.js
import * as THREE from 'https://unpkg.com/three@0.125.1/build/three.module.js';

export class LootDrop {
  /**
   * @param {THREE.Vector3} position - The world position for the loot drop.
   * @param {THREE.Scene} scene - The scene to which the loot drop is added.
   * @param {Object} lootData - (Optional) Data about the loot (e.g., type, quantity).
   */
  constructor(position, scene, lootData = {}) {
    this.scene = scene;
    this.lootData = lootData;
    this.position = position.clone();

    this.createMesh();
  }

  createMesh() {
    // Create a simple triangle shape.
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(1, 0);
    shape.lineTo(0.5, 1);
    shape.lineTo(0, 0);

    const geometry = new THREE.ShapeGeometry(shape);
    // Use a basic material. Yellow-ish to stand out.
    const material = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      side: THREE.DoubleSide
    });
    this.mesh = new THREE.Mesh(geometry, material);

    // Position the loot drop.
    this.mesh.position.copy(this.position);
    // Rotate it to lie flat on the ground.
    this.mesh.rotation.x = -Math.PI / 2;
    
    // For interaction, store a reference to this loot drop in userData.
    this.mesh.userData.lootDrop = this;
    
    console.log(this.mesh);
    this.scene.add(this.mesh);
  }

  // Called when the loot is picked up.
  onPickup() {
    console.log("Loot picked up!", this.lootData);
    // Remove the loot drop from the scene.
    this.scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}
