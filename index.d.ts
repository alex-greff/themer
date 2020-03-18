type Theme = object;
type Schema = object;
type Mixins = object;

interface CustomTypes {
    [name: string]: {
        name: string;
        validator(val: any): boolean;
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

declare module "themer" {
    export function generate(theme: Theme, schema: Schema, mixins?: Mixins, customTypes?: CustomTypes, options?: Options): GeneratedProperties;
}