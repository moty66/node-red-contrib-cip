"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketReconnect = exports.SOCKET_RECONNECT_RETRY_AFTER_DEFAULT = void 0;
const net = __importStar(require("net"));
const debug_1 = __importDefault(require("debug"));
const debug = (0, debug_1.default)("socket-reconnect");
exports.SOCKET_RECONNECT_RETRY_AFTER_DEFAULT = 1000;
class SocketReconnect extends net.Socket {
    constructor(options) {
        super(options);
        this.connected = false;
        this.connectionClosing = false;
        this.timeoutValue = 0;
        this.options = options;
        this.on("connect", this.onConnect.bind(this));
        this.on("close", this.onClose.bind(this));
        debug("listening to connect and close socket events");
    }
    onClose() {
        debug("## socket closed");
        this.connected = false;
        if (this.options && this.options.reconnect) {
            this.reconnect();
        }
    }
    onConnect() {
        debug("## socket connected");
        this.connected = true;
        clearTimeout(this.reconnectTimeoutId);
        const _prevTimeout = this.timeoutValue;
        super.setTimeout(0);
        this.timeoutValue = _prevTimeout;
    }
    reconnect() {
        const timeout = this.options && this.options.retryAfter
            ? this.options.retryAfter
            : exports.SOCKET_RECONNECT_RETRY_AFTER_DEFAULT;
        debug("## reconnect after %ims, timeout %ims", timeout, this.timeoutValue);
        this.reconnectTimeoutId = setTimeout(() => this.connectTo(this.port, this.host, this.connectionListener), timeout);
    }
    connectTo(port, host, connectionListener) {
        debug("## connecting");
        this.port = port;
        this.host = host;
        if (connectionListener !== undefined) {
            this.connectionListener = connectionListener;
        }
        this.connectionClosing = false;
        if (this.timeoutValue >= 0) {
            super.setTimeout(this.timeoutValue, this.timeoutCallback);
        }
        if (this.port === undefined || this.host === undefined) {
            throw new Error("Port and host must be provided");
        }
        return super.connect(this.port, this.host, this.connectionListener);
    }
    disconnect() {
        debug("## end");
        if (this.connectionClosing) {
            return this;
        }
        this.connectionClosing = true;
        clearTimeout(this.reconnectTimeoutId);
        this.removeListener("close", this.onClose.bind(this));
        this.removeListener("connect", this.onConnect.bind(this));
        super.end();
        return this;
    }
    setTimeoutValue(timeout, callback) {
        debug("## setting timeout to %s", timeout);
        this.timeoutValue = timeout;
        this.timeoutCallback = callback;
        return super.setTimeout(timeout, callback);
    }
}
exports.SocketReconnect = SocketReconnect;
//# sourceMappingURL=socket-reconnect.js.map