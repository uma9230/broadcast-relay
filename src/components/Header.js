// Header.js
import React, { useEffect, useState } from "react";
import "../App.css";
import { onValue, ref } from "firebase/database";
import { Realtimedb } from "../firebase";

function Header() {
    const [miqaatName, setMiqaatName] = useState("");

    useEffect(() => {
        if (miqaatName === "") {
            const miqaatNameRef = ref(Realtimedb, 'miqaatName');
            onValue(miqaatNameRef, (snapshot) => {
                const data = snapshot.val();
                setMiqaatName(data);
            });
        }

    }, [miqaatName]);

    return (
        <header>
            <img src="https://www.its52.com/imgs/Logos/Logo_Bhayendar_West.png" alt="Anjuman-e-Badri Logo" className="logo" />
            <h1>Anjuman - e - Badri</h1>
            <h2>Bhayander West Relay</h2>
            <h2>{`${miqaatName}`}</h2>
        </header>
    );
}

export default Header;
