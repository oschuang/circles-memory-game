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
        //pass the respective color as argument to onClick; used arrow syntax to prevent auto-running
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
        onClick={props.gameStarted ? props.resetGame : props.addColor}
      />
      <Button
        text={"strict"}
        onClick={props.toggleStrict}
        className={getStrictButtonClass()}
      />
    </div>
  );
};

//Declared timeout/intervals outside to make global so resetGame() can access them
var intervalRepeatSequence;
var resetColor;

//Maintains the logic of the game
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      colors: ["red", "green", "yellow", "blue"],
      cpuMoves: ["red", "green", "blue"], //[]
      userMoves: [],
      //Used to animate the button on/off
      activeColor: "",
      round: 3, //1
      //Conditional for display counter, start/reset button, and strict button
      gameStarted: true, //false
      //Used to repeat previous sequence without new color when user is wrong
      wrongAnswer: false,
      //Used to disable clicking color buttons until user's turn
      userTurn: true, //false
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
    this.addColor = this.addColor.bind(this);
    this.makeMove = this.makeMove.bind(this);
    this.verifyMoves = this.verifyMoves.bind(this);
    this.repeatSequence = this.repeatSequence.bind(this);
    this.resetGame = this.resetGame.bind(this);
    this.toggleStrictMode = this.toggleStrictMode.bind(this);

    this.getRandomColor = this.getRandomColor.bind(this);
    this.incrementRound = this.incrementRound.bind(this);
    this.animateColor = this.animateColor.bind(this);
    this.clearColor = this.clearColor.bind(this);
    this.toggleTurn = this.toggleTurn.bind(this);
    this.playColor = this.playColor.bind(this);
    this.clearUserMoves = this.clearUserMoves.bind(this);

    this.pushColor = this.pushColor.bind(this);
    this.repeatCpuMoves = this.repeatCpuMoves.bind(this);
  }

  //Runs when user clicks start, and when CPU adds a new color to a sequence
  addColor() {
    let newColor = this.getRandomColor();
    this.setState({
      //Record the new color
      cpuMoves: [...this.state.cpuMoves, newColor],
      //Changes start to reset and disables strict button once game begins
      gameStarted: true,
      strictRestart: false, //???
    });

    new Promise((resolve, reject) => {
      this.animateColor(newColor);
      this.playSound(newColor);
      resolve();
    }).then(() => {
      setTimeout(() => {
        this.clearColor();
        this.toggleTurn();
      }, 500);
    });
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

  repeatCpuMoves() {
    let i = 0;
    const repeatSequence = setInterval(() => {
      console.log(i);
      if (i === this.state.cpuMoves.length) {
        console.log("done");
        clearInterval(repeatSequence);
        this.toggleTurn();
      } else {
        let currentColor = this.state.cpuMoves[i];
        this.playColor(currentColor);
      }
      i++;
    }, 500);
  }

  checkIfUserTurnIsOver() {
    if (this.state.userMoves.length === this.state.cpuMoves.length) {
      return true;
    }
    return false;
  }

  //Runs when user clicks a color; color argument is on click
  makeMove(color) {
    //Prevent overlapping sounds if user clicks quickly
    this.state.sounds[color].pause();
    this.state.sounds[color].currentTime = 0;

    //Record the user's move and animate the clicked button
    this.setState({
      userMoves: [...this.state.userMoves, color],
    });

    this.playColor(color);

    //Runs after each user click to check if user's turn is over (when length of userMoves = length of cpuMoves)
    //Why is this a timeout??? Because have to wait for the new color to be added in order to check --> change to Promise later
    let checkIfUserTurnIsOver = setTimeout(() => {
      //check if current move is correct or not to determien whether to stop user (ie. stop input on first error when not strict mode)
      let currentIndex = this.state.userMoves.length - 1;
      console.log(currentIndex);
      let currentMove = this.state.userMoves[currentIndex];
      let correctMove = this.state.cpuMoves[currentIndex];
      if (
        currentMove !== correctMove
        // && !this.state.strictMode
      ) {
        console.log("Wrong Move");
        this.toggleTurn();
        this.clearUserMoves();
        this.repeatCpuMoves();
        return; //return so on last turn it doesnt go to next conditional since wrong answer
      }

      if (this.state.userMoves.length === this.state.cpuMoves.length) {
        console.log("Last move");

        new Promise((resolve, reject) => {
          this.clearUserMoves();
          this.incrementRound();
          this.pushColor();
          resolve();
        })
          .then(() => this.repeatCpuMoves())
          .then(() => {
            console.log("ready");
            this.toggleTurn();
          });
      }

      //Used !strictRestart to prevent from running when the user is wrong in strict mode (since game must restart from 0)
      // if (
      //   this.state.userMoves.length === this.state.cpuMoves.length
      //   // && !this.state.strictRestart
      // ) {
      //   this.verifyMoves();
      //   //disable buttons when user finishes turn
      //   this.setState({
      //     userTurn: false,
      //   });
      // }
    }, 100);

    //Checks if user's move is correct after each click when strict mode is on (non-strict only checks at end of turn)
    if (this.state.strictMode) {
      //This timeout needs to run faster than checkIfUserTurnIsOver to give it priority
      let strictTimeout = setTimeout(() => {
        let index = this.state.userMoves.length - 1;
        //If the user's current move is incorrect
        if (this.state.userMoves[index] !== this.state.cpuMoves[index]) {
          //Disable buttons and indicate game is restarting
          this.setState({
            userTurn: false,
            strictRestart: true,
          });
          //Clear to prevent it from allowing user input; resetGame() resets color anyway
          clearTimeout(resetColor);
          //Reset game to 0 and default values
          this.resetGame();
          //Start a new game
          //Needed to use timeout to have delay between restarting and starting new game
          let timeoutNewSequence = setTimeout(() => {
            this.addColor();
          }, 500);
        }
      }, 75);
    }
  }

  //Runs when user's turn is over
  verifyMoves() {
    //Checks for exact match between userMoves and cpuMoves, used join bc values are in arrays
    if (this.state.userMoves.join() === this.state.cpuMoves.join()) {
      this.repeatSequence();
      //Update the round counter to show advancing to next round
      this.setState({
        round: this.state.round + 1,
        //Ensure wrongAnswer is set to false so repeatSequence() will run createNewSequence(runs addColor to add a new color)
        wrongAnswer: false,
      });
    }
    //If user is incorrect while not strict mode bc in strict mode, an incorrect answer does not run verifyMoves
    else if (this.state.strictMode === false) {
      //Empty userMoves so user can re-input
      this.setState({
        userMoves: [],
        //This ensures repeatSequence() won't run createNewSequence bc should not add a new color if user is wrong
        wrongAnswer: true,
      });
      //Replay the previous sequence so user can re-try
      this.repeatSequence();
    }
  }

  //If verifyMoves determined user was right, this repeats the sequence with a new color
  //If user was wrong, this repeats the sequence as is then allows user to try again
  repeatSequence() {
    // Empty userMoves for new turn
    this.setState({
      userMoves: [],
    });
    //Used to access each color inside cpuMoves; start at -1 so first time = 0 bc increments by 1 each time
    var index = -1;
    //This iterates through each color in cpuMoves per second
    intervalRepeatSequence = setInterval(() => {
      //Increment index by 1 each time in order to loop through the whole array
      index++;
      this.setState({
        //Turn off the current color
        activeColor: "",
      });
      //When sequence is on-going
      if (index <= this.state.cpuMoves.length - 1) {
        //Get the next color to repeat
        let currentColor = this.state.cpuMoves[index];
        //Animate the next color, used timeout bc need delay after clearing the previous color (in case same color)
        let timeout = setTimeout(() => {
          this.setState({
            activeColor: currentColor,
          });
          this.state.sounds[currentColor].play();
        }, 500);
      }
      //When sequence has finished (reached the final index in cpuMoves)
      else {
        //Stop the interval from running again
        clearInterval(intervalRepeatSequence);
        //If user was correct, run addColor (add a new color to the sequence)
        if (this.state.wrongAnswer === false) {
          let createNewSequence = setTimeout(() => {
            this.addColor();
          }, 500);
        }
        //If the user was wrong, enable the buttons so user can try again (only occurs if not in strict mode)
        if (this.state.wrongAnswer) {
          this.setState({
            userTurn: true,
          });
        }
      }
    }, 1000);
  }

  //Only enabled after game begins, will stop game and reset all values
  resetGame() {
    //Turn off any running intervals/timeouts
    let stopGame = clearInterval(intervalRepeatSequence);
    let stopGame2 = clearTimeout(resetColor);
    //Restore state values to default
    this.setState({
      cpuMoves: [],
      userMoves: [],
      activeColor: "",
      round: 0,
      gameStarted: false,
      wrongAnswer: false,
      userTurn: false,
    });
  }

  //Runs when strict buttons is clicked while game isn't running
  toggleStrictMode() {
    const { gameStarted, strictMode } = this.state;
    //User can only toggle if game has not begun
    if (gameStarted === false) {
      if (strictMode === false) {
        this.setState({
          strictMode: true,
        });
      }
      if (strictMode) {
        this.setState({
          strictMode: false,
        });
      }
    }
  }

  getRound() {
    if (this.state.strictRestart) {
      return "oops";
    }
    if (this.state.round <= 0) {
      return "";
    }
    if (this.state.round < 10) {
      return "0" + this.state.round;
    } else return this.state.round;
  }

  render() {
    const { gameStarted, activeColor, userTurn, strictMode } = this.state;
    return (
      <React.Fragment>
        <h1>Circles Memory Game</h1>
        <ButtonsContainer
          toggleStrict={this.toggleStrictMode}
          gameStarted={gameStarted}
          strictMode={strictMode}
          resetGame={this.resetGame}
          addColor={this.addColor}
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
