/* global describe, it */

import expect from 'expect'
import { sumOfArray, clamp } from '../../src/js/helpers/numbers.js'

describe('helpers/numbers.js', () => {
  describe('clamp', () => {
    it('leaves the 3rd value unchanged, when between the 1st and the 2nd', () => {
      expect(clamp(1, 10, 3)).toBe(3)
    })
    it('gives back the 1st value, when 3rd is less', () => {
      expect(clamp(5, 10, 4)).toBe(5)
    })
    it('gives back the 2nd value, when 3rd is greater', () => {
      expect(clamp(5, 10, 17)).toBe(10)
    })
  })

  describe('sumOfArray', () => {
    it('takes an array of numbers and sums it', () => {
      expect(sumOfArray([1, 2, 3, 4, 5])).toBe(15)
    })
  })
})
