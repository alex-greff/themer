import anyType from "../../src/types/any.type";

test("name", () => {
    expect(anyType.name).toBe("any");
});

test("validator", () => {
    expect(anyType.validator(7)).toBe(true);
    expect(anyType.validator("foo")).toBe(true);
    expect(anyType.validator(0)).toBe(true);
    expect(anyType.validator(-1.5)).toBe(true);
    expect(anyType.validator(null)).toBe(true);
    expect(anyType.validator(undefined)).toBe(true);
    expect(anyType.validator(true)).toBe(true);
    expect(anyType.validator(false)).toBe(true);
    expect(anyType.validator("3.5rem")).toBe(true);
    expect(anyType.validator("5.5deg")).toBe(true);
});