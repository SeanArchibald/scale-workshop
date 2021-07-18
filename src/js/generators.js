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

function generate_cps() {

  // get factors and combination count
  var f = getString('#input_cps_factors', 'Warning: no factors');
  var cc = getFloat('#input_cps_combination_count', 'Warning: combination count should be minimum of 2 and less than the number of factors.');

  // bail on missing input
  if (f === false || cc === false) {
    return false;
  }

  // convert input factors to array
  var factors = f.split(" ");

  // cc must be integer. discard anything after decimal point
  cc = parseInt(cc);

  // bail on invalid combination count
  if ( cc < 2 || cc >= factors.length ) {
    alert("Combination count should be minimum of 2 and less than the number of factors.");
    return false;
  }

  // loop through the array of factors
  for (let i=0; i < factors.length; i++) {

    // only allow integers - these will treated as harmonics
    factors[i] = parseInt(factors[i]);

    // future improvement - floats to be allowed. non-integers to be treated as decimals or cents?
    // factors[i] = parseFloat(factors[i]);

    // bail if any of the factors aren't a number
    if ( isNaN(factors[i]) ) {
      alert("Factors should be a list of integers e.g. '1 3 7 9'");
      return false;
    }

  }

  // do combinations
  var products = cps(factors,cc);
  
  // remove 1/1 from scale by dividing all products by one of the factors
  if (document.getElementById("input_cps_remove_1").checked) {

    // remove first product from the set
    var divisor = products.shift();

    // divide remaining products by the removed product
    for (let i=0; i<products.length; i++) {
      products[i] = products[i] + "/" + divisor;
    }
    
  }
  else {
    for (let i=0; i<products.length; i++) {
      products[i] = products[i] + "/1";
    }
  }

  // octave reduce
  if (document.getElementById("input_cps_reduce").checked) {

    // each line modulo with 2/1 (this has the side effect of simplifying the ratios)
    for (let i=0; i<products.length; i++) {
      products[i] = moduloLine(products[i], "2/1");
    }

    // make the scale repeat at the octave
    products.push("2/1");

  }
  else {

    // simplify the ratios
    for (let i=0; i<products.length; i++) {
      products[i] = simplifyRatioString(products[i]);
    }

  }

  // sort ascending
  products = scaleSort(products);

  setScaleName(cc + ")" + factors.length + " CPS " + factors.join(" "));
  setTuningData(products.join(unix_newline));
  parse_tuning_data();
  closePopup("#modal_generate_cps");
  return true;
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
    data = ["120.", "270.", "540.", "670.", "785.", "950.", "1215."];
    break;

    case "slendro":
    name = "Average of 30 measured slendro gamelans, W. Surjodiningrat et al., 1993.";
    data = ["231.", "474.", "717.", "955.", "1208."];
    break;

    case "ragabageshri":
    name = "Raga Bageshri";
    data = ["10/9", "32/27", "4/3", "3/2", "5/3", "16/9", "2/1"];
    break;

    case "ragabhairavi":
    name = "Raga Bhairavi";
    data = ["16/15", "9/8", "6/5", "27/20", "3/2", "8/5", "9/5", "2/1"];
    break;

    case "ragakafi":
    name = "Raga Kafi";
    data = ["9/8", "32/27", "4/3", "3/2", "5/3", "16/9", "2/1"];
    break;

    case "ragatodi":
    name = "Raga Todi";
    data = ["256/243", "32/27", "45/32", "3/2", "128/81", "15/8", "2/1"];
    break;

    case "ragayaman":
    name = "Raga Yaman";
    data = ["9/8", "5/4", "45/32", "3/2", "27/16", "15/8", "2/1"];
    break;

    case "22shruti":
    name = "22 Shruti";
    data = ["256/243", "16/15", "10/9", "9/8", "32/27", "6/5", "5/4", "81/64", "4/3", "27/20", "45/32", "729/512", "3/2", "128/81", "8/5", "5/3", "27/16", "16/9", "9/5", "15/8", "243/128", "2/1"];
    break;

    case "hirajoshi":
    name = "Hirajoshi";
    data = ["185.", "337.", "683.", "790.", "2/1"];
    break;

    case "archytasdiatonic":
    name = "Archytas Diatonic";
    data = ["28/27", "32/27", "4/3", "3/2", "14/9", "16/9", "2/1"];
    break;

    case "archytasenharmonic":
    name = "Archytas Enharmonic";
    data = ["28/27", "16/15", "4/3", "3/2", "14/9", "8/5", "2/1"];
    break;

    case "didymuschromatic":
    name = "Didymus Chromatic";
    data = ["16/15", "10/9", "4/3", "3/2", "8/5", "5/3", "2/1"];
    break;

    case "ptolemydiatonicditoniaion":
    name = "Ptolemy Diatonic Ditoniaion";
    data = ["256/243", "32/27", "4/3", "3/2", "128/81", "16/9", "2/1"];
    break;

    case "ptolemydiatonichemiolion":
    name = "Ptolemy Diatonic Hemiolion";
    data = ["12/11", "6/5", "4/3", "3/2", "18/11", "9/5", "2/1"];
    break;

    case "pythagorean":
    name = "Pythagorean";
    data = ["256/243", "9/8", "32/27", "81/64", "4/3", "1024/729", "3/2", "128/81", "27/16", "16/9", "4096/2187", "2/1"];
    break;

    case "werckmeisteriii":
    name = "Werckmeister III (1691)";
    data = ["107.82", "203.91", "311.72", "401.955", "503.91", "605.865", "701.955", "809.775", "900.", "1007.82", "1103.91", "1200."];
    break;

    case "young1799":
    name = "Young (1799)";
    data = ["106.", "198.", "306.2", "400.1", "502.", "604.", "697.9", "806.1", "898.1", "1004.1", "1102.", "1200."];
    break;

    case "12edo":
    name = "12-tone equal temperament";
    data = ["100.", "200.", "300.", "400.", "500.", "600.", "700.", "800.", "900.", "1000.", "1100.", "1200."];
    break;

    // Just intonation

    case "partch43":
    name = "Harry Partch 43-tone";
    data = ["81/80", "33/32", "21/20", "16/15", "12/11", "11/10", "10/9", "9/8", "8/7", "7/6", "32/27", "6/5", "11/9", "5/4", "14/11", "9/7", "21/16", "4/3", "27/20", "11/8", "7/5", "10/7", "16/11", "40/27", "3/2", "32/21", "14/9", "11/7", "8/5", "18/11", "5/3", "27/16", "12/7", "7/4", "16/9", "9/5", "20/11", "11/6", "15/8", "40/21", "64/33", "160/81", "2/1"];
    break;

    case "carlossuperjust":
    name = "Wendy Carlos Super Just";
    data = ["17/16", "9/8", "6/5", "5/4", "4/3", "11/8", "3/2", "13/8", "5/3", "7/4", "15/8", "2/1"];
    break;

    case "gradycentaur":
    name = "Kraig Grady Centaur";
    data = ["21/20", "9/8", "7/6", "5/4", "4/3", "7/5", "3/2", "14/9", "5/3", "7/4", "15/8", "2/1"];
    freq = 264;
    midi = 60;
    break;

    case "gradycentauras":
    name = "Kraig Grady Centaura Subharmonic";
    data = ["15/14", "10/9", "40/33", "5/4", "4/3", "10/7", "3/2", "45/28", "5/3", "20/11", "15/8", "2/1"];
    break;

    case "gradycentaurah":
    name = "Kraig Grady Centaura Harmonic";
    data = ["33/2", "9/8", "7/6", "5/4", "4/3", "11/8", "3/2", "14/9", "5/3", "7/4", "15/8", "2/1"];
    break;

    // Equal temperament subsets

    case "11machine6":
    name = "11edo machine[6]";
    data = ["2\\11", "4\\11", "6\\11", "8\\11", "10\\11", "11\\11"];
    break;
  
    case "13glacial7":
    name = "13edo glacial[7]";
    data = ["2\\13", "4\\13", "6\\13", "8\\13", "10\\13", "12\\13", "13\\13"];
    break;

    case "13father8":
    name = "13edo father[8]";
    data = ["2\\13", "4\\13", "5\\13", "7\\13", "9\\13", "10\\13", "12\\13", "13\\13"];
    break;

    case "15blackwood10":
    name = "15edo blackwood[10]";
    data = ["160.", "240.", "400.", "480.", "640.", "720.", "880.", "960.", "1120.", "2/1"];
    break;

    case "16mavila7":
    name = "16edo mavila[7]";
    data = ["2\\16", "4\\16", "7\\16", "9\\16", "11\\16", "13\\16", "16\\16"];
    break;

    case "17superpyth12":
    name = "17edo superpyth[12]";
    data = ["70.58824", "141.17647", "282.35294", "352.94118", "494.11765", "564.70588", "635.29412", "776.47059", "847.05882", "988.23529", "1058.82353", "2/1"];
    break;

    case "17rast":
    name = "17edo Rast";
    data = ["3\\17", "5\\17", "7\\17", "10\\17", "13\\17", "15\\17", "17\\17"];
    break;

    case "22porcupine8":
    name = "22edo porcupine[8]";
    data = ["3\\22", "6\\22", "9\\22", "12\\22", "15\\22", "18\\22", "21\\22", "22\\22"];
    break;

    case "22orwell9":
    name = "22edo orwell[9]";
    data = ["2\\22", "5\\22", "7\\22", "10\\22", "12\\22", "15\\22", "17\\22", "20\\22", "22\\22"];
    break;

    case "22pajara12":
    name = "22edo pajara[12]";
    data = ["2\\22", "4\\22", "6\\22", "8\\22", "10\\22", "11\\22", "13\\22", "15\\22", "17\\22", "19\\22", "21\\22", "22\\22"];
    break;
    
    case "26lemba10":
    name = "26edo lemba[10]";
    data = ["3\\26", "5\\26", "8\\26", "10\\26", "13\\26", "16\\26", "18\\26", "21\\26", "23\\26", "26\\26"];
    break;

    case "26flattone12":
    name = "26edo flattone[12]";
    data = ["46.15385", "184.61538", "230.76923", "369.23077", "507.69231", "553.84615", "692.30769", "738.46154", "876.92308", "923.07692", "1061.53846", "2/1"];
    break;

    case "31meantone19":
    name = "31edo meantone[19]";
    data = ["1\\31", "3\\31", "4\\31", "6\\31", "8\\31", "9\\31", "11\\31", "13\\31", "14\\31", "16\\31", "17\\31", "19\\31", "21\\31", "22\\31", "24\\31", "26\\31", "27\\31", "29\\31", "31\\31"];
    break;

    case "46sensi11":
    name = "46edo sensi[11]";
    data = ["5\\46", "10\\46", "15\\46", "17\\46", "22\\46", "27\\46", "32\\46", "34\\46", "39\\46", "44\\46", "46\\46"];
    break;

    case "313island9":
    name = "313edo island[9]";
    data = ["203.19489", "249.20128", "452.39617", "498.40256", "701.59744", "747.60383", "950.79872", "996.80511", "2/1"];
    break;

    // Non-octave

    case "bohlenpierceeq":
    name = "Bohlen-Pierce equal (13edo3)";
    data = ["146.304", "292.608", "438.913", "585.217", "731.521", "877.825", "1024.130", "1170.434", "1316.738", "1463.042", "1609.347", "1755.651", "3/1"];
    break;

    case "bohlenpierceji":
    name = "Bohlen-Pierce just";
    data = ["27/25", "25/21", "9/7", "7/5", "75/49", "5/3", "9/5", "49/25", "15/7", "7/3", "63/25", "25/9", "3/1"];
    break;

    case "carlosalpha":
    name = "Wendy Carlos Alpha";
    data = ["78.", "156.", "234.", "312.", "390.", "468.", "546.", "624.", "702."];
    break;

    case "carlosbeta":
    name = "Wendy Carlos Beta";
    data = ["63.8", "127.6", "191.4", "255.2", "319.0", "382.8", "446.6", "510.4", "574.2", "638.0", "701.8"];
    break;

    case "carlosgamma":
    name = "Wendy Carlos Gamma";
    data = ["35.1", "70.2", "105.3", "140.4", "175.5", "210.6", "245.7", "280.8", "315.9", "351.0", "386.1", "421.2", "456.3", "491.4", "526.5", "561.6", "596.7", "631.8", "666.9", "702.0"];
    break;

    case "65cet":
    name = "65 cent Equal Temperament";
    data = ["65.0"];
    break;

    case "88cet":
    name = "88 cent Equal Temperament";
    data = ["88.0"];
    break;

    default:
    return false;

  }

  setScaleName(name);
  setTuningData(data.join(unix_newline));
  jQuery("#txt_base_frequency").val(freq);
  jQuery("#txt_base_midi_note").val(midi);
  parse_tuning_data();
  closePopup("#modal_load_preset_scale");

}
