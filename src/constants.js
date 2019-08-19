export const SEPARATOR = "__";

export const CONTROLS = {
    REQUIRED: "$required",
    TYPE: "$type",
    DEFAULT: "$default",
    VALIDATE: "$validate",
    INHERITES: "$inherits",
    MIXIN: "$mixin"
};

export const ENDPOINT_CONTROLS = [
    CONTROLS.REQUIRED,
    CONTROLS.TYPE,
    CONTROLS.DEFAULT,
    CONTROLS.VALIDATE
];

export const INJECTION_CONTROLS = [
    CONTROLS.INHERITES,
    CONTROLS.MIXIN
];

export const DEFAULT_ENDPOINT = {
    [CONTROLS.REQUIRED]: false,
    [CONTROLS.TYPE]: "all",
    [CONTROLS.DEFAULT]: null,
    [CONTROLS.VALIDATE]: null
};

export default {
    SEPARATOR,
    CONTROLS,
    ENDPOINT_CONTROLS,
    INJECTION_CONTROLS,
    DEFAULT_ENDPOINT
};