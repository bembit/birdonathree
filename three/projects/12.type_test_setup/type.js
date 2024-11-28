import * as THREE from 'three';

// import * as THREE from 'https://unpkg.com/three@0.170.0/build/three.module.js';
import { FontLoader } from 'https://unpkg.com/three@0.170.0/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'https://unpkg.com/three@0.170.0/examples/jsm/geometries/TextGeometry.js';

// import { FontLoader } from 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/loaders/FontLoader.js';
// import { TextGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/geometries/TextGeometry.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Target the canvas element
const canvas = document.getElementById('starfield-canvas');

// Renderer with the selected canvas
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Without lights the moons are not visible
// Add ambient light
const ambientLight = new THREE.AmbientLight(0x404040, 2);
scene.add(ambientLight);

// Add directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// movement

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

// Load a font
const fontLoader = new FontLoader();
fontLoader.load(
    'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', // URL of font JSON
    (font) => {
        // Create TextGeometry
        const textGeometry = new TextGeometry('Hello, Three.js!', {
            font: font,
            size: 3, // Size of the text
            height: .5, // Depth of the text
            curveSegments: 12, // Number of curve segments for smoothness
            bevelEnabled: true, // Enable bevel for rounded edges
            bevelThickness: 0.03,
            bevelSize: 0.02,
            bevelSegments: 5
        });

        // Apply a material
        const textMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);

        // Position the text
        textMesh.position.set(-5, 1, 0); 
        textMesh.rotation.x = -Math.PI / 12; // rotation

        // Add to the scene
        scene.add(textMesh);
    },
    undefined,
    (error) => {
        console.error('An error occurred loading the font:', error);
    }
);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Calculate movement based on keys and camera orientation
    const movement = calculateMovement();
    camera.position.add(movement);

    // Apply mouse-based rotation to the camera
    camera.rotation.x = rotationX; // Vertical rotation (look up/down)
    camera.rotation.y = rotationY; // Horizontal rotation (turn left/right)

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
