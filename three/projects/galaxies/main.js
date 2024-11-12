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

// ######### starfield geometry and material
const starGeometry = new THREE.BufferGeometry();
const starCount = 10000;
const positions = [];

for (let i = 0; i < starCount; i++) {
	const x = (Math.random() - 0.5) * 100;
	const y = (Math.random() - 0.5) * 100;
	const z = (Math.random() - 0.5) * 100;
	positions.push(x, y, z);
}

starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// Reverse Gaussian Galaxy Parameters
const spiralArmCount = 2;       // Number of spiral arms
const starDensity = 3000;       // Number of stars in the galaxy
const galaxyRadius = 20;        // Overall radius of the galaxy

// Geometry for the reverse Gaussian galaxy
const reverseGalaxyGeometry = new THREE.BufferGeometry();
const reverseGalaxyPositions = [];

// Modified Gaussian function for a "reverse" distribution
function reverseGaussian() {
	// Box-Muller transform to get a Gaussian distribution
	let u = 0, v = 0;
	while (u === 0) u = Math.random(); // Avoid zero
	while (v === 0) v = Math.random();
	return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

for (let i = 0; i < starDensity; i++) {
	// Generate a reverse Gaussian distance, with a higher value toward the edges
	const distance = galaxyRadius - Math.abs(reverseGaussian()) * galaxyRadius * 0.5;

	// Spread stars along a spiral using distance and angle
	const angle = i * 0.1;
	const x = Math.cos(angle * spiralArmCount) * distance + (Math.random() - 0.5);
	const y = (Math.random() - 0.5) * 0.5; // Flat disk effect
	const z = Math.sin(angle * spiralArmCount) * distance + (Math.random() - 0.5);

	// Push the star's position to the array
	reverseGalaxyPositions.push(x, y, z);
}

// Set up geometry
reverseGalaxyGeometry.setAttribute('position', new THREE.Float32BufferAttribute(reverseGalaxyPositions, 3));

// Material for reverse Gaussian galaxy
const reverseGalaxyMaterial = new THREE.PointsMaterial({
	color: 0xaaaaFF,
	size: 0.05,
	blending: THREE.AdditiveBlending,
	transparent: true,
});

// Create and add reverse Gaussian galaxy to the scene
const reverseGalaxy = new THREE.Points(reverseGalaxyGeometry, reverseGalaxyMaterial);
scene.add(reverseGalaxy);

// ############## spiral galaxy

// // Spiral Galaxy Parameters
// const spiralArmCount2 = 4;        // Number of arms in the spiral
// const starsPerArm = 1000;        // Stars per arm
// const armSpread = 0.3;           // Spread of stars perpendicular to the arm
// const armLengthFactor = 5;       // Controls length of arms

// // Geometry and positions array for spiral arms
// const spiralGeometry = new THREE.BufferGeometry();
// const positions2 = [];

// for (let arm = 0; arm < spiralArmCount2; arm++) {
// 	for (let i = 0; i < starsPerArm; i++) {
// 		// Angle and distance calculations for logarithmic spiral
// 		const angle = i * 0.1 + (arm * (Math.PI * 2 / spiralArmCount2));
// 		const distance = armLengthFactor * Math.sqrt(i / starsPerArm);

// 		// Convert polar coordinates (distance, angle) to Cartesian (x, y)
// 		const x = Math.cos(angle) * distance + (Math.random() - 0.5) * armSpread;
// 		const y = (Math.random() - 0.5) * armSpread * 0.5;  // Flat disk effect
// 		const z = Math.sin(angle) * distance + (Math.random() - 0.5) * armSpread;

// 		// Push the star's position to the array
// 		positions2.push(x, y, z);
// 	}
// }

// // Set up geometry
// spiralGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions2, 3));

// // Material for galaxy arms
// const spiralMaterial = new THREE.PointsMaterial({
// 	color: 0xffffff,
// 	size: 0.01,
// 	blending: THREE.AdditiveBlending,
// 	transparent: true,
// });

// // Create and add galaxy to the scene
// const milkyWayGalaxy2 = new THREE.Points(spiralGeometry, spiralMaterial);
// scene.add(milkyWayGalaxy2);

// ############# gaussian galaxy

// Gaussian Galaxy Parameters
const gaussianStarCount = 5000;  // Total number of stars in the galaxy
// const gaussianStarCount = 8000;  // Total number of stars in the galaxy
const gaussianGalaxyRadius = 20;         // Maximum radius of the galaxy

// Geometry and positions array for the Gaussian galaxy
const gaussianGeometry = new THREE.BufferGeometry();
const gaussianPositions = [];

// Gaussian distribution function
function gaussianRandom() {
	// Box-Muller transform for Gaussian distribution
	let u = 0, v = 0;
	while (u === 0) u = Math.random(); // Avoid zero
	while (v === 0) v = Math.random();
	return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

for (let i = 0; i < gaussianStarCount; i++) {
	// Distance from the center following a Gaussian distribution
	const distance = Math.abs(gaussianRandom()) * gaussianGalaxyRadius * 0.5;
	
	// Random angle for positioning around the center
	const angle = Math.random() * Math.PI * 2;

	// Convert polar coordinates (distance, angle) to Cartesian (x, z)
	const x = Math.cos(angle) * distance + (Math.random() - 0.5) * 0.2;  // Minor randomness
	const y = (Math.random() - 0.5) * 0.5;                               // Thin disk effect
	const z = Math.sin(angle) * distance + (Math.random() - 0.5) * 0.2;

	// Push the star's position to the array
	gaussianPositions.push(x, y, z);
}

// Set up geometry
gaussianGeometry.setAttribute('position', new THREE.Float32BufferAttribute(gaussianPositions, 3));

// Material for Gaussian galaxy
const gaussianMaterial = new THREE.PointsMaterial({
	color: 0xffffcc,
	size: 0.02,
	blending: THREE.AdditiveBlending,
	transparent: true,
});

// Create and add Gaussian galaxy to the scene
const gaussianGalaxy = new THREE.Points(gaussianGeometry, gaussianMaterial);
scene.add(gaussianGalaxy);

// #### highlight tests

// Highlight Points
const highlightGeometry = new THREE.BufferGeometry();
const highlightPositions = [
	new THREE.Vector3(1, 2, 1),
	new THREE.Vector3(-3, -1, 0),
	new THREE.Vector3(2, 3, -2),
	// new THREE.Vector3(0, 0, 0),
	new THREE.Vector3(2, 12, 2),
	new THREE.Vector3(-5, 8, 0),
];
highlightGeometry.setFromPoints(highlightPositions);

const highlightMaterial = new THREE.PointsMaterial({
	color: 0xff3333,
	size: 0.3,
	transparent: true,
	opacity: 0.8,
});
const highlightPoints = new THREE.Points(highlightGeometry, highlightMaterial);
scene.add(highlightPoints);

// planets test

// Load the texture for Earth
const textureLoader = new THREE.TextureLoader();
const earthTexture = textureLoader.load('./moon.jpg'); // Ensure to provide the correct path

// Create an array to hold planet meshes
const highlightPlanets = [];

// Create planets next to each highlight point
highlightPositions.forEach(position => {
    // Create a sphere geometry for each planet
    const sphereGeometry = new THREE.SphereGeometry(0.2, 32, 32); // Radius, width segments, height segments
    const sphereMaterial = new THREE.MeshStandardMaterial({ map: earthTexture });
    const planet = new THREE.Mesh(sphereGeometry, sphereMaterial);
    
    // Position the planet next to the highlight point
    planet.position.copy(position);
    planet.position.x += 0.5; // Offset to the right, adjust as needed
    
    // Add the planet to the scene
    scene.add(planet);
    
    // Store the planet in the highlightPlanets array for potential use later
    highlightPlanets.push(planet);
});

// Raycaster for interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let targetPosition = null;

// Mouse move event to detect intersections
window.addEventListener('mousemove', (event) => {
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Click event for moving camera
window.addEventListener('click', () => {
	raycaster.setFromCamera(mouse, camera);
	const intersects = raycaster.intersectObject(highlightPoints);

	if (intersects.length > 0) {
		targetPosition = intersects[0].point.clone(); // Set target position to clicked point

		zoomEnabled = false; // Disable zooming when moving the camera and highlighting a point

		console.log("Point clicked:", intersects[0].point);
		// create a new div element
		const navigation = document.getElementById("navigation");
		navigation.innerHTML = "X: " + intersects[0].point.x + ", Y: " + intersects[0].point.y + ", Z: " + intersects[0].point.z;
	}
});

// reset view button
document.getElementById("resetView").addEventListener("click", () => {
	targetPosition = null;
	camera.position.set(0, 15, 15);  // Position the camera above the scene
	camera.lookAt(0, 0, 0);         // Ensure it looks towards the center of the scene
	const navigation = document.getElementById("navigation");
	navigation.innerHTML = 'unknown';

	zoomEnabled = true; // Enable zooming when resetting the view
});

// Function to animate the camera
function animateCamera() {
	if (targetPosition) {
		// Calculate the direction vector and move partway toward the target each frame
		const step = 0.02; // Adjust this value to control the speed
		camera.position.lerp(targetPosition.clone().add(new THREE.Vector3(0.5, 0.5, 0.5)), step); 

		// Re-adjust the camera lookAt to keep focus on the target
		camera.lookAt(targetPosition);

		// Stop moving if the camera is close enough to the target
		if (camera.position.distanceTo(targetPosition) < 0.1) {
			targetPosition = null; // Stop further movement
		}
	}
}

// ######### Mouse movement set panning and rotation
// Track mouse movement
let mouseX = 0;
let mouseY = 0;

// Mousemove Event Listener to Update Mouse Coordinates
window.addEventListener('mousemove', (event) => {
	mouseX = (event.clientX / window.innerWidth) * 2 - 1;
	mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});

let zoomEnabled = true; // Zooming is enabled by default

// Define zoom limits
const minZoom = 5;  // Minimum distance to the scene
const maxZoom = 30; // Maximum distance

// Event Listener for Scroll Wheel (Zoom)
window.addEventListener('wheel', (event) => {
	if (!zoomEnabled) return; // Exit if zooming is disabled

	const zoomSpeed = 0.5;
	
	// Calculate new zoom position
	camera.position.z += event.deltaY * zoomSpeed * 0.01;
	
	// Clamp the camera position within the zoom limits
	camera.position.z = Math.max(minZoom, Math.min(maxZoom, camera.position.z));
	
	// Ensure the camera looks at the center of the scene after zooming
	camera.lookAt(0, 0, 0);
});

// window.addEventListener('keydown', (event) => {
// 	if (event.key === 'Shift') {
// 		console.log('shift');
// 	}
// 	if (camera.position.z < 15 && event.shiftKey) {
// 		camera.position.x += (mouseX * 12 - camera.position.x) * 0.05;
// 		camera.position.y += (mouseY * 12 - camera.position.y) * 0.05;
// 	// camera.lookAt(scene.position); // Ensure the camera always looks at the scene center
// 	}
// });

// Control states
let isShiftPressed = false;
let isSpacePressed = false;
// check if we are zoomed in and add a panning effect
// if i'm holding space or shift this shoulnd take effect
// Add event listeners to track key states
window.addEventListener('keydown', (event) => {
	if (event.key === 'Shift') isShiftPressed = true;
	if (event.key === ' ') isSpacePressed = true;
});

window.addEventListener('keyup', (event) => {
	if (event.key === 'Shift') isShiftPressed = false;
	if (event.key === ' ') isSpacePressed = false;
});

// Store the original sizes and color for restoration
const originalSize = highlightMaterial.size;
const originalColor = highlightMaterial.color.clone();

// Mouse move event to update the mouse vector
window.addEventListener('mousemove', (event) => {
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Function to handle hover effect on highlight points
function handleHighlightHover() {
	// Set raycaster from the camera and mouse position
	raycaster.setFromCamera(mouse, camera);
	
	// Intersect with highlight points
	const intersects = raycaster.intersectObject(highlightPoints);

	if (intersects.length > 0) {
		// If hovering over highlight points, increase size and change color
		highlightMaterial.size = 0.35;  // Increased size for hover effect
		highlightMaterial.color.set(0x00ff00);  // Change color to green
	} else {
		// Reset to original size and color when not hovering
		highlightMaterial.size = originalSize;
		highlightMaterial.color.copy(originalColor);
	}
}

// Animation loop
function animate() {
	requestAnimationFrame(animate);

	// Rotate each planet
	highlightPlanets.forEach(planet => {
		planet.rotation.y -= 0.0009; // Adjust rotation speed as needed
	});

	handleHighlightHover();

	// Shift key: Move the camera based on mouse position
	if (isShiftPressed) {
		camera.position.x += (mouseX * 12 - camera.position.x) * 0.05;
		camera.position.y += (mouseY * 12 - camera.position.y) * 0.05;
	}
	// Space key: Apply some other effect, e.g., zoom in or highlight points
	if (isSpacePressed) {
		camera.position.z -= 0.1; // Example: slowly zoom in when Space is pressed
	}
	// janky camera follow
	camera.lookAt(scene.position);

	animateCamera();

	stars.rotation.y += 0.0001;  // Slow rotation for realism

	reverseGalaxy.rotation.y += 0.00025;

	// milkyWayGalaxy2.rotation.y -= 0.001;

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