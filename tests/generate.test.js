import CONSTANTS from "../src/constants";
import { generate } from "../src/generate";
import colorType from "../src/types/color.type";

const _ = CONSTANTS.SEPARATOR;

describe("general cases", () => {
    test("1 level deep", () => {
        const schema = {
            "level-1": {}
        };

        const theme = {
            "level-1": "foo"
        };

        const expectedOut = {
            "level-1": "foo"
        };

        const generated = generate(theme, schema);

        expect(generated).toEqual(expectedOut);
    });

    test("endpoint value types", () => {
        const schema = {
            "level-1a": {},
            "level-1b": {},
            "level-1c": {},
            "level-1d": {},
            "level-1e": {},
            "level-1f": {},
        };

        const theme = {
            "level-1a": "foo",
            "level-1b": 5,
            "level-1c": 0.556,
            "level-1d": false,
            "level-1e": () => "bar",
            "level-1f": { "foo": "bar" }
        };

        const expectedOut = {
            "level-1a": "foo",
            "level-1b": 5,
            "level-1c": 0.556,
            "level-1d": false,
            "level-1e": "bar",
            "level-1f": { "foo": "bar" }
        };

        const generated = generate(theme, schema);

        expect(generated).toEqual(expectedOut);
    });

    test("default values", () => {
        const schema = {
            "level-1a": {
                $default: "foo"
            },
            "level-1b": {
                $default: 5
            },
            "level-1c": {
                $default: 0.556
            },
            "level-1d": {
                $default: false
            },
            "level-1e": {
                $default: () => "bar"
            },
            "level-1f": {
                $default: { "foo": "bar" }
            }
        };

        const theme = {};

        const expectedOut = {
            "level-1a": "foo",
            "level-1b": 5,
            "level-1c": 0.556,
            "level-1d": false,
            "level-1e": "bar",
            "level-1f": { "foo": "bar" }
        };

        const generated = generate(theme, schema);

        expect(generated).toEqual(expectedOut);
    });

    test("invalid default type containing endpoint controls", () => {
        const schema = {
            "level-1": {
                $default: {
                    $required: true
                }
            }
        };

        const theme = {
            "level-1": "foo"
        };

        const errorMessage = "Schema error: $default value of type object is not a valid type at path 'level-1'";

        expect(() => {
            generate(theme, schema);
        }).toThrow(errorMessage);
    });

    test("multi level deep", () => {
        const schema = {
            "level-1": {
                "level-2": {
                    "level-3": {
                        "level-4": {}
                    }
                }
            }
        };

        const theme = {
            "level-1": {
                "level-2": {
                    "level-3": {
                        "level-4": "foo"
                    }
                }
            }
        };

        const expectedOut = {
            [`level-1${_}level-2${_}level-3${_}level-4`]: "foo"
        };

        const generated = generate(theme, schema);

        expect(generated).toEqual(expectedOut);
    });

    test("mutliple root branches", () => {
        const schema = {
            "level-1a": {},
            "level-1b": {
                "level-2": {}
            }
        };

        const theme = {
            "level-1a": "foo",
            "level-1b": {
                "level-2": "bar"
            }
        };

        const expectedOut = {
            [`level-1a`]: "foo",
            [`level-1b${_}level-2`]: "bar"
        };

        const generated = generate(theme, schema);

        expect(generated).toEqual(expectedOut);
    });

    test("complex simple schema", () => {
        const schema = {
            "level-1a": {
                "level-2a": {
                    "level-3a": {}
                },
                "level-2b": {}
            },
            "level-1b": {
                "level-2c": {
                    "level-3b": {},
                    "level-3c": {}
                }
            }
        };

        const theme = {
            "level-1a": {
                "level-2a": {
                    "level-3a": "foo"
                },
                "level-2b": "bar"
            },
            "level-1b": {
                "level-2c": {
                    "level-3b": "foobar",
                    "level-3c": "barfoo"
                }
            }
        };

        const expectedOut = {
            [`level-1a${_}level-2a${_}level-3a`]: "foo",
            [`level-1a${_}level-2b`]: "bar",
            [`level-1b${_}level-2c${_}level-3b`]: "foobar",
            [`level-1b${_}level-2c${_}level-3c`]: "barfoo"
        };

        const generated = generate(theme, schema);

        expect(generated).toEqual(expectedOut);
    });

    test("empty schema", () => {
        const schema = {};

        const theme = {};

        const errorMessage = "Schema error: Schema must not be an empty object";

        expect(() => {
            generate(theme, schema);
        }).toThrow(errorMessage);       
    });

    test("invalid endpoint value at root", () => {
        const schema = {
            "level-1": "foo"
        };

        const theme = {
            "level-1": "bar"
        };

        const errorMessage = "Schema error: Invalid endpoint section of type 'string' at path 'level-1'";

        expect(() => {
            generate(theme, schema);
        }).toThrow(errorMessage);
    });

    test("invalid endpoint value in subsection", () => {
        const schema = {
            "level-1": {
                "foo": false
            }
        };

        const theme = {
            "level-1": {
                "foo": "bar"
            }
        };

        const errorMessage = "Schema error: Invalid endpoint section of type 'boolean' at path 'level-1.foo'";

        expect(() => {
            generate(theme, schema);
        }).toThrow(errorMessage);
    });

    test("endpoint at root", () => {
        const schema = {
            $required: true
        };

        const theme = {};

        const errorMessage = "Schema error: Endpoint controls at schema root are not valid";

        expect(() => {
            generate(theme, schema);
        }).toThrow(errorMessage);
    });

    test("schema with functions", () => {
        const schema = function () {
            return {
                "level-1a"() {
                    return {};
                },
                "level-1b"() {
                    return {
                        "level-2"() {
                            return {};
                        }
                    }
                }

            };
        }

        const theme = {
            "level-1a": "foo",
            "level-1b": {
                "level-2": "bar"
            }
        };

        const expectedOut = {
            "level-1a": "foo",
            [`level-1b${_}level-2`]: "bar"
        };

        const generated = generate(theme, schema);

        expect(generated).toEqual(expectedOut);
    });

    test("theme with functions", () => {
        const schema = {
            "level-1": {
                "level-2": {}
            }
        };

        const theme = function () {
            return {
                "level-1"() {
                    return {
                        "level-2"() {
                            return "foo"
                        }
                    }
                }
            };
        }

        const expectedOut = {
            [`level-1${_}level-2`]: "foo"
        };

        const generated = generate(theme, schema);

        expect(generated).toEqual(expectedOut);
    });

    test("invalid schema endpoint", () => {
        const schema = {
            "level-1": {
                "$invalid-control": "something"
            }
        };

        const theme = {
            "level-1": "foo"
        };

        const errorMessage = "Invalid syntax: Control '$invalid-control' does not exist"

        expect(() => {
            generate(theme, schema);
        }).toThrow(errorMessage);
    });

    test("missing theme", () => {
        const schema = {
            "level-1": {}
        };

        const errorMessage = "Invalid theme: Theme subsection is missing at path partial 'level-1'";

        expect(() => {
            generate({}, schema);
        }).toThrow(errorMessage);
    });

    test("missing theme endpoint", () => {
        const schema = {
            "level-1": {
                "level-2": {}
            }
        };

        const theme = {
            "level-1": "foo"
        };

        const errorMessage = "Invalid theme: Theme subsection is missing at path partial 'level-1.level-2'";

        expect(() => {
            generate(theme, schema);
        }).toThrow(errorMessage);
    });

    test("custom type", () => {
        const schema = {
            "level-1": {
                $type: "fooOnly"
            }
        };

        const customTypes = {
            "fooOnly": {
                name: "fooOnly",
                validator(val) {
                    return val === "foo"
                }
            }
        };

        // Test valid value

        const themeValid = {
            "level-1": "foo"
        };

        const expectedOut = {
            "level-1": "foo"
        };

        const generated = generate(themeValid, schema, {}, customTypes);
        expect(generated).toEqual(expectedOut);


        // Test invalid value

        const themeInvalid = {
            "level-1": "bar"
        };

        const errorMessage = "Validation error: Theme value 'bar' failed for type 'fooOnly'";

        expect(() => {
            generate(themeInvalid, schema, {}, customTypes);
        }).toThrow(errorMessage);
    });

    test("custom type function", () => {
        const schema = {
            "level-1": {
                $type: "fooOnly"
            }
        };

        const customTypes = function() {
            return {
                "fooOnly": {
                    name: "fooOnly",
                    validator(val) {
                        return val === "foo"
                    }
                }
            }
        };

        // Test valid value

        const themeValid = {
            "level-1": "foo"
        };

        const expectedOut = {
            "level-1": "foo"
        };

        const generated = generate(themeValid, schema, {}, customTypes);
        expect(generated).toEqual(expectedOut);


        // Test invalid value

        const themeInvalid = {
            "level-1": "bar"
        };

        const errorMessage = "Validation error: Theme value 'bar' failed for type 'fooOnly'";

        expect(() => {
            generate(themeInvalid, schema, {}, customTypes);
        }).toThrow(errorMessage);
    });
});

describe("mixin cases", () => {
    test("simple mixin", () => {
        const schema = {
            "level-1": {
                $mixins: "mixin-1"
            }
        };

        const mixins = {
            "mixin-1": {
                "level-2": {}
            }
        };

        const theme = {
            "level-1": {
                "level-2": "foo"
            }
        };

        const expectedOut = {
            [`level-1${_}level-2`]: "foo"
        };

        const generated = generate(theme, schema, mixins);

        expect(generated).toEqual(expectedOut);
    }); 

    test("deep level mixin", () => {
        const schema = {
            "level-1": {
                $mixins: "mixin-1.sub-level-1.sub-level-2"
            }
        };

        const mixins = {
            "mixin-1": {
                "sub-level-1": { 
                    "sub-level-2": {
                        "level-2": {}
                    }
                }
            }
        };

        const theme = {
            "level-1": { 
                "level-2": "foo"
            }
        };

        const expectedOut = {
            [`level-1${_}level-2`]: "foo"
        };

        const generated = generate(theme, schema, mixins);

        expect(generated).toEqual(expectedOut);
    });

    test("mixin at root level", () => {
        const schema = {
            $mixins: "mixin-1"
        };

        const mixins = {
            "mixin-1": {
                "level-1": {
                    "level-2": {}
                }
            }
        };

        const theme = {
            "level-1": {
                "level-2": "foo"
            }
        };

        const expectedOut = {
            [`level-1${_}level-2`]: "foo"
        };

        const generated = generate(theme, schema, mixins);

        expect(generated).toEqual(expectedOut);
    });

    test("empty mixin at root", () => {
        const schema = {
            $mixins: "mixin-1"
        };

        const mixins = {
            "mixin-1": {}
        };

        const theme = {};

        const errorMessage = "Schema error: Schema must not be an empty object";

        expect(() => {
            generate(theme, schema, mixins);
        }).toThrow(errorMessage);   
    });

    test("mixin endpoint at root", () => {
        const schema = {
            $mixins: "mixin-1"
        };

        const mixins = {
            "mixin-1": {
                $required: true
            }
        };

        const theme = {};

        const errorMessage = "Schema error: Endpoint controls at schema root are not valid";

        expect(() => {
            generate(theme, schema, mixins);
        }).toThrow(errorMessage);
    });

    test("empty mixin in sub-section", () => {
        const schema = {
            "level-1": {
                $mixins: "mixin-1"
            }
        };

        const mixins = {
            "mixin-1": {}
        };

        const theme = {
            "level-1": "foo"
        };

        const expectedOut = {
            "level-1": "foo"
        };

        const generated = generate(theme, schema, mixins);

        expect(generated).toEqual(expectedOut);
    });

    test("multiple mixins", () => {
        const schema = {
            "level-1a": {
                $mixins: ["mixin-1", "mixin-2"]
            },
            "level-1b": {
                $mixins: ["mixin-1.level-2a"]
            }
        };

        const mixins = {
            "mixin-1": {
                "level-2a": {}
            },
            "mixin-2": {
                "level-2b": {}
            }
        };

        const theme = {
            "level-1a": {
                "level-2a": "foo",
                "level-2b": "bar"
            },
            "level-1b": "foobar"
        };

        const expectedOut = {
            [`level-1a${_}level-2a`]: "foo",
            [`level-1a${_}level-2b`]: "bar",
            [`level-1b`]: "foobar"
        };

        const generated = generate(theme, schema, mixins);

        expect(generated).toEqual(expectedOut);
    });

    test("mixins with functions", () => {
        const schema = {
            $mixins: "mixin-1",
            "level-1c": {
                $mixins: "mixin-1.level-1b"
            }
        };

        const mixins = function() {
            return {
                "mixin-1"() {
                    return {
                        "level-1a"() {
                            return {};
                        },
                        "level-1b"() {
                            return {
                                "level-2"() {
                                    return {}
                                }
                            }
                        }
                    }
                }
            };
        };

        const theme = {
            "level-1a": "foo",
            "level-1b": {
                "level-2": "bar"
            },
            "level-1c": {
                "level-2": "foobar"
            }
        };

        const expectedOut = {
            [`level-1a`]: "foo",
            [`level-1b${_}level-2`]: "bar",
            [`level-1c${_}level-2`]: "foobar"
        };

        const generated = generate(theme, schema, mixins);

        expect(generated).toEqual(expectedOut); 
    });

    test("mixin with invalid name", () => {
        const schema = {
            $mixins: "$required"
        };

        const mixin = {
            "$required": {
                "level-1": {}
            }
        };

        const theme = {
            "level-1": "foo"
        };

        const errorMessage = "Mixin error: Invalid mixin name '$required' at path ''";

        expect(() => {
            generate(theme, schema, mixin);
        }).toThrow(errorMessage);
    });

    test("mixin with invalid syntax", () => {
        const schema = {
            $mixins: "mixin-1"
        };

        const mixins = {
            "mixin-1": {
                "level-1": {
                    "$invalid-control": "something"
                }
            }
        };

        const theme = {
            "level-1": "foo"
        };

        const errorMessage = "Invalid syntax: Control '$invalid-control' does not exist";

        expect(() => {
            generate(theme, schema, mixins);
        }).toThrow(errorMessage);
    });

    test("missing mixin", () => {
        const schema = {
            $mixins: "missing-mixin"
        };

        const mixins = {};

        const theme = {};

        const errorMessage = "Schema error: Mixin 'missing-mixin' not found";

        expect(() => {
            generate(theme, schema, mixins);
        }).toThrow(errorMessage);
    });

    test("mixin with missing theme endpoint", () => {
        const schema = {
            $mixins: "mixin-1"
        };

        const mixins = {
            "mixin-1": {
                "level-1": {
                    "level-2": {}
                }
            }
        };

        const theme = {
            "level-1": {}
        };

        const errorMessage = "Invalid theme: Theme subsection is missing at path partial 'level-1.level-2'";
        
        expect(() => {
            generate(theme, schema, mixins);
        }).toThrow(errorMessage);
    });

    test("mixin within mixin", () => {
        const schema = {
            $mixins: "mixin-1"
        };

        const mixins = {
            "mixin-1": {
                "level-1": {
                    $mixins: "mixin-2"
                }
            },
            "mixin-2": {
                "level-2": {}
            }
        };

        const theme = {
            "level-1": {
                "level-2": "foo"
            }
        };

        const expectedOut = {
            [`level-1${_}level-2`]: "foo"
        };

        const generated = generate(theme, schema, mixins);

        expect(generated).toEqual(expectedOut);
    });
});

describe("inheritance cases", () => {
    test("simple inheritance", () => {
        const schema = {
            "level-1a": {},
            "level-1b": {
                $inherits: "level-1a"
            }
        };

        const theme = {
            "level-1a": "foo"
        };

        const expectedOut =  {
            "level-1a": "foo",
            "level-1b": "foo"
        };

        const generated = generate(theme, schema);

        expect(generated).toEqual(expectedOut);
    });

    test("deep inheritance", () => {
        const schema = {
            "level-1a": {
                "level-2a": {
                    "level-3a": {}
                }, 
                "level-2b": {}
            },
            "level-1b": {
                $inherits: "level-1a.level-2a.level-3a"
            },
            "level-1c": {
                $inherits: "level-1a"
            }
        };

        const theme = {
            "level-1a": {
                "level-2a": {
                    "level-3a": "foo"
                },
                "level-2b": "bar"
            }
        };

        const expectedOut = {
            [`level-1a${_}level-2a${_}level-3a`]: "foo",
            [`level-1a${_}level-2b`]: "bar",
            [`level-1b`]: "foo",
            [`level-1c${_}level-2a${_}level-3a`]: "foo",
            [`level-1c${_}level-2b`]: "bar"
        };

        const generated = generate(theme, schema);

        expect(generated).toEqual(expectedOut);
    });

    test("multiple inheritances attempt", () => {
        const schema = {
            "level-1a": {},
            "level-1b": {},
            "level-1c": {
                $inherits: ["level-1a", "level-1b"]
            }
        };

        const theme = {
            "level-1a": "foo",
            "level-1b": "bar"
        };

        const errorMessage = "Schema error: Arrays are not allowed with $inherits";

        expect(() => {
            generate(theme, schema);
        }).toThrow(errorMessage);
    });

    test("missing inheritance", () => {
        const schema = {
            "level-1b": {
                $inherits: "level-1a"
            }
        };

        const theme = {
            "level-1a": "foo"
        };

        const errorMessage = "Schema error: No inheritance values have been computed for 'level-1a'. This might be because it is defined after the inheritance definition.";

        expect(() => {
            generate(theme, schema);
        }).toThrow(errorMessage);
    });

    test("attempted inheritance override in theme", () => {
        const schema = {
            "level-1a": {},
            "level-1b": {
                $inherits: "level-1a"
            }
        };

        const theme = {
            "level-1a": "foo",
            "level-1b": "bar"
        };

        const errorMessage = "Invalid theme: Setting value of already computed inheritance value is invalid at path 'level-1b'";

        expect(() => {
            generate(theme, schema);
        }).toThrow(errorMessage);
    });

    test("inheritance and endpoint control in same sub-section", () => {
        const schema = {
            "level-1a": {},
            "level-1b": {
                $inherits: "level-1a",
                $required: false
            }
        };

        const theme = {
            "level-1a": "foo",
        };

        const errorMessage = "The inheritance control and endpoint controls are not valid in the same sub-section. At path ''";

        expect(() => {
            generate(theme,schema)
        }).toThrow(errorMessage);
    });

    test("inheritance at schema root", () => {
        const schema = {
            "level-1": {},
            $inherits: "level-1"
        };

        const theme = {
            "level-1": "foo"
        };

        const errorMessage = "Schema error: $inherits is not valid at schema root";

        expect(() => {
            generate(theme, schema);
        }).toThrow(errorMessage);
    });

    test("inherits with a function", () => {
        const schema = {
            "level-1a": {},
            "level-1b": {
                $inherits() {
                    return "level-1a"
                }
            }
        };

        const theme = {
            "level-1a": "foo"
        };

        const expectedOut = {
            "level-1a": "foo",
            "level-1b": "foo"
        };

        const generated = generate(theme, schema);

        expect(generated).toEqual(expectedOut);
    });

    test("circular inheritance", () => {
        const schema = {
            "level-1": {
                $inherits: "level-1"
            }
        };

        const theme = {
            "level-1": "foo"
        };

        const errorMessage = "No inheritance values have been computed for 'level-1'. This might be because it is defined after the inheritance definition.";

        expect(() => {
            generate(theme, schema);
        }).toThrow(errorMessage);
    });

    test("inheritance within inheritance", () => {
        const schema = {
            "level-1a": {},
            "level-1b": {
                "level-2a": {
                    $inherits: "level-1a"
                },
                "level-2b": {}
            },
            "level-1c": {
                $inherits: "level-1b"
            }
        };

        const theme = {
            "level-1a": "foo",
            "level-1b": {
                "level-2b": "bar"
            }
        };

        const expectedOut = {
            [`level-1a`]: "foo",
            [`level-1b${_}level-2a`]: "foo",
            [`level-1b${_}level-2b`]: "bar",
            [`level-1c${_}level-2a`]: "foo",
            [`level-1c${_}level-2b`]: "bar"
        };

        const generated = generate(theme, schema);

        expect(generated).toEqual(expectedOut);
    });
});

describe("option tests", () => {
    test("with color standardization", () => {
        const schema = {
            "level-1a": {
                $type: colorType.name
            },
            "level-1b": {
                $type: colorType.name
            },
            "level-1c": {
                $type: colorType.name
            },
            "level-1d": {
                $type: colorType.name
            },
            "level-1e": {
                $type: colorType.name
            },
            "level-1f": {
                $type: colorType.name
            }
        };

        const theme = {
            "level-1a": "rgb(70, 171, 225)",
            "level-1b": "hsl(201, 69%, 58%)",
            "level-1c": "#46ABE1",
            "level-1d": "rgba(70, 171, 225, 0.5)",
            "level-1e": "hsla(201, 69%, 58%, 0.5)",
            "level-1f": "red"
        };

        const options = {
            STANDARDIZE_COLORS: true
        };

        const expectedOut = {
            "level-1a": "70, 171, 225",
            "level-1b": "74.00099999999995, 170.06969999999995, 221.79900000000004",
            "level-1c": "70, 171, 225",
            "level-1d": "70, 171, 225",
            "level-1e": "74.00099999999995, 170.06969999999995, 221.79900000000004",
            "level-1f": "255, 0, 0"
        };

        const generated = generate(theme, schema, {}, {}, options);

        expect(generated).toEqual(expectedOut);
    });

    test("without color standardization", () => {
        const schema = {
            "level-1a": {
                $type: colorType.name
            },
            "level-1b": {
                $type: colorType.name
            },
            "level-1c": {
                $type: colorType.name
            },
            "level-1d": {
                $type: colorType.name
            },
            "level-1e": {
                $type: colorType.name
            },
            "level-1f": {
                $type: colorType.name
            }
        };

        const theme = {
            "level-1a": "rgb(70, 171, 225)",
            "level-1b": "hsl(201, 69%, 58%)",
            "level-1c": "#46ABE1",
            "level-1d": "rgba(70, 171, 225, 0.5)",
            "level-1e": "hsla(201, 69%, 58%, 0.5)",
            "level-1f": "red"
        };

        const options = {
            STANDARDIZE_COLORS: false
        };

        const expectedOut = {
            "level-1a": "rgb(70, 171, 225)",
            "level-1b": "hsl(201, 69%, 58%)",
            "level-1c": "#46ABE1",
            "level-1d": "rgba(70, 171, 225, 0.5)",
            "level-1e": "hsla(201, 69%, 58%, 0.5)",
            "level-1f": "red"
        };

        const generated = generate(theme, schema, {}, {}, options);

        expect(generated).toEqual(expectedOut);
    });

    test("custom separator", () => {
        const schema = {
            "level-1": {
                "level-2": {}
            }
        };

        const theme = {
            "level-1": {
                "level-2": "foo"
            }
        };

        const options = {
            SEPARATOR: "-=_=-"
        };

        const expectedOut = {
            "level-1-=_=-level-2": "foo"
        };

        const generated = generate(theme, schema, {}, {}, options);

        expect(generated).toEqual(expectedOut);
    });

    test("custom prefix", () => {
        const schema = {
            "level-1": {
                "level-2": {}
            }
        };

        const theme = {
            "level-1": {
                "level-2": "foo"
            }
        };

        const options = {
            PREFIX: "--"
        };

        const expectedOut = {
            "--level-1__level-2": "foo"
        };

        const generated = generate(theme, schema, {}, {}, options);

        expect(generated).toEqual(expectedOut);
    });

    test("custom default endpoint", () => {
        const schema = {
            "level-1": {}
        };

        const options = {
            DEFAULT_ENDPOINT: {
                $type: colorType.name,
                $required: false,
                $default: "rgb(255, 0, 0)"
            }
        };

        // Case 1: specified valid endpoint value

        const theme_good_1 = {
            "level-1": "rgb(20, 50, 45)"
        };

        const expectedOut_1 = {
            "level-1": "20, 50, 45"
        };

        const generated_1 = generate(theme_good_1, schema, {}, {}, options);

        expect(generated_1).toEqual(expectedOut_1)

        // Case 2: unspecified, default value

        const theme_good_2 = {};

        const expectedOut_2 = {
            "level-1": "255, 0, 0"
        };

        const generated_2 = generate(theme_good_2, schema, {}, {}, options);

        expect(generated_2).toEqual(expectedOut_2);

        // Case 3: specified invalid endpoint value

        const theme_bad = {
            "level-1": "foo"
        };

        const errorMessage = "Validation error: Theme value 'foo' failed for type 'color'";

        expect(() => {
            generate(theme_bad, schema, {}, {}, options);
        }).toThrow(errorMessage);
    });
});