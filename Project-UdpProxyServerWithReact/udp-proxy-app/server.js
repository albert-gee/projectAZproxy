const http = require("http");
const WebSocket = require("ws");
const dgram = require("dgram");

const server = http.createServer();
const wss = new WebSocket.Server({ server });

// Proxy setting defaults
let dropSenderData = 0.0;
let dropReceiverAcks = 0.0;
let delaySenderPacketsMillisconds = 0;
let delayReceiverPacketsMilliseconds = 0;
let delaySenderPacketsFrequency = 0.0;
let delayReceiverPacketsFrequency = 0.0;

// TARGET AND SOURCE MUST BE DIFFERENT COMPUTERES
// -- Or the functions will pick up their own forwarded messages
let listeningIpAddress = "192.168.1.100";
let targetIpAddress = "192.168.1.152";
let sourceIpAddress = "192.168.1.152";

let sourcePort = 60001;
let targetPort = 60002;

const reactWebsocketPort = 60000;
const udpSource = dgram.createSocket("udp4");
const udpTarget = dgram.createSocket("udp4");

wss.on("connection", (ws) => {
  console.log("WebSocket connection established");

  ws.on("message", (message) => {
    const data = JSON.parse(message);
    console.log("Received WebSocket message:", JSON.stringify(data));
    if (data.type === "settings") {
      if (data.direction === "source") {
        dropSenderData = data.loss / 100;
        delaySenderPacketsMillisconds = data.delayTime;
        delaySenderPacketsFrequency = data.delayFreq / 100;
      }
      if (data.direction === "target") {
        dropReceiverAcks = data.loss / 100;
        delayReceiverPacketsMilliseconds = data.delayTime;
        delayReceiverPacketsFrequency = data.delayFreq / 100;
      }
    }
  });
});

udpSource.on("message", (message, remote) => {
  if (remote.address !== listeningIpAddress) {
    console.log(`Source - Message: ${message}, Remote: ${remote}`);

    if (Math.random() > dropSenderData) {
      // Pass data to target and update react

      // Update react
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          // Update react with message received
          client.send(
            JSON.stringify({
              type: "message",
              content: message.toString(),
              direction: "source",
            })
          );
        }
      });

      // Handle Delay
      const delay =
        Math.random() < delaySenderPacketsFrequency
          ? delaySenderPacketsMillisconds
          : 0;
      if (delay > 0) {
        let messageObj = JSON.parse(message);
        messageObj.delayed = `${delaySenderPacketsMillisconds}ms`;
        message = JSON.stringify(messageObj);

        // update react with delayed message
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            // Update react with message received
            client.send(
              JSON.stringify({
                type: "delayedMessage",
                content: message.toString(),
                direction: "source",
              })
            );
          }
        });
      }

      setTimeout(() => {
        // delay based on frequencey and milliseconds
        // Pass send message on to target
        udpTarget.send(message, targetPort, targetIpAddress, (error) => {
          if (error) {
            console.error("Error sending UDP message to target:", error);
          }
        });
      }, delay);
      // Add message to prevent reading same message
    } else {
      console.log("Dropped sender data");
      // Drop packet, update react
      wss.clients.forEach((client) => {
        client.send(
          JSON.stringify({
            type: "lostMessage",
            content: message.toString(),
            direction: "source",
          })
        );
      });
    }
  }
});

udpTarget.on("message", (message, remote) => {
  if (remote.address !== listeningIpAddress) {
    console.log(`Source - Message: ${message}, Remote: ${remote}`);

    if (Math.random() > dropReceiverAcks) {
      // Send ACK to target and update react

      //react
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              type: "message",
              content: message.toString(),
              direction: "target",
            })
          );
        }
      });

      // Set delay
      const delay =
        Math.random() < delayReceiverPacketsFrequency
          ? delayReceiverPacketsMilliseconds
          : 0;
      if (delay > 0) {
        let messageObj = JSON.parse(message);
        messageObj.delayedBy = `${delayReceiverPacketsMilliseconds}ms`;
        message = JSON.stringify(messageObj);
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "delayedMessage",
                content: message.toString(),
                direction: "target",
              })
            );
          }
        });
      }

      setTimeout(() => {
        //upd forwarding
        udpSource.send(message, sourcePort, sourceIpAddress, (error) => {
          if (error) {
            console.error("Error sending UDP message to source:", error);
          }
        });
      }, delay);
    } else {
      console.log("Dropping Receiver Acknowedgement");
      // Drop packet, update react
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              type: "lostMessage",
              content: message.toString(),
              direction: "target",
            })
          );
        }
      });
    }
  }
});

// REACT
server.listen(reactWebsocketPort, () => {
  console.log(`REACT Websocket is running on 127.0.0.1:${reactWebsocketPort}`);
});

// UDP CONNECTIONS
udpSource.bind(sourcePort, listeningIpAddress, () => {
  console.log(
    `UDP SOURCE Server listening on ${listeningIpAddress}:${sourcePort}`
  );
});

udpTarget.bind(targetPort, listeningIpAddress, () => {
  console.log(
    `UDP TARGET Server listening on ${listeningIpAddress}:${targetPort}`
  );
});
