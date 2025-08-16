import { CIPEventData } from "..";
export declare class CIPOutputHelper {
    static getJoinBytes(join: number): Buffer;
    private static wrapper;
    private static joinEvent;
    static digital(event: Omit<CIPEventData, "type"> | Array<Omit<CIPEventData, "type">>): Buffer;
    static analog(event: Omit<CIPEventData, "type"> | Array<Omit<CIPEventData, "type">>): Buffer<ArrayBufferLike>;
    static serial(event: Omit<CIPEventData, "type"> | Array<Omit<CIPEventData, "type">>): Buffer<ArrayBufferLike>;
    static smartObjectDigital(event: {
        join: number;
        data: boolean;
        smartObjectId: number;
    }): Buffer;
    static smartObjectAnalog(event: {
        join: number;
        data: number;
        smartObjectId: number;
    }): Buffer;
    static smartObjectSerial(event: {
        join: number;
        data: string;
        smartObjectId: number;
    }): Buffer;
    static dynamicListSetItemCount(smartObjectId: number, itemCount: number): Buffer;
    static dynamicListSetItemText(smartObjectId: number, itemIndex: number, text: string): Buffer;
    static dynamicListSetItemEnabled(smartObjectId: number, itemIndex: number, enabled: boolean): Buffer;
    static pageReferenceSelectPage(smartObjectId: number, pageNumber: number): Buffer;
    static pageReferenceSetButtonEnabled(smartObjectId: number, pageNumber: number, buttonNumber: number, enabled: boolean): Buffer;
    static pageReferenceSetButtonFeedback(smartObjectId: number, pageNumber: number, buttonNumber: number, highlighted: boolean): Buffer;
    static pageReferenceSetButtonHighlight(smartObjectId: number, pageNumber: number, buttonNumber: number, highlighted: boolean): Buffer;
    static buttonListSetText(smartObjectId: number, buttonIndex: number, text: string): Buffer;
    static buttonListSetEnabled(smartObjectId: number, buttonIndex: number, enabled: boolean): Buffer;
    static keypadSendKey(smartObjectId: number, keyValue: string): Buffer;
    static keypadSetDisplay(smartObjectId: number, displayText: string): Buffer;
    static keypadSetEnabled(smartObjectId: number, enabled: boolean): Buffer;
}
//# sourceMappingURL=cip-output.helper.d.ts.map