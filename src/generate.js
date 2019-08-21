import defaultTypes from "./types";
import Utilities from "./utilities";
import Errors from "./errors";
import CONSTANTS from "./constants";
import CHECKS from "./checks";


/**
 * Returns a string with the new section added onto the given path.
 * 
 * @param {String} currentPath The current path.
 * @param {String} addition The section addition.
 */
function addToPath(currentPath, addition) {
    if (!currentPath) {
        return addition;
    }

    return `${currentPath}${CONSTANTS.SEPARATOR}${addition}`;
}

/**
 * Converts the given dot path to the standard path string.
 * 
 * @param {String} dotPath The dot path.
 */
function convertDotPath(dotPath) {
    const split = dotPath.split(".");
    return split.join(CONSTANTS.SEPARATOR);
}

/**
 * Converts the internal path representation to the dot path format.
 * 
 * @param {String} path The path.
 */
function toDotPath(path) {
    const split = path.split(CONSTANTS.SEPARATOR);
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
        if (CHECKS.isValidControl(item)) {
            // Control must exist
            if (!CHECKS.controlExists(item)) {
                Errors.throwSyntaxError(`Control '${item}' does not exist`);
            }
        } else {
            if (!CHECKS.isValidNonControl(item)) {
                Errors.throwSyntaxError(`Item '${item}' is not valid.`);
            }
        }
    });
}

/**
 * Recursively evaluates the given section with the theme.
 * 
 * @param {String} path The current path.
 * @param {Object} section The current section.
 * @param {Object} theme The current theme section.
 * @param {Object} fullSchema The complete schema.
 * @param {Object} registeredTypes All the registered types.
 * @param {Object} computedEvaluations Any evaluations that already have been computed from different sections.
 */
function evaluateSection(path, section, theme, fullSchema, registeredTypes, computedEvaluations = {}) {
    // Check for invalid syntax
    if (Utilities.isArray(section))
        Errors.throwSyntaxError("Arrays are not allowed in schemas");

    if (Utilities.isArray(theme))
        Errors.throwSyntaxError("Arrays are not allowed in themes");

    const allItems = Object.keys(section);

    // Validate the items
    validateItems(allItems);

    // Base case: check for endpoint controls
    if (CHECKS.hasEndpointControls(allItems) || Utilities.isEmptyObject(section)) {
        if (!CHECKS.allEndpointControls(allItems)) {
            Errors.throwSyntaxError("Endpoint has non-endpoint controls");
        }

        // Theme should be a string, function or undefined/null now
        if (theme && !Utilities.isString(theme) && !Utilities.isFunction(theme)) {
            Errors.throwInvalidThemeError(`Theme endpoint should be a string or function at path '${toDotPath(path)}'`);
        }

        // Get the theme value
        const themeVal = Utilities.isFunction(theme) ? theme() : theme;

        // Get the endpoint object
        const endpoint = {
            ...CONSTANTS.DEFAULT_ENDPOINT,
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

            // Evaluate using the validator by spoofing it as a registered 
            evaluateType(validatorName, themeVal, validatorRegistration);

            return { [path]: themeVal };
        }

        // Case: $required=true
        if (required) {
            // No theme value provided
            if (!themeVal) {
                Errors.throwValidationError(`No theme value provided when ${CONSTANTS.CONTROLS.REQUIRED}=true at path '${toDotPath(path)}'`);
            }

            // Evaluate the type
            evaluateType(type, themeVal, registeredTypes);

            return { [path]: themeVal };
        }

        // Case: $default provided and no theme provided
        if (defaultVal && !themeVal) {
            // Evaluate default value
            evaluateType(type, defaultVal, registeredTypes);

            return { [path]: defaultVal };
        }

        // Case: $default not provided and no theme provided
        if (!defaultVal && !themeVal) {
            Errors.throwValidationError(`No theme and default value provided at path '${path}'`);
        }

        // Case: Everything passes and theme value exists
        
        // Evaluate theme value
        evaluateType(type, themeVal, registeredTypes);

        return { [path]: themeVal };
    }

    // Inject any mixins (making sure to remove the $mixin control)
    const mixins = section[CONSTANTS.CONTROLS.MIXIN];
    if (mixins) {
        function injectMixin(mixinName) {
            if (Utilities.isString(mixinName)) {
                const mixinObj = Utilities.getIn(fullSchema.mixins, mixinName);

                if (!mixinObj) {
                    Errors.throwSchemaError(`Mixin '${mixinName}' not found.`);
                }

                const sectionSplit = Utilities.splitEntries(CONSTANTS.CONTROLS.MIXIN, section);

                // Reconstruct the section with the $mixin control removed
                const updatedSection = {
                    ...sectionSplit[0],
                    ...mixinObj,
                    ...sectionSplit[1]
                };
                section = updatedSection;

            } else {
                Errors.throwSyntaxError(`Invalid mixin type ${typeof mixinName} at path '${toDotPath(path)}'. Must be a string.`);
            }
        }

        if (Utilities.isArray(mixins)) {
            // Inject each mixin
            mixins.forEach((mixinName) => injectMixin(mixinName));
        } else if (Utilities.isFunction(mixins)) {
            // Inject the return value of the function after is it run
            injectMixin(mixins()); 
        } else {
            // Inject the single mixin
            injectMixin(mixins);
        }
    }
    
    // If the endpoint has not been hit yet
    if (Utilities.isObject(section)) {
        const evaluations = Object.entries(section).reduce((currSubSectionEvaluations, [subSectionName, subSection]) => {
            // Evaluate the sub section if it is a function
            subSection = (Utilities.isFunction(subSection)) ? subSection() : subSection;

            const allEvaluations = { ...computedEvaluations, ...currSubSectionEvaluations };

            // Inject any inheritance values
            const isInheritance = (subSectionName === CONSTANTS.CONTROLS.INHERITES);
            if (isInheritance) {
                function injectInheritance(inheritorDotPath) {
                    if (Utilities.isString(inheritorDotPath)) {
                        const inheritorPath = convertDotPath(inheritorDotPath);

                        // Get all evaluations that are a part of the inheritor
                        const inheritorEvals = Object.entries(allEvaluations).reduce((acc, [evalPath, evalVal]) => {
                            const partOfInheritor = evalPath.startsWith(inheritorPath);

                            if (partOfInheritor) {
                                return { ...acc, [evalPath]: evalVal };
                            }

                            return { ...acc };
                        }, {});

                        if (Utilities.isEmptyObject(inheritorEvals)) {
                            Errors.throwSchemaError(`No inheritance has been computed for '${inheritorDotPath}'. This might be because it is defined after the inheritance definition.`);
                        }

                        // Convert all the inheritor values keys to the current sub section 
                        const subSectionVals = Object.entries(inheritorEvals).reduce((acc, [inheritorEvalPath, val]) => {
                            const inheritedPath = inheritorEvalPath.replace(inheritorPath, path);

                            return {
                                ...acc,
                                [inheritedPath]: val
                            };
                        }, {});

                        return subSectionVals;    
                    } else {
                        Errors.throwSyntaxError(`Invalid inheritance type ${typeof inheritorDotPath} at path '${toDotPath(path)}'. Must be a string.`);
                    }
                }

                const inheritors = subSection;

                let computedInheritVals = {};
        
                if (Utilities.isArray(inheritors)) {
                    // Inject each inheritor
                    const computedInheritValsList = inheritors.map((inheritorDotPath) => injectInheritance(inheritorDotPath));

                    // Merge the returned array of computed subsections into one object
                    computedInheritVals = computedInheritValsList.reduce((acc, currValsObj) => ({
                        ...acc,
                        currValsObj
                    }), {});

                } else if (Utilities.isFunction(inheritors)) {
                    // Inject the return value of the function after is it run
                    computedInheritVals = injectInheritance(inheritors()); 
                } else {
                    // Inject the single inheritor
                    computedInheritVals = injectInheritance(inheritors);
                }

                return computedInheritVals;
            }


            // Do the regular theme value computation

            const themeSubSection = theme[subSectionName];
            const newPath = addToPath(path, subSectionName);

            const isOnlyInheritsSubSection = Object.keys(subSection).length === 1 && !!subSection[CONSTANTS.CONTROLS.INHERITES];

            // Only throw an error if the theme value does not exist and the only item in the subsection is not an $inherits control
            if (!themeSubSection && !isOnlyInheritsSubSection) {
                Errors.throwInvalidThemeError(`Theme subsection is missing at path partial '${toDotPath(newPath)}'`);
            }

            // Recursively evaluate the sub sections
            const subSectionEvaluations = evaluateSection(newPath, subSection, themeSubSection, fullSchema, registeredTypes, allEvaluations);

            return { ...currSubSectionEvaluations, ...subSectionEvaluations };
        }, {});

        return evaluations;
    }
}


/**
 * Generates the shema with the given template and returns out the object with the key-value pairs.
 * 
 * @param {Object} theme The theme.
 * @param {Object} schema The schema.
 * @param {Object} customTypes Custom user-defined types.
 */
export function generate(theme, schema, customTypes = {}) {
    // Get all the registered types
    const registeredTypes = { ...customTypes, ...defaultTypes };

    // Make sure schema has the default form
    schema = {
        ...CONSTANTS.DEFAULT_SCHEMA,
        ...schema
    };
    
    // Evaluate the schema if it is a function
    const schemaEvaled = (Utilities.isFunction(schema.schema)) ? schema.schema() : schema.schema;

    // Generate
    return evaluateSection("", schemaEvaled, theme, schema, registeredTypes);
}

export default {
    generate
};