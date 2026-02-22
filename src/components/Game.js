import React, { useState, useEffect } from 'react';
import Board from './Board';

const Game = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winningLine, setWinningLine] = useState(null);

  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  const checkWinner = (sq) => {
    for (let i = 0; i < winningCombinations.length; i++) {
      const [a, b, c] = winningCombinations[i];
      if (sq[a] && sq[a] === sq[b] && sq[a] === sq[c]) {
        return { player: sq[a], lineIndex: i };
      }
    }
    return null;
  };

  const result = checkWinner(board);
  const winner = result?.player;
  const isDraw = !winner && board.every(x => x);

  useEffect(() => {
    if (isDraw) {
      const timer = setTimeout(() => resetGame(), 2000);
      return () => clearTimeout(timer);
    }
  }, [isDraw]);

  const handleClick = (i) => {
    if (board[i] || winner) return;
    const newBoard = [...board];
    newBoard[i] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    const newResult = checkWinner(newBoard);
    if (newResult) setWinningLine(newResult.lineIndex);
    setIsXNext(!isXNext);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setWinningLine(null);
    setIsXNext(true);
  };

  return (
    <div className="flex flex-col items-center">
      <div className={`mb-8 text-2xl font-mono font-bold uppercase tracking-widest ${isDraw ? 'text-rose-500 animate-pulse' : winner ? 'text-green-400' : 'text-gray-500'}`}>
        {winner ? `Winner: ${winner}` : isDraw ? "Draw! Resetting..." : `Player: ${isXNext ? 'X' : 'O'}`}
      </div>

      <Board squares={board} onSquareClick={handleClick} winningLineIndex={winningLine} />

      <button
        onClick={resetGame}
        className="mt-16 px-12 py-3 border-2 border-white/10 rounded-full hover:border-white/40 hover:scale-105 transition-all text-sm font-black tracking-[0.4em] text-gray-400 hover:text-white"
      >
        MANUAL RESET
      </button>
    </div>
  );
};

export default Game;