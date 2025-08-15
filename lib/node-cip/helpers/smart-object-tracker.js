"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartObjectTracker = void 0;
const smart_object_profiles_1 = require("./smart-object-profiles");
class SmartObjectTracker {
    constructor() {
        this.smartObjects = new Map();
        this.profileRegistry = new smart_object_profiles_1.SmartObjectProfileRegistry();
        this.profileRegistry.addAutoDetectProfile(new smart_object_profiles_1.PageReferenceProfile());
        this.profileRegistry.addAutoDetectProfile(new smart_object_profiles_1.ButtonListProfile());
    }
    registerSmartObject(smartObjectId, profile) {
        this.profileRegistry.registerProfile(smartObjectId, profile);
    }
    processEvent(event) {
        if (!event.smartObjectId) {
            return event;
        }
        const profileProcessedEvent = this.profileRegistry.processEvent(event);
        let smartObject = this.smartObjects.get(event.smartObjectId);
        if (!smartObject) {
            smartObject = {
                id: event.smartObjectId,
                type: profileProcessedEvent.smartObjectType || "unknown",
            };
            this.smartObjects.set(event.smartObjectId, smartObject);
        }
        this.updateSmartObjectState(smartObject, profileProcessedEvent);
        const enhancedEvent = this.enhanceEvent(smartObject, profileProcessedEvent);
        return enhancedEvent;
    }
    updateSmartObjectState(smartObject, event) {
        if (event.smartObjectType && event.smartObjectType !== "unknown") {
            smartObject.type = event.smartObjectType;
        }
        if (event.smartObjectType === "page-reference" &&
            event.currentPage !== undefined) {
            smartObject.currentPage = event.currentPage;
            smartObject.lastAnalogUpdate = Date.now();
        }
    }
    enhanceEvent(smartObject, event) {
        const enhancedEvent = {
            ...event,
            smartObjectType: event.smartObjectType || smartObject.type,
        };
        if (smartObject.type === "page-reference" ||
            event.smartObjectType === "page-reference") {
            if (event.type === "analog" && event.join === 1) {
                enhancedEvent.currentPage = event.data;
            }
            else if (smartObject.currentPage !== undefined) {
                enhancedEvent.currentPage = smartObject.currentPage;
            }
        }
        return enhancedEvent;
    }
    getSmartObjectState(smartObjectId) {
        return this.smartObjects.get(smartObjectId);
    }
    clear() {
        this.smartObjects.clear();
    }
}
exports.SmartObjectTracker = SmartObjectTracker;
