import React, { useState } from "react";
import UDPComponent from "./Components/UDPComponent";
import "./App.css";

const sharedWebSocket = new WebSocket("ws://localhost:60000");

const App = () => {
  // const [targetIP, setTargetIP] = useState("127.0.0.1");
  const [targetPort, setTargetPort] = useState(60002); // this isn't really adjustable anymore, just use these ports
  const [sourcePort, setSourcePort] = useState(60001); // this isn't really adjustable anymore, just use these ports

  return (
    <div className="App">
      <header>
        <header>
          <h1>Packet Checkpoint</h1>
        </header>
      </header>
      <div className="AppBody">
        <div className="Settings">
          <label>
            Source Port:
            <input
              disabled
              type="number"
              value={sourcePort}
              onChange={(e) => setSourcePort(e.target.value)}
            />
          </label>
          <label>
            Target Port:
            <input
              disabled
              type="number"
              value={targetPort}
              onChange={(e) => setTargetPort(e.target.value)}
            />
          </label>
        </div>
        <div className="UDPComponents">
          <UDPComponent
            localPort={sourcePort}
            direction="source"
            sharedWebSocket={sharedWebSocket}
          />
          <UDPComponent
            localPort={targetPort}
            direction="target"
            sharedWebSocket={sharedWebSocket}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
