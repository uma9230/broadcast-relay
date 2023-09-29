import React, {useEffect, useState} from "react";
import {getAuth, signInWithEmailAndPassword} from "firebase/auth";
import {getDatabase, onValue, ref, set} from "firebase/database";
import "../App.css";

function Login({onLogin}) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isAlreadyLoggedIn, setIsAlreadyLoggedIn] = useState(false);
    const db = getDatabase();

    useEffect(() => {
        // Check if the user is already logged in using the database
        const loggedInUsersRef = ref(db, "loggedInUsers/");
        onValue(loggedInUsersRef, (snapshot) => {
            const data = snapshot.val();
            if (data && data[username]) {
                setIsAlreadyLoggedIn(true);
            } else {
                setIsAlreadyLoggedIn(false);
            }
        });
    }, [db, username]);

    const updateLoginStatus = (email, isLoggedIn) => {
        // Use the username (without the "@miqaat.bhy" part) as a key to update their login status
        const username = email.replace("@miqaat.bhy", "");
        set(ref(db, `loggedInUsers/${username}`), isLoggedIn)
            .then(() => {
                console.log(`Login status updated for ${username}`);
            })
            .catch((error) => {
                console.error("Error updating login status:", error);
            });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!username || !password) {
            const loginError = document.getElementById("login-error");
            loginError.innerHTML = "Please enter a username and password.";
            return;
        }

        const auth = getAuth();
        const loginError = document.getElementById("login-error");
        loginError.innerHTML = "Logging in...";

        const userEmail = username + "@miqaat.bhy"; // Add "@miqaat.bhy" here

        if (isAlreadyLoggedIn) {
            // User is already logged in
            loginError.innerHTML = "Only 1 login allowed per user.";
        } else {
            // User is not logged in, proceed with login
            signInWithEmailAndPassword(auth, userEmail, "$" + password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    updateLoginStatus(userEmail, true);
                    onLogin(user);
                })
                .catch((error) => {
                    const errorMessage = error.message;
                    loginError.innerHTML = errorMessage.replace("Firebase: ", "");
                });
        }
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <h1>Login</h1>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="ITS"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="submit">Login</button>
                </form>
                <p id="login-error" className="error-message"></p>
            </div>
        </div>
    );
}

export default Login;
