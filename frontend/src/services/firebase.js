import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBwBA7THL0xOYNqpVnm91RWhuK53bf08J4",
  authDomain: "eysinversiones-2071c.firebaseapp.com",
  projectId: "eysinversiones-2071c",
  storageBucket: "eysinversiones-2071c.firebasestorage.app",
  messagingSenderId: "768056000483",
  appId: "1:768056000483:web:1b1999eb276bc4402dead6",
  measurementId: "G-2KJC0870TD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);
export default app;