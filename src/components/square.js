import React from 'react';

const Square = ({ value, onClick }) => (
  <button
    onClick={onClick}
    className="w-24 h-24 bg-black rounded-2xl text-5xl font-bold flex items-center justify-center hover:bg-zinc-900 transition-all border border-white/5 active:scale-95"
  >
    <span className={value === 'X' ? 'text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'text-fuchsia-500 drop-shadow-[0_0_10px_rgba(217,70,239,0.5)]'}>
      {value}
    </span>
  </button>
);

export default Square;