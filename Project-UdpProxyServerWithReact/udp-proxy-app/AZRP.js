class AZRP {
    constructor(payload, sequenceNumber, length, checksum, flags) {
        this.payload = payload;
        this.sequenceNumber = sequenceNumber;
        this.length = length;
        this.checksum = checksum;
        this.flags = flags;
    }

    static fromBytes(data) {
        const buffer = Buffer.from(data);
        let offset = 0;

        const flagsInt = buffer.readInt32BE(offset);
        offset += 4;

        const sequenceNumber = buffer.readInt32BE(offset);
        offset += 4;

        const length = buffer.readInt32BE(offset);
        offset += 4;

        const checksum = buffer.readInt32BE(offset);
        offset += 4;

        const payloadLength = flagsInt === 0 ? length : 3;
        const payload = buffer.slice(offset, offset + payloadLength);

        // Convert the flags integer to an array of booleans
        const flags = Array.from({ length: 2 }, (_, i) => (flagsInt & (1 << i)) !== 0);

        return new AZRP(payload, sequenceNumber, length, checksum, flags);
    }

    toString() {
        return `AZRP(${this.payload.toString()}, ${this.sequenceNumber}, ${this.length}, ${this.checksum}, ${this.flags})`;
    }
}

module.exports = AZRP;
