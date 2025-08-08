export declare class IntervalTimer {
    private cb;
    private timeout;
    private id;
    constructor(cb: (...args: any[]) => void, timeout: number);
    start(timeout?: number): this;
    stop(): this;
    restart(timeout?: number): this;
}
//# sourceMappingURL=IntervalTimer.d.ts.map