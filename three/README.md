I had this n+1 basic scene with a bit of movement, rotation and color change on hover.
bit it's quite a nice scene by itself. however I feel like this is just javascript with css.
with this math. surely not mine. you kidding me?
const starPositions = new Float32Array(starCount * 3);

```javascript
for (let i = 0; i < starCount; i++) {
    const distance = 50 + Math.random() * 450;
    const theta = THREE.MathUtils.randFloatSpread(360);
    const phi = THREE.MathUtils.randFloatSpread(360);

    starPositions[i * 3] = distance * Math.sin(theta) * Math.cos(phi);
    starPositions[i * 3 + 1] = distance * Math.sin(theta) * Math.sin(phi);
    starPositions[i * 3 + 2] = distance * Math.cos(theta);
}
```

### adjust the camera starting position
camera.position.z = 50; 

### Adjust camera position based on mouse movement
camera.position.x += (mouseX * 0.1 - camera.position.x) * 0.05;
camera.position.y += (mouseY * 0.1 - camera.position.y) * 0.05;

### should replace these with planets.
```javascript
const images = []; // Array to store sprites for later reference
const imageUrls = ['./assets/img/projects/1.png', './assets/img/projects/2.png', './assets/img/projects/3.png', './assets/img/projects/4.png', './assets/img/projects/6.png'];

imageUrls.forEach((url) => {
    const texture = new THREE.TextureLoader().load(url);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    
    // position each sprite randomly in the space
    sprite.position.set(
        (Math.random() - 0.5) * 100, 
        (Math.random() - 0.5) * 100, 
        (Math.random() - 0.5) * 100
    );
    sprite.scale.set(5, 5, 1);  // Adjust this to fit your scene
    scene.add(sprite);
    images.push(sprite); // Store sprite for later reference
});
```

### stars


```javascript
const starCounts = 5; // Adjust as needed for testing
for (let i = 0; i < starCounts; i++) {
    const starShape = createStarShape(3); // You can change the size here
    const geometry = new THREE.ShapeGeometry(starShape);
    const material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff, side: THREE.DoubleSide });
    const star = new THREE.Mesh(geometry, material);

    // Position each star randomly in the space
    star.position.set(
        (Math.random() - 1.5) * 100,
        (Math.random() - 1) * 100,
        (Math.random() - 3.2) * 100
    );

    // Scale the star if needed (optional)
    star.scale.set(1, 1, 1);
```


### adding textures

```javascript
const textureLoader = new THREE.TextureLoader();
const moonTexture = textureLoader.load('./moon.jpg'); 

// Generate stars
const starCounts = 5; // Adjust as needed for testing
for (let i = 0; i < starCounts; i++) {
    const starShape = createStarShape(3); // You can change the size here
    const geometry = new THREE.ShapeGeometry(starShape);
    const material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff, side: THREE.DoubleSide });
    const star = new THREE.Mesh(geometry, material);

    // Position each star randomly in the space
    // let randomNr = Math.random();
    star.position.set(
        (Math.random() - 0.1) * 100,
        (Math.random() - 1) * 100,
        (Math.random() - 3.2) * 100
    );

    // Scale the star if needed (optional)
    star.scale.set(1, 1, 1);

    // Add the star to the scene
    scene.add(star);

    // Create a sprite for the image and place it at the center of the star
    const spriteMaterial = new THREE.SpriteMaterial({ map: moonTexture });
    const sprite = new THREE.Sprite(spriteMaterial);

    sprite.position.set(star.position.x, star.position.y, star.position.z);
    sprite.scale.set(3, 3, 1); // Adjust the scale as needed for the image size
    scene.add(sprite);

    // Store star for later reference
    images.push({ star, sprite });
}
```