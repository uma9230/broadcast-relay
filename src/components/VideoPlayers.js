import React, {useCallback, useEffect, useState} from "react";
import {Realtimedb} from "../firebase";
import {child, get, onValue, ref, set} from "firebase/database";
import "plyr-react/plyr.css";
import Plyr from "plyr-react";

function VideoPlayers({ onLogout }) {
    const [videoUrl, setVideoUrl] = useState("");
    const [youtubeLiveURL, setYoutubeLiveURL] = useState("");
    const [youtubeVideoURL, setYoutubeVideoURL] = useState("");
    const [driveURL, setDriveURL] = useState("");
    const [activeServer, setActiveServer] = useState("");
    const [iframeLoaded, setIframeLoaded] = useState(false);
    const [isEnabledA, setIsEnabledA] = useState(true);
    const [isEnabledB, setIsEnabledB] = useState(true);
    const [isEnabledC, setIsEnabledC] = useState(true);
    const [isEnabledD, setIsEnabledD] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [username, setUsername] = useState(null);
    const [name, setName] = useState(null);
    const [showPlayer, setShowPlayer] = useState(null);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

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

            const serverDRef = ref(Realtimedb, 'serverDStatus');
            onValue(serverDRef, (snapshot) => {
                const data = snapshot.val();
                setIsEnabledD(data);
            });

            const serverARefID = ref(Realtimedb, 'serverAID');
            onValue(serverARefID, (snapshot) => {
                const data = snapshot.val();
                setVideoUrl(data);
            });

            const serverBRefID = ref(Realtimedb, 'serverBID');
            onValue(serverBRefID, (snapshot) => {
                const data = snapshot.val();
                setYoutubeLiveURL(data);
            });

            const serverCRefID = ref(Realtimedb, 'serverCID');
            onValue(serverCRefID, (snapshot) => {
                const data = snapshot.val();
                setDriveURL(data);
            });

            const serverDRefID = ref(Realtimedb, 'serverDID');
            onValue(serverDRefID, (snapshot) => {
                const data = snapshot.val();
                setYoutubeVideoURL(data);
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
        } else if (isEnabledD) {
            setActiveServer("serverD");
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

    }, [isEnabledA, isEnabledB, isEnabledC, isEnabledD, username, onLogout]);

    useEffect(() => {
        const youtubeIframe = document.querySelector('.youtube-iframe');
        if (youtubeIframe) {
            youtubeIframe.addEventListener('load', handleIframeLoad);
        }
        return () => {
            if (youtubeIframe) {
                youtubeIframe.removeEventListener('load', handleIframeLoad);
            }
        };
    }, [handleIframeLoad]);

    const handleLogout = async () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = async () => {
        try {
            await set(ref(Realtimedb, `/loggedInUsers/${username}/login_status`), false);
            onLogout();
        } catch (error) {
            console.error("Error updating login status:", error);
        }
        setShowLogoutModal(false);
    };

    const cancelLogout = () => {
        setShowLogoutModal(false);
    };

    document.addEventListener("contextmenu", (e) => {
        e.preventDefault();
    });

    const player = {
        source: {
            type: "video",
            sources: [
                {
                    src: youtubeVideoURL,
                    provider: "youtube",
                },
            ],
        },
        options: {},
    };

    return (
        <main className="Video-section">
           <div className="video-players-header">
    {isLoading ? (
        <h3>Loading...</h3>
    ) : (
        <h3 className="greeting-name">
            Welcome,&nbsp;<span className="username">{username ? name : "Not logged in"}</span>
        </h3>
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
                                {isEnabledD && (
                                    <button
                                        className={`serverBtn ${activeServer === "serverD" ? "active" : ""}`}
                                        onClick={() => handleServerChange("serverD")}
                                    >
                                        Server D
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
                                <div className="twitch-iframe" style={{height: "calc(100% - 50px)"}}>
                                    <iframe
                                        src={`https://anym3u8player.com/tv/video-player.php?url=https%3A%2F%2Fworker-damp-poetry-68b1.1doi3.workers.dev%2Fhttp%3A%2F%2Fythls-v3.onrender.com%2Fvideo%2F${youtubeLiveURL}.m3u8`}
                                        title="Server B"
                                        allowFullScreen
                                        onLoad={handleIframeLoad}
                                        className="twitch-iframe"
                                    />
                                </div>
                            </div>
                        )}
                        {activeServer === "serverC" && (
                            <div className="iframe-wrapper">
                                <div className="twitch-iframe" style={{height: "calc(100% - 50px)"}}>
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
                        {activeServer === "serverD" && (
                            <div className="iframe-wrapper">
                                <div className="twitch-iframe" style={{height: "calc(100% - 50px)"}}>
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

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="modal-overlay" onClick={cancelLogout}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <button className="close-icon" onClick={cancelLogout}>
                            ✕
                        </button>
                        <h2>Confirm Logout</h2>
                        <p>Are you sure you want to log out?</p>
                        <div className="modal-buttons">
                            <button className="modal-primary-btn" onClick={confirmLogout}>
                                Confirm
                            </button>
                            <button className="modal-secondary-btn" onClick={cancelLogout}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

export default VideoPlayers;