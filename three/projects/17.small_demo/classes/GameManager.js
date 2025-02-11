// classes/GameManager.js
// export class GameManager {
//   constructor() {
//     this.GAME_STATE = {
//       // handle start and end of game
//       PLAYING: 'playing',
//       PAUSED: 'paused'
//     };
//     this.state = this.GAME_STATE.PLAYING;
//   }

//   togglePause() {
//     this.state = (this.state === this.GAME_STATE.PLAYING)
//       ? this.GAME_STATE.PAUSED
//       : this.GAME_STATE.PLAYING;
//     console.log(`Game state changed to: ${this.state}`);
//   }

//   isPlaying() {
//     return this.state === this.GAME_STATE.PLAYING;
//   }
// }


// if game is running, shouldn't be able to start game again and again with "s"
// export class GameManager {
//   constructor() {
//     this.GAME_STATE = {
//       START: 'start',
//       PLAYING: 'playing',
//       PAUSED: 'paused',
//       GAMEOVER: 'gameover'
//     };
//     // Initially, you might show a start screen.
//     this.state = this.GAME_STATE.START;
//   }

//   startGame() {
//     this.state = this.GAME_STATE.PLAYING;
//     console.log('Game started!');
//   }

//   pauseGame() {
//     if (this.state === this.GAME_STATE.PLAYING) {
//       this.state = this.GAME_STATE.PAUSED;
//     }
//   }

//   resumeGame() {
//     if (this.state === this.GAME_STATE.PAUSED) {
//       this.state = this.GAME_STATE.PLAYING;
//     }
//   }

//   togglePause() {
//     if (this.state === this.GAME_STATE.PLAYING) {
//       this.pauseGame();
//     } else if (this.state === this.GAME_STATE.PAUSED) {
//       this.resumeGame();
//     }
//     console.log(`Game state changed to: ${this.state}`);
//   }

//   gameOver() {
//     this.state = this.GAME_STATE.GAMEOVER;
//     console.log('Game over!');
//     // render game over screen
//     // reset game etc.
//   }

//   isPlaying() {
//     return this.state === this.GAME_STATE.PLAYING;
//   }
// }

// classes/GameManager.js
export class GameManager {
  constructor() {
    this.GAME_STATE = {
      START: 'start',
      PLAYING: 'playing',
      PAUSED: 'paused',
      GAMEOVER: 'gameover'
    };
    // Initially, we’re at the start screen.
    this.state = this.GAME_STATE.START;

    // A callback function that gets called when we want to reset the game.
    // This allows you to decouple the reset logic (like reinitializing health, 
    // recreating the player, etc.) from the GameManager.
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
      // call resetgame when start is pressed during gameover and start the game right away
      this.resetGame();
    }
    // Only allow starting if we’re at the start screen or after a game over.
    if (this.state === this.GAME_STATE.START || this.state === this.GAME_STATE.GAMEOVER) {
      this.state = this.GAME_STATE.PLAYING;
      console.log('Game started!');
    }
  }

  /**
   * Pauses the game.
   */
  pauseGame() {
    if (this.state === this.GAME_STATE.PLAYING) {
      this.state = this.GAME_STATE.PAUSED;
      console.log('Game paused!');
    }
  }

  /**
   * Resumes the game from a paused state.
   */
  resumeGame() {
    if (this.state === this.GAME_STATE.PAUSED) {
      this.state = this.GAME_STATE.PLAYING;
      console.log('Game resumed!');
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
    }
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
    // reset global states
    // timers
    // scores

    // After resetting, you might return to the start screen.
    this.state = this.GAME_STATE.START;
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
