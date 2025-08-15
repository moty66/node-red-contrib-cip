"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartObjectProfileRegistry = exports.KeypadProfile = exports.ButtonListProfile = exports.PageReferenceProfile = exports.DynamicListProfile = void 0;
class DynamicListProfile {
    constructor(baseJoin) {
        this.baseJoin = baseJoin;
        this.name = "dynamic-list";
    }
    contains(event) {
        return event.join >= this.baseJoin && event.join < this.baseJoin + 300;
    }
    translate(_smartObjectId, event) {
        const relativeJoin = event.join - this.baseJoin;
        if (event.type === "digital") {
            const itemIndex = event.join - this.baseJoin;
            return {
                ...event,
                smartObjectType: "dynamic-list",
                smartObjectSubType: "item-pressed",
                itemIndex,
                originalJoin: event.join,
            };
        }
        if (event.type === "analog") {
            if (relativeJoin === 1) {
                return {
                    ...event,
                    smartObjectType: "dynamic-list",
                    smartObjectSubType: "item-count",
                };
            }
            if (relativeJoin === 2) {
                return {
                    ...event,
                    smartObjectType: "dynamic-list",
                    smartObjectSubType: "selected-index",
                };
            }
        }
        if (event.type === "serial") {
            if (event.join >= this.baseJoin + 100 &&
                event.join < this.baseJoin + 200) {
                const itemIndex = event.join - (this.baseJoin + 100);
                return {
                    ...event,
                    smartObjectType: "dynamic-list",
                    smartObjectSubType: "item-label",
                    itemIndex,
                    originalJoin: event.join,
                };
            }
        }
        return {
            ...event,
            smartObjectType: "dynamic-list",
            smartObjectSubType: "unknown",
        };
    }
}
exports.DynamicListProfile = DynamicListProfile;
class PageReferenceProfile {
    constructor() {
        this.name = "page-reference";
    }
    contains(event) {
        return ((event.type === "analog" && event.join === 1) ||
            (event.type === "digital" && event.join >= 4000 && event.join < 5000));
    }
    translate(_smartObjectId, event) {
        if (event.type === "analog" && event.join === 1) {
            return {
                ...event,
                smartObjectType: "page-reference",
                smartObjectSubType: "page-selected",
                currentPage: event.data,
            };
        }
        if (event.type === "digital" && event.join >= 4000) {
            const buttonNumber = event.join - 4000;
            return {
                ...event,
                smartObjectType: "page-reference",
                smartObjectSubType: "button-pressed",
                buttonNumber,
                originalJoin: event.join,
            };
        }
        return {
            ...event,
            smartObjectType: "page-reference",
            smartObjectSubType: "unknown",
        };
    }
}
exports.PageReferenceProfile = PageReferenceProfile;
class ButtonListProfile {
    constructor(baseJoin = 1, joinCount = 100) {
        this.baseJoin = baseJoin;
        this.joinCount = joinCount;
        this.name = "button-list";
    }
    contains(event) {
        return (event.type === "digital" &&
            event.join >= this.baseJoin &&
            event.join < this.baseJoin + this.joinCount);
    }
    translate(_smartObjectId, event) {
        const buttonNumber = event.join - this.baseJoin + 1;
        return {
            ...event,
            smartObjectType: "button-list",
            smartObjectSubType: "button-pressed",
            buttonNumber,
            originalJoin: event.join,
        };
    }
}
exports.ButtonListProfile = ButtonListProfile;
class KeypadProfile {
    constructor(baseJoin) {
        this.baseJoin = baseJoin;
        this.name = "keypad";
    }
    contains(event) {
        return event.join >= this.baseJoin && event.join < this.baseJoin + 50;
    }
    translate(_smartObjectId, event) {
        const relativeJoin = event.join - this.baseJoin;
        if (event.type === "digital") {
            const keyMappings = {
                1: "1",
                2: "2",
                3: "3",
                4: "4",
                5: "5",
                6: "6",
                7: "7",
                8: "8",
                9: "9",
                10: "0",
                11: "*",
                12: "#",
                13: "Enter",
                14: "Clear",
                15: "Backspace",
            };
            const keyValue = keyMappings[relativeJoin] || `Key${relativeJoin}`;
            return {
                ...event,
                smartObjectType: "keypad",
                smartObjectSubType: "key-pressed",
                keyValue,
                originalJoin: event.join,
            };
        }
        if (event.type === "serial") {
            return {
                ...event,
                smartObjectType: "keypad",
                smartObjectSubType: "text-display",
            };
        }
        return {
            ...event,
            smartObjectType: "keypad",
            smartObjectSubType: "unknown",
        };
    }
}
exports.KeypadProfile = KeypadProfile;
class SmartObjectProfileRegistry {
    constructor() {
        this.profiles = new Map();
        this.autoDetectProfiles = [];
    }
    registerProfile(smartObjectId, profile) {
        this.profiles.set(smartObjectId, profile);
    }
    addAutoDetectProfile(profile) {
        this.autoDetectProfiles.push(profile);
    }
    processEvent(event) {
        if (!event.smartObjectId) {
            return event;
        }
        const profile = this.profiles.get(event.smartObjectId);
        if (profile && profile.contains(event)) {
            return profile.translate(event.smartObjectId, event);
        }
        for (const profile of this.autoDetectProfiles) {
            if (profile.contains(event)) {
                this.profiles.set(event.smartObjectId, profile);
                return profile.translate(event.smartObjectId, event);
            }
        }
        return event;
    }
    getProfile(smartObjectId) {
        return this.profiles.get(smartObjectId);
    }
    unregisterProfile(smartObjectId) {
        this.profiles.delete(smartObjectId);
    }
    clear() {
        this.profiles.clear();
    }
}
exports.SmartObjectProfileRegistry = SmartObjectProfileRegistry;
