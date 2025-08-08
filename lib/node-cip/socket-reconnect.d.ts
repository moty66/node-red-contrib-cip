import * as net from "net";
export interface SocketReconnectOpts extends net.SocketConstructorOpts {
    reconnect: boolean;
    retryAfter: number;
}
export declare const SOCKET_RECONNECT_RETRY_AFTER_DEFAULT = 1000;
export declare class SocketReconnect extends net.Socket {
    private options?;
    private reconnectTimeoutId?;
    connected: boolean;
    private connectionClosing;
    private port?;
    private host?;
    private connectionListener?;
    private timeoutValue;
    private timeoutCallback?;
    constructor(options?: SocketReconnectOpts);
    private onClose;
    private onConnect;
    private reconnect;
    connectTo(port: number, host: string, connectionListener?: () => void): this;
    disconnect(): this;
    setTimeoutValue(timeout: number, callback?: () => void): this;
}
//# sourceMappingURL=socket-reconnect.d.ts.map