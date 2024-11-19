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

// ############ galaxy 1
// Additional Galaxy Settings
// const spiralArmCount = 2;      // Number of spiral arms
// const starDensity = 4000;      // Number of stars in the galaxy core and arms
// const galaxyRadius = 20;       // Overall radius of the Milky Way

// ######## Geometry for spiral galaxy
// const galaxyGeometry = new THREE.BufferGeometry();
// const galaxyPositions = [];

// for (let i = 0; i < starDensity; i++) {
//     const angle = i * 0.1;  // Spread the stars in a logarithmic spiral pattern
//     const distance = Math.sqrt(i / starDensity) * galaxyRadius;  // Increase radius gradually

//     // Add slight randomness for a natural look
//     const x = Math.cos(angle * spiralArmCount) * distance + (Math.random() - 0.5);
//     const y = (Math.random() - 0.5) * 0.5;  // Thin disk effect
//     const z = Math.sin(angle * spiralArmCount) * distance + (Math.random() - 0.5);

//     galaxyPositions.push(x, y, z);
// }

// galaxyGeometry.setAttribute('position', new THREE.Float32BufferAttribute(galaxyPositions, 3));

// // Material for the spiral galaxy
// const galaxyMaterial = new THREE.PointsMaterial({ color: 0xaaaaFF, size: 0.05, blending: THREE.AdditiveBlending, transparent: true });

// // Points for galaxy
// const milkyWayGalaxy = new THREE.Points(galaxyGeometry, galaxyMaterial);
// scene.add(milkyWayGalaxy);

// Reverse Gaussian Galaxy Parameters
const spiralArmCount = 2;       // Number of spiral arms
const starDensity = 4000;       // Number of stars in the galaxy
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

// ############## galaxy 2

// Spiral Galaxy Parameters
const spiralArmCount2 = 4;        // Number of arms in the spiral
const starsPerArm = 1000;        // Stars per arm
const armSpread = 0.3;           // Spread of stars perpendicular to the arm
const armLengthFactor = 5;       // Controls length of arms

// Geometry and positions array for spiral arms
const spiralGeometry = new THREE.BufferGeometry();
const positions2 = [];

for (let arm = 0; arm < spiralArmCount2; arm++) {
    for (let i = 0; i < starsPerArm; i++) {
        // Angle and distance calculations for logarithmic spiral
        const angle = i * 0.1 + (arm * (Math.PI * 2 / spiralArmCount2));
        const distance = armLengthFactor * Math.sqrt(i / starsPerArm);

        // Convert polar coordinates (distance, angle) to Cartesian (x, y)
        const x = Math.cos(angle) * distance + (Math.random() - 0.5) * armSpread;
        const y = (Math.random() - 0.5) * armSpread * 0.5;  // Flat disk effect
        const z = Math.sin(angle) * distance + (Math.random() - 0.5) * armSpread;

        // Push the star's position to the array
        positions2.push(x, y, z);
    }
}

// Set up geometry
spiralGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions2, 3));

// Material for galaxy arms
const spiralMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.01,
    blending: THREE.AdditiveBlending,
    transparent: true,
});

// Create and add galaxy to the scene
const milkyWayGalaxy2 = new THREE.Points(spiralGeometry, spiralMaterial);
// scene.add(milkyWayGalaxy2);

// ############# galaxy 3

// Gaussian Galaxy Parameters
const gaussianStarCount = 5000;  // Total number of stars in the galaxy
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


// ########### Galaxy 3

// // Spiral Galaxy Parameters
// const spiralArmCount3 = 4;        // Number of arms in the spiral
// const starsPerArm3 = 1000;        // Stars per arm
// const armSpread3 = 0.3;           // Spread of stars perpendicular to the arm
// const armLengthFactor3 = 5;       // Controls length of arms

// // Geometry and positions array for spiral arms
// const spiralGeometry3 = new THREE.BufferGeometry();
// const positions3 = [];
// const colors = [];

// // Define base colors for each arm
// const armColors = [
//     new THREE.Color(0xff6666),  // Reddish for arm 1
//     new THREE.Color(0x66ff66),  // Greenish for arm 2
//     new THREE.Color(0x6666ff),  // Bluish for arm 3
//     new THREE.Color(0xffff66),  // Yellowish for arm 4
// ];

// for (let arm = 0; arm < spiralArmCount3; arm++) {
//     for (let i = 0; i < starsPerArm3; i++) {
//         // Angle and distance calculations for logarithmic spiral
//         const angle = i * 0.1 + (arm * (Math.PI * 2 / spiralArmCount3));
//         const distance = armLengthFactor3 * Math.sqrt(i / starsPerArm3);

//         // Convert polar coordinates (distance, angle) to Cartesian (x, y)
//         const x = Math.cos(angle) * distance + (Math.random() - 0.5) * armSpread3;
//         const y = (Math.random() - 0.5) * armSpread3 * 0.5;  // Flat disk effect
//         const z = Math.sin(angle) * distance + (Math.random() - 0.5) * armSpread3;

//         // Push the star's position to the array
//         positions3.push(x, y, z);

//         // Color each star based on its arm, with a slight variation
//         const starColor = armColors[arm].clone();
//         starColor.offsetHSL(0, 0, (Math.random() - 0.5) * 0.1);  // Small lightness variation
//         colors.push(starColor.r, starColor.g, starColor.b);
//     }
// }

// // Set up geometry
// spiralGeometry3.setAttribute('position', new THREE.Float32BufferAttribute(positions3, 3));
// spiralGeometry3.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

// // Material for galaxy arms with vertex colors enabled
// const spiralMaterial3 = new THREE.PointsMaterial({
//     size: 0.07,
//     vertexColors: true,  // Enables per-vertex coloring
//     blending: THREE.AdditiveBlending,
//     transparent: true,
// });

// // Create and add galaxy to the scene
// const milkyWayGalaxy3 = new THREE.Points(spiralGeometry3, spiralMaterial3);
// milkyWayGalaxy3.position.set(7, 0, -1);  // Adjust these values as you like
// scene.add(milkyWayGalaxy3);

// ######## raycaster

// // Step 1: Define a Raycaster
// const raycaster = new THREE.Raycaster();
// const mouse = new THREE.Vector2();

// // Event listener to capture mouse movement
// window.addEventListener('mousemove', (event) => {
//     mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//     mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
// });

// // Step 2: Create highlight effect
// function highlightGalaxySection() {
//     // Update the raycaster with the camera and mouse position
//     raycaster.setFromCamera(mouse, camera);
    
//     // Check intersection with galaxy points
//     const intersects = raycaster.intersectObject(gaussianGalaxy);

//     // If hovering over the galaxy points
//     if (intersects.length > 0) {
//         const intersectionPoint = intersects[0];
        
//         // Change the material color or size for highlighted effect
//         gaussianMaterial.color.set(0xFFFFFF);  // Example: set color to white
        
//         // Optional: add borders or visual separation
//         addBordersToSection(intersectionPoint.point);
//     } else {
//         // Reset material when not hovering
//         gaussianMaterial.color.set(0xaaaaFF);  // Original galaxy color
//     }
// }

// // Step 3: Adding Borders to Highlighted Section
// function addBordersToSection(centerPoint) {
//     // Create border lines around the highlighted section
//     const borderGeometry = new THREE.BufferGeometry();
//     const borderPositions = []; // Define positions based on `centerPoint`
    
//     // Example: Creating a small circular border
//     const radius = 1;
//     for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 10) {
//         borderPositions.push(
//             centerPoint.x + Math.cos(angle) * radius,
//             centerPoint.y + Math.sin(angle) * radius,
//             centerPoint.z
//         );
//     }
//     borderGeometry.setAttribute('position', new THREE.Float32BufferAttribute(borderPositions, 3));

//     const borderMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
//     const border = new THREE.LineLoop(borderGeometry, borderMaterial);

//     scene.add(border);
// }

// #### highlight tests

// Highlight Points
const highlightGeometry = new THREE.BufferGeometry();
const highlightPositions = [
    new THREE.Vector3(1, 2, 1),
    new THREE.Vector3(-3, -1, 0),
    new THREE.Vector3(2, 3, -2),
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

        console.log("Point clicked:", intersects[0].point);
        // create a new div element
        const navigation = document.getElementById("navigation");
        navigation.innerHTML = "X: " + intersects[0].point.x + ", Y: " + intersects[0].point.y + ", Z: " + intersects[0].point.z;
    }
});

// window.addEventListener('mouseover', () => {
//     raycaster.setFromCamera(mouse, camera);
//     const intersects = raycaster.intersectObject(highlightPoints);

//     // change color on mouse hover
//     if (intersects.length > 0) {
//         highlightPoints.material.color.set(0xffffff); // Highlight color on hover
//     } else {
//         highlightPoints.material.color.set(0xffdd44); // Reset to default color
//     }
// });

// reset view button
document.getElementById("resetView").addEventListener("click", () => {
    targetPosition = null;
    camera.position.set(0, 15, 15);  // Position the camera above the scene
    camera.lookAt(0, 0, 0);         // Ensure it looks towards the center of the scene
    const navigation = document.getElementById("navigation");
    navigation.innerHTML = '';
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

// ########### Zoom in and out.
// Event Listener for Scroll Wheel (Zoom)
window.addEventListener('wheel', (event) => {
  const zoomSpeed = 0.5;
  camera.position.z += event.deltaY * zoomSpeed * 0.01;

  // Clamp zoom level within specified limits
  // camera.position.z = Math.max(minZoom, Math.min(maxZoom, camera.position.z));
  camera.position.z = Math.max(Math.min(camera.position.z));

});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Camera panning based on mouse position
    // camera.position.x += (mouseX * 12 - camera.position.x) * 0.05;
    // camera.position.y += (mouseY * 12 - camera.position.y) * 0.05;
    // camera.lookAt(scene.position); // Ensure the camera always looks at the scene center

    // Camera panning based on mouse position, restricting to x and z axes
    // camera.position.x += (mouseX * 1 - camera.position.x) * 0.05;
    // camera.position.z += (mouseY * 1 - camera.position.z) * 0.05;

    // check if we are zoomed in and add a panning effect
    if (camera.position.z < 15) {
        camera.position.x += (mouseX * 12 - camera.position.x) * 0.05;
        camera.position.y += (mouseY * 12 - camera.position.y) * 0.05;
    // camera.lookAt(scene.position); // Ensure the camera always looks at the scene center
    }

    // camera.position.y = 15;  // Keep the camera above the scene
    // camera.lookAt(scene.position); // Ensure the camera always looks at the scene center

    // highlightGalaxySection(); // Call the function to check for hover and highlight

    // Check for hover to change color or size
    // raycaster.setFromCamera(mouse, camera);
    // const intersects = raycaster.intersectObject(highlightPoints);

    animateCamera();

    // highlightPoints.material.color.set(0xffdd44); // Reset to default color
    // if (intersects.length > 0) {
    //     highlightPoints.material.color.set(0xffdd44); // Highlight color on hover
    // }

    stars.rotation.y += 0.0001;  // Slow rotation for realism

    reverseGalaxy.rotation.y += 0.00025;
    
    // milkyWayGalaxy.rotation.y += 0.001;

    milkyWayGalaxy2.rotation.y -= 0.001;

    // milkyWayGalaxy3.rotation.y += 0.001;

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