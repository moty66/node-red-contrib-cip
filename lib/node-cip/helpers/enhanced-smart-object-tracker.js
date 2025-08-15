"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedSmartObjectTracker = void 0;
const smart_object_registry_1 = require("./smart-object-registry");
class EnhancedSmartObjectTracker {
    constructor() {
        this.registry = new smart_object_registry_1.SmartObjectRegistry();
        this.pageStates = new Map();
    }
    registerSmartObject(smartObjectId, profile, config) {
        let profileInstance;
        switch (profile) {
            case "dynamicList":
                profileInstance = new smart_object_registry_1.DynamicListProfile(config?.baseJoin || 1);
                break;
            case "pageReference":
                profileInstance = new smart_object_registry_1.PageReferenceProfile();
                break;
            case "buttonList":
                profileInstance = new smart_object_registry_1.ButtonListProfile(config?.baseJoin || 1, config?.buttonCount || 10);
                break;
            case "keypad":
                profileInstance = new smart_object_registry_1.KeypadProfile();
                break;
        }
        this.registry.register(smartObjectId, profileInstance);
    }
    processEvent(event) {
        if (!event.smartObjectId) {
            return { originalEvent: event };
        }
        const joinEvent = {
            joinType: event.type,
            join: event.join,
            value: event.data,
        };
        let smartObjectEvent = this.registry.map(event.smartObjectId, joinEvent);
        if (!smartObjectEvent) {
            smartObjectEvent = this.registry.autoDetect(event.smartObjectId, joinEvent);
        }
        if (smartObjectEvent) {
            smartObjectEvent = this.enhanceSmartObjectEvent(smartObjectEvent);
        }
        const enhancedOriginalEvent = {
            ...event,
            smartObjectType: this.mapObjectTypeToInterfaceType(smartObjectEvent?.object) ||
                "unknown",
        };
        if (smartObjectEvent?.object === "pageReference") {
            if (smartObjectEvent.subType === "pageChanged") {
                this.pageStates.set(event.smartObjectId, smartObjectEvent.pageNumber);
                enhancedOriginalEvent.currentPage = smartObjectEvent.pageNumber;
            }
            else {
                const currentPage = this.pageStates.get(event.smartObjectId);
                if (currentPage !== undefined) {
                    enhancedOriginalEvent.currentPage = currentPage;
                    smartObjectEvent.currentPage = currentPage;
                }
            }
        }
        return {
            originalEvent: enhancedOriginalEvent,
            smartObjectEvent: smartObjectEvent || undefined,
        };
    }
    mapObjectTypeToInterfaceType(objectType) {
        switch (objectType) {
            case "dynamicList":
                return "dynamic-list";
            case "pageReference":
                return "page-reference";
            case "buttonList":
                return "button-list";
            case "keypad":
                return "keypad";
            default:
                return "unknown";
        }
    }
    enhanceSmartObjectEvent(event) {
        const enhanced = { ...event };
        enhanced.timestamp = new Date().toISOString();
        switch (event.object) {
            case "pageReference":
                enhanced.description = this.getPageReferenceDescription(event);
                break;
            case "dynamicList":
                enhanced.description = this.getDynamicListDescription(event);
                break;
            case "buttonList":
                enhanced.description = this.getButtonListDescription(event);
                break;
            case "keypad":
                enhanced.description = this.getKeypadDescription(event);
                break;
        }
        return enhanced;
    }
    getPageReferenceDescription(event) {
        switch (event.subType) {
            case "pageChanged":
                return `Page changed to ${event.pageNumber}`;
            case "buttonPressed":
                return `${event.pressed ? "Pressed" : "Released"} navigation button ${event.buttonNumber}`;
            case "analogFeedback":
                return `Analog feedback on join ${event.analogJoin}: ${event.value}`;
            default:
                return `Page Reference: ${event.subType}`;
        }
    }
    getDynamicListDescription(event) {
        switch (event.subType) {
            case "itemPressed":
                return `${event.pressed ? "Pressed" : "Released"} list item ${event.itemIndex}`;
            case "itemCount":
                return `List item count set to ${event.count}`;
            case "selectedIndex":
                return `Selected list item ${event.selectedIndex}`;
            case "itemLabel":
                return `Item ${event.itemIndex} label set to "${event.text}"`;
            default:
                return `Dynamic List: ${event.subType}`;
        }
    }
    getButtonListDescription(event) {
        switch (event.subType) {
            case "buttonPressed":
                return `${event.pressed ? "Pressed" : "Released"} button ${event.buttonIndex}`;
            case "buttonText":
                return `Button ${event.buttonIndex} text set to "${event.text}"`;
            default:
                return `Button List: ${event.subType}`;
        }
    }
    getKeypadDescription(event) {
        switch (event.subType) {
            case "keyPressed":
                return `${event.pressed ? "Pressed" : "Released"} key "${event.key}"`;
            case "textInput":
                return `Keypad input: "${event.text}"`;
            case "displayText":
                return `Keypad display: "${event.text}"`;
            default:
                return `Keypad: ${event.subType}`;
        }
    }
    getCurrentPage(smartObjectId) {
        return this.pageStates.get(smartObjectId);
    }
    getRegisteredSmartObjects() {
        return this.registry.getRegisteredIds();
    }
    clear() {
        this.registry.clear();
        this.pageStates.clear();
    }
    getRegistry() {
        return this.registry;
    }
}
exports.EnhancedSmartObjectTracker = EnhancedSmartObjectTracker;
