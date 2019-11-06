import update from "immutability-helper";
import defaultTypes from "./types";
import colorType from "./types/color.type";
import Utilities from "./utilities";
import Errors from "./errors";
import CONSTANTS from "./constants";
import Checks from "./checks";


/**
 * Returns a string with the new section added onto the given path.
 * 
 * @param {String} currentPath The current path.
 * @param {String} addition The section addition.
 * @param {Object} options Generation options.
 */
function addToPath(currentPath, addition, options) {
    if (!currentPath) {
        return addition;
    }

    return `${currentPath}${options.SEPARATOR}${addition}`;
}

/**
 * Converts the given dot path to the standard path string.
 * 
 * @param {String} dotPath The dot path.
 * @param {Object} options Generation options.
 */
function convertDotPath(dotPath, options) {
    const split = dotPath.split(".");
    return split.join(options.SEPARATOR);
}

/**
 * Converts the internal path representation to the dot path format.
 * 
 * @param {String} path The path.
 * @param {Object} options Generation options.
 */
function toDotPath(path, options) {
    const split = path.split(options.SEPARATOR);
    return split.join(".");
}

/**
 * Evaluates the given value against the given type. Throws an error if evaluation fails.
 * 
 * @param {String} typeName The name of the type to evaluate with.
 * @param {String} value The value to evaluate
 * @param {Object} registeredTypes The registered types.
 */
function evaluateType(typeName, value, registeredTypes = defaultTypes) {
    const typeObj = registeredTypes[typeName];

    if (!typeObj)
        Errors.throwTypeError(`Type '${typeName}' is not registered.`);

    // Run the validator
    const validated = typeObj.validator(value);

    if (!validated) {
        Errors.throwValidationError(`Theme value '${value}' failed for type '${typeName}'`);
    }
}

/**
 * Validates all items. If they are cont
 * 
 * @param {Array} items The potential controls.
 */
function validateItems(items) {
    return items.every((item) => {
        if (Checks.isValidControl(item)) {
            // Control must exist
            if (!Checks.controlExists(item)) {
                Errors.throwSyntaxError(`Control '${item}' does not exist`);
            }
        } else {
            if (!Checks.isValidNonControl(item)) {
                Errors.throwSyntaxError(`Item '${item}' is not valid.`);
            }
        }
    });
}

/**
 * Computes a return entry for the generate method.
 * 
 * @param {*} themeVal The theme value.
 * @param {String} path The path of the entry.
 * @param {String} type The type of the theme value.
 * @param {Object} registeredTypes The registered types.
 * @param {Object} options The generate options.
 */
function computeReturnEntry(themeVal, path, type, registeredTypes, options) {
    // Evaluate theme value
    evaluateType(type, themeVal, registeredTypes);

    // If endpoint is color type and color standardization is enabled
    if (type === colorType.name && options.STANDARDIZE_COLORS) {
        // Standardize the color
        themeVal = Utilities.standardizeColor(themeVal);
    }

    return { [path]: themeVal };
}

/**
 * Recursively evaluates the given section with the theme.
 * 
 * @param {String} path The current path.
 * @param {Object} section The current section.
 * @param {Object} theme The current theme section.
 * @param {Object} mixins The mixins.
 * @param {Object} registeredTypes All the registered types.
 * @param {Object} options Options used when generating.
 * @param {Object} computedEvaluations Any evaluations that already have been computed from different sections.
 */
function evaluateSection(path, section, theme, mixins, registeredTypes, options = {}, computedEvaluations = {}) {
    const isRoot = !path; // Is root if the path is an empty string

    // Check for invalid syntax
    if (Utilities.isArray(section))
        Errors.throwSyntaxError("Arrays are not allowed in schemas");

    if (Utilities.isArray(theme))
        Errors.throwSyntaxError("Arrays are not allowed in themes");

    // Inject any mixins (making sure to remove the $mixin control)
    const includedMixins = section[CONSTANTS.CONTROLS.MIXINS];
    if (includedMixins) {
        function injectMixin(mixinPath) {
            if (!Utilities.isString(mixinPath)) {
                const errMsg = `Invalid mixin type ${typeof mixinPath} at path '${toDotPath(path, options)}'. Must be a string.`;
                Errors.throwSyntaxError(errMsg);
            }

            if (!Checks.isValidMixinPath(mixinPath)) {
                const errMsg = `Invalid mixin name '${mixinPath}' at path '${toDotPath(path, options)}'`;
                Errors.throwMixinError(errMsg);
            }

            let mixinObj = Utilities.getIn(mixins, mixinPath);
            // Evaluate the mixin object if it is a function
            mixinObj = (Utilities.isFunction(mixinObj)) ? mixinObj() : mixinObj;

            if (!mixinObj) {
                const errMsg = `Mixin '${mixinPath}' not found`;
                Errors.throwSchemaError(errMsg);
            }

            const sectionSplit = Utilities.splitEntries(CONSTANTS.CONTROLS.MIXINS, section);

            // Reconstruct the section with the $mixin control removed
            const updatedSection = {
                ...sectionSplit[0],
                ...mixinObj,
                [CONSTANTS.CONTROLS.MIXINS]: section[CONSTANTS.CONTROLS.MIXINS],
                ...sectionSplit[1]
            };
            section = updatedSection;
        }

        if (Utilities.isArray(includedMixins)) {
            // Inject each mixin
            includedMixins.forEach((mixinPath) => injectMixin(mixinPath));
        } else if (Utilities.isFunction(includedMixins)) {
            // Inject the return value of the function after is it run
            injectMixin(includedMixins()); 
        } else {
            // Inject the single mixin
            injectMixin(includedMixins);
        }

        // Remove the $mixin section
        section = update(section, {
            $unset: [CONSTANTS.CONTROLS.MIXINS]
        });
    }

    const allItems = Object.keys(section);

    // Validate the items
    validateItems(allItems);

    // Check the case where the root section is an empty object
    if (Utilities.isEmptyObject(section) && isRoot) {
        Errors.throwSchemaError("Schema must not be an empty object");
    }

    // Base case: check for endpoint controls
    if (Checks.hasEndpointControls(allItems) || Utilities.isEmptyObject(section)) {
        // Check the case where endpoint controls on are the root section
        if (isRoot) {
            Errors.throwSchemaError("Endpoint controls at schema root are not valid");
        }

        if (!Checks.allEndpointControls(allItems)) {
            Errors.throwSyntaxError("Endpoint has non-endpoint controls" + allItems);
        }

        // Theme should be a string, function, number, boolean or undefined/null now
        if (theme && !Checks.isValidEndpointValueType(theme)) {
            Errors.throwThemeError(`Theme endpoint should be a valid value type at path '${toDotPath(path, options)}'`);
        }

        // Get the theme value
        let themeVal = Utilities.isFunction(theme) ? theme() : theme;

        // Get the endpoint object
        const endpoint = {
            ...options.DEFAULT_ENDPOINT,
            ...section,
        }

        const required = endpoint[CONSTANTS.CONTROLS.REQUIRED];
        const type = endpoint[CONSTANTS.CONTROLS.TYPE];
        const validator = endpoint[CONSTANTS.CONTROLS.VALIDATE];
        const defaultVal = endpoint[CONSTANTS.CONTROLS.DEFAULT];

        // Case: $validator provided
        if (validator) {
            const validatorName = "__validator";
            const validatorRegistration = { 
                [validatorName]: { 
                    name: [validatorName],
                    validator: validator 
                }
            };

            return computeReturnEntry(themeVal, path, validatorName, validatorRegistration, options);
        }

        // Case: $required=true
        if (required) {
            // No theme value provided
            if (!themeVal) {
                const errMsg = `No theme value provided when ${CONSTANTS.CONTROLS.REQUIRED}=true at path '${toDotPath(path, options)}'`;
                Errors.throwValidationError(errMsg);
            }

            return computeReturnEntry(themeVal, path, type, registeredTypes, options);
        }
        
        const defaultValEvaled = (Utilities.isFunction(defaultVal)) ? defaultVal() : defaultVal;

        // Validate the default value, if it exists
        if (!Utilities.isUndefinedOrNull(defaultValEvaled)) {
            const isValidDefaultVal = Checks.isValidEndpointValueType(defaultValEvaled);

            if (!isValidDefaultVal) {
                const errMsg = `${CONSTANTS.CONTROLS.DEFAULT} value of type ${typeof defaultVal} is not a valid type at path '${toDotPath(path, options)}'`;
                Errors.throwSchemaError(errMsg);
            }
        }

        // Case: $default provided and theme does not exist
        if (!Utilities.isUndefinedOrNull(defaultValEvaled) && Utilities.isUndefinedOrNull(themeVal)) {
            // Evaluate default value and generate path entry
            return computeReturnEntry(defaultValEvaled, path, type, registeredTypes, options);
        }

        // Case: $default not provided and no theme provided
        if (Utilities.isUndefinedOrNull(defaultVal) && Utilities.isUndefinedOrNull(themeVal)) {
            const errMsg = `Theme subsection is missing at path partial '${toDotPath(path, options)}'`;
            Errors.throwThemeError(errMsg);
        }

        // Case: Everything passes and theme value exists

        return computeReturnEntry(themeVal, path, type, registeredTypes, options);
    }
    
    // If the endpoint has not been hit yet
    if (Utilities.isObject(section)) {
        const evaluations = Object.entries(section).reduce((currSubSectionEvaluations, [subSectionName, subSection]) => {
            // Evaluate the sub section if it is a function
            subSection = (Utilities.isFunction(subSection)) ? subSection() : subSection;

            // Handle case where inheritor and endpoint controls are in the same sub-section
            const hasInheritance = subSection[CONSTANTS.CONTROLS.INHERITES];
            const hasEndpointControls = Checks.hasEndpointControls(Object.keys(subSection));

            if (hasInheritance && hasEndpointControls) {
                const errMsg = `The inheritance control and endpoint controls are not valid in the same sub-section. At path '${toDotPath(path, options)}'`;
                Errors.throwSchemaError(errMsg);
            }

            const allEvaluations = { ...computedEvaluations, ...currSubSectionEvaluations };

            // Inject any inheritance values
            const isInheritance = (subSectionName === CONSTANTS.CONTROLS.INHERITES);
            if (isInheritance) {
                function isInherited(basePath, subPath) {
                    const basePathSplit = basePath.split(options.SEPARATOR);
                    const subPathSplit = subPath.split(options.SEPARATOR);

                    if (basePathSplit.length > subPathSplit.length) {
                        return false;
                    }

                    // All base sections must match the sub-base sections up to the last base section item
                    return basePathSplit.every((basePathVal, index) => {
                        return basePathVal === subPathSplit[index];
                    });
                }

                function injectInheritance(inheritorDotPath) {
                    if (Utilities.isString(inheritorDotPath)) {
                        const inheritorPath = convertDotPath(inheritorDotPath, options);

                        // Get all evaluations that are a part of the inheritor
                        const inheritorEvals = Object.entries(allEvaluations).reduce((acc, [evalPath, evalVal]) => {
                            const partOfInheritor = isInherited(inheritorPath, evalPath);

                            if (partOfInheritor) {
                                return { ...acc, [evalPath]: evalVal };
                            }

                            return { ...acc };
                        }, {});

                        if (Utilities.isEmptyObject(inheritorEvals)) {
                            const errMsg = `No inheritance values have been computed for '${inheritorDotPath}'. This might be because it is defined after the inheritance definition.`;
                            Errors.throwSchemaError(errMsg);
                        }

                        // Convert all the inheritor values keys to the current sub section 
                        const subSectionVals = Object.entries(inheritorEvals).reduce((acc, [inheritorEvalPath, val]) => {
                            const inheritedPath = inheritorEvalPath.replace(inheritorPath, path);

                            // Check if there is an attempted theme override for the given inheritance value
                            if (theme && Checks.isValidEndpointValueType(theme)) {
                                const errMsg = `Setting value of already computed inheritance value is invalid at path '${toDotPath(path, options)}'`;
                                Errors.throwThemeError(errMsg);
                            }

                            return {
                                ...acc,
                                [inheritedPath]: val
                            };
                        }, {});

                        return subSectionVals;    
                    } else {
                        const errMsg = `Invalid inheritance type ${typeof inheritorDotPath} at path '${toDotPath(path, options)}'. Must be a string.`;
                        Errors.throwSchemaError(errMsg);
                    }
                }

                if (isRoot) {
                    const errMsg = `${CONSTANTS.CONTROLS.INHERITES} is not valid at schema root`;
                    Errors.throwSchemaError(errMsg);
                }

                const inheritors = subSection;

                let computedInheritVals = {};

                if (Utilities.isArray(inheritors)) {
                    Errors.throwSchemaError(`Arrays are not allowed with ${CONSTANTS.CONTROLS.INHERITES}`);
                }
        
                if (Utilities.isFunction(inheritors)) {
                    // Inject the return value of the function after is it run
                    computedInheritVals = injectInheritance(inheritors()); 
                } else {
                    // Inject the single inheritor
                    computedInheritVals = injectInheritance(inheritors);
                }

                return computedInheritVals;
            }


            // Do the regular theme value computation

            const themeSubSection = Utilities.isFunction(theme[subSectionName]) ? theme[subSectionName]() : theme[subSectionName];
            const newPath = addToPath(path, subSectionName, options);

            // Recursively evaluate the sub sections
            const subSectionEvaluations = evaluateSection(newPath, subSection, themeSubSection, mixins, registeredTypes, options, allEvaluations);

            return { ...currSubSectionEvaluations, ...subSectionEvaluations };
        }, {});

        return evaluations;
    } else {
        const errMsg = `Invalid endpoint section of type '${typeof section}' at path '${toDotPath(path, options)}'`
        Errors.throwSchemaError(errMsg);
    }
}


/**
 * Generates the shema with the given template and returns out the object with the key-value pairs.
 * 
 * @param {Object|Function} theme The theme.
 * @param {Object|Function} schema The schema.
 * @param {Object|Function} mixins The mixins.
 * @param {Object|Function} customTypes Custom user-defined types.
 * @param {Object} options Options used when generating.
 */
export function generate(theme, schema, mixins = {}, customTypes = {}, options = {}) {
    // Run the parameters if they are functions
    theme = (Utilities.isFunction(theme)) ? theme() : theme;
    schema = (Utilities.isFunction(schema)) ? schema() : schema;
    mixins = (Utilities.isFunction(mixins)) ? mixins() : mixins;
    customTypes = (Utilities.isFunction(customTypes)) ? customTypes() : customTypes;

    // Setup options object
    options = { ...CONSTANTS.DEFAULT_OPTIONS, ...options };

    // Get all the registered types
    const registeredTypes = { ...customTypes, ...defaultTypes };

    // Generate
    let generated = evaluateSection("", schema, theme, mixins, registeredTypes, options);

    if (options.PREFIX) {
        const renamedGenerated = {};

        // Rename all the 
        Object.entries(generated).forEach(([key, value]) => {
            renamedGenerated[`${options.PREFIX}${key}`] = value;
        });

        // Update generated with prefixed version
        generated = renamedGenerated;
    }

    return generated;
}

export default {
    generate
};