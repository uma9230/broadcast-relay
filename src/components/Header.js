// Header.js
import React, {useEffect, useState} from "react";
import "../App.css";
import {onValue, ref} from "firebase/database";
import {Realtimedb} from "../firebase";

function Header({theme}) {
    const [eventName, seteventName] = useState("");

    useEffect(() => {
        if (eventName === "") {
            const eventNameRef = ref(Realtimedb, 'eventName');
            onValue(eventNameRef, (snapshot) => {
                const data = snapshot.val();
                seteventName(data);
            });
        }

    }, [eventName]);

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
