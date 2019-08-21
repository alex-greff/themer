import CONSTANTS from "../src/constants";
import { generate } from "../src/generate";

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

    test("mssing theme", () => {
        const schema = {
            "level-1": {}
        };

        const errorMessage = "Theme subsection is missing at path partial 'level-1'";

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