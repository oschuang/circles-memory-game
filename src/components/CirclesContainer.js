import React from "react";
import Circle from "./circles/Circle";
import DisplayCircle from "./circles/DisplayCircle";

const CirclesContainer = function (props) {
  function getCircleClass(circleColor) {
    let className = "color-circle";
    if (props.activeColor === circleColor) {
      className += " active-circle"; //this class animates the button "on"
    }
    if (!props.userTurn) {
      className += " disabled";
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
      <DisplayCircle gameStarted={props.gameStarted} round={props.round} />
    </div>
  );
};

export default CirclesContainer;
