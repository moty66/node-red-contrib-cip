import { CIPEventData } from "../interfaces/cip-event-data.interface";
interface SmartObjectState {
    id: number;
    type: "button-list" | "page-reference" | "keypad" | "slider" | "dynamic-list" | "unknown";
    currentPage?: number;
    lastAnalogUpdate?: number;
}
export declare class SmartObjectTracker {
    private smartObjects;
    private profileRegistry;
    constructor();
    registerSmartObject(smartObjectId: number, profile: any): void;
    processEvent(event: CIPEventData): CIPEventData;
    private updateSmartObjectState;
    private enhanceEvent;
    getSmartObjectState(smartObjectId: number): SmartObjectState | undefined;
    clear(): void;
}
export {};
//# sourceMappingURL=smart-object-tracker.d.ts.map