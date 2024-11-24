import * as THREE from 'three';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// camera.position.z = 15;

// Set up camera for a top-down view
camera.position.set(0, 15, 15);  // Position the camera above the scene
camera.lookAt(0, 0, 0);         // Ensure it looks towards the center of the scene

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Without lights the moons are not visible
// Add ambient light
const ambientLight = new THREE.AmbientLight(0x404040, 2);
scene.add(ambientLight);

// Add directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Animation loop
function animate() {
	requestAnimationFrame(animate);

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