import React from "react";
import "../scss/css/main.min.css";

//Color buttons that animate and are clicked on by user
const Circle = function (props) {
  return (
    <div
      id={props.id}
      className={props.className}
      onClick={props.onClick}
    ></div>
  );
};

//Displays the game round
const DisplayCircle = function (props) {
  return (
    <div id="middle-circle">
      <p id="counter">{props.gameStarted ? props.round : ""}</p>
    </div>
  );
};

const CirclesContainer = function (props) {
  function getCircleClass(circleColor) {
    let className = "color-circle";
    if (props.activeColor === circleColor) {
      className += " active-circle";
    }
    if (!props.userTurn) {
      className += " pointer-events-disabled";
    }
    return className;
  }

  function onCircleClick(color) {
    new Promise((resolve, reject) => {
      props.recordMove(color);
      resolve();
    }).then(() => props.verifyMove(color));
  }

  return (
    <div id="circles-wrapper">
      <Circle
        id="red-circle"
        //animate the button with active-circle class and disable its pointer-events until the user's turn
        //color-circle is default class
        className={getCircleClass("red")}
        onClick={() => onCircleClick("red")}
      />
      <Circle
        id="green-circle"
        className={getCircleClass("green")}
        onClick={() => onCircleClick("green")}
      />
      <Circle
        id="yellow-circle"
        className={getCircleClass("yellow")}
        onClick={() => onCircleClick("yellow")}
      />
      <Circle
        id="blue-circle"
        className={getCircleClass("blue")}
        onClick={() => onCircleClick("blue")}
      />
      <DisplayCircle gameStarted={props.gameStarted} round={props.round} />;
    </div>
  );
};

const Button = function (props) {
  return (
    <button onClick={props.onClick} className={props.className}>
      {props.text}
    </button>
  );
};

const ButtonsContainer = function (props) {
  function getStrictButtonClass() {
    let className = "";
    if (props.strictMode) {
      className += "strict-enabled";
    } else {
      className += "strict-disabled";
    }
    if (props.gameStarted) {
      className += " pointer-events-disabled";
    }
    return className;
  }

  return (
    <div id="buttons-wrapper">
      <Button
        text={props.gameStarted ? "reset" : "start"}
        onClick={props.gameStarted ? props.resetGame : props.startGame}
      />
      <Button
        text={"strict"}
        onClick={props.toggleStrict}
        className={getStrictButtonClass()}
      />
    </div>
  );
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      colors: ["red", "green", "yellow", "blue"],
      cpuMoves: [], //[]
      userMoves: [],
      //Used to animate the button on/off
      activeColor: "",
      round: 1, //1
      //Conditional for display counter, start/reset button, and strict button
      gameStarted: false, //false
      //Used to repeat previous sequence without new color when user is wrong
      wrongAnswer: false,
      //Used to disable clicking color buttons until user's turn
      userTurn: false, //false
      //Strict is off by default
      strictMode: false,
      //Stores the sound fx clips
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

  //Runs when user clicks a color; color argument is on click
  verifyMove(color) {
    //Wrong: stop input and repeat sequence
    if (!this.isCorrect()) {
      console.log("Wrong Move");
      if (this.state.strictMode) {
        this.resetGame();
        return;
      }
      this.toggleTurn();
      this.redoRound();
      return;
    }
    //Correct: check if final move
    if (this.isFinalMove()) {
      console.log("Last move");
      this.advanceRound();
    }
  }

  addColor() {
    const newColor = this.getRandomColor();
    this.setState({
      //Record the new color
      cpuMoves: [...this.state.cpuMoves, newColor],
    });
  }
  //rename bc it also toggles at end?
  playSequence() {
    let i = 0;
    const replay = setInterval(() => {
      if (i === this.state.cpuMoves.length) {
        // console.log("done");
        clearInterval(replay);
        //toggling here bc end of sequence
        this.toggleTurn();
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
    //Runs when: cpu finishes replaying/user finishes inputting
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
    //Restore state values to default
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
    const currentMoveIndex = this.state.userMoves.length - 1;
    const userMove = this.state.userMoves[currentMoveIndex];
    const cpuMove = this.state.cpuMoves[currentMoveIndex];
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
