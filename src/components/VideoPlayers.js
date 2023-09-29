import React, {useEffect, useState} from "react";
import "../App.css";
import {fetchAndActivate, getBoolean, getRemoteConfig, getString} from "firebase/remote-config";
import {app} from "../firebase";
import {getAuth, signOut} from "firebase/auth";
import {getDatabase, ref, set} from "firebase/database";

function VideoPlayers({onLogout}) {
    const [youtubeVideoId, setYoutubeVideoId] = useState("");
    const [twitchChannelName, setTwitchChannelName] = useState("");
    const [activeServer, setActiveServer] = useState("serverA");
    const [iframeLoaded, setIframeLoaded] = useState(false);
    const [isEnabledA, setIsEnabledA] = useState(true);
    const [isEnabledB, setIsEnabledB] = useState(true);

    const auth = getAuth();

    const handleServerChange = (server) => {
        setActiveServer(server);
    };

    const remoteConfig = getRemoteConfig(app);
    remoteConfig.settings.minimumFetchIntervalMillis = 100;

    // fetch the active servers from remote config
    useEffect(() => {
        fetchAndActivate(remoteConfig)
            .then(() => {
                const newYoutubeVideoId = getString(remoteConfig, "YOUTUBE_VIDEO_ID");
                const newTwitchChannelName = getString(remoteConfig, "TWITCH_CHANNEL_NAME");
                const newIsEnabledA = getBoolean(remoteConfig, "IS_ENABLED_SERVER_A");
                const newIsEnabledB = getBoolean(remoteConfig, "IS_ENABLED_SERVER_B");
                setYoutubeVideoId(newYoutubeVideoId);
                setTwitchChannelName(newTwitchChannelName);
                setIsEnabledA(newIsEnabledA);
                setIsEnabledB(newIsEnabledB);
            })
            .catch((err) => {
                console.error(err);
            });
    }, []);

    const handleIframeLoad = () => {
        setIframeLoaded(true);
    };

    const handleLogout = () => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
            const userEmail = user.email.replace("@miqaat.bhy", ""); // Remove "@miqaat.bhy" here
            const db = getDatabase();
            const userRef = ref(db, `loggedInUsers/${userEmail}`);

            // Update the user's login status to false
            set(userRef, false)
                .then(() => {
                    signOut(auth).then(() => {
                    });
                    onLogout();
                })
                .catch((error) => {
                    console.error(error);
                });
        } else {
            // User is not logged in, proceed with logout
            onLogout();
        }
    };

    document.addEventListener("contextmenu", (e) => {
        e.preventDefault();
    });

    return (
        <main>
            <div className="video-players-header">
                <h3>Logged in as: {auth.currentUser.email.replace("@miqaat.bhy", "")}</h3>
            </div>

            <div className="iframe-container">
                {/* Server buttons */}
                <div className="servers">
                    {isEnabledA && (
                        <div
                            id="serverA"
                            className={`serverBtn ${activeServer === "serverA" ? "active" : ""}`}
                            onClick={() => {
                                handleServerChange("serverA");
                            }}
                            style={
                                activeServer === "serverA"
                                    ? {
                                        display: iframeLoaded ? "block" : "none",
                                        backgroundColor: "var(--primary)",
                                        color: "var(--secondary)",
                                        borderColor: "var(--secondary)",
                                        borderWidth: "2px",
                                        borderStyle: "solid",
                                    }
                                    : {}
                            }
                        >
                            Server A
                        </div>
                    )}
                    {isEnabledB && (
                        <div
                            className={`serverBtn ${activeServer === "serverB" ? "active" : ""}`}
                            onClick={() => {
                                handleServerChange("serverB");
                            }}
                            style={
                                activeServer === "serverB"
                                    ? {
                                        display: iframeLoaded ? "block" : "none",
                                        backgroundColor: "var(--primary)",
                                        color: "var(--secondary)",
                                        borderColor: "var(--secondary)",
                                        borderWidth: "2px",
                                        borderStyle: "solid",
                                    }
                                    : {}
                            }
                        >
                            Server B
                        </div>
                    )}
                </div>

                {/* Video players */}
                <div className="video-players">
                    {activeServer === "serverA" && (
                        <div className="iframe-wrapper">
                            <iframe
                                className="youtube-iframe"
                                src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&mute=1&enablejsapi=1&origin=http://localhost&widgetid=1&https://bhyw-relay.vercel.app`}
                                title=""
                                allowFullScreen
                                onLoad={handleIframeLoad}
                            ></iframe>
                        </div>
                    )}
                    {activeServer === "serverB" && (
                        <div className="iframe-wrapper">
                            <iframe
                                className="twitch-iframe"
                                src={`https://player.twitch.tv/?channel=${twitchChannelName}&parent=localhost&parent=bhyw-relay.vercel.app`}
                                allowFullScreen
                                onLoad={handleIframeLoad}
                            ></iframe>
                        </div>
                    )}
                </div>
                <button id="logout-button" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </main>
    );
}

export default VideoPlayers;
