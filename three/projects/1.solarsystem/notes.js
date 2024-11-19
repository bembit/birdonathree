// ############################
// Cursor rotation

// Variables for Mouse Rotation
let targetRotationX = 0;
let targetRotationY = 0;

// Event Listener for Mouse Move
window.addEventListener('mousemove', (event) => {
  // Map cursor position to rotation
  targetRotationX = (event.clientY / window.innerHeight - 0.5) * Math.PI; // Y-axis rotation
  targetRotationY = (event.clientX / window.innerWidth - 0.5) * Math.PI; // X-axis rotation

//   console.log('Mouse Move');
});


// animate();

spheres.forEach((sphere, index) => {
    sphere.rotation.x += (targetRotationX - sphere.rotation.x) * 0.05;
    sphere.rotation.y += (targetRotationY - sphere.rotation.y) * 0.05;
});

// Smoothly interpolate towards target rotation
sphere.rotation.x += (targetRotationX - sphere.rotation.x) * 0.05;
sphere.rotation.y += (targetRotationY - sphere.rotation.y) * 0.05;