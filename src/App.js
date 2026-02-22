import React, { useState } from 'react';
import Auth from './components/Auth';
import Game from './components/Game';

function App() {
  const [user, setUser] = useState(null);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {!user ? (
        <Auth onLogin={setUser} />
      ) : (
        <div className="flex flex-col items-center pt-20">
          <h1 className="text-4xl font-black mb-4 uppercase">Multiplayer TicTacToe</h1>
          <p className="text-gray-500 mb-8">Welcome, {user.email}</p>
          <Game user={user} />
          <button onClick={() => setUser(null)} className="mt-10 text-xs text-rose-500">Logout</button>
        </div>
      )}
    </div>
  );
}

export default App;