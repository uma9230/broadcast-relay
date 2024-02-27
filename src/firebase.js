import {initializeApp} from "firebase/app";
import {getFirestore} from "firebase/firestore";
import {getDatabase} from "firebase/database";

export const firebaseConfig = {
    apiKey: "AIzaSyCg56zUK65f1tFeZB5DV5EyDAhJVYtuKPI",
    authDomain: "bhyw-relay-stream.firebaseapp.com",
    projectId: "bhyw-relay-stream",
    storageBucket: "bhyw-relay-stream.appspot.com",
    messagingSenderId: "275080396693",
    appId: "1:275080396693:web:bc8c723ea35be39208c09c"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const Realtimedb = getDatabase(app);