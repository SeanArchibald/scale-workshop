describe(`helpers`, () => {
  describe(`isCent()`, () => {
    it(`returns true, when given string is a floating point number`, () => {
      expect(isCent('127.052')).toBe(true)
    })
    it(`returns true, when given string has a dot, but doesn't have any decimals written`, () => {
      expect(isCent('150.')).toBe(true)
    })
    it(`returns false, when given string contains an integer`, () => {
      expect(isCent('500')).toBe(false)
    })
    it(`returns true when given string contains whitespace around the number`, () => {
      expect(isCent('700.0     ')).toBe(true)
      expect(isCent('         700.0')).toBe(true)
      expect(isCent('      700.0   \t')).toBe(true)
    })
    it(`returns false, when given string contains multiple numbers`, () => {
      expect(isCent('700. 500.')).toBe(false)
    })
    it(`returns false, when the float in the given string contains whitespaces`, () => {
      expect(isCent('3.   141592')).toBe(false)
    })
    it(`returns false, when given string contains no numbers`, () => {
      expect(isCent('hello')).toBe(false)
      expect(isCent('// this is a comment')).toBe(false)
      expect(isCent('')).toBe(false)
      expect(isCent('      ')).toBe(false)
    })
    it(`returns true, when given parameter is not a string, but can be stringified to a valid float string`, () => {
      expect(isCent(1000.3)).toBe(true)
    })
    it(`returns false, when given parameter is not a string and cannot be stringified to a valid float string`, () => {
      expect(isCent(true)).toBe(false)
      expect(isCent(Function.prototype)).toBe(false)
    })
  })

  describe('isNOfEdo()', () => {
    it(`returns true, when given string has 2 integers separated by a single backslash`, () => {
      expect(isNOfEdo('12\\4')).toBe(true)
    })
    it(`returns false, when given string has floats instead of integers`, () => {
      expect(isNOfEdo('12.1\\4')).toBe(false)
      expect(isNOfEdo('12\\4.')).toBe(false)
    })
    it(`returns false, when given string has forward slash, instead of backslash`, () => {
      expect(isNOfEdo('12/4')).toBe(false)
    })
    it(`returns true, when given string has whitespaces at the beginning and at the end`, () => {
      expect(isNOfEdo('     12\\4')).toBe(true)
      expect(isNOfEdo('12\\4            ')).toBe(true)
      expect(isNOfEdo('  \t   12\\4      ')).toBe(true)
    })
    it(`return false, when given string has whitespaces between the numbers`, () => {
      expect(isNOfEdo('12 \\4')).toBe(false)
      expect(isNOfEdo('12\\   4')).toBe(false)
    })
    it(`returns false, when given string contains only 1 number`, () => {
      expect(isNOfEdo('1000')).toBe(false)
      expect(isNOfEdo('700.2')).toBe(false)
    })
    it(`returns false, when given string contains no numbers`, () => {
      expect(isNOfEdo('hello')).toBe(false)
      expect(isNOfEdo('// this is a comment')).toBe(false)
      expect(isNOfEdo('')).toBe(false)
      expect(isNOfEdo('      ')).toBe(false)
    })
    it(`returns false, when given parameter is not a string and cannot be stringified to a valid float string`, () => {
      expect(isNOfEdo(true)).toBe(false)
      expect(isNOfEdo(Function.prototype)).toBe(false)
    })
  })

  describe(`isRatio()`, () => {
    it(`returns true, when given string has 2 integers separated by a single forward slash`, () => {
      expect(isRatio('12/4')).toBe(true)
    })
    it(`returns false, when given string has floats instead of integers`, () => {
      expect(isRatio('12.1/4')).toBe(false)
      expect(isRatio('12/4.')).toBe(false)
    })
    it(`returns false, when given string has backslash, instead of forward slash`, () => {
      expect(isRatio('12\\4')).toBe(false)
    })
    it(`returns true, when given string has whitespaces at the beginning and at the end`, () => {
      expect(isRatio('     12/4')).toBe(true)
      expect(isRatio('12/4            ')).toBe(true)
      expect(isRatio('  \t   12/4      ')).toBe(true)
    })
    it(`return false, when given string has whitespaces between the numbers`, () => {
      expect(isRatio('12 /4')).toBe(false)
      expect(isRatio('12/   4')).toBe(false)
    })
    it(`returns false, when given string contains only 1 number`, () => {
      expect(isRatio('1000')).toBe(false)
      expect(isRatio('700.2')).toBe(false)
    })
    it(`returns false, when given string contains no numbers`, () => {
      expect(isRatio('hello')).toBe(false)
      expect(isRatio('// this is a comment')).toBe(false)
      expect(isRatio('')).toBe(false)
      expect(isRatio('      ')).toBe(false)
    })
    it(`returns false, when given parameter is not a string and cannot be stringified to a valid float string`, () => {
      expect(isRatio(true)).toBe(false)
      expect(isRatio(Function.prototype)).toBe(false)
    })
  })
})
