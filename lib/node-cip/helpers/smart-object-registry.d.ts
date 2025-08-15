export interface SmartObjectEvent {
    type: "smartObject";
    object: string;
    smartObjectId: number;
    subType: string;
    [key: string]: any;
}
export interface SmartObjectProfile {
    name: string;
    contains(event: {
        joinType: string;
        join: number;
        value: any;
    }): boolean;
    translate(smartObjectId: number, event: {
        joinType: string;
        join: number;
        value: any;
    }): SmartObjectEvent;
}
export declare class DynamicListProfile implements SmartObjectProfile {
    private baseJoin;
    name: string;
    constructor(baseJoin: number);
    contains(event: {
        joinType: string;
        join: number;
        value: any;
    }): boolean;
    translate(smartObjectId: number, event: {
        joinType: string;
        join: number;
        value: any;
    }): SmartObjectEvent;
}
export declare class PageReferenceProfile implements SmartObjectProfile {
    name: string;
    contains(event: {
        joinType: string;
        join: number;
        value: any;
    }): boolean;
    translate(smartObjectId: number, event: {
        joinType: string;
        join: number;
        value: any;
    }): SmartObjectEvent;
}
export declare class ButtonListProfile implements SmartObjectProfile {
    private baseJoin;
    private buttonCount;
    name: string;
    constructor(baseJoin: number, buttonCount?: number);
    contains(event: {
        joinType: string;
        join: number;
        value: any;
    }): boolean;
    translate(smartObjectId: number, event: {
        joinType: string;
        join: number;
        value: any;
    }): SmartObjectEvent;
}
export declare class KeypadProfile implements SmartObjectProfile {
    name: string;
    contains(event: {
        joinType: string;
        join: number;
        value: any;
    }): boolean;
    translate(smartObjectId: number, event: {
        joinType: string;
        join: number;
        value: any;
    }): SmartObjectEvent;
}
export declare class SmartObjectRegistry {
    private profiles;
    register(smartObjectId: number, profile: SmartObjectProfile): void;
    unregister(smartObjectId: number): void;
    map(smartObjectId: number, event: {
        joinType: string;
        join: number;
        value: any;
    }): SmartObjectEvent | null;
    autoDetect(smartObjectId: number, event: {
        joinType: string;
        join: number;
        value: any;
    }): SmartObjectEvent | null;
    getRegisteredIds(): number[];
    clear(): void;
}
//# sourceMappingURL=smart-object-registry.d.ts.map