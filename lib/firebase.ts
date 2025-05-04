// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCR_HBolUKab92805Sj6Py5xcRMuZk0Ams",
  authDomain: "my-business-management-e899f.firebaseapp.com",
  projectId: "my-business-management-e899f",
  storageBucket: "my-business-management-e899f.appspot.com",
  messagingSenderId: "484449450524",
  appId: "1:484449450524:web:072cc573f397d52eaafdd9"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
