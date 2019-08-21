import Checks from "./checks";
import Errors from "./errors";

export class TypeBuilder {
    constructor() {
        this.types = {};
    }

    /**
     * Adds a new type.
     * 
     * @param {String} name The name of the type
     * @param {Function} validator The validator for the type.
     */
    addType(name, validator) {
        // Check if default type
        if (Checks.isDefaultType(name)) {
            Errors.throwTypeError(`Type '${name}' is a default type.`);
        }

        // Check if already exists
        if (this.types[name]) {
            Errors.throwTypeError(`Type '${name}' already exists.`);
        }

        // Construct the type
        this.types[name] = {
            name,
            validator
        };

        return this;
    }

    /**
     * Builds the types object that can be fed into the generator.
     */
    build() {
        return this.types;
    }
};

export default TypeBuilder;