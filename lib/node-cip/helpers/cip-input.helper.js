"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CIPInputHelper = void 0;
class CIPInputHelper {
    static parseSerialInput(payload) {
        const join = (payload[0] << 8) + payload[1] + 1;
        const data = payload.slice(3);
        return { join, data, type: "serial" };
    }
    static parseAnalogInput(payload) {
        if (payload.length === 4) {
            const join = (payload[0] << 8) + payload[1] + 1;
            const data = (payload[2] << 8) + (payload[3] || 0);
            return { join, data, type: "analog" };
        }
        else if (payload.length === 3) {
            const join = payload[0] + 1;
            const data = (payload[1] << 8) + (payload[2] || 0);
            return { join, data, type: "analog" };
        }
        else {
            console.error("Bad analog data, ignored", payload);
            return { join: 0, data: 0, type: "analog" };
        }
    }
    static parseDigitalInput(payload) {
        const tmp = (payload[0] << 8) + payload[1];
        const join = ((tmp >> 8) | ((tmp & 0x7f) << 8)) + 1;
        const data = (payload[1] & 0x80) === 0;
        return { join, data, type: "digital" };
    }
}
exports.CIPInputHelper = CIPInputHelper;
//# sourceMappingURL=cip-input.helper.js.map