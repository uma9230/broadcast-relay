import React, { useCallback, useEffect, useState, useRef } from "react";
import { Realtimedb } from "../firebase";
import { child, get, onValue, ref, set } from "firebase/database";
import "plyr-react/plyr.css";
import Plyr from "plyr-react";
import "../App.css";
import Chat from "./Chat";

function VideoPlayers({ onLogout, theme, toggleTheme }) {
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
    const [unreadMessages, setUnreadMessages] = useState({
        serverA: 0,
        serverB: 0,
        serverC: 0,
        serverD: 0,
    });
    const [youtubeApiReady, setYoutubeApiReady] = useState(false); // Track YouTube API readiness
    const plyrRef = useRef(null); // Ref for Plyr instance

    // Track message counts for each server to detect new messages
    const messageCountsRef = useRef({
        serverA: 0,
        serverB: 0,
        serverC: 0,
        serverD: 0,
    });

    const handleServerChange = (server) => {
        console.log(`Switching to server: ${server}`);
        setActiveServer(server);
        setShowPlayer(true);
        // Mark messages as read for the selected server
        setUnreadMessages((prev) => {
            console.log(`Marking messages as read for ${server}, new state:`, { ...prev, [server]: 0 });
            return {
                ...prev,
                [server]: 0,
            };
        });
    };

    const handleNewMessage = (serverId) => {
        console.log(`New message received for ${serverId}, active server is ${activeServer}`);
        if (serverId !== activeServer) {
            setUnreadMessages((prev) => {
                const newCount = prev[serverId] + 1;
                console.log(`Incrementing unread count for ${serverId} to ${newCount}`);
                return {
                    ...prev,
                    [serverId]: newCount,
                };
            });
        } else {
            console.log(`Message is from active server ${serverId}, not incrementing unread count`);
        }
    };

    // Global listener for all servers' messages
    useEffect(() => {
        const servers = ['serverA', 'serverB', 'serverC', 'serverD'];
        const unsubscribes = [];

        servers.forEach((serverId) => {
            const messagesRef = ref(Realtimedb, `servers/${serverId}/messages`);
            const unsubscribe = onValue(messagesRef, (snapshot) => {
                const messages = snapshot.val() ? Object.keys(snapshot.val()).length : 0;
                const previousCount = messageCountsRef.current[serverId];

                if (previousCount !== 0 && messages > previousCount && serverId !== activeServer) {
                    console.log(`Detected new message in ${serverId}: ${messages} messages (was ${previousCount})`);
                    handleNewMessage(serverId);
                }

                messageCountsRef.current[serverId] = messages;
            });

            unsubscribes.push(unsubscribe);
        });

        // Cleanup listeners on unmount
        return () => {
            unsubscribes.forEach((unsubscribe) => unsubscribe());
        };
    }, [activeServer]);

    const handleIframeLoad = useCallback(() => {
        setIframeLoaded(true);
        const iframe = document.querySelector(".youtube-iframe");
        if (iframe) {
            iframe.contentWindow.postMessage(
                '{"event":"command","func":"playVideo","args":""}',
                "*"
            );
        }
    }, []);

    const getInitialActiveServer = () => {
        if (isEnabledA) return "serverA";
        if (isEnabledB) return "serverB";
        if (isEnabledC) return "serverC";
        if (isEnabledD) return "serverD";
        return "";
    };

    useEffect(() => {
        if (!activeServer) {
            const initialServer = getInitialActiveServer();
            console.log(`Setting initial server to ${initialServer}`);
            setActiveServer(initialServer);
            setShowPlayer(!!initialServer);
            if (initialServer) {
                setUnreadMessages((prev) => ({
                    ...prev,
                    [initialServer]: 0,
                }));
            }
        }
    }, [isEnabledA, isEnabledB, isEnabledC, isEnabledD, activeServer]);

    useEffect(() => {
        const serverARef = ref(Realtimedb, "serverAStatus");
        onValue(serverARef, (snapshot) => {
            const data = snapshot.val();
            setIsEnabledA(data);
            if (activeServer === "serverA" && !data) {
                setActiveServer(getInitialActiveServer());
            }
        });

        const serverBRef = ref(Realtimedb, "serverBStatus");
        onValue(serverBRef, (snapshot) => {
            const data = snapshot.val();
            setIsEnabledB(data);
            if (activeServer === "serverB" && !data) {
                setActiveServer(getInitialActiveServer());
            }
        });

        const serverCRef = ref(Realtimedb, "serverCStatus");
        onValue(serverCRef, (snapshot) => {
            const data = snapshot.val();
            setIsEnabledC(data);
            if (activeServer === "serverC" && !data) {
                setActiveServer(getInitialActiveServer());
            }
        });

        const serverDRef = ref(Realtimedb, "serverDStatus");
        onValue(serverDRef, (snapshot) => {
            const data = snapshot.val();
            setIsEnabledD(data);
            if (activeServer === "serverD" && !data) {
                setActiveServer(getInitialActiveServer());
            }
        });

        const serverARefID = ref(Realtimedb, "serverAID");
        onValue(serverARefID, (snapshot) => {
            setVideoUrl(snapshot.val());
        });

        const serverBRefID = ref(Realtimedb, "serverBID");
        onValue(serverBRefID, (snapshot) => {
            setYoutubeLiveURL(snapshot.val());
        });

        const serverCRefID = ref(Realtimedb, "serverCID");
        onValue(serverCRefID, (snapshot) => {
            setDriveURL(snapshot.val());
        });

        const serverDRefID = ref(Realtimedb, "serverDID");
        onValue(serverDRefID, (snapshot) => {
            setYoutubeVideoURL(snapshot.val());
        });
    }, [activeServer]);

    useEffect(() => {
        const storedUser = localStorage.getItem("authUser");
        setUsername(storedUser);

        if (storedUser) {
            get(child(ref(Realtimedb), `loggedInUsers/${storedUser}/name`))
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        setName(snapshot.val());
                        setIsLoading(false);
                    } else {
                        console.log("No data available");
                        setIsLoading(false);
                    }
                })
                .catch((error) => {
                    console.error("Error getting data:", error);
                    setIsLoading(false);
                });
        } else {
            setIsLoading(false);
        }

        if (storedUser) {
            const loggedInUsersRef = ref(Realtimedb, `loggedInUsers/${storedUser}/login_status`);
            const unsubscribe = onValue(loggedInUsersRef, (snapshot) => {
                const data = snapshot.val();
                if (data === false) {
                    onLogout();
                }
            });

            return () => unsubscribe();
        }
    }, [onLogout]);

    useEffect(() => {
        const youtubeIframe = document.querySelector(".youtube-iframe");
        if (youtubeIframe) {
            youtubeIframe.addEventListener("load", handleIframeLoad);
        }
        return () => {
            if (youtubeIframe) {
                youtubeIframe.removeEventListener("load", handleIframeLoad);
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

    // Prevent right-click context menu
    useEffect(() => {
        const handleContextMenu = (e) => e.preventDefault();
        document.addEventListener("contextmenu", handleContextMenu);
        return () => document.removeEventListener("contextmenu", handleContextMenu);
    }, []);

    // Load YouTube IFrame API script only once
    useEffect(() => {
        if (window.YT) {
            setYoutubeApiReady(true);
            return;
        }

        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        window.onYouTubeIframeAPIReady = () => {
            console.log("YouTube IFrame API is ready");
            setYoutubeApiReady(true);
        };

        return () => {
            // Clean up the script and callback
            if (tag.parentNode) {
                tag.parentNode.removeChild(tag);
            }
            delete window.onYouTubeIframeAPIReady;
        };
    }, []);

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
        options: {
            youtube: {
                noCookie: true,
                rel: 0,
                showinfo: 0,
                iv_load_policy: 3,
                modestbranding: 1,
                playerVars: {
                    autoplay: 0,
                    controls: 1,
                    disablekb: 0,
                    enablejsapi: 1,
                    fs: 1,
                    origin: window.location.origin,
                },
            },
            blankVideo: "https://cdn.plyr.io/static/blank.mp4",
        },
        onReady: (event) => {
            console.log("Plyr player is ready");
        },
    };

    return (
        <main className="Video-section">
            <div className="video-players-header">
                {isLoading ? (
                    <h3>Loading...</h3>
                ) : (
                    <h3 className="greeting-name">
                        Welcome,{" "}
                        <span className="username">
                            {username ? name : "Not logged in"}
                        </span>
                    </h3>
                )}
                <div>
                    <button id="logout-button" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>
            <div className="iframe-container">
                <div className="servers">
                    {!isLoading ? (
                        <>
                            {isEnabledA && (
                                <button
                                    className={`serverBtn ${activeServer === "serverA" ? "active" : ""}`}
                                    onClick={() => handleServerChange("serverA")}
                                >
                                    Server A
                                    {unreadMessages.serverA > 0 && (
                                        <span className="notification-badge">
                                            {unreadMessages.serverA}
                                        </span>
                                    )}
                                </button>
                            )}
                            {isEnabledB && (
                                <button
                                    className={`serverBtn ${activeServer === "serverB" ? "active" : ""}`}
                                    onClick={() => handleServerChange("serverB")}
                                >
                                    Server B
                                    {unreadMessages.serverB > 0 && (
                                        <span className="notification-badge">
                                            {unreadMessages.serverB}
                                        </span>
                                    )}
                                </button>
                            )}
                            {isEnabledC && (
                                <button
                                    className={`serverBtn ${activeServer === "serverC" ? "active" : ""}`}
                                    onClick={() => handleServerChange("serverC")}
                                >
                                    Server C
                                    {unreadMessages.serverC > 0 && (
                                        <span className="notification-badge">
                                            {unreadMessages.serverC}
                                        </span>
                                    )}
                                </button>
                            )}
                            {isEnabledD && (
                                <button
                                    className={`serverBtn ${activeServer === "serverD" ? "active" : ""}`}
                                    onClick={() => handleServerChange("serverD")}
                                >
                                    Server D
                                    {unreadMessages.serverD > 0 && (
                                        <span className="notification-badge">
                                            {unreadMessages.serverD}
                                        </span>
                                    )}
                                </button>
                            )}
                        </>
                    ) : (
                        <h3>Loading...</h3>
                    )}
                </div>
                <div className="video-chat-container">
                    {showPlayer ? (
                        <div className="video-players">
                            {activeServer === "serverA" && (
                                <div className="iframe-wrapper">
                                    <div className="twitch-iframe">
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
                                    <div className="twitch-iframe">
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
                                    <div className="twitch-iframe">
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
                            {activeServer === "serverD" && youtubeVideoURL && youtubeApiReady && (
                                <div className="iframe-wrapper">
                                    <div className="twitch-iframe">
                                        <Plyr
                                            ref={plyrRef}
                                            {...player}
                                            onReady={(event) => {
                                                console.log("Plyr player is ready");
                                                event.detail.plyr.play(); // Attempt to play if desired
                                            }}
                                            onError={(event) => {
                                                console.error("Plyr error:", event.detail);
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="video-players">
                            <h4>Nothing to show</h4>
                        </div>
                    )}
                    {activeServer && username && (
                        <Chat
                            db={Realtimedb}
                            serverId={activeServer}
                            username={name || username}
                            onNewMessage={handleNewMessage}
                        />
                    )}
                </div>
            </div>

            {showLogoutModal && (
                <div className="modal-overlay" onClick={cancelLogout}>
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button className="close-icon" onClick={cancelLogout}>
                            ✕
                        </button>
                        <h2>Confirm Logout</h2>
                        <p>Are you sure you want to log out?</p>
                        <div className="modal-buttons">
                            <button
                                className="modal-primary-btn"
                                onClick={confirmLogout}
                            >
                                Confirm
                            </button>
                            <button
                                className="modal-secondary-btn"
                                onClick={cancelLogout}
                            >
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