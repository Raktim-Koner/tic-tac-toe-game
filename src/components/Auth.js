import React, { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        onLogin(userCredential.user);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        onLogin(userCredential.user);
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <form onSubmit={handleAuth} className="bg-zinc-900 p-8 rounded-2xl border border-white/10 w-80 shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center italic">{isLogin ? 'LOGIN' : 'SIGN UP'}</h2>
        <input 
          type="email" placeholder="Email" className="w-full mb-4 p-2 rounded bg-black border border-zinc-700" 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
          type="password" placeholder="Password" className="w-full mb-6 p-2 rounded bg-black border border-zinc-700" 
          onChange={(e) => setPassword(e.target.value)} 
        />
        <button className="w-full bg-cyan-500 py-2 rounded font-bold hover:bg-cyan-400 transition-colors">
          {isLogin ? 'Enter Arena' : 'Join the Club'}
        </button>
        <p className="mt-4 text-xs text-center text-gray-500 cursor-pointer" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Don't have an account? Sign Up" : "Already a member? Login"}
        </p>
      </form>
    </div>
  );
};

export default Auth;