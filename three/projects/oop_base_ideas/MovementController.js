import * as THREE from 'https://unpkg.com/three@0.125.1/build/three.module.js';

export class MovementController {
    constructor(player, camera, scene) {
        this.player = player;
        this.camera = camera;
        this.scene = scene;
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();
        this.mouseClickHandler();
    }

    // Update the mouse position and handle movement
    mouseClickHandler() {
        window.addEventListener('click', (event) => {
            // Convert mouse click to normalized coordinates
            this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

            // Set up raycaster based on mouse position
            this.raycaster.setFromCamera(this.pointer, this.camera);

            // Find intersections
            const intersects = this.raycaster.intersectObject(this.scene, true);
            if (intersects.length > 0) {
                // Get the position to move to (intersection point)
                const targetPosition = intersects[0].point;
                this.player.setDestination(targetPosition);
            }
        });
    }

    // Update the movement every frame
    
    // update(delta) {
    //     this.player.update(delta);
    // }
}
