import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDNPG_-BWEUdzowKV3EqJSiRbIGjdsbeoE",
  authDomain: "learntocode-ca38e.firebaseapp.com",
  projectId: "learntocode-ca38e",
  storageBucket: "learntocode-ca38e.firebasestorage.app",
  messagingSenderId: "417377941927",
  appId: "1:417377941927:web:214879f83af44328f09e82",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db};