"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntervalTimer = void 0;
const timers_1 = require("timers");
class IntervalTimer {
    constructor(cb, timeout) {
        this.timeout = 0;
        this.cb = cb;
        this.timeout = timeout;
    }
    start(timeout) {
        if (this.id) {
            return this;
        }
        if (this.timeout < 0) {
            throw new Error("timeoutTimer error, timeout must be a postive integer");
        }
        this.id = (0, timers_1.setInterval)(this.cb, timeout || this.timeout);
        return this;
    }
    stop() {
        if (this.id) {
            (0, timers_1.clearInterval)(this.id);
            this.id = undefined;
        }
        return this;
    }
    restart(timeout) {
        return this.stop().start(timeout);
    }
}
exports.IntervalTimer = IntervalTimer;
