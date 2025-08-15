import { CIPEventData } from "../interfaces/cip-event-data.interface";
import { SmartObjectRegistry, SmartObjectEvent } from "./smart-object-registry";
export declare class EnhancedSmartObjectTracker {
    private registry;
    private pageStates;
    registerSmartObject(smartObjectId: number, profile: "dynamicList" | "pageReference" | "buttonList" | "keypad", config?: any): void;
    processEvent(event: CIPEventData): {
        originalEvent: CIPEventData;
        smartObjectEvent?: SmartObjectEvent;
    };
    private mapObjectTypeToInterfaceType;
    private enhanceSmartObjectEvent;
    private getPageReferenceDescription;
    private getDynamicListDescription;
    private getButtonListDescription;
    private getKeypadDescription;
    getCurrentPage(smartObjectId: number): number | undefined;
    getRegisteredSmartObjects(): number[];
    clear(): void;
    getRegistry(): SmartObjectRegistry;
}
//# sourceMappingURL=enhanced-smart-object-tracker.d.ts.map