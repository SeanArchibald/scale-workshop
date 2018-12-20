/**
 * HELPER FUNCTIONS
 */

// modulo function
Number.prototype.mod = function (n) {
  return ((this % n) + n) % n;
};

// convert a cents value to decimal
function cents_to_decimal(input) {
  return Math.pow(2, (parseFloat(input) / 1200.0));
}

// convert a ratio (string 'x/y') to decimal
function ratio_to_decimal(input) {
  try {
    return eval(input);
  }
  catch (err) {
    console.log(err);
    alert("Warning: could not parse " + input);
    return false;
  }
}

// convert a decimal value to cents
function decimal_to_cents(input) {
  input = parseFloat(input);
  // check input
  if (input == 0 || isNaN(input)) {
    // fail
    return false;
  }
  else {
    // success
    return 1200.0 * Math.log2(input);
  }
}

// convert a ratio to cents
function ratio_to_cents(input) {
  return decimal_to_cents(ratio_to_decimal(input));
}

// convert an n-of-m-edo (string 'x\y') to decimal
function n_of_edo_to_decimal(input) {
  input = input.split("\\");
  if (input.length > 2) {
    alert("Invalid input: " + input);
    return false;
  }
  return Math.pow(2, parseInt(input[0]) / parseInt(input[1]));
}

// convert an n-of-m-edo (string 'x\y') to cents
function n_of_edo_to_cents(input) {
  return decimal_to_cents(n_of_edo_to_decimal(input));
}

// return cents, ratio or n_of_edo depending on the format of inputted value 'line'
function line_type(input) {

  // line_type() examples:
  //
  // line_type("700.00") -> "cents"
  // line_type("3/2")    -> "ratio"
  // line_type("7\12")   -> "n_of_edo"
  // line_type("Hello")  -> false

  // line contains a period, so it should be a value in cents
  if (input.toString().indexOf('.') !== -1) {
    try {
      eval(input);
    }
    catch (err) {
      console.log(err);
      return false;
    }
    return "cents";
  }

  // line contains a backslash, so it should be an n_of_edo
  else if (input.toString().indexOf('\\') !== -1) {
    return "n_of_edo";
  }

  // line contains a forward slash, so it should be a ratio
  else if (input.toString().indexOf('/') !== -1) {
    return "ratio";
  }

  // line contains something else, if it evaluates then just call it a ratio, otherwise fail
  else {

    try {
      eval(input);
    }
    catch (err) {
      console.log(err);
      return false;
    }

    return "ratio";

  }

}

// convert any input 'line' to decimal
function line_to_decimal(input) {

  var type = line_type(input);

  switch (type) {

    case false:
      return false;
      break;

    case "cents":
      return cents_to_decimal(input);
      break;

    case "n_of_edo":
      return n_of_edo_to_decimal(input);
      break;

    case "ratio":
      return ratio_to_decimal(input);
      break;

  }

}

// convert any input 'line' to a cents value
function line_to_cents(input) {
  return decimal_to_cents(line_to_decimal(input));
}

// convert a midi note number to a frequency in Hertz
// assuming 12-edo at 1440Hz (100% organic vanilla)
function mtof(input) {
  return 8.17579891564 * Math.pow(1.05946309436, parseInt(input));
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
  if (input.trim() == "") {
    return "tuning";
  }
  return input.replace(/[|&;$%@"<>()+,?]/g, "").replace(/\//g, "_");
}

// clear all inputted scale data
function clear_all() {

  // empty text fields
  $("#txt_tuning_data").val("");
  $("#txt_name").val("");

  // empty any information displayed on page
  $("#tuning-table").empty();

  // restore default base tuning
  $("#txt_base_frequency").val(440);
  $("#txt_base_midi_note").val(69);

  // re-init tuning_table
  tuning_table = {
    scale_data: [], // an array containing list of intervals input by the user
    tuning_data: [], // an array containing the same list above converted to decimal format
    note_count: 0, // number of values stored in tuning_data
    freq: [], // an array containing the frequency for each MIDI note
    cents: [], // an array containing the cents value for each MIDI note
    decimal: [], // an array containing the frequency ratio expressed as decimal for each MIDI note
    base_frequency: 440, // init val
    base_midi_note: 69, // init val
    description: "",
    filename: ""
  };

}

// find MIDI note name from MIDI note number
function midi_note_number_to_name(input) {
  var n = parseInt(input);
  var quotient = Math.floor(n / 12);
  var remainder = n % 12;
  var name = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  return name[remainder] + quotient;
}

// generate and display MOS list
// slow but works
function show_mos(per, gen, ssz, threshold) {

  var maxsize = 400; // maximum EDO size to search for MOS
  var roundf = 100000; // rounding factor for interval comparison

  // parsePG(document.getElementById("_per").value); // 'returns' cents in c
  per = line_to_cents(per);
  if (per <= 0 || isNaN(per)) {
    jQuery("#info_rank_2_mos").text("invalid period");
    return false;
  }

  // parsePG(document.getElementById("_gen").value);
  gen = line_to_cents(gen);
  if (gen <= 0 || isNaN(gen)) {
    jQuery("#info_rank_2_mos").text("invalid generator");
    return false;
  }

  /*threshold = parseFloat(document.getElementById("_threshold").value, 10);
  if (isNaN(threshold)) {
      docerr.innerHTML = "unable to parse MOS step size threshold";
      return;
  }
  if (threshold < 0) {
      docerr.innerHTML = "MOS step size threshold must be at least 0";
      return;
  }*/

  var aa = []; // scale
  var bb = []; // intervals
  var cc = []; // distinct intervals
  var dd = []; // intervals per class
  var maxdd;
  var mos = []; // MOS sizes

  // test each scale from length 2 to maxsize
  for (i = 2; i <= maxsize; i++) {
    // clear arrays
    aa = [];
    dd = [];

    // generate array of scale pitches (aa)
    aa[0] = 0.0;
    for (j = 1; j < i; j++)
      aa[j] = (aa[j - 1] + gen) % per;
    aa.sort(function (a, b) { return a - b }); // sort ascending

    // must look at not only adjacent intervals ("seconds"), but also "thirds", "fourths", etc.
    for (k = 1; k < i; k++) {
      // clear arrays
      bb = [];
      cc = [];

      // generate array of intervals (bb)
      for (j = 0; j < i; j++) {
        bb[j] = aa[(j + k) % i] - aa[j];
        if (j + k >= i) bb[j] += per; // wrap
      }

      // round intervals (to hopefully avoid false comparisons due to float precision)
      for (j = 0; j < bb.length; j++)
        bb[j] = Math.round(bb[j] * roundf) / roundf;

      // generate array of distinct intervals (cc)
      cc[0] = bb[0]; // gotta start somewhere
      for (j = 1; j < i; j++)
        if ((cc.indexOf(bb[j])) == -1) // bb[j] not found in cc
          cc.push(bb[j]);
      cc.sort(function (a, b) { return a - b }); // sort ascending
      if (cc[0] < threshold) break; // steps too small, stop search

      //console.log('i='+i+'  k='+k+'  aa='+aa+'  bb='+bb+'  cc='+cc);
      dd.push(cc.length);
    }
    if (cc[0] < threshold) break; // steps too small, stop search

    maxdd = Math.max.apply(null, dd); // largest value in dd
    //console.log('dd='+dd+'  maxdd='+maxdd);

    // is it MOS?
    if (maxdd <= 2) mos.push(i); // including EDO case in list
    if (maxdd == 1) break; // reached EDO, stop search
  }

  jQuery("#info_rank_2_mos").text(mos.join(", "));
}

function debug(msg = "") {
  if (debug_enabled) {
    msg = (msg == "") ? "Debug" : msg;
    console.log(msg);
    return true;
  }
  return false;
}

function clone(src) {
  return JSON.parse(JSON.stringify(src));
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

  if (value === '' || value === null) {
    alert(errorMessage);
    return false;
  }

  return value
}

function getLine(id, errorMessage) {
  var value = jQuery(id).val();

  if (value === '' || parseFloat(value) <= 0 || value == null || line_type(value) == false) {
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
