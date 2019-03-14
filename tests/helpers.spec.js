describe('helpers.js', () => {
  describe('Number.prototype.mod', () => {
    // TODO: add tests
  })
  describe('cents_to_decimal', () => {
    it(`returns the nth power of 1200th root of 2`, () => {
      expect(cents_to_decimal(1200)).toBe(2)
      expect(Math.round(cents_to_decimal(1901.9550008) * 100000) / 100000).toBe(3)
    })
    it(`returns NaN, when given parameter is not a number or a string containing a number`, () => {
      expect(cents_to_decimal('asdf')).toBe(NaN)
      expect(cents_to_decimal(false)).toBe(NaN)
      expect(cents_to_decimal([])).toBe(NaN)
    })
  })
  describe('ratio_to_decimal', () => {
    it(`divides the 2 numbers in the given parameter with each other`, () => {
      expect(ratio_to_decimal('12/3')).toBe(4)
    })
    it(`returns NaN, when given parameter is not a ratio`, () => {
      expect(ratio_to_decimal('asdf')).toBe(false)
      expect(ratio_to_decimal(false)).toBe(false)
      expect(ratio_to_decimal([])).toBe(false)
      expect(ratio_to_decimal(NaN)).toBe(false)
      // alert() halts code execution
    })
  })
  describe('decimal_to_cents', () => {
    it(`converts the given input to cents, when it's a number`, () => {
      expect(Math.round(decimal_to_cents(3))).toBe(1902)
      expect(decimal_to_cents(2)).toBe(1200)
      expect(decimal_to_cents(1)).toBe(0)
    })
    it(`returns false, when given input is not a number`, () => {
      expect(decimal_to_cents('asdf')).toBe(false)
      expect(decimal_to_cents([1, 2, 3])).toBe(false) // parseFloat([1, 2, 3]) === parseFloat([1, 2, 3].toString()) -> [1, 2, 3].toString() == "1,2,3"
    })
    it(`returns false, when given input string contains more, than a single number`, () => {
      expect(decimal_to_cents('100.5 // hello')).toBe(false)
    })
    it(`returns false, when given input is 0`, () => {
      expect(decimal_to_cents(0)).toBe(false)
    })
    it(`returns false, when given input is false`, () => {
      expect(decimal_to_cents(false)).toBe(false)
    })
  })
  describe('ratio_to_cents', () => {
    // TODO: add tests
  })
  describe('n_of_edo_to_decimal', () => {
    it(`divides given numbers with each other and raises 2 to that power`, () => {
      expect(n_of_edo_to_decimal('12\\4')).toBe(8)
      expect(n_of_edo_to_decimal('5\\10')).toBe(Math.sqrt(2))
    })
    it(`returns false, when given input contains negative numbers`, () => {
      expect(n_of_edo_to_decimal('-4\\7')).toBe(false)
    })
    it(`returns false, when given input is not an n of edo`, () => {
      expect(n_of_edo_to_decimal('asdf')).toBe(false)
      expect(n_of_edo_to_decimal(false)).toBe(false)
      expect(n_of_edo_to_decimal([])).toBe(false)
      expect(n_of_edo_to_decimal(NaN)).toBe(false)
      // alert() halts code execution
    })
  })
  describe('n_of_edo_to_cents', () => {
    // TODO: add tests
  })
  
  describe('isCent', () => {
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

  describe('isNOfEdo', () => {
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

  describe('isRatio', () => {
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

  describe('getLineType', () => {
    // TODO: add tests
  })
  describe('line_to_decimal', () => {
    // TODO: add tests
  })
  describe('line_to_cents', () => {
    // TODO: add tests
  })
  describe('mtof', () => {
    // TODO: add tests
  })
  describe('ftom', () => {
    // TODO: add tests
  })
  describe('sanitize_filename', () => {
    // TODO: add tests
  })
  describe('clear_all', () => {
    // TODO: add tests
  })
  describe('midi_note_number_to_name', () => {
    // TODO: add tests
  })
  describe('show_mos', () => {
    // TODO: add tests
  })
  describe('debug', () => {
    // TODO: add tests
  })
  describe('clone', () => {
    // TODO: add tests
  })
  describe('getFloat', () => {
    // TODO: add tests
  })
  describe('getString', () => {
    // TODO: add tests
  })
  describe('getLine', () => {
    // TODO: add tests
  })
  describe('setScaleName', () => {
    // TODO: add tests
  })
  describe('closePopup', () => {
    // TODO: add tests
  })
  describe('setTuningData', () => {
    // TODO: add tests
  })
  describe('isEmpty', () => {
    it(`returns true, when given string contains no characters`, () => {
      expect(isEmpty('')).toBe(true)
    })
    it(`returns true, when given array contains no elements`, () => {
      expect(isEmpty([])).toBe(true)
    })
    it(`returns false, when given string is not empty`, () => {
      expect(isEmpty('abcdef')).toBe(false)
    })
    it(`returns false, when given array is not empty`, () => {
      expect(isEmpty([1, 2, 3])).toBe(false)
    })
    it(`returns false, when given parameter is not a string or array`, () => {
      expect(isEmpty(1)).toBe(false)
      expect(isEmpty(false)).toBe(false)
      expect(isEmpty({})).toBe(false)
    })
  })
  describe('isNil', () => {
    it(`returns true, when given parameter is null or undefined`, () => {
      expect(isNil(null)).toBe(true)
      expect(isNil(undefined)).toBe(true)
    })
    it(`returns false, when given parameter is not null or undefined`, () => {
      expect(isNil('asdf')).toBe(false)
      expect(isNil(NaN)).toBe(false)
      expect(isNil(false)).toBe(false)
      expect(isNil(0)).toBe(false)
      expect(isNil([])).toBe(false)
      expect(isNil({})).toBe(false)
    })
  })
  describe('isFunction', () => {
    it(`returns true, when given parameter is a function`, () => {
      expect(isFunction(function(){})).toBe(true)
      expect(isFunction(() => {})).toBe(true)
      expect(isFunction(window.addEventListener)).toBe(true)
    })
    it(`returns false, when given parameter is not a function`, () => {
      expect(isFunction(12)).toBe(false)
      expect(isFunction('asdf')).toBe(false)
      expect(isFunction(true)).toBe(false)
      expect(isFunction()).toBe(false)
      expect(isFunction([1, 2, 3])).toBe(false)
    })
  })
  describe('toString', () => {
    it(`stringifies the given parameter`, () => {
      expect(toString(12)).toBe('12')
      expect(toString(true)).toBe('true')
    })
  })
  describe('trim', () => {
    it(`cuts of the whitespace from around the given string`, () => {
      expect(trim('    asdf  ')).toBe('asdf')
    })
    it(`should return the input parameter untouched, if it's not a string`, () => {
      expect(trim(123)).toBe(123)
      expect(trim([1, 2, 3])).toBe([1, 2, 3])
    })
  })
  describe('getCoordsFromKey', () => {
    // TODO: add tests
  })
  describe('tap', () => {
    // TODO: add tests
  })
})
