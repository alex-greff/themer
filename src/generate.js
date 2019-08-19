import update from "immutability-helper";
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

    return `${currentPath}__${addition}`;
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
 */
function evaluateSection(path, section, theme, fullSchema, registeredTypes) {
    // Check for invalid syntax
    if (Utilities.isArray(section))
        Errors.throwSyntaxError("Arrays are not allowed in schemas");

    if (Utilities.isArray(theme))
        Errors.throwSyntaxError("Arrays are not allowed in themes");

    const allItems = Object.keys(section);

    // Validate the items
    validateItems(allItems);

    // Base case: check for endpoint controls
    if (CHECKS.hasEndpointControls(allItems)) {
        if (!CHECKS.allEndpointControls(allItems)) {
            Errors.throwSyntaxError("Endpoint has non-endpoint controls");
        }

        // Theme should be a string, function or undefined/null now
        if (theme && !Utilities.isString(theme) && !Utilities.isFunction(theme)) {
            Errors.throwInvalidThemeError(`Theme endpoint should be a string or function at path '${path}'`);
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
                Errors.throwValidationError(`No theme value provided when ${CONSTANTS.CONTROLS.REQUIRED}=true at path '${path}'`);
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
                // TODO: inject mixin
            } else {
                Errors.throwSyntaxError(`Invalid mixin type ${typeof mixinName} at path '${path}'. Must be a string.`);
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

        // Remove the $mixin control
        section = update(section, {
            $unset: [CONSTANTS.CONTROLS.MIXIN]
        });
    }

    // Inject any inheritances (making sure to remove the $inherits control)
    const inheritors = section[CONSTANTS.CONTROLS.INHERITES];
    if (inheritors) {
        function injectinheritance(inheritorName) {
            if (Utilities.isString(inheritorName)) {
                // TODO: inject inheritance
            } else {
                Errors.throwSyntaxError(`Invalid inheritance type ${typeof inheritorName} at path '${path}'. Must be a string.`);
            }
        }

        if (Utilities.isArray(inheritors)) {
            // Inject each mixin
            inheritors.forEach((inheritorName) => injectinheritance(inheritorName));
        } else if (Utilities.isFunction(inheritors)) {
            // Inject the return value of the function after is it run
            injectMixin(inheritors()); 
        } else {
            // Inject the single mixin
            injectMixin(inheritors);
        }

        // Remove the $mixin control
        section = update(section, {
            $unset: [CONSTANTS.CONTROLS.INHERITES]
        });
    }
    
    // If the endpoint has not been hit yet
    if (Utilities.isObject(section)) {
        const evaluations = Object.entries(section).reduce((accumulator, [subSectionName, subSection]) => {
            const themeSubSection = theme[subSectionName];
            const newPath = addToPath(path, subSectionName);

            if (!themeSubSection) {
                Errors.throwInvalidThemeError(`Theme subsection is missing at path partial '${newPath}'`);
            }

            // Recursively evaluate the sub sections
            const subSectionEvaluations = evaluateSection(newPath, subSection, themeSubSection, fullSchema, registeredTypes);

            return { ...accumulator, ...subSectionEvaluations };
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
export function generate(theme, schema, customTypes) {
    const registeredTypes = { ...customTypes, ...defaultTypes };
    return evaluateSection("", schema.schema, theme, schema, registeredTypes);
}

export default {
    generate
};