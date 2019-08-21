import lengthType from "../../src/types/length.type";

test("name", () => {
    expect(lengthType.name).toBe("length");
});

test("validator", () => {
    expect(lengthType.validator("5rem")).toBe(true);
    expect(lengthType.validator("-5cm")).toBe(true);
    expect(lengthType.validator("0")).toBe(true);
    expect(lengthType.validator("0vh")).toBe(true);
    expect(lengthType.validator(0)).toBe(true);
    expect(lengthType.validator("0.5px")).toBe(true);
    expect(lengthType.validator(".5px")).toBe(true);

    expect(lengthType.validator(506)).toBe(false);
    expect(lengthType.validator(-20)).toBe(false);
    expect(lengthType.validator(0.56)).toBe(false);
    expect(lengthType.validator("foo")).toBe(false);
    expect(lengthType.validator("0.56")).toBe(false);
    expect(lengthType.validator(null)).toBe(false);
    expect(lengthType.validator(undefined)).toBe(false);
    expect(lengthType.validator(false)).toBe(false);
    expect(lengthType.validator(true)).toBe(false);
});