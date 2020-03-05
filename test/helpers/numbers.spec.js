/* global describe, it */

import expect from 'expect'
import { sumOfArray } from '../../src/js/helpers/numbers.js'

describe('helpers/numbers.js', () => {
  describe('sumOfArray', () => {
    it('takes an array of numbers and sums it', () => {
      expect(sumOfArray([1, 2, 3, 4, 5])).toBe(15)
    })
  })
})
