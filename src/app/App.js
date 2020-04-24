import React from "react";

import CirclesContainer from "../components/CirclesContainer";
import ButtonsContainer from "../components/ButtonsContainer";

import "../scss/css/main.min.css";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      colors: ["red", "green", "yellow", "blue"],
      cpuMoves: [],
      userMoves: [],
      activeColor: "",
      round: 1,
      userTurn: false,
      gameStarted: false,
      strictMode: false,
      sounds: {
        red: new Audio("https://s3.amazonaws.com/freecodecamp/simonSound1.mp3"),
        green: new Audio(
          "https://s3.amazonaws.com/freecodecamp/simonSound2.mp3"
        ),
        yellow: new Audio(
          "https://s3.amazonaws.com/freecodecamp/simonSound3.mp3"
        ),
        blue: new Audio(
          "https://s3.amazonaws.com/freecodecamp/simonSound4.mp3"
        ),
      },
    };

    this.startGame = this.startGame.bind(this);
    this.recordMove = this.recordMove.bind(this);
    this.verifyMove = this.verifyMove.bind(this);

    this.addColor = this.addColor.bind(this);
    this.playSequence = this.playSequence.bind(this);

    this.advanceRound = this.advanceRound.bind(this);
    this.redoRound = this.redoRound.bind(this);

    this.toggleTurn = this.toggleTurn.bind(this);
    this.clearUserMoves = this.clearUserMoves.bind(this);
    this.resetGame = this.resetGame.bind(this);
    this.toggleStrict = this.toggleStrict.bind(this);

    this.incrementRound = this.incrementRound.bind(this);
    this.getRandomColor = this.getRandomColor.bind(this);

    this.playColorFX = this.playColorFX.bind(this);
    this.animateColor = this.animateColor.bind(this);
    this.activateColor = this.activateColor.bind(this);
    this.deactivateColor = this.deactivateColor.bind(this);

    this.isFinalMove = this.isFinalMove.bind(this);
    this.isCorrect = this.isCorrect.bind(this);
  }

  startGame() {
    this.setState({
      gameStarted: true,
    });
    this.addColor();
    this.playSequence();
  }

  recordMove(color) {
    this.setState({
      userMoves: [...this.state.userMoves, color],
    });
    this.playColorFX(color);
  }

  verifyMove(color) {
    /* Wrong move:
      A) Strict mode: Restart game from beginning
      B) Normal mode: Disable user input and repeat the round
    */
    if (!this.isCorrect()) {
      if (this.state.strictMode) {
        //TO-DO: add 'game over' display (use round)
        this.resetGame();
        return;
      }
      this.toggleTurn();
      this.redoRound();
      return;
    }
    if (this.isFinalMove()) {
      this.advanceRound();
    }
  }

  addColor() {
    const newColor = this.getRandomColor();
    this.setState({
      cpuMoves: [...this.state.cpuMoves, newColor],
    });
  }

  playSequence() {
    let i = 0;
    const replay = setInterval(() => {
      if (i === this.state.cpuMoves.length) {
        clearInterval(replay);
        this.toggleTurn(); //Toggle user turn here bc sequence finished playing
        return;
      }
      let currentColor = this.state.cpuMoves[i];
      this.playColorFX(currentColor);
      i++;
    }, 500);
  }

  advanceRound() {
    new Promise((resolve, reject) => {
      this.toggleTurn();
      this.clearUserMoves();
      this.incrementRound();
      this.addColor();
      resolve();
    }).then(() => {
      this.playSequence();
    });
  }

  redoRound() {
    this.clearUserMoves();
    this.playSequence();
  }

  toggleTurn() {
    this.setState({
      userTurn: !this.state.userTurn,
    });
  }

  clearUserMoves() {
    this.setState({
      userMoves: [],
    });
  }

  incrementRound() {
    this.setState({
      round: this.state.round + 1,
    });
  }

  resetGame() {
    this.setState({
      cpuMoves: [],
      userMoves: [],
      activeColor: "",
      round: 1,
      gameStarted: false,
      userTurn: false,
    });
  }

  toggleStrict() {
    this.setState({
      strictMode: !this.state.strictMode,
    });
  }

  playColorFX(color) {
    console.log(color);
    this.animateColor(color);
    this.playSound(color);
  }
  animateColor(color) {
    new Promise((resolve, reject) => {
      this.activateColor(color);
      resolve();
    }).then(() => {
      setTimeout(() => {
        this.deactivateColor();
      }, 300);
    });
  }
  activateColor(color) {
    this.setState({
      activeColor: color,
    });
  }
  deactivateColor() {
    this.setState({
      activeColor: "",
    });
  }
  playSound(color) {
    this.state.sounds[color].play();
  }

  isCorrect() {
    const { userMoves, cpuMoves } = this.state;
    const currentMoveIndex = userMoves.length - 1;
    const userMove = userMoves[currentMoveIndex];
    const cpuMove = cpuMoves[currentMoveIndex];
    if (userMove === cpuMove) {
      return true;
    }

    return false;
  }
  isFinalMove() {
    if (this.state.userMoves.length === this.state.cpuMoves.length) {
      return true;
    }
    return false;
  }

  getRandomColor() {
    const randomColor = this.state.colors[Math.floor(Math.random() * 4)];
    return randomColor;
  }

  getCurrentRound() {
    if (this.state.round < 10) {
      return `0${this.state.round}`;
    }
    return this.state.round;
  }

  render() {
    const { gameStarted, activeColor, userTurn, strictMode } = this.state;
    return (
      <React.Fragment>
        <h1>Circles Memory Game</h1>
        <ButtonsContainer
          toggleStrict={this.toggleStrict}
          gameStarted={gameStarted}
          strictMode={strictMode}
          resetGame={this.resetGame}
          startGame={this.startGame}
          userTurn={userTurn}
        />
        <CirclesContainer
          verifyMove={this.verifyMove}
          activeColor={activeColor}
          userTurn={userTurn}
          round={this.getCurrentRound()}
          gameStarted={gameStarted}
          recordMove={this.recordMove}
        />
      </React.Fragment>
    );
  }
}

export default App;
