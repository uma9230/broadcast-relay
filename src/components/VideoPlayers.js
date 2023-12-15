import React, {useEffect, useState} from "react";
import "../App.css";
import {fetchAndActivate, getBoolean, getRemoteConfig, getString} from "firebase/remote-config";
import {app} from "../firebase";
import {getAuth, signOut} from "firebase/auth";
import {getDatabase, ref, set} from "firebase/database";
import "plyr-react/plyr.css"
import {clearAuthData} from "../util/auth";

function VideoPlayers({onLogout}) {
    const [videoUrl, setVideoUrl] = useState("");
    //const [twitchChannelName, setTwitchChannelName] = useState("");
    const [activeServer, setActiveServer] = useState("serverA");
    const [iframeLoaded, setIframeLoaded] = useState(false);
    const [isEnabledA, setIsEnabledA] = useState(true);
    //const [isEnabledB, setIsEnabledB] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [loggedInEmail, setLoggedInEmail] = useState(null);

    const auth = getAuth();

    useEffect(() => {
        // Add an event listener for the beforeunload event
        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            // Remove the event listener when the component is unmounted
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);

    const handleBeforeUnload = () => {
        // Clear authentication data from localStorage
        clearAuthData();
        // Update the user's login status to false
        if (loggedInEmail) {
            const userEmail = loggedInEmail.replace("@miqaat.bhy", ""); // Remove "@miqaat.bhy" here
            const db = getDatabase();
            const userRef = ref(db, `loggedInUsers/${userEmail}`);
            set(userRef, false)
                .then(() => {
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    };


    const handleServerChange = (server) => {
        setActiveServer(server);
    };

    const remoteConfig = getRemoteConfig(app);
    remoteConfig.settings.minimumFetchIntervalMillis = 100;

    useEffect(() => {
        const authStateChanged = getAuth().onAuthStateChanged((user) => {
            if (user) {
                setLoggedInEmail(user.email);
                setIsLoading(false);
            } else {
                setLoggedInEmail(null);
                setIsLoading(false);
            }
        });

        return () => {
            // Unsubscribe from the auth state change listener when the component unmounts
            authStateChanged();
        };
    }, []);

    // fetch the active servers from remote config
    useEffect(() => {
        fetchAndActivate(remoteConfig)
            .then(() => {
                const newVideoUrl = getString(remoteConfig, "video_url_or_id");
                //const newTwitchChannelName = getString(remoteConfig, "TWITCH_CHANNEL_NAME");
                const newIsEnabledA = getBoolean(remoteConfig, "IS_ENABLED_SERVER_A");
                //const newIsEnabledB = getBoolean(remoteConfig, "IS_ENABLED_SERVER_B");
                setVideoUrl(newVideoUrl);
                //setTwitchChannelName(newTwitchChannelName);
                setIsEnabledA(newIsEnabledA);
                //setIsEnabledB(newIsEnabledB);
                setIsEnabledA(true);
                //setIsEnabledB(false);
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

    const player = {
        source: {
            type: 'video',
            sources: [
                {
                    src: "https://finally-central-snake.ngrok-free.app/embed/video/",
                    provider: 'youtube',
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
                    {/*{isEnabledA && (*/}
                    {/*    <div*/}
                    {/*        id="serverA"*/}
                    {/*        className={`serverBtn ${activeServer === "serverA" ? "active" : ""}`}*/}
                    {/*        onClick={() => {*/}
                    {/*            handleServerChange("serverA");*/}
                    {/*        }}*/}
                    {/*        style={*/}
                    {/*            activeServer === "serverA"*/}
                    {/*                ? {*/}
                    {/*                    display: iframeLoaded ? "block" : "none",*/}
                    {/*                    backgroundColor: "var(--primary)",*/}
                    {/*                    color: "var(--secondary)",*/}
                    {/*                    borderColor: "var(--secondary)",*/}
                    {/*                    borderWidth: "2px",*/}
                    {/*                    borderStyle: "solid",*/}
                    {/*                }*/}
                    {/*                : {}*/}
                    {/*        }*/}
                    {/*    >*/}
                    {/*        Server A*/}
                    {/*    </div>*/}
                    {/*)}*/}
                    {/*{isEnabledB && (*/}
                    {/*    <div*/}
                    {/*        id="serverB"*/}
                    {/*        className={`serverBtn ${activeServer === "serverB" ? "active" : ""}`}*/}
                    {/*        onClick={() => {*/}
                    {/*            handleServerChange("serverB");*/}
                    {/*        }}*/}
                    {/*        style={*/}
                    {/*            activeServer === "serverB"*/}
                    {/*                ? {*/}
                    {/*                    display: iframeLoaded ? "block" : "none",*/}
                    {/*                    backgroundColor: "var(--primary)",*/}
                    {/*                    color: "var(--secondary)",*/}
                    {/*                    borderColor: "var(--secondary)",*/}
                    {/*                    borderWidth: "2px",*/}
                    {/*                    borderStyle: "solid",*/}
                    {/*                }*/}
                    {/*                : {}*/}
                    {/*        }*/}
                    {/*    >*/}
                    {/*        Server B*/}
                    {/*    </div>*/}
                    {/*)}*/}
                </div>

                {/* Video players */}
                <div className="video-players">
                    {activeServer === "serverA" && (
                        <div className="iframe-wrapper">
                            <div className="youtube-iframe" style={{height: 'calc(100% - 50px)'}}>
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
                    {/*{activeServer === "serverB" && (*/}
                    {/*    <div className="iframe-wrapper" style={{position: 'relative', marginBottom: '200px'}}>*/}
                    {/*        <div className="youtube-iframe" style={{height: 'calc(100% - 50px)', marginTop: '50px'}}>*/}
                    {/*            <Plyr {...player} />*/}
                    {/*        </div>*/}
                    {/*        <div*/}
                    {/*            style={{*/}
                    {/*                position: 'absolute',*/}
                    {/*                top: 0,*/}
                    {/*                left: 0,*/}
                    {/*                width: '100%',*/}
                    {/*                height: '85%',*/}
                    {/*                background: 'rgba(0, 0, 0, 0)', // Semi-transparent black overlay*/}
                    {/*                pointerEvents: 'auto', // This prevents clicks on the overlay*/}
                    {/*            }}*/}
                    {/*        />*/}
                    {/*    </div>*/}
                    {/*)}*/}
                </div>
            </div>
        </main>
    );
}

export default VideoPlayers;
