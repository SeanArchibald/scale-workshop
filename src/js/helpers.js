/**
 * HELPER FUNCTIONS
 */

/* global alert, location, jQuery, localStorage, navigator */
import { LINE_TYPE } from './constants.js'
import { debug_enabled, resetTuningTable } from './scaleworkshop.js'
import { SEMITONE_RATIO_IN_12_EDO } from './constants.js'
import { get_cf, get_convergent } from './sequences.js'

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
  return /^\d+\,\d*$/.test(input);
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

// convert an input string into a filename-sanitized version
// if input is empty, returns "tuning" as a fallback
function sanitize_filename(input) {
  if (isEmpty(input.trim())) {
    return "tuning";
  }
  return input.replace(/[|&;$%@"<>()+,?]/g, "").replace(/\//g, "_");
}

// clear all inputted scale data
function clear_all() {

  // empty text fields
  jQuery("#txt_tuning_data").val("");
  jQuery("#txt_name").val("");

  // empty any information displayed on page
  jQuery("#tuning-table").empty();

  // restore default base tuning
  jQuery("#txt_base_frequency").val(440);
  jQuery("#txt_base_midi_note").val(69);

  resetTuningTable()
}

// find MIDI note name from MIDI note number
function midi_note_number_to_name(input) {
  var n = parseInt(input);
  var quotient = Math.floor(n / 12);
  var remainder = n % 12;
  var name = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  return name[remainder] + quotient;
}

// convert a decimal to ratio (string 'x/y'), may have rounding errors for irrationals
function decimal_to_ratio(rawInput, iterations=15, depth=0) {

  if (rawInput === false)
    return false;
  
  const input = parseFloat(rawInput);
  
  if (input === 0 || isNaN(input)) {
    return false;
    } 
  else {
    var inputcf = get_cf(input, iterations, 100000);
    return get_convergent(inputcf, depth);
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

function debug(msg = "") {
  if (debug_enabled) {
    msg = isEmpty(msg) ? "Debug" : msg;
    console.log(msg);
    return true;
  }
  return false;
}

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

function setScaleName(title) {
  jQuery("#txt_name").val(title);
}

function closePopup(id) {
  jQuery(id).dialog("close");
}

function setTuningData(tuning) {
  jQuery("#txt_tuning_data").val(tuning)
}

const isEmpty = string => string === ''

const isNil = x => typeof x === 'undefined' || x === null

const isFunction = x => typeof x === 'function'

const toString = input => input + ''

const trim = input => input.trim()

function getCoordsFromKey(tdOfKeyboard) {
  try {
    return JSON.parse(tdOfKeyboard.getAttribute('data-coord'))
  } catch (e) {
    return []
  }
}

// Runs the given function with the supplied value, then returns the value
// This is a great tool for injecting debugging in the middle of expressions
// Note: fn does not need to return the value, tap will handle that
//
// example 1: const result = toString(tap(function(result){ debug(result) }, 3 * 5))
// example 2: const result = toString(tap(result => debug(result), 3 * 5))
// example 3: const result = toString(tap(debug, 3 * 5))
//
// the above examples are equal to:
//   let result = 3 * 5
//   debug(result)
//   result = toString(result)
function tap(fn, value) {
  fn(value)
  return value
}


function getSearchParamOr (valueIfMissing, key, url) {
  return url.searchParams.has(key) ? url.searchParams.get(key) : valueIfMissing
}

function getSearchParamAsNumberOr (valueIfMissingOrNan, key, url) {
  return (url.searchParams.has(key) && !isNaN(url.searchParams.get(key))) ? parseFloat(url.searchParams.get(key)) : valueIfMissingOrNan;
}

function trimSelf (el) {
  jQuery(el).val(function (idx, val) {
    return val.trim()
  })
}

function openDialog (el, onOK) {
  jQuery(el).dialog({
    modal: true,
    buttons: {
      OK: onOK,
      Cancel: function() {
        jQuery( this ).dialog( 'close' );
      }
    }
  })
}

// redirect all traffic to https, if not there already
// source: https://stackoverflow.com/a/4723302/1806628
function redirectToHTTPS() {
  if (location.protocol !== 'https:') {
    location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
  }
}

// source: https://stackoverflow.com/a/16427747/1806628
const isLocalStorageAvailable = () => {
  const test = 'test';
  try {
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch(e) {
    return false;
  }
}

// source: https://stackoverflow.com/a/9514476/1806628
const isRunningOnWindows = () => {
  return navigator.userAgent.userAgent.includes('Windows')
}

export {
  debug,
  redirectToHTTPS,
  decimal_to_cents,
  isEmpty,
  getSearchParamOr,
  getSearchParamAsNumberOr,
  sanitize_filename,
  getLineType,
  line_to_decimal,
  isNil,
  getCoordsFromKey,
  tap,
  ratio_to_cents,
  trimSelf,
  isCent,
  isNOfEdo,
  decimal_to_ratio,
  closePopup,
  getLine,
  setTuningData,
  setScaleName,
  getFloat,
  getString,
  mtof,
  midi_note_number_to_name,
  ftom,
  isFunction,
  line_to_cents,
  openDialog,
  clear_all,
  trim,
  n_of_edo_to_cents,
  isLocalStorageAvailable,
  isRunningOnWindows,
}
