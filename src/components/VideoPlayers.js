// VideoPlayers.js
import React, {useState} from "react";
import "../App.css";

function VideoPlayers({onLogout}) {
    const [activeServer, setActiveServer] = useState("serverA");

    const handleServerChange = (server) => {
        setActiveServer(server);
    }

    return (<main>
        <div className="iframe-container">
            {/* Server buttons */}
            <div className="servers">
                <div
                    className={`serverBtn ${activeServer === "serverA" ? "active" : ""}`}
                    onClick={() => handleServerChange("serverA")}
                    style={
                        activeServer === "serverA"
                            ? {
                                backgroundColor: "var(--primary)",
                                color: "var(--secondary)",
                                borderColor: "var(--secondary)",
                                borderWidth: "2px",
                                borderStyle: "solid"
                            }
                            : {}
                    }
                >
                    Server A
                </div>
                <div
                    className={`serverBtn ${activeServer === "serverB" ? "active" : ""}`}
                    onClick={() => handleServerChange("serverB")}
                    style={
                        activeServer === "serverB"
                            ? {
                                backgroundColor: "var(--primary)",
                                color: "var(--secondary)",
                                borderColor: "var(--secondary)",
                                borderWidth: "2px",
                                borderStyle: "solid"
                            }
                            : {}
                    }
                >
                    Server B
                </div>
            </div>
            {/* Video players */}
            <div className="video-players">
                {activeServer === "serverA" && (
                    <iframe
                        className="youtube-iframe"
                        width="424"
                        height="240"
                        src="https://www.youtube.com/embed/OsRtgJP2R2A"
                        title=""
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                    ></iframe>
                )}
                {activeServer === "serverB" && (
                    <iframe
                        className="twitch-iframe"
                        src="https://player.twitch.tv/?channel=aceu&parent=localhost&muted=true&parent=bhyw-relay.vercel.app"
                        frameBorder="0"
                        allowFullScreen="true"
                        scrolling="no"
                    ></iframe>
                )}
            </div>
            <button id="logout-button" onClick={onLogout}>Logout</button>
        </div>
    </main>);
}

export default VideoPlayers;
