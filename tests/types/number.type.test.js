import numberType from "../../src/types/number.type";

test("name", () => {
    expect(numberType.name).toBe("number");
});

test("validator", () => {
    expect(numberType.validator(506)).toBe(true);
    expect(numberType.validator(-20)).toBe(true);
    expect(numberType.validator(0)).toBe(true);
    expect(numberType.validator(0.56)).toBe(true);

    expect(numberType.validator("foo")).toBe(false);
    expect(numberType.validator("0.56")).toBe(false);
    expect(numberType.validator(null)).toBe(false);
    expect(numberType.validator(undefined)).toBe(false);
    expect(numberType.validator(false)).toBe(false);
    expect(numberType.validator(true)).toBe(false);
});