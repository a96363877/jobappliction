import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyCEK4irWtP1f6y_J1Gj3kNwsyLdItndt5Y",
  authDomain: "sdkk-22bbc.firebaseapp.com",
  projectId: "sdkk-22bbc",
  storageBucket: "sdkk-22bbc.firebasestorage.app",
  messagingSenderId: "1039314059862",
  appId: "1:1039314059862:web:e14e764f77ce86c817b1f7",
  measurementId: "G-K0L3MMPDR7"
}

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

export { app, auth, db, storage }
