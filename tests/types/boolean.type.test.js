import booleanType from "../../src/types/boolean.type";

test("name", () => {
    expect(booleanType.name).toBe("boolean");
});

test("validator", () => {
    expect(booleanType.validator(true)).toBe(true);
    expect(booleanType.validator(false)).toBe(true);

    expect(booleanType.validator("false")).toBe(false);
    expect(booleanType.validator(1)).toBe(false);
    expect(booleanType.validator(0.56)).toBe(false);
    expect(booleanType.validator(null)).toBe(false);
    expect(booleanType.validator(undefined)).toBe(false);
});