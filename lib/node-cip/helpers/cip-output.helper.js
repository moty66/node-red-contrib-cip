"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CIPOutputHelper = void 0;
const __1 = require("..");
class CIPOutputHelper {
    static getJoinBytes(join) {
        return Buffer.from([(join - 1) >> 8, (join - 1) & 0xff]);
    }
    static wrapper(type, payload) {
        const length = payload.length;
        return Buffer.concat([Buffer.from([type, 0x00, length]), payload]);
    }
    static joinEvent(type, payload) {
        return CIPOutputHelper.wrapper(__1.CIP_MESSAGE_TYPES.JOIN_EVENT, Buffer.concat([
            Buffer.from([
                0x00,
                0x00,
                payload.length + 1,
                type,
            ]),
            payload,
        ]));
    }
    static digital(event) {
        if (event instanceof Array) {
            console.warn("Sending multiple digital joins is not implemented yet!");
            return Buffer.from([]);
        }
        let high = (event.join - 1) & 0xff;
        let low = ((event.join - 1) >> 8) | (event.data ? 0x0000 : 0x0080);
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
            Number(event.data) & 0xff,
        ]);
        return CIPOutputHelper.joinEvent(__1.CIP_JOIN_TYPES.ANALOG_0x14, Buffer.concat([join, value]));
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
            Buffer.from(event.data.toString(), "utf8"),
        ]));
    }
    static smartObjectDigital(event) {
        const baseJoin = event.join - 1;
        const joinLow = baseJoin & 0xff;
        const joinHigh = (baseJoin >> 8) & 0x7f;
        const stateBit = event.data ? 0x00 : 0x80;
        const joinHighWithState = joinHigh | stateBit;
        const payload = Buffer.from([
            0x00,
            0x00,
            0x00,
            event.smartObjectId,
            0x03,
            0x00,
            joinLow,
            joinHighWithState,
        ]);
        return CIPOutputHelper.wrapper(__1.CIP_MESSAGE_TYPES.JOIN_EVENT, Buffer.concat([
            Buffer.from([
                0x00,
                0x00,
                payload.length + 1,
                __1.CIP_JOIN_TYPES.SMART_OBJECT,
            ]),
            payload,
        ]));
    }
    static smartObjectAnalog(event) {
        const payload = Buffer.from([
            0x00,
            0x00,
            0x00,
            event.smartObjectId,
            0x05,
            0x14,
            0x00,
            event.join - 1,
            (Number(event.data) >> 8) & 0xff,
            Number(event.data) & 0xff,
        ]);
        return CIPOutputHelper.wrapper(__1.CIP_MESSAGE_TYPES.JOIN_EVENT, Buffer.concat([
            Buffer.from([
                0x00,
                0x00,
                payload.length + 1,
                __1.CIP_JOIN_TYPES.SMART_OBJECT,
            ]),
            payload,
        ]));
    }
    static smartObjectSerial(event) {
        const textData = Buffer.from(event.data.toString(), "utf8");
        const subtype = Math.min(textData.length + 4, 255);
        const payload = Buffer.concat([
            Buffer.from([
                0x00,
                0x00,
                0x00,
                event.smartObjectId,
                subtype,
                0x15,
                0x00,
                event.join - 1,
                0x03,
            ]),
            textData,
        ]);
        return CIPOutputHelper.wrapper(__1.CIP_MESSAGE_TYPES.JOIN_EVENT, Buffer.concat([
            Buffer.from([
                0x00,
                0x00,
                payload.length + 1,
                __1.CIP_JOIN_TYPES.SMART_OBJECT,
            ]),
            payload,
        ]));
    }
    static dynamicListSetItemCount(smartObjectId, itemCount) {
        return CIPOutputHelper.smartObjectAnalog({
            join: 1,
            data: Math.max(1, Math.min(255, itemCount)),
            smartObjectId,
        });
    }
    static dynamicListSetItemText(smartObjectId, itemIndex, text) {
        return CIPOutputHelper.smartObjectSerial({
            join: itemIndex,
            data: text,
            smartObjectId,
        });
    }
    static dynamicListSetItemEnabled(smartObjectId, itemIndex, enabled) {
        return CIPOutputHelper.smartObjectDigital({
            join: itemIndex,
            data: enabled,
            smartObjectId,
        });
    }
    static pageReferenceSelectPage(smartObjectId, pageNumber) {
        return CIPOutputHelper.smartObjectAnalog({
            join: 1,
            data: pageNumber,
            smartObjectId,
        });
    }
    static pageReferenceSetButtonEnabled(smartObjectId, pageNumber, buttonNumber, enabled) {
        return CIPOutputHelper.smartObjectDigital({
            join: 4000 + pageNumber * 10 + buttonNumber,
            data: enabled,
            smartObjectId,
        });
    }
    static pageReferenceSetButtonFeedback(smartObjectId, pageNumber, buttonNumber, highlighted) {
        return CIPOutputHelper.smartObjectDigital({
            join: 4100 + pageNumber * 10 + buttonNumber,
            data: highlighted,
            smartObjectId,
        });
    }
    static pageReferenceSetButtonHighlight(smartObjectId, pageNumber, buttonNumber, highlighted) {
        return CIPOutputHelper.smartObjectDigital({
            join: 4200 + pageNumber * 10 + buttonNumber,
            data: highlighted,
            smartObjectId,
        });
    }
    static buttonListSetText(smartObjectId, buttonIndex, text) {
        return CIPOutputHelper.smartObjectSerial({
            join: buttonIndex,
            data: text,
            smartObjectId,
        });
    }
    static buttonListSetEnabled(smartObjectId, buttonIndex, enabled) {
        return CIPOutputHelper.smartObjectDigital({
            join: buttonIndex,
            data: enabled,
            smartObjectId,
        });
    }
    static keypadSendKey(smartObjectId, keyValue) {
        return CIPOutputHelper.smartObjectSerial({
            join: 1,
            data: keyValue,
            smartObjectId,
        });
    }
    static keypadSetDisplay(smartObjectId, displayText) {
        return CIPOutputHelper.smartObjectSerial({
            join: 2,
            data: displayText,
            smartObjectId,
        });
    }
    static keypadSetEnabled(smartObjectId, enabled) {
        return CIPOutputHelper.smartObjectDigital({
            join: 1,
            data: enabled,
            smartObjectId,
        });
    }
}
exports.CIPOutputHelper = CIPOutputHelper;
