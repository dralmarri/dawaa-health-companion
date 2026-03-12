import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBNETEBmOttyE6CAeub5hbDQIhfMvU5Afg",
  authDomain: "dawaa-health.firebaseapp.com",
  projectId: "dawaa-health",
  storageBucket: "dawaa-health.firebasestorage.app",
  messagingSenderId: "772009161552",
  appId: "1:772009161552:web:b32390110287cd34123255",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
