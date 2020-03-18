type Theme = object;
type Schema = object;
type Mixins = object;

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

export function generate(theme: Theme, schema: Schema, mixins?: Mixins, customTypes?: CustomTypes, options?: Options): GeneratedProperties;