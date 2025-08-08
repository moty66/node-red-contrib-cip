"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const net_1 = __importDefault(require("net"));
const events_1 = require("events");
const debug_1 = __importDefault(require("debug"));
const cip_output_helper_1 = require("./helpers/cip-output.helper");
const debug = (0, debug_1.default)("CIP");
const PING_INTERVAL = 10000;
const PING_LOST_BEFORE_DISCONNECT = 5;
class CIPServer extends events_1.EventEmitter {
    constructor(options) {
        super();
        this.server = net_1.default.createServer({});
        this.socket = new net_1.default.Socket();
        this.timer = new _1.IntervalTimer(this.sendPing.bind(this), PING_INTERVAL);
        this.buffer = Buffer.alloc(0);
        this.pingsSent = 0;
        debug("## starting ISC %o", options || "with no options");
        this.options = options;
        process.on("exit", this.disconnect.bind(this));
        this.serverStart(options);
    }
    serverStart(options) {
        const port = options?.port || 41794;
        this.server.listen(port, () => {
            debug("opened server on %o", this.server.address());
        });
        this.server.on("connection", (socket) => {
            debug("Connection from", socket.remoteAddress);
            this.socket = socket;
            this.socket.on("error", this.onError.bind(this));
            this.socket.on("connect", this.onConnect.bind(this));
            this.socket.on("close", this.onClose.bind(this));
            this.socket.on("data", this.onData.bind(this));
            this.sendWhois();
        });
    }
    onConnect() {
        debug("## connection opened");
        this.timer.start();
        this.emit("connect");
        this.pingsSent = 0;
    }
    onError(err) {
        debug("** socket error", err);
        this.emit("error", err);
        this.timer.stop();
    }
    onClose() {
        debug("## connection closed");
        this.timer.stop();
        this.emit("close");
        this.pingsSent = 0;
    }
    onData(data) {
        this.pingsSent = 0;
        if (this.options && this.options.debug) {
            debug("=> [%d] %O", data.length, data);
        }
        this.timer.restart();
        this.append(data);
    }
    connect(options) {
        if (undefined !== options) {
            this.options = options;
        }
        if (undefined === this.options) {
            return false;
        }
        debug("## connecting. %o...", this.options);
        return false;
    }
    disconnect() {
        debug("## disconnecting socket and server");
        if (this.socket) {
            this.socket.removeListener("connect", this.onConnect.bind(this));
            this.socket.removeListener("data", this.onData.bind(this));
            this.socket.removeListener("close", this.onClose.bind(this));
            this.socket.removeListener("error", this.onError.bind(this));
            if (this.socket.destroy) {
                this.socket.destroy();
            }
        }
        if (this.server) {
            this.server.close();
        }
        if (this.timer) {
            this.timer.stop();
        }
    }
    sendDigital(join, value) {
        debug("<= digital %d: %s", join, value ? "High" : "Low");
        const msg = cip_output_helper_1.CIPOutputHelper.digital({ join, data: value ? 1 : 0 });
        return this.write(msg);
    }
    sendAnalog(join, value) {
        debug("<= analog %d: %d", join, value);
        const msg = cip_output_helper_1.CIPOutputHelper.analog({ join, data: value });
        return this.write(msg);
    }
    sendSerial(join, value) {
        debug("<= serial %d: %s", join, value);
        const msg = cip_output_helper_1.CIPOutputHelper.serial({ join, data: value });
        return this.write(msg);
    }
    sendUpdateRequest() {
        debug("<= update request");
        const msg = Buffer.from([0x05, 0x00, 0x05, 0x00, 0x00, 0x02, 0x03, 0x00]);
        return this.write(msg);
    }
    write(buffer) {
        if (this.options && this.options.debug) {
            debug("<= [%d] %O", buffer.length, buffer);
        }
        if (!this.socket.writable) {
            debug("Warn: Socket is not writable");
            return false;
        }
        try {
            this.socket.write(buffer);
            return true;
        }
        catch (e) {
            console.error("Write error", e.message);
            return false;
        }
    }
    append(bytes) {
        this.buffer = Buffer.concat([this.buffer, bytes]);
        this.processBuffer();
    }
    sendPing() {
        if (this.socket.writable) {
            if (this.pingsSent >= PING_LOST_BEFORE_DISCONNECT) {
                debug("ping timeout after %i cycles", PING_LOST_BEFORE_DISCONNECT);
                this.socket.end();
                return false;
            }
            this.pingsSent++;
            const PING_MESSAGE = Buffer.from([0x0d, 0x00, 0x02, 0x00, 0x00]);
            debug("<= ping request n° %d", this.pingsSent);
            return this.write(PING_MESSAGE);
        }
        return false;
    }
    sendPong() {
        const PING_MESSAGE = Buffer.from([0x0e, 0x00, 0x02, 0x00, 0x00]);
        debug("<= pong response");
        return this.write(PING_MESSAGE);
    }
    sendWhois() {
        debug("<= whois request");
        return this.write(Buffer.from([0x0f, 0x00, 0x01, 0x02]));
    }
    sendAcceptConnection() {
        debug("<= sign in accepted");
        return this.write(Buffer.from([0x02, 0x00, 0x04, 0x00, 0x00, 0x00, 0x03]));
    }
    sendIPID() {
        if (this.socket.writable && this.options) {
            const message = Buffer.from([
                0x0a,
                0x00,
                0x0b,
                0x00,
                this.options.ipid,
                0xa3,
                0x42,
                0x40,
                0x02,
                0x00,
                0x00,
                0xd1,
                0x01,
                0x00,
            ]);
            debug("<= ipid", this.options.ipid);
            this.write(message);
        }
        else {
            debug("** Not connected");
        }
    }
    processBuffer() {
        if (this.buffer.length < 4) {
            debug("## buffer is too short!", this.buffer);
            return;
        }
        if (this.buffer.length >= 3 &&
            this.buffer[1] === 0x00 &&
            this.buffer[2] !== 0x00 &&
            this.buffer.length > this.buffer[2] + 2) {
            const message = this.buffer.slice(0, this.buffer[2] + 3);
            const type = message[0];
            const length = message[2];
            this.buffer = this.buffer.slice(length + 3);
            const payload = message.slice(3, length + 3);
            this.processPayload(type, payload);
            if (this.buffer[2] && this.buffer.length > this.buffer[2] + 2) {
                this.processBuffer();
            }
        }
        else {
            if (this.buffer[2] && this.buffer.length > this.buffer[2] + 2) {
                debug("** wrong buffer data, removing 1 byte from", this.buffer);
                this.buffer = this.buffer.slice(1);
            }
            else {
                debug("** incomplete data, waiting for new chunk");
            }
        }
    }
    processPayload(type, payload) {
        if (payload.length === 0) {
            debug("** Error, Payload is empty");
        }
        switch (type) {
            case _1.CIP_MESSAGE_TYPES.ACK: {
                debug("Payload type: ACK");
                break;
            }
            case _1.CIP_MESSAGE_TYPES.CLIENT_SIGNON:
            case _1.CIP_MESSAGE_TYPES.SERVER_SIGNON: {
                debug("=> sign in");
                this.sendAcceptConnection();
                setTimeout(() => this.sendUpdateRequest(), 100);
                break;
            }
            case _1.CIP_MESSAGE_TYPES.CONN_ACCEPTED: {
                debug("=> accepted");
                this.sendUpdateRequest();
                this.emit("accepted");
                break;
            }
            case _1.CIP_MESSAGE_TYPES.CONN_REFUSED: {
                debug("=> refused");
                this.emit("refused");
                break;
            }
            case _1.CIP_MESSAGE_TYPES.UNICODE:
            case _1.CIP_MESSAGE_TYPES.JOIN_EVENT: {
                debug("=> event");
                this.parseEvent(payload);
                break;
            }
            case _1.CIP_MESSAGE_TYPES.PING: {
                debug("=> ping");
                this.sendPong();
                break;
            }
            case _1.CIP_MESSAGE_TYPES.PONG: {
                debug("=> pong");
                this.pingsSent--;
                break;
            }
            case _1.CIP_MESSAGE_TYPES.WHOIS: {
                debug("=> whois");
                this.sendIPID();
                break;
            }
            default: {
                debug("** warning, unkown or not implemented header type", type);
            }
        }
    }
    parseEvent(message) {
        let length = 0;
        let type = 0x00;
        let payload = Buffer.alloc(0);
        if (message.length > 5 && message[2] === 0 && message[4] === 0x34) {
            length = message[3];
            type = message[4];
            payload = message.slice(5, length + 4);
        }
        else {
            length = message[2];
            type = message[3];
            payload = message.slice(4, length + 3);
        }
        if (undefined === type) {
            debug("** warning, unknow event data %o", message);
            return;
        }
        switch (type) {
            case _1.CIP_JOIN_TYPES.DIGITAL:
            case _1.CIP_JOIN_TYPES.DIGITAL_0x27: {
                this.parseDigitalInput(payload);
                break;
            }
            case _1.CIP_JOIN_TYPES.TIME_SYNC: {
                this.parseTimeSync(payload);
                break;
            }
            case _1.CIP_JOIN_TYPES.ANALOG:
            case _1.CIP_JOIN_TYPES.ANALOG_0x14: {
                this.parseAnalogInput(payload);
                break;
            }
            case _1.CIP_JOIN_TYPES.SERIAL:
            case _1.CIP_JOIN_TYPES.SERIAL_0x12:
            case _1.CIP_JOIN_TYPES.SERIAL_0x15: {
                this.parseSerialInput(payload);
                break;
            }
            case _1.CIP_JOIN_TYPES.SERIAL_UNICODE: {
                this.parseSerialUnicodeInput(payload);
                break;
            }
            case _1.CIP_JOIN_TYPES.UPDATE: {
                this.parseUpdateResponse(payload);
                break;
            }
            case _1.CIP_JOIN_TYPES.SMART_OBJECT: {
                debug("** warning, smart object are not implemented yet", payload);
                break;
            }
            default: {
                debug("** warning, unkown join event type", type.toString(16));
            }
        }
    }
    parseTimeSync(payload) {
        const hour = payload[1].toString(16);
        const minute = payload[2].toString(16);
        const second = payload[3].toString(16);
        const month = payload[4].toString(16);
        const day = payload[5].toString(16);
        const year = payload[6].toString(16);
        debug("=> Time Sync %s-%s-%s %s:%s:%s", day, month, year, hour, minute, second);
    }
    parseUpdateResponse(payload) {
        if (payload[0] === 0x00) {
            debug("=> update strated");
            this.emit("update", { status: "start" });
        }
        else if (payload[0] === 0x16) {
            debug("=> update ended");
            this.emit("update", { status: "end" });
        }
        else if (payload[0] === 0x1c) {
            debug("=> ready for new update request");
            this.emit("update", { status: "ready" });
        }
        else {
            debug("** Error, unknow update type", payload[0]);
            this.emit("update", { status: "error" });
        }
    }
    parseSerialInput(payload) {
        const event = _1.CIPInputHelper.parseSerialInput(payload);
        debug("=> serial %d: %s", event.join, event.data.toString());
        this.emit("event", event);
    }
    parseSerialUnicodeInput(payload) {
        const event = _1.CIPInputHelper.parseSerialInput(payload);
        debug("=> unicode %d: %s", event.join, event.data.toString());
        this.emit("event", event);
    }
    parseAnalogInput(payload) {
        while (payload.length > 0) {
            const event = _1.CIPInputHelper.parseAnalogInput(payload.slice(0, 4));
            payload = payload.slice(4);
            debug("=> analog %d: %d", event.join, event.data);
            this.emit("event", event);
        }
    }
    parseDigitalInput(payload) {
        while (payload.length > 0) {
            const event = _1.CIPInputHelper.parseDigitalInput(payload.slice(0, 2));
            payload = payload.slice(2);
            debug("=> digital %d: %s", event.join, event.data ? "High" : "Low");
            this.emit("event", event);
        }
    }
}
exports.default = CIPServer;
//# sourceMappingURL=cip-server.js.map