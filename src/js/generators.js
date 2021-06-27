/**
 * TUNING DATA GENERATORS
 */

function generate_equal_temperament() {

  var divider = getFloat('#input_number_of_divisions', 'Warning: no divider')
  var period = getString('#input_interval_to_divide', 'Warning: no interval to divide')

  // convert period to cents
  var period_cents = line_to_cents(period);

  // bail if period is invalid
  if (period_cents === false) {
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

  for (i = 1; i <= divider; i++) {

    var note = i * step;

    // if returned value is an integer, append a . just to make sure the parser will see it as a cents value later
    if (!note.toString().includes('.')) {
      note = note.toString() + ".";
    }

    notes.push(note)
  }

  return notes.join(unix_newline)
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
  for (i = 1; i < size; i++) {

    // calculate generators up
    if (i <= up) {

      aa[i] = (aa[i - 1] + generator).mod(period);
      console.log('up: ' + i + ': ' + aa[i]);

    }

    else {

      // first down generator
      if (i == up + 1) {
        aa[i] = (aa[0] - generator).mod(period);
      }

      // subsequent down generators
      else {
        aa[i] = (aa[i - 1] - generator).mod(period);
      }
      console.log('down: ' + i + ': ' + aa[i]);
    }

  }

  // sort the scale ascending
  aa.sort(function (a, b) { return a - b });

  // add the period to the scale
  aa.push(period);

  tuning_data += aa.slice(1, size + 1).map(num => num.toFixed(6)).join(unix_newline)

  return tuning_data
}

function generate_harmonic_series_segment() {

  var lo = getFloat('#input_lowest_harmonic', 'Warning: lowest harmonic should be a positive integer')
  var hi = getFloat('#input_highest_harmonic', 'Warning: highest harmonic should be a positive integer')

  // bail if lo = hi
  if (lo == hi) {
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

  for (i = lo + 1; i <= hi; i++) {
    // add ratio to text box
    ratios.push(i + "/" + lo)
  }

  return ratios.join(unix_newline)
}

function generate_subharmonic_series_segment() {

  var lo = getFloat('#input_lowest_subharmonic', 'Warning: lowest subharmonic should be a positive integer')
  var hi = getFloat('#input_highest_subharmonic', 'Warning: highest subharmonic should be a positive integer')

  // bail if lo = hi
  if (lo == hi) {
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

  for (i = hi - 1; i >= lo; i--) {
    ratios.push(hi + "/" + i)
  }

  return ratios.join(unix_newline)
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
  for (var i = 0; i < inputTest.length; i++) {
    var eval = inputTest[i];
    if (/^\d+$/.test(eval))
      eval += ",";
    eval = line_to_decimal(eval);
    if (eval == 0 || !/(^\d+([\,\.]\d*)?|([\\\/]\d+)?$)*/.test(eval)) {
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
    if (/^1\/\((\d+\:)+\d+\)$/.test(chord)) {
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
  //	  alert("Warning: first pitch cannot be in cents");
  //  return false;
  //}

  if (isInversion) {
    console.log("This is an inversion. Chord is " + chord);
    chord = invert_chord(chord);
    console.log("Chord returned: " + chord);
    chordStr += (" (" + chord + ") ");
    console.log("str = " + chordStr);
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

  for (var i = 0; i < pitches.length; i++) {

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

  return ratios.join(unix_newline)
}

function load_preset_scale(a) {

  var data = "";
  var name = "";
  var freq = 440;
  var midi = 69;

  switch (a) {

    // Traditional

    case "pelog":
    name = "Normalised Pelog, Kunst, 1949. Average of 39 Javanese gamelans";
    data = "120." + unix_newline + "270." + unix_newline + "540." + unix_newline + "670." + unix_newline + "785." + unix_newline + "950." + unix_newline + "1215.";
    break;

    case "slendro":
    name = "Average of 30 measured slendro gamelans, W. Surjodiningrat et al., 1993.";
    data = "231." + unix_newline + "474." + unix_newline + "717." + unix_newline + "955." + unix_newline + "1208.";
    break;

    case "ragabageshri":
    name = "Raga Bageshri";
    data = "10/9" + unix_newline + "32/27" + unix_newline + "4/3" + unix_newline + "3/2" + unix_newline + "5/3" + unix_newline + "16/9" + unix_newline + "2/1";
    break;

    case "ragabhairavi":
    name = "Raga Bhairavi";
    data = "16/15" + unix_newline + "9/8" + unix_newline + "6/5" + unix_newline + "27/20" + unix_newline + "3/2" + unix_newline + "8/5" + unix_newline + "9/5" + unix_newline + "2/1";
    break;

    case "ragakafi":
    name = "Raga Kafi";
    data = "9/8" + unix_newline + "32/27" + unix_newline + "4/3" + unix_newline + "3/2" + unix_newline + "5/3" + unix_newline + "16/9" + unix_newline + "2/1";
    break;

    case "ragatodi":
    name = "Raga Todi";
    data = "256/243" + unix_newline + "32/27" + unix_newline + "45/32" + unix_newline + "3/2" + unix_newline + "128/81" + unix_newline + "15/8" + unix_newline + "2/1";
    break;

    case "ragayaman":
    name = "Raga Yaman";
    data = "9/8" + unix_newline + "5/4" + unix_newline + "45/32" + unix_newline + "3/2" + unix_newline + "27/16" + unix_newline + "15/8" + unix_newline + "2/1";
    break;

    case "22shruti":
    name = "22 Shruti";
    data = "256/243" + unix_newline + "16/15" + unix_newline + "10/9" + unix_newline + "9/8" + unix_newline + "32/27" + unix_newline + "6/5" + unix_newline + "5/4" + unix_newline + "81/64" + unix_newline + "4/3" + unix_newline + "27/20" + unix_newline + "45/32" + unix_newline + "729/512" + unix_newline + "3/2" + unix_newline + "128/81" + unix_newline + "8/5" + unix_newline + "5/3" + unix_newline + "27/16" + unix_newline + "16/9" + unix_newline + "9/5" + unix_newline + "15/8" + unix_newline + "243/128" + unix_newline + "2/1";
    break;

    case "hirajoshi":
    name = "Hirajoshi";
    data = "185." + unix_newline + "337." + unix_newline + "683." + unix_newline + "790." + unix_newline + "2/1";
    break;

    case "archytasdiatonic":
    name = "Archytas Diatonic";
    data = "28/27" + unix_newline + "32/27" + unix_newline + "4/3" + unix_newline + "3/2" + unix_newline + "14/9" + unix_newline + "16/9" + unix_newline + "2/1";
    break;

    case "archytasenharmonic":
    name = "Archytas Enharmonic";
    data = "28/27" + unix_newline + "16/15" + unix_newline + "4/3" + unix_newline + "3/2" + unix_newline + "14/9" + unix_newline + "8/5" + unix_newline + "2/1";
    break;

    case "didymuschromatic":
    name = "Didymus Chromatic";
    data = "16/15" + unix_newline + "10/9" + unix_newline + "4/3" + unix_newline + "3/2" + unix_newline + "8/5" + unix_newline + "5/3" + unix_newline + "2/1";
    break;

    case "ptolemydiatonicditoniaion":
    name = "Ptolemy Diatonic Ditoniaion";
    data = "256/243" + unix_newline + "32/27" + unix_newline + "4/3" + unix_newline + "3/2" + unix_newline + "128/81" + unix_newline + "16/9" + unix_newline + "2/1";
    break;

    case "ptolemydiatonichemiolion":
    name = "Ptolemy Diatonic Hemiolion";
    data = "12/11" + unix_newline + "6/5" + unix_newline + "4/3" + unix_newline + "3/2" + unix_newline + "18/11" + unix_newline + "9/5" + unix_newline + "2/1";
    break;

    case "pythagorean":
    name = "Pythagorean";
    data = "256/243" + unix_newline + "9/8" + unix_newline + "32/27" + unix_newline + "81/64" + unix_newline + "4/3" + unix_newline + "1024/729" + unix_newline + "3/2" + unix_newline + "128/81" + unix_newline + "27/16" + unix_newline + "16/9" + unix_newline + "4096/2187" + unix_newline + "2/1";
    break;

    case "werckmeisteriii":
    name = "Werckmeister III (1691)";
    data = "107.82" + unix_newline + "203.91" + unix_newline + "311.72" + unix_newline + "401.955" + unix_newline + "503.91" + unix_newline + "605.865" + unix_newline + "701.955" + unix_newline + "809.775" + unix_newline + "900." + unix_newline + "1007.82" + unix_newline + "1103.91" + unix_newline + "1200.";
    break;

    case "young1799":
    name = "Young (1799)";
    data = "106." + unix_newline + "198." + unix_newline + "306.2" + unix_newline + "400.1" + unix_newline + "502." + unix_newline + "604." + unix_newline + "697.9" + unix_newline + "806.1" + unix_newline + "898.1" + unix_newline + "1004.1" + unix_newline + "1102." + unix_newline + "1200.";
    break;

    case "12edo":
    name = "12-tone equal temperament";
    data = "100." + unix_newline + "200." + unix_newline + "300." + unix_newline + "400." + unix_newline + "500." + unix_newline + "600." + unix_newline + "700." + unix_newline + "800." + unix_newline + "900." + unix_newline + "1000." + unix_newline + "1100." + unix_newline + "1200.";
    break;

    // Just intonation

    case "partch43":
    name = "Harry Partch 43-tone";
    data = "81/80" + unix_newline + "33/32" + unix_newline + "21/20" + unix_newline + "16/15" + unix_newline + "12/11" + unix_newline + "11/10" + unix_newline + "10/9" + unix_newline + "9/8" + unix_newline + "8/7" + unix_newline + "7/6" + unix_newline + "32/27" + unix_newline + "6/5" + unix_newline + "11/9" + unix_newline + "5/4" + unix_newline + "14/11" + unix_newline + "9/7" + unix_newline + "21/16" + unix_newline + "4/3" + unix_newline + "27/20" + unix_newline + "11/8" + unix_newline + "7/5" + unix_newline + "10/7" + unix_newline + "16/11" + unix_newline + "40/27" + unix_newline + "3/2" + unix_newline + "32/21" + unix_newline + "14/9" + unix_newline + "11/7" + unix_newline + "8/5" + unix_newline + "18/11" + unix_newline + "5/3" + unix_newline + "27/16" + unix_newline + "12/7" + unix_newline + "7/4" + unix_newline + "16/9" + unix_newline + "9/5" + unix_newline + "20/11" + unix_newline + "11/6" + unix_newline + "15/8" + unix_newline + "40/21" + unix_newline + "64/33" + unix_newline + "160/81" + unix_newline + "2/1";
    break;

    case "carlossuperjust":
    name = "Wendy Carlos Super Just";
    data = "17/16" + unix_newline + "9/8" + unix_newline + "6/5" + unix_newline + "5/4" + unix_newline + "4/3" + unix_newline + "11/8" + unix_newline + "3/2" + unix_newline + "13/8" + unix_newline + "5/3" + unix_newline + "7/4" + unix_newline + "15/8" + unix_newline + "2/1";
    break;

    case "gradycentaur":
    name = "Kraig Grady Centaur";
    data = "21/20" + unix_newline + "9/8" + unix_newline + "7/6" + unix_newline + "5/4" + unix_newline + "4/3" + unix_newline + "7/5" + unix_newline + "3/2" + unix_newline + "14/9" + unix_newline + "5/3" + unix_newline + "7/4" + unix_newline + "15/8" + unix_newline + "2/1";
    freq = 264;
    midi = 60;
    break;

    case "gradycentauras":
    name = "Kraig Grady Centaura Subharmonic";
    data = "15/14" + unix_newline + "10/9" + unix_newline + "40/33" + unix_newline + "5/4" + unix_newline + "4/3" + unix_newline + "10/7" + unix_newline + "3/2" + unix_newline + "45/28" + unix_newline + "5/3" + unix_newline + "20/11" + unix_newline + "15/8" + unix_newline + "2/1";
    break;

    case "gradycentaurah":
    name = "Kraig Grady Centaura Harmonic";
    data = "33/2" + unix_newline + "9/8" + unix_newline + "7/6" + unix_newline + "5/4" + unix_newline + "4/3" + unix_newline + "11/8" + unix_newline + "3/2" + unix_newline + "14/9" + unix_newline + "5/3" + unix_newline + "7/4" + unix_newline + "15/8" + unix_newline + "2/1";
    break;

    // Equal temperament subsets

    case "11machine6":
    name = "11edo machine[6]";
    data = "2\\11" + unix_newline + "4\\11" + unix_newline + "6\\11" + unix_newline + "8\\11" + unix_newline + "10\\11" + unix_newline + "11\\11";
    break;
  
    case "13glacial7":
    name = "13edo glacial[7]";
    data = "2\\13" + unix_newline + "4\\13" + unix_newline + "6\\13" + unix_newline + "8\\13" + unix_newline + "10\\13" + unix_newline + "12\\13" + unix_newline + "13\\13";
    break;

    case "13father8":
    name = "13edo father[8]";
    data = "2\\13" + unix_newline + "4\\13" + unix_newline + "5\\13" + unix_newline + "7\\13" + unix_newline + "9\\13" + unix_newline + "10\\13" + unix_newline + "12\\13" + unix_newline + "13\\13";
    break;

    case "15blackwood10":
    name = "15edo blackwood[10]";
    data = "160." + unix_newline + "240." + unix_newline + "400." + unix_newline + "480." + unix_newline + "640." + unix_newline + "720." + unix_newline + "880." + unix_newline + "960." + unix_newline + "1120." + unix_newline + "2/1";
    break;

    case "16mavila7":
    name = "16edo mavila[7]";
    data = "2\\16" + unix_newline + "4\\16" + unix_newline + "7\\16" + unix_newline + "9\\16" + unix_newline + "11\\16" + unix_newline + "13\\16" + unix_newline + "16\\16";
    break;

    case "17superpyth12":
    name = "17edo superpyth[12]";
    data = "70.58824" + unix_newline + "141.17647" + unix_newline + "282.35294" + unix_newline + "352.94118" + unix_newline + "494.11765" + unix_newline + "564.70588" + unix_newline + "635.29412" + unix_newline + "776.47059" + unix_newline + "847.05882" + unix_newline + "988.23529" + unix_newline + "1058.82353" + unix_newline + "2/1";
    break;

    case "17rast":
    name = "17edo Rast";
    data = "3\\17" + unix_newline + "5\\17" + unix_newline + "7\\17" + unix_newline + "10\\17" + unix_newline + "13\\17" + unix_newline + "15\\17" + unix_newline + "17\\17";
    break;

    case "22porcupine8":
    name = "22edo porcupine[8]";
    data = "3\\22" + unix_newline + "6\\22" + unix_newline + "9\\22" + unix_newline + "12\\22" + unix_newline + "15\\22" + unix_newline + "18\\22" + unix_newline + "21\\22" + unix_newline + "22\\22";
    break;

    case "22orwell9":
    name = "22edo orwell[9]";
    data = "2\\22" + unix_newline + "5\\22" + unix_newline + "7\\22" + unix_newline + "10\\22" + unix_newline + "12\\22" + unix_newline + "15\\22" + unix_newline + "17\\22" + unix_newline + "20\\22" + unix_newline + "22\\22";
    break;

    case "22pajara12":
    name = "22edo pajara[12]";
    data = "2\\22" + unix_newline + "4\\22" + unix_newline + "6\\22" + unix_newline + "8\\22" + unix_newline + "10\\22" + unix_newline + "11\\22" + unix_newline + "13\\22" + unix_newline + "15\\22" + unix_newline + "17\\22" + unix_newline + "19\\22" + unix_newline + "21\\22" + unix_newline + "22\\22";
    break;
    
    case "26lemba10":
    name = "26edo lemba[10]";
    data = "3\\26" + unix_newline + "5\\26" + unix_newline + "8\\26" + unix_newline + "10\\26" + unix_newline + "13\\26" + unix_newline + "16\\26" + unix_newline + "18\\26" + unix_newline + "21\\26" + unix_newline + "23\\26" + unix_newline + "26\\26";
    break;

    case "26flattone12":
    name = "26edo flattone[12]";
    data = "46.15385" + unix_newline + "184.61538" + unix_newline + "230.76923" + unix_newline + "369.23077" + unix_newline + "507.69231" + unix_newline + "553.84615" + unix_newline + "692.30769" + unix_newline + "738.46154" + unix_newline + "876.92308" + unix_newline + "923.07692" + unix_newline + "1061.53846" + unix_newline + "2/1";
    break;

    case "31meantone19":
    name = "31edo meantone[19]";
    data = "1\\31" + unix_newline + "3\\31" + unix_newline + "4\\31" + unix_newline + "6\\31" + unix_newline + "8\\31" + unix_newline + "9\\31" + unix_newline + "11\\31" + unix_newline + "13\\31" + unix_newline + "14\\31" + unix_newline + "16\\31" + unix_newline + "17\\31" + unix_newline + "19\\31" + unix_newline + "21\\31" + unix_newline + "22\\31" + unix_newline + "24\\31" + unix_newline + "26\\31" + unix_newline + "27\\31" + unix_newline + "29\\31" + unix_newline + "31\\31";
    break;

    case "46sensi11":
    name = "46edo sensi[11]";
    data = "5\\46" + unix_newline + "10\\46" + unix_newline + "15\\46" + unix_newline + "17\\46" + unix_newline + "22\\46" + unix_newline + "27\\46" + unix_newline + "32\\46" + unix_newline + "34\\46" + unix_newline + "39\\46" + unix_newline + "44\\46" + unix_newline + "46\\46";
    break;

    case "313island9":
    name = "313edo island[9]";
    data = "203.19489" + unix_newline + "249.20128" + unix_newline + "452.39617" + unix_newline + "498.40256" + unix_newline + "701.59744" + unix_newline + "747.60383" + unix_newline + "950.79872" + unix_newline + "996.80511" + unix_newline + "2/1";
    break;

    // Non-octave

    case "bohlenpierceeq":
    name = "Bohlen-Pierce equal (13edo3)";
    data = "146.304" + unix_newline + "292.608" + unix_newline + "438.913" + unix_newline + "585.217" + unix_newline + "731.521" + unix_newline + "877.825" + unix_newline + "1024.130" + unix_newline + "1170.434" + unix_newline + "1316.738" + unix_newline + "1463.042" + unix_newline + "1609.347" + unix_newline + "1755.651" + unix_newline + "3/1";
    break;

    case "bohlenpierceji":
    name = "Bohlen-Pierce just";
    data = "27/25" + unix_newline + "25/21" + unix_newline + "9/7" + unix_newline + "7/5" + unix_newline + "75/49" + unix_newline + "5/3" + unix_newline + "9/5" + unix_newline + "49/25" + unix_newline + "15/7" + unix_newline + "7/3" + unix_newline + "63/25" + unix_newline + "25/9" + unix_newline + "3/1";
    break;

    case "carlosalpha":
    name = "Wendy Carlos Alpha";
    data = "78." + unix_newline + "156." + unix_newline + "234." + unix_newline + "312." + unix_newline + "390." + unix_newline + "468." + unix_newline + "546." + unix_newline + "624." + unix_newline + "702.";
    break;

    case "carlosbeta":
    name = "Wendy Carlos Beta";
    data = "63.8" + unix_newline + "127.6" + unix_newline + "191.4" + unix_newline + "255.2" + unix_newline + "319.0" + unix_newline + "382.8" + unix_newline + "446.6" + unix_newline + "510.4" + unix_newline + "574.2" + unix_newline + "638.0" + unix_newline + "701.8";
    break;

    case "carlosgamma":
    name = "Wendy Carlos Gamma";
    data = "35.1" + unix_newline + "70.2" + unix_newline + "105.3" + unix_newline + "140.4" + unix_newline + "175.5" + unix_newline + "210.6" + unix_newline + "245.7" + unix_newline + "280.8" + unix_newline + "315.9" + unix_newline + "351.0" + unix_newline + "386.1" + unix_newline + "421.2" + unix_newline + "456.3" + unix_newline + "491.4" + unix_newline + "526.5" + unix_newline + "561.6" + unix_newline + "596.7" + unix_newline + "631.8" + unix_newline + "666.9" + unix_newline + "702.0";
    break;

    case "65cet":
    name = "65 cent Equal Temperament";
    data = "65.0";
    break;

    case "88cet":
    name = "88 cent Equal Temperament";
    data = "88.0";
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
