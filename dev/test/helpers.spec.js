/* global describe, it, expect */

describe("helpers.js", () => {
  describe("roundToNDecimals", () => {
    it("takes 2 numbers and returns a number", () => {
      expect(typeof roundToNDecimals(1, 2)).toBe("number");
    });
    it("rounds the second number to the precision of first number", () => {
      expect(roundToNDecimals(3, 5.256846549)).toBe(5.257);
    });
    it("returns NaN, when non-numeric parameters were given", () => {
      expect(roundToNDecimals("cat", ["foo", 5, "bar"])).toBeNaN();
    });
  });

  describe("isCent", () => {
    it("returns false, when given input is not a string", () => {
      expect(isCent(6.52)).toBe(false);
      expect(isCent([1, 2, 3])).toBe(false);
    });
    it("returns true, when given string is a floating point number", () => {
      expect(isCent("127.052")).toBe(true);
    });
    it("returns true, when given string has a dot, but doesn't have any decimals written", () => {
      expect(isCent("150.")).toBe(true);
    });
    it("returns true when given string contains whitespace around the number", () => {
      expect(isCent("700.0     ")).toBe(true);
      expect(isCent("         700.0")).toBe(true);
      expect(isCent("      700.0   \t")).toBe(true);
    });
    it("returns false, when given string contains multiple numbers", () => {
      expect(isCent("700. 500.")).toBe(false);
    });
    it("returns false, when the float in the given string contains whitespaces", () => {
      expect(isCent("3.   141592")).toBe(false);
    });
    it("returns false, when given string contains no numbers", () => {
      expect(isCent("hello")).toBe(false);
      expect(isCent("// this is a comment")).toBe(false);
      expect(isCent("")).toBe(false);
      expect(isCent("      ")).toBe(false);
    });
  });
});
