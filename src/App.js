import React, {useEffect, useState} from "react";
import "./App.css";
import Header from "./components/Header";
import Login from "./components/Login";
import VideoPlayers from "./components/VideoPlayers";
import Footer from "./components/Footer";
import {clearAuthData, getAuthData, setAuthData} from "./util/auth";
import UserManagement from "./components/UserManagement"; // Import the helper functions

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Check if the user is already authenticated on app load
    useEffect(() => {
        const authUser = getAuthData();

        if (authUser) {
            setIsLoggedIn(true);
        }
    }, []);

    const handleLogin = (user) => {
        setIsLoggedIn(true);
        setAuthData(user); // Store user data in localStorage
    };

    const handleLogout = () => {
        // Clear authentication data from localStorage
        clearAuthData();
        setIsLoggedIn(false);
    };

    return (
        <div className="container">
            <Header/>
            <div className="content">
                {isLoggedIn ? (
                    <VideoPlayers onLogout={handleLogout}/>
                ) : (
                    <>
                        <Login onLogin={handleLogin}/>
                    </>
                )}
            </div>
            <Footer/>
        </div>
    );
}

export default App;
