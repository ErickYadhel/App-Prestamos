import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBwBA7THL0xOYNqpVnm91RWhuK53bf08J4",
  authDomain: "eysinversiones-2071c.firebaseapp.com",
  projectId: "eysinversiones-2071c",
  storageBucket: "eysinversiones-2071c.firebasestorage.app",
  messagingSenderId: "768056000483",
  appId: "1:768056000483:web:1b1999eb276bc4402dead6",
  measurementId: "G-2KJC0870TD"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };