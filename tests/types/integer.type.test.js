import integerType from "../../src/types/integer.type";

test("name", () => {
    expect(integerType.name).toBe("integer");
});

test("validator", () => {
    expect(integerType.validator(506)).toBe(true);
    expect(integerType.validator(-20)).toBe(true);
    expect(integerType.validator(0)).toBe(true);

    expect(integerType.validator("foo")).toBe(false);
    expect(integerType.validator("6")).toBe(false);
    expect(integerType.validator(0.56)).toBe(false);
    expect(integerType.validator(null)).toBe(false);
    expect(integerType.validator(undefined)).toBe(false);
    expect(integerType.validator(false)).toBe(false);
    expect(integerType.validator(true)).toBe(false);
});