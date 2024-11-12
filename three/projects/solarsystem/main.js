import * as THREE from 'three';

// import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
// import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
// import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Enable shadow rendering
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Sphere with Reflective Material
const geometry = new THREE.SphereGeometry(1, 32, 32);
// Material with Vertex Colors Enabled
// MeshToonMaterial ?
const material = new THREE.MeshStandardMaterial({
    color: 0x000000,
    // vertexColors: true,   // Enable vertex colors for gradient
    metalness: 0.5,
    roughness: 0.3
});

// Function to Create a Sphere with Size and Position
function createSphere(size, position) {
    const sphere = new THREE.Mesh(geometry, material);
    sphere.scale.set(size, size, size); // Scale sphere for different sizes
    sphere.position.set(position.x, position.y, position.z); // Position sphere in 3D space

    // Enable shadow casting and receiving for each sphere
    sphere.castShadow = true;
    sphere.receiveShadow = true;

    scene.add(sphere);
    return sphere;
}

// Add multiple spheres to the scene
const spheres = [
    createSphere(1, { x: 0, y: 0, z: 0 }),       // Original sphere
    createSphere(0.5, { x: 2, y: 1, z: -2 }),    // Smaller sphere, offset position
    createSphere(0.75, { x: -4, y: -1, z: 1 }),  // Medium sphere, offset position
    createSphere(0.3, { x: 1.5, y: 2, z: -1 }),  // Tiny sphere, offset position
    createSphere(0.8, { x: -1.5, y: -1.5, z: 1 }),// Larger sphere, offset position
    createSphere(0.9, { x: 1.5, y: -1.5, z: 2 }),// Larger sphere, offset position
];

const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

// Ambient Light for Base Illumination
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

// Point Lights for Moving Highlights
const pointLight1 = new THREE.PointLight(0xff8800, 1.5);
const pointLight2 = new THREE.PointLight(0x88ffdd, 1);
pointLight1.position.set(3, 0, 0);
pointLight2.position.set(-3, 0, 0);
scene.add(pointLight1);
scene.add(pointLight2);

// Spotlight for General Illumination
const spotLight = new THREE.SpotLight(0xffffff, 5000);
spotLight.position.set(5, 5, 5);
scene.add(spotLight);

const spotLightBottom = new THREE.SpotLight(0xbbb, 5000);
spotLightBottom.position.set(2, 10, 15);
// spotLightBottom.target.position.set(0, 0, 0);
spotLightBottom.castShadow = true;
spotLightBottom.shadow.mapSize.width = 1024;
spotLightBottom.shadow.mapSize.height = 1024;
scene.add(spotLightBottom);

// Camera Position
// camera.position.z = 5;
camera.position.set(0, 0, 5);

// ###### Make a sun
// Create the Sun
const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
const sunMaterial = new THREE.MeshStandardMaterial({
    color: 0xffcc00,        // Sun color
    emissive: 0xffaa00,     // Makes it "glow"
    emissiveIntensity: 1.5, // Brightness of the glow
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
sun.position.set(-8, 5, 0); // Position Sun in the scene
scene.add(sun);

// Sunlight Effect (PointLight)
const sunLight = new THREE.PointLight(0xffaa33, 20000, 100); // Light color, intensity, and range
sunLight.position.copy(sun.position);
sunLight.castShadow = true;           // Enable shadows for this light
sunLight.shadow.mapSize.width = 1024; // Increase shadow quality
sunLight.shadow.mapSize.height = 1024;
scene.add(sunLight);


// ###### set panning and rotation
// Track mouse movement
let mouseX = 0;
let mouseY = 0;

// Mousemove Event Listener to Update Mouse Coordinates
window.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});

// ########### Zoom in and out.
// Event Listener for Scroll Wheel (Zoom)
window.addEventListener('wheel', (event) => {
  const zoomSpeed = 0.5;
  camera.position.z += event.deltaY * zoomSpeed * 0.01;

  // Clamp zoom level within specified limits
  // camera.position.z = Math.max(minZoom, Math.min(maxZoom, camera.position.z));
  camera.position.z = Math.max(Math.min(camera.position.z));

});
// Camera Zoom in/out with Scroll Wheel
// const minZoom = 3;
// const maxZoom = 20;
// window.addEventListener('wheel', (event) => {
//     const zoomSpeed = 0.5;
//     camera.position.z += event.deltaY * zoomSpeed * 0.01;
//     camera.position.z = Math.max(minZoom, Math.min(maxZoom, camera.position.z));
// });
// ######

// Create groups for spheres and lights
const groups = spheres.map(sphere => {
  const group = new THREE.Group();
  group.add(sphere);

  // Optional: add a static spotlight to the group
  const spotlight = new THREE.SpotLight(0x8888ff, 0.5);
  spotlight.position.set(2, 2, 0); // Position spotlight relative to sphere
  spotlight.target = sphere; // Point the spotlight at the sphere
  group.add(spotlight);

  scene.add(group); // Add group to the scene
  return group;
});

let starField;     // Declare starField globally for access in event listener
let starMaterial;  // Declare starMaterial globally for access in event listener

function createStars() {
  const starCount = 500; // Number of stars
  const starGeometry = new THREE.BufferGeometry(); // BufferGeometry for efficiency

  // Create an array to store star positions
  const starPositions = new Float32Array(starCount * 3);

  // Randomly position each star in 3D space
  for (let i = 0; i < starCount * 3; i += 3) {
      // Random position in a wide radius
      starPositions[i] = (Math.random() - 0.5) * 100;
      starPositions[i + 1] = (Math.random() - 0.5) * 100;
      starPositions[i + 2] = (Math.random() - 0.5) * 100;
  }

  // Assign the positions to the geometry
  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

  // Initialize the star material with default color
  starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,        // Initial star color
      size: 0.2,              // Small size for star-like effect
      sizeAttenuation: true,  // Makes stars look smaller when further from camera
      transparent: true,
      opacity: 0.8
  });

  // Create the Points object for stars
  starField = new THREE.Points(starGeometry, starMaterial);
  scene.add(starField); // Add stars to the scene
}

createStars(); // Initialize stars in the scene

// quick controls test
// Reset View Button
document.getElementById('resetView').addEventListener('click', () => {
	camera.position.set(0, 0, 5);
	camera.lookAt(scene.position);
});

// Color Picker
document.getElementById('colorPicker').addEventListener('input', (event) => {
	const color = event.target.value;
	material.color.set(color); // Update the color of all planets
});

document.getElementById('colorPickerStars').addEventListener('change', (event) => {
	const color = event.target.value;
	starMaterial.color.set(color); // Update the color of all planets
});

let rotationSpeed = 1;
// Speed Slider
document.getElementById('speedSlider').addEventListener('input', (event) => {
	rotationSpeed = parseFloat(event.target.value);
});



// Animation Loop to Rotate Lights Around Sphere
function animate() {
  requestAnimationFrame(animate);
  
  // Twinkling effect by adjusting star opacity
  if (starField) { // Ensure starField is defined
    starField.material.opacity = 0.7 + Math.sin(Date.now() * 0.002) * 0.3;
  } else {
    console.log('starField is not defined');
  }

  // Rotate each group around the Y-axis
  groups.forEach((group, index) => {
    // Adjust the speed and radius of rotation for each group
    // const rotationSpeed = 0.001 + index * 0.0005; // Slightly different speed for each group
    group.rotation.y += 0.005 * rotationSpeed;
  });
  // Camera panning based on mouse position
  camera.position.x += (mouseX * 2 - camera.position.x) * 0.05;
  camera.position.y += (mouseY * 2 - camera.position.y) * 0.05;
  camera.lookAt(scene.position); // Ensure the camera always looks at the scene center

  sun.rotation.y += 0.0005;

  // Calculate time-based angle
  const time = Date.now() * 0.0015; // Adjust speed by changing multiplier

  // Rotate point lights in circular paths around the sphere
  pointLight1.position.x = Math.cos(time) * 3;
  pointLight1.position.z = Math.sin(time) * 3;
  pointLight2.position.x = Math.cos(time + Math.PI) * 3; // Opposite direction
  pointLight2.position.z = Math.sin(time + Math.PI) * 3;
    // console.log('Animating...'); // Confirm animation loop is running

  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.left = window.innerWidth / -100;
  camera.right = window.innerWidth / 100;
  camera.top = window.innerHeight / 100;
  camera.bottom = window.innerHeight / -100;
  camera.updateProjectionMatrix();
});