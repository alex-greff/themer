import anyType from "./types/any.type";

export const SEPARATOR = "__";

export const CONTROLS = {
    REQUIRED: "$required",
    TYPE: "$type",
    DEFAULT: "$default",
    VALIDATE: "$validate",
    INHERITES: "$inherits",
    MIXINS: "$mixins"
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
    [CONTROLS.TYPE]: anyType.name,
    [CONTROLS.DEFAULT]: null,
    [CONTROLS.VALIDATE]: null
};

export const DEFAULT_OPTIONS = {
    SEPARATOR: SEPARATOR,
    DEFAULT_ENDPOINT: DEFAULT_ENDPOINT,
    STANDARDIZE_COLORS: true,
};

export default {
    SEPARATOR,
    CONTROLS,
    ENDPOINT_CONTROLS,
    INJECTION_CONTROLS,
    DEFAULT_ENDPOINT,
    DEFAULT_OPTIONS,
};