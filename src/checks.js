import CONSTANTS from "./constants";

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

export default {
    controlExists,
    isEndpointControl,
    allEndpointControls,
    hasEndpointControls,
    isInjectionControl,
};