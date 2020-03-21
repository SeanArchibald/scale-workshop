import { LINE_TYPE } from '../constants.js'
import { trim, toString } from './strings.js'

function isCent(rawInput) {
  // true, when the input has numbers at the beginning, followed by a dot, ending with any number of numbers
  // for example: 700.00
  const input = trim(toString(rawInput))
  return /^\d+\.\d*$/.test(input)
}

function isCommaDecimal(rawInput) {
  // true, when the input has numbers at the beginning, followed by a comma, ending with any number of numbers
  // for example: 1,25
  const input = trim(toString(rawInput))
  return /^\d+,\d*$/.test(input)
}

function isNOfEdo(rawInput) {
  // true, when the input has numbers at the beginning and the end, separated by a single backslash
  // for example: 7\12
  const input = trim(toString(rawInput))
  return /^\d+\\\d+$/.test(input)
}

function isRatio(rawInput) {
  // true, when the input has numbers at the beginning and the end, separated by a single slash
  // for example: 3/2
  const input = trim(toString(rawInput))
  return /^\d+\/\d+$/.test(input)
}

function getLineType(rawInput) {
  if (isCent(rawInput)) {
    return LINE_TYPE.CENTS
  } else if (isCommaDecimal(rawInput)) {
    return LINE_TYPE.DECIMAL
  } else if (isNOfEdo(rawInput)) {
    return LINE_TYPE.N_OF_EDO
  } else if (isRatio(rawInput)) {
    return LINE_TYPE.RATIO
  } else {
    return LINE_TYPE.INVALID
  }
}

export { isCent, isCommaDecimal, isNOfEdo, isRatio, getLineType }
