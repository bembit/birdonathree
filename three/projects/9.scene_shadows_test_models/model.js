import * as THREE from 'https://unpkg.com/three@0.125.1/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.125.1/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 4);
camera.lookAt(0, 0, 0);

// Target the canvas element
const canvas = document.getElementById('starfield-canvas');

// // Ambient Light for Base Illumination
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

// Create a green grass tile
const grassGeometry = new THREE.PlaneGeometry(255, 255); // Width and height of the tile
const grassMaterial = new THREE.MeshLambertMaterial({ color: 0x2fa515 }); // Green color
const grassTile = new THREE.Mesh(grassGeometry, grassMaterial);

// Rotate the tile to lie flat on the ground
grassTile.rotation.x = -Math.PI / 2; // Rotate to face upward
grassTile.position.set(0, 0, 0); // Place it at the center of the scene
grassTile.receiveShadow  = true;
scene.add(grassTile);

// Add light to illuminate the tile
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(25, 25, -50);
scene.add(light);

// Add sunlight
const sunlight = new THREE.DirectionalLight(0xffffff, 1);
sunlight.position.set(10, 20, 10);
scene.add(sunlight);
sunlight.castShadow = true;

// Reference to the parent element where sliders will be appended
const navBarUl = document.querySelector('.nav-bar ul');

// Shadow properties directly tied to sunlight.shadow
const shadowProperties = {
    "mapSize.width": () => sunlight.shadow.mapSize.width,
    "mapSize.height": () => sunlight.shadow.mapSize.height,
    "camera.near": () => sunlight.shadow.camera.near,
    "camera.far": () => sunlight.shadow.camera.far,
    "camera.left": () => sunlight.shadow.camera.left,
    "camera.right": () => sunlight.shadow.camera.right,
    "camera.top": () => sunlight.shadow.camera.top,
    "camera.bottom": () => sunlight.shadow.camera.bottom
};

// Configure shadow map
// sunlight.shadow.mapSize.width = 2048;
// sunlight.shadow.mapSize.height = 2048;
// sunlight.shadow.camera.near = 0.5;
// sunlight.shadow.camera.far = 50;
// sunlight.shadow.camera.left = -10;
// sunlight.shadow.camera.right = 10;
// sunlight.shadow.camera.top = 10;
// sunlight.shadow.camera.bottom = -10;

sunlight.shadow.mapSize.width = 2048;
sunlight.shadow.mapSize.height = 2048;
sunlight.shadow.camera.near = 2;
sunlight.shadow.camera.far = 150;
sunlight.shadow.camera.left = -150;
sunlight.shadow.camera.right = 150;
sunlight.shadow.camera.top = 150;
sunlight.shadow.camera.bottom = -150;

// Renderer with the selected canvas
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Enable renderer shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

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


const clock = new THREE.Clock();

const cameraTrackingModels = [];
const clickableModels = [];
const modelAnimations = {}; // Store animations for each model
console.log(modelAnimations);

function loadModel(config) {
    const loader = new GLTFLoader();

    loader.load(
        config.path,
        (gltf) => {
            const model = gltf.scene;
            model.position.set(config.position.x, config.position.y, config.position.z);
            model.scale.set(config.scale, config.scale, config.scale);

            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.recieveShadow = true;
                }
            });

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

            // animation sorcery
            if (gltf.animations.length > 0) {
                const mixer = new THREE.AnimationMixer(model);
                const actions = {};
            
                gltf.animations.forEach((clip, index) => {
                    const action = mixer.clipAction(clip);
                    actions[clip.name] = action;
                    console.log(`Animation [${index}] - Name: ${clip.name}`);
                });
            
                // Play the first animation by default
                const firstAnimationName = gltf.animations[0].name;
                if (actions[firstAnimationName]) {
                    actions[firstAnimationName].play();
                    console.log(`Playing default animation: ${firstAnimationName}`);
                }
            
                // Store for later use
                modelAnimations[config.path] = { mixer, actions };
                mixers.push(mixer);

                // render. async loading on anims block ui render on load
                // renderAnimations();

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

const models = [
    {
        path: '../../models/env_scene/vegetation/grass.glb',
        // position: { x: 2, y: -1.4, z: 47 },
        position: { x: 0, y: 0, z: -1 },
        scale: 0.2,
        lookAtCamera: false,
        animations: false,
        lights: [
            { type: 'SpotLight', color: 0x0ffffff, intensity: 1, distance: 1000, position: { x: 0, y: 5, z: -5 } }
        ]
    },
    {
        path: '../../models/env_scene/vegetation/stylized_tropical_grass.glb',
        // position: { x: 2, y: -1.4, z: 47 },
        position: { x: -4, y: 0, z: 3 },
        scale: 1,
        lookAtCamera: false,
        animations: false,
        lights: [
            { type: 'SpotLight', color: 0x0ffffff, intensity: 1, distance: 1000, position: { x: 0, y: 5, z: -5 } }
        ]
    },
    {
        path: '../../models/env_scene/vegetation/stylized_bush.glb',
        // position: { x: 2, y: -1.4, z: 47 },
        position: { x: 5, y: 0, z: 0 },
        scale: 1.5,
        lookAtCamera: false,
        animations: false,
        lights: [
            { type: 'SpotLight', color: 0x0ffffff, intensity: 1, distance: 1000, position: { x: 0, y: 5, z: -5 } }
        ]
    },
    {
        path: '../../models/env_scene/vegetation/stylized_tree.glb',
        // position: { x: 2, y: -1.4, z: 47 },
        position: { x: -5, y: 0, z: 0 },
        scale: 20,
        lookAtCamera: false,
        animations: false,
        lights: [
            { type: 'SpotLight', color: 0x0ffffff, intensity: 1, distance: 100, position: { x: 0, y: 5, z: -5 } }
        ]
    },
    {
        path: '../../models/env_scene/vegetation/stylized_tree.glb',
        // position: { x: 2, y: -1.4, z: 47 },
        position: { x: -5, y: 0, z: 15 },
        scale: 20,
        lookAtCamera: false,
        animations: false,
        lights: [
            { type: 'SpotLight', color: 0x0ffffff, intensity: 1, distance: 100, position: { x: 0, y: 5, z: -5 } }
        ]
    },
    {
        path: '../../models/env_scene/vegetation/stylized_tree.glb',
        // position: { x: 2, y: -1.4, z: 47 },
        position: { x: 5, y: 0, z: 15 },
        scale: 20,
        lookAtCamera: false,
        animations: false,
        lights: [
            { type: 'SpotLight', color: 0x0ffffff, intensity: 1, distance: 100, position: { x: 0, y: 5, z: -5 } }
        ]
    },
    {
        path: '../../models/env_scene/vegetation/stylized_tree.glb',
        // position: { x: 2, y: -1.4, z: 47 },
        position: { x: 5, y: 0, z: -15 },
        scale: 20,
        lookAtCamera: false,
        animations: false,
        lights: [
            { type: 'SpotLight', color: 0x0ffffff, intensity: 1, distance: 100, position: { x: 0, y: 5, z: -5 } }
        ]
    },
    {
        path: '../../models/env_scene/vegetation/stylized_tree.glb',
        // position: { x: 2, y: -1.4, z: 47 },
        position: { x: 19, y: 0, z: 5 },
        scale: 20,
        lookAtCamera: false,
        animations: false,
        lights: [
            { type: 'SpotLight', color: 0x0ffffff, intensity: 1, distance: 100, position: { x: 0, y: 5, z: -5 } }
        ]
    },
    {
        path: '../../models/env_scene/vegetation/tree.glb',
        // position: { x: 2, y: -1.4, z: 47 },
        position: { x: 0, y: 0, z: 0 },
        scale: 0.1,
        lookAtCamera: false,
        animations: false,
        lights: [
            { type: 'PointLight', color: 0x00fffff, intensity: 1, distance: 1000, position: { x: 0, y: 5, z: -5 } }
        ]
    },
    {
        path: '../../models/env_scene/stylized_clouds.glb',
        // position: { x: 2, y: -1.4, z: 47 },
        position: { x: 0, y: 74, z: 0 },
        scale: 1,
        lookAtCamera: false,
        animations: false,
        lights: [
            { type: 'SpotLight', color: 0x0fffffff, intensity: 1, distance: 1000, position: { x: 0, y: 5, z: -5 } }
        ]
    },
    {
        path: '../../models/catwoman_rigged.glb',
        // position: { x: 2, y: -1.4, z: 47 },
        position: { x: 6, y: 0, z: 3 },
        scale: 1,
        lookAtCamera: false,
        animations: false,
        lights: [
            { type: 'SpotLight', color: 0x0fffffff, intensity: 1, distance: 1000, position: { x: 0, y: 5, z: -5 } }
        ]
    },
    {
        path: '../../models/catwoman_rigged.glb',
        // position: { x: 2, y: -1.4, z: 47 },
        position: { x: 0, y: 0, z: 0 },
        scale: 1,
        lookAtCamera: false,
        animations: false,
        lights: [
            { type: 'SpotLight', color: 0x0fffffff, intensity: 1, distance: 100, position: { x: 0, y: 5, z: -5 } }
        ]
    },
];

models.forEach((modelConfig) => loadModel(modelConfig));


const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function onPointerClick(event) {
    console.log("clicked");
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
            console.log(light);
        }
    }
}

// Add the click event listener
window.addEventListener('click', onPointerClick);

// Animation loop
function animate() {
    requestAnimationFrame(animate);

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

