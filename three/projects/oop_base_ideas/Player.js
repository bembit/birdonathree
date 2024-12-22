import * as THREE from 'https://unpkg.com/three@0.125.1/build/three.module.js';

export class Player {
    constructor(model, movementSpeed = 1) {
        this.model = model;  // The 3D model of the player (Catwoman or other)
        this.position = model.position;  // Position of the player
        this.movementSpeed = movementSpeed;  // Speed of movement
        this.isMoving = false;  // Whether the player is moving
        this.destination = new THREE.Vector3();  // Target destination for movement
    }

    // Update method for moving the player
    update(delta) {
        if (this.isMoving) {
            // Move towards destination
            const direction = new THREE.Vector3().subVectors(this.destination, this.position).normalize();
            const distance = this.position.distanceTo(this.destination);
            
            if (distance > 0.1) {
                this.position.add(direction.multiplyScalar(this.movementSpeed * delta));
                this.model.position.copy(this.position);
            } else {
                this.isMoving = false;
            }
        }
    }

    // Set a new destination for the player
    setDestination(destination) {
        this.destination.copy(destination);
        this.isMoving = true;
    }
}
