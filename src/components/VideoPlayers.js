import React, { useCallback, useEffect, useState, useRef } from "react";
import { Realtimedb, db } from "../firebase";
import { child, get, onValue, ref, set } from "firebase/database";
import { doc, onSnapshot } from "firebase/firestore";
import "plyr-react/plyr.css";
import Plyr from "plyr-react";
import "../App.css";
import Chat from "./Chat";

function VideoPlayers({ onLogout, theme, toggleTheme }) {
    const [videoUrl, setVideoUrl] = useState("");
    const [youtubeVideoURL, setYoutubeVideoURL] = useState("");
    const [driveURL, setDriveURL] = useState("");
    const [activeServer, setActiveServer] = useState("");
    const [iframeLoaded, setIframeLoaded] = useState(false);
    const [isEnabledA, setIsEnabledA] = useState(true);
    const [isEnabledB, setisEnabledB] = useState(true);
    const [isEnabledC, setisEnabledC] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [username, setUsername] = useState(null);
    const [name, setName] = useState(null);
    const [showPlayer, setShowPlayer] = useState(null);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [unreadMessages, setUnreadMessages] = useState({
        A: 0,
        B: 0,
        C: 0,
    });
    const [youtubeApiReady, setYoutubeApiReady] = useState(false);
    const plyrRef = useRef(null);

    // Track message counts for each server to detect new messages
    const messageCountsRef = useRef({
        A: 0,
        B: 0,
        C: 0,
    });

    const handleserverChange = (server) => {
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
        const servers = ['A', 'B', 'C'];
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

    const getInitialActiveServer = (excludedServer = "") => {
        if (isEnabledA && excludedServer !== "A") return "A";
        if (isEnabledB && excludedServer !== "B") return "B";
        if (isEnabledC && excludedServer !== "C") return "C";
        return ""; // No available servers
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
    }, [isEnabledA, isEnabledB, isEnabledC, activeServer]);

    useEffect(() => {
        // Firestore listeners for server status and IDs
        const unsubscribes = [];

        // Helper to listen to a server's doc
        const listenServer = (serverKey, setStatus, setId) => {
            const serverDoc = doc(db, "servers", serverKey);
            const unsubscribe = onSnapshot(serverDoc, (docSnap) => {
                const data = docSnap.data() || {};
                setStatus(data.status);
                setId(data.id);
                // Switch server if current is disabled
                if (activeServer === serverKey && !data.status) {
                    const nextServer = getInitialActiveServer(serverKey);
                    setActiveServer(nextServer);
                }
            });
            unsubscribes.push(unsubscribe);
        };

        listenServer("A", setIsEnabledA, setVideoUrl);
        listenServer("B", setisEnabledB, setDriveURL);
        listenServer("C", setisEnabledC, setYoutubeVideoURL);

        return () => {
            unsubscribes.forEach(unsub => unsub());
        };
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
    };    // Don't filter out hidden messages - they'll be shown with blur styling
    const filterMessage = (msg) => true; // Show all messages including hidden ones
    const renderMessage = (msg, defaultRender) => {
        // Highlight important messages
        if (msg.important) {
            return (
                <div style={{
                    background: '#fffde7',
                    borderLeft: '4px solid #ffd600',
                    padding: '0.5em 1em',
                    margin: '0.25em 0',
                    borderRadius: 6,
                    fontWeight: 600
                }}>
                    {defaultRender ? defaultRender(msg) : msg.text || msg.message}
                </div>
            );
        }
        // Default rendering
        return defaultRender ? defaultRender(msg) : (msg.text || msg.message);
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
                                    className={`serverBtn ${activeServer === "A" ? "active" : ""}`}
                                    onClick={() => handleserverChange("A")}
                                >
                                    Server A
                                    {unreadMessages.A > 0 && (
                                        <span className="notification-badge">
                                            {unreadMessages.A}
                                        </span>
                                    )}
                                </button>
                            )}
                            {isEnabledB && (
                                <button
                                    className={`serverBtn ${activeServer === "B" ? "active" : ""}`}
                                    onClick={() => handleserverChange("B")}
                                >
                                    Server B
                                    {unreadMessages.B > 0 && (
                                        <span className="notification-badge">
                                            {unreadMessages.B}
                                        </span>
                                    )}
                                </button>
                            )}
                            {isEnabledC && (
                                <button
                                    className={`serverBtn ${activeServer === "C" ? "active" : ""}`}
                                    onClick={() => handleserverChange("C")}
                                >
                                    Server C
                                    {unreadMessages.C > 0 && (
                                        <span className="notification-badge">
                                            {unreadMessages.C}
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
                            {activeServer === "A" && (
                                <div className="iframe-wrapper">
                                    <iframe
                                            className="owncast-iframe"
                                            src={videoUrl}
                                            title="Server A"
                                            allowFullScreen
                                            onLoad={handleIframeLoad}
                                        ></iframe>
                                </div>
                            )}
                            {activeServer === "B" && (
                                <div className="iframe-wrapper">
                                   <iframe
                                            className="twitch-iframe"
                                            src={`https://drive.google.com/file/d/${driveURL}/preview`}
                                            title="Server B"
                                            allowFullScreen
                                            seamless=""
                                            sandbox="allow-same-origin allow-scripts"
                                            allow="autoplay"
                                        ></iframe>
                                </div>
                            )}
                            {activeServer === "C" && youtubeVideoURL && youtubeApiReady && (
                                <div className="iframe-wrapper">
                                    <div className="twitch-iframe">
                                        <Plyr
                                            ref={plyrRef}
                                            {...player}
                                            onReady={(event) => {
                                                console.log("Plyr player is ready");
                                                event.detail.plyr.play();
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
                            filterMessage={filterMessage}
                            renderMessage={renderMessage}
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