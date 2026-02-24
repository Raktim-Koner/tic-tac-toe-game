import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import Board from './Board';

const Game = ({ user }) => {
  const [mode, setMode] = useState(null); 
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [roomCode, setRoomCode] = useState('');
  const [inOnlineGame, setInOnlineGame] = useState(false);
  const [playerSymbol, setPlayerSymbol] = useState(null); 
  const [winningLine, setWinningLine] = useState(null);

  // --- 1. REAL-TIME SYNC ---
  useEffect(() => {
    let unsub;
    if (mode === 'online' && inOnlineGame && roomCode) {
      // We normalize the room code to lowercase to prevent typing errors
      const roomRef = doc(db, "rooms", roomCode.trim().toLowerCase());
      
      unsub = onSnapshot(roomRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setBoard(data.board);
          setIsXNext(data.turn === 'X');
          setWinningLine(data.winningLine);
        }
      });
    }
    return () => { if (unsub) unsub(); };
  }, [mode, inOnlineGame, roomCode]);

  // --- 2. THE JOIN LOGIC (FIXED) ---
  const joinRoom = async () => {
    if (!roomCode.trim()) return alert("Please enter a room code!");
    const normalizedCode = roomCode.trim().toLowerCase();
    
    try {
      const roomRef = doc(db, "rooms", normalizedCode);
      const roomSnap = await getDoc(roomRef);

      if (roomSnap.exists()) {
        setPlayerSymbol('O'); // Joiner is always O
        setInOnlineGame(true); // This triggers the useEffect listener
      } else {
        alert("Room ID not found. Make sure your friend has created it first!");
      }
    } catch (err) {
      console.error("Join Error:", err);
    }
  };

  const createRoom = async () => {
    if (!roomCode.trim()) return alert("Please enter a room code!");
    const normalizedCode = roomCode.trim().toLowerCase();
    
    setPlayerSymbol('X'); // Creator is always X
    
    const roomData = {
      board: Array(9).fill(null),
      turn: 'X',
      winningLine: null,
      creator: user.uid
    };

    try {
      await setDoc(doc(db, "rooms", normalizedCode), roomData);
      setInOnlineGame(true);
    } catch (err) {
      alert("Error creating room. Check your Firebase Rules!");
    }
  };

  // --- 3. THE MOVE LOGIC ---
  const handleSquareClick = async (i) => {
    if (board[i] || winningLine) return;

    if (mode === 'local') {
      const newBoard = [...board];
      newBoard[i] = isXNext ? 'X' : 'O';
      setBoard(newBoard);
      const winnerData = checkWinner(newBoard);
      if (winnerData) setWinningLine(winnerData.lineIndex);
      setIsXNext(!isXNext);
    } 
    else {
      // ONLINE MODE
      const currentTurn = isXNext ? 'X' : 'O';
      if (currentTurn !== playerSymbol) return; // Prevent clicking out of turn

      const newBoard = [...board];
      newBoard[i] = playerSymbol;
      const nextTurn = playerSymbol === 'X' ? 'O' : 'X';
      const winnerData = checkWinner(newBoard);

      const roomRef = doc(db, "rooms", roomCode.trim().toLowerCase());
      await updateDoc(roomRef, {
        board: newBoard,
        turn: nextTurn,
        winningLine: winnerData ? winnerData.lineIndex : null
      });
    }
  };

  const checkWinner = (sq) => {
    const combos = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (let i = 0; i < combos.length; i++) {
      const [a, b, c] = combos[i];
      if (sq[a] && sq[a] === sq[b] && sq[a] === sq[c]) return { winner: sq[a], lineIndex: i };
    }
    return null;
  };

  const resetGame = async () => {
    if (mode === 'local') {
      setBoard(Array(9).fill(null));
      setWinningLine(null);
      setIsXNext(true);
    } else {
      const roomRef = doc(db, "rooms", roomCode.trim().toLowerCase());
      await updateDoc(roomRef, {
        board: Array(9).fill(null),
        turn: 'X',
        winningLine: null
      });
    }
  };

  // --- RENDER ---
  if (!mode) {
    return (
      <div className="flex flex-col gap-6 mt-10 w-64">
        <button onClick={() => setMode('local')} className="bg-zinc-800 p-6 rounded-2xl hover:bg-zinc-700 font-bold border border-white/5">🏠 Local Play</button>
        <button onClick={() => setMode('online')} className="bg-cyan-600 p-6 rounded-2xl hover:bg-cyan-500 font-bold">🌐 Online Multi</button>
      </div>
    );
  }

  if (mode === 'online' && !inOnlineGame) {
    return (
      <div className="flex flex-col gap-4 mt-10 bg-zinc-900 p-8 rounded-3xl border border-white/10">
        <input 
          className="bg-black border border-zinc-700 p-4 rounded-xl text-center text-xl text-white uppercase"
          placeholder="ROOM ID" 
          value={roomCode} onChange={(e) => setRoomCode(e.target.value)} 
        />
        <div className="flex gap-4">
          <button onClick={createRoom} className="flex-1 bg-green-600 p-3 rounded-xl font-bold">CREATE</button>
          <button onClick={joinRoom} className="flex-1 bg-blue-600 p-3 rounded-xl font-bold">JOIN</button>
        </div>
        <button onClick={() => setMode(null)} className="text-gray-500 underline text-sm mt-2">Go Back</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 text-xs font-mono text-gray-500 uppercase tracking-widest">
        {mode === 'online' ? `ID: ${roomCode} | Symbol: ${playerSymbol}` : 'Local Play'}
      </div>
      
      <div className={`mb-8 text-2xl font-black uppercase ${winningLine !== null ? 'text-yellow-400' : 'text-cyan-400'}`}>
        {winningLine !== null ? "Victory!" : `${isXNext ? 'X' : 'O'}'s Turn`}
      </div>

      <Board squares={board} onSquareClick={handleSquareClick} winningLineIndex={winningLine} />

      <div className="mt-12 flex gap-6">
        <button onClick={resetGame} className="text-xs text-gray-400 hover:text-white underline">RESET</button>
        <button onClick={() => { setMode(null); setInOnlineGame(false); resetGame(); }} className="text-xs text-rose-500 hover:text-rose-400 underline">QUIT MODE</button>
      </div>
    </div>
  );
};

export default Game;