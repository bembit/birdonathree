// Game.js
import * as THREE from 'https://unpkg.com/three@0.125.1/build/three.module.js';
import { CameraController } from './CameraController.js';
import { StaticModelLoader } from './StaticModelLoader.js';
import { PlayerCharacter } from './PlayerCharacter.js';

import { Player } from './Player.js';
import { MovementController } from './MovementController.js';

export class Game {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = this.createCamera();
    this.renderer = this.createRenderer();
    this.cameraController = new CameraController(this.camera, this.renderer.domElement);
    this.clock = new THREE.Clock();

    this.staticModelLoader = new StaticModelLoader(this.scene);

    this.mixers = [];
    this.modelAnimations = {};

    this.environmentGroup = new THREE.Group();
    this.environmentGroup.name = 'Environment';
    this.scene.add(this.environmentGroup);
    // move import path to file later
    
    this.movementController = new MovementController(this.player, this.camera, this.scene);
    
    this.player = new PlayerCharacter(this.scene, './models/catwoman_rigged.glb', 'Catwoman');

    // this.player = new Player(this.scene, './models/catwoman_rigged.glb', 'Catwoman'); 

    this.loadEnvironment();
    this.addLighting();
    this.addGrass();
    console.log("AAAAAAAAAAAAAAAAAAA", this.mixers);

    this.animate();
  }

  createCamera() {
    const camera = new THREE.OrthographicCamera(
      window.innerWidth / -100, window.innerWidth / 100,
      window.innerHeight / 100, window.innerHeight / -100,
      0.1, 1000
    );
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);
    return camera;
  }

  createRenderer() {
    const canvas = document.getElementById('game-canvas');
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    return renderer;
  }

  loadEnvironment() {
    const staticModelLoader = new StaticModelLoader(this.environmentGroup);
    fetch('./envAssets.json')
      .then((res) => res.json())
      .then((assetsConfig) => {
        assetsConfig.forEach((asset) => {
          staticModelLoader.loadModel(asset.path, asset.name, asset.options);
        });
      });
  }

  addLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    this.scene.add(ambientLight);

    const sunlight = new THREE.DirectionalLight(0xffffff, 1);
    sunlight.position.set(10, 20, 10);
    sunlight.castShadow = true;
    sunlight.shadow.mapSize.width = 2048;
    sunlight.shadow.mapSize.height = 2048;
    sunlight.shadow.camera.near = 0.5;
    sunlight.shadow.camera.far = 50;
    sunlight.shadow.camera.left = -10;
    sunlight.shadow.camera.right = 10;
    sunlight.shadow.camera.top = 10;
    sunlight.shadow.camera.bottom = -10;
    this.scene.add(sunlight);
  }

  addGrass() {
    const grassGeometry = new THREE.PlaneGeometry(255, 255);
    const grassMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const grassTile = new THREE.Mesh(grassGeometry, grassMaterial);
    grassTile.rotation.x = -Math.PI / 2;
    grassTile.position.set(0, 0, 0);
    grassTile.receiveShadow = true;
    this.scene.add(grassTile);
  }

  animate() {
    const deltaTime = this.clock.getDelta();
    this.player.update(deltaTime);

    requestAnimationFrame(() => this.animate());

    // this.movementController.update(this.delta);

    this.renderer.render(this.scene, this.camera);
    this.cameraController.update();
  }

}

export default Game;