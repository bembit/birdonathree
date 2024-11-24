import * as THREE from 'https://unpkg.com/three@0.125.1/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.125.1/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Third-Person Camera Variables
const cameraOffset = new THREE.Vector3(0, 4, -6); // Camera position relative to player
const cameraTargetOffset = new THREE.Vector3(0, 1, 0); // Target position offset (player's head level)
let rotationAngle = -1.5; // Horizontal rotation around the player

// Target the canvas element
const canvas = document.getElementById('starfield-canvas');

// Create a green grass tile
const grassGeometry = new THREE.PlaneGeometry(255, 255); // Width and height of the tile
const grassMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 }); // Green color
const grassTile = new THREE.Mesh(grassGeometry, grassMaterial);

// Rotate the tile to lie flat on the ground
grassTile.rotation.x = -Math.PI / 2; // Rotate to face upward
grassTile.position.set(0, 0, 0); // Place it at the center of the scene
grassTile.receiveShadow = true; // Enable shadows for the grass tile
scene.add(grassTile);

// // Ambient Light for Base Illumination
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

// Create directional light
const sunlight = new THREE.DirectionalLight(0xffffff, 1); // White light with intensity 1
sunlight.position.set(10, 20, 10); // Position it above and at an angle
scene.add(sunlight);
sunlight.castShadow = true;

// Configure shadow properties for better performance
sunlight.shadow.mapSize.width = 2048; // Higher value = sharper shadows (default is 512)
sunlight.shadow.mapSize.height = 2048;
sunlight.shadow.camera.near = 0.5; // Start of shadow casting
sunlight.shadow.camera.far = 50; // End of shadow casting
sunlight.shadow.camera.left = -10; // Adjust bounds to cover scene
sunlight.shadow.camera.right = 10;
sunlight.shadow.camera.top = 10;
sunlight.shadow.camera.bottom = -10;

// Renderer with the selected canvas
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

renderer.shadowMap.enabled = true; // Enable shadows
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Use soft shadows (optional)

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

let currentAnimation = null; // Track the current animation
const transitionDuration = 0.5; // Time in seconds for transitions

let isJumping = false; // Flag to track if the player is jumping
// let jumpHeight = 1; // Adjust the height of the jump
// let gravity = -0.005; 
let gravity = -0.002;
let velocityY = 1; // Vertical velocity for jumping
let jumpDuration = 100;

const initialJumpVelocity = (jumpDuration / 2) * Math.abs(gravity); // (time to peak) * abs(gravity)

let horizontalVelocity = new THREE.Vector3(); // To store horizontal movement (X, Z)

let leftStickDelta = { x: 0, y: 0 }; // Movement delta
let rightStickDelta = { x: 0, y: 0 }; // Camera delta

// Update the player movement, including jump handling
function updatePlayerMovement() {
    if (!player) return;
    
    let playerAnimations = modelAnimations[models[0].path]?.actions; // Ensure animations are loaded

    const movement = new THREE.Vector3(
        leftStickDelta.x, // X movement
        0,                // No vertical movement for now
        -leftStickDelta.y // Z movement (invert Y for natural control)
    );

    // Scale movement by speed and apply it
    const speed = 0.1; // Adjust speed as needed
    movement.multiplyScalar(speed);
    player.position.add(movement);

    // Smoothly rotate player based on right thumbstick (camera control)
    if (rightStickDelta.x !== 0 || rightStickDelta.y !== 0) {
        const rotationSpeed = 0.03; // Adjust for sensitivity
        rotationAngle -= rightStickDelta.x * rotationSpeed; // Adjust horizontal rotation
        const verticalOffset = cameraOffset.y + rightStickDelta.y * rotationSpeed * 2;
        cameraOffset.y = THREE.MathUtils.clamp(verticalOffset, 2, 8); // Clamp vertical rotation
    }

    // Handle jumping
    if (isJumping) {
        // Apply gravity to simulate falling
        velocityY += gravity;

        // Apply vertical movement
        player.position.y += velocityY;

        // If the player reaches the ground again, end the jump
        if (player.position.y <= 0) {
            player.position.y = 0; // Keep player at ground level
            isJumping = false; // End the jump
            velocityY = 0; // Reset vertical velocity
        }

        // Apply horizontal movement while jumping
        player.position.x += horizontalVelocity.x;
        player.position.z += horizontalVelocity.z;

        // Trigger the jump animation (only if not already in the jump animation)
        const jumpAnimation = playerAnimations['jumpUp'];
        if (currentAnimation !== jumpAnimation) {
            if (currentAnimation) currentAnimation.fadeOut(transitionDuration);
            jumpAnimation.reset().fadeIn(transitionDuration).play();
            currentAnimation = jumpAnimation;
        }
    } else {
        // Handle standing or running animations when not jumping
        const isMoving = movement.length() > 0;

        if (isMoving) {
            if (currentAnimation !== playerAnimations['run']) {
                // Transition to running animation
                if (currentAnimation) currentAnimation.fadeOut(transitionDuration);
                playerAnimations['run'].reset().fadeIn(transitionDuration).play();
                currentAnimation = playerAnimations['run'];
            }

            // Smoothly rotate player to face the movement direction
            const lookDirection = movement.clone().normalize();
            const targetQuaternion = new THREE.Quaternion().setFromUnitVectors(
                new THREE.Vector3(0, 0, 1), // Default forward direction
                lookDirection
            );
            player.quaternion.slerp(targetQuaternion, 0.1); // Adjust 0.1 for smoother or faster turning
        } else {
            if (currentAnimation !== playerAnimations['stand']) {
                // Transition to standing animation
                if (currentAnimation) currentAnimation.fadeOut(transitionDuration);
                playerAnimations['stand'].reset().fadeIn(transitionDuration).play();
                currentAnimation = playerAnimations['stand'];
            }
        }

        // Apply horizontal movement when not jumping
        player.position.x += horizontalVelocity.x;
        player.position.z += horizontalVelocity.z;
    }
}

// Mouse movement to rotate camera around the player
document.addEventListener('mousemove', (event) => {
    if (!isCanvasActive) return; // Rotate only when the canvas is active

    const sensitivity = 0.003; // Adjust sensitivity
    rotationAngle -= event.movementX * sensitivity; // Rotate horizontally

    // TODO: Add vertical rotation
    // 1. these needs more math and to reduce horizontal while both are in action.
    const verticalOffset = cameraOffset.y + event.movementY * sensitivity * 2;
    cameraOffset.y = THREE.MathUtils.clamp(verticalOffset, 2, 8); // Limit vertical range
});


// Camera zoom limits
const minZoom = 2; // Minimum distance from the player
const maxZoom = 15; // Maximum distance from the player
let zoomDistance = 6; // Initial zoom distance (matches the z-offset in cameraOffset)

function updateTPSCamera() {
    if (!player) return;

    // Adjust camera position using rotationAngle and zoomDistance
    camera.position.set(
        player.position.x + zoomDistance * Math.cos(rotationAngle), // Horizontal rotation
        player.position.y + cameraOffset.y,                        // Vertical offset
        player.position.z + zoomDistance * Math.sin(rotationAngle) // Horizontal rotation
    );

    // Always look at the player (or an offset for smoother experience)
    const targetPosition = player.position.clone().add(cameraTargetOffset);
    camera.lookAt(targetPosition);
}

// scroll event for zoom
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

let player;

// Load the player model
function loadModel(config) {
    const loader = new GLTFLoader();

    loader.load(config.path,(gltf) => {
            const model = gltf.scene;
            model.position.set(config.position.x, config.position.y, config.position.z);
            model.scale.set(config.scale, config.scale, config.scale);

            scene.add(model);
            // Enable shadows for the player
            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            // shadows are in meshes, not in the model itself
            // model.receiveShadow = true;
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
                // renderAnimations();
            }
        },
        undefined,
        (error) => console.error('Error loading model:', error)
    );
}

// global array for mixers (if animations are used)
const mixers = [];

const models = [
    {
        path: '../../models/catwoman_rigged.glb',
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

// ################ thumb controls
// this should always align the camera, face to movement direction when left thumbstick is used.

if (window.innerWidth < 768) {
    createThumbsticks();
}

function createThumbsticks() {
    // movement
    const leftStick = document.createElement('div');
    leftStick.id = 'left-stick';
    leftStick.innerHTML = "Move";
    leftStick.style.cssText = `
        position: absolute;
        bottom: 75px;
        left: 35px;
        width: 100px;
        height: 100px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        touch-action: none;
    `;
    document.body.appendChild(leftStick);

    // camera control
    const rightStick = document.createElement('div');
    rightStick.id = 'right-stick';
    rightStick.innerHTML = "Look";
    rightStick.style.cssText = `
        position: absolute;
        bottom: 75px;
        right: 35px;
        width: 100px;
        height: 100px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        touch-action: none;
    `;
    document.body.appendChild(rightStick);

    // extras, like jump
    const jumpButton = document.createElement('button');
    jumpButton.id = 'jump-button';
    jumpButton.innerHTML = "Jump";
    jumpButton.style.cssText = `
        position: absolute;
        bottom: 175px;
        right: 100px;
        width: 50px;
        height: 50px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        touch-action: none;
    `;
    document.body.appendChild(jumpButton);

    initializeThumbstickEvents();
}

const jumpButton = document.getElementById("jump-button");

jumpButton.addEventListener('touchstart', (event) => {
    if (!isJumping) {
        isJumping = true;
        // math diff between desktop and mobile?
        // or this framerate specific?
        // yes it is!
        velocityY = initialJumpVelocity;
        console.log(velocityY);
    }
});

function initializeThumbstickEvents() {
    const leftStick = document.getElementById('left-stick');
    const rightStick = document.getElementById('right-stick');

    function handleTouchStart(event, isLeftStick) {
        // const touch = event.targetTouches[0];
        const rect = event.target.getBoundingClientRect();
        const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };

        event.target.ontouchmove = (e) => {
            const moveTouch = e.targetTouches[0];
            const deltaX = moveTouch.clientX - center.x;
            const deltaY = moveTouch.clientY - center.y;

            if (isLeftStick) {
                // normalize to [-1, 1] --- Dive
                leftStickDelta.x = -deltaX / (rect.width / 2);
                leftStickDelta.y = deltaY / (rect.height / 2);
            } else {
                rightStickDelta.x = deltaX / (rect.width / 2);
                rightStickDelta.y = deltaY / (rect.height / 2);
            }
        };

        event.target.ontouchend = () => {
            if (isLeftStick) {
                leftStickDelta = { x: 0, y: 0 }; // Reset when touch ends
            } else {
                rightStickDelta = { x: 0, y: 0 };
            }
            event.target.ontouchmove = null;
            event.target.ontouchend = null;
        };
    }

    leftStick.addEventListener('touchstart', (e) => handleTouchStart(e, true));
    rightStick.addEventListener('touchstart', (e) => handleTouchStart(e, false));
}
