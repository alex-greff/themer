export function throwErorr(message) {
    throw message;
}

export function throwSyntaxError(message) {
    throwErorr(`Invalid syntax: ${message}`);
}

export function throwInvalidThemeError(message) {
    throwErorr(`Invalid theme: ${message}`);
}

export function throwTypeError(message) {
    throwErorr(`Endpoint type: ${message}`);
}

export function throwValidationError(message) {
    throwErorr(`Validation error: ${message}`);
}

export function throwSchemaError(message) {
    throwErorr(`Schema error: ${message}`);
}

export function throwMixinError(message) {
    throwErorr(`Mixin error: ${message}`);
}

export default {
    throwErorr,
    throwSyntaxError,
    throwInvalidThemeError,
    throwTypeError,
    throwValidationError,
    throwSchemaError,
    throwMixinError,
};