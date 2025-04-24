import React, { useEffect, useState } from "react";
import "./App.css";
import Login from "./components/Login";
import VideoPlayers from "./components/VideoPlayers";
import Footer from "./components/Footer";
import { clearAuthData, getAuthData, setAuthData } from "./util/auth";
import '@fortawesome/fontawesome-free/css/all.min.css';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [theme, setTheme] = useState(() => {
        // Load theme from localStorage, default to "light" if not set
        return localStorage.getItem("theme") || "light";
    });

    // Check if the user is already authenticated on app load
    useEffect(() => {
        const authData = getAuthData();
        if (authData) {
            setIsLoggedIn(true);
        }
    }, []);

    // Persist theme to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("theme", theme);
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    const handleLogin = (user) => {
        setIsLoggedIn(true);
        setAuthData(user); // Store user data in localStorage
    };

    const handleLogout = () => {
        // Clear authentication data from localStorage
        clearAuthData();
        setIsLoggedIn(false);
    };

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    };

    return (
        <>
            <label className="label">
    <div className="toggle-wrapper">
        <input
            type="checkbox"
            className="toggle-state"
            checked={theme === "dark"}
            onChange={toggleTheme}
            aria-label="Toggle dark mode"
        />
        <div className="toggle">
            <div className="indicator"></div>
        </div>
    </div>
</label>
            <div className="container" data-theme={theme}>
                <div className="content">
                    {isLoggedIn ? (
                        <VideoPlayers onLogout={handleLogout} theme={theme} />
                    ) : (
                        <>
                            <Login onLogin={handleLogin} theme={theme} />
                        </>
                    )}
                </div>
                <Footer theme={theme} />
            </div>
        </>
    );
}

export default App;