const dgram = require("dgram");
const client = dgram.createSocket("udp4");

const PORT = 60002;
const destIP = '192.168.1.100'; // proxy ip

// Listen for messages
client.on("message", (message, remote) => {
  try {
    const receivedMessage = JSON.parse(message.toString());
    console.log("Received message:", receivedMessage);

    const ack = {
      seqNum: receivedMessage.seqNum,
      content: "ACK",
    };
    const ackString = JSON.stringify(ack);

    // Send ACK back to the source
    client.send(ackString, PORT, remote.address, (err) => {
      if (err) {
        console.error("Error sending ACK:", err);
      } else {
        console.log("ACK sent:", ackString);
      }
    });
  } catch (error) {
    console.error("Error processing message:", error);
  }
});

// Bind the client socket to listen for incoming messages on PORT
client.bind(PORT, () => {
  console.log(`Client is listening on port ${PORT}`);
});