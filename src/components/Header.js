// Header.js
import React, { useEffect, useState } from "react";
import "../App.css";
import { db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";
import greenLogo from "../assets/images/green-logo.png"; // Import the local image

function Header({ theme }) {
    const [eventName, seteventName] = useState("");

    useEffect(() => {
        // Listen for event name changes from Firestore (system/eventName)
        const docRef = doc(db, "system", "eventName");
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                seteventName(data.name || "");
            } else {
                seteventName("");
            }
        }, (error) => {
            console.error("Error fetching event name:", error);
        });

        return () => unsubscribe();
    }, []);

    return (
        <header>
            <img src={greenLogo} alt="Logo" className="nav-logo" />
            {/* <h1>Nova Cast</h1> */}
            <h2>TYBCA</h2>
            <h2>{`${eventName}`}</h2>
        </header>
    );
}

export default Header;
