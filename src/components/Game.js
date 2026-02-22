import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import Board from './Board';

const Game = ({ user }) => {
  const [mode, setMode] = useState(null); // 'local' or 'online'
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [roomCode, setRoomCode] = useState('');
  const [inOnlineGame, setInOnlineGame] = useState(false);
  const [playerSymbol, setPlayerSymbol] = useState('X'); 
  const [winningLine, setWinningLine] = useState(null);

  // --- Logic for Online Mode ---
  useEffect(() => {
    if (mode === 'online' && inOnlineGame && roomCode) {
      const unsub = onSnapshot(doc(db, "rooms", roomCode), (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setBoard(data.board);
          setIsXNext(data.turn === 'X');
          setWinningLine(data.winningLine);
        }
      });
      return () => unsub();
    }
  }, [mode, inOnlineGame, roomCode]);

  const handleOnlineClick = async (i) => {
    const turn = isXNext ? 'X' : 'O';
    if (board[i] || winningLine || turn !== playerSymbol) return;

    const newBoard = [...board];
    newBoard[i] = playerSymbol;
    const nextTurn = playerSymbol === 'X' ? 'O' : 'X';
    
    // Check for winner before updating Firebase
    const winnerData = checkWinner(newBoard);

    await updateDoc(doc(db, "rooms", roomCode), {
      board: newBoard,
      turn: nextTurn,
      winningLine: winnerData ? winnerData.lineIndex : null
    });
  };

  const createRoom = async () => {
    if (!roomCode) return alert("Enter a Room Code");
    setPlayerSymbol('X');
    setInOnlineGame(true);
    await setDoc(doc(db, "rooms", roomCode), {
      board: Array(9).fill(null),
      turn: 'X',
      winningLine: null,
      players: [user.uid]
    });
  };

  const joinRoom = () => {
    if (!roomCode) return alert("Enter a Room Code");
    setPlayerSymbol('O');
    setInOnlineGame(true);
  };

  // --- Logic for Local Mode ---
  const handleLocalClick = (i) => {
    if (board[i] || winningLine) return;
    const newBoard = [...board];
    newBoard[i] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    
    const winnerData = checkWinner(newBoard);
    if (winnerData) setWinningLine(winnerData.lineIndex);
    setIsXNext(!isXNext);
  };

  // --- Common Logic ---
  const checkWinner = (sq) => {
    const combos = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (let i = 0; i < combos.length; i++) {
      const [a, b, c] = combos[i];
      if (sq[a] && sq[a] === sq[b] && sq[a] === sq[c]) return { winner: sq[a], lineIndex: i };
    }
    return null;
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setWinningLine(null);
    setIsXNext(true);
  };

  // --- UI Screens ---

  // 1. Selection Menu
  if (!mode) {
    return (
      <div className="flex flex-col gap-6 mt-10 w-full max-w-xs">
        <button onClick={() => setMode('local')} className="bg-zinc-800 border border-white/10 p-6 rounded-2xl hover:bg-zinc-700 transition-all font-bold text-xl uppercase tracking-tighter">
          🏠 Local Play
        </button>
        <button onClick={() => setMode('online')} className="bg-cyan-600 p-6 rounded-2xl hover:bg-cyan-500 transition-all font-bold text-xl uppercase tracking-tighter shadow-[0_0_20px_rgba(8,145,178,0.3)]">
          🌐 Online Multi
        </button>
      </div>
    );
  }

  // 2. Online Room Join Screen
  if (mode === 'online' && !inOnlineGame) {
    return (
      <div className="flex flex-col gap-4 mt-10">
        <input 
          className="bg-zinc-900 border border-zinc-700 p-4 rounded-xl text-center text-xl tracking-widest uppercase"
          placeholder="CODE NAME" 
          value={roomCode} onChange={(e) => setRoomCode(e.target.value)} 
        />
        <div className="flex gap-4">
          <button onClick={createRoom} className="flex-1 bg-green-600 p-3 rounded-xl font-bold">CREATE</button>
          <button onClick={joinRoom} className="flex-1 bg-blue-600 p-3 rounded-xl font-bold">JOIN</button>
        </div>
        <button onClick={() => setMode(null)} className="text-gray-500 mt-4 underline text-sm">Go Back</button>
      </div>
    );
  }

  // 3. The Game Board
  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 text-sm font-mono text-gray-400 uppercase tracking-widest">
        Mode: {mode === 'online' ? `Online (Playing as ${playerSymbol})` : 'Local'}
      </div>
      
      <div className="mb-6 text-2xl font-black text-cyan-400 uppercase tracking-widest">
        {winningLine !== null ? "Game Over!" : `Turn: ${isXNext ? 'X' : 'O'}`}
      </div>

      <Board 
        squares={board} 
        onSquareClick={mode === 'online' ? handleOnlineClick : handleLocalClick} 
        winningLineIndex={winningLine} 
      />

      <div className="mt-10 flex gap-4">
        <button onClick={resetGame} className="px-6 py-2 border border-white/10 rounded-full text-xs hover:bg-white/10">RESET BOARD</button>
        <button onClick={() => { setMode(null); setInOnlineGame(false); resetGame(); }} className="px-6 py-2 border border-rose-500/30 text-rose-500 rounded-full text-xs hover:bg-rose-500/10">EXIT MODE</button>
      </div>
    </div>
  );
};

export default Game;