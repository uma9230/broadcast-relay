import React, {useCallback, useEffect, useState} from "react";
import {Realtimedb} from "../firebase";
import {child, get, onValue, ref, set} from "firebase/database";
import "plyr-react/plyr.css";

function VideoPlayers({ onLogout }) {
    const [videoUrl, setVideoUrl] = useState("");
    const [youtubeVideoURL, setYoutubeVideoURL] = useState("");
    const [driveURL, setDriveURL] = useState("");
    const [activeServer, setActiveServer] = useState("");
    const [iframeLoaded, setIframeLoaded] = useState(false);
    const [isEnabledA, setIsEnabledA] = useState(true);
    const [isEnabledB, setIsEnabledB] = useState(true);
    const [isEnabledC, setIsEnabledC] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [username, setUsername] = useState(null);
    const [name, setName] = useState(null);
    const [showPlayer, setShowPlayer] = useState(null);

    const handleServerChange = (server) => {
        setActiveServer(server);
    };

    useCallback(() => {
        if (iframeLoaded) {
            const iframe = document.querySelector('.youtube-iframe');
            if (iframe) {
                iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
            }
        }
    }, [iframeLoaded]);

    const handleIframeLoad = () => {
        setIframeLoaded(true);
    };

    useEffect(() => {
        const serverARef = ref(Realtimedb, 'serverAStatus');
            onValue(serverARef, (snapshot) => {
                const data = snapshot.val();
                setIsEnabledA(data);
            });

            const serverBRef = ref(Realtimedb, 'serverBStatus');
            onValue(serverBRef, (snapshot) => {
                const data = snapshot.val();
                setIsEnabledB(data);
            });

            const serverCRef = ref(Realtimedb, 'serverCStatus');
            onValue(serverCRef, (snapshot) => {
                const data = snapshot.val();
                setIsEnabledC(data);
            });

            const serverARefID = ref(Realtimedb, 'serverAID');
            onValue(serverARefID, (snapshot) => {
                const data = snapshot.val();
                setVideoUrl(data);
            });

            const serverBRefID = ref(Realtimedb, 'serverBID');
            onValue(serverBRefID, (snapshot) => {
                const data = snapshot.val();
                setYoutubeVideoURL(data);
            });

            const serverCRefID = ref(Realtimedb, 'serverCID');
            onValue(serverCRefID, (snapshot) => {
                const data = snapshot.val();
                setDriveURL(data);
            });

        if (isEnabledA) {
            setActiveServer("serverA");
            setShowPlayer(true);
        } else if (isEnabledB) {
            setActiveServer("serverB");
            setShowPlayer(true);
        } else if (isEnabledC) {
            setActiveServer("serverC");
            setShowPlayer(true);
        } else {
            setShowPlayer(false);
        }

        setUsername(localStorage.getItem("authUser"));

        if (username) {
            get(child(ref(Realtimedb), `loggedInUsers/${username}/name`)).then((snapshot) => {
                if (snapshot.exists()) {
                    setName(snapshot.val());
                    setIsLoading(false);
                } else {
                    console.log("No data available");
                }
            }).catch((error) => {
                console.error("Error getting data:", error);
            });
        } else {
            setIsLoading(false);
        }

        const loggedInUsersRef = ref(Realtimedb, `loggedInUsers/${username}/login_status`);
        onValue(loggedInUsersRef, (snapshot) => {
            const data = snapshot.val();
            if (data === false) {
                onLogout();
            }
        });

    }, [isEnabledA, isEnabledB, isEnabledC, username, onLogout]);

    useEffect(() => {
        const youtubeIframe = document.querySelector('.youtube-iframe');
        if (youtubeIframe) {
            youtubeIframe.addEventListener('load', handleIframeLoad);
        }
        // Cleanup function to remove event listener on unmount
        return () => {
            if (youtubeIframe) {
                youtubeIframe.removeEventListener('load', handleIframeLoad);
            }
        };
    }, [handleIframeLoad]);


    const handleLogout = async () => {
        try {
            await set(ref(Realtimedb, `/loggedInUsers/${username}/login_status`), false);
            onLogout();
        } catch (error) {
            console.error("Error updating login status:", error);
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
        <main className="Video-section">
            <h3 className="greeting">
                Salaam,
            </h3>
            <div className="video-players-header">
                {isLoading ? (
                    <h3>Loading...</h3>
                ) : (
                    <h2>
                        {username
                            ? name
                            : "Not logged in"
                        }
                    </h2>
                )}
                <button id="logout-button" onClick={handleLogout}>
                    Logout
                </button>
            </div>
            <div className="iframe-container">
                {/* Server buttons */}
                <div className="servers">
                    {
                        !isLoading ? (
                            <>
                                {isEnabledA && (
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
                                )}
                                {isEnabledC && (
                                    <button
                                        className={`serverBtn ${activeServer === "serverC" ? "active" : ""}`}
                                        onClick={() => handleServerChange("serverC")}
                                    >
                                        Server C
                                    </button>
                                )}
                            </>
                        ) : (
                            <h3>Loading...</h3>
                        )
                    }
                </div>

                {/* Video players */}
                {showPlayer ? (
                    <div className="video-players">
                        {activeServer === "serverA" && (
                            <div className="iframe-wrapper">
                                <div className="twitch-iframe" style={{ height: "calc(100% - 50px)" }}>
                                    <iframe
                                        className="twitch-iframe"
                                        src={videoUrl}
                                        title="Server A"
                                        allowFullScreen
                                        onLoad={handleIframeLoad}
                                    ></iframe>
                                </div>
                            </div>
                        )}
                        {activeServer === "serverB" && (
                            <div className="iframe-wrapper">
                                <div className="twitch-iframe" style={{ height: "calc(100% - 50px)" }}>
                                    <video
                                        className="twitch-iframe"
                                        src={`https://ythls-v3.onrender.com/video/${youtubeVideoURL}.m3u8`}
                                        title="Server B"
                                        allowFullScreen
                                        onLoad={handleIframeLoad}
                                    ></video>
                                </div>
                            </div>
                        )}
                        {activeServer === "serverC" && (
                            <div className="iframe-wrapper">
                                <div className="twitch-iframe" style={{ height: "calc(100% - 50px)" }}>
                                    <iframe
                                        className="twitch-iframe"
                                        src={`https://drive.google.com/file/d/${driveURL}/preview`} 
                                        title="Server C"
                                        allowFullScreen
                                        seamless=""
                                        sandbox="allow-same-origin allow-scripts"
                                        allow="autoplay"
                                    ></iframe>
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
