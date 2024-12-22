import React, {useEffect, useState} from "react";
import {onValue, ref, set} from "firebase/database";
import {doc, getDoc} from "firebase/firestore";
import "../App.css";
import {db, Realtimedb} from "../firebase";
import Header from "./Header";

function Login({onLogin}) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isAlreadyLoggedIn, setIsAlreadyLoggedIn] = useState(false);

    const [isLoginEnabled, setIsLoginEnabled] = useState(true);

    useEffect(() => {
        const loginStatRef = ref(Realtimedb, 'loginStatus');
            onValue(loginStatRef, (snapshot) => {
                const data = snapshot.val();
                setIsLoginEnabled(data);
            });
        
    }, []);

    useEffect(() => {
        const loggedInUsersRef = ref(Realtimedb, "loggedInUsers");
        onValue(loggedInUsersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const loggedInUsers = Object.keys(data);
                if (loggedInUsers.includes(username)) {
                    if (data[username].login_status) {
                        if(username === "admin") {
                            setIsAlreadyLoggedIn(false);
                        } else {
                            setIsAlreadyLoggedIn(true);
                        }
                    }
                    else {
                        setIsAlreadyLoggedIn(false);
                    }
                }
            }
        });
    }, [username]);

    const updateLoginStatus = (username, isLoggedIn, user) => {
        set(ref(Realtimedb, `loggedInUsers/${username}/login_status`), isLoggedIn)
        set(ref(Realtimedb, `loggedInUsers/${username}/login_time`), new Date().toLocaleString())
        set(ref(Realtimedb, `loggedInUsers/${username}/name`), user.name)
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!username || !password) {
            const loginError = document.getElementById("login-error");
            loginError.innerHTML = "Please enter a username and password.";
            return;
        }

        const loginError = document.getElementById("login-error");
        loginError.innerHTML = "Logging in...";

        if (isAlreadyLoggedIn) {
            loginError.innerHTML = "Only 1 login allowed per user.";
        } else {
            const docRef = doc(db, "users", username);
            getDoc(docRef)
                .then((docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        if (data.password === password) {
                            onLogin(username);
                            updateLoginStatus(username, true, data);
                        } else {
                            loginError.innerHTML = "Invalid password.";
                        }
                    } else {
                        loginError.innerHTML = "No such user exists.";
                    }
                })
                .catch((error) => {
                    console.error("Error getting document:", error);
                });
        }
    };

    return (
        <div className="login-container">
            <Header/>
            <div className="login-form">
                <h1>Login</h1>
                <form onSubmit={handleSubmit}>
                    {isLoginEnabled ? (
                        <>
                            <input
                                className={"inputs"}
                                type="text"
                                placeholder="username"
                                maxLength={8}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <input
                                className={"inputs"}
                                type="password"
                                placeholder="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button className={"login-btn"} type="submit">Login</button>
                        </>
                    ) : (
                        <>
                            <p>Login is currently disabled.</p>
                            <hr></hr>
                            <p>Login will start 30 mins before the broadcast.</p>
                        </>
                    )}
                </form>
                <p id="login-error" className="error-message"></p>
            </div>
        </div>
    );
}
export default Login;
