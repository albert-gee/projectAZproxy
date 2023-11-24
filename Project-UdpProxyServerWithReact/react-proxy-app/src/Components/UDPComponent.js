import React, { useState, useEffect } from "react";

const UDPComponent = ({ localPort, direction, sharedWebSocket }) => {
  const [messages, setMessages] = useState([]);
  const [lostMessages, setLostMessages] = useState([]);
  const [delayedMessages, setDelayedMessages] = useState([]);

  const [loss, setLoss] = useState(0);
  const [delay, setDelay] = useState(0); // Milli
  const [delayFreq, setDelayFreq] = useState(0);

  useEffect(() => {
    const handleOpen = () => {
      console.log("WebSocket connection opened");
    };

    const handleMessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "message" && data.direction === direction) {
        setMessages((prevMessages) => [...prevMessages, data.content]);
      }
      if (data.type === "lostMessage" && data.direction === direction) {
        console.log("Received lost message:", data.content);
        setLostMessages((prevMessages) => [...prevMessages, data.content]);
      }
      if (data.type === "delayedMessage" && data.direction === direction) {
        console.log("Received lost message:", data.content);
        setDelayedMessages((prevMessages) => [...prevMessages, data.content]);
      }
    };

    sharedWebSocket.addEventListener("open", handleOpen);
    sharedWebSocket.addEventListener("message", handleMessage);

    return () => {
      sharedWebSocket.removeEventListener("open", handleOpen);
      sharedWebSocket.removeEventListener("message", handleMessage);
      // Is shared, keep open
    };
  }, [direction, sharedWebSocket]);

  useEffect(() => {
    const sendSettings = () => {
      if (sharedWebSocket.readyState === WebSocket.OPEN) {
        const settings = {
                type: "settings",
                direction,
                loss: loss,
                delayTime: delay,
                delayFreq: delayFreq,
              };
        sharedWebSocket.send(JSON.stringify(settings));
      } else if (sharedWebSocket.readyState === WebSocket.CONNECTING) {
        // wait and retry
        setTimeout(sendSettings, 100);
      } else {
        console.error("WebSocket connection not open");
      }
    };

    sendSettings(); // Send settings on initial render

    // Send settings whenever they change
    const timeoutId = setTimeout(() => {
      sendSettings();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [loss, delay, delayFreq, direction, sharedWebSocket]);

  return (
    <div className="UDPComponent">
      <h2>
        {direction === "source" ? "Source" : "Target"} Box (Local Port:{" "}
        {localPort})
      </h2>
      <h3>Settings:</h3>
      <div className="UDPComponentSettings">
        <label>
          Loss %:
          <input
            type="range"
            name="rangeInput"
            min="0"
            max="100"
            step="1"
            value={loss}
            onChange={(e) => setLoss(parseFloat(e.target.value))}
          />
          <span id="selectedValue">{loss}%</span>
        </label>
        <label>
          Delay ms:
          <input
            type="range"
            name="rangeInput"
            min="0"
            max="10000"
            step="10"
            value={delay}
            onChange={(e) => setDelay(parseInt(e.target.value))}
          />
          <span id="selectedValue">{delay}ms</span>
        </label>
        <label>
          Delay freq %:
          <input
            type="range"
            name="rangeInput"
            min="0"
            max="100"
            step="1"
            value={delayFreq}
            onChange={(e) => setDelayFreq(parseFloat(e.target.value))}
          />
          <span id="selectedValue">{delayFreq}%</span>
        </label>
      </div>
      <label>
      </label>
      <h3>Received Messages:</h3>
      <div className="MessageBox">
        <ol>
          {messages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ol>
      </div>
      <h3>But misplaced these ones:</h3>
      <div className="MessageBox">
        <ol>
          {lostMessages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ol>
      </div>
      <h3>And these were delayed:</h3>
      <div className="MessageBox">
        <ol>
          {delayedMessages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default UDPComponent;
