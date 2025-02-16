// classes/GameManager.js

import { UserInterfaceManager } from './UserInterfaceManager.js';

export class GameManager {
  constructor() {
    this.GAME_STATE = {
      START: 'start',
      PLAYING: 'playing',
      PAUSED: 'paused',
      GAMEOVER: 'gameover'
    };
    // Initially, we are at the *start screen*.
    this.state = this.GAME_STATE.START;

    this.uiManager = new UserInterfaceManager(this);
    // A callback function that gets called when we want to reset the game.
    // This allows to decouple the reset logic from the GameManager.
    // (like reinitializing health, recreating the player, etc.)
    this.resetCallback = null;
  }

  /**
   * Starts the game only if it's not already running.
   */
  startGame() {
    if (this.state === this.GAME_STATE.PLAYING) {
      console.log('Game is already running.');
      return;
    }
    if (this.state === this.GAME_STATE.GAMEOVER) {
      // Call resetgame when start is pressed during gameover and start the game right away.
      this.resetGame();
    }
    // Only allow starting if we’re at the start screen or after a game over.
    if (this.state === this.GAME_STATE.START || this.state === this.GAME_STATE.GAMEOVER) {
      this.state = this.GAME_STATE.PLAYING;
      console.log('Game started!');
      this.uiManager.updateUI();
    }
  }

  /**
   * Pauses the game.
   */
  pauseGame() {
    if (this.state === this.GAME_STATE.PLAYING) {
      this.state = this.GAME_STATE.PAUSED;
      console.log('Game paused!');
      this.uiManager.updateUI();
    }
  }

  /**
   * Resumes the game from a paused state.
   */
  resumeGame() {
    if (this.state === this.GAME_STATE.PAUSED) {
      this.state = this.GAME_STATE.PLAYING;
      console.log('Game resumed!');
      this.uiManager.updateUI();
    }
  }

  /**
   * Toggles between playing and paused states.
   */
  togglePause() {
    if (this.state === this.GAME_STATE.PLAYING) {
      this.pauseGame();
    } else if (this.state === this.GAME_STATE.PAUSED) {
      this.resumeGame();
    }
  }

  /**
   * Sets the game state to GAMEOVER.
   */
  gameOver() {
    if (this.state !== this.GAME_STATE.GAMEOVER) {
      this.state = this.GAME_STATE.GAMEOVER;
      console.log('Game over!');
      this.uiManager.updateUI();
    }
  }

  enemyDied(enemy) {
    console.log('Enemy died!', enemy);
    // TODO: temp solution.
    this.gameOver();
  }

  /**
   * Resets the game to a fresh start. This method calls the reset callback,
   * which should handle the reinitialization of game objects (player, enemy, health bars, etc.).
   */
  resetGame() {
    if (this.state !== this.GAME_STATE.GAMEOVER) {
      console.log('Cannot reset game because it is not in GAMEOVER state.');
      return;
    }
    console.log('Resetting game to a fresh state...');
    if (this.resetCallback) {
      this.resetCallback();
    }
    // Reset global states later.
    // Timers?
    // Scores?

    // After resetting, return to the start screen.
    this.state = this.GAME_STATE.START;
    this.uiManager.updateUI();
  }

  /**
   * Sets a callback to be executed when a reset is needed.
   * This is useful for decoupling the reset logic from the GameManager.
   * @param {Function} callback - A function that resets game objects.
   */
  setResetCallback(callback) {
    this.resetCallback = callback;
  }

  /**
   * Returns whether the game is currently in the PLAYING state.
   * @returns {boolean}
   */
  isPlaying() {
    return this.state === this.GAME_STATE.PLAYING;
  }
}
