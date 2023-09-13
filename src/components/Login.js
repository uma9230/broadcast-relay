// Login.js
import React, {useState} from "react";
import {getAuth, signInWithEmailAndPassword} from "firebase/auth";
import "../App.css";

function Login({onLogin}) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        const auth = getAuth();
        signInWithEmailAndPassword(auth, username, password)
            .then((userCredential) => {
                const user = userCredential.user;
                onLogin(user);
            })
            .catch((error) => {
                const errorMessage = error.message;
                const loginError = document.getElementById("login-error");
                // strip the "Firebase: " prefix from the error message
                loginError.innerHTML = errorMessage.replace("Firebase: ", "");
            });
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <h1>Login</h1>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Username"
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
