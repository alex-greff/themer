import stringType from "../../src/types/string.type";

test("name", () => {
    expect(stringType.name).toBe("string");
});

test("validator", () => {
    expect(stringType.validator("360deg")).toBe(true);
    expect(stringType.validator("-20rad")).toBe(true);
    expect(stringType.validator("0")).toBe(true);
    expect(stringType.validator("50rem")).toBe(true);
    expect(stringType.validator("0.5px")).toBe(true);
    expect(stringType.validator(".5em")).toBe(true);
    expect(stringType.validator("foo")).toBe(true);
    expect(stringType.validator("0.56")).toBe(true);
    expect(stringType.validator("undefined")).toBe(true);
    expect(stringType.validator("true")).toBe(true);
    expect(stringType.validator("false")).toBe(true);

    expect(stringType.validator(506)).toBe(false);
    expect(stringType.validator(-20)).toBe(false);
    expect(stringType.validator(0.56)).toBe(false);
    expect(stringType.validator(0)).toBe(false);
    expect(stringType.validator(null)).toBe(false);
    expect(stringType.validator(undefined)).toBe(false);
    expect(stringType.validator(false)).toBe(false);
    expect(stringType.validator(true)).toBe(false);
});