import rotationType from "../../src/types/rotation.type";

test("name", () => {
    expect(rotationType.name).toBe("rotation");
});

test("validator", () => {
    expect(rotationType.validator("360deg")).toBe(true);
    expect(rotationType.validator("-20rad")).toBe(true);
    expect(rotationType.validator("0")).toBe(true);
    expect(rotationType.validator("0turn")).toBe(true);
    expect(rotationType.validator(0)).toBe(true);
    expect(rotationType.validator("0.5deg")).toBe(true);
    expect(rotationType.validator(".5grad")).toBe(true);

    expect(rotationType.validator(506)).toBe(false);
    expect(rotationType.validator(-20)).toBe(false);
    expect(rotationType.validator(0.56)).toBe(false);
    expect(rotationType.validator("foo")).toBe(false);
    expect(rotationType.validator("0.56")).toBe(false);
    expect(rotationType.validator(null)).toBe(false);
    expect(rotationType.validator(undefined)).toBe(false);
    expect(rotationType.validator(false)).toBe(false);
    expect(rotationType.validator(true)).toBe(false);
});