
// src/lib/firebase.ts
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// getAnalytics is not strictly needed for Firestore but often included in Firebase console snippets.
// import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC8wo5LOajHhcD9xDB-ufonuAO81lV5k58",
  authDomain: "fichero-medico-d84f3.firebaseapp.com",
  databaseURL: "https://fichero-medico-d84f3-default-rtdb.firebaseio.com",
  projectId: "fichero-medico-d84f3",
  storageBucket: "fichero-medico-d84f3.appspot.com", // Corrected common typo: .appspot.com instead of .firebasestorage.app for storageBucket when used with initializeApp
  messagingSenderId: "813223315244",
  appId: "1:813223315244:web:0cd536e471e640e892ce89",
  measurementId: "G-5GJWZXWJ66"
};

let app: FirebaseApp;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db = getFirestore(app);
// const analytics = getAnalytics(app); // You can uncomment this if you plan to use Firebase Analytics

export { db };
