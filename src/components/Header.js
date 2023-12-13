// Header.js
import React, {useEffect, useState} from "react";
import "../App.css";
import {fetchAndActivate, getRemoteConfig, getString} from "firebase/remote-config";
import {app} from "../firebase";

function Header() {
    const [miqaatName, setMiqaatName] = useState("");

    const remoteConfig = getRemoteConfig(app);
    remoteConfig.settings.minimumFetchIntervalMillis = 100;

    useEffect(() => {
        fetchAndActivate(remoteConfig)
            .then(() => {
                const newMiqaatName = getString(remoteConfig, "MIQAAT_NAME");
                setMiqaatName(newMiqaatName);
            })
            .catch((err) => {
                console.error(err);
            });
    }, []);
    return (
        <header>
            <img src="https://www.its52.com/imgs/Logos/Logo_Bhayendar_West.png" alt="Anjuman-e-Badri Logo" className="logo"/>
            <h1>Anjuman - e - Badri</h1>
            <h2>Bhayander West Relay</h2>
            <h2>{`${miqaatName}`}</h2>
        </header>
    );
}

export default Header;
