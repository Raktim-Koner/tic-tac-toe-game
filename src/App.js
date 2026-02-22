import React from 'react';
import Game from './components/Game';

function App() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white p-6">
      <h1 className="text-6xl font-black mb-12 tracking-tighter italic">
        TIC.<span className="text-cyan-400">TAC</span>.TOE
      </h1>
      <Game />
    </div>
  );
}

export default App;