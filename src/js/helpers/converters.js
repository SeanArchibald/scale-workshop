/**
 * DATA CONVERSION FUNCTIONS
 */

/* global alert, location, jQuery, localStorage, navigator */
import { 
  isEmpty, 
  isNil, 
  isCent,
  isCommaDecimal,
  isNOfEdo,
  isRatio,
  getLineType, 
  trim 
  } from './general.js'
import { LINE_TYPE, SEMITONE_RATIO_IN_12_EDO } from '../constants.js'
import { getCF, getConvergent } from './sequences.js'

function getFloat(id, errorMessage) {
  var value = parseFloat(jQuery(id).val());

  if (isNaN(value) || value === 0) {
    alert(errorMessage);
    return false;
  }

  return value
}

function getString(id, errorMessage) {
  var value = jQuery(id).val();

  if (isEmpty(value) || isNil(value)) {
    alert(errorMessage);
    return false;
  }

  return value
}

function getLine(id, errorMessage) {
  var value = jQuery(id).val();

  if (isEmpty(value) || parseFloat(value) <= 0 || isNil(value) || getLineType(value) === LINE_TYPE.INVALID) {
    alert(errorMessage);
    return false;
  }

  return value
}

const toString = input => input + ''

// convert a cents value to decimal
function cents_to_decimal(rawInput) {
  const input = trim(toString(rawInput))
  return Math.pow(2, (parseFloat(input) / 1200.0));
}

// convert a ratio (string 'x/y') to decimal
function ratio_to_decimal(rawInput) {
  if (isRatio(rawInput)) {
    const input = trim(toString(rawInput))
    const [val1, val2] = input.split('/')
    return val1 / val2
  } else {
    alert("Invalid input: " + rawInput);
    return false
  }
}

// convert a comma decimal (1,25) to decimal
function commadecimal_to_decimal(rawInput) {
  if (isCommaDecimal(rawInput)) {
    const input = parseFloat(rawInput.toString().replace(',', '.'));
    if (input === 0 || isNaN(input)) {
      return false;
    } else {
      return input;
  }
  } else {
    alert("Invalid input: " + rawInput);
  return false;
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
function decimal_to_cents(rawInput) {
  if (rawInput === false) {
    return false
  }
  const input = parseFloat(rawInput);
  if (input === 0 || isNaN(input)) {
    return false;
  } else {
    return 1200.0 * Math.log2(input);
  }
}

// convert a ratio to cents
function ratio_to_cents(rawInput) {
  return decimal_to_cents(ratio_to_decimal(rawInput));
}

// convert an n-of-m-edo (string 'x\y') to decimal
function n_of_edo_to_decimal(rawInput) {
  if (isNOfEdo(rawInput)) {
    const input = trim(toString(rawInput))
    const [val1, val2] = input.split('\\').map(x => parseInt(x))
    return Math.pow(2, val1 / val2);
  } else {
    alert("Invalid input: " + rawInput);
    return false
  }
}

// convert an n-of-m-edo (string 'x\y') to cents
function n_of_edo_to_cents(rawInput) {
  return decimal_to_cents(n_of_edo_to_decimal(rawInput));
}

// convert a decimal to ratio (string 'x/y'), may have rounding errors for irrationals
function decimal_to_ratio(rawInput, iterations=15, depth=0) {
  if (rawInput === false)
    return false;

  const input = parseFloat(rawInput);

  if (input === 0 || isNaN(input)) {
    return false;
  } else {
    var inputcf = getCF(input, iterations, 100000);
    return getConvergent(inputcf, depth);
  }
}

/*
function cents_to_ratio(rawInput, iterations=15, depth=0) {
  return decimal_to_ratio(cents_to_decimal(rawInput), iterations, depth);
}
*/

/*
function n_of_edo_to_ratio(rawInput, iterations=15, depth=0) {
  return decimal_to_ratio(n_of_edo_to_decimal(rawInput), iterations, depth);
}
*/

// convert any input 'line' to decimal
function line_to_decimal(rawInput) {
  let converterFn = () => false

  switch (getLineType(rawInput)) {
    case LINE_TYPE.CENTS:
      converterFn = cents_to_decimal
      break
  case LINE_TYPE.DECIMAL:
    converterFn = commadecimal_to_decimal
    break
    case LINE_TYPE.N_OF_EDO:
      converterFn = n_of_edo_to_decimal
      break
    case LINE_TYPE.RATIO:
      converterFn = ratio_to_decimal
      break
  }

  return converterFn(rawInput)
}

// convert any input 'line' to a cents value
function line_to_cents(rawInput) {
  return decimal_to_cents(line_to_decimal(rawInput));
}

// convert a midi note number to a frequency in Hertz
// assuming 12-edo at 1440Hz (100% organic vanilla)
function mtof(input) {
  return 8.17579891564 * Math.pow(SEMITONE_RATIO_IN_12_EDO, parseInt(input));
}

// convert a frequency to a midi note number and cents offset
// assuming 12-edo at 1440Hz
// returns an array [midi_note_number, cents_offset]
function ftom(input) {
  input = parseFloat(input);
  var midi_note_number = 69 + (12 * Math.log2(input / 440));
  var cents_offset = (midi_note_number - Math.round(midi_note_number)) * 100;
  midi_note_number = Math.round(midi_note_number);
  return [midi_note_number, cents_offset];
}

// convert an array of step values into absolute degree values
function stepsToDegrees(steps) {
  let degrees = [0];
  if (steps.length > 0) {
    for (let i = 1; i < steps.length; i++) {
      degrees.push(degrees[i-1] + steps[i]);
    }
  }
  return degrees;
}

// convert absolute degree values into an array of step values
// if first degree is nonzero, doing degrees -> steps -> degrees will normalize the set
// if degrees are a musical scale, the last note needs to be the period (or equivalency)
function degreesToSteps(degrees) {
  let steps = [];
  if (degrees.length > 1) {
    for (let i = 1; i < degrees.length; i++) {
      steps.push(degrees[i] - degrees[i-1]);
    }
  }
  return steps;
}

// convert an input string into a filename-sanitized version
// if input is empty, returns "tuning" as a fallback
function sanitize_filename(input) {
  if (isEmpty(input.trim())) {
    return "tuning";
  }
  return input.replace(/[|&;$%@"<>()+,?]/g, "").replace(/\//g, "_");
}

// find MIDI note name from MIDI note number
function midi_note_number_to_name(input) {
  var n = parseInt(input);
  var quotient = Math.floor(n / 12);
  var remainder = n % 12;
  var name = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  return name[remainder] + quotient;
}


export {
  getFloat,
  getString,
  getLine,
  toString,
  cents_to_decimal,
  ratio_to_decimal,
  commadecimal_to_decimal,
  decimal_to_cents,
  ratio_to_cents,
  n_of_edo_to_decimal,
  n_of_edo_to_cents,
  decimal_to_ratio,
  line_to_decimal,
  line_to_cents,
  mtof,
  ftom,
  stepsToDegrees,
  degreesToSteps,
  sanitize_filename,
  midi_note_number_to_name
}
