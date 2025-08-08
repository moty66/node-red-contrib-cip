import { CIPEventData } from "./cip-event-data.interface";
export interface CIPCacheData {
    digital: Array<CIPEventData>;
    analog: Array<CIPEventData>;
    serial: Array<CIPEventData>;
    [key: string]: Array<CIPEventData>;
}
//# sourceMappingURL=cip-cache-data.interface.d.ts.map