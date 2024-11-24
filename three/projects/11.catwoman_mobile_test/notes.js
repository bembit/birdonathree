
import { OrbitControls } from 'https://unpkg.com/three@0.125.1/examples/jsm/controls/OrbitControls.js';

// // Update TPS Camera
// function updateTPSCamera() {
//     if (!player) return;

//     // Rotate the camera around the player
//     camera.position.set(
//         player.position.x + cameraOffset.x * Math.cos(rotationAngle) - cameraOffset.z * Math.sin(rotationAngle),
//         player.position.y + cameraOffset.y,
//         player.position.z + cameraOffset.x * Math.sin(rotationAngle) + cameraOffset.z * Math.cos(rotationAngle)
//     );

//     // Look at the player
//     const targetPosition = player.position.clone().add(cameraTargetOffset);
//     camera.lookAt(targetPosition);
// }

// function updatePlayerMovement() {
//     if (!player) return;

//     const movement = calculatePlayerMovement();
//     player.position.add(movement);

//     // Check if the player is moving
//     const isMoving = movement.length() > 0;

//     // Access animations using modelAnimations and the model path
//     const playerAnimations = modelAnimations[models[0].path]?.actions; // Ensure animations are loaded
//     if (!playerAnimations) return;

//     const runningAnimation = playerAnimations['run']; 
//     const standingAnimation = playerAnimations['stand']; 

//     if (isMoving) {
//         if (currentAnimation !== runningAnimation) {
//             // Transition to running animation
//             if (currentAnimation) currentAnimation.fadeOut(transitionDuration);
//             runningAnimation.reset().fadeIn(transitionDuration).play();
//             currentAnimation = runningAnimation;
//         }

//         // Smoothly rotate player to face the movement direction
//         const lookDirection = movement.clone().normalize();
//         const targetQuaternion = new THREE.Quaternion().setFromUnitVectors(
//             new THREE.Vector3(0, 0, 1), // Default forward direction
//             lookDirection
//         );
//         player.quaternion.slerp(targetQuaternion, 0.1); // Adjust 0.1 for smoother or faster turning
//     } else {
//         if (currentAnimation !== standingAnimation) {
//             // Transition to standing animation
//             if (currentAnimation) currentAnimation.fadeOut(transitionDuration);
//             standingAnimation.reset().fadeIn(transitionDuration).play();
//             currentAnimation = standingAnimation;
//         }
//     }
// }


// define gltf
// function updatePlayerMovement() {
//     if (!player) return;

//     const movement = calculatePlayerMovement();
//     player.position.add(movement);

//     // Check if the player is moving
//     const isMoving = movement.length() > 0;

//     // Play the running animation if moving
//     if (isMoving) {
//         const runningAnimation = modelAnimations[models[0].path].actions[gltf.animations[5].name];
//         if (currentAnimation !== runningAnimation) {
//             if (currentAnimation) currentAnimation.stop();
//             runningAnimation.play();
//             currentAnimation = runningAnimation;
//         }

//         // Optional: Rotate player to face the movement direction
//         const lookDirection = movement.clone().normalize();
//         player.lookAt(player.position.clone().add(lookDirection));
//     } else {
//         // Play the standing animation if not moving
//         const standingAnimation = modelAnimations[models[0].path].actions[gltf.animations[4].name];
//         if (currentAnimation !== standingAnimation) {
//             if (currentAnimation) currentAnimation.stop();
//             standingAnimation.play();
//             currentAnimation = standingAnimation;
//         }
//     }
// }