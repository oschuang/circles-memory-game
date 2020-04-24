import React from "react";
import Button from "./button/Button";

const ButtonsContainer = function (props) {
  function getStrictButtonClass() {
    let className = "";
    if (props.strictMode) {
      className += "strict-on";
    }
    if (props.gameStarted) {
      className += " strict-disabled";
    }
    return className;
  }

  return (
    <div id="buttons-wrapper">
      <Button
        text={props.gameStarted ? "RESET" : "START"}
        onClick={props.gameStarted ? props.resetGame : props.startGame}
        className={props.gameStarted && !props.userTurn ? "disabled" : ""}
      />
      <Button
        text={"STRICT"}
        onClick={props.toggleStrict}
        className={getStrictButtonClass()}
      />
    </div>
  );
};

export default ButtonsContainer;
