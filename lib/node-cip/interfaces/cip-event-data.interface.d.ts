export interface CIPEventData {
    smartObjectId?: number;
    join: number;
    data: Buffer | boolean | number | string;
    type: "digital" | "analog" | "serial" | "unicode";
    smartObjectType?: "button-list" | "page-reference" | "keypad" | "slider" | "dynamic-list" | "unknown";
    smartObjectSubType?: string;
    currentPage?: number;
    buttonNumber?: number;
    itemIndex?: number;
    keyValue?: string;
    originalJoin?: number;
}
//# sourceMappingURL=cip-event-data.interface.d.ts.map