import { useEffect } from "react";

const Cell = ({ id, value, onClick, isWinning, isGameOver }) => {
  const handleClick = () => {
    if (!isGameOver && !value) onClick(id);
  };

  return (
    <button
      className={`cell ${isWinning ? "winning" : ""} ${
        !value && !isGameOver ? "hover-effect" : ""
      }`}
      onClick={handleClick}
      disabled={isGameOver || !!value}
      aria-label={`Cell ${id + 1} ${value ? ` occupied by ${value}` : ""}`}
    >
      {value && <div className={`symbol ${value}`} />}
    </button>
  );
};

export default Cell;