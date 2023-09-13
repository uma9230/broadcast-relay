// App.js (or any other entry point)
import React from "react";
import "./App.css";
import Header from "./components/Header";
import Login from "./components/Login";
import VideoPlayers from "./components/VideoPlayers";
import Footer from "./components/Footer";
import {getAuth, signOut} from "firebase/auth";

import {initializeApp} from "firebase/app";
import {firebaseConfig} from "./firebase";

// Your web app's Firebase configuration


function App() {

    const app = initializeApp(firebaseConfig);
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);

    const handleLogin = () => {
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        const auth = getAuth();
        signOut(auth).then(() => {
            // Sign-out successful.
        }).catch((error) => {
            // An error happened.
        });
        setIsLoggedIn(false);
    };

    return (
        <div className="container">
            <Header/>
            {isLoggedIn ? (
                <VideoPlayers onLogout={handleLogout}/>
            ) : (
                <Login onLogin={handleLogin}/>
            )}
            <Footer/>
        </div>
    );
}

export default App;
