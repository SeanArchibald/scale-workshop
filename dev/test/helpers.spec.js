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

  describe("isCommaDecimal", () => {
    it("returns false, when given input is not a string", () => {
      expect(isCommaDecimal(6.52)).toBe(false);
      expect(isCommaDecimal([1, 2, 3])).toBe(false);
    });
    it("returns false, when given string is a standard floating point number", () => {
      expect(isCommaDecimal("12.34")).toBe(false);
    });
    it("returns true, when given string is a floating point number, but with a comma replacing a point", () => {
      expect(isCommaDecimal("127,052")).toBe(true);
    });
    it("returns true, when given string has a comma, but doesn't have any decimals written", () => {
      expect(isCommaDecimal("150,")).toBe(true);
    });
    it("returns true when given string contains whitespace around the number", () => {
      expect(isCommaDecimal("700,0     ")).toBe(true);
      expect(isCommaDecimal("         700,0")).toBe(true);
      expect(isCommaDecimal("      700,0   \t")).toBe(true);
    });
    it("returns false, when given string contains multiple numbers", () => {
      expect(isCommaDecimal("700, 500,")).toBe(false);
    });
    it("returns false, when the float in the given string contains whitespaces", () => {
      expect(isCommaDecimal("3,   141592")).toBe(false);
    });
    it("returns false, when given string contains no numbers", () => {
      expect(isCommaDecimal("hello")).toBe(false);
      expect(isCommaDecimal("// this is a comment")).toBe(false);
      expect(isCommaDecimal("")).toBe(false);
      expect(isCommaDecimal("      ")).toBe(false);
    });
  });

  describe("sum_array", () => {
    it("takes an array of numbers and returns a number", () => {
      expect(typeof sum_array([1, 2, 3, 4]).toBe("number"));
    });
    it("sums the numbers in an array", () => {
      expect(sum_array([1, 2, 3, 4])).toBe(10);
    });
    it("sums the numbers in an array up to a stopping index", () => {
      expect(sum_array([1, 2, 3, 4], 3)).toBe(6);
    });
    it("returns NaN, when array contains non-numeric values", () => {
      expect(sum_arrray([1, "foo"])).toBeNaN();
    });
  });

  describe("rotate", () => {
    it("shifts the values of an array, with wrapping indicies", () => {
      expect(rotate([0, "foo", "bar", 1], 5)).toBe([1, 0, "foo", "bar"]);
      expect(rotate([0, "foo", "bar", 1], -5)).toBe(["foo", "bar", 1, 0]);
    });
  });

  describe("get_cf", () => {
    it("takes a number and caculates it's continued fraction representation", () => {
      expect(get_cf(1.25)).toBe([1, 4]);
      expect(get_cf(1 / 3)).toBe([1, 3]);
      expect(get_cf(Math.sqrt(2), 4)).toBe([1, 2, 2, 2]);
      expect(get_cf(Math.PI)).toBe([3, 7, 15, 1, 292, 1, 1, 1, 2, 1, 3, 1, 14, 3, 3]);
    });
    it("returns an array containing zero if set to 0 iterations", () => {
      expect(get_cf(1, 0).toBe([0]));
    });
    it("round significant digits down to 0 if they are below a given precision", () => {
      expect(get_cf(1 + 1e-7, 4, 6)).toBe([1]);
      expect(get_cf(Math.PI, 15, 2)).toBe([3, 7, 15, 1]);
    });
    it("returns NaN if given a non-numerical value", () => {
      expect(get_cf("foo")).toBeNaN();
    });
  });

  describe("get_convergent", () => {
    it("takes a number and returns a [numerator, denominator] pair of a ratio in its convergent series", () => {
      expect(get_convergent([3])).toBe([3, 1]);
      expect(get_convergent([1, 1, 1])).toBe([3, 2]);
      expect(get_convergent([1, 2, 10])).toBe([31, 21]);
      expect(get_convergent(get_cf(Math.PI), 3)).toBe([333, 106]);
    });
    it("returns NaN if the given array contains a non-numerical value", () => {
      expect(get_convergent([1, "foo"])).toBeNaN();
    });
  })

  describe("decimal_to_ratio", () => {
    it("takes a decimal value and returns its ratio represention as a string", () => {
      // expect(decimal_to_ratio(0)).toBe("0/1");
      expect(decimal_to_ratio("1.25")).toBe("5/4");
      expect(decimal_to_ratio(1 / 3)).toBe("1/3");
      expect(decimal_to_ratio(Math.PI).toBe("817696623/260280919"));
    });
    it("parses the ratio with given a given depth", () => {
      expect(decimal_to_ratio(Math.PI, 1)).toBe("3/1");
      expect(decimal_to_ratio(Math.PI, 2)).toBe("22/7");
      expect(decimal_to_ratio(Math.PI, 3)).toBe("333/106");
    });
    it("returns false if the given decimal is not a valid LINE_TYPE.DECIMAL", () => {
      expect(decimal_to_ratio("foo")).toBe(false);
    });
  });

  describe("cents_to_ratio", () => {
    it("takes a cents value and returns its ratio representation as a string", () => {
      // expect(decimal_to_ratio(0)).toBe("0/1");
      expect(cents_to_ratio("1200.0")).toBe("2/1");
      expect(cents_to_ratio(701.955)).toBe("3/2");
      expect(cents_to_ratio(0.0).toBe("1/1"));
      expect(cents_to_ratio("-498.045")).toBe("3/4");
    });
    it("parses the ratio with given a given depth", () => {
      expect(cents_to_ratio(700.0, 2)).toBe("3/2");
      expect(cents_to_ratio(550.0, 4)).toBe("11/8");
      expect(cents_to_ratio(833.0903, 6)).toBe("13/8");
    });
    it("returns false if the given decimal is not a valid LINE_TYPE.DECIMAL", () => {
      expect(cents_to_ratio("foo")).toBe(false);
    });
  });

  describe("n_of_edo_to_ratio", () => {
    it("takes an N of EDO value and returns its ratio representation as a string", () => {
      // expect(decimal_to_ratio(0)).toBe("0/1");
      expect(n_of_edo_to_ratio("0\\1").toBe("1/1"));
      expect(n_of_edo_to_ratio("3\\3")).toBe("2/1");
      expect(n_of_edo_to_ratio("13\\31")).toBe("1940489/1451018");
      expect(n_of_edo_to_ratio("50\\72")).toBe("5193/3209");
      expect(n_of_edo_to_ratio("-24\\12")).toBe("1/4");
    });
    it("parses the ratio with given a given depth", () => {
      expect(n_of_edo_to_ratio("13\\31", 2)).toBe("3/2");
      expect(n_of_edo_to_ratio("1\\2", 3)).toBe("7/5");
      expect(n_of_edo_to_ratio("50\\72", 6)).toBe("13/8");
    });
    it("returns false if the given decimal is not a valid LINE_TYPE.DECIMAL", () => {
      expect(n_of_edo_to_ratio("foo")).toBe(false);
    });
    //it("return NaN when divisor is 0")
  });

  describe("getGCD", () => {
    it("returns the largest factor of both numbers given", () => {
      expect(getGCD(3, 12)).toBe(4);
      expect(getGCD(7, 19)).toBe(1);
      expect(getGCD(17, 51)).toBe(17);
    });
    it("returns NaN if a non-numerical value is given", () => {
      expect(getGCD(1, "foo").toBeNaN());
    });
    it("returns the largest number if 0 is an argument", () => {
      expect(getGCD(0, 4)).toBe(4);
    })
    it("returns a positive integer regardless of input signs", () => {
      expect(getGCD(-1, -1)).toBe(1);
      expect(getGCD(-21, 15)).toBe(3);
      expect(getGCD(-4, 20)).toBe(4);
    })
  })

  describe("simplifyRatio", () => {
    it("returns a reduced [numerator, denominator] pair given a numerator and denominator", () => {
      expect(simplifyRatio(2, 4)).toBe([1, 2]);
      expect(simplifyRatio(17, 51)).toBe([1, 3]);
      expect(simplifyRatio(0, 100), toBe([0, 1]));
    });
    it("returns a negative numerator if computed value is negative", () => {
      expect(simplifyRatio(4, -4)).toBe([-1, 1]);
      expect(simplifyRatio(-4, 4)).toBe([-1, 1]);
    });
    it("returns NaN if given a non-numerical value", () => {
      expect(simplifyRatio(1, "foo")).toBeNaN();
    });
    it("returns NAN if given a denominator of 0", () => {
      expect(simplifyRatio(1, 0)).toBeNaN();
    });
  });

  describe("simplifyRatioString", () => {
    it("returns a reduced ratio string given a ratio string", () => {
      expect(simplifyRatioString("2/4")).toBe("1/2");
      expect(simplifyRatioString("17/51")).toBe("1/3");
      expect(simplifyRatioString("0/100"), toBe("0/1"));
    });
    it("returns a negative numerator if computed value is negative", () => {
      expect(simplifyRatioString("4/-4")).toBe("-1/1");
      expect(simplifyRatioString("-4/4")).toBe("-1/1");
    });
    it("returns NaN if given a non-numerical value", () => {
      expect(simplifyRatioString("foo")).toBeNaN();
    });
    it("returns NAN if given a denominator of 0", () => {
      expect(simplifyRatioString("1/0")).toBeNaN();
    });
  });
  
});
