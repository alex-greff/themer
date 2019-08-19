/** Is the given object an integer? */
export const isInteger = (obj) => String(Math.floor(Number(obj))) === obj;

/** Is the given object a Function? */
export const isFunction = (obj) => typeof obj === 'function';

/** Is the given object an Object? */
export const isObject = (obj) => obj !== null && typeof obj === 'object';

/** Is the given object a string? */
export const isString = (obj) => Object.prototype.toString.call(obj) === '[object String]';

/** Is the given object an array? */
export const isArray = (obj) => Array.isArray(obj);

/**
 * Deeply get a value from an object via its path.
 */
export const getIn = (obj, key, def, p = 0) => {
    const path = toPath(key);
    while (obj && p < path.length) {
        obj = obj[path[p++]];
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

export default {
    isInteger,
    isFunction,
    isObject,
    isString,
    isArray,
    setIn,
    getIn,
};