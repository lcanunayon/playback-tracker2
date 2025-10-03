import React, { useEffect, useState } from "react";

const CLIENT_ID = "1ecad2e6a16241d39d538144ea3f2801";
const REDIRECT_URI = "https://lcanunayon.github.io/spotify-top-tracker";
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";
const SCOPES = ["user-read-currently-playing", "user-read-playback-state"];

function App() {
  const [token, setToken] = useState("");
  const [plays, setPlays] = useState({});
  const [topSongs, setTopSongs] = useState([]);

  useEffect(() => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem("token");

    if (!token && hash) {
      token = hash
        .substring(1)
        .split("&")
        .find(elem => elem.startsWith("access_token"))
        .split("=")[1];

      window.location.hash = "";
      window.localStorage.setItem("token", token);
    }

    setToken(token);
  }, []);

  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      fetch("https://api.spotify.com/v1/me/player/currently-playing", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.item) {
            const song = data.item.name + " – " + data.item.artists[0].name;

            setPlays(prev => {
              const updated = { ...prev };
              updated[song] = (updated[song] || 0) + 1;

              const sorted = Object.entries(updated).sort((a, b) => b[1] - a[1]);
              setTopSongs(sorted);

              return updated;
            });
          }
        })
        .catch(err => console.error("Error fetching track:", err));
    }, 5000);

    return () => clearInterval(interval);
  }, [token]);

  const logout = () => {
    setToken("");
    window.localStorage.removeItem("token");
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", textAlign: "center", padding: "2rem" }}>
      <h1>Spotify Play Tracker</h1>
      <p>Tracks how many times each song is played while this app is running. Data is pulled live from your Spotify account.</p>

      {!token ? (
        <a
          href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPES.join("%20")}`}
          style={{ padding: "10px 20px", background: "#1DB954", color: "white", borderRadius: "20px", textDecoration: "none" }}
        >
          Connect with Spotify
        </a>
      ) : (
        <button onClick={logout} style={{ marginBottom: "20px", padding: "10px 20px" }}>
          Logout
        </button>
      )}

      <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "left" }}>
        {topSongs.map(([song, count]) => (
          <div key={song} style={{ margin: "10px 0" }}>
            <strong>{song}</strong>
            <div
              style={{
                background: "#1DB954",
                width: `${count * 20}px`,
                height: "10px",
                display: "inline-block",
                marginLeft: "10px"
              }}
            ></div>
            <span style={{ marginLeft: "10px" }}>{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;