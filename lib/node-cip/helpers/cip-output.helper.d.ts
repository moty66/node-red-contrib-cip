import { CIPEventData } from '..';
export declare class CIPOutputHelper {
    static getJoinBytes(join: number): Buffer;
    private static wrapper;
    private static joinEvent;
    static digital(event: Omit<CIPEventData, 'type'> | Array<Omit<CIPEventData, 'type'>>): Buffer;
    static analog(event: Omit<CIPEventData, 'type'> | Array<Omit<CIPEventData, 'type'>>): Buffer<ArrayBufferLike>;
    static serial(event: Omit<CIPEventData, 'type'> | Array<Omit<CIPEventData, 'type'>>): Buffer<ArrayBufferLike>;
}
//# sourceMappingURL=cip-output.helper.d.ts.map