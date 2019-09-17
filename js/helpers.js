/**
 * HELPER FUNCTIONS
 */

// modulo function
Number.prototype.mod = function (n) {
  return ((this % n) + n) % n;
};

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

// calculate the sum of the values in a given array given a stopping index
function sum_array(array, index)
{
  var sum = 0;

  if (array.length <= index)
    index = array.length - 1;

    for (var i = 0; i < index; i ++)
    {
      sum += array[i];
    }

    return sum;
}
      
// calculate a continued fraction for the given number
function get_cf(num, sizelimit, roundf) {
    var cf = [] // the continued fraction
    var digit;
    
    var roundinv = 1.0 / roundf;
    
    var iterations = 0;
    while (iterations < sizelimit)
    {
        digit = Math.floor(num);
        cf.push(digit);
        
        num -= digit;
        
        if (num == 0 || num <= roundinv)
        {
            break;
        }
        
        num = 1.0 / num;
        iterations++;
    }

    return cf;
}

// calculate rational approximations given a continued fraction
function get_convergents(cf, numarray, denarray, perlimit)
{
    var cfdigit; // the continued fraction digit
    var num; // the convergent numerator
    var den; // the convergent denominator
    var tmp; // for easy reciprocation
    var scnum; // the semiconvergent numerator
    var scden; // the semiconvergen denominator
    var cind = []; // tracks indicies of convergents
    
    for (var d = 0; d < cf.length; d++)
    {
        cfdigit = cf[d];
        num = cfdigit;
        den = 1;
        
        // calculate the convergent
        for (var i = d; i > 0; i--)
        {
            tmp = den;
            den = num;
            num = tmp;
            num += den * cf[i - 1];
        }

        if (d > 0)
        {
          for (var i = 1; i < cfdigit; i++)
          {
              scnum = num - (cfdigit - i) * numarray[cind[d-1]];
              scden = den - (cfdigit - i) * denarray[cind[d-1]];

              if (scden > perlimit)
                break;
                
              numarray.push(scnum);
              denarray.push(scden);
          }
        }

        if (den > perlimit)
           break;
                
        cind.push(numarray.length);
        numarray.push(num);
        denarray.push(den);
    }

    for (var i = 0; i < denarray.length; i++)
      console.log(numarray[i]+"/"+denarray[i]);
}

function get_Ls_mos_decimal(genLogIn, sizeIn, llIn, ssIn)
{
  
  var cf = get_cf(genLogIn);
  console.log("Gen = " + genLogIn + " | [" + cf + "]");
  
  var ip = 1;
  var lz = genLogIn;
  var ss = 0;
  var cfd;

  for (var i = 0; i < cf.size(); i++)
  {
    cfd = cf[i];

    for (var d = 0; d < cfd; d++)
    {

      llIn.length = 0;
      ssIn.length = 0;
      llIn.push(lz);
      ssIn.push();
    }
      //swap variables if necessary
      if (llIn[0] < ssIn[0])
      {
        var tmp = llIn.pop();
        llIn.push(ssIn[0]);
        ssIn.pop();
        ssIn.push(tmp);
      }
      
      console.log("L = " + llIn[0] + "\ts = " + ssIn[0] + "\tc = " + llIn[0] - ssIn[0]);
  }

}

// get the large and small step sizes in a MOS scale
// make sure to use an array for vars large & small to receive values
function get_Ls_cents(gencents, periodcents, size, large, small) {
   
  var scale = [];
  var note;

  for (var i = 0; i < size; i++)
  {
    note = gencents * i;

    if (note > periodcents)
      note = note - periodcents * Math.floor(note/periodcents);

    else if (note == periodcents)
      break;

      scale.push(note);
  }
  
  scale.push(periodcents);
  scale.sort(function(a, b){return a - b})

  large.length = 0;
  small.length = 0;
  large.push(0);
  small.push(periodcents);

  for (var i = 0; i < scale.length - 1; i++)
  {
    note = scale[i+1] - scale[i];

    if (note > large[0])
    {
      large.pop();
      large.push(note);
    }

    if (note < small[0])
    {
      small.pop();
      small.push(note);
    }
  }
  var chroma = large[0]-small[0];
  console.log("Size: " + size + "\tL="+large[0]+"\ts="+small[0]+"\tc="+chroma);
}
                         
// generate and display MOS list
function show_mos_cf(per, gen, ssz, threshold) {
    var maxsize = 400; // maximum period size
    var maxcfsize = 12; // maximum continued fraction length
    var roundf = 1000; // rounding factor in case continued fraction blows up
     
    per = line_to_decimal(per);
    if (per <= 0 || isNaN(per)) {
    jQuery("#info_rank_2_mos").text("invalid period");
    return false;
    }

    gen = line_to_decimal(gen);
    if (gen <= 0 || isNaN(gen)) {
    jQuery("#info_rank_2_mos").text("invalid generator");
    return false;
    }

    var genlog = Math.log(gen) / Math.log(per); // the logarithmic ratio to generate MOS info

    var cf = []; // continued fraction
    var nn = []; // MOS generators
    var dd = []; // MOS periods

    cf = get_cf(genlog, maxcfsize, roundf);
    console.log("log_p(g) = " + genlog + " | [" + cf + "]");
    get_convergents(cf, nn, dd, maxsize);
   
    
    // filter by step size threshold
    var gc = decimal_to_cents(gen);
    var pc = decimal_to_cents(per);
    var L = pc + gc; // Large step
    var s = pc; // small step
    var c = gc; // chroma (L - s)

    console.log("0 : "+"\tL="+L+"\ts="+s+"\tc="+c);
    for (var i = 1; i < cf.length; i++)
    {
        L -= c * cf[i];
        s = c;
        c = L - s;
        var size = dd[sum_array(cf, i)+1];
        console.log(cf[i] + ": "+"size = "+size+"\tL="+L+"\ts="+s+"\tc="+c);
        
        // break if g is some equal division of period
        if (c < 1 / roundf && cf.length < maxcfsize)
        {
          // not sure if flaw in my algorithm or weird edge case
          if (cf.length > 3)
            dd.splice(dd.length-1, 0, dd[dd.length-1]-1)
          break;
        }
        
        if (c < threshold)
        {
            dd.length = sum_array(cf, i+1) + 1;
            break;
        }
    }

    // the first two periods are trivial
    dd.shift();
    dd.shift();
     
    jQuery("#info_rank_2_mos").text(dd.join(", "));
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

  /*
  threshold = parseFloat(document.getElementById("_threshold").value, 10);
  if (isNaN(threshold)) {
      docerr.innerHTML = "unable to parse MOS step size threshold";
      return;
  }
  if (threshold < 0) {
      docerr.innerHTML = "MOS step size threshold must be at least 0";
      return;
  }
  */

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
        if (!cc.includes(bb[j])) // bb[j] not found in cc
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
