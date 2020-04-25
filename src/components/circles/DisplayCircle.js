import React from "react";

const DisplayCircle = function (props) {
  function getClassName() {
    let className = "middle-circle middle-border";
    if (props.round.toUpperCase() === "GAME OVER") {
      return className.replace(" middle-border", "");
    }
    return className;
  }
  return (
    <div className={getClassName()}>
      <p id="round-text">{props.gameStarted ? props.round : ""}</p>
    </div>
  );
};

export default DisplayCircle;
