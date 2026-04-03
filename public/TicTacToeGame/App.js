import { useState, useEffect } from "react";
import Cell from './components/Cell';

const App = () => {
  const [cells, setCells] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [winningLine, setWinningLine] = useState([]);

  const checkWinner = () => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6] // Diagonals
    ];

    for (const line of lines) {
      const [a, b, c] = line;
      if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
        setWinner(cells[a]);
        setWinningLine(line);
        return;
      }
    }

    if (cells.every(cell => cell !== null)) {
      setWinner("draw");
    }
  };

  const handleClick = (index) => {
    if (winner || cells[index]) return;
    const newCells = [...cells];
    newCells[index] = isXNext ? "x" : "o";
    setCells(newCells);
    setIsXNext(!isXNext);
  };

  const resetGame = () => {
    setCells(Array(9).fill(null));
    setWinner(null);
    setWinningLine([]);
    setIsXNext(true);
  };

  useEffect(() => checkWinner(), [cells]);

  const status = winner
    ? winner === "draw"
      ? "Game Draw!"
      : `Player ${winner.toUpperCase()} Wins!`
    : `Next Player: ${isXNext ? "X" : "O"}`;

  return (
    <div className="game-container">
      <h1>Tic Tac Toe</h1>
      <div className="status">{status}</div>
      <div className="game-board">
        {cells.map((cell, index) => (
          <Cell
            key={index}
            id={index}
            value={cell}
            onClick={handleClick}
            isWinning={winningLine.includes(index)}
            isGameOver={!!winner}
          />
        ))}
      </div>
      <button className="reset-button" onClick={resetGame}>
        New Game
      </button>
    </div>
  );
};

export default App;
