/* global describe, it */

import expect from 'expect'
import { trim, toString, isEmpty } from '../../src/js/helpers/strings.js'

describe('helpers/strings.js', () => {
  describe('trim', () => {
    it(`cuts of the whitespace from around the given string`, () => {
      expect(trim('    asdf  ')).toBe('asdf')
    })
    it(`should return the input parameter untouched, if it's not a string`, () => {
      expect(trim(123)).toBe(123)
      expect(trim([1, 2, 3])).toStrictEqual([1, 2, 3])
    })
  })
  describe('toString', () => {
    it(`stringifies the given parameter`, () => {
      expect(toString(12)).toBe('12')
      expect(toString(true)).toBe('true')
    })
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
})
