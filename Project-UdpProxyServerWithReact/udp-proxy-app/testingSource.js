const dgram = require('dgram');
const client = dgram.createSocket('udp4');

const PORT = 60001;
let sequenceNumber = 0;
const destIP = '192.168.1.100'; // proxy ip

// Listen for messages
client.on('message', (msg, target) => {
  const receivedMessage = JSON.parse(msg.toString());
  console.log('Received message:', receivedMessage, 'from', target.address);
});

// Bind the client socket to listen for incoming messages on PORT
client.bind(PORT, () => {
  console.log(`Client is listening on port ${PORT}`);
});

const sendMessages = () => {
  const messages = ['Hello', 'Testing', 'This is a message'];
  const interval = setInterval(() => {
    const message = {
      seqNum: sequenceNumber++,
      content: messages[Math.floor(Math.random() * messages.length)],
    };

    const messageString = JSON.stringify(message);

    client.send(messageString, PORT, destIP, (err) => {
      if (err) {
        console.error('Error sending message:', err);
      } else {
        console.log('Message sent:', messageString);
      }
    });
  }, 10000); // 10 seconds

  // No longer closing the client after a certain period
  // setTimeout(() => {
  //   clearInterval(interval);
  //   client.close();
  // }, 1000000); // 1000 seconds
};

// Start sending and receiving messages
sendMessages();
