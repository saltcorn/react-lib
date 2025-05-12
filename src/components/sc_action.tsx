import React from "react";
import { runAction } from "../api.js";

export default function ScAction({action}: any) {
  const handleClick = () => {
    runAction(action);
  };

  return (
    <div className="container mt-4">
      <h2>Action</h2>
      <button className="btn btn-primary" onClick={handleClick}>Run Action</button>
    </div>
  );
}