import {initializeApp} from "firebase/app";

export const firebaseConfig = {
    apiKey: "AIzaSyCg56zUK65f1tFeZB5DV5EyDAhJVYtuKPI",
    authDomain: "bhyw-relay-stream.firebaseapp.com",
    projectId: "bhyw-relay-stream",
    storageBucket: "bhyw-relay-stream.appspot.com",
    messagingSenderId: "275080396693",
    appId: "1:275080396693:web:bc8c723ea35be39208c09c"
};

export const app = initializeApp(firebaseConfig);