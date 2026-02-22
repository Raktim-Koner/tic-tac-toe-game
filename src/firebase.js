import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAb5li8MIJa0YE9svI9WsDFN9MVn9akhmw",
  authDomain: "tic-tac-toe-61fad.firebaseapp.com",
  projectId: "tic-tac-toe-61fad",
  storageBucket: "tic-tac-toe-61fad.firebasestorage.app",
  messagingSenderId: "431348190253",
  appId: "1:431348190253:web:3da20744a1b4cdad5afca4",
  measurementId: "G-0E563P9CBL"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);