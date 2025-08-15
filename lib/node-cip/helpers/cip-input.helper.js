"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CIPInputHelper = void 0;
class CIPInputHelper {
    static parseSmartObject(payload) {
        try {
            if (payload.length < 6) {
                console.error("Smart object payload too short:", payload);
                return null;
            }
            const smartObjectId = payload[3];
            const subtype = payload[4];
            const type = payload[5];
            if (subtype === 0x03 && type === 0x27 && payload.length >= 8) {
                const join = ((payload[7] & 0x7f) << 8) + payload[6] + 1;
                const data = (payload[7] & 0x80) === 0;
                return { smartObjectId, join, data, type: "digital" };
            }
            if (subtype === 0x05 && type === 0x14 && payload.length >= 10) {
                const join = payload[7] + 1;
                const data = (payload[8] << 8) + payload[9];
                return { smartObjectId, join, data, type: "analog" };
            }
            console.error("Unknown smart object type or format:", {
                subtype,
                type,
                payload,
            });
            return null;
        }
        catch (error) {
            console.error("Error parsing smart object:", error, payload);
            return null;
        }
    }
    static parseSmartObjectSerial(payload) {
        try {
            if (payload.length < 8) {
                console.error("Smart object serial payload too short:", payload);
                return null;
            }
            const join = (payload[0] << 8) + payload[1] + 1;
            const smartObjectId = (payload[2] << 8) + payload[3] + 1;
            const data = payload.slice(7).toString("latin1");
            return { smartObjectId, join, data, type: "serial" };
        }
        catch (error) {
            console.error("Error parsing smart object serial:", error, payload);
            return null;
        }
    }
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
