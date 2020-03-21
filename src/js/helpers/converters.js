/**
 * DATA CONVERSION FUNCTIONS
 */

/* global alert, jQuery */

import { LINE_TYPE, SEMITONE_RATIO_IN_12_EDO } from '../constants.js'
import { model } from '../scaleworkshop.js'
import { isNil } from './general.js'
import { isCommaDecimal, isRatio, getLineType } from './types.js'
import { isEmpty, trim, toString } from './strings.js'
import { getCF, getConvergent } from './sequences.js'
import { mathModulo } from './numbers.js'

function getFloat(id, errorMessage) {
  const value = parseFloat(jQuery(id).val())

  if (isNaN(value) || value === 0) {
    alert(errorMessage)
    return false
  }

  return value
}

function getString(id, errorMessage) {
  const value = jQuery(id).val()

  if (isEmpty(value) || isNil(value)) {
    alert(errorMessage)
    return false
  }

  return value
}

function getLine(id, errorMessage) {
  const value = jQuery(id).val()

  if (isEmpty(value) || parseFloat(value) <= 0 || isNil(value) || getLineType(value) === LINE_TYPE.INVALID) {
    alert(errorMessage)
    return false
  }

  return value
}

// convert a cents value to decimal
function centsToDecimal(rawInput) {
  const input = trim(toString(rawInput))
  return Math.pow(2, parseFloat(input) / 1200.0)
}

// convert a ratio (string 'x/y') to decimal
function ratioToDecimal(rawInput) {
  if (isRatio(rawInput)) {
    const input = trim(toString(rawInput))
    const [val1, val2] = input.split('/')
    return val1 / val2
  } else {
    alert('Invalid input: ' + rawInput)
    return false
  }
}

// convert a comma decimal (1,25) to decimal
function commadecimalToDecimal(rawInput) {
  if (isCommaDecimal(rawInput)) {
    const input = parseFloat(rawInput.toString().replace(',', '.'))
    if (input === 0 || isNaN(input)) {
      return false
    } else {
      return input
    }
  } else {
    alert('Invalid input: ' + rawInput)
    return false
  }
}

/*
// convert a decimal (1.25) into commadecimal (1,25)
function decimal_to_commadecimal(rawInput) {
  if (isCents(rawInput)) { // a bit misleading
    const input = rawInput.toString().replace('.', ',');
    return input;
  } else {
    alert("Invalid input: " + rawInput);
    return false;
  }
}
*/

// convert a decimal into cents
function decimalToCents(rawInput) {
  if (rawInput === false) {
    return false
  }
  const input = parseFloat(rawInput)
  if (input === 0 || isNaN(input)) {
    return false
  } else {
    return 1200.0 * Math.log2(input)
  }
}

// convert a ratio to cents
function ratioToCents(rawInput) {
  return decimalToCents(ratioToDecimal(rawInput))
}

// convert an n-of-m-edo (string 'x\y') to decimal (float 1.546)
function nOfEdoToDecimal(rawInput) {
  const input = trim(toString(rawInput))
  const [val1, val2] = input.split('\\').map(x => parseInt(x))
  return Math.pow(2, val1 / val2)
}

// convert an n-of-m-edo (string 'x\y') to cents (string 'zzz.')
function nOfEdoToCents(rawInput) {
  return decimalToCents(nOfEdoToDecimal(rawInput))
}

// convert a decimal (string '1.25') to ratio (array of int [5, 4]), may have rounding errors for irrationals
function decimalToRatio(rawInput, iterations = 15, depth = 0) {
  const input = parseFloat(rawInput)

  if (input === 0 || isNaN(input)) {
    return false
  } else {
    const inputcf = getCF(input, iterations)
    return getConvergent(inputcf)
  }
}

/*
function centsToRatio(rawInput, iterations=15, depth=0) {
  return decimalToRatio(centsToDecimal(rawInput), iterations, depth);
}
*/

/*
function nOfEdoToRatio(rawInput, iterations=15, depth=0) {
  return decimalToRatio(nOfEdoToDecimal(rawInput), iterations, depth);
}
*/

// convert any input 'line' to decimal
function lineToDecimal(rawInput) {
  let converterFn = () => false

  switch (getLineType(rawInput)) {
    case LINE_TYPE.CENTS:
      converterFn = centsToDecimal
      break
    case LINE_TYPE.DECIMAL:
      converterFn = commadecimalToDecimal
      break
    case LINE_TYPE.N_OF_EDO:
      converterFn = nOfEdoToDecimal
      break
    case LINE_TYPE.RATIO:
      converterFn = ratioToDecimal
      break
  }

  return converterFn(rawInput)
}

// convert any input 'line' to a cents value
function lineToCents(rawInput) {
  return decimalToCents(lineToDecimal(rawInput))
}

// convert a midi note number to a frequency in Hertz
// assuming 12-edo at 1440Hz (100% organic vanilla)
function mtof(input) {
  return 8.17579891564 * Math.pow(SEMITONE_RATIO_IN_12_EDO, parseInt(input))
}

// convert a frequency to a midi note number and cents offset
// assuming 12-edo at 1440Hz
// returns an array [midiNoteNumber, centsOffset]
function ftom(input) {
  let midiNoteNumber = 69 + 12 * Math.log2(parseFloat(input) / 440)
  const centsOffset = (midiNoteNumber - Math.round(midiNoteNumber)) * 100
  midiNoteNumber = Math.round(midiNoteNumber)
  return [midiNoteNumber, centsOffset]
}

// convert an array of step values into absolute degree values
function stepsToDegrees(steps) {
  const degrees = [0]
  steps.forEach((step, index) => degrees.push(degrees[index] + step))
  return degrees.splice(1)
}

// convert absolute degree values into an array of step values
function degreesToSteps(degrees) {
  const degreesRooted = [0, ...degrees]
  const steps = []
  degrees.forEach((degree, index) => steps.push(degree - degreesRooted[index]))
  return steps
}

// convert an input string into a filename-sanitized version
// if input is empty, returns "tuning" as a fallback
function sanitizeFilename(input) {
  if (isEmpty(input.trim())) {
    return 'tuning'
  }
  return input.replace(/[|&;$%@"<>()+,?]/g, '').replace(/\//g, '_')
}

// find MIDI note name from MIDI note number
function midiNoteNumberToName(input) {
  const n = parseInt(input)
  const quotient = Math.floor(n / 12)
  const remainder = n % 12
  const name = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  return name[remainder] + quotient
}

function degreeModPeriod(degree) {
  return mathModulo(degree, model.get('tuning table').noteCount - 1)
}

function degreeModPeriodCents(degree) {
  const tuningTable = model.get('tuning table')
  return tuningTable.cents[degreeModPeriod(degree) + tuningTable.baseMidiNote]
}

export {
  getFloat,
  getString,
  getLine,
  centsToDecimal,
  ratioToDecimal,
  commadecimalToDecimal,
  decimalToCents,
  ratioToCents,
  nOfEdoToDecimal,
  nOfEdoToCents,
  decimalToRatio,
  lineToDecimal,
  lineToCents,
  mtof,
  ftom,
  stepsToDegrees,
  degreesToSteps,
  sanitizeFilename,
  midiNoteNumberToName,
  degreeModPeriod,
  degreeModPeriodCents
}
