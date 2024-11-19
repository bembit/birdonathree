import * as THREE from 'https://unpkg.com/three@0.125.1/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.125.1/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://unpkg.com/three@0.125.1/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Create a green grass tile
const grassGeometry = new THREE.PlaneGeometry(255, 255); // Width and height of the tile
const grassMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff }); // Green color
const grassTile = new THREE.Mesh(grassGeometry, grassMaterial);

// Rotate the tile to lie flat on the ground
grassTile.rotation.x = -Math.PI / 2; // Rotate to face upward
grassTile.position.set(0, 0, 0); // Place it at the center of the scene
scene.add(grassTile);

// Third-Person Camera Variables
const cameraOffset = new THREE.Vector3(0, 4, -6); // Camera position relative to player
const cameraTargetOffset = new THREE.Vector3(0, 1, 0); // Target position offset (player's head level)
let rotationAngle = 0; // Horizontal rotation around the player

// Target the canvas element
const canvas = document.getElementById('starfield-canvas');

// // Ambient Light for Base Illumination
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

// Renderer with the selected canvas
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Track keys
const keys = {
    w: false,
    a: false,
    s: false,
    d: false,
};
document.addEventListener('keydown', (event) => {
    if (event.key in keys) keys[event.key] = true;
});
document.addEventListener('keyup', (event) => {
    if (event.key in keys) keys[event.key] = false;
});

let isCanvasActive = false; // Track if the canvas is active

canvas.addEventListener('mousedown', () => {
    isCanvasActive = true; // Activate mouse control
});

document.addEventListener('mouseup', () => {
    isCanvasActive = false; // Deactivate mouse control
});

canvas.addEventListener('mouseout', () => {
    isCanvasActive = false; // Deactivate when mouse leaves the canvas
});

// Update player movement function
function calculatePlayerMovement() {
    const direction = new THREE.Vector3();
    if (keys.w) direction.z += 1; // Forward
    if (keys.s) direction.z -= 1; // Backward
    if (keys.a) direction.x += 1; // Left
    if (keys.d) direction.x -= 1; // Right

    // Ensure direction is aligned with the camera's orientation
    const cameraForward = new THREE.Vector3();
    const cameraRight = new THREE.Vector3();

    camera.getWorldDirection(cameraForward); // Camera forward direction
    cameraForward.y = 0; // Ignore vertical movement
    cameraForward.normalize();

    cameraRight.crossVectors(camera.up, cameraForward); // Camera right direction

    // Calculate movement vector relative to camera orientation
    const moveVector = new THREE.Vector3()
        .addScaledVector(cameraForward, direction.z)
        .addScaledVector(cameraRight, direction.x);

    return moveVector.normalize().multiplyScalar(movementSpeed);
}

let currentAnimation = null; // Track the current animation
const transitionDuration = 0.5; // Time in seconds for transitions

function updatePlayerMovement() {
    if (!player) return;

    const movement = calculatePlayerMovement();
    player.position.add(movement);

    // Check if the player is moving
    const isMoving = movement.length() > 0;

    // Access animations using modelAnimations and the model path
    const playerAnimations = modelAnimations[models[0].path]?.actions; // Ensure animations are loaded
    if (!playerAnimations) return;

    const runningAnimation = playerAnimations['run']; 
    const standingAnimation = playerAnimations['stand']; 

    if (isMoving) {
        if (currentAnimation !== runningAnimation) {
            // Transition to running animation
            if (currentAnimation) currentAnimation.fadeOut(transitionDuration);
            runningAnimation.reset().fadeIn(transitionDuration).play();
            currentAnimation = runningAnimation;
        }

        // Smoothly rotate player to face the movement direction
        const lookDirection = movement.clone().normalize();
        const targetQuaternion = new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, 0, 1), // Default forward direction
            lookDirection
        );
        player.quaternion.slerp(targetQuaternion, 0.1); // Adjust 0.1 for smoother or faster turning
    } else {
        if (currentAnimation !== standingAnimation) {
            // Transition to standing animation
            if (currentAnimation) currentAnimation.fadeOut(transitionDuration);
            standingAnimation.reset().fadeIn(transitionDuration).play();
            currentAnimation = standingAnimation;
        }
    }
}


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

// Mouse movement to rotate camera around the player
document.addEventListener('mousemove', (event) => {
    if (!isCanvasActive) return; // Rotate only when the canvas is active

    const sensitivity = 0.002; // Adjust sensitivity
    rotationAngle -= event.movementX * sensitivity; // Rotate horizontally

    // TODO: Add vertical rotation
    // 1. these needs more math and to reduce horizontal while both are in action.
    const verticalOffset = cameraOffset.y + event.movementY * sensitivity * 0.5;
    cameraOffset.y = THREE.MathUtils.clamp(verticalOffset, 2, 8); // Limit vertical range
});

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

// Camera zoom limits
const minZoom = 3; // Minimum distance from the player
const maxZoom = 10; // Maximum distance from the player
let zoomDistance = 6; // Initial zoom distance (matches the z-offset in cameraOffset)

// Update TPS Camera with zoom
function updateTPSCamera() {
    if (!player) return; // Ensure the player model is loaded

    // Rotate the camera around the player based on input
    camera.position.set(
        player.position.x + zoomDistance * Math.cos(rotationAngle),
        player.position.y + cameraOffset.y,
        player.position.z + zoomDistance * Math.sin(rotationAngle)
    );

    // Look at the player
    const targetPosition = player.position.clone().add(cameraTargetOffset);
    camera.lookAt(targetPosition);
}

// Add scroll event for zoom
// could use some smoothing later
// easing, linear functions.
canvas.addEventListener('wheel', (event) => {
    event.preventDefault(); // Prevent default scrolling behavior

    const zoomSpeed = 0.5; // Adjust zoom speed
    zoomDistance += event.deltaY * 0.01 * zoomSpeed; // Zoom in or out based on scroll direction

    // Clamp zoom distance between min and max
    zoomDistance = Math.max(minZoom, Math.min(maxZoom, zoomDistance));
});

const clock = new THREE.Clock();

const modelAnimations = {}; // Store animations for each model
console.log(modelAnimations);

let movementSpeed = 0.1;

let player;
// Load the player model
function loadModel(config) {
    const loader = new GLTFLoader();

    loader.load(
        config.path,
        (gltf) => {
            const model = gltf.scene;
            model.position.set(config.position.x, config.position.y, config.position.z);
            model.scale.set(config.scale, config.scale, config.scale);

            // Add to scene
            scene.add(model);
            player = model; // Assign the model to the player

            // Handle animations
            if (gltf.animations.length > 0) {
                const mixer = new THREE.AnimationMixer(model);
                const actions = {};

                gltf.animations.forEach((clip) => {
                    const action = mixer.clipAction(clip);
                    actions[clip.name] = action;
                });

                actions[gltf.animations[4].name].play(); // play the "stand" animation
                mixers.push(mixer);
                modelAnimations[config.path] = { mixer, actions };
                renderAnimations();
            }
        },
        undefined,
        (error) => console.error('Error loading model:', error)
    );
}

// Global array for mixers (if animations are used)
const mixers = [];

const models = [
    {
        path: '../../models/catwoman_rigged.glb',
        // position: { x: 2, y: -1.4, z: 47 },
        position: { x: 0, y: 0, z: 0 },
        scale: 1,
        lookAtCamera: false,
        animations: true,
        lights: [
            { type: 'SpotLight', color: 0x0ffffff, intensity: 5, distance: 1000, position: { x: 0, y: 5, z: -5 } }
        ]
    },
    {
        path: '../../models/catwoman_rigged.glb',
        // position: { x: 2, y: -1.4, z: 47 },
        position: { x: 2, y: 0, z: 1 },
        scale: 1,
        lookAtCamera: false,
        animations: true,
        lights: [
            { type: 'SpotLight', color: 0x0ffffff, intensity: 5, distance: 1000, position: { x: 0, y: 5, z: -5 } }
        ]
    },
];

models.forEach((modelConfig) => loadModel(modelConfig));


// render animations 
// Select the <ul> inside the .nav-bar
const navBarList = document.querySelector('.nav-bar ul');

// Function to render animations as <li> elements
function renderAnimations() {
    // Clear existing content
    navBarList.innerHTML = '';

    // Check if there are animations to render
    if (Object.keys(modelAnimations).length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.textContent = 'No animations loaded yet';
        navBarList.appendChild(emptyMessage);
        return;
    }

    // Loop through all the animations in the modelAnimations object
    Object.entries(modelAnimations).forEach(([modelPath, { actions }]) => {
        Object.keys(actions).forEach((animationName) => {
            // Create an <li> element for each animation
            const listItem = document.createElement('li');
            listItem.textContent = `${modelPath}: ${animationName}`; // Include model path for clarity

            // Add a click event listener to play the animation
            listItem.addEventListener('click', () => {
                // Stop all animations for the model
                Object.values(actions).forEach((action) => action.stop());

                // Play the clicked animation
                actions[animationName].play();
                console.log(`Playing animation: ${animationName}`);

                // Highlight the active animation
                Array.from(navBarList.children).forEach((li) => li.classList.remove('active'));
                listItem.classList.add('active');
            });

            // Append the <li> to the <ul>
            navBarList.appendChild(listItem);
        });
    });
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Update mixers
    const delta = clock.getDelta();
    mixers.forEach((mixer) => mixer.update(delta));

    // Update player movement and TPS camera
    updatePlayerMovement();
    updateTPSCamera();

    // Render the scene
    renderer.render(scene, camera);
}

// Start animation
animate();

// Handle resizing
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

