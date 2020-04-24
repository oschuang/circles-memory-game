import React from "react";

const DisplayCircle = function (props) {
  return (
    <div id="middle-circle">
      <p id="round-display">{props.gameStarted ? props.round : ""}</p>
    </div>
  );
};

export default DisplayCircle;
