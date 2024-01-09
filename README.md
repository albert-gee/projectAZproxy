# Proxy

## Overview

The proxy acts as an intermediate node between the Sender and Receiver in "Project AZ". It is responsible for introducing network issues such as random data loss, dropped acknowledgments, and packet delays.

The proxy sets the % chance to drop data, drop acks, delay data, and delay acks on the command line.

The proxy has a frontend and backend that communicate via a WebSocket:

- **React Frontend:** Handles UI and controls UDP proxy parameters.
- **Nodejs Backend:** Manages UDP communication and updates UI with packet information.

The proxy can adjust loss rate, delay in milliseconds, and delay frequency separately for each end. Using WebSockets, it communicates directly with the UDP backend, which handles the actual UDP communication to the source and target.

The proxy is made in two parts, both built off of JavaScript Node.js.

## Design

**nodejs UDP server - udp-proxy-app/server.js**

The application creates two UDP sockets, one for the source and one for the target, as well as a WebSocket for communication with the frontend application for live changes to the delay/drop rates and delay time. The program uses a component `AZRP` to convert the byte data to a class with a `toString()` for representation on the UI. The program logs the statistics individually for the source (sender) and target (receiver).

On the interface, there are two components on the screen for the target and source, which are implementations of the class `UDPComponent` in React.

*(Please note that if the React webpage is restarted, and UDP is not, React will only show packets since the page refresh. But UDP session via server.js runtime is what is considered the UDP running session (for logging). So, React is a visual inspector and controller but is not being updated with historical data for user review. It is giving you a live window into UDP operations and is not coupled to data beyond that. Check the log for full session details.)*

## Running Proxy Application

There are two applications that need to be run separately; it does not matter which you start first:

1. In `react-proxy-app/`, run the following command to start the user interface:
    ```
    npm start
    ```

2. For the UDP backend, from within `udp-proxy-app/`, run:
    ```
    node server <receiving ip address> <send to port> <receive from port>
    ```
    Example:
    ```
    node server fe80::fe80:fe80:fe80:fe80 60001 60002
    ```

    It doesn’t matter which you enter with an IPv4 or IPv6 address; however, you must manually change the `listeningIpAddress` to the host computer's outward-facing IP address (line 20). I might have added it as a command argument but just wanted to follow the instructions exactly.

# GUI

The GUI is a React application. It graphs the data on the sender, receiver, and proxy (this part can use TCP, depending on how it is designed).

# "Project AZ" 

## Overview

"Project AZ" is an implementation of a custom reliable data transfer protocol named **AZRP**. This protocol is built on top of UDP and designed to provide reliability and efficient communication in diverse network environments.

The project comprises four key applications:

- **[Sender](https://github.com/albert-gee/projectAZsender):** The initiator of data transmission, responsible for sending packets using the AZRP protocol.
- **[Receiver](https://github.com/albert-gee/projectAZreceiver):** Responsible for receiving packets transmitted using the AZRP protocol.
- **[Proxy](https://github.com/albert-gee/projectAZproxy):** Acts as an intermediary between the Sender and Receiver, simulating a lossy network environment.
- **[GUI](https://github.com/albert-gee/projectAZproxy):** Provides a user-friendly interface for interacting with the AZRP protocol.

The project is compatible with both IPv4 and IPv6, ensuring that it can work in different network environments.

## AZRP Protocol

**AZRP** is built on top of UDP, leveraging its simplicity and low overhead. The integration ensures compatibility with existing UDP-based applications while enhancing reliability. By addressing the challenges inherent in UDP and incorporating sophisticated error recovery mechanisms, AZRP aims to provide a dependable solution for data transmission in diverse network environments.

### Packet Structure

Each packet consists of a header and a data payload. The header includes four integer fields:

- Sequence number
- Length
- Checksum
- Flags representing packet type (e.g., SYN, ACK)

The total size of the packet header is 19 bytes, and the maximum packet size is 1500 bytes.

### Packet Types

Flags in the header indicate the type of packet (SYN, ACK). The protocol supports four types of packets:

- **Data:** Used for transmitting data (both flags are false).
- **SYN (Synchronise):** Used for initiating a connection. Includes the initial sequence number, the length of the whole message to be sent, and the file extension in the data payload.
- **SYN-ACK (Synchronise-Acknowledge):** Used to acknowledge a SYN packet. It must include the same sequence number, length, checksum, and the file extension as the corresponding SYN packet.
- **ACK (Acknowledgement):** Used to acknowledge receiving a data packet. Must include the same sequence number and checksum as the corresponding data packet.

### Checksum Calculation

The checksum of the packet's data is calculated using the CRC32 algorithm. It is used for error detection, ensuring data integrity during transmission.

### Security

The `generateInitialSequenceNumber` method in the AZRP protocol ensures the secure creation of an initial sequence number for SYN packets. It employs the `SecureRandom` class to generate cryptographically secure random bytes, which are then combined to form a non-negative integer. This secure sequence number is vital for the AZRP protocol, enhancing the unpredictability and resistance to attacks during the establishment of connections, contributing to the overall security and reliability of the communication channel.

### Example of Usage

```java
// Creating a data packet
AZRP dataPacket = AZRP.data("Hello, World!".getBytes(), 1, 13);

// Serializing the packet to bytes
byte[] serializedData = dataPacket.toBytes();

// Deserializing the bytes back into an AZRP object
AZRP receivedPacket = AZRP.fromBytes(serializedData);
```
