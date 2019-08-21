import CONSTANTS from "../src/constants";
import { generate } from "../src/generate";

const _ = CONSTANTS.SEPARATOR;
describe("simple cases", () => {
    test("1 level deep", () => {
        const schema = {
            schema: {
                "level-1": {}
            }
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
            schema: {
                "level-1": {
                    "level-2": {
                        "level-3": {
                            "level-4": {}
                        }
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
            schema: {
                "level-1a": {},
                "level-1b": {
                    "level-2": {}
                }
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
            schema: {
                "level-1a": {
                    "level-2a": {
                        "level-3a": {}
                    },
                    "level-2b":{}
                },
                "level-1b": {
                    "level-2c": {
                        "level-3b": {},
                        "level-3c": {}
                    }
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
});