/**
 * TUNING DATA MODIFIERS
 */

/* global alert, jQuery */

import { parseTuningData, model } from './scaleworkshop.js'
import { trimSelf, debug } from './helpers/general.js'
import { isEmpty, trim } from './helpers/strings.js'
import { getLineType } from './helpers/types.js'
import { ratioToCents, lineToDecimal, decimalToCents, nOfEdoToCents } from './helpers/converters.js'
import { PRIMES, UNIX_NEWLINE, NEWLINE_REGEX, WINDOWS_NEWLINE } from './constants.js'
import { getRatioStructure } from './helpers/sequences.js'

let currentRatioStructure

// calculate and list rational approximations within user parameters
jQuery('#input_interval_to_approximate').change(function() {
  const interval = lineToDecimal(jQuery('#input_interval_to_approximate').val())
  currentRatioStructure = getRatioStructure(interval)
  modifyUpdateApproximations()
})

// stretch/compress tuning
function modifyStretch() {
  // remove white space from tuning data field
  trimSelf('#txt_tuning_data')

  if (isEmpty(jQuery('#txt_tuning_data').val())) {
    alert('No tuning data to modify.')
    return false
  }

  // var octave_size; // (pseudo)octave size in cents
  // var stretch_size; // size of new pseudo-octave after stretching
  const stretchRatio = parseFloat(jQuery('#input_stretch_ratio').val()) // amount of stretching, ratio

  // split user data into individual lines
  const lines = document.getElementById('txt_tuning_data').value.split(NEWLINE_REGEX)

  // strip out the unusable lines, assemble a multi-line string which will later replace the existing tuning data
  const newTuningLines = []
  for (let i = 0; i < lines.length; i++) {
    const line = trim(toString(lines[i]))
    if (!isEmpty(line)) {
      switch (getLineType(line)) {
        case 'invalid':
          return false
        case 'cents':
          newTuningLines.push((parseFloat(line) * stretchRatio).toFixed(5))
          break
        case 'n of edo':
          newTuningLines.push((nOfEdoToCents(line) * stretchRatio).toFixed(5))
          break
        case 'ratio':
          newTuningLines.push((ratioToCents(line) * stretchRatio).toFixed(5))
      }
    }
  }

  // update tuning input field with new tuning
  jQuery('#txt_tuning_data').val(newTuningLines.join(UNIX_NEWLINE))

  parseTuningData()

  jQuery('#modal_modify_stretch').dialog('close')

  // success
  return true
}

// random variance
function modifyRandomVariance() {
  // remove white space from tuning data field
  trimSelf('#txt_tuning_data')

  if (isEmpty(jQuery('#txt_tuning_data').val())) {
    alert('No tuning data to modify.')
    return false
  }

  const centsMaxVariance = parseFloat(jQuery('#input_cents_max_variance').val()) // maximum amount of variance in cents
  const varyPeriod = document.getElementById('input_checkbox_vary_period').checked

  // split user data into individual lines
  const lines = document.getElementById('txt_tuning_data').value.split(NEWLINE_REGEX)

  // strip out the unusable lines, assemble a multi-line string which will later replace the existing tuning data
  const newTuningLines = []
  for (let i = 0; i < lines.length; i++) {
    // only apply random variance if the line is not the period, or varyPeriod is true
    if (varyPeriod || i < lines.length - 1) {
      // get a cents offset to add later. ranges from -centsMaxVariance to centsMaxVariance
      const randomVariance = Math.random() * centsMaxVariance * 2 - centsMaxVariance

      // line contains a period, so it should be a value in cents
      if (lines[i].toString().includes('.')) {
        newTuningLines.push((parseFloat(lines[i]) + randomVariance).toFixed(5))
      }
      // line doesn't contain a period, so it is a ratio
      else {
        newTuningLines.push((ratioToCents(lines[i]) + randomVariance).toFixed(5))
      }
    }
    // last line is a period and we're not applying random variance to it
    else {
      newTuningLines.push(lines[i])
    }
  }

  // update tuning input field with new tuning
  jQuery('#txt_tuning_data').val(newTuningLines.join(UNIX_NEWLINE))

  parseTuningData()

  jQuery('#modal_modify_random_variance').dialog('close')

  // success
  return true
}

// mode
function modifyMode() {
  // remove white space from tuning data field
  trimSelf('#txt_tuning_data')

  if (isEmpty(jQuery('#txt_tuning_data').val())) {
    alert('No tuning data to modify.')
    return false
  }

  const mode = jQuery('#input_modify_mode')
    .val()
    .split(' ')

  // check user input for invalid items
  for (let i = 0; i < mode.length; i++) {
    mode[i] = parseInt(mode[i])

    if (isNaN(mode[i]) || mode[i] < 1) {
      alert(
        'Your mode should contain a list of positive integers, seperated by spaces. E.g.' + UNIX_NEWLINE + '5 5 1 3 1 2'
      )
      return false
    }
  }

  // split user's scale data into individual lines
  const lines = document.getElementById('txt_tuning_data').value.split(NEWLINE_REGEX)
  debug(lines)
  debug(mode)

  let newTuning = ''

  // modeType will be either intervals (e.g. 2 2 1 2 2 2 1) or from_base (e.g. 2 4 5 7 9 11 12)
  const modeType = jQuery('#modal_modify_mode input[type="radio"]:checked').val()

  if (modeType === 'intervals' || modeType === 'mos') {
    // get the total number of notes in the mode
    const modeSum = mode.reduce(function(a, b) {
      return a + b
    }, 0)

    // number of notes in the mode should equal the number of lines in the scale data field
    if (modeSum !== lines.length) {
      alert(
        "Your mode doesn't add up to the same size as the current scale." +
          UNIX_NEWLINE +
          "E.g. if you have a 5 note scale, mode 2 2 1 is valid because 2+2+1=5. But mode 2 2 2 is invalid because 2+2+2 doesn't equal 5."
      )
      return false
    }

    // strip out the unusable lines, assemble a multi-line string which will later replace the existing tuning data
    let noteCount = 1
    let modeIndex = 0
    const newline = model.get('newline') === 'windows' ? WINDOWS_NEWLINE : UNIX_NEWLINE
    for (let i = 0; i < lines.length; i++) {
      if (mode[modeIndex] === noteCount) {
        newTuning = newTuning + lines[i]

        // add a newline for all lines except the last
        if (i < lines.length - 1) {
          newTuning += newline
        }

        modeIndex++
        noteCount = 0
      }
      noteCount++
    }
  }

  // if ( modeType === "from_base" ) {
  else {
    // number of notes in the mode should equal the number of lines in the scale data field
    if (mode[mode.length - 1] !== lines.length) {
      alert(
        "Your mode isn't the same size as the current scale." +
          UNIX_NEWLINE +
          'E.g. if you have a 5 note scale, mode 2 4 5 is valid because the final degree is 5. But mode 2 4 6 is invalid because 6 is greater than 5.'
      )
      return false
    }

    // strip out the unusable lines, assemble a multi-line string which will later replace the existing tuning data
    for (let i = 0; i < mode.length; i++) {
      newTuning += lines[mode[i] - 1]

      // add a newline for all lines except the last
      if (i < mode.length - 1) {
        newTuning += UNIX_NEWLINE
      }
    }
  }

  // update tuning input field with new tuning
  jQuery('#txt_tuning_data').val(newTuning)

  parseTuningData()

  jQuery('#modal_modify_mode').dialog('close')

  // success
  return true
}

// sync beating
function modifySyncBeating() {
  // remove white space from tuning data field
  trimSelf('#txt_tuning_data')

  if (isEmpty(jQuery('#txt_tuning_data').val())) {
    alert('No tuning data to modify.')
    return false
  }

  if (isEmpty(jQuery('#input_modify_sync_beating_bpm').val())) {
    alert('Please enter a BPM value.')
    return false
  }

  // get the fundamental frequency of the scale
  const fundamental = jQuery('#input_modify_sync_beating_bpm').val() / 60
  debug(fundamental)

  const resolution = jQuery('#select_sync_beating_resolution').val()
  debug(resolution)

  // loop through all in the scale, convert to ratio, then quantize to fundamental, then convert to cents
  const lines = document.getElementById('txt_tuning_data').value.split(NEWLINE_REGEX)
  debug(lines)
  let newTuning = ''

  for (let i = 0; i < lines.length; i++) {
    lines[i] = lineToDecimal(lines[i])
    newTuning += toString(Math.round(lines[i] * resolution)) + '/' + toString(resolution) + UNIX_NEWLINE
  }
  newTuning = newTuning.trim() // remove final newline

  debug(newTuning)

  // set tuning base frequency to some multiple of the fundamental, +/- 1 tritone from the old base frequency
  const baseFrequencyLowerBound = jQuery('#txt_base_frequency').val() * 0.7071067
  let basefreq = fundamental
  do {
    basefreq = basefreq * 2
  } while (basefreq < baseFrequencyLowerBound)

  // update fields and parse
  jQuery('#txt_tuning_data').val(newTuning)
  jQuery('#txt_base_frequency').val(basefreq)
  parseTuningData()

  jQuery('#modal_modify_sync_beating').dialog('close')

  // success
  return true
}

/*
// key transpose
function modify_key_transpose() {
  // I will come back to this later... it's going to require some thinking with regards to just ratios...

  // remove white space from tuning data field
  trimSelf("#txt_tuningData")

  if ( isEmpty(jQuery( "#txt_tuningData" ).val()) ) {

    alert( "No tuning data to modify." );
    return false;

  }

  // split user data into individual lines
  var lines = document.getElementById("txt_tuningData").value.split(NEWLINE_REGEX);

  // key to transpose to
  var key = parseInt( jQuery( "#input_modify_key_transpose" ).val() );

  // warn user when their input is unusable
  if ( isNaN( key ) || key < 0 ) {
    alert( "Could not transpose, input error" );
    return false;
  }

  // if key number is larger than the scale, wrap it around
  key = key % lines.length;

  // warn on using 0
  if ( key === 0 ) {
    alert( "1/1 is already on key 0, so no change." );
  }

  // strip out the unusable lines, assemble a multi-line string which will later replace the existing tuning data
  var newTuning = "";
  for ( let i = 0; i < lines.length; i++ ) {

    // TODO

    newTuning = newTuning + lines[i];

    // add a newline for all lines except the last
    if ( i < lines.length-1 ) {
      newTuning += UNIX_NEWLINE;
    }

  }

  // update tuning input field with new tuning
  jQuery( "#txt_tuningData" ).val( newTuning );

  parseTuningData();

  jQuery( "#modal_modifyMode" ).dialog( "close" );

  // success
  return true;
}
*/

// approximate rationals
function modifyReplaceWithApproximation() {
  const tuningTable = model.get('tuning table')
  const newline = model.get('newline') === 'windows' ? WINDOWS_NEWLINE : UNIX_NEWLINE

  const degreeSelected = parseInt(jQuery('#input_scale_degree').val())

  if (degreeSelected < tuningTable.noteCount) {
    const tuningData = document.getElementById('txt_tuning_data')
    const lines = tuningData.value.split(NEWLINE_REGEX)

    const aprxs = document.getElementById('approximation_selection')
    let approximation = aprxs.options[aprxs.selectedIndex].text
    approximation = approximation.slice(0, approximation.indexOf('|')).trim()

    if (degreeSelected - 1 < lines.length && lineToDecimal(approximation)) {
      lines[degreeSelected - 1] = approximation
    } else {
      lines.push(approximation)
    }

    let linesToText = ''
    lines.forEach(function(item, index, array) {
      linesToText += lines[index]
      if (index + 1 < array.length) {
        linesToText += newline
      }
    })
    tuningData.value = linesToText

    parseTuningData()

    if (degreeSelected < tuningTable.noteCount - 1) {
      jQuery('#input_scale_degree').val(degreeSelected + 1)
      jQuery('#input_scale_degree').trigger('change')
    }
    // success
    return true
  }

  // invalid scale degree
  return false
}

// update list of rationals to choose from
function modifyUpdateApproximations() {
  jQuery('#approximation_selection').empty()

  if (!isEmpty(currentRatioStructure)) {
    const interval = lineToDecimal(jQuery('#input_interval_to_approximate').val())
    let mincentsd = parseFloat(jQuery('#input_min_error').val())
    let maxcentsd = parseFloat(jQuery('#input_max_error').val())
    let minprime = parseInt(jQuery(' #input_approx_min_prime').val())
    let maxprime = parseInt(jQuery(' #input_approx_max_prime').val())
    const semiconvergents = !document.getElementById('input_show_convergents').checked

    if (minprime < PRIMES[0]) {
      minprime = PRIMES[0]
      jQuery('#input_approx_min_prime').val(PRIMES[0])
    }

    if (maxprime > PRIMES[PRIMES.length - 1]) {
      maxprime = PRIMES[PRIMES.length - 1]
      jQuery('#input_approx_max_prime').val(maxprime)
    }

    if (mincentsd < 0) {
      mincentsd = 0
    }

    if (maxcentsd < 0) {
      maxcentsd = 0
    }

    const menulength = semiconvergents ? currentRatioStructure.length : currentRatioStructure.cf.length
    let index

    for (let i = 0; i < menulength; i++) {
      index = semiconvergents ? i : currentRatioStructure.convergentIndicies[i]
      if (index > currentRatioStructure.length) {
        break
      }

      const n = parseInt(currentRatioStructure.numerators[index])
      const d = parseInt(currentRatioStructure.denominators[index])
      const currentRatioPrimeLimits = model.get('modify approx ratio limits')
      const primeLimit = currentRatioPrimeLimits[index][0]

      const fractionStr = currentRatioStructure.ratiosStrings[index]
      const fraction = n / d

      const centsDeviation = decimalToCents(fraction) - decimalToCents(interval)
      const centsdabs = Math.abs(centsDeviation)
      const centsRounded = Math.round(10e6 * centsDeviation) / 10e6

      const centsdsgn = centsDeviation / centsdabs >= 0 ? '+' : ''

      const description = fractionStr + ' | ' + centsdsgn + centsRounded.toString() + 'c | ' + primeLimit + '-limit'

      if (!interval) {
        jQuery('#approximation_selection').append('<option selected disabled>Error: Invalid interval</option>')
        break
      } else if (interval === fraction && interval) {
        // for cases like 1200.0 === 2/1
        jQuery('#approximation_selection').append('<option>' + description + '</option>')
        break
      } else if (centsdabs >= mincentsd && centsdabs <= maxcentsd && primeLimit >= minprime && primeLimit <= maxprime) {
        jQuery('#approximation_selection').append('<option>' + description + '</option>')
      }
    }

    if (document.getElementById('approximation_selection').options.length === 0) {
      semiconvergents
        ? jQuery('#approximation_selection').append(
            '<option selected disabled> None found, try to raise error tolerances.</option>'
          )
        : jQuery('#approximation_selection').append(
            '<option selected disabled> Try to  "Show next best approximations" or edit filters.</option>'
          )
    }
  }
}

export {
  modifyUpdateApproximations,
  modifyRandomVariance,
  modifyMode,
  modifySyncBeating,
  modifyStretch,
  modifyReplaceWithApproximation
}
