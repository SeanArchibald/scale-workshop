/**
 * INIT
 */

/* global location, localStorage, alert, FileReader, DOMParser, jQuery */

import {
  redirectToHTTPS,
  getSearchParamOr,
  getSearchParamAsNumberOr,
  isNil,
  getNewlineSettingsFromBrowser,
  roundToNDecimals
} from './helpers/general.js'
import { isEmpty } from './helpers/strings.js'
import { getLineType } from './helpers/types.js'
import {
  decimalToCents,
  lineToDecimal,
  sanitizeFilename,
  stepsToDegrees,
  degreesToSteps,
  degreeModPeriodCents
} from './helpers/converters.js'
import { LINE_TYPE, TUNING_MAX_SIZE, UNIX_NEWLINE, NEWLINE_REGEX, LOCALSTORAGE_PREFIX, PRIMES } from './constants.js'
import {
  getScaleUrl,
  updatePageUrl,
  exportAnamarkTun,
  exportScalaScl,
  exportScalaKbm,
  exportMaxMspColl,
  exportPdText,
  exportKontaktScript,
  exportReferenceDeflemask,
  exportUrl
} from './exporters.js'
import {
  getValidMOSSizes,
  getCF,
  getConvergents,
  getRank2Mode,
  getRatioStructure,
  getRatioStructurePrimeLimits
} from './helpers/sequences.js'
import Model from './helpers/Model.js'
import Synth from './synth/Synth.js'
import MIDI from './helpers/MIDI.js'
import { initUI } from './ui.js'
import { initSynth } from './synth.js'
import { initEvents } from './events.js'
import { mathModulo } from './helpers/numbers.js'

// check if coming from a Back/Forward history navigation.
// need to reload the page so that url params take effect
jQuery(window).on('popstate', function() {
  console.log('Back/Forward navigation detected - reloading page')
  location.reload(true)
})

if (window.location.hostname.endsWith('.github.com') || window.location.hostname.endsWith('sevish.com')) {
  redirectToHTTPS()
}

const synth = new Synth()
const midi = new MIDI()
const model = new Model({
  'main volume': 0.8,
  newline: getNewlineSettingsFromBrowser(),
  'tuning table': {
    scale_data: [], // an array containing list of intervals input by the user
    tuningData: [], // an array containing the same list above converted to decimal format
    noteCount: 0, // number of values stored in tuningData
    freq: [], // an array containing the frequency for each MIDI note
    cents: [], // an array containing the cents value for each MIDI note
    decimal: [], // an array containing the frequency ratio expressed as decimal for each MIDI note
    baseFrequency: 440, // init val
    baseMidiNote: 69, // init val
    description: '',
    filename: ''
  },
  'staged ET period': 2,
  'staged ET divisions': 5,
  'staged ET cents threshold': 2.5,
  'staged rank-2 period': 2,
  'staged rank-2 generator': 1.5,
  'staged rank-2 size': 7,
  'staged rank-2 generators down': 1,
  'staged rank-2 MOS sizes': [0],
  'staged rank-2 structure': null,
  'modify mode type': 'intervals',
  'modify mode type previous': 'intervals',
  'modify mode mos degrees': [2, 3],
  'modify mode mos sizes': [2],
  'modify mode mos degree selected': 2,
  'modify mode mos size selected': 2,
  'modify mode input': [],
  'modify mode mos structure': null,
  'modify approx degree': 1,
  'modify approx interval': 1,
  'modify approx min error': 0.0,
  'modify approx max error': 15.0,
  'modify approx min prime': 0,
  'modify approx max prime': 10,
  'modify approx convergents': false,
  'modify approx ratio structure': null,
  'modify approx ratio limits': [0],
  'modify approx approximation': 0,
  'modify approx prime counters': [0, 10]
})

// data changed, handle programmatic reaction - no jQuery
model.on('change', (key, newValue) => {
  console.log('model:change', key, newValue)
  switch (key) {
    case 'main volume':
      synth.setMainVolume(newValue)
      break
    case 'newline':
      localStorage.setItem(`${LOCALSTORAGE_PREFIX}newline`, newValue)
      console.log('line ending changed to', newValue)
      break
    case 'staged rank-2 period':
      break
    case 'staged rank-2 generator':
      break
    case 'modify mode type':
      if (model.get('modify mode type previous') === 'frombase') {
        model.set('modify mode input', degreesToSteps(model.get('modify mode input').map(x => parseInt(x))))
      } else if (newValue === 'frombase') {
        model.set('modify mode input', stepsToDegrees(model.get('modify mode input').map(x => parseInt(x))))
      }
      model.set('modify mode type previous', newValue)
      break
    case 'modify mode mos degrees':
      model.set('modify mode mos degree selected', newValue[0])
      break
    case 'modify mode mos degree selected': {
      let sizes = getConvergents(getCF(newValue / (model.get('tuning table').noteCount - 1)))
      sizes = sizes.slice(2, sizes.length - 1)
      model.set('modify mode mos sizes', sizes)
      if (model.get('modify mode type') === 'mos') model.set('modify mode mos size selected', sizes[0])
      break
    }
    case 'modify mode mos size selected':
      model.set(
        'modify mode input',
        getRank2Mode(model.get('tuning table').noteCount - 1, model.get('modify mode mos degree selected'), newValue)
      )
      break
    case 'modify approx degree':
      model.set('modify approx interval', model.get('tuning table').scale_data[newValue])
      break
    case 'modify approx interval':
      model.set('modify approx ratio structure', getRatioStructure(lineToDecimal(newValue)))
      break
    case 'modify approx ratio structure':
      model.set('modify approx ratio limits', getRatioStructurePrimeLimits(newValue))
      break
    case 'modify approx min error':
      break
    case 'modify approx max error':
      break
    case 'modify approx min prime':
      break
    case 'modify approx max prime':
      break
    case 'modify approx convergents':
      break
  }
})

// data changed, sync it with the DOM
model.on('change', (key, newValue) => {
  switch (key) {
    case 'main volume':
      jQuery('#input_range_main_vol').val(newValue)
      break
    case 'newline':
      jQuery('#input_select_newlines').val(newValue)
      break
    case 'staged rank-2 sizes':
      jQuery('#info_rank_2_mos').val(newValue.join(', '))
      break
    case 'modify mode type':
      document.getElementById('mos_mode_options').style.display = newValue === 'mos' ? 'block' : 'none'
      break
    case 'modify mode mos degrees':
      {
        const degreeCents = model
          .get('modify mode mos degrees')
          .map(degree => ' (' + roundToNDecimals(6, degreeModPeriodCents(degree)) + 'c)')
        setDropdownOptions(
          '#modal_modify_mos_degree',
          model.get('modify mode mos degrees').map((degree, index) => degree + degreeCents[index])
        )
      }
      break
    case 'modify mode mos degree selected':
      setDropdownOptions('#modal_modify_mos_size', model.get('modify mode mos sizes'))
      break
    case 'modify mode input':
      jQuery('#input_modify_mode').val(newValue.join(' '))
      break
    case 'modify approx degree':
      jQuery('#input_scale_degree').val(newValue)
      break
    case 'modify approx interval':
      jQuery('#input_interval_to_approximate').val(newValue)
      break
    case 'modify approx ratio limits':
      updateApproximationOptions()
      break
    case 'modify approx min error':
      updateApproximationOptions()
      break
    case 'modify approx max error':
      updateApproximationOptions()
      break
    case 'modify approx min prime':
      jQuery('#input_approx_min_prime').val(PRIMES[newValue])
      updateApproximationOptions()
      break
    case 'modify approx max prime':
      jQuery('#input_approx_max_prime').val(PRIMES[newValue])
      updateApproximationOptions()
      break
    case 'modify approx convergents':
      updateApproximationOptions()
      break
  }
})

// set initial values of the UI based on the values in model
jQuery(() => {
  jQuery('#input_range_main_vol').val(model.get('main volume'))
  jQuery('#input_select_newlines').val(model.get('newline'))
  // TODO: set inputs for tuning table
})

jQuery(() => {
  const midiEnablerBtn = jQuery('#midi-enabler')

  midi
    .on('blocked', () => {
      midiEnablerBtn
        .prop('disabled', false)
        .removeClass('btn-success')
        .addClass('btn-danger')
        .text('off (blocked)')
    })
    .on('note on', synth.noteOn.bind(synth))
    .on('note off', synth.noteOff.bind(synth))

  midiEnablerBtn.on('click', () => {
    if (midi.isSupported()) {
      midiEnablerBtn
        .prop('disabled', true)
        .removeClass('btn-danger')
        .addClass('btn-success')
        .text('on')
      midi.init()
    }
  })
})

// clear all inputted scale data
function clearAll() {
  // empty text fields
  jQuery('#txt_tuning_data').val('')
  jQuery('#txt_name').val('')

  // empty any information displayed on page
  jQuery('#tuning-table').empty()

  // restore default base tuning
  jQuery('#txt_base_frequency').val(440)
  jQuery('#txt_base_midi_note').val(69)

  // reset tuning table
  model.set('tuning table', {
    scale_data: [],
    tuningData: [],
    noteCount: 0,
    freq: [],
    cents: [],
    decimal: [],
    baseFrequency: 440,
    baseMidiNote: 69,
    description: '',
    filename: ''
  })
}

function setDropdownOptions(element, optionsText, optionsValue = [], otherTags = [], clearExistingOptions = true) {
  if (clearExistingOptions) {
    jQuery(element).empty()
  }

  optionsText.forEach(function(option, index) {
    let injection = optionsValue ? optionsValue[index] : option
    injection += '" ' + otherTags[index]
    jQuery(element).append('<option value="' + injection + '>' + option + '</option>')
  })
}

// DOM changed, need to sync it with model
jQuery('#input_range_main_vol').on('input', function() {
  model.set('main volume', parseFloat(jQuery(this).val()))
})

let keyColors = [
  'white',
  'black',
  'white',
  'white',
  'black',
  'white',
  'black',
  'white',
  'white',
  'black',
  'white',
  'black'
]

// take a tuning, do loads of calculations, then output the data to tuningTable
function generateTuningTable(tuning) {
  const tuningTable = model.get('tuning table')

  const baseFrequency = tuningTable.baseFrequency
  const baseMidiNote = tuningTable.baseMidiNote

  for (let i = 0; i < TUNING_MAX_SIZE; i++) {
    const offset = i - baseMidiNote
    const quotient = Math.floor(offset / (tuning.length - 1))
    let remainder = offset % (tuning.length - 1)
    if (remainder < 0) remainder += tuning.length - 1
    const period = tuning[tuning.length - 1]
    // "decimal" here means a frequency ratio, but stored in decimal format
    const decimal = tuning[remainder] * Math.pow(period, quotient)

    // store the data in the tuningTable object
    tuningTable.freq[i] = baseFrequency * decimal
    tuningTable.cents[i] = decimalToCents(decimal)
    tuningTable.decimal[i] = decimal

    model.set('tuning table', tuningTable)
  }
}

function setKeyColors(list) {
  const tuningTable = model.get('tuning table')

  // check if the list of colors is empty
  if (isEmpty(list)) {
    // bail, leaving the previous colors in place
    return false
  }

  keyColors = list.split(' ')

  // get all the tuning table key cell elements
  const ttkeys = jQuery('#tuning-table td.key-color')
  // for each td.key-color
  for (let i = 0; i < TUNING_MAX_SIZE; i++) {
    // get the number representing this key color, with the first item being 0

    const keynum = mathModulo(i - tuningTable.baseMidiNote, keyColors.length)
    // set the color of the key
    jQuery(ttkeys[i]).attr('style', 'background-color: ' + keyColors[keynum] + ' !important')
    // console.log( i + ": " + keyColors[keynum] );
  }
}

function updateApproximationOptions() {
  const interval = model.get('modify approx interval')
  const minCentsError = model.get('modify approx min error')
  const maxCentsError = model.get('modify approx max error')
  const minPrimeLimit = PRIMES[model.get('modify approx min prime')]
  const maxPrimeLimit = PRIMES[model.get('modify approx max prime')]
  const semiconvergents = !model.get('modify approx convergents')
  const ratioStructure = model.get('modify approx ratio structure')
  const ratioLimits = model.get('modify approx ratio limits')
  const menulength = semiconvergents ? ratioStructure.length : ratioStructure.cf.length

  const descriptions = []
  const values = []
  const tags = []

  let index = 0
  for (let i = 0; i < menulength; i++) {
    index = semiconvergents ? i : ratioStructure.convergentIndicies[i]
    if (index > ratioStructure.length) break

    const limit = ratioLimits[index][0]

    const ratioString = ratioStructure.ratioStrings[index]
    const decimal = ratioStructure.rationals[index]

    const centsDelta = decimalToCents(decimal / lineToDecimal(interval))
    const centsDeltaAbs = Math.abs(centsDelta)
    const centsRounded = roundToNDecimals(6, centsDelta)

    let centsSign = ''
    if (centsDelta / centsDeltaAbs >= 0) centsSign = '+'

    const description = ratioString + ' | ' + centsSign + centsRounded.toString() + 'c | ' + limit + '-limit'

    if (!interval) {
      tags.push('selected disabled')
      descriptions.push('Error: Invalid interval')
      break
    } else if (interval === decimal && interval) {
      // for cases like 1200.0 === 2/1
      descriptions.push(description)
      values.push(ratioString)
      break
    } else if (
      centsDeltaAbs >= minCentsError &&
      centsDeltaAbs <= maxCentsError &&
      limit >= minPrimeLimit &&
      limit <= maxPrimeLimit
    ) {
      descriptions.push(description)
      values.push(ratioString)
    }
  }

  // console.log("last index = " + index)

  if (descriptions.length === 0) {
    semiconvergents
      ? descriptions.push('None found, try to raise error tolerances.')
      : descriptions.push('Try to  "Show next best approximations" or edit filters.')
    tags.push('selected disabled')
  }

  setDropdownOptions('#approximation_selection', descriptions, values, tags)
  model.set('modify approx approximation', jQuery('#approximation_selection')[0].options[0].value)
}

function parseUrl() {
  // ?name=16%20equal%20divisions%20of%202%2F1&data=75.%0A150.%0A225.%0A300.%0A375.%0A450.%0A525.%0A600.%0A675.%0A750.%0A825.%0A900.%0A975.%0A1050.%0A1125.%0A1200.&freq=440&midi=69&vert=5&horiz=1&colors=white%20black%20white%20black%20white%20black%20white%20white%20black%20white%20black%20white%20black%20white%20black%20white&waveform=sine&ampenv=pad
  const url = new URL(window.location.href)

  // get data from url params, and use sane defaults for tuning name, base frequency and base midi note number if data missing
  const name = getSearchParamOr('', 'name', url)
  let data = getSearchParamOr(false, 'data', url)
  const freq = getSearchParamAsNumberOr(440, 'freq', url)
  const midi = getSearchParamAsNumberOr(69, 'midi', url)
  const source = getSearchParamOr('', 'source', url)

  // get isomorphic keyboard mapping
  const vertical = getSearchParamAsNumberOr(false, 'vert', url)
  const horizontal = getSearchParamAsNumberOr(false, 'horiz', url)

  // get key colours
  const colors = getSearchParamOr(false, 'colors', url)

  // get synth options
  const waveform = getSearchParamOr(false, 'waveform', url)
  const ampenv = getSearchParamOr(false, 'ampenv', url)

  // bail if there is no data
  if (!data) {
    return false
  }

  // decodes HTML entities
  function decodeHTML(input) {
    const doc = new DOMParser().parseFromString(input, 'text/html')
    return doc.documentElement.textContent
  }

  // parses Scala entries from the Xenharmonic Wiki
  function parseWiki(str) {
    let s = decodeHTML(str)
    s = s.replace(/[_ ]+/g, '') // remove underscores and spaces
    let a = s.split(NEWLINE_REGEX) // split by line into an array
    a = a.filter(line => !line.startsWith('<') && !line.startsWith('{') && !isEmpty(line)) // remove <nowiki> tag, wiki templates and blank lines
    a = a.map(line => line.split('!')[0]) // remove .scl comments
    a = a.slice(2) // remove .scl metadata
    return a.join(UNIX_NEWLINE)
  }

  // specially parse inputs from the Xenharmonic Wiki
  if (source === 'wiki') {
    data = parseWiki(data)
  }

  // enter the data from url in to the on-page form
  jQuery('#txt_name').val(name)
  jQuery('#txt_tuning_data').val(data)
  jQuery('#txt_base_frequency').val(freq)
  jQuery('#txt_base_midi_note').val(midi)
  jQuery('#input_number_isomorphicmapping_vert').val(vertical)
  jQuery('#input_number_isomorphicmapping_horiz').val(horizontal)

  // if there is isomorphic keyboard mapping data, apply it
  if (vertical !== false) synth.isomorphicMapping.vertical = vertical
  if (horizontal !== false) synth.isomorphicMapping.horizontal = horizontal

  // parse the tuning data
  if (parseTuningData()) {
    // if there are key colorings, apply them
    if (colors !== false) {
      jQuery('#input_key_colors').val(colors)
      setKeyColors(colors)
    }

    // if there are synth options, apply them
    if (waveform !== false) {
      jQuery('#input_select_synth_waveform').val(waveform)
      synth.waveform = waveform
    }
    if (ampenv !== false) jQuery('#input_select_synth_amp_env').val(ampenv)

    // success
    return true
  } else {
    // something probably wrong with the input data
    return false
  }
}

function parseTuningData() {
  const tuningTable = model.get('tuning table')

  // http://www.huygens-fokker.org/scala/scl_format.html

  tuningTable.baseMidiNote = parseInt(jQuery('#txt_base_midi_note').val())
  tuningTable.baseFrequency = parseFloat(jQuery('#txt_base_frequency').val())
  tuningTable.description = jQuery('#txt_name').val()
  tuningTable.filename = sanitizeFilename(tuningTable.description)

  const userTuningData = document.getElementById('txt_tuning_data')

  // check if user pasted a scala file
  // we check if the first character is !
  if (userTuningData.value.startsWith('!')) {
    alert(
      'Hello, trying to paste a Scala file into this app?' +
        UNIX_NEWLINE +
        "Please use the 'Import .scl' function instead or remove the first few lines (description) from the text box"
    )
    jQuery('#txt_tuning_data')
      .parent()
      .addClass('has-error')
    return false
  }

  // split user data into individual lines
  const lines = userTuningData.value.split(NEWLINE_REGEX)

  // strip out the unusable lines, assemble an array of usable tuning data
  tuningTable.tuningData = ['1'] // when initialised the array contains only '1' (unison)
  tuningTable.noteCount = 1
  let empty = true
  for (let i = 0; i < lines.length; i++) {
    // check that line is not empty
    if (!isEmpty(lines[i])) {
      if (getLineType(lines[i]) === LINE_TYPE.INVALID) {
        jQuery('#txt_tuning_data')
          .parent()
          .addClass('has-error')
        return false
      }

      // so far so good - store the line in tuning array
      tuningTable.scale_data[tuningTable.noteCount] = lines[i] // 'scale_data' is the scale in the original format input in the text box
      tuningTable.tuningData[tuningTable.noteCount] = lineToDecimal(lines[i]) // 'tuningData' is the same as before but all input is converted to decimal format to make the maths easier later
      tuningTable.noteCount++

      // if we got to this point, then the tuning must not be empty
      empty = false
    }
  }

  if (empty) {
    // if the input tuning is totally empty
    console.log('no tuning data')
    jQuery('#txt_tuning_data')
      .parent()
      .addClass('has-error')
    return false
  }

  // finally, generate the frequency table
  generateTuningTable(tuningTable.tuningData)

  // display generated tuning in a table on the page
  jQuery('#tuning-table').empty()
  jQuery('#tuning-table').append(
    "<tbody><tr><th class='key-color'></th><th>#</th><th>Freq.</th><th>Cents</th><th>Ratio</th></tr>"
  )

  for (let i = 0; i < TUNING_MAX_SIZE; i++) {
    // highlight the row which corresponds to the base MIDI note
    let tableClass = ''
    if (i === tuningTable.baseMidiNote) {
      tableClass = 'info'
    } else {
      if ((tuningTable.baseMidiNote - i) % (tuningTable.noteCount - 1) === 0) {
        tableClass = 'warning'
      }
    }

    // assemble the HTML for the table row
    jQuery('#tuning-table').append(`
      <tr id="tuning-table-row-${i}" class="${tableClass}">
        <td class="key-color"></td>
        <td>${i}</td>
        <td>${parseFloat(tuningTable.freq[i]).toFixed(3)} Hz</td>
        <td>${tuningTable.cents[i].toFixed(3)}</td>
        <td>${tuningTable.decimal[i].toFixed(3)}</td>
      </tr>`)
  }

  jQuery('#tuning-table').append('</tbody>')

  setKeyColors(jQuery('#input_key_colors').val())

  // scroll to reference note on the table
  jQuery('#col-tuning-table').animate(
    {
      scrollTop:
        jQuery('#tuning-table-row-' + tuningTable.baseMidiNote).position().top + jQuery('#col-tuning-table').scrollTop()
    },
    600
  ) // 600ms scroll to reference note

  jQuery('#txt_tuning_data')
    .parent()
    .removeClass('has-error')

  // if has changed, convert the scale into a URL then add that URL to the browser's Back/Forward navigation
  const url = getScaleUrl()
  if (url !== window.location.href) {
    updatePageUrl(url)
  }

  model.set('tuning table', tuningTable)

  // success
  return true
}

/**
 * TUNING IMPORT RELATED FUNCTIONS
 */

// after a scala file is loaded, this function will be called
function parseImportedScalaScl(event) {
  const input = event.target

  // bail if user didn't actually load a file
  if (isNil(input.files[0])) {
    return false
  }

  // read the file
  const reader = new FileReader()
  let scalaFile = reader.readAsText(input.files[0])

  reader.onload = function() {
    // get filename
    jQuery('#txt_name').val(input.files[0].name.slice(0, -4))

    scalaFile = reader.result

    // split scalaFile data into individual lines
    const lines = scalaFile.split(NEWLINE_REGEX)

    // determine the first line of scala file that contains tuning data
    const firstLine = lines.lastIndexOf('!') + 1

    jQuery('#txt_tuning_data').val(
      lines
        .slice(firstLine)
        .map(line => line.trim())
        .join(UNIX_NEWLINE)
    )

    parseTuningData()
  }
}

// after a tun file is loaded, this function will be called
function parseImportedAnamarkTun(event) {
  // Note: this is not an AnaMark TUN v2.00 compliant parser! It is incomplete!
  // At the very least, this parser should support cents-based TUN files generated by Scale Workshop & Scala.
  // If anybody wants full TUN v2.00 support, send a pull request
  // Have you read the TUN spec recently?
  // https://www.mark-henning.de/files/am/Tuning_File_V2_Doc.pdf

  const input = event.target

  // bail if user didn't actually load a file
  if (isNil(input.files[0])) {
    return false
  }

  // read the file
  const reader = new FileReader()
  let tunFile = reader.readAsText(input.files[0])

  reader.onload = function() {
    tunFile = reader.result

    // split tunFile data into individual lines
    const lines = tunFile.split(NEWLINE_REGEX)

    // get tuning name
    let name = false
    for (let i = 0; i < lines.length; i++) {
      // Check if line is start of [Info] section
      if (!name && lines[i].includes('[Info]')) {
        // file has [Info] section so we expect to see a name too
        name = true
      }
      // We saw an [Info] section during a previous loop so now we're looking for the name
      else {
        if (lines[i].trim().startsWith('Name')) {
          // the current line contains the name
          const regex = /"(.*?)"/g
          name = lines[i]
            .match(regex)[0]
            .replace(/"/g, '')
            .replace(/\.tun/g, '')
          break
        }
      }
    }
    // If a name couldn't be found within the file, then just grab it from the filename
    if (name === true || name === false) {
      console.log("this shouldn't be happening right now")
      name = input.files[0].name.slice(0, -4)
    }

    // determine if tun file contains 'Functional Tuning' block and get line number where tuning starts
    let hasFunctionalTuning = false
    let firstLine = lines.findIndex(
      line => line.includes('[Functional Tuning]') || line.includes('[Functional tuning]')
    )
    if (firstLine === -1) {
      firstLine = 0
    } else {
      firstLine += 1
      hasFunctionalTuning = true
    }

    // it's best to work from the Functional Tuning if available, since it works much like a Scala scale
    if (hasFunctionalTuning) {
      jQuery('#txt_name').val(name)
      const tuning = []

      // get note values
      for (let i = firstLine; i < lines.length; i++) {
        const n = i - firstLine // note number
        if (lines[i].includes('#=0')) {
          tuning[n] = lines[i].substring(lines[i].indexOf('#=0') + 6, lines[i].length - 2).trim()
        }
        if (lines[i].includes('#>')) {
          const m = (n + 1).toString()
          const prefix = 'note ' + m + '="#>-' + m
          tuning[n] = lines[i].replace(prefix, '')
          tuning[n] = tuning[n].substring(3, tuning[n].indexOf('~')).trim()
        }
      }

      jQuery('#txt_tuning_data').val(tuning.join(UNIX_NEWLINE))

      // get base MIDI note and base frequency
      for (let i = firstLine + 1; i < lines.length; i++) {
        if (lines[i].includes('!')) {
          jQuery('#txt_base_frequency').val(lines[i].substring(lines[i].indexOf('!') + 2, lines[i].length - 2))
          jQuery('#txt_base_midi_note').val(lines[i].substring(0, lines[i].indexOf('!') - 2).replace('note ', ''))
        }
      }
      parseTuningData()
      return true
    }

    // if there's no functional tuning
    else {
      alert('This looks like a v0 or v1 tun file, which is not currently supported.')
      return false
      // RIP my willpower
      /*
      alert("Warning: You have imported an older v0 or v1 .TUN file with no [Functional Tuning] data. Scale Workshop will attempt to pull in all 128 notes.");

      var firstLine = 0;

      // determine on which line of the tun file that tuning data starts, with preference for 'Exact Tuning' block, followed by 'Tuning' block.
      for ( let i = 0; i < lines.length; i++ ) {
        if ( lines[i].includes("[Exact Tuning]") ) {
          hasFunctionalTuning = true;
          firstLine = i + 1;
          break;
        }
      }
      if ( firstLine === 0 ) {
        for ( let i = 0; i < lines.length; i++ ) {
          if ( lines[i].includes("[Tuning]") ) {
            hasFunctionalTuning = true;
            firstLine = i + 1;
            break;
          }
        }
      }

      // this is where things get messy

      // enter tuning data
      var offset = parseFloat( lines[firstLine].replace("note 0=", "") ).toFixed(6); // offset will ensure that note 0 is 1/1
      let tuningData_str;
      for ( let i = firstLine; i < firstLine+128; i++ ) {

        var n = i - firstLine; // n = note number
        var line = lines[i].replace( "note " + n.toString() + "=", "" ).trim();
        line = parseFloat( line ).toFixed(6);
        line = (parseFloat(line) + parseFloat(offset)).toFixed(6);

        if ( n === 0 ) {
          // clear scale field
          tuningData_str = ''
        }
        else if ( n === 1 ) {
          tuningData_str += line ;
        }
        else {
          tuningData_str += UNIX_NEWLINE + line;
        }
      }
      jQuery( "#txt_tuningData" ).val(tuningData_str)

      jQuery( "#txt_baseFrequency" ).val( 440 / centsToDecimal(offset) );
      jQuery( "#txt_baseMidiNote" ).val( 0 );
      */
    }
  }
}

jQuery('#export-buttons').on('click', 'a', e => {
  e.preventDefault()

  const link = e.target.getAttribute('href').replace(/^#/, '')

  switch (link) {
    case 'anamark-tun':
      exportAnamarkTun()
      break
    case 'scala-scl':
      exportScalaScl()
      break
    case 'scala-kbm':
      exportScalaKbm()
      break
    case 'maxmsp-coll':
      exportMaxMspColl()
      break
    case 'pd-text':
      exportPdText()
      break
    case 'kontakt-script':
      exportKontaktScript()
      break
    case 'deflemask-reference':
      exportReferenceDeflemask()
      break
    case 'url':
      exportUrl()
      break
  }
})

jQuery('#scala-file').on('change', parseImportedScalaScl)
jQuery('#anamark-tun-file').on('change', parseImportedAnamarkTun)

jQuery('#show-mos').on('click', () => {
  model.set(
    'staged rank-2 sizes',
    getValidMOSSizes(
      lineToDecimal(jQuery('#input_rank-2_period').val()),
      lineToDecimal(jQuery('#input_rank-2_generator').val()),
      parseFloat(jQuery('#input_rank-2_mos_threshold').val())
    )
  )
})

jQuery(() => {
  initUI()
  initSynth()
  initEvents()
})

export { keyColors, parseTuningData, setKeyColors, parseUrl, clearAll, model, synth }
