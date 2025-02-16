// classes/UserInterfaceManager.js
// Connect the UI to the game state using the GameManager.

// classes/UserInterfaceManager.js
export class UserInterfaceManager {
    constructor(gameManager) {
      this.gameManager = gameManager;
  
      // Cache the UI elements by their IDs.
      this.mainMenu = document.getElementById('main-menu');
      this.startButton = document.getElementById('start-button');
      this.pauseButton = document.getElementById('pause-button');
      this.resetButton = document.getElementById('reset-button');
      this.tooltipContainer = document.getElementById('tooltip');
  
      // Bind the click events.
      this.startButton.addEventListener('click', () => {
        if (
          this.gameManager.state === this.gameManager.GAME_STATE.START ||
          this.gameManager.state === this.gameManager.GAME_STATE.GAMEOVER
        ) {
          this.gameManager.startGame();
        } else if (this.gameManager.state === this.gameManager.GAME_STATE.PAUSED) {
          this.gameManager.resumeGame();
        }
        this.updateUI();
      });
  
      this.pauseButton.addEventListener('click', () => {
        this.gameManager.pauseGame();
        this.updateUI();
      });
  
      this.resetButton.addEventListener('click', () => {
        this.gameManager.resetGame();
        this.updateUI();
      });
  
      // Initial UI update.
      this.updateUI();
    }
  
    updateUI() {
      // Update the UI based on the current game state.
      const state = this.gameManager.state;
      if (state === this.gameManager.GAME_STATE.PLAYING) {
        this.tooltipContainer.style.display = 'flex';
      }
      if (state === this.gameManager.GAME_STATE.START) {
        // Show main menu to start.
        this.mainMenu.style.display = 'flex';
        this.startButton.innerText = 'Start Game';
        this.pauseButton.style.display = 'none';
        this.resetButton.style.display = 'none';
      } else if (state === this.gameManager.GAME_STATE.PLAYING) {
        // Hide the menu during gameplay.
        this.mainMenu.style.display = 'none';
      } else if (state === this.gameManager.GAME_STATE.PAUSED) {
        // Show menu with a resume option.
        this.mainMenu.style.display = 'flex';
        this.startButton.innerText = 'Resume Game';
        this.pauseButton.style.display = 'none';
        this.resetButton.style.display = 'none';
      } else if (state === this.gameManager.GAME_STATE.GAMEOVER) {
        // Show menu with a restart option.
        this.mainMenu.style.display = 'flex';
        this.startButton.innerText = 'Restart Game';
        this.pauseButton.style.display = 'none';
        this.resetButton.style.display = 'block';
      }
    }
  }
  