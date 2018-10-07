/**
 * HELPER FUNCTIONS
 */

function cents_to_decimal( input ) {
  return Math.pow( 2, ( parseFloat( input ) / 1200.0 ) );
}

function ratio_to_decimal( input ) {
  try {
    return eval( input );
  }
  catch(err) {
    console.log(err);
    alert( "Warning: could not parse " + input );
    return false;
  }
}

function decimal_to_cents( input ) {
  input = parseFloat( input );
  // check input
  if ( input == 0 || isNaN( input ) ) {
    // fail
    return false;
  }
  else {
    // success
    return 1200.0 * Math.log2( input );
  }
}

function ratio_to_cents( input ) {
  return decimal_to_cents( ratio_to_decimal( input ) );
}

function n_of_edo_to_decimal( input ) {
  input = input.split( "\\" );
  if ( input.length > 2 ) {
    alert( "Invalid input: " + input );
    return false;
  }
  return Math.pow( 2, parseInt( input[0] ) / parseInt( input[1] ) );
}

function n_of_edo_to_cents( input ) {
  return decimal_to_cents( n_of_edo_to_decimal( input ) );
}

// detect if a line is a cents, ratio, or n_of_edo value
function line_type( input ) {

  // line contains a period, so it should be a value in cents
  if ( input.toString().indexOf('.') !== -1 ) {
    try {
      eval(input);
    }
    catch(err) {
      console.log(err);
      return false;
    }
    return "cents";
  }

  // line contains a backslash, so it should be an n_of_edo
  else if ( input.toString().indexOf('\\') !== -1 ) {
    return "n_of_edo";
  }

  // line contains a forward slash, so it should be a ratio
  else if ( input.toString().indexOf('/') !== -1 ) {
    return "ratio";
  }

  // line contains something else, if it evaluates then just call it a ratio, otherwise fail
  else {

    try {
      eval(input);
    }
    catch(err) {
      console.log(err);
      return false;
    }

    return "ratio";

  }

}

function line_to_decimal( input ) {

  var type = line_type( input );

  switch ( type ) {

    case false:
      return false;
      break;

    case "cents":
      return cents_to_decimal( input );
      break;

    case "n_of_edo":
      return n_of_edo_to_decimal( input );
      break;

    case "ratio":
      return ratio_to_decimal( input );
      break;

  }

}

function line_to_cents( input ) {
  return decimal_to_cents( line_to_decimal( input ) );
}

function mtof( input ) {
  // get the frequency of any MIDI number
  // assuming 12-edo at A440Hz
  return 8.17579891564 * Math.pow( 1.05946309436, parseInt( input ) );
}

function ftom ( input ) {
  // get the MIDI note number for an input frequency
  // returns an array [midi_note_number, cents_offset]
  input = parseFloat( input );
  var midi_note_number = 69 + ( 12* Math.log2( input / 440 ) );
  var cents_offset = ( midi_note_number - Math.round( midi_note_number ) ) * 100;
  midi_note_number = Math.round( midi_note_number );
  return [ midi_note_number, cents_offset ];
}

function sanitize_filename( input ) {
  // check for empty filename
  if ( input.trim() == "" ) {
    return "tuning";
  }
  return input.replace(/[|&;$%@"<>()+,?]/g, "").replace(/\//g, "_");
}

// clear all
function clear_all() {

  // empty text fields
  $( "#txt_tuning_data" ).val("");
  $( "#txt_name" ).val("");

  // empty any information displayed on page
  $( "#tuning-table" ).empty();
  $( "#debug" ).empty();
  $( "#export-buttons" ).empty();

  // restore default base tuning
  $( "#txt_base_frequency" ).val( 440 );
  $( "#txt_base_midi_note" ).val( 69 );

}

// find MIDI note name from MIDI note number
function midi_note_number_to_name( input ) {
  var n = parseInt( input );
  var quotient = Math.floor( n / 12 );
  var remainder = n % 12;
  var name = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  return name[remainder] + quotient;
}

// generate and display MOS list
// slow but works
function show_mos( per, gen, ssz, threshold) {

  var maxsize = 400; // maximum EDO size to search for MOS
  var roundf = 100000; // rounding factor for interval comparison

    // parsePG(document.getElementById("_per").value); // 'returns' cents in c
    per = line_to_cents( per );
    if ( per <= 0 || isNaN( per ) ) {
        jQuery( "#info_rank_2_mos" ).text( "invalid period" );
        return false;
    }

    // parsePG(document.getElementById("_gen").value);
    gen = line_to_cents( gen );
    if ( gen <= 0 || isNaN( gen ) ) {
        jQuery( "#info_rank_2_mos" ).text( "invalid generator" );
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
        aa.sort(function (a, b) { return a - b } ); // sort ascending

        // must look at not only adjacent intervals ("seconds"), but also "thirds", "fourths", etc.
        for (k = 1; k < i; k ++) {
            // clear arrays
            bb = [];
            cc = [];

            // generate array of intervals (bb)
            for (j = 0; j < i; j++) {
                bb[j] = aa[(j+k)%i] - aa[j];
	        if (j+k >=i) bb[j] += per; // wrap
	    }

            // round intervals (to hopefully avoid false comparisons due to float precision)
            for (j = 0; j < bb.length; j++)
                bb[j] = Math.round(bb[j]*roundf)/roundf;

            // generate array of distinct intervals (cc)
            cc[0] = bb[0]; // gotta start somewhere
            for (j = 1; j < i; j++)
                if ((cc.indexOf(bb[j])) == -1) // bb[j] not found in cc
                    cc.push(bb[j]);
            cc.sort(function (a, b) { return a - b } ); // sort ascending
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

    jQuery( "#info_rank_2_mos" ).text( mos.join(", ") );
}

function debug( msg = "" ) {
  if ( debug_enabled ) {
    msg = ( msg == "" ) ? "Debug" : msg;
    console.log( msg );
    return true;
  }
  return false;
}

function clone(src) {
  return JSON.parse(JSON.stringify(src))
}
