/**
 * TUNING DATA GENERATORS
 */

/* global alert, jQuery */

import { closePopup, debug, setTuningData, setScaleName } from './helpers/general.js'
import { lineToDecimal, decimalToRatio, lineToCents, getFloat, getString, getLine } from './helpers/converters.js'
import { invertChord, mathModulo } from './helpers/numbers.js'
import { UNIX_NEWLINE } from './constants.js'
import { parseTuningData } from './scaleworkshop.js'
import { isCent, isNOfEdo } from './helpers/types.js'

function generateEqualTemperament() {
  const divider = getFloat('#input_number_of_divisions', 'Warning: no divider')
  const period = getString('#input_interval_to_divide', 'Warning: no interval to divide')

  // convert period to cents
  const periodCents = lineToCents(period)

  // bail if period is invalid
  if (!periodCents) {
    return false
  }

  setScaleName(divider + ' equal divisions of ' + period)

  setTuningData(generateEqualTemperamentData(divider, parseFloat(periodCents)))

  parseTuningData()

  closePopup('#modal_generate_equal_temperament')

  // success
  return true
}

function generateEqualTemperamentData(divider, period) {
  // calculate the size of a single step in this tuning
  const step = period / divider

  const notes = []

  for (let i = 1; i <= divider; i++) {
    let note = i * step

    // if returned value is an integer, append a . just to make sure the parser will see it as a cents value later
    if (!note.toString().includes('.')) {
      note = note.toString() + '.'
    }

    notes.push(note)
  }

  return notes.join(UNIX_NEWLINE)
}

function generateRank2Temperament() {
  const generator = getLine('#input_rank-2_generator', 'Warning: no generator')

  const generatorCents = lineToCents(generator)

  // bail if generator is invalid
  if (!generatorCents) {
    return false
  }

  const period = getLine('#input_rank-2_period', 'Warning: no period')

  const periodCents = lineToCents(period)

  // bail if period is invalid
  if (!periodCents) {
    return false
  }

  const size = parseInt(jQuery('#input_rank-2_size').val())
  const up = parseInt(jQuery('#input_rank-2_up').val())

  if (isNaN(size) || size < 2) {
    alert('Warning: scale size must be a number greater than 1')
    return false
  }
  if (isNaN(up) || up < 0 || up >= size) {
    alert('Warning: generators up must be a number greater than -1 and less than the scale size')
    return false
  }

  setTuningData(generateRank2TemperamentData(parseFloat(generatorCents), parseFloat(periodCents), size, up))

  setScaleName('Rank 2 scale (' + generator + ', ' + period + ')')

  parseTuningData()

  closePopup('#modal_generate_rank_2_temperament')

  // success
  return true
}

function generateRank2TemperamentData(generator, period, size, up) {
  // empty existing tuning data
  let tuningData = ''

  // array aa stores the scale data, starting from 1/1 (0.0 cents)
  const aa = [0.0]
  for (let i = 1; i < size; i++) {
    // calculate generators up
    if (i <= up) {
      aa[i] = mathModulo(aa[i - 1] + generator, period)
      debug('up: ' + i + ': ' + aa[i])
    } else {
      // first down generator
      if (i === up + 1) {
        aa[i] = mathModulo(aa[0] - generator, period)
      }

      // subsequent down generators
      else {
        aa[i] = mathModulo(aa[i - 1] - generator, period)
      }
      debug('down: ' + i + ': ' + aa[i])
    }
  }

  // sort the scale ascending
  aa.sort(function(a, b) {
    return a - b
  })

  // add the period to the scale
  aa.push(period)

  tuningData += aa
    .slice(1, size + 1)
    .map(num => num.toFixed(6))
    .join(UNIX_NEWLINE)

  return tuningData
}

function generateHarmonicSeriesSegment() {
  let lo = getFloat('#input_lowest_harmonic', 'Warning: lowest harmonic should be a positive integer')
  let hi = getFloat('#input_highest_harmonic', 'Warning: highest harmonic should be a positive integer')

  // bail if lo = hi
  if (lo === hi) {
    alert("Warning: Lowest and highest harmonics are the same. Can't generate a scale based on only one harmonic.")
    return false
  }

  // ensure that lo is lower than hi
  if (lo > hi) {
    ;[lo, hi] = [hi, lo]
  }

  setScaleName('Harmonics ' + lo + '-' + hi)

  setTuningData(generateHarmonicSeriesSegmentData(lo, hi))

  parseTuningData()

  closePopup('#modal_generate_harmonic_series_segment')

  // success
  return true
}

function generateHarmonicSeriesSegmentData(lo, hi) {
  const ratios = []

  for (let i = lo + 1; i <= hi; i++) {
    // add ratio to text box
    ratios.push(i + '/' + lo)
  }

  return ratios.join(UNIX_NEWLINE)
}

function generateSubharmonicSeriesSegment() {
  let lo = getFloat('#input_lowest_subharmonic', 'Warning: lowest subharmonic should be a positive integer')
  let hi = getFloat('#input_highest_subharmonic', 'Warning: highest subharmonic should be a positive integer')

  // bail if lo = hi
  if (lo === hi) {
    alert(
      "Warning: Lowest and highest subharmonics are the same. Can't generate a scale based on only one subharmonic."
    )
    return false
  }

  // ensure that lo is lower than hi
  if (lo > hi) {
    ;[lo, hi] = [hi, lo]
  }

  setTuningData(generateSubharmonicSeriesSegmentData(lo, hi))

  setScaleName('Subharmonics ' + lo + '-' + hi)

  parseTuningData()

  closePopup('#modal_generate_subharmonic_series_segment')

  // success
  return true
}

function generateSubharmonicSeriesSegmentData(lo, hi) {
  const ratios = []

  for (let i = hi - 1; i >= lo; i--) {
    ratios.push(hi + '/' + i)
  }

  return ratios.join(UNIX_NEWLINE)
}

function generateEnumerateChord({ rawChord, convertToRatios, isInversion }) {
  let chord = rawChord
  let chordStr = rawChord

  // It doesn't make much sense to mix different values,
  // but it's cool to experiment with.

  // bail if has invalid
  const inputTest = chord
    .replace(' ', '')
    .replace('(', '')
    .replace(')', '')
    .split(':')

  if (inputTest.length < 2) {
    throw new Error('Warning: Chord needs more than one pitch of the form A:B:C...')
  }

  for (let i = 0; i < inputTest.length; i++) {
    let value = inputTest[i]
    if (/^\d+$/.test(value)) {
      value += ','
    }
    value = lineToDecimal(value)
    if (value === 0 || !/(^\d+([,.]\d*)?|([\\/]\d+)?$)*/.test(value)) {
      throw new Error('Warning: Invalid pitch ' + inputTest[i])
    }
  }

  // check if it's a tonal inversion
  // ex: 1/(A:B:C...)
  if (isInversion) {
    chordStr = '1/(' + chord + ')'
  }

  if (/^\d+\/\(.*$/.test(chord)) {
    if (/^1\/\((\d+:)+\d+\)$/.test(chord)) {
      isInversion = true
      chord = chord.substring(3, chord.length - 1)
    } else {
      throw new Error('Warning: inversions need to match this syntax: 1/(A:B:C...)')
    }
  }

  // This next safeguard might make it more user friendy,
  // but I think it's a bit limiting for certain purposes a more advanced
  // user might try like using NOfEdo values to build chords.

  // bail if first note is in cents
  // if (isCent(pitches[0]) || isNOfEdo(pitches[0])) {
  //  alert("Warning: first pitch cannot be in cents");
  //  return false;
  // }

  if (isInversion) {
    debug('This is an inversion. Chord is ' + chord)
    chord = invertChord(chord)
    debug('Chord returned: ' + chord)
    chordStr += ' (' + chord + ') '
    debug('str = ' + chordStr)
  }

  const pitches = chord.split(':')

  // TODO: if pitches are not harmonics but "convertToRatios" is true,
  // update name with proper harmonics format
  setScaleName('Chord ' + chordStr)

  setTuningData(generateEnumerateChordData(pitches, convertToRatios))

  parseTuningData()
}

function generateEnumerateChordData(pitches, convertToRatios = false) {
  const ratios = []
  let fundamental = 1

  for (let i = 0; i < pitches.length; i++) {
    let pitch = pitches[i]
    // convert a lone integer to a commadecimal
    if (/^\d+$/.test(pitch)) {
      pitch = pitch + ','
    }

    const isCentsValue = isCent(pitch) || isNOfEdo(pitch)
    const parsed = lineToDecimal(pitch)

    if (i === 0) {
      fundamental = parsed
    } else {
      if (isCentsValue && !convertToRatios) {
        ratios.push(pitch)
      } else {
        ratios.push(decimalToRatio(parsed / fundamental))
      }
    }
  }

  return ratios.join(UNIX_NEWLINE)
}

function loadPresetScale(a) {
  let data = ''
  let name = ''
  let freq = 440
  const midi = 69

  switch (a) {
    case '12edo':
      {
        const lines = [
          '100.',
          '200.',
          '300.',
          '400.',
          '500.',
          '600.',
          '700.',
          '800.',
          '900.',
          '1000.',
          '1100.',
          '1200.'
        ]
        name = '12-tone equal temperament'
        data = lines.join(UNIX_NEWLINE)
      }
      break

    case 'partch43':
      {
        const lines = [
          '81/80',
          '33/32',
          '21/20',
          '16/15',
          '12/11',
          '11/10',
          '10/9',
          '9/8',
          '8/7',
          '7/6',
          '32/27',
          '6/5',
          '11/9',
          '5/4',
          '14/11',
          '9/7',
          '21/16',
          '4/3',
          '27/20',
          '11/8',
          '7/5',
          '10/7',
          '16/11',
          '40/27',
          '3/2',
          '32/21',
          '14/9',
          '11/7',
          '8/5',
          '18/11',
          '5/3',
          '27/16',
          '12/7',
          '7/4',
          '16/9',
          '9/5',
          '20/11',
          '11/6',
          '15/8',
          '40/21',
          '64/33',
          '160/81',
          '2/1'
        ]
        name = 'Partch 43-tone JI'
        data = lines.join(UNIX_NEWLINE)
      }
      break

    case 'bohlenpierce':
      {
        const lines = [
          '146.304',
          '292.608',
          '438.913',
          '585.217',
          '731.521',
          '877.825',
          '1024.130',
          '1170.434',
          '1316.738',
          '1463.042',
          '1609.347',
          '1755.651',
          '1901.955'
        ]
        name = 'Bohlen-Pierce'
        data = lines.join(UNIX_NEWLINE)
      }
      break

    case 'pelog':
      {
        const lines = ['120.', '270.', '540.', '670.', '785.', '950.', '1215.']
        name = 'Normalised Pelog, Kunst, 1949. Average of 39 Javanese gamelans'
        data = lines.join(UNIX_NEWLINE)
      }
      break

    case 'slendro':
      {
        const lines = ['231.', '474.', '717.', '955.', '1208.']
        name = 'Average of 30 measured slendro gamelans, W. Surjodiningrat et al., 1993.'
        data = lines.join(UNIX_NEWLINE)
      }
      break

    case 'werckmeisteriii':
      {
        const lines = [
          '107.82',
          '203.91',
          '311.72',
          '401.955',
          '503.91',
          '605.865',
          '701.955',
          '809.775',
          '900.',
          '1007.82',
          '1103.91',
          '1200.'
        ]
        name = 'Werckmeister III (1691)'
        data = lines.join(UNIX_NEWLINE)
      }
      break

    case 'young1799':
      {
        const lines = [
          '106.',
          '198.',
          '306.2',
          '400.1',
          '502.',
          '604.',
          '697.9',
          '806.1',
          '898.1',
          '1004.1',
          '1102.',
          '1200.'
        ]
        name = 'Young (1799)'
        data = lines.join(UNIX_NEWLINE)
      }
      break

    case 'snakeoil':
      {
        const lines = [
          '256/243',
          '9/8',
          '32/27',
          '81/64',
          '4/3',
          '1024/729',
          '3/2',
          '128/81',
          '27/16',
          '16/9',
          '4096/2187',
          '2/1'
        ]
        name = 'Pythagorean 432Hz'
        freq = 432
        data = lines.join(UNIX_NEWLINE)
      }
      break

    case '313island9':
      {
        const lines = [
          '203.19489',
          '249.20128',
          '452.39617',
          '498.40256',
          '701.59744',
          '747.60383',
          '950.79872',
          '996.80511',
          '2/1'
        ]
        name = '313edo island[9]'
        data = lines.join(UNIX_NEWLINE)
      }
      break

    case '17superpyth12':
      {
        const lines = [
          '70.58824',
          '141.17647',
          '282.35294',
          '352.94118',
          '494.11765',
          '564.70588',
          '635.29412',
          '776.47059',
          '847.05882',
          '988.23529',
          '1058.82353',
          '2/1'
        ]
        name = '17edo superpyth[12]'
        data = lines.join(UNIX_NEWLINE)
      }
      break

    case '15blackwood10':
      {
        const lines = ['160.', '240.', '400.', '480.', '640.', '720.', '880.', '960.', '1120.', '2/1']
        name = '15edo blackwood[10]'
        data = lines.join(UNIX_NEWLINE)
      }
      break

    case '26flattone12':
      {
        name = '26edo flattone[12]'
        const lines = [
          '46.15385',
          '184.61538',
          '230.76923',
          '369.23077',
          '507.69231',
          '553.84615',
          '692.30769',
          '738.46154',
          '876.92308',
          '923.07692',
          '1061.53846',
          '2/1'
        ]
        data = lines.join(UNIX_NEWLINE)
      }
      break

    default:
      return false
  }

  setScaleName(name)
  setTuningData(data)
  jQuery('#txt_base_frequency').val(freq)
  jQuery('#txt_base_midi_note').val(midi)
  parseTuningData()
  closePopup('#modal_load_preset_scale')
}

export {
  generateEnumerateChord,
  generateEqualTemperament,
  generateHarmonicSeriesSegment,
  generateRank2Temperament,
  generateSubharmonicSeriesSegment,
  loadPresetScale
}
