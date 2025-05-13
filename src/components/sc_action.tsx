import React from "react";
import { runAction } from "../api.js";

export default function ScAction({
  action,
  row,
}: {
  action: string;
  row: any;
}) {
  const handleClick = () => {
    runAction(action, row);
  };

  return (
    <button className="btn btn-primary" onClick={handleClick}>
      Run Action
    </button>
  );
}
