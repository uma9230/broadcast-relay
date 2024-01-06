import React, {useEffect, useState} from "react";
import {fetchAndActivate, getBoolean, getRemoteConfig, getString} from "firebase/remote-config";
import {app} from "../firebase";
import {getAuth, onAuthStateChanged, signOut} from "firebase/auth";
import {getDatabase, ref, set} from "firebase/database";
import "plyr-react/plyr.css";
import {setStoredUserEmail} from "../util/auth";
import Plyr from "plyr-react";

function VideoPlayers({ onLogout }) {
    const [videoUrl, setVideoUrl] = useState("");
    const [youtubeVideoURL, setYoutubeVideoURL] = useState("");
    const [activeServer, setActiveServer] = useState("");
    const [iframeLoaded, setIframeLoaded] = useState(false);
    const [isEnabledA, setIsEnabledA] = useState(true);
    const [isEnabledB, setIsEnabledB] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [loggedInEmail, setLoggedInEmail] = useState(null);
    const [showPlayer, setShowPlayer] = useState(null);

    const auth = getAuth();

    useEffect(() => {
        const unsubscribeAuthState = onAuthStateChanged(auth, (user) => {
            if (user) {
                setStoredUserEmail(user.email); // Store user email in localStorage
                setLoggedInEmail(user.email);
                setIsLoading(false);
            } else {
                setStoredUserEmail(null);
                setLoggedInEmail(null);
                setIsLoading(false);
            }
        });

        return () => {
            unsubscribeAuthState();
        };
    }, []);

    useEffect(() => {
        if (loggedInEmail) {
            // Update the user's login status in the database
            const userEmail = loggedInEmail.replace("@miqaat.bhy", ""); // Remove "@miqaat.bhy" here
            const db = getDatabase();
            const userRef = ref(db, `loggedInUsers/${userEmail}`);
            set(userRef, true)
                .then(() => {
                    // Continue with other initialization logic
                    fetchRemoteConfig();
                })
                .catch((error) => {
                    console.error(error);
                });
        } else {
            setIsLoading(false);
        }
    }, [loggedInEmail]);

    const fetchRemoteConfig = () => {
        const remoteConfig = getRemoteConfig(app);
        remoteConfig.settings.minimumFetchIntervalMillis = 100;

        fetchAndActivate(remoteConfig)
            .then(() => {
                const newVideoUrl = getString(remoteConfig, "video_url_or_id");
                const newYoutubeVideoUrl = getString(remoteConfig, "youtube_CHANNEL_NAME");
                const newIsEnabledA = getBoolean(remoteConfig, "IS_ENABLED_SERVER_A");
                const newIsEnabledB = getBoolean(remoteConfig, "IS_ENABLED_SERVER_B");

                setVideoUrl(newVideoUrl);
                setYoutubeVideoURL(newYoutubeVideoUrl);
                setIsEnabledA(newIsEnabledA);
                setIsEnabledB(newIsEnabledB);
                
                if (newIsEnabledA) {
                    setActiveServer("serverA");
                    setShowPlayer(true);
                } else if (newIsEnabledB) {
                    setActiveServer("serverB");
                    setShowPlayer(true);
                } else {
                    setShowPlayer(false);
                }
            })
            .catch((err) => {
                console.error(err);
            });
    };

    const handleServerChange = (server) => {
        setActiveServer(server);
    };

    const handleIframeLoad = () => {
        setIframeLoaded(true);
    };

    const handleLogout = () => {
        const userEmail = loggedInEmail ? loggedInEmail.replace("@miqaat.bhy", "") : null;
        if (userEmail) {
            const db = getDatabase();
            const userRef = ref(db, `loggedInUsers/${userEmail}`);

            // Update the user's login status to false
            set(userRef, false)
                .then(() => {
                    signOut(auth).then(() => {});
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

    const player = {
        source: {
            type: "video",
            sources: [
                {
                    src: `https://www.youtube.com/watch?v=${youtubeVideoURL}`,
                    provider: "youtube",
                },
            ],
        },
        options: {},
    };

    return (
        <main>
            <div className="video-players-header">
                {isLoading ? (
                    <h3>Loading...</h3>
                ) : (
                    <h3>
                        {loggedInEmail
                            ? `Logged in as: ${loggedInEmail.replace("@miqaat.bhy", "")}`
                            : "Not logged in"}
                    </h3>
                )}
            </div>
            <button id="logout-button" onClick={handleLogout}>
                Logout
            </button>
            <div className="iframe-container">
                {/* Server buttons */}
                <div className="servers">
                    {/* {isEnabledA && (
                        <button
                            className={`serverBtn ${activeServer === "serverA" ? "active" : ""}`}
                            onClick={() => handleServerChange("serverA")}
                        >
                            Server A
                        </button>
                    )}
                    {isEnabledB && (
                        <button
                            className={`serverBtn ${activeServer === "serverB" ? "active" : ""}`}
                            onClick={() => handleServerChange("serverB")}
                        >
                            Server B
                        </button>
                    )} */}
                </div>

                {/* Video players */}
                { showPlayer ? (
                    <div className="video-players">
                    {activeServer === "serverA" && (
                        <div className="iframe-wrapper">
                            <div className="youtube-iframe" style={{ height: "calc(100% - 50px)" }}>
                                <iframe
                                    className="youtube-iframe"
                                    src={videoUrl}
                                    title=""
                                    allowFullScreen
                                    onLoad={handleIframeLoad}
                                ></iframe>
                            </div>
                        </div>
                    )}
                    {activeServer === "serverB" && (
                        <div className="iframe-wrapper">
                            <div className="twitch-iframe" style={{ height: "calc(100% - 50px)" }}>
                                <Plyr {...player} />
                            </div>
                        </div>
                    )}
                    </div>
                ) : (
                    <div className="video-players">
                        <h4>Nothing to show</h4>
                    </div>
                )}
                
            </div>
        </main>
    );
}

export default VideoPlayers;
