import { CIPEventData } from "../interfaces/cip-event-data.interface";
export interface SmartObjectProfile {
    name: string;
    contains(event: CIPEventData): boolean;
    translate(smartObjectId: number, event: CIPEventData): CIPEventData;
}
export declare class DynamicListProfile implements SmartObjectProfile {
    private baseJoin;
    name: string;
    constructor(baseJoin: number);
    contains(event: CIPEventData): boolean;
    translate(_smartObjectId: number, event: CIPEventData): CIPEventData;
}
export declare class PageReferenceProfile implements SmartObjectProfile {
    name: string;
    contains(event: CIPEventData): boolean;
    translate(_smartObjectId: number, event: CIPEventData): CIPEventData;
}
export declare class ButtonListProfile implements SmartObjectProfile {
    private baseJoin;
    private joinCount;
    name: string;
    constructor(baseJoin?: number, joinCount?: number);
    contains(event: CIPEventData): boolean;
    translate(_smartObjectId: number, event: CIPEventData): CIPEventData;
}
export declare class KeypadProfile implements SmartObjectProfile {
    private baseJoin;
    name: string;
    constructor(baseJoin: number);
    contains(event: CIPEventData): boolean;
    translate(_smartObjectId: number, event: CIPEventData): CIPEventData;
}
export declare class SmartObjectProfileRegistry {
    private profiles;
    private autoDetectProfiles;
    registerProfile(smartObjectId: number, profile: SmartObjectProfile): void;
    addAutoDetectProfile(profile: SmartObjectProfile): void;
    processEvent(event: CIPEventData): CIPEventData;
    getProfile(smartObjectId: number): SmartObjectProfile | undefined;
    unregisterProfile(smartObjectId: number): void;
    clear(): void;
}
//# sourceMappingURL=smart-object-profiles.d.ts.map