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
const enhanced_smart_object_tracker_1 = require("./helpers/enhanced-smart-object-tracker");
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
        this.isConnected = false;
        this.smartObjectTracker = new enhanced_smart_object_tracker_1.EnhancedSmartObjectTracker();
        this.boundOnError = this.onError.bind(this);
        this.boundOnConnect = this.onConnect.bind(this);
        this.boundOnClose = this.onClose.bind(this);
        this.boundOnData = this.onData.bind(this);
        this.boundDisconnect = this.disconnect.bind(this);
        debug("## starting ISC %o", options || "with no options");
        this.options = options;
        process.on("exit", this.boundDisconnect);
        this.serverStart(options);
    }
    serverStart(options) {
        const port = options?.port || 41794;
        this.server.listen(port, () => {
            debug("opened server on %o", this.server.address());
        });
        this.server.on("connection", (socket) => {
            debug("Connection from", socket.remoteAddress);
            if (this.socket) {
                this.socket.removeAllListeners();
            }
            this.socket = socket;
            this.isConnected = true;
            this.socket.on("error", this.boundOnError);
            this.socket.on("connect", this.boundOnConnect);
            this.socket.on("close", this.boundOnClose);
            this.socket.on("data", this.boundOnData);
            this.sendWhois();
        });
    }
    onConnect() {
        debug("## connection opened");
        this.isConnected = true;
        this.timer.start();
        this.emit("connect");
        this.pingsSent = 0;
    }
    onError(err) {
        debug("** socket error", err);
        this.isConnected = false;
        this.emit("error", err);
        this.timer.stop();
    }
    onClose() {
        debug("## connection closed");
        this.isConnected = false;
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
        this.isConnected = false;
        process.removeListener("exit", this.boundDisconnect);
        if (this.socket) {
            this.socket.removeListener("connect", this.boundOnConnect);
            this.socket.removeListener("data", this.boundOnData);
            this.socket.removeListener("close", this.boundOnClose);
            this.socket.removeListener("error", this.boundOnError);
            if (this.socket.destroy) {
                this.socket.destroy();
            }
        }
        if (this.server) {
            this.server.removeAllListeners();
            this.server.close();
        }
        if (this.timer) {
            this.timer.stop();
        }
    }
    isServerConnected() {
        return (this.isConnected &&
            this.socket &&
            !this.socket.destroyed &&
            this.socket.writable);
    }
    sendDigital(join, value) {
        if (!this.isServerConnected()) {
            debug("Cannot send digital: server not connected");
            return false;
        }
        debug("<= digital %d: %s", join, value ? "High" : "Low");
        const msg = cip_output_helper_1.CIPOutputHelper.digital({ join, data: value ? 1 : 0 });
        return this.write(msg);
    }
    sendAnalog(join, value) {
        if (!this.isServerConnected()) {
            debug("Cannot send analog: server not connected");
            return false;
        }
        debug("<= analog %d: %d", join, value);
        const msg = cip_output_helper_1.CIPOutputHelper.analog({ join, data: value });
        return this.write(msg);
    }
    sendSerial(join, value) {
        if (!this.isServerConnected()) {
            debug("Cannot send serial: server not connected");
            return false;
        }
        debug("<= serial %d: %s", join, value);
        const msg = cip_output_helper_1.CIPOutputHelper.serial({ join, data: value });
        return this.write(msg);
    }
    sendSmartObjectDigital(smartObjectId, join, value) {
        if (!this.isServerConnected()) {
            debug("Cannot send Smart Object digital: server not connected");
            return false;
        }
        debug("<= smart object %d.%d digital: %s", smartObjectId, join, value ? "High" : "Low");
        const msg = cip_output_helper_1.CIPOutputHelper.smartObjectDigital({
            smartObjectId,
            join,
            data: value,
        });
        return this.write(msg);
    }
    sendSmartObjectAnalog(smartObjectId, join, value) {
        if (!this.isServerConnected()) {
            debug("Cannot send Smart Object analog: server not connected");
            return false;
        }
        debug("<= smart object %d.%d analog: %d", smartObjectId, join, value);
        const msg = cip_output_helper_1.CIPOutputHelper.smartObjectAnalog({
            smartObjectId,
            join,
            data: value,
        });
        return this.write(msg);
    }
    sendSmartObjectSerial(smartObjectId, join, value) {
        if (!this.isServerConnected()) {
            debug("Cannot send Smart Object serial: server not connected");
            return false;
        }
        debug("<= smart object %d.%d serial: %s", smartObjectId, join, value);
        const msg = cip_output_helper_1.CIPOutputHelper.smartObjectSerial({
            smartObjectId,
            join,
            data: value,
        });
        return this.write(msg);
    }
    sendUpdateRequest() {
        if (!this.isServerConnected()) {
            debug("Cannot send update request: server not connected");
            return false;
        }
        debug("<= update request");
        const msg = Buffer.from([0x05, 0x00, 0x05, 0x00, 0x00, 0x02, 0x03, 0x00]);
        return this.write(msg);
    }
    write(buffer) {
        if (this.options && this.options.debug) {
            debug("<= [%d] %O", buffer.length, buffer);
        }
        if (!this.isConnected) {
            debug("Warn: Not connected to CIP server");
            return false;
        }
        if (!this.socket) {
            debug("Warn: Socket is null or undefined");
            this.isConnected = false;
            return false;
        }
        if (this.socket.destroyed) {
            debug("Warn: Socket is destroyed");
            this.isConnected = false;
            return false;
        }
        if (this.socket.readyState !== "open") {
            debug("Warn: Socket is not open (readyState: %s)", this.socket.readyState);
            this.isConnected = false;
            return false;
        }
        if (!this.socket.writable) {
            debug("Warn: Socket is not writable");
            this.isConnected = false;
            return false;
        }
        try {
            this.socket.write(buffer);
            return true;
        }
        catch (e) {
            const error = e;
            debug("Write error: %s", error.message);
            console.error("CIP Write error:", error.message);
            this.isConnected = false;
            return false;
        }
    }
    writeRaw(buffer) {
        if (this.options && this.options.debug) {
            debug("<= [%d] %O", buffer.length, buffer);
        }
        if (!this.socket) {
            debug("Warn: Socket is null or undefined");
            return false;
        }
        if (this.socket.destroyed) {
            debug("Warn: Socket is destroyed");
            return false;
        }
        if (this.socket.readyState !== "open") {
            debug("Warn: Socket is not open (readyState: %s)", this.socket.readyState);
            return false;
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
            const error = e;
            debug("Write error: %s", error.message);
            console.error("CIP Write error:", error.message);
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
            return this.writeRaw(PING_MESSAGE);
        }
        return false;
    }
    sendPong() {
        const PING_MESSAGE = Buffer.from([0x0e, 0x00, 0x02, 0x00, 0x00]);
        debug("<= pong response");
        return this.writeRaw(PING_MESSAGE);
    }
    sendWhois() {
        debug("<= whois request");
        return this.writeRaw(Buffer.from([0x0f, 0x00, 0x01, 0x02]));
    }
    sendAcceptConnection() {
        debug("<= sign in accepted");
        return this.writeRaw(Buffer.from([0x02, 0x00, 0x04, 0x00, 0x00, 0x00, 0x03]));
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
            this.writeRaw(message);
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
            case _1.CIP_MESSAGE_TYPES.UNICODE: {
                debug("=> unicode message");
                this.parseUnicodeMessage(payload);
                break;
            }
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
                this.parseSmartObject(payload);
                break;
            }
            default: {
                debug("** warning, unkown join event type", type.toString(16));
            }
        }
    }
    parseUnicodeMessage(payload) {
        if (payload.length < 8) {
            debug("** Error, Unicode payload too short", payload);
            return;
        }
        switch (payload[6]) {
            case 0x39: {
                const event = _1.CIPInputHelper.parseSmartObjectSerial(payload.slice(7));
                if (event) {
                    const result = this.smartObjectTracker.processEvent(event);
                    const enhancedEvent = result.originalEvent;
                    const smartObjectEvent = result.smartObjectEvent;
                    let debugMsg = `=> smart object serial ${enhancedEvent.smartObjectId}.${enhancedEvent.join}`;
                    if (enhancedEvent.smartObjectType === "page-reference" &&
                        enhancedEvent.currentPage !== undefined) {
                        debugMsg += ` (page ${enhancedEvent.currentPage})`;
                    }
                    debugMsg += `: ${enhancedEvent.data.toString()}`;
                    debug(debugMsg);
                    if (smartObjectEvent) {
                        debug(`   Smart Object Event: ${smartObjectEvent.description ||
                            `${smartObjectEvent.object}.${smartObjectEvent.subType}`}`);
                    }
                    this.emit("event", enhancedEvent);
                    if (smartObjectEvent) {
                        this.emit("smartObject", smartObjectEvent);
                    }
                }
                else {
                    debug("** Error parsing smart object serial payload", payload);
                }
                break;
            }
            default: {
                const join = (payload[7] << 8) + payload[8] + 1;
                const data = payload.slice(10).toString("latin1");
                debug("=> unicode serial %d: %s", join, data);
                this.emit("event", { join, data, type: "unicode" });
                break;
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
    registerSmartObject(smartObjectId, profile, config) {
        this.smartObjectTracker.registerSmartObject(smartObjectId, profile, config);
    }
    getSmartObjectCurrentPage(smartObjectId) {
        return this.smartObjectTracker.getCurrentPage(smartObjectId);
    }
    getRegisteredSmartObjects() {
        return this.smartObjectTracker.getRegisteredSmartObjects();
    }
    dynamicListSetItemCount(smartObjectId, itemCount) {
        if (!this.isServerConnected()) {
            debug("Cannot set dynamic list item count: server not connected");
            return false;
        }
        return this.write(cip_output_helper_1.CIPOutputHelper.dynamicListSetItemCount(smartObjectId, itemCount));
    }
    dynamicListSetItemText(smartObjectId, itemIndex, text) {
        if (!this.isServerConnected()) {
            debug("Cannot set dynamic list item text: server not connected");
            return false;
        }
        return this.write(cip_output_helper_1.CIPOutputHelper.dynamicListSetItemText(smartObjectId, itemIndex, text));
    }
    dynamicListSetItemEnabled(smartObjectId, itemIndex, enabled) {
        if (!this.isServerConnected()) {
            debug("Cannot set dynamic list item enabled: server not connected");
            return false;
        }
        return this.write(cip_output_helper_1.CIPOutputHelper.dynamicListSetItemEnabled(smartObjectId, itemIndex, enabled));
    }
    pageReferenceSelectPage(smartObjectId, pageNumber) {
        if (!this.isServerConnected()) {
            debug("Cannot select page reference page: server not connected");
            return false;
        }
        return this.write(cip_output_helper_1.CIPOutputHelper.pageReferenceSelectPage(smartObjectId, pageNumber));
    }
    pageReferenceSetButtonEnabled(smartObjectId, pageNumber, buttonNumber, enabled) {
        if (!this.isServerConnected()) {
            debug("Cannot set page reference button enabled: server not connected");
            return false;
        }
        return this.write(cip_output_helper_1.CIPOutputHelper.pageReferenceSetButtonEnabled(smartObjectId, pageNumber, buttonNumber, enabled));
    }
    pageReferenceSetButtonFeedback(smartObjectId, pageNumber, buttonNumber, highlighted) {
        if (!this.isServerConnected()) {
            debug("Cannot set page reference button feedback: server not connected");
            return false;
        }
        return this.write(cip_output_helper_1.CIPOutputHelper.pageReferenceSetButtonFeedback(smartObjectId, pageNumber, buttonNumber, highlighted));
    }
    pageReferenceSetButtonHighlight(smartObjectId, pageNumber, buttonNumber, highlighted) {
        if (!this.isServerConnected()) {
            debug("Cannot set page reference button highlight: server not connected");
            return false;
        }
        return this.write(cip_output_helper_1.CIPOutputHelper.pageReferenceSetButtonHighlight(smartObjectId, pageNumber, buttonNumber, highlighted));
    }
    buttonListSetText(smartObjectId, buttonIndex, text) {
        if (!this.isServerConnected()) {
            debug("Cannot set button list text: server not connected");
            return false;
        }
        return this.write(cip_output_helper_1.CIPOutputHelper.buttonListSetText(smartObjectId, buttonIndex, text));
    }
    buttonListSetEnabled(smartObjectId, buttonIndex, enabled) {
        if (!this.isServerConnected()) {
            debug("Cannot set button list enabled: server not connected");
            return false;
        }
        return this.write(cip_output_helper_1.CIPOutputHelper.buttonListSetEnabled(smartObjectId, buttonIndex, enabled));
    }
    keypadSendKey(smartObjectId, keyValue) {
        if (!this.isServerConnected()) {
            debug("Cannot send keypad key: server not connected");
            return false;
        }
        return this.write(cip_output_helper_1.CIPOutputHelper.keypadSendKey(smartObjectId, keyValue));
    }
    keypadSetDisplay(smartObjectId, displayText) {
        if (!this.isServerConnected()) {
            debug("Cannot set keypad display: server not connected");
            return false;
        }
        return this.write(cip_output_helper_1.CIPOutputHelper.keypadSetDisplay(smartObjectId, displayText));
    }
    keypadSetEnabled(smartObjectId, enabled) {
        if (!this.isServerConnected()) {
            debug("Cannot set keypad enabled: server not connected");
            return false;
        }
        return this.write(cip_output_helper_1.CIPOutputHelper.keypadSetEnabled(smartObjectId, enabled));
    }
    parseSmartObject(payload) {
        const event = _1.CIPInputHelper.parseSmartObject(payload);
        if (event) {
            const result = this.smartObjectTracker.processEvent(event);
            const enhancedEvent = result.originalEvent;
            const smartObjectEvent = result.smartObjectEvent;
            if (enhancedEvent.smartObjectId) {
                let debugMsg = `=> smart object ${enhancedEvent.smartObjectId}.${enhancedEvent.join} ${enhancedEvent.type}`;
                if (enhancedEvent.smartObjectType === "page-reference" &&
                    enhancedEvent.currentPage !== undefined) {
                    debugMsg += ` (page ${enhancedEvent.currentPage})`;
                }
                debugMsg += `: ${enhancedEvent.type === "digital"
                    ? enhancedEvent.data
                        ? "High"
                        : "Low"
                    : enhancedEvent.data.toString()}`;
                debug(debugMsg);
                if (smartObjectEvent) {
                    debug(`   Smart Object Event: ${smartObjectEvent.description ||
                        `${smartObjectEvent.object}.${smartObjectEvent.subType}`}`);
                }
            }
            else {
                debug("=> smart object %d %s: %s", enhancedEvent.join, enhancedEvent.type, enhancedEvent.type === "digital"
                    ? enhancedEvent.data
                        ? "High"
                        : "Low"
                    : enhancedEvent.data.toString());
            }
            this.emit("event", enhancedEvent);
            if (smartObjectEvent) {
                this.emit("smartObject", smartObjectEvent);
            }
        }
        else {
            debug("** Error parsing smart object payload", payload);
            this.emit("error", new Error("Error parsing smart object payload"));
        }
    }
}
exports.default = CIPServer;
