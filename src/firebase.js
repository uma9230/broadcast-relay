// Import the functions you need from the SDKs you need
import {initializeApp} from "firebase/app";
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCg56zUK65f1tFeZB5DV5EyDAhJVYtuKPI",
    authDomain: "bhyw-relay-stream.firebaseapp.com",
    projectId: "bhyw-relay-stream",
    storageBucket: "bhyw-relay-stream.appspot.com",
    messagingSenderId: "275080396693",
    appId: "1:275080396693:web:bc8c723ea35be39208c09c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export default app;