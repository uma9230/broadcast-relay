// Header.js
import React, { useEffect, useState } from "react";
import "../App.css";
import { db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";

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
            <img src="https://yt3.googleusercontent.com/fkBqLGX5E_WMfwO62pXX4bEd3U7StuUF9oTtgfxTj5q-dqFzQaTR8XKMVcp8en_ICcs1xbbWGQ=s176-c-k-c0x00ffffff-no-rj" alt="Logo" className="logo" />
            <h1>Nova Cast</h1>
            <h2>TYBCA</h2>
            <h2>{`${eventName}`}</h2>
        </header>
    );
}

export default Header;
