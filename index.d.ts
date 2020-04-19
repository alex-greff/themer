interface Endpoint {
    $required?: boolean;
    $type?: string;
    $default?: string;
    $validate?(val: unknown): boolean;
}

interface SubSection {
    [section: string]: SubSection | Mixin | Inherits | Endpoint;
};

interface Mixin {
    $mixins: string | string[];
    [section: string]: SubSection | Mixin | Inherits | Endpoint;
}

interface Inherits {
    $inherits: string;
    [section: string]: SubSection | Mixin | Inherits | Endpoint;
}

type Theme = object;
type Schema = {
    GLOBAL: {
        [section: string]: SubSection | Mixin | Inherits | Endpoint;
    },
    [topLevelSection: string]: SubSection | Endpoint;
};

type MixinDefinitions = object;

interface CustomTypes {
    [name: string]: {
        name: string;
        validator(val: unknown): boolean;
    }
}

interface Options {
    SEPARATOR?: string;
    PREFIX?: string;
    DEFAULT_ENDPOINT?: string;
    STANDARDIZE_COLORS?: boolean;
    CONDENSE_KEYS?: boolean;
}

interface GeneratedProperties {
    [cssVar: string]: any
}

export class TypeBuilder {
    addType(name: string, validator: (val: unknown) => boolean): void;
    build(): CustomTypes;
}

export function generate(theme: Theme, schema: Schema, mixins?: MixinDefinitions, customTypes?: CustomTypes, options?: Options): GeneratedProperties;