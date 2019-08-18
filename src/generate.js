import defaultTypes from "./types";

const CONTROLS = {
    REQUIRED: "$required",
    TYPE: "$type",
    DEFAULT: "$default",
    VALIDATOR: "$validator",
    INHERITES: "$inherits",
    MIXIN: "$mixin"
};

const ENDPOINT_CONTROLS = [
    CONTROLS.REQUIRED,
    CONTROLS.TYPE,
    CONTROLS.DEFAULT,
    CONTROLS.VALIDATE
];

const INJECTION_CONTROLS = [
    CONTROLS.INHERITES,
    CONTROLS.MIXIN
];

const DEFAULT_ENDPOINT = {
    [CONTROLS.REQUIRED]: false,
    [CONTROLS.TYPE]: "all",
    [CONTROLS.DEFAULT]: null,
    [CONTROLS.VALIDATE]: null
};

function throwErorr(message) {
    throw new Erorr(message);
}

function throwSyntaxError(message) {
    throwErorr(`Invalid syntax: ${message}`);
}

function throwInvalidThemeError(message) {
    throwErorr(`Invalid theme: ${message}`);
}

function throwTypeError(message) {
    throwErorr(`Endpoint type: ${message}`);
}

function throwValidationError(message) {
    throwErorr(`Validation error: ${message}`);
}

/**
 * 
 * @param {String} currentPath 
 * @param {String} addition 
 */
function addToPath(currentPath, addition) {
    if (!currentPath) {
        return addition;
    }

    return `${currentPath}__${addition}`;
}

/**
 * Returns if the given control is an endpoint-triggering control.
 * 
 * @param {String} control The control being checked.
 */
function isEndpointControl(control) {
    return ENDPOINT_CONTROLS.includes(control);
}

/**
 * Returns if all the given controls are endpoint-triggering controls.
 * 
 * @param {Array} controls The array of control names.
 */
function allEndpointControls(controls) {
    return controls.every((control) => isEndpointControl(control));
}

/**
 * Returns if an endpoint-triggering control exists in the given controls.
 * 
 * @param {Array} controls The array of control names.
 */
function hasEndpointControls(controls) {
    return controls.some((control) => isEndpointControl(control));
}

/**
 * Returns if the given control is an injection-based control.
 * 
 * @param {String} control The control being checked.
 */
function isInjectionControl(control) {
    return INJECTION_CONTROLS.includes(control);
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
        throwTypeError(`Type '${typeName}' is not registered.`);

    // Run the validator
    const validated = typeObj.validator(value);

    if (!validated) {
        throwValidationError(`Theme value '${value}' failed for type '${typeName}'`);
    }
}

function evaluateSection(path, section, theme, mixins, fullSchema, registeredTypes) {
    // Check for invalid syntax
    if (Array.isArray(section))
        throwSyntaxError("Arrays are not allowed in schemas");

    if (Array.isArray(theme))
        throwSyntaxError("Arrays are not allowed in themes");

    const allControls = Object.keys(section);

    // Base case: check for endpoint controls
    if (hasEndpointControls(allControls)) {
        if (!allEndpointControls(allControls)) {
            throwSyntaxError("Endpoint has non-endpoint controls");
        }

        // Theme should be a string, function or undefined/null now
        if (theme && (typeof theme !== "string" || typeof theme !== "function")) {
            throwInvalidThemeError(`Theme endpoint should be a string or function at path ${path}`);
        }

        // Get the theme value
        const themeVal = (typeof theme === 'function') ? theme() : theme;

        // Get the endpoint object
        const endpoint = {
            ...DEFAULT_ENDPOINT,
            ...section,
        }

        const required = endpoint[CONTROLS.REQUIRED];
        const type = endpoint[CONTROLS.TYPE];
        const validator = endpoint[CONTROLS.VALIDATE];
        const defaultVal = endpoint[CONTROLS.DEFAULT];

        // $validator provided case
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

        // $required=true case
        if (required) {
            // No theme value provided
            if (!themeVal) {
                throwValidationError(`No theme value provided when ${CONTROLS.REQUIRED}=true at path '${path}'`);
            }

            // Evaluate the type
            evaluateType(type, themeVal, registeredTypes);

            return { [path]: themeVal };
        }

        // $default provided and no theme provided case
        if (defaultVal && !themeVal) {
            // Evaluate default value
            evaluateType(type, defaultVal, registeredTypes);

            return { [path]: defaultVal };
        }

        // $default not provided and no theme provided case
        if (!defaultVal && !themeVal) {
            throwValidationError(`No theme and default value provided at path '${path}'`);
        }

        // Everything passes and theme value exists case
        
        // Evaluate theme value
        evaluateType(type, themeVal, registeredTypes);

        return { [path]: themeVal };
    }

    // Inject any mixins (making sure to remove the $mixin control)
    // TODO: complete

    // Inject any inheritances (making sure to remove the $inherits control)
    // TODO: complete
    

    if (typeof section === "object") {
        const evaluations = Object.entries(section).reduce((accumulator, [subSectionName, subSection]) => {
            const themeSubSection = theme[subSection];
            const newPath = addToPath(path, subSectionName);

            if (!themeSubSection) {
                throwInvalidThemeError("Theme subsection is missing at path partial", newPath);
            }

            // Recursively evaluate the sub sections
            const subSectionEvaluations = evaluateSection(newPath, subSection, themeSubSection, mixins, fullSchema);

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
    return evaluateSection("", schema, theme, schema, registeredTypes);
}

export default {
    generate
};