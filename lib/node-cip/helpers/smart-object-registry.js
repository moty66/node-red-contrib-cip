"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartObjectRegistry = exports.KeypadProfile = exports.ButtonListProfile = exports.PageReferenceProfile = exports.DynamicListProfile = void 0;
class DynamicListProfile {
    constructor(baseJoin) {
        this.baseJoin = baseJoin;
        this.name = "dynamicList";
    }
    contains(event) {
        return event.join >= this.baseJoin && event.join < this.baseJoin + 300;
    }
    translate(smartObjectId, event) {
        const relativeJoin = event.join - this.baseJoin;
        if (event.joinType === "digital") {
            const itemIndex = relativeJoin;
            return {
                type: "smartObject",
                object: "dynamicList",
                smartObjectId,
                subType: "itemPressed",
                itemIndex,
                pressed: !!event.value,
            };
        }
        if (event.joinType === "analog") {
            if (relativeJoin === 1) {
                return {
                    type: "smartObject",
                    object: "dynamicList",
                    smartObjectId,
                    subType: "itemCount",
                    count: event.value,
                };
            }
            if (relativeJoin === 2) {
                return {
                    type: "smartObject",
                    object: "dynamicList",
                    smartObjectId,
                    subType: "selectedIndex",
                    selectedIndex: event.value,
                };
            }
        }
        if (event.joinType === "serial") {
            if (event.join >= this.baseJoin + 100 &&
                event.join < this.baseJoin + 200) {
                const itemIndex = event.join - (this.baseJoin + 100);
                return {
                    type: "smartObject",
                    object: "dynamicList",
                    smartObjectId,
                    subType: "itemLabel",
                    itemIndex,
                    text: event.value,
                };
            }
        }
        return {
            type: "smartObject",
            object: "dynamicList",
            smartObjectId,
            subType: "unknown",
            raw: event,
        };
    }
}
exports.DynamicListProfile = DynamicListProfile;
class PageReferenceProfile {
    constructor() {
        this.name = "pageReference";
    }
    contains(event) {
        return ((event.join === 1 && event.joinType === "analog") ||
            (event.join >= 4011 &&
                event.join <= 4020 &&
                event.joinType === "digital") ||
            (event.join >= 11 && event.join <= 50 && event.joinType === "analog"));
    }
    translate(smartObjectId, event) {
        if (event.joinType === "analog" && event.join === 1) {
            return {
                type: "smartObject",
                object: "pageReference",
                smartObjectId,
                subType: "pageChanged",
                pageNumber: event.value,
                currentPage: event.value,
            };
        }
        if (event.joinType === "digital" &&
            event.join >= 4011 &&
            event.join <= 4020) {
            const buttonNumber = event.join - 4010;
            return {
                type: "smartObject",
                object: "pageReference",
                smartObjectId,
                subType: "buttonPressed",
                buttonNumber,
                pressed: !!event.value,
            };
        }
        if (event.joinType === "analog" && event.join >= 11 && event.join <= 50) {
            return {
                type: "smartObject",
                object: "pageReference",
                smartObjectId,
                subType: "analogFeedback",
                analogJoin: event.join,
                value: event.value,
            };
        }
        return {
            type: "smartObject",
            object: "pageReference",
            smartObjectId,
            subType: "unknown",
            raw: event,
        };
    }
}
exports.PageReferenceProfile = PageReferenceProfile;
class ButtonListProfile {
    constructor(baseJoin, buttonCount = 10) {
        this.baseJoin = baseJoin;
        this.buttonCount = buttonCount;
        this.name = "buttonList";
    }
    contains(event) {
        return (event.join >= this.baseJoin &&
            event.join < this.baseJoin + this.buttonCount);
    }
    translate(smartObjectId, event) {
        const buttonIndex = event.join - this.baseJoin + 1;
        if (event.joinType === "digital") {
            return {
                type: "smartObject",
                object: "buttonList",
                smartObjectId,
                subType: "buttonPressed",
                buttonIndex,
                pressed: !!event.value,
            };
        }
        if (event.joinType === "serial") {
            return {
                type: "smartObject",
                object: "buttonList",
                smartObjectId,
                subType: "buttonText",
                buttonIndex,
                text: event.value,
            };
        }
        return {
            type: "smartObject",
            object: "buttonList",
            smartObjectId,
            subType: "unknown",
            buttonIndex,
            raw: event,
        };
    }
}
exports.ButtonListProfile = ButtonListProfile;
class KeypadProfile {
    constructor() {
        this.name = "keypad";
    }
    contains(event) {
        return ((event.join >= 1 && event.join <= 12 && event.joinType === "digital") ||
            (event.join === 1 && event.joinType === "serial") ||
            (event.join === 2 && event.joinType === "serial") ||
            (event.join === 1 && event.joinType === "digital"));
    }
    translate(smartObjectId, event) {
        if (event.joinType === "digital") {
            if (event.join >= 1 && event.join <= 12) {
                const keyMap = [
                    "1",
                    "2",
                    "3",
                    "4",
                    "5",
                    "6",
                    "7",
                    "8",
                    "9",
                    "*",
                    "0",
                    "#",
                ];
                const key = keyMap[event.join - 1];
                return {
                    type: "smartObject",
                    object: "keypad",
                    smartObjectId,
                    subType: "keyPressed",
                    key,
                    pressed: !!event.value,
                };
            }
        }
        if (event.joinType === "serial") {
            if (event.join === 1) {
                return {
                    type: "smartObject",
                    object: "keypad",
                    smartObjectId,
                    subType: "textInput",
                    text: event.value,
                };
            }
            if (event.join === 2) {
                return {
                    type: "smartObject",
                    object: "keypad",
                    smartObjectId,
                    subType: "displayText",
                    text: event.value,
                };
            }
        }
        return {
            type: "smartObject",
            object: "keypad",
            smartObjectId,
            subType: "unknown",
            raw: event,
        };
    }
}
exports.KeypadProfile = KeypadProfile;
class SmartObjectRegistry {
    constructor() {
        this.profiles = new Map();
    }
    register(smartObjectId, profile) {
        this.profiles.set(smartObjectId, profile);
    }
    unregister(smartObjectId) {
        this.profiles.delete(smartObjectId);
    }
    map(smartObjectId, event) {
        const profile = this.profiles.get(smartObjectId);
        if (!profile) {
            return null;
        }
        if (profile.contains(event)) {
            return profile.translate(smartObjectId, event);
        }
        return null;
    }
    autoDetect(smartObjectId, event) {
        if ((event.join === 1 && event.joinType === "analog") ||
            (event.join >= 4011 && event.join <= 4020 && event.joinType === "digital")) {
            const profile = new PageReferenceProfile();
            this.register(smartObjectId, profile);
            return profile.translate(smartObjectId, event);
        }
        if (event.joinType === "digital" && event.join >= 1 && event.join <= 12) {
            const profile = new KeypadProfile();
            this.register(smartObjectId, profile);
            return profile.translate(smartObjectId, event);
        }
        return null;
    }
    getRegisteredIds() {
        return Array.from(this.profiles.keys());
    }
    clear() {
        this.profiles.clear();
    }
}
exports.SmartObjectRegistry = SmartObjectRegistry;
