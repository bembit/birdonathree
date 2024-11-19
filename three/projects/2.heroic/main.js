import * as THREE from 'three';

// Game States
const gameStates = {
    START: 'START',
    PLAYING: 'PLAYING',
    GAME_OVER: 'GAME_OVER',
};

let currentGameState = gameStates.START;
let enemyCount = 0;

// Scene and Camera setup for isometric view
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(
    window.innerWidth / -100, window.innerWidth / 100,
    window.innerHeight / 100, window.innerHeight / -100,
    0.1, 1000
);
camera.position.set(10, 10, 10); // Isometric position
camera.lookAt(0, 0, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
scene.add(light);

// Hero (Green Square)
const heroGeometry = new THREE.BoxGeometry(1, 1, 1);
const heroMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
const hero = new THREE.Mesh(heroGeometry, heroMaterial);
hero.position.set(-8, 0.5, 0);
scene.add(hero);

const enemyGeometry = new THREE.BoxGeometry(1, 1, 1);
const enemyMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
const enemies = [];
const enemySpeed = 0.01; // Slow movement speed

// Stats
const heroStats = { health: 100, maxHealth: 100, attack: 15, defense: 10 };
const enemyStats = { health: 80, maxHealth: 80, attack: 10, defense: 5 };

// Health Bar for Hero
const healthBarGeometry = new THREE.PlaneGeometry(1, 0.1);
const heroHealthMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const heroHealthBar = new THREE.Mesh(healthBarGeometry, heroHealthMaterial);
heroHealthBar.position.set(hero.position.x, hero.position.y + 1, hero.position.z);
scene.add(heroHealthBar);

// Array for enemy health bars
const enemyHealthBars = [];

// UI Element for "Attack" message
const attackMessageElement = document.getElementById('attackMessage');

// Movement variables
const movementSpeed = 0.1;
const keysPressed = {};

// Event listeners for key presses
window.addEventListener('keydown', (event) => {
    keysPressed[event.key.toLowerCase()] = true;
});

window.addEventListener('keyup', (event) => {
    keysPressed[event.key.toLowerCase()] = false;
});

// Start Game function
function startGame(difficulty) {
    enemyCount = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 5 : 8; // Set enemy count based on difficulty
    resetGame();
    currentGameState = gameStates.PLAYING;
}

// Reset Game function
function resetGame() {
    hero.position.set(-8, 0.5, 0);

    // Clear existing enemies
    enemies.forEach(enemy => scene.remove(enemy));
    enemies.length = 0;
    enemyHealthBars.forEach(bar => scene.remove(bar));
    enemyHealthBars.length = 0;

    // Generate enemies at random positions
    for (let i = 0; i < enemyCount; i++) {
        const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);
        enemy.position.set(
            Math.random() * 10 - 5, // Random x between -5 and 5
            0.5,
            Math.random() * 10 - 5  // Random z between -5 and 5
        );
        enemies.push(enemy);
        scene.add(enemy);

        // Create health bar for each enemy
        const enemyHealthBar = new THREE.Mesh(healthBarGeometry, new THREE.MeshBasicMaterial({ color: 0xff0000 }));
        enemyHealthBar.position.set(enemy.position.x, enemy.position.y + 1, enemy.position.z);
        enemyHealthBars.push(enemyHealthBar);
        scene.add(enemyHealthBar);
    }
}

let targetedEnemy = null;

// Calculate distance and show "Attack" if within range
function checkDistance() {
    enemies.forEach((enemy) => {
        const distance = hero.position.distanceTo(enemy.position);
        const enemyHealthBar = enemyHealthBars[enemies.indexOf(enemy)];

        // Update health bar position to follow enemy
        enemyHealthBar.position.set(enemy.position.x, enemy.position.y + 1, enemy.position.z);

        if (distance <= 2.5) {
            attackMessageElement.innerText = 'Attack!';
            targetedEnemy = enemy; // Set the targeted enemy
        } else {
            attackMessageElement.innerText = 'Out of range';
            targetedEnemy = null;
        }
    });
}

// Event listener for spacebar to attack
window.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === ' ') { // Spacebar
        if (targetedEnemy) { // Check if there is a targeted enemy
            // Simulate attack on the targeted enemy
            const enemyIndex = enemies.indexOf(targetedEnemy);
            if (enemyIndex !== -1) {
                // Remove the enemy from the scene
                enemies.splice(enemyIndex, 1); // Remove from the enemies array
                scene.remove(targetedEnemy);
                targetedEnemy = null;

                // Optional: Show a victory message
                alert('Victory!');

                resetGame(); // Reset the game
            }
        }
    }
});

// Update hero position based on key press
function updateHeroPosition() {
    if (keysPressed['w']) hero.position.z -= movementSpeed; // Move up
    if (keysPressed['s']) hero.position.z += movementSpeed; // Move down
    if (keysPressed['a']) hero.position.x -= movementSpeed; // Move left
    if (keysPressed['d']) hero.position.x += movementSpeed; // Move right

    // Update hero's health bar position to follow
    heroHealthBar.position.set(hero.position.x, hero.position.y + 1, hero.position.z);
}

// Move enemies randomly within bounds
function updateEnemies() {
    enemies.forEach((enemy) => {
        const direction = enemy.direction || new THREE.Vector3(
            Math.random() * 2 - 1, // Random x direction between -1 and 1
            0,
            Math.random() * 2 - 1  // Random z direction between -1 and 1
        ).normalize(); // Normalize to maintain consistent speed

        enemy.position.addScaledVector(direction, enemySpeed);

        // Boundary check: if enemy hits boundary, reverse direction
        if (Math.abs(enemy.position.x) > 5) {
            enemy.position.x = Math.sign(enemy.position.x) * 5; // Push back to boundary
            direction.x *= -1; // Reverse direction
        }
        if (Math.abs(enemy.position.z) > 5) {
            enemy.position.z = Math.sign(enemy.position.z) * 5; // Push back to boundary
            direction.z *= -1; // Reverse direction
        }

        enemy.direction = direction; // Update enemy direction
    });
}

// Check for collisions between hero and enemies
function checkCollisions() {
    enemies.forEach((enemy) => {
        const distance = hero.position.distanceTo(enemy.position);
        if (distance < 1) { // Adjust the distance based on the size of your boxes
            console.log('Game Over!'); // Display Game Over message
            currentGameState = gameStates.START; // Reset game state
            resetGame(); // Reset the game to initial state
        }
    });
}

// Update Health Bars based on health percentage
function updateHealthBars() {
    const heroHealthPercent = heroStats.health / heroStats.maxHealth;

    heroHealthBar.scale.x = heroHealthPercent; // Scale based on health
    heroHealthBar.position.set(hero.position.x, hero.position.y + 1, hero.position.z);
}

// Render Loop
function animate() {
    requestAnimationFrame(animate);

    if (currentGameState === gameStates.PLAYING) {
        // Update hero position
        updateHeroPosition();

        // Update enemy movement
        updateEnemies();

        // Check distance between hero and enemies
        checkDistance();

        // Check for collisions
        checkCollisions();

        // Update health bars
        updateHealthBars();
    }

    renderer.render(scene, camera);
}
animate();

// Resize handling
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.left = window.innerWidth / -100;
    camera.right = window.innerWidth / 100;
    camera.top = window.innerHeight / 100;
    camera.bottom = window.innerHeight / -100;
    camera.updateProjectionMatrix();
});

// Example function to trigger difficulty selection
document.getElementById('easyButton').onclick = () => startGame('easy');
document.getElementById('mediumButton').onclick = () => startGame('medium');
document.getElementById('hardButton').onclick = () => startGame('hard');
