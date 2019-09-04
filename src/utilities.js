import clone from "lodash.clone";
import toPath from "lodash.topath";
import Color from "color";

/** Is the given object an integer? */
export const isInteger = (obj) => Number.isInteger(obj);

/** Is the given object a number? */
export const isNumber = (obj) => typeof obj === "number";

/** Is the given object a Function? */
export const isFunction = (obj) => typeof obj === 'function';

/** Is the given object an Object? */
export const isObject = (obj) => obj !== null && typeof obj === 'object';

/** Is the given object a string? */
export const isString = (obj) => Object.prototype.toString.call(obj) === '[object String]';

/** Is the given object an array? */
export const isArray = (obj) => Array.isArray(obj);

/** Is the given object a boolean? */
export const isBoolean = (obj) => typeof obj === "boolean";

/** Is the given object null? */
export const isNull = (obj) => obj === null && typeof obj === "object";

/** Is the given object undefined? */
export const isUndefined = (obj) => typeof obj === "undefined";

/** Is the given object undefined or null? */
export const isUndefinedOrNull = (obj) => isUndefined(obj) || isNull(obj);

/**
 * Deeply get a value from an object via its path.
 */
export const getIn = (obj, key, def, p = 0) => {
    const path = toPath(key);
    while (obj && p < path.length) {
        obj = obj[path[p++]];
        obj = isFunction(obj) ? obj() : obj;
    }
    return obj === undefined ? def : obj;
};

/**
 * Deeply set a value from in object via it's path. If the value at `path`
 * has changed, return a shallow copy of obj with `value` set at `path`.
 * If `value` has not changed, return the original `obj`.
 *
 * Existing objects / arrays along `path` are also shallow copied. Sibling
 * objects along path retain the same internal js reference. Since new
 * objects / arrays are only created along `path`, we can test if anything
 * changed in a nested structure by comparing the object's reference in
 * the old and new object, similar to how russian doll cache invalidation
 * works.
 *
 * In earlier versions of this function, which used cloneDeep, there were
 * issues whereby settings a nested value would mutate the parent
 * instead of creating a new object. `clone` avoids that bug making a
 * shallow copy of the objects along the update path
 * so no object is mutated in place.
 *
 * Before changing this function, please read through the following
 * discussions.
 *
 * @see https://github.com/developit/linkstate
 * @see https://github.com/jaredpalmer/formik/pull/123
 */
export const setIn = (obj, path, value) => {
    let res = clone(obj); // this keeps inheritance when obj is a class
    let resVal = res;
    let i = 0;
    let pathArray = toPath(path);

    for (; i < pathArray.length - 1; i++) {
        const currentPath = pathArray[i];
        let currentObj = getIn(obj, pathArray.slice(0, i + 1));

        if (currentObj) {
            resVal = resVal[currentPath] = clone(currentObj);
        } else {
            const nextPath = pathArray[i + 1];
            resVal = resVal[currentPath] =
                isInteger(nextPath) && Number(nextPath) >= 0 ? [] : {};
        }
    }

    // Return original object if new value is the same as current
    if ((i === 0 ? obj : resVal)[pathArray[i]] === value) {
        return obj;
    }

    if (value === undefined) {
        delete resVal[pathArray[i]];
    } else {
        resVal[pathArray[i]] = value;
    }

    // If the path array has a single element, the loop did not run.
    // Deleting on `resVal` had no effect in this scenario, so we delete on the result instead.
    if (i === 0 && value === undefined) {
        delete res[pathArray[i]];
    }

    return res;
};


/**
 * Returns a tuple (2-item array) with the first index containing an object with the content before 
 * the split key and the second index containing and object with the entries after it.
 * 
 * @param {String} splitKey The key to split by.
 * @param {Object} obj The object.
 */
export function splitEntries(splitKey, obj) {
    const splitIdx = Object.keys(obj).indexOf(splitKey);

    if (splitIdx < 0) {
        return null;
    }

    const entries = Object.entries(obj);

    const beforeEntries = entries.filter((_, index) => index < splitIdx);
    const afterEntries = entries.filter((_, index) => index > splitIdx);

    const beforeObj = beforeEntries.reduce((acc, [key, val]) => (
        { ...acc, [key]: val }
    ), {});

    const afterObj = afterEntries.reduce((acc, [key, val]) => (
        { ...acc, [key]: val }
    ), {});

    return [
        beforeObj,
        afterObj
    ];
}

/**
 * Returns if the given object is empty.
 * 
 * @param {Object} obj The object.
 */
export function isEmptyObject(obj) {
    return Object.entries(obj).length === 0 && obj.constructor === Object;
}

/**
 * Returns true if the color is of RGB form.
 * E.g. rgb(255, 109, 70)
 * 
 * @param {String} color The color.
 */
export function isRGB(color) {
    const rRGB = /^rgb\(([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5]),\s?([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5]),\s?([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\)$/;
    return rRGB.test(color);
};

/**
 * Returns true if the color is of hex form.
 * E.g. #001150
 * 
 * @param {String} color The color.
 */
export function isHex(color) {
    const rHex = /^#([0-9]|[A-F]){6}/;
    return rHex.test(color);
};

/**
 * Returns true if the color is of HSL form.
 * E.g. hsl(200, 100%, 20%)
 * 
 * @param {String} color The color.
 */
export function isHSL(color) {
    const rHSL = /^hsl\(([0-9]|[1-8][0-9]|9[0-9]|[12][0-9]{2}|3[0-5][0-9]|360),\s?(100|[1-9]?[0-9])%,\s?(100|[1-9]?[0-9])%\)$/;
    return rHSL.test(color);
};

// Adapted from: https://stackoverflow.com/questions/48484767/javascript-check-if-string-is-valid-css-color
/**
 * Checks if the given color name is supported in the browser.
 * 
 * @param {String} color The color.
 */
export function isColorName(color) {
    const style = new Option().style;
    style.color = color;
    return style.color === color;
}

/**
 * Returns if the given string is a valid CSS length.
 * Ex: '5rem', '20%', '15px', etc
 * 
 * @param {String} length The CSS length.
 */
export function isCSSLength(length) {
    const CSSLengthRegex = /^0$|^(\d*?.?\d+)(rem|em|px|cm|mm|in|pt|pc|ch|vw|vh|vmin|vmax|%)$/g;
    return CSSLengthRegex.test(length);
}

/**
 * Returns if the given string is a valid CSS rotation.
 * Ex: '45deg', '3.14rad', '400grad', '1turn', etc
 * 
 * @param {String} rotation The CSS rotation.
 */
export function isCSSRotation(rotation) {
    const CSSRotationRegex = /^0$|^(\d*?.?\d+)(deg|rad|grad|turn)$/g;
    return CSSRotationRegex.test(rotation);
}

/**
 * Returns a standardized version of the given color.
 * Ex: "rgb(30, 56, 60)" -> "30, 56, 60"
 *
 * @param {String} color The color.
 */
export function standardizeColor(color) {
    let aColorRgb = Color(color).rgb().array();
    aColorRgb = aColorRgb.slice(0, 3); // Remove alpha value, if it exists
    const sColorString = aColorRgb.join(", ");

    return sColorString;
}


export default {
    isInteger,
    isNumber,
    isFunction,
    isObject,
    isString,
    isArray,
    isBoolean,
    isNull,
    isUndefined,
    isUndefinedOrNull,
    setIn,
    getIn,
    splitEntries,
    isEmptyObject,
    isRGB,
    isHex,
    isHSL,
    isColorName,
    isCSSLength,
    isCSSRotation,
    standardizeColor
};
