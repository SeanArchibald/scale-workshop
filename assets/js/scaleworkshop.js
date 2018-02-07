/**
 * GLOBALS
 */

const APP_TITLE = "Scale Workshop 0.8";
const TUNING_MAX_SIZE = 128;
var newline = "\r\n";
var tuning_table = {
  tuning_data: [], // an array containing tuning data user input in decimal format
  note_count: 0, // number of values stored in tuning_data
  freq: [], // an array containing the frequency of each MIDI note
  cents: [], // an array containing the cents value for each MIDI note
  decimal: [], // an array containing the frequency ratio expressed as decimal for each MIDI note
  base_frequency: 440, // init val
  base_midi_note: 69, // init val
  description: "",
  filename: ""
};

/**
 * SCALE WORKSHOP FUNCTIONS
 */

// take a tuning, do loads of calculations, then output the data to tuning_table
function generate_tuning_table( tuning ) {

  var base_frequency = tuning_table['base_frequency'];
  var base_midi_note = tuning_table['base_midi_note'];

  for ( i = 0; i < TUNING_MAX_SIZE; i++ ) {

    var offset = i - base_midi_note;
    var quotient = Math.floor( offset / (tuning.length-1) );
    var remainder = offset % (tuning.length-1);
    if ( remainder < 0 ) remainder += tuning.length-1;
    var period = tuning[ tuning.length-1 ];
    // "decimal" here means a frequency ratio, but stored in decimal format
    var decimal = tuning[ remainder ] * Math.pow( period, quotient );

    // store the data in the tuning_table object
    tuning_table['freq'][i] = base_frequency * decimal;
    tuning_table['cents'][i] = decimal_to_cents( decimal );
    tuning_table['decimal'][i] = decimal;

  }

}


/**
 * parse_url()
 */

function parse_url() {

  // name=5%20EDO&data=1%5C5%0A480.%0A720.%0A960.%0A2%2F1&freq=261.626&midi=60
  var url = new URL(window.location.href);

  // get data from url params, and use sane defaults for tuning name, base frequency and base midi note number if data missing
  var name = ( url.searchParams.has("name") ) ? url.searchParams.get("name") : "";
  var data = ( url.searchParams.has("data") ) ? url.searchParams.get("data") : false;
  var freq = ( url.searchParams.has("freq") && !isNaN( url.searchParams.get("freq") ) ) ? url.searchParams.get("freq") : 440;
  var midi = ( url.searchParams.has("midi") && !isNaN( url.searchParams.get("midi") ) ) ? url.searchParams.get("midi") : 69;

  // bail if there is no data
  if ( !data ) {
    return false;
  }

  // enter the data from url in to the on-page form
  jQuery( "#txt_name" ).val(name);
  jQuery( "#txt_tuning_data" ).val(data);
  jQuery( "#txt_base_frequency" ).val(freq);
  jQuery( "#txt_base_midi_note" ).val(midi);

  // parse the tuning data
  if ( parse_tuning_data() ) {
    // success
    return true;
  }
  else {
    // something probably wrong with the input data
    return false;
  }

}


/**
 * parse_tuning_data()
 */

function parse_tuning_data() {
  // http://www.huygens-fokker.org/scala/scl_format.html

  tuning_table['base_midi_note'] = parseInt ( $( "#txt_base_midi_note" ).val() );
  tuning_table['base_frequency'] = parseFloat ( $( "#txt_base_frequency" ).val() );
  tuning_table['description'] = $( "#txt_name" ).val();
  tuning_table['filename'] = sanitize_filename( tuning_table['description'] );

  var user_tuning_data = document.getElementById("txt_tuning_data");

  // check if user pasted a scala file
  // we check if the first character is !
  if ( user_tuning_data.value.charAt(0) == "!" ) {
    alert('Hello, trying to paste a Scala file into this app?\nPlease use the \'Load\' function instead or remove the first few lines (description) from the text box');
    return false;
  }

  // split user data into individual lines
  var lines = user_tuning_data.value.split("\n");

  // strip out the unusable lines, assemble an array of usable tuning data
  tuning_table['tuning_data'] = ['1']; // when initialised the array contains only '1' (unison)
  tuning_table['note_count'] = 1;
  for ( var i = 0; i < lines.length; i++ ) {

    // check that line is not empty
    if ( lines[i] !== "" ) {

      if ( line_type( lines[i] ) == false ) {
        return false;
      }

      // so far so good - store the line in tuning array
      tuning_table['tuning_data'][ tuning_table['note_count'] ] = line_to_decimal( lines[i] );
      tuning_table['note_count']++;

    }

  }

  // finally, generate the frequency table
  generate_tuning_table( tuning_table['tuning_data'] );

  // display generated tuning in a table on the page
  $( "#tuning-table" ).empty();
  $( "#tuning-table" ).append("<tbody><tr><th>#</th><th>Freq.</th><th>Cents</th><th>Ratio</th></tr>");

  for ( i = 0; i < TUNING_MAX_SIZE; i++ ) {

    // highlight the row which corresponds to the base MIDI note
    var table_class = "";
    if ( i == tuning_table['base_midi_note'] ) {
      table_class = "info";
    }
    else {
      if ( ( tuning_table['base_midi_note'] - i ) % (tuning_table['note_count']-1) == 0 ) {
        table_class = "warning";
      }
    }

    // assemble the HTML for the table row
    $( "#tuning-table" ).append("<tr class=" + table_class + "><td>" + i + "</td><td>" + parseFloat( tuning_table['freq'][i] ).toFixed(3) + " Hz</td><td>" + tuning_table['cents'][i].toFixed(3) + "</td><td>" + tuning_table['decimal'][i].toFixed(3) + "</td></tr>");

  }

  $( "#tuning-table" ).append("</tbody>");

  // remove Export buttons
  $( "#export-buttons" ).empty();

  // this block of functions will export the tuning data in various formats
  // and display an export button for each format
  export_anamark_tun();
  export_scala_scl();
  export_scala_kbm();
  export_maxmsp_coll();
  export_kontakt_script();
  export_url();

  // success
  return true;

}

/**
 * TUNING IMPORT/EXPORT FUNCTIONS
 */

function import_scala_scl() {

  // Check for the various File API support.
  if (window.File && window.FileReader && window.FileList && window.Blob) {
    console.log('Your browser supports all the File APIs. Nice.');
  } else {
    // File API not supported
    alert('Trying to load a file? Sorry, your browser doesn\'t support the HTML5 File API. Please try using a different browser.');
    return false;
  }

  // trigger load file dialog
  $( "#scala-file" ).trigger('click');

}

// after a scala file is loaded, this function will be called
function parse_imported_scala_scl( event ) {

  var input = event.target;

  // bail if user didn't actually load a file
  if ( input.files[0] == null ) {
    return false;
  }

  // read the file
  var reader = new FileReader();
  var scala_file = reader.readAsText(input.files[0]);

  reader.onload = function(){

    // get filename
    $( "#txt_name" ).val( input.files[0].name.slice(0, -4) );

    scala_file = reader.result;

    // split scala_file data into individual lines
    var lines = scala_file.split("\n");

    // determine the first line of scala_file that contains tuning data
    var first_line = 0;
    for ( i = 0; i < lines.length; i++ ) {
      if ( lines[i].charAt(0) == '!' ) {
        first_line = i + 1;
      }
    }

    // clear existing tuning data from interface
    var tuning_data = jQuery( "#txt_tuning_data" );
    tuning_data.val("");

    // copy tuning data from .scl file
    for ( i = first_line; i < lines.length; i++ ) {

      tuning_data.val( tuning_data.val() + lines[i].trim() );

      // add newlines
      if ( i < (lines.length-1) ) {
        tuning_data.val( tuning_data.val() + "\n" );
      }

    }

    $( "#btn_parse" ).trigger( "click" );

  };

}
