/* global describe, it, expect */

describe("helpers.js", () => {
  describe("roundToNDecimals", () => {
    it("takes 2 numbers and returns a number", () => {
      expect(typeof roundToNDecimals(1, 2)).toBe("number");
    });
    it("rounds the second number to the precision of first number", () => {
      expect(roundToNDecimals(3, 5.256846549)).toBe(5.257);
    });
    it("returns NaN, when non-numeric parameters have been given", () => {
      expect(roundToNDecimals("cat", ["foo", 5, "bar"])).toBeNaN();
    });
  });
});
