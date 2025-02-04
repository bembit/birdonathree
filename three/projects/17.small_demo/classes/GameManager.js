// classes/GameManager.js
export class GameManager {
  constructor() {
    this.GAME_STATE = {
      PLAYING: 'playing',
      PAUSED: 'paused'
    };
    this.state = this.GAME_STATE.PLAYING;
  }

  togglePause() {
    this.state = (this.state === this.GAME_STATE.PLAYING)
      ? this.GAME_STATE.PAUSED
      : this.GAME_STATE.PLAYING;
    console.log(`Game state changed to: ${this.state}`);
  }

  isPlaying() {
    return this.state === this.GAME_STATE.PLAYING;
  }
}