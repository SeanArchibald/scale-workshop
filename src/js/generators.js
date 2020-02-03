/**
 * TUNING DATA GENERATORS
 */

/* global alert, jQuery */
import {
  isCent,
  isNOfEdo,
  closePopup,
  debug,
  setTuningData,
  setScaleName
} from './helpers/general.js'
import{
  line_to_decimal,
  decimal_to_ratio,
  line_to_cents,
  getFloat,
  getString,
  getLine
} from './helpers/converters.js'
import { invert_chord } from './helpers/numbers.js'
import { UNIX_NEWLINE } from './constants.js'
import { parse_tuning_data } from './scaleworkshop.js'

function generate_equal_temperament() {

  var divider = getFloat('#input_number_of_divisions', 'Warning: no divider')
  var period = getString('#input_interval_to_divide', 'Warning: no interval to divide')

  // convert period to cents
  var period_cents = line_to_cents(period);

  // bail if period is invalid
  if (!period_cents) {
    return false;
  }

  setScaleName(divider + " equal divisions of " + period)

  setTuningData(generate_equal_temperament_data(divider, parseFloat(period_cents)));

  parse_tuning_data();

  closePopup('#modal_generate_equal_temperament')

  // success
  return true;
}

function generate_equal_temperament_data(divider, period) {

  // calculate the size of a single step in this tuning
  var step = period / divider;

  let notes = []

  for (let i = 1; i <= divider; i++) {

    var note = i * step;

    // if returned value is an integer, append a . just to make sure the parser will see it as a cents value later
    if (!note.toString().includes('.')) {
      note = note.toString() + ".";
    }

    notes.push(note)
  }

  return notes.join(UNIX_NEWLINE)
}

function generate_rank_2_temperament() {

  var generator = getLine('#input_rank-2_generator', 'Warning: no generator')

  var generator_cents = line_to_cents(generator);

  // bail if generator is invalid
  if (!generator_cents) {
    return false;
  }

  var period = getLine('#input_rank-2_period', 'Warning: no period')

  var period_cents = line_to_cents(period);

  // bail if period is invalid
  if (!period_cents) {
    return false;
  }

  var size = parseInt(jQuery("#input_rank-2_size").val());
  var up = parseInt(jQuery("#input_rank-2_up").val());

  if (isNaN(size) || size < 2) {
    alert('Warning: scale size must be a number greater than 1');
    return false;
  }
  if (isNaN(up) || up < 0 || up >= size) {
    alert('Warning: generators up must be a number greater than -1 and less than the scale size');
    return false;
  }

  setTuningData(generate_rank_2_temperament_data(parseFloat(generator_cents), parseFloat(period_cents), size, up))

  setScaleName("Rank 2 scale (" + generator + ", " + period + ")");

  parse_tuning_data();

  closePopup('#modal_generate_rank_2_temperament');

  // success
  return true;
}

function generate_rank_2_temperament_data(generator, period, size, up) {

  // empty existing tuning data
  var tuning_data = "";

  // array aa stores the scale data, starting from 1/1 (0.0 cents)
  var aa = [0.0];
  for (let i = 1; i < size; i++) {

    // calculate generators up
    if (i <= up) {

      aa[i] = (aa[i - 1] + generator).mod(period);
      debug('up: ' + i + ': ' + aa[i]);

    }

    else {

      // first down generator
      if (i === up + 1) {
        aa[i] = (aa[0] - generator).mod(period);
      }

      // subsequent down generators
      else {
        aa[i] = (aa[i - 1] - generator).mod(period);
      }
      debug('down: ' + i + ': ' + aa[i]);
    }

  }

  // sort the scale ascending
  aa.sort(function (a, b) { return a - b });

  // add the period to the scale
  aa.push(period);

  tuning_data += aa.slice(1, size + 1).map(num => num.toFixed(6)).join(UNIX_NEWLINE)

  return tuning_data
}

function generate_harmonic_series_segment() {

  var lo = getFloat('#input_lowest_harmonic', 'Warning: lowest harmonic should be a positive integer')
  var hi = getFloat('#input_highest_harmonic', 'Warning: highest harmonic should be a positive integer')

  // bail if lo = hi
  if (lo === hi) {
    alert("Warning: Lowest and highest harmonics are the same. Can't generate a scale based on only one harmonic.");
    return false;
  }

  // ensure that lo is lower than hi
  if (lo > hi) {
    [lo, hi] = [hi, lo]
  }

  setScaleName("Harmonics " + lo + "-" + hi);

  setTuningData(generate_harmonic_series_segment_data(lo, hi));

  parse_tuning_data();

  closePopup("#modal_generate_harmonic_series_segment");

  // success
  return true;

}

function generate_harmonic_series_segment_data(lo, hi) {
  let ratios = []

  for (let i = lo + 1; i <= hi; i++) {
    // add ratio to text box
    ratios.push(i + "/" + lo)
  }

  return ratios.join(UNIX_NEWLINE)
}

function generate_subharmonic_series_segment() {

  var lo = getFloat('#input_lowest_subharmonic', 'Warning: lowest subharmonic should be a positive integer')
  var hi = getFloat('#input_highest_subharmonic', 'Warning: highest subharmonic should be a positive integer')

  // bail if lo = hi
  if (lo === hi) {
    alert("Warning: Lowest and highest subharmonics are the same. Can't generate a scale based on only one subharmonic.");
    return false;
  }

  // ensure that lo is lower than hi
  if (lo > hi) {
    [lo, hi] = [hi, lo]
  }

  setTuningData(generate_subharmonic_series_segment_data(lo, hi));

  setScaleName("Subharmonics " + lo + "-" + hi);

  parse_tuning_data();

  closePopup("#modal_generate_subharmonic_series_segment");

  // success
  return true;

}

function generate_subharmonic_series_segment_data(lo, hi) {
  let ratios = []

  for (let i = hi - 1; i >= lo; i--) {
    ratios.push(hi + "/" + i)
  }

  return ratios.join(UNIX_NEWLINE)
}

function generate_enumerate_chord() {
  var chord = getString('#input_chord', 'Warning: bad input');
  let chordStr = chord;

  var convert_to_ratios = document.getElementById("input_convert_to_ratios").checked;

  // It doesn't make much sense to mix different values, 
  // but it's cool to experiment with.

  // bail if has invalid
  var inputTest = chord.replace(" ", "").replace("(", "").replace(")", "").split(":");
  if (inputTest.length < 2) {
    alert("Warning: Chord needs more than one pitch of the form A:B:C...");
    return false;
  }
  for (let i = 0; i < inputTest.length; i++) {
    let value = inputTest[i];
    if (/^\d+$/.test(value))
      value += ",";
    value = line_to_decimal(value);
    if (value === 0 || !/(^\d+([,.]\d*)?|([\\/]\d+)?$)*/.test(value)) {
      alert("Warning: Invalid pitch " + inputTest[i])
      return false;
    }
  }

  // check if it's a tonal inversion
  // ex: 1/(A:B:C...)
  var isInversion = document.getElementById("input_invert_chord").checked;
  if (isInversion)
    chordStr = "1/(" + chord + ")";

  if (/^\d+\/\(.*$/.test(chord)) {
    if (/^1\/\((\d+:)+\d+\)$/.test(chord)) {
      isInversion = true;
      chord = chord.substring(3, chord.length - 1);
    } else {
      alert("Warning: inversions need to match this syntax: 1/(A:B:C...)");
      return false;
    }
  }

  // This next safeguard might make it more user friendy,
  // but I think it's a bit limiting for certain purposes a more advanced
  // user might try like using NOfEdo values to build chords.

  // bail if first note is in cents
  //if (isCent(pitches[0]) || isNOfEdo(pitches[0])) {
  //  alert("Warning: first pitch cannot be in cents");
  //  return false;
  //}

  if (isInversion) {
    debug("This is an inversion. Chord is " + chord);
    chord = invert_chord(chord);
    debug("Chord returned: " + chord);
    chordStr += (" (" + chord + ") ");
    debug("str = " + chordStr);
  }

  var pitches = chord.split(":");

  // TODO: if pitches are not harmonics but "convert_to_ratios" is true,
  // update name with proper harmonics format
  setScaleName("Chord " + chordStr);

  setTuningData(generate_enumerate_chord_data(pitches, convert_to_ratios));

  parse_tuning_data();

  closePopup("#modal_enumerate_chord");

  // success
  return true;
}

function generate_enumerate_chord_data(pitches, convertToRatios = false) {
  let ratios = [];
  var fundamental = 1;

  for (let i = 0; i < pitches.length; i++) {
    // convert a lone integer to a commadecimal
    if (/^\d+$/.test(pitches[i])) {
      pitches[i] = pitches[i] + ',';
    }

    var isCentsValue = isCent(pitches[i]) || isNOfEdo(pitches[i]);
    var parsed = line_to_decimal(pitches[i]);

    if (i > 0) {
      if (isCentsValue && !convertToRatios) {
        ratios.push(pitches[i])
      } else {
        ratios.push(decimal_to_ratio(parsed / fundamental));
      }
    }
    else {
      fundamental = parsed;
    }
  }

  return ratios.join(UNIX_NEWLINE)
}

function load_preset_scale(a) {

  var data = "";
  var name = "";
  var freq = 440;
  var midi = 69;

  switch (a) {

    case "12edo":
      name = "12-tone equal temperament";
      data = "100." + UNIX_NEWLINE + "200." + UNIX_NEWLINE + "300." + UNIX_NEWLINE + "400." + UNIX_NEWLINE + "500." + UNIX_NEWLINE + "600." + UNIX_NEWLINE + "700." + UNIX_NEWLINE + "800." + UNIX_NEWLINE + "900." + UNIX_NEWLINE + "1000." + UNIX_NEWLINE + "1100." + UNIX_NEWLINE + "1200.";
      break;

    case "partch43":
      name = "Partch 43-tone JI";
      data = "81/80" + UNIX_NEWLINE + "33/32" + UNIX_NEWLINE + "21/20" + UNIX_NEWLINE + "16/15" + UNIX_NEWLINE + "12/11" + UNIX_NEWLINE + "11/10" + UNIX_NEWLINE + "10/9" + UNIX_NEWLINE + "9/8" + UNIX_NEWLINE + "8/7" + UNIX_NEWLINE + "7/6" + UNIX_NEWLINE + "32/27" + UNIX_NEWLINE + "6/5" + UNIX_NEWLINE + "11/9" + UNIX_NEWLINE + "5/4" + UNIX_NEWLINE + "14/11" + UNIX_NEWLINE + "9/7" + UNIX_NEWLINE + "21/16" + UNIX_NEWLINE + "4/3" + UNIX_NEWLINE + "27/20" + UNIX_NEWLINE + "11/8" + UNIX_NEWLINE + "7/5" + UNIX_NEWLINE + "10/7" + UNIX_NEWLINE + "16/11" + UNIX_NEWLINE + "40/27" + UNIX_NEWLINE + "3/2" + UNIX_NEWLINE + "32/21" + UNIX_NEWLINE + "14/9" + UNIX_NEWLINE + "11/7" + UNIX_NEWLINE + "8/5" + UNIX_NEWLINE + "18/11" + UNIX_NEWLINE + "5/3" + UNIX_NEWLINE + "27/16" + UNIX_NEWLINE + "12/7" + UNIX_NEWLINE + "7/4" + UNIX_NEWLINE + "16/9" + UNIX_NEWLINE + "9/5" + UNIX_NEWLINE + "20/11" + UNIX_NEWLINE + "11/6" + UNIX_NEWLINE + "15/8" + UNIX_NEWLINE + "40/21" + UNIX_NEWLINE + "64/33" + UNIX_NEWLINE + "160/81" + UNIX_NEWLINE + "2/1";
      break;

    case "bohlenpierce":
      name = "Bohlen-Pierce";
      data = "146.304" + UNIX_NEWLINE + "292.608" + UNIX_NEWLINE + "438.913" + UNIX_NEWLINE + "585.217" + UNIX_NEWLINE + "731.521" + UNIX_NEWLINE + "877.825" + UNIX_NEWLINE + "1024.130" + UNIX_NEWLINE + "1170.434" + UNIX_NEWLINE + "1316.738" + UNIX_NEWLINE + "1463.042" + UNIX_NEWLINE + "1609.347" + UNIX_NEWLINE + "1755.651" + UNIX_NEWLINE + "1901.955";
      break;

    case "pelog":
      name = "Normalised Pelog, Kunst, 1949. Average of 39 Javanese gamelans";
      data = "120." + UNIX_NEWLINE + "270." + UNIX_NEWLINE + "540." + UNIX_NEWLINE + "670." + UNIX_NEWLINE + "785." + UNIX_NEWLINE + "950." + UNIX_NEWLINE + "1215.";
      break;

    case "slendro":
      name = "Average of 30 measured slendro gamelans, W. Surjodiningrat et al., 1993.";
      data = "231." + UNIX_NEWLINE + "474." + UNIX_NEWLINE + "717." + UNIX_NEWLINE + "955." + UNIX_NEWLINE + "1208.";
      break;

    case "werckmeisteriii":
      name = "Werckmeister III (1691)";
      data = "107.82" + UNIX_NEWLINE + "203.91" + UNIX_NEWLINE + "311.72" + UNIX_NEWLINE + "401.955" + UNIX_NEWLINE + "503.91" + UNIX_NEWLINE + "605.865" + UNIX_NEWLINE + "701.955" + UNIX_NEWLINE + "809.775" + UNIX_NEWLINE + "900." + UNIX_NEWLINE + "1007.82" + UNIX_NEWLINE + "1103.91" + UNIX_NEWLINE + "1200.";
      break;

    case "young1799":
      name = "Young (1799)";
      data = "106." + UNIX_NEWLINE + "198." + UNIX_NEWLINE + "306.2" + UNIX_NEWLINE + "400.1" + UNIX_NEWLINE + "502." + UNIX_NEWLINE + "604." + UNIX_NEWLINE + "697.9" + UNIX_NEWLINE + "806.1" + UNIX_NEWLINE + "898.1" + UNIX_NEWLINE + "1004.1" + UNIX_NEWLINE + "1102." + UNIX_NEWLINE + "1200.";
      break;

    case "snakeoil":
      name = "Pythagorean 432Hz";
      data = "256/243" + UNIX_NEWLINE + "9/8" + UNIX_NEWLINE + "32/27" + UNIX_NEWLINE + "81/64" + UNIX_NEWLINE + "4/3" + UNIX_NEWLINE + "1024/729" + UNIX_NEWLINE + "3/2" + UNIX_NEWLINE + "128/81" + UNIX_NEWLINE + "27/16" + UNIX_NEWLINE + "16/9" + UNIX_NEWLINE + "4096/2187" + UNIX_NEWLINE + "2/1";
      freq = 432;
      break;

    case "313island9":
      name = "313edo island[9]";
      data = "203.19489" + UNIX_NEWLINE + "249.20128" + UNIX_NEWLINE + "452.39617" + UNIX_NEWLINE + "498.40256" + UNIX_NEWLINE + "701.59744" + UNIX_NEWLINE + "747.60383" + UNIX_NEWLINE + "950.79872" + UNIX_NEWLINE + "996.80511" + UNIX_NEWLINE + "2/1";
      break;

    case "17superpyth12":
      name = "17edo superpyth[12]";
      data = "70.58824" + UNIX_NEWLINE + "141.17647" + UNIX_NEWLINE + "282.35294" + UNIX_NEWLINE + "352.94118" + UNIX_NEWLINE + "494.11765" + UNIX_NEWLINE + "564.70588" + UNIX_NEWLINE + "635.29412" + UNIX_NEWLINE + "776.47059" + UNIX_NEWLINE + "847.05882" + UNIX_NEWLINE + "988.23529" + UNIX_NEWLINE + "1058.82353" + UNIX_NEWLINE + "2/1";
      break;

    case "15blackwood10":
      name = "15edo blackwood[10]";
      data = "160." + UNIX_NEWLINE + "240." + UNIX_NEWLINE + "400." + UNIX_NEWLINE + "480." + UNIX_NEWLINE + "640." + UNIX_NEWLINE + "720." + UNIX_NEWLINE + "880." + UNIX_NEWLINE + "960." + UNIX_NEWLINE + "1120." + UNIX_NEWLINE + "2/1";
      break;

    case "26flattone12":
      name = "26edo flattone[12]";
      data = "46.15385" + UNIX_NEWLINE + "184.61538" + UNIX_NEWLINE + "230.76923" + UNIX_NEWLINE + "369.23077" + UNIX_NEWLINE + "507.69231" + UNIX_NEWLINE + "553.84615" + UNIX_NEWLINE + "692.30769" + UNIX_NEWLINE + "738.46154" + UNIX_NEWLINE + "876.92308" + UNIX_NEWLINE + "923.07692" + UNIX_NEWLINE + "1061.53846" + UNIX_NEWLINE + "2/1";
      break;

    default:
      return false;

  }

  setScaleName(name);
  setTuningData(data);
  jQuery("#txt_base_frequency").val(freq);
  jQuery("#txt_base_midi_note").val(midi);
  parse_tuning_data();
  closePopup("#modal_load_preset_scale");

}

export {
  generate_enumerate_chord,
  generate_equal_temperament,
  generate_harmonic_series_segment,
  generate_rank_2_temperament,
  generate_subharmonic_series_segment,
  load_preset_scale
}