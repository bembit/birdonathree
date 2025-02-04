// classes/HealthBar.js

// this could be just bar
// extend bar to health bar or stamina bar?

export class HealthBar {
  constructor(model) {
    this.model = model;
    this.health = 100; // percentage health
    this.domElement = document.createElement('div');
    this.domElement.className = 'health-bar';
    this.domElement.style.width = '50px';
    this.domElement.style.height = '5px';
    document.body.appendChild(this.domElement);
  }

  setHealth(health) {
    this.health = health;
    // Update the width (or color) to reflect current health.
    const width = Math.max(0, Math.min(100, health));
    this.domElement.style.width = `${width * 0.5}px`; // adjust multiplier as needed
  }

  update() {
    if (!this.model) return;
    // Position the health bar above the model.
    const pos = this.model.position.clone();
    pos.y += 2; // adjust the offset as needed
    pos.project(window.camera); // uses the global camera reference
    const x = (pos.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-pos.y * 0.5 + 0.5) * window.innerHeight;
    this.domElement.style.left = `${x - 25}px`;
    this.domElement.style.top = `${y - 5}px`;
  }
}
