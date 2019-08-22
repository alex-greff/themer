import toPath from "lodash.topath";
import defaultTypes from "./types";
import CONSTANTS from "./constants";
import Utilities from "./utilities";

/**
 * Checks if the given control exists.
 * 
 * @param {String} control The control to check.
 */
export function controlExists(control) {
    return Object.values(CONSTANTS.CONTROLS).some(registeredControl => control === registeredControl);
}

/**
 * Returns if the given control is an endpoint-triggering control.
 * 
 * @param {String} control The control being checked.
 */
export function isEndpointControl(control) {
    return CONSTANTS.ENDPOINT_CONTROLS.includes(control);
}

/**
 * Returns if all the given controls are endpoint-triggering controls.
 * 
 * @param {Array} controls The array of control names.
 */
export function allEndpointControls(controls) {
    return controls.every((control) => isEndpointControl(control));
}

/**
 * Returns if an endpoint-triggering control exists in the given controls.
 * 
 * @param {Array} controls The array of control names.
 */
export function hasEndpointControls(controls) {
    return controls.some((control) => isEndpointControl(control));
}

/**
 * Returns if the given control is an injection-based control.
 * 
 * @param {String} control The control being checked.
 */
export function isInjectionControl(control) {
    return CONSTANTS.INJECTION_CONTROLS.includes(control);
}

/**
 * Returns if the given control is a valid control format.
 * 
 * @param {String} control The potential control.
 */
export function isValidControl(control) {
    const controlRegex = /^\$.+$/;
    return controlRegex.test(control);
}

/**
 * Returns if the given non-control item is valid.
 * 
 * @param {String} item The non-control item to check.
 */
export function isValidNonControl(item) {
    const itemRegex = /[\w\d]+/;
    return itemRegex.test(item);
}

/**
 * Checks if the given name is a default type.
 * 
 * @param {String} name The name of type.
 */
export function isDefaultType(name) {
    return !!defaultTypes[name];
}

/**
 * Returns if the given mixin path is valid.
 * 
 * @param {String} path The path to the mixin.
 */
export function isValidMixinPath(path) {
    const pathArr = toPath(path);
    
    return pathArr.every(pathSection => {
        return !isValidControl(pathSection)
    });
}

/**
 * Returns if the given endpoint value is a valid type.
 * 
 * @param {String|Number|Boolean} value The endpoint value.
 */
export function isValidEndpointValueType(value) {
    return Utilities.isString(value) ||
        Utilities.isNumber(value) ||
        Utilities.isBoolean(value) ||
        (Utilities.isObject(value) && !hasEndpointControls(Object.keys(value)));
}

export default {
    controlExists,
    isEndpointControl,
    allEndpointControls,
    hasEndpointControls,
    isInjectionControl,
    isValidControl,
    isValidNonControl,
    isDefaultType,
    isValidMixinPath,
    isValidEndpointValueType,
};