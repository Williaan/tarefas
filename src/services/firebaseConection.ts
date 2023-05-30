import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyA-hxlJR9aPJ953vLXPy8CBgNF86d5coRM",
    authDomain: "tarefasplus-35440.firebaseapp.com",
    projectId: "tarefasplus-35440",
    storageBucket: "tarefasplus-35440.appspot.com",
    messagingSenderId: "363419380989",
    appId: "1:363419380989:web:3a82f238519341d773a294"
};

const firebaseApp = initializeApp(firebaseConfig);

const db = getFirestore(firebaseApp);

export { db };