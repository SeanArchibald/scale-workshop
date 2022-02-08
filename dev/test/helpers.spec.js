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
      expect(roundToNDecimals(1, ["foo", 5, "bar"])).toBeNaN();
      expect(roundToNDecimals("cat", 1.25)).toBeNaN();
    });
  });

  describe("logModulo", () => {
    it("takes 2 numbers and returns a number", () => {
      expect(typeof logModulo(3, 2)).toBe("number");
    });
    it("returns the exponential modulus of the first number based in the second number", () => {
      expect(logModulo(2/3, 2)).toBe(4/3);
      expect(logModulo(45/7, 1.5)).toBe(1.26984126984127);
    });
    it("returns NaN, when non-numeric parameters were given", () => {
      expect(logModulo(1, "foo")).toBeNaN();
      expect(logModulo("cat", 1.25)).toBeNaN();
    });
    it("returns NaN, when first number is 0", () => {
      expect(logModulo(0, 2)).toBeNaN();
    });
    it("returns NaN, when modulus is 0 or 1", () => {
      expect(logModulo(2, 0)).toBeNaN();
      expect(logModulo(2, 1)).toBeNaN();
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
    it("returns true, when negative", () => {
      expect(isCent("-100.0")).toBe(true);
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

  describe("isNOfEdo", () => {
    it("returns true, when given input is negative", () => {
      expect(isNOfEdo("-10\\12")).toBe(true);
    });
  });

  describe("isNegativeInterval", () => {
    it("returns false if input is a nonnegative ratio or decimal", () => {
      expect(isNegativeInterval("3/2")).toBe(false);
      expect(isNegativeInterval("1,5")).toBe(false);
      expect(isNegativeInterval("1/2")).toBe(false);
      expect(isNegativeInterval("0,5")).toBe(false);
    });
    it("returns false if cents or N of EDO is positive", () => {
      expect(isNegativeInterval("1200.0")).toBe(false);
      expect(isNegativeInterval("1\\12")).toBe(false);
    });
    it("returns true if cents or N of EDO evaluates to a negative number", () => {
      expect(isNegativeInterval("-1200.0")).toBe(true);
      expect(isNegativeInterval("-1\\12")).toBe(true);
    });
    it("returns LINE_TYPE.INVALID if ratio, decimal, or N of EDO denominator is negative", () => {
      expect(isNegativeInterval("-2/1")).toBe(LINE_TYPE.INVALID);
      expect(isNegativeInterval("2/-1")).toBe(LINE_TYPE.INVALID);
      expect(isNegativeInterval("-1,5")).toBe(LINE_TYPE.INVALID);
    });
    it("returns LINE_TYPE.INVALID on invalid input", () => {
      expect(isNegativeInterval("1\\-12")).toBe(LINE_TYPE.INVALID);
      expect(isNegativeInterval("2-3")).toBe(LINE_TYPE.INVALID);
      expect(isNegativeInterval("foo")).toBe(LINE_TYPE.INVALID);
      expect(isNegativeInterval([1, 2, 3])).toBe(LINE_TYPE.INVALID);
      expect(isNegativeInterval(NaN)).toBe(LINE_TYPE.INVALID);
      expect(isNegativeInterval()).toBe(LINE_TYPE.INVALID);
    });
  })

  describe("sum_array", () => {
    it("takes an array of numbers and returns a number", () => {
      expect(typeof sum_array([1, 2, 3, 4])).toBe("number");
    });
    it("sums the numbers in an array", () => {
      expect(sum_array([1, 2, 3, 4])).toBe(10);
    });
    it("sums the numbers in an array up to a stopping index", () => {
      expect(sum_array([1, 2, 3, 4], 3)).toBe(6);
    });
    it("returns NaN, when array contains non-numeric values", () => {
      expect(sum_array([1, "foo"])).toBeNaN();
    });
  });

  describe("rotate", () => {
    it("shifts the values of an array, with wrapping indicies", () => {
      expect(rotate([0, "foo", "bar", 1], 5)).toEqual([1, 0, "foo", "bar"]);
      expect(rotate([0, "foo", "bar", 1], -5)).toEqual(["foo", "bar", 1, 0]);
    });
  });

  describe("get_cf", () => {
    it("takes a number and calculates it's continued fraction representation", () => {
      expect(get_cf(1.25)).toEqual([1, 4]);
      expect(get_cf(1 / 3)).toEqual([0, 3]);
      expect(get_cf(Math.sqrt(2), 4)).toEqual([1, 2, 2, 2]);
      expect(get_cf(Decimal.acos(-1))).toEqual([3, 7, 15, 1, 292, 1, 1, 1, 2, 1, 3, 1, 14, 2, 1]);
    });
    it("returns an array containing zero if set to 0 iterations", () => {
      expect(get_cf(1, 0)).toEqual([0]);
    });
    it("round significant digits down to 0 if they are below a given precision", () => {
      expect(get_cf(1 + 1e-7, 4, 6)).toEqual([1]);
      expect(get_cf(Decimal.acos(-1), 15, 2)).toEqual([3, 7, 15, 1]);
    });
    it("returns NaN if given a non-numerical value", () => {
      expect(get_cf("foo")).toBeNaN();
    });
  });

  describe("get_convergent", () => {
    it("takes an array of numbers representing a continued fraction and returns a ratio in its convergent series", () => {
      expect(get_convergent([3])).toEqual("3/1");
      expect(get_convergent([1, 1, 1])).toEqual("3/2");
      expect(get_convergent([1, 2, 10])).toEqual("31/21");
      expect(get_convergent(get_cf(Decimal.acos(-1)), 3)).toEqual("333/106");
    });
    it ("returns a whole number fraction if given a number instead of a continued fraction", () => {
      expect(get_convergent(2)).toBe("2/1");
      expect(get_convergent(0)).toBe("0/1");
    })
    it("returns NaN if the given array contains a non-numerical value", () => {
      expect(get_convergent([1, "foo"])).toBeNaN();
      expect(get_convergent(NaN)).toBeNaN();
    });
  })

  describe("decimal_to_ratio", () => {
    it("takes a decimal value and returns a ratio", () => { 
      // expect(decimal_to_ratio(0)).toBe("0/1");
      expect(decimal_to_ratio("1.5")).toBe("3/2");
      expect(decimal_to_ratio(1 / 3)).toBe("1/3");
      expect(decimal_to_ratio(Decimal.acos(-1))).toBe("245850922/78256779");
    });
    it ("takes a commadecimal value and returns a ratio", () => {
      expect(decimal_to_ratio("1,3")).toBe("13/10");
    });
    it("parses the ratio with given a given depth", () => {
      expect(decimal_to_ratio(Decimal.acos(-1), 1)).toBe("3/1");
      expect(decimal_to_ratio(Decimal.acos(-1), 2)).toBe("22/7");
      expect(decimal_to_ratio(Decimal.acos(-1), 3)).toBe("333/106");
    });
    it("returns false if the given value is not a valid LINE_TYPE.DECIMAL", () => {
      expect(decimal_to_ratio("foo")).toBe(false);
    });
  });

  describe("cents_to_ratio", () => {
    it("takes a cents value and returns its ratio representation as a string", () => {
      // expect(decimal_to_ratio(0)).toBe("0/1");
      expect(cents_to_ratio("1200.0")).toBe("2/1");
      expect(cents_to_ratio(701.955)).toBe("3/2");
      expect(cents_to_ratio(0.0)).toBe("1/1");
      expect(cents_to_ratio("-498.045")).toBe("3/4");
    });
    it("parses the ratio with given a given depth", () => {
      expect(cents_to_ratio(700.0, 2)).toBe("3/2");
      expect(cents_to_ratio(550.0, 4)).toBe("11/8");
      expect(cents_to_ratio(833.0903, 6)).toBe("13/8");
    });
    it("returns false if the given value is not a valid LINE_TYPE.CENTS", () => {
      expect(cents_to_ratio("foo")).toBe(false);
    });
  });

  describe("n_of_edo_to_ratio", () => {
    it("takes an N of EDO value and returns its ratio representation as a string", () => {
      expect(n_of_edo_to_ratio("0\\1")).toBe("1/1");
      expect(n_of_edo_to_ratio("3\\3")).toBe("2/1");
      expect(n_of_edo_to_ratio("13\\31")).toBe("1940489/1451018");
      expect(n_of_edo_to_ratio("50\\72")).toBe("5193/3209");
      //expect(n_of_edo_to_ratio("-24\\12")).toBe("1/4");
    });
    it("parses the ratio with given a given depth", () => {
      expect(n_of_edo_to_ratio("13\\31", 2)).toBe("3/2");
      expect(n_of_edo_to_ratio("1\\2", 3)).toBe("7/5");
      expect(n_of_edo_to_ratio("50\\72", 6)).toBe("13/8");
    });
    it("returns false if the given value is not a valid LINE_TYPE.N_OF_EDO", () => {
      expect(n_of_edo_to_ratio("foo")).toBe(false);
    });
    //it("return NaN when divisor is 0")
  });

  describe("getGCD", () => {
    it("returns the largest factor of both numbers given", () => {
      expect(getGCD(3, 12)).toBe("3");
      expect(getGCD(7, 19)).toBe("1");
      expect(getGCD(17, 51)).toBe("17");
      expect(getGCD("116825103759765625", "12971141321962887")).toBe("7")
    });
    it("returns NaN if a non-numerical value is given", () => {
      expect(getGCD(1, "foo")).toBeNaN();
    });
    it("returns the largest number if 0 is an argument", () => {
      expect(getGCD(0, 4)).toBe("4");
    });
    it("returns a positive integer regardless of input signs", () => {
      expect(getGCD(-1, -1)).toBe("1");
      expect(getGCD(-21, 15)).toBe("3");
      expect(getGCD(-4, 20)).toBe("4");
    });
  });

  describe("ratioIsValid", () => {
    it("returns true with a well-formed positive or negative integer ratio", () => {
      expect(ratioIsValid("1/2")).toBe(true);
      expect(ratioIsValid("-1/2")).toBe(true);
      expect(ratioIsValid("1/2")).toBe(true);
      expect(ratioIsValid("116825103759765625/12971141321962887")).toBe(true);
    });
    it('returns false if it contains a non-integer value', () => {
      expect(ratioIsValid("foo")).toBe(false);
      expect(ratioIsValid("foo/5")).toBe(false);
      expect(ratioIsValid("5/bar")).toBe(false);
      expect(ratioIsValid("2.3/5.8")).toBe(false);
      expect(ratioIsValid("4")).toBe(false);
    });
    it('returns false if the denominator is 0', () => {
      expect(ratioIsValid("1/0")).toBe(false);
    });
  });

  describe("ratioIsSafe", () => {
    it("returns true if ratio integers are 20 digits or below", () => {
      expect(ratioIsSafe("3/2")).toBe(true);
      expect(ratioIsSafe("123456789012345678799/1")).toBe(true);
      expect(ratioIsSafe("100/123456789012345678799")).toBe(true);
    });
    it("returns false if ratio integers are above 20 digits", () => {
      expect(ratioIsSafe("4722366482869645213696/1")).toBe(false);
      expect(ratioIsSafe("1/4722366482869645213696")).toBe(false);
    })
  });

  // Use different values from transposeSelf?
  describe("powRatio", () => {
    it("returns a ratio to the given power", () => {
      expect(powRatio("3/2", 3)).toBe("27/8");
      expect(powRatio("5/3", 23)).toBe("11920928955078125/94143178827");
      expect(powRatio("2/1", -2)).toBe("1/4");
      expect(powRatio("1/2", -2)).toBe("4/1");
    });
    it("returns cents if a ratio integer exceeds 20 places", () => {
      expect(powRatio("3/2", 72)).toBe("50540.760062");
    });
    it("returns unison if power is 0", () => {
      expect(powRatio("3/2", 0)).toBe("1/1");
    });
    it("returns NaN if given a non-numerical value", () => {
      expect(powRatio("foo", 1)).toBeNaN();
      expect(powRatio("2/1", "foo")).toBeNaN();
    });
  });

  describe("simplifyRatio", () => {
    it("returns a reduced ratio string given a ratio string", () => {
      expect(simplifyRatio("2/4")).toBe("1/2");
      expect(simplifyRatio("17/51")).toBe("1/3");
      expect(simplifyRatio("0/100")).toBe("0/1");
    });
    it("returns a negative numerator if computed value is negative", () => {
      expect(simplifyRatio("4/-4")).toBe("-1/1");
      expect(simplifyRatio("-4/4")).toBe("-1/1");
    });
    it("returns NaN if given a non-numerical value", () => {
      expect(simplifyRatio("foo")).toBeNaN();
    });
    it("returns NaN if given a denominator of 0", () => {
      expect(simplifyRatio("1/0")).toBeNaN();
    });
  });

  describe("periodReduceRatio", () => {
    it("takes two ratios, representing an interval and period, and returns the first ratio reduced between 1 and the second ratio", () => {
      expect(periodReduceRatio("1/1", "3/2")).toBe("1/1");
      expect(periodReduceRatio("9/1", "2/1")).toBe("9/8");
      expect(periodReduceRatio("3/2", "3/2")).toBe("1/1");
      expect(periodReduceRatio("5/4", "16/15")).toBe("16875/16384");
      expect(periodReduceRatio("3/4", "3/2")).toBe("9/8");
      expect(periodReduceRatio("16677181699666569/17179869184", "2/1")).toBe("16677181699666569/9007199254740992");
    });
    it("returns cents if a ratio integer exceeds 20 places", () => {
      expect(periodReduceRatio("22528399544939174411840147874772641/4722366482869645213696", "2/1")).toBe("140.760062");
      expect(periodReduceRatio("444141444444/222211123134124", "1770695989828143/1124948488149")).toBe("1984.254914")
    })
    it("returns NaN if given a non-numerical value", () => {
      expect(periodReduceRatio("foo", "2/1")).toBeNaN();
      expect(periodReduceRatio("1/1", "foo")).toBeNaN();
    });
    it("returns NaN if given a denominator of 0", () => {
      expect(periodReduceRatio("1/0", "2/1")).toBeNaN();
      expect(periodReduceRatio("1/1", "1/0")).toBeNaN();
    });
    it("returns NaN if a ratio is 0", () => {
      expect(periodReduceRatio("0/1", "2/1")).toBeNaN();
      expect(periodReduceRatio("2/1", "0/1")).toBeNaN();
    });
    it("returns NaN if the mod ratio is 0 or 1", () => {
      expect(periodReduceRatio("2/1", "0/1")).toBeNaN();
      expect(periodReduceRatio("2/1", "1/1")).toBeNaN();
    });
  });

  describe("transposeRatios", () => {
    it("takes two ratios and returns their simplified product", () => {
      expect(transposeRatios("1/1", "3/2")).toBe("3/2");
      expect(transposeRatios("3/2", "3/2")).toBe("9/4");
      expect(transposeRatios("5/4", "16/15")).toBe("4/3");
      expect(transposeRatios("9008000000000001/8675309000000001", "17/16")).toBe("51045333333333339/46268314666666672");
    });
    it("returns cents if a ratio integer exceeds 20 places", () => {
      expect(transposeRatios("22528399544939174411840147874772641/4722366482869645213696", "5/191581231380566414401")).toBe("-27524.747979")
      expect(transposeRatios("5/191581231380566414401", "22528399544939174411840147874772641/4722366482869645213696")).toBe("-27524.747979")
    });
    // it("returns a negative numerator if computed value is negative", () => {
    //   expect(simplifyRatioString("4/-4")).toBe("-1/1");
    //   expect(simplifyRatioString("-4/4")).toBe("-1/1");
    // });
    it("returns NaN if given a non-numerical value", () => {
      expect(transposeRatios("foo")).toBeNaN();
    });
    it("returns NaN if given a denominator of 0", () => {
      expect(transposeRatios("1/0")).toBeNaN();
    });
  });

  describe("transposeNOfEdos", () => {
    it("takes two n-of-EDO values and returns their sum", () => {
      expect(transposeNOfEdos("1\\12", "1\\12")).toBe("2\\12");
      expect(transposeNOfEdos("12\\22", "-3\\22")).toBe("9\\22");
      expect(transposeNOfEdos("1\\5", "1\\7")).toBe("12\\35");
      expect(transposeNOfEdos("3\\8", "5\\12")).toBe("19\\24");
    });
    // it("returns a negative numerator if computed value is negative", () => {
    //   expect(transposeNOfEdos("4/-4")).toBe("-1/1");
    //   expect(transposeNOfEdos("-4/4")).toBe("-1/1");
    // });
    it("returns NaN if given a non-numerical value", () => {
      expect(transposeNOfEdos("foo")).toBeNaN();
    });
    it("returns NaN if given a denominator of 0", () => {
      expect(transposeNOfEdos("1/0")).toBeNaN();
    });
  });

  describe("transposeLine", () => {
    it("takes two generic interval values and returns their combination, preserving the first interval type when possible", () => {
      expect(transposeLine("100.0", "200.0")).toBe("300.000000");
      expect(transposeLine("100.0", "7\\12")).toBe("800.000000");
      expect(transposeLine("100.0", "4/3")).toBe("598.044999");
      expect(transposeLine("100.0", "1,25")).toBe("486.313714");
      expect(transposeLine("1\\12", "1\\6")).toBe("3\\12");
      expect(transposeLine("12\\12", "2,0")).toBe("24\\12");
      expect(transposeLine("1,25", "1,3")).toBe("1,625000");
      expect(transposeLine("1,25", "13/10")).toBe("1,625000");
      expect(transposeLine("1,25", "300.0")).toBe("1,486509");
      expect(transposeLine("1,25", "1\\4")).toBe("1,486509");
      expect(transposeLine("3/2", "4/3")).toBe("2/1");
      expect(transposeLine("4/3", "1,5")).toBe("2/1");
      expect(transposeLine("9008000000000001/8675309000000001", "5/2")).toBe("15013333333333335/5783539333333334");
      expect(transposeLine("9008000000000001/8675309000000001", "1,5")).toBe("9008000000000001/5783539333333334");
    });
    it("transposes downward with a negative cents or N Of EDO transposer", () => {
      expect(transposeLine("300.0", "-100.0")).toBe("200.000000");
      expect(transposeLine("1\\4", "-100.0")).toBe("200.000000");
      expect(transposeLine("3/1", "-1200.0")).toBe("3/2");
      expect(transposeLine("3,0", "-1200.0")).toBe("1,500000");
      expect(transposeLine("300.0", "-1\\12")).toBe("200.000000");
      expect(transposeLine("1\\4", "-1\\12")).toBe("2\\12");
      expect(transposeLine("3/1", "-12\\12")).toBe("3/2");
      expect(transposeLine("3,0", "-12\\12")).toBe("1,500000");
    });
    it("allows for negative cents & N Of Edos when transposed below unison", () => {
      expect(transposeLine("100.0", "1/2")).toBe("-1100.000000");
      expect(transposeLine("100.0", "0,5")).toBe("-1100.000000");
      expect(transposeLine("100.0", "-12\\12")).toBe("-1100.000000");
      expect(transposeLine("100.0", "-1200.0")).toBe("-1100.000000");
      expect(transposeLine("1\\12", "1/2")).toBe("-11\\12");
      expect(transposeLine("1\\12", "0,5")).toBe("-11\\12");
      expect(transposeLine("1\\12", "-12\\12")).toBe("-11\\12");
      expect(transposeLine("1\\12", "-1200.0")).toBe("-11\\12");
    });
    it("preserves decimal if combined with N of EDO", () => {
      expect(transposeLine("12\\12", "1,5")).toBe("3,000000");
      expect(transposeLine("1\\12", "1,5")).toBe("1,589195");
    });
    it("returns cents if N of EDO is combined with cents or ratio", () => {
      expect(transposeLine("1\\12", "3/2")).toBe("801.955001");
      expect(transposeLine("1\\12", "700.0")).toBe("800.000000");
    });
    it ("returns cents when a ratio is combined with N of EDO or cents", () => {
      expect(transposeLine("2/1", "1\\12")).toBe("1300.000000");
      expect(transposeLine("2/1", "700.0")).toBe("1900.000000");
      expect(transposeLine("9008000000000000/8675309000000001", "700.0")).toBe("765.150019");
      expect(transposeLine("9008000000000000/8675309000000001", "7\\12")).toBe("765.150019");
    });
    it("returns cents if a ratio integer exceeds 20 places", () => {
      expect(transposeLine("22528399544939174411840147874772641/4722366482869645213696", "5/191581231380566414401")).toBe("-27524.747979");
      expect(transposeLine("5/191581231380566414401", "22528399544939174411840147874772641/4722366482869645213696")).toBe("-27524.747979");
      expect(transposeLine("22528399544939174411840147874772641/4722366482869645213696", "3,2")).toBe("52554.446348");
      expect(transposeLine("22528399544939174411840147874772641/20769187434139310514121985316880384", "60.0")).toBe("200.760062");
      expect(transposeLine("22528399544939174411840147874772641/4722366482869645213696", "7\\12")).toBe("51240.760062");
    });
    // it("returns a negative numerator if computed value is negative", () => {
    //   expect(transposeLine("4/-4")).toBe("-1/1");
    //   expect(transposeLine("-4/4")).toBe("-1/1");
    // });
    it("returns NaN if given a non-numerical value", () => {
      expect(transposeLine("foo")).toBeNaN();
    });
    it("returns NaN if given a denominator of 0", () => {
      expect(transposeLine("1/0")).toBeNaN();
    });
    it("returns 1,0 if transposing a commadecimal by its negation", () => {
      expect(transposeLine("2,0", negateLine("2,0"))).toBe("1,000000");
    });
  });

  describe("transposeSelf", () => {
    it("returns the interval produced from stacking itself a number of times ", () => {
      expect(transposeSelf("100.0", 3)).toBe("300.000000");
      expect(transposeSelf("3/2", 3)).toBe("27/8");
      expect(transposeSelf("1,5", 2)).toBe("2,250000");
      expect(transposeSelf("3\\31", 2)).toBe("6\\31");
      expect(transposeSelf("5/3", 23)).toBe("11920928955078125/94143178827");
    });
    it("returns cents if a ratio integer exceeds 20 places", () => {
      expect(transposeSelf("3/2", 72)).toBe("50540.760062");
    });
    it("returns unison if stacked 0 times", () => {
      expect(transposeSelf("100.0", 0)).toBe("0.000000");
      expect(transposeSelf("3/2", 0)).toBe("1/1");
      expect(transposeSelf("1,5", 0)).toBe("1,000000");
      expect(transposeSelf("3\\31", 0)).toBe("0\\31");
    });
    it("returns an inverted interval if transposed a negative amount of times", () => {
      expect(transposeSelf("123.4", -2)).toBe("-246.800000");
      expect(transposeSelf("-100.0", -2)).toBe("200.000000");
      expect(transposeSelf("2/1", -2)).toBe("1/4");
      expect(transposeSelf("1/2", -2)).toBe("4/1");
      expect(transposeSelf("1,25", -2)).toBe("0,640000");
      expect(transposeSelf("0,5", -2)).toBe("4,000000");
      expect(transposeSelf("19\\31", -2)).toBe("-38\\31");
      expect(transposeSelf("-3\\31", -2)).toBe("6\\31");
    })
    it("returns NaN if given a non-numerical value", () => {
      expect(transposeSelf("foo", 1)).toBeNaN();
      expect(transposeSelf("2/1", "foo")).toBeNaN();
    });
  });

  describe("moduloLine", () => {
    it("returns the remaining interval when multiples of the modulo value are removed from the line interval, retaining line's type if possible", () => {
      expect(moduloLine("100.0", "1200.0")).toBe("100.000000");
      expect(moduloLine("1300.0", "1200.0")).toBe("100.000000");
      expect(moduloLine("100.0", "7\\12")).toBe("100.000000");
      expect(moduloLine("800.0", "7\\12")).toBe("100.000000");
      expect(moduloLine("1300.0", "2/1")).toBe("100.000000");
      expect(moduloLine("1300.0", "2,0")).toBe("100.000000");
      expect(moduloLine("8\\12", "11\\12")).toBe("8\\12");
      expect(moduloLine("61\\12", "1200.0")).toBe("1\\12");
      expect(moduloLine("61\\12", "2/1")).toBe("1\\12");
      expect(moduloLine("61\\12", "2,0")).toBe("1\\12");
      expect(moduloLine("1,25", "1,3")).toBe("1,250000");
      expect(moduloLine("1,5", "1,25")).toBe("1,200000");
      expect(moduloLine("3,0", "1200.0")).toBe("1,500000");
      expect(moduloLine("3,0", "12\\12")).toBe("1,500000");
      expect(moduloLine("3,0", "2/1")).toBe("1,500000");
      expect(moduloLine("1,7", "3/2")).toBe("1,133333");
      expect(moduloLine("12/8", "4/3")).toBe("9/8");
      expect(moduloLine("3/1", "2,0")).toBe("3/2");
      expect(moduloLine("3/1", "1200.0")).toBe("3/2");
      expect(moduloLine("3/1", "12\\12")).toBe("3/2");
      expect(moduloLine("16677181699666569/17179869184", "2/1")).toBe("16677181699666569/9007199254740992");
      expect(moduloLine("16677181699666569/17179869184", "2,0")).toBe("16677181699666569/9007199254740992");
      expect(moduloLine("22528399544939174411840147874772641/4722366482869645213696", "1,5")).toBe("1/1");
    });
    it("returns an octave-based interval if number is below unison", () => {
      expect(moduloLine("0,5", "2/1")).toBe("1,000000");
      expect(moduloLine("2/3", "2/1")).toBe("4/3");
      expect(moduloLine("3/4", "3/2")).toBe("9/8");
    });
    it ("returns a positive interval if the line is negative cents or N of EDO", () => {
      expect(moduloLine("-100.0", "2/1")).toBe("1100.000000");
      expect(moduloLine("-3\\7", "2/1")).toBe("4\\7");
    });
    it("returns LCM EDO if two N of EDOs are combined", () => {
      expect(moduloLine("8\\12", "3\\6")).toBe("2\\12");
      expect(moduloLine("4\\5", "3\\7")).toBe("13\\35");
    });
    it("returns decimal if combined with N of EDO", () => {
      expect(moduloLine("1\\12", "1,5")).toBe("1,059463");
      expect(moduloLine("9\\12", "1,5")).toBe("1,121195");
    });
    it("returns cents if N of EDO is combined with cents or ratio", () => {
      expect(moduloLine("1\\12", "700.0")).toBe("100.000000");
      expect(moduloLine("9\\12", "3/2")).toBe("198.044999");
    });
    it ("returns cents when a ratio is combined with N of EDO or cents", () => {
      expect(moduloLine("2/1", "1\\12")).toBe("0.000000");
      expect(moduloLine("2/1", "700.0")).toBe("500.000000");
      expect(moduloLine("16677181699666569/17179869184", "7\\12")).toBe("66.470029");
      expect(moduloLine("16677181699666569/17179869184", "700.0")).toBe("66.470029");
    });
    it("returns cents if a ratio integer exceeds 20 places", () => {
      expect(moduloLine("22528399544939174411840147874772641/4722366482869645213696", "2/1")).toBe("140.760062");
      expect(moduloLine("22528399544939174411840147874772641/4722366482869645213696", "1,41421356237")).toBe("140.760063");
      expect(moduloLine("22528399544939174411840147874772641/4722366482869645213696", "1000.0")).toBe("540.760062");
      expect(moduloLine("22528399544939174411840147874772641/4722366482869645213696", "4\\31")).toBe("63.340707");
    });
    it("returns NaN if the modLine evaluates to a decimal below 1", () => {
      expect(moduloLine("3/2", "1/2")).toBeNaN();
      expect(moduloLine("3/2", "-100.0")).toBeNaN();
      expect(moduloLine("3/2", "-4\\7")).toBeNaN();
      expect(moduloLine("3/2", "0,5")).toBeNaN();
    });
    it("returns NaN if given a non-numerical value", () => {
      expect(moduloLine("foo", "2/1")).toBeNaN();
      expect(moduloLine("2/1", "foo")).toBeNaN();
    });
  });

});
