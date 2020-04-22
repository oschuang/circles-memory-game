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

  return (
    <div id="circles-wrapper">
      <Circle
        id="red-circle"
        //animate the button with active-circle class and disable its pointer-events until the user's turn
        //color-circle is default class
        className={getCircleClass("red")}
        onClick={() => {
          props.makeMove("red");
        }}
      />
      <Circle
        id="green-circle"
        className={getCircleClass("green")}
        onClick={() => {
          props.makeMove("green");
        }}
      />
      <Circle
        id="yellow-circle"
        className={getCircleClass("yellow")}
        onClick={() => {
          props.makeMove("yellow");
        }}
      />
      <Circle
        id="blue-circle"
        className={getCircleClass("blue")}
        onClick={() => {
          props.makeMove("blue");
        }}
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
      //Indicates restarting in strict mode after incorrect input
      strictRestart: false,
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
    this.makeMove = this.makeMove.bind(this);
    this.resetGame = this.resetGame.bind(this);
    this.toggleStrict = this.toggleStrict.bind(this);

    this.getRandomColor = this.getRandomColor.bind(this);
    this.incrementRound = this.incrementRound.bind(this);
    this.animateColor = this.animateColor.bind(this);
    this.clearColor = this.clearColor.bind(this);
    this.toggleTurn = this.toggleTurn.bind(this);
    this.playColor = this.playColor.bind(this);
    this.clearUserMoves = this.clearUserMoves.bind(this);

    this.pushColor = this.pushColor.bind(this);
    this.repeatCpuMoves = this.repeatCpuMoves.bind(this);

    this.finalMove = this.finalMove.bind(this);
    this.verifyMove = this.verifyMove.bind(this);

    this.startGame = this.startGame.bind(this);

    this.repeatTurn = this.repeatTurn.bind(this);
    this.nextTurn = this.nextTurn.bind(this);

    this.clickCircle = this.clickCircle.bind(this);
  }

  //clean up later
  startGame() {
    this.pushColor();
    this.setState({
      gameStarted: true,
      // strictRestart: false, //???
    });
    this.repeatCpuMoves();
  }

  pushColor() {
    let newColor = this.getRandomColor();
    this.setState({
      //Record the new color
      cpuMoves: [...this.state.cpuMoves, newColor],
    });
  }

  playColor(color) {
    console.log(color);

    new Promise((resolve, reject) => {
      this.animateColor(color);
      this.playSound(color);
      resolve();
    }).then(() => {
      setTimeout(() => {
        this.clearColor();
      }, 300);
    });
  }

  toggleTurn() {
    console.log("toggle turn");
    this.setState({
      userTurn: !this.state.userTurn,
    });
  }

  animateColor(color) {
    this.setState({
      activeColor: color,
    });
  }
  //maybe combine animateColor and clearColor using promise?
  clearColor() {
    this.setState({
      activeColor: "",
    });
  }

  playSound(color) {
    this.state.sounds[color].play();
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

  getRandomColor() {
    let randomColor = this.state.colors[Math.floor(Math.random() * 4)];
    return randomColor;
  }

  //rename bc it also toggles at end?
  repeatCpuMoves() {
    let i = 0;
    const repeatSequence = setInterval(() => {
      console.log(i);
      if (i === this.state.cpuMoves.length) {
        console.log("done");
        clearInterval(repeatSequence);
        //toggling here bc end of sequence
        this.toggleTurn();
      } else {
        let currentColor = this.state.cpuMoves[i];
        this.playColor(currentColor);
      }
      i++;
    }, 500);
  }

  finalMove() {
    if (this.state.userMoves.length === this.state.cpuMoves.length) {
      return true;
    }
    return false;
  }

  verifyMove() {
    let currentIndex = this.state.userMoves.length - 1;
    console.log(currentIndex);
    let currentMove = this.state.userMoves[currentIndex];
    let correctMove = this.state.cpuMoves[currentIndex];
    console.log(
      "you pressed " + currentMove + ", correct answer was " + correctMove
    );
    if (currentMove === correctMove) {
      return true;
    }
    return false;
  }

  repeatTurn() {
    this.toggleTurn();
    this.clearUserMoves();
    this.repeatCpuMoves();
  }

  nextTurn() {
    new Promise((resolve, reject) => {
      this.toggleTurn();
      this.clearUserMoves();
      this.incrementRound();
      this.pushColor();
      resolve();
    }).then(() => {
      this.repeatCpuMoves();
    });
  }

  clickCircle(color) {
    this.setState({
      userMoves: [...this.state.userMoves, color],
    });
    this.playColor(color);
  }

  //Runs when user clicks a color; color argument is on click
  makeMove(color) {
    //Prevent overlapping sounds if user clicks quickly
    this.state.sounds[color].pause();
    this.state.sounds[color].currentTime = 0;

    //Record the user's move and animate the clicked button
    new Promise((resolve, reject) => {
      this.clickCircle(color);
      resolve();
    }).then(() => {
      //if wrong, stop input and repeat sequence
      if (!this.verifyMove())
        if (this.state.strictMode) {
          // this.setState({
          //   round: "game over",
          // });
          this.resetGame();
          return;
        } else {
          console.log("Wrong Move");
          this.repeatTurn();
        }
      //if correct, check if last move
      else {
        if (this.finalMove()) {
          console.log("Last move");
          this.nextTurn();
        }
      }
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

  //Runs when strict buttons is clicked while game isn't running
  toggleStrict() {
    this.setState({
      strictMode: !this.state.strictMode,
    });
  }

  getRound() {
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
          makeMove={this.makeMove}
          activeColor={activeColor}
          userTurn={userTurn}
          round={this.getRound()}
          gameStarted={gameStarted}
        />
      </React.Fragment>
    );
  }
}

export default App;
