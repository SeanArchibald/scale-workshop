/* global describe, it */

import assert from 'assert'
import { sumOfArray } from '../../src/js/helpers/numbers.js'

describe('sumOfArray', () => {
  it('takes an array of numbers and sums it', () => {
    assert.strictEqual(sumOfArray([1, 2, 3, 4, 5]), 15)
  })
})
