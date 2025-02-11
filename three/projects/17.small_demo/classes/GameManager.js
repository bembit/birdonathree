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

export class GameManager {
  constructor() {
    this.GAME_STATE = {
      START: 'start',
      PLAYING: 'playing',
      PAUSED: 'paused',
      GAMEOVER: 'gameover'
    };
    // Initially, you might show a start screen.
    this.state = this.GAME_STATE.START;
  }

  startGame() {
    this.state = this.GAME_STATE.PLAYING;
    console.log('Game started!');
  }

  pauseGame() {
    if (this.state === this.GAME_STATE.PLAYING) {
      this.state = this.GAME_STATE.PAUSED;
    }
  }

  resumeGame() {
    if (this.state === this.GAME_STATE.PAUSED) {
      this.state = this.GAME_STATE.PLAYING;
    }
  }

  togglePause() {
    if (this.state === this.GAME_STATE.PLAYING) {
      this.pauseGame();
    } else if (this.state === this.GAME_STATE.PAUSED) {
      this.resumeGame();
    }
    console.log(`Game state changed to: ${this.state}`);
  }

  gameOver() {
    this.state = this.GAME_STATE.GAMEOVER;
    console.log('Game over!');
    // Optionally, you can trigger a game over screen or overlay here.
  }

  isPlaying() {
    return this.state === this.GAME_STATE.PLAYING;
  }
}