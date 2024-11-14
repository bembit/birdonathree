import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// camera.position.z = 5;
camera.position.z = 50; 

// target the canvas element
const canvas = document.getElementById('starfield-canvas');

// renderer with the selected canvas
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// starfield
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

// star color and material
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.2 });
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

let mouseX = 0;
let mouseY = 0;

// colors for transition
const color1 = new THREE.Color(0xffff00);  // yellow
const color2 = new THREE.Color(0x0000ff);  // blue
const color3 = new THREE.Color(0xfffff);  // white

document.addEventListener('mousemove', (event) => {
  mouseX = (event.clientX / window.innerWidth) - 0.5;
  mouseY = (event.clientY / window.innerHeight) - 0.5;
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    camera.position.z -= 0.005;

    camera.position.x += (mouseX * 5 - camera.position.x) * 1;
    camera.position.y += (mouseY * 5 - camera.position.y) * 1;

    // Reset stars that move behind the camera
    const positions = starGeometry.attributes.position.array;
    for (let i = 0; i < starCount; i++) {
        if (positions[i * 3 + 2] + camera.position.z > 5) {
            positions[i * 3 + 2] -= 500;
        }
    }
    starGeometry.attributes.position.needsUpdate = true;

    // Interpolate colors based on mouse position
    const color = color1.clone();
    color.lerp(color2, (mouseX + 0.5));  // horizontal gradient transition
    color.lerp(color3, (mouseY + 0.5));  // vertical gradient transition

    // Update star color
    starMaterial.color.set(color);

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
