/**
 * SEQUENCING GENERATING FUNCTIONS
 */

/* global alert */

import { getPrimesOfRatio, mathModulo, clamp } from './numbers.js'
import { stepsToDegrees, decimalToCents } from './converters.js'

// returns a version of the given array rotated left by a given amount
function rotateArrayLeft(steps, array) {
  const out = []
  let i = 0
  while (i < array.length) {
    out.push(array[mathModulo(i + steps, array.length)])
    i++
  }
  return out
}

// returns a version of the given array rotated right by a given amount
function rotateArrayRight(steps, array) {
  const out = []
  let i = 0
  while (i < array.length) {
    out.push(array[mathModulo(i - steps, array.length)])
    i++
  }
  return out
}

// calculate a continued fraction for the given number
function getCF(num, maxdepth = 20, roundErr = 1e-6) {
  let value = num
  const continuedFraction = []

  for (let i = 0; i < maxdepth; i++) {
    const integer = Math.floor(value)
    continuedFraction.push(integer)

    value -= integer

    if (value <= roundErr) {
      break
    }

    value = 1.0 / value
  }

  return continuedFraction
}

// calculate a single convergent for a given continued fraction
function getConvergent(cf, depth = cf.length) {
  const sanitizedDepth = clamp(1, cf.length, depth)

  let num // the convergent numerator
  let den // the convergent denominator

  for (let d = 0; d < sanitizedDepth; d++) {
    num = cf[d]
    den = 1

    // calculate the convergent
    for (let i = d; i > 0; i--) {
      ;[den, num] = [num, den]
      num += den * cf[i - 1]
    }
  }

  return num + '/' + den
}

// calculate all best rational approximations given a continued fraction
//
function getConvergents(cf, maxPeriod = NaN, cnvgtIdxOut = null) {
  const numerators = [] // numerators of the approximations
  const denominators = [] // denominators of the appxoimations
  let digit // the continued fraction digit
  let num // the convergent numerator
  let den // the convergent denominator
  let scnum // the semiconvergent numerator
  let scden // the semiconvergent denominator
  const cind = [] // tracks indicies of convergents

  for (let d = 0; d < cf.length; d++) {
    digit = cf[d]
    num = digit
    den = 1

    // calculate the convergent
    for (let i = d; i > 0; i--) {
      ;[den, num] = [num, den]
      num += den * cf[i - 1]
    }

    if (d > 0) {
      for (let i = 1; i < digit; i++) {
        scnum = num - (digit - i) * numerators[cind[d - 1]]
        scden = den - (digit - i) * denominators[cind[d - 1]]

        if (scden > maxPeriod) {
          break
        }

        numerators.push(scnum)
        denominators.push(scden)
      }
    }

    if (den > maxPeriod) {
      break
    }

    cind.push(numerators.length)
    numerators.push(num)
    denominators.push(den)
  }

  if (!(cnvgtIdxOut === null)) {
    for (let i = 0; i < cind.length; i++) {
      cnvgtIdxOut.push(cind[i])
    }
  }

  return denominators
}

// pass in a number, can represent the logarithmic ratio of the generator / period
// recieve an object with rational approximation properties
function getRatioStructure(numIn, maxPeriod = 1e6) {
  if (isNaN(numIn)) {
    alert('Error in getRatioStructure(): num is ' + numIn)
  }

  const ratioStructure = {
    number: numIn,
    numerators: [], // the numerator of the approximation, degree of generator in MOS size
    denominators: [], // the denominator of the approximation, MOS sizes
    rationals: [], // the decimal of the approximation
    ratioStrings: [], // the ratio of the approximation
    xVectors: [], // x and y vectors are an array of number pairs that add up to the rational of the same index,
    yVectors: [], // can describe vectors of generator & period, such that [xV[0],yV[0]] = g(x, y), [xV[1],yV[1]] = p(x, y)
    cf: [], // the continued fraction of the number
    convergentIndicies: [], // indicies of convergents
    length: 0 // the length of most of the properties (except for 'cf' and 'convergentIndicies')
  }

  ratioStructure.cf = getCF(Math.abs(parseFloat(numIn)))
  const cf = ratioStructure.cf

  const structureLegend = [
    ratioStructure.xVectors,
    ratioStructure.yVectors,
    ratioStructure.numerators,
    ratioStructure.denominators,
    ratioStructure.rationals,
    ratioStructure.ratioStrings
  ]

  // pushes each elements of a packet its respective structure property
  function pushPack(pack) {
    pack.forEach(function(item, index) {
      structureLegend[index].push(item)
    })
  }

  // calculates the next packet based off of previous packet and cf index eveness
  function zigzag(lastPacket, cfidx) {
    let [x, y, num, den, ratio] = lastPacket
    cfidx % 2 ? (y = [num, den]) : (x = [num, den])
    num = x[0] + y[0]
    den = x[1] + y[1]
    ratio = num / den
    const p = [x, y, num, den, ratio, num + '/' + den]
    return p
  }

  // the seed of the sequence
  let packet = [[-1 + cf[0], 1], [1, 0], cf[0], 1, cf[0], cf[0] + '/' + 1]
  pushPack(packet)
  packet = zigzag(packet)

  for (let depth = 1; depth < cf.length; depth++) {
    for (let i = 0; i < cf[depth]; i++) {
      pushPack(packet)
      packet = zigzag(packet, depth)
      if (packet[3] > maxPeriod) {
        depth = cf.length
        break
      }
    }
  }

  ratioStructure.convergents = stepsToDegrees(ratioStructure.cf)
  ratioStructure.length = ratioStructure.denominators.length

  return ratioStructure
}

// calculates all possible rational numbers, not sorted. until stack overflow.
// if "underOne" true calculates all, if false only [0 .. 1]
function ratioGenerate(array, maxPeriod = 500, underOne = false, seed = [1, 1]) {
  if (seed[0] > maxPeriod || seed[1] > maxPeriod) {
    return seed
  }

  const r0 = [seed[0], seed[0] + seed[1]]
  const r1 = [seed[0] + seed[1], seed[1]]
  let r

  if (seed[0] - seed[1] !== 0 || !underOne) {
    r = ratioGenerate(array, maxPeriod, underOne, r1)
    if (r[0] / r[1] > 1) {
      r = [r[1], r[0]]
    }
    array.push(r)
  }

  r = ratioGenerate(array, maxPeriod, underOne, r0)
  if (r[0] / r[1] > 1 && underOne) {
    r = [r[1], r[0]]
  }
  array.push(r)

  return seed
}

// pass in a ratioStructure in get a 2D array of the prime limits of each approximation
function getRatioStructurePrimeLimits(structIn) {
  const primeLimitsOut = [] // [ [limitOfRatio], [limitOfNumerator], [limitOfDenominator] ], ...

  for (let i = 0; i < structIn.length; i++) {
    primeLimitsOut.push(getPrimesOfRatio(structIn.numerators[i], structIn.denominators[i]))
  }

  return primeLimitsOut
}

// pass in a period and generator, plus some filters, and get valid MOS sizes
function getValidMOSSizes(periodDecimal, generatorDecimal, minCents = 2.5, maxSize = 400, maxCFSize = 12) {
  const genlog = Math.log(generatorDecimal) / Math.log(periodDecimal) // the logarithmic ratio to generate MOS info

  let cf = [] // continued fraction
  let denominators = [] // MOS periods
  const convergentIndicies = [] // Indicies that are convergent

  cf = getCF(genlog, maxCFSize)
  denominators = getConvergents(cf, maxSize, convergentIndicies)

  // filter by step size threshold
  const gc = decimalToCents(generatorDecimal)
  const pc = decimalToCents(periodDecimal)
  let L = pc + gc // Large step
  let s = pc // small step
  let c = gc // chroma (L - s)

  for (let i = 1; i < cf.length; i++) {
    L -= c * cf[i]
    s = c
    c = L - s

    // break if g is some equal division of period
    if (c < 1e-6 && cf.length < maxCFSize) {
      // add size-1

      if (denominators[denominators.length - 2] !== denominators[denominators.length - 1] - 1) {
        denominators.splice(denominators.length - 1, 0, denominators[denominators.length - 1] - 1)
      }

      break
    }

    if (c < minCents) {
      const ind = convergentIndicies[i + 1]
      denominators.splice(ind + 1, denominators.length - ind)
      break
    }
  }

  // the first two periods are trivial (size 1)
  denominators.shift()
  denominators.shift()

  return denominators
}

// rank2 scale algorithm intended for integers, in ET contexts
// for example, period = 12, gen = 7 : [ 2 2 1 2 2 2 1 ]
function getRank2Mode(period, generator, size, numdown = 0) {
  const degrees = []
  const modeOut = []
  let interval

  interval = generator * -numdown
  for (let n = 0; n < size; n++) {
    while (interval < 0) {
      interval += period
    }
    if (interval >= period) {
      interval %= period
    }
    degrees.push(interval)
    interval += generator
  }

  degrees.sort(function(a, b) {
    return a - b
  })
  for (let n = 1; n < degrees.length; n++) {
    modeOut.push(degrees[n] - degrees[n - 1])
  }

  modeOut.push(period - degrees[degrees.length - 1])

  return modeOut
}

// returns an array of integers that share no common factors to the given integer
function getCoprimes(number) {
  const coprimes = [1]
  let num, mod
  for (let i = 2; i < number - 1; i++) {
    num = number
    mod = i
    while (mod > 1) {
      num = num % mod
      ;[num, mod] = [mod, num]
    }
    if (mod > 0) {
      coprimes.push(i)
    }
  }
  coprimes.push(number - 1)
  return coprimes
}

export {
  rotateArrayLeft,
  rotateArrayRight,
  getCF,
  getConvergent,
  getConvergents,
  getRatioStructure,
  getRatioStructurePrimeLimits,
  getValidMOSSizes,
  ratioGenerate,
  getRank2Mode,
  getCoprimes
}
