// hyperjump!

let hyperjumpActive = false;

document.addEventListener('keydown', (event) => {
    if (event.key === 'Shift' && !hyperjumpActive) {
        hyperjumpActive = true;
        activateHyperjump();
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'Shift') {
        hyperjumpActive = false;
        deactivateHyperjump();
    }
});

function activateHyperjump() {
    const positions = starGeometry.attributes.position.array;

    for (let i = 0; i < starCount; i++) {
        const z = positions[i * 3 + 2];

        // Stretch stars along the Z-axis
        positions[i * 3 + 2] = z * 10; // Increase stretch factor for speed effect
    }

    starGeometry.attributes.position.needsUpdate = true;
    console.log("Hyperjump activated!");
}

function deactivateHyperjump() {
    const positions = starGeometry.attributes.position.array;

    for (let i = 0; i < starCount; i++) {
        const z = positions[i * 3 + 2];

        // Restore stars to normal positions
        positions[i * 3 + 2] = z / 10; // Reduce stretch factor back
    }

    starGeometry.attributes.position.needsUpdate = true;
    console.log("Hyperjump deactivated!");
}
