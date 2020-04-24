import React from "react";

const Circle = function (props) {
  return (
    <div
      id={props.id}
      className={props.className}
      onClick={props.onClick}
    ></div>
  );
};

export default Circle;
