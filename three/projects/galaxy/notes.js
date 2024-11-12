import * as THREE from 'three';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(10, 10, 10);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Gaussian Galaxy (as before) ...
// Assuming gaussianGalaxy is already created and added to the scene

// Highlight Points
const highlightGeometry = new THREE.BufferGeometry();
const highlightPositions = [
    // Specify static positions within the galaxy
    new THREE.Vector3(1, 2, 1),
    new THREE.Vector3(-3, -1, 0),
    new THREE.Vector3(2, 3, -2),
];
highlightGeometry.setFromPoints(highlightPositions);

const highlightMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.2,
    transparent: true,
    opacity: 0.8,
});
const highlightPoints = new THREE.Points(highlightGeometry, highlightMaterial);
scene.add(highlightPoints);

// Raycaster for interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener('click', () => {
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(highlightPoints);
    if (intersects.length > 0) {
        console.log("Point clicked:", intersects[0].point);
        // Trigger interaction for the specific point
    }
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Check for hover to change color or size
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(highlightPoints);

    highlightPoints.material.color.set(0xffffff); // Reset to default color
    if (intersects.length > 0) {
        highlightPoints.material.color.set(0xffdd44); // Highlight color on hover
    }

    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
