import React from 'react';
import Square from './square';

const Board = ({ squares, onSquareClick, winningLineIndex }) => {
  const getLineClass = () => {
    const base = "absolute bg-white z-10 shadow-[0_0_20px_rgba(255,255,255,1)] transition-all duration-500 rounded-full ";
    switch (winningLineIndex) {
      case 0: return base + "h-1.5 w-[90%] top-[16%] left-[5%]";
      case 1: return base + "h-1.5 w-[90%] top-[49%] left-[5%]";
      case 2: return base + "h-1.5 w-[90%] top-[82%] left-[5%]";
      case 3: return base + "w-1.5 h-[90%] left-[16%] top-[5%]";
      case 4: return base + "w-1.5 h-[90%] left-[49%] top-[5%]";
      case 5: return base + "w-1.5 h-[90%] left-[82%] top-[5%]";
      case 6: return base + "h-1.5 w-[110%] top-[49%] left-[-5%] rotate-45";
      case 7: return base + "h-1.5 w-[110%] top-[49%] left-[-5%] -rotate-45";
      default: return "hidden";
    }
  };

  return (
    <div className="relative">
      <div className={getLineClass()}></div>
      <div className="grid grid-cols-3 gap-4 bg-zinc-800/50 p-4 rounded-3xl border border-white/10 backdrop-blur-sm shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        {squares.map((square, i) => (
          <Square key={i} value={square} onClick={() => onSquareClick(i)} />
        ))}
      </div>
    </div>
  );
};

export default Board;