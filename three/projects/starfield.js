import * as THREE from 'https://unpkg.com/three@0.125.1/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.125.1/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://unpkg.com/three@0.125.1/examples/jsm/controls/OrbitControls.js';
// import GLTFLoader from "three/examples/jsm/loaders/GLTFLoader.js";
// import OrbitControls from "three/examples/jsm/controls/OrbitControls.js";

// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 50;

// Target the canvas element
const canvas = document.getElementById('starfield-canvas');

// // Ambient Light for Base Illumination
// const ambientLight = new THREE.AmbientLight(0xffffff, 1);
// scene.add(ambientLight);

// Renderer with the selected canvas
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Starfield
const starGeometry = new THREE.BufferGeometry();
const starCount = 10000;
const starPositions = new Float32Array(starCount * 3);

for (let i = 0; i < starCount; i++) {
    const distance = 50 + Math.random() * 450;
    const theta = THREE.MathUtils.randFloatSpread(360);
    const phi = THREE.MathUtils.randFloatSpread(360);

    starPositions[i * 3] = distance * Math.sin(theta) * Math.cos(phi);
    starPositions[i * 3 + 1] = distance * Math.sin(theta) * Math.sin(phi);
    starPositions[i * 3 + 2] = distance * Math.cos(theta);
}

starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

// Star color and material
// ### tomorrow - swap points to sphere //  
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.2 });
let stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

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

// Camera rotation
let rotationX = 0; // Vertical rotation
let rotationY = 0; // Horizontal rotation
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

document.addEventListener('mousemove', (event) => {
    if (!isCanvasActive) return; // Only track movement if the canvas is active

    const sensitivity = 0.002; // Adjust this to make the mouse movement more or less sensitive
    rotationY -= event.movementX * sensitivity; // Rotate around Y-axis (turn left/right)
    rotationX -= event.movementY * sensitivity; // Rotate around X-axis (look up/down)

    // Limit the vertical rotation to avoid flipping
    rotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotationX));
});

// Movement vectors
let movementSpeed = 0.1;

function calculateMovement() {
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();

    // Get the forward vector from the camera
    camera.getWorldDirection(forward);

    // Calculate the right vector by taking the cross product of forward and the world up vector
    right.crossVectors(forward, camera.up);

    forward.normalize();
    right.normalize();

    // Movement vector
    const movement = new THREE.Vector3();

    if (keys.w) movement.add(forward); // Move forward
    if (keys.s) movement.add(forward.clone().negate()); // Move backward
    if (keys.a) movement.add(right.clone().negate()); // Move left
    if (keys.d) movement.add(right); // Move right

    movement.normalize().multiplyScalar(movementSpeed); // Scale to speed
    return movement;
}

// try models

const clock = new THREE.Clock();

// let mixer;

// const loader = new GLTFLoader();

// let model;

// loader.load(
//     './astronaut_floating_in_space.glb',
//     (gltf) => {
//         model = gltf.scene; // Assign the model to the global variable
//         model.position.y = -1.7;
//         model.position.x = 2;
//         model.position.z = 47;
//         scene.add(model);

//         mixer = new THREE.AnimationMixer(model);

//         gltf.animations.forEach((clip) => {
//             const action = mixer.clipAction(clip);
//             action.play();
//         });
//     },
//     undefined,
//     (error) => {
//         console.error('An error happened', error);
//     }
// );

const cameraTrackingModels = [];

const clickableModels = [];


function loadModel(config) {

    const loader = new GLTFLoader();


    loader.load(
        config.path,
        (gltf) => {
            const model = gltf.scene;
            model.position.set(config.position.x, config.position.y, config.position.z);
            model.scale.set(config.scale, config.scale, config.scale);

            // Create a group for the model and its lights
            const group = new THREE.Group();
            group.add(model);

            // Add lights if they are defined
            if (config.lights) {
                config.lights.forEach((lightConfig) => {
                    const LightType = THREE[lightConfig.type]; // Dynamically create light type
                    const light = new LightType(
                        lightConfig.color,
                        lightConfig.intensity,
                        lightConfig.distance
                    );
                    light.position.set(
                        lightConfig.position.x,
                        lightConfig.position.y,
                        lightConfig.position.z
                    );
                    group.add(light); // Add light to the group

                    group.userData.light = light;

                });
            }

            // Add the group to the scene
            scene.add(group);

            // Add to clickable models
            clickableModels.push(model);

            // Handle animations if needed
            if (config.animations && gltf.animations.length > 0) {
                const mixer = new THREE.AnimationMixer(model);
                gltf.animations.forEach((clip) => {
                    const action = mixer.clipAction(clip);
                    action.play();
                });
                mixers.push(mixer);
            }

            // Add the model to the list of objects for camera tracking
            if (config.lookAtCamera) {
                cameraTrackingModels.push(model);
            }

        },
        undefined,
        (error) => console.error('Error loading model:', error)
    );
}


// Global array for mixers (if animations are used)
const mixers = [];

// Example usage:
// loadModel('./astronaut.glb', { x: 2, y: -1.4, z: 47 }, 1);
// loadModel('./space_fighter.glb', { x: -10, y: 5, z: 50 }, 0.5);
// loadModel('./planet.glb', { x: 20, y: -5, z: 60 }, 3, false);

// const models = [
//     { path: './astronaut.glb', position: { x: 2, y: -1.4, z: 47 }, scale: 1 },
//     { path: './space_fighter.glb', position: { x: -10, y: 5, z: 50 }, scale: 0.1 },
//     // { path: './planet.glb', position: { x: 20, y: -5, z: 60 }, scale: 3, animations: false }
// ];

// MAKE it an async loader tomorrow
// check on animations don't just play all
// or array it
const models = [
    {
        path: './astronaut.glb',
        position: { x: 2, y: -1.4, z: 47 },
        scale: 1,
        lookAtCamera: true,
        // rotation?
        // ship needs rotation and base float animation
        animations: true,
        lights: [
            { type: 'PointLight', color: 0xffffff, intensity: 1, distance: 50, position: { x: 0, y: 2, z: 2 } }
        ]
    },
    {
        path: './space_fighter.glb',
        position: { x: 12, y: 1, z: 50 },
        scale: 0.1,
        lookAtCamera: false,
        animations: false,
        lights: [
            { type: 'SpotLight', color: 0x00ff00, intensity: 3, distance: 100, position: { x: 0, y: 5, z: -5 } }
        ]
    },
    // Add more models as needed
];

// models.forEach((config) => {
//     loadModel(config.path, config.position, config.scale, config.animations ?? true);
// });

models.forEach((modelConfig) => loadModel(modelConfig));


const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function onPointerClick(event) {
    // Convert pointer position to normalized device coordinates
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Set raycaster
    raycaster.setFromCamera(pointer, camera);

    // Find intersections
    const intersects = raycaster.intersectObjects(clickableModels, true);

    if (intersects.length > 0) {
        // Find the parent group of the clicked object
        let clickedObject = intersects[0].object;
        while (clickedObject.parent && !clickedObject.userData.light) {
            clickedObject = clickedObject.parent; // Traverse up to the group
        }

        const light = clickedObject.userData.light;
        if (light) {
            // Toggle between red and green
            const currentColor = light.color.getHex(); // Get current color as a number
            const newColor = currentColor === 0x00ff00 ? 0xff0000 : 0x00ff00; // Toggle color
            light.color.set(newColor); // Set the new color
        }
        // light.color.set(Math.random() * 0xffffff); // Set a random color
    }
}

// Add the click event listener
window.addEventListener('click', onPointerClick);

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // model and animations
    // console.log(models);

    // model.lookAt(camera.position);
    // models.forEach(model => model.lookAt(camera.position));

    // Update mixers for animations
    const delta = clock.getDelta();
    mixers.forEach((mixer) => mixer.update(delta));
    // 
    if (cameraTrackingModels) cameraTrackingModels.forEach(model => model.lookAt(camera.position));

    // Calculate movement based on keys and camera orientation
    const movement = calculateMovement();
    camera.position.add(movement);

    // Apply mouse-based rotation to the camera
    camera.rotation.x = rotationX; // Vertical rotation (look up/down)
    camera.rotation.y = rotationY; // Horizontal rotation (turn left/right)

    // Reset stars that move behind the camera
    // remove so we can turn immediately and see the stars
    // const positions = starGeometry.attributes.position.array;
    // for (let i = 0; i < starCount; i++) {
    //     if (positions[i * 3 + 2] + camera.position.z > 5) {
    //         positions[i * 3 + 2] -= 500;
    //     }
    // }
    starGeometry.attributes.position.needsUpdate = true;

    // Render scene
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

// #################
// options

// Keep track of the star density toggle state
let starDensityToggled = false;

// Reset View Button
document.getElementById('reset-view').addEventListener('click', () => {
    camera.position.set(0, 0, 50); // Reset camera position
    rotationX = 0; // Reset rotation
    rotationY = 0;
    console.log("View reset to starting position.");
});

// Toggle Star Density Button
document.getElementById('toggle-starcount').addEventListener('click', () => {
    if (starDensityToggled) {
        // Reset to original star count
        resetStarfield(starCount);
    } else {
        // Increase star count to 16x
        resetStarfield(starCount * 16);
    }
    starDensityToggled = !starDensityToggled; // Toggle state
    console.log(`Star density toggled: ${starDensityToggled ? 'High' : 'Normal'}`);
});

// Speed Slider
document.getElementById('speed-slider').addEventListener('input', (event) => {
    movementSpeed = parseFloat(event.target.value);
    console.log(`Speed set to: ${movementSpeed}`);
});

document.getElementById('toggle-ui').addEventListener('click', () => {
    // document.body.classList.toggle('hide-ui');
    const uiElements = document.querySelectorAll('.container, .header, .footer');
    uiElements.forEach(element => element.classList.toggle('hide-ui'));
    console.log("UI toggled.");
});


// Recreate the starfield with new count
function resetStarfield(newStarCount) {
    scene.remove(stars); // Remove existing stars
    const newStarPositions = new Float32Array(newStarCount * 3);

    for (let i = 0; i < newStarCount; i++) {
        const distance = 50 + Math.random() * 450;
        const theta = THREE.MathUtils.randFloatSpread(360);
        const phi = THREE.MathUtils.randFloatSpread(360);

        newStarPositions[i * 3] = distance * Math.sin(theta) * Math.cos(phi);
        newStarPositions[i * 3 + 1] = distance * Math.sin(theta) * Math.sin(phi);
        newStarPositions[i * 3 + 2] = distance * Math.cos(theta);
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(newStarPositions, 3));
    starGeometry.attributes.position.needsUpdate = true;

    stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars); // Add new stars to the scene
}
