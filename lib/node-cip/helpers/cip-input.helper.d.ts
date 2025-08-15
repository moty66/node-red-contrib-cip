import { CIPEventData } from "..";
export declare class CIPInputHelper {
    static parseSmartObject(payload: Buffer): CIPEventData | null;
    static parseSmartObjectSerial(payload: Buffer): CIPEventData | null;
    static parseSerialInput(payload: Buffer): CIPEventData;
    static parseAnalogInput(payload: Buffer): CIPEventData;
    static parseDigitalInput(payload: Buffer): CIPEventData;
}
//# sourceMappingURL=cip-input.helper.d.ts.map