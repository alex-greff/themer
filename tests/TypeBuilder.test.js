import TypeBuilder from "../src/TypeBuilder";

// test("test", () => {
//     expect(true).toBe(true);
// });

describe("TypeBuilder tests", () => {
    let tb = new TypeBuilder();

    beforeEach(() => {
        tb = new TypeBuilder();
    });

    test("build with empty", () => {
        const expected = {};

        const build = tb.build();
        
        expect(build).toEqual(expected);
    });

    test("build with one type", () => {
        function validator() {
            return true;
        }

        tb.addType("type-1", validator);

        const expected = {
            "type-1": {
                name: "type-1",
                validator: validator
            }
        };

        const build = tb.build();

        expect(build).toEqual(expected);
    });

    test("build with two types", () => {
        function validator1() {
            return true;
        }

        function validator2() {
            return true;
        }

        tb.addType("type-1", validator1);
        tb.addType("type-2", validator2);

        const expected = {
            "type-1": {
                name: "type-1",
                validator: validator1
            },
            "type-2": {
                name: "type-2",
                validator: validator2
            }
        };

        const build = tb.build();

        expect(build).toEqual(expected);
    });

    test("add type with reserved default name", () => {
        const errorMessage = "Type 'color' is a default type.";

        expect(() => {
            tb.addType("color", () => true);
        }).toThrow(errorMessage);
    });

    test("add type twice", () => {
        const errorMessage = "Type 'type-1' already exists.";

        tb.addType("type-1", () => true);

        expect(() => {
            tb.addType("type-1", () => true);
        }).toThrow(errorMessage);
    });
});