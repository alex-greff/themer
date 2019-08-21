import colorType from "../../src/types/color.type";

test("name", () => {
    expect(colorType.name).toBe("color");
});

test("validator", () => {
    expect(colorType.validator("#000000")).toBe(true);
    expect(colorType.validator("rgba(0, 255, 20, 0.5)")).toBe(true);
    expect(colorType.validator("rgb(24, 55, 89)")).toBe(true);
    expect(colorType.validator("hsl(119, 100%, 50%)")).toBe(true);
    expect(colorType.validator("hsla(119, 100%, 50%, 0.5)")).toBe(true);

    expect(colorType.validator(1)).toBe(false);
    expect(colorType.validator("something")).toBe(false);
    expect(colorType.validator(null)).toBe(false);
    expect(colorType.validator(undefined)).toBe(false);
    expect(colorType.validator(true)).toBe(false);
    expect(colorType.validator(false)).toBe(false);
});