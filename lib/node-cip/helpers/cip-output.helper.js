"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CIPOutputHelper = void 0;
const __1 = require("..");
class CIPOutputHelper {
    static getJoinBytes(join) {
        return Buffer.from([
            (join - 1) >> 8,
            (join - 1) & 0xff
        ]);
    }
    static wrapper(type, payload) {
        const length = payload.length;
        return Buffer.concat([Buffer.from([type, 0x00, length]),
            payload]);
    }
    static joinEvent(type, payload) {
        return CIPOutputHelper.wrapper(__1.CIP_MESSAGE_TYPES.JOIN_EVENT, Buffer.concat([
            Buffer.from([
                0x00,
                0x00,
                payload.length + 1,
                type,
            ]),
            payload
        ]));
    }
    static digital(event) {
        if (event instanceof Array) {
            console.warn("Sending multiple digital joins is not implemented yet!");
            return Buffer.from([]);
        }
        let high = (event.join - 1) & 0xFF;
        let low = (event.join - 1) >> 8 | (event.data ? 0x0000 : 0x0080);
        const digitalPayload = Buffer.from([high, low]);
        return CIPOutputHelper.joinEvent(__1.CIP_JOIN_TYPES.DIGITAL, digitalPayload);
    }
    static analog(event) {
        if (event instanceof Array) {
            console.warn("Sending multiple analog joins is not implemented yet!");
            return Buffer.from([]);
        }
        const join = CIPOutputHelper.getJoinBytes(event.join);
        const value = Buffer.from([
            Number(event.data) >> 8,
            Number(event.data) & 0xff
        ]);
        return CIPOutputHelper.joinEvent(__1.CIP_JOIN_TYPES.ANALOG_0x14, Buffer.concat([
            join,
            value
        ]));
    }
    static serial(event) {
        if (event instanceof Array) {
            console.warn("Sending multiple serial joins is not implemented yet!");
            return Buffer.from([]);
        }
        const join = CIPOutputHelper.getJoinBytes(event.join);
        return CIPOutputHelper.joinEvent(__1.CIP_JOIN_TYPES.SERIAL_0x15, Buffer.concat([
            join,
            Buffer.from([0x03]),
            Buffer.from(event.data.toString(), 'utf8')
        ]));
    }
}
exports.CIPOutputHelper = CIPOutputHelper;
//# sourceMappingURL=cip-output.helper.js.map