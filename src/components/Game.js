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
  const [playerSymbol, setPlayerSymbol] = useState(null); // Set when joining/creating
  const [winningLine, setWinningLine] = useState(null);

  // --- 1. REAL-TIME SYNC LOGIC ---
  useEffect(() => {
    let unsub;
    if (mode === 'online' && inOnlineGame && roomCode) {
      // Create a listener for the room document in Firestore
      unsub = onSnapshot(doc(db, "rooms", roomCode.toLowerCase()), (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          // Update all local states with data from the cloud
          setBoard(data.board);
          setIsXNext(data.turn === 'X');
          setWinningLine(data.winningLine);
        }
      }, (error) => {
        console.error("Firebase Sync Error:", error);
      });
    }
    return () => { if (unsub) unsub(); }; // Cleanup on exit
  }, [mode, inOnlineGame, roomCode]);

  // --- 2. CLICK LOGIC (LOCAL VS ONLINE) ---
  const handleSquareClick = async (i) => {
    // Basic checks: is square full or is game over?
    if (board[i] || winningLine) return;

    if (mode === 'local') {
      const newBoard = [...board];
      newBoard[i] = isXNext ? 'X' : 'O';
      setBoard(newBoard);
      
      const winnerData = checkWinner(newBoard);
      if (winnerData) setWinningLine(winnerData.lineIndex);
      setIsXNext(!isXNext);
    } 
    else if (mode === 'online') {
      const currentTurn = isXNext ? 'X' : 'O';
      
      // ONLY allow click if it is this player's turn
      if (currentTurn !== playerSymbol) {
        console.log("It's not your turn!");
        return;
      }

      const newBoard = [...board];
      newBoard[i] = playerSymbol;
      const nextTurn = playerSymbol === 'X' ? 'O' : 'X';
      const winnerData = checkWinner(newBoard);

      try {
        const roomRef = doc(db, "rooms", roomCode.toLowerCase());
        await updateDoc(roomRef, {
          board: newBoard,
          turn: nextTurn,
          winningLine: winnerData ? winnerData.lineIndex : null
        });
      } catch (error) {
        alert("Sync failed. Check your internet or Firebase rules.");
      }
    }
  };

  // --- 3. ROOM MANAGEMENT ---
  const createRoom = async () => {
    if (!roomCode) return alert("Enter a code");
    const code = roomCode.toLowerCase();
    setPlayerSymbol('X');
    setInOnlineGame(true);
    
    await setDoc(doc(db, "rooms", code), {
      board: Array(9).fill(null),
      turn: 'X',
      winningLine: null,
      players: [user.uid]
    });
  };

  const joinRoom = async () => {
    if (!roomCode) return alert("Enter a code");
    const code = roomCode.toLowerCase();
    const roomRef = doc(db, "rooms", code);
    const roomSnap = await getDoc(roomRef);

    if (roomSnap.exists()) {
      setPlayerSymbol('O');
      setInOnlineGame(true);
    } else {
      alert("Room not found!");
    }
  };

  // --- 4. UTILS ---
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
      const roomRef = doc(db, "rooms", roomCode.toLowerCase());
      await updateDoc(roomRef, {
        board: Array(9).fill(null),
        turn: 'X',
        winningLine: null
      });
    }
  };

  // --- 5. RENDER SCREENS ---
  if (!mode) {
    return (
      <div className="flex flex-col gap-6 mt-10 w-64">
        <button onClick={() => setMode('local')} className="bg-zinc-800 p-6 rounded-2xl hover:bg-zinc-700 font-bold border border-white/5">🏠 Local Play</button>
        <button onClick={() => setMode('online')} className="bg-cyan-600 p-6 rounded-2xl hover:bg-cyan-500 font-bold shadow-lg">🌐 Online Multi</button>
      </div>
    );
  }

  if (mode === 'online' && !inOnlineGame) {
    return (
      <div className="flex flex-col gap-4 mt-10 bg-zinc-900 p-8 rounded-3xl border border-white/10">
        <input 
          className="bg-black border border-zinc-700 p-4 rounded-xl text-center text-xl uppercase tracking-widest text-white"
          placeholder="ROOM CODE" 
          value={roomCode} onChange={(e) => setRoomCode(e.target.value)} 
        />
        <div className="flex gap-4">
          <button onClick={createRoom} className="flex-1 bg-green-600 p-3 rounded-xl font-bold">CREATE</button>
          <button onClick={joinRoom} className="flex-1 bg-blue-600 p-3 rounded-xl font-bold">JOIN</button>
        </div>
        <button onClick={() => setMode(null)} className="text-gray-500 underline text-sm">Cancel</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 text-xs font-mono text-gray-500 uppercase tracking-widest">
        {mode === 'online' ? `Online Room: ${roomCode} | You are: ${playerSymbol}` : 'Local Mode'}
      </div>
      
      <div className={`mb-8 text-2xl font-black uppercase tracking-[0.2em] ${winningLine !== null ? 'text-yellow-400 animate-bounce' : 'text-cyan-400'}`}>
        {winningLine !== null ? "Victory!" : isXNext ? "X's Turn" : "O's Turn"}
      </div>

      <Board 
        squares={board} 
        onSquareClick={handleSquareClick} 
        winningLineIndex={winningLine} 
      />

      <div className="mt-12 flex gap-6">
        <button onClick={resetGame} className="text-xs text-gray-400 hover:text-white underline uppercase">Reset Game</button>
        <button onClick={() => { setMode(null); setInOnlineGame(false); resetGame(); }} className="text-xs text-rose-500 hover:text-rose-400 underline uppercase">Quit</button>
      </div>
    </div>
  );
};

export default Game;