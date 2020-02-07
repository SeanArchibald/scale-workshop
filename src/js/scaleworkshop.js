/**
 * INIT
 */

/* global location, localStorage, alert, FileReader, DOMParser, jQuery */
import {
  debug,
  redirectToHTTPS,
  isEmpty,
  getSearchParamOr,
  getSearchParamAsNumberOr,
  getLineType,
  isNil
} from './helpers/general.js'
import {
  decimal_to_cents,
  line_to_decimal,
  sanitize_filename,
} from './helpers/converters.js'
import { show_mos_cf } from './helpers/events.js'
import { synth } from './synth.js'
import { LINE_TYPE, TUNING_MAX_SIZE } from './constants.js'
import {
  get_scale_url,
  update_page_url,
  export_anamark_tun,
  export_scala_scl,
  export_scala_kbm,
  export_maxmsp_coll,
  export_pd_text,
  export_kontakt_script,
  export_reference_deflemask,
  export_url
} from './exporters.js'

// check if coming from a Back/Forward history navigation.
// need to reload the page so that url params take effect
jQuery(window).on('popstate', function() {
  debug('Back/Forward navigation detected - reloading page');
  location.reload(true);
} );

if (window.location.hostname.endsWith('.github.com') || window.location.hostname.endsWith('sevish.com')) {
  redirectToHTTPS()
}

/**
 * GLOBALS
 */

let newline = localStorage && localStorage.getItem('newline') === 'windows' ? '\r\n' : '\n'
const newlineTest = /\r?\n/;
const unix_newline = '\n'
var tuning_table = {
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
var key_colors = [ "white", "black", "white", "white", "black", "white", "black", "white", "white", "black", "white", "black" ];

var stagedRank2Structure; // Used for holding data regarding available MOS sizes & more
var currentRatioStructure; // Used for storing data regarding ratio approximations
var currentRatioPrimeLimits;  // Holds prime limits of current ratio approximation
var approximationFilterPrimeCount = [0, 10];

var debug_enabled = true;

/**
 * SCALE WORKSHOP FUNCTIONS
 */

// take a tuning, do loads of calculations, then output the data to tuning_table
function generate_tuning_table( tuning ) {

  var base_frequency = tuning_table['base_frequency'];
  var base_midi_note = tuning_table['base_midi_note'];

  for ( let i = 0; i < TUNING_MAX_SIZE; i++ ) {

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

function set_key_colors( list ) {

  // check if the list of colors is empty
  if ( isEmpty(list) ) {
    // bail, leaving the previous colors in place
    return false;
  }

  key_colors = list.split(" ");

  // get all the tuning table key cell elements
  var ttkeys = jQuery( '#tuning-table td.key-color' );
  // for each td.key-color
  for ( let i = 0; i < TUNING_MAX_SIZE; i++ ) {
    // get the number representing this key color, with the first item being 0

    var keynum = ( i - tuning_table['base_midi_note'] ).mod( key_colors.length );
    // set the color of the key
    jQuery( ttkeys[i] ).attr( "style", "background-color: " + key_colors[keynum] + " !important" );
    //debug( i + ": " + key_colors[keynum] );
  }
}

/**
 * parse_url()
 */

function parse_url() {

  // ?name=16%20equal%20divisions%20of%202%2F1&data=75.%0A150.%0A225.%0A300.%0A375.%0A450.%0A525.%0A600.%0A675.%0A750.%0A825.%0A900.%0A975.%0A1050.%0A1125.%0A1200.&freq=440&midi=69&vert=5&horiz=1&colors=white%20black%20white%20black%20white%20black%20white%20white%20black%20white%20black%20white%20black%20white%20black%20white&waveform=sine&ampenv=pad
  var url = new URL(window.location.href);

  // get data from url params, and use sane defaults for tuning name, base frequency and base midi note number if data missing
  var name = getSearchParamOr('', 'name', url);
  var data = getSearchParamOr(false, 'data', url);
  var freq = getSearchParamAsNumberOr(440, 'freq', url);
  var midi = getSearchParamAsNumberOr(69, 'midi', url);
  var source =  getSearchParamOr('', 'source', url);

  // get isomorphic keyboard mapping
  var vertical = getSearchParamAsNumberOr(false, 'vert', url);
  var horizontal = getSearchParamAsNumberOr(false, 'horiz', url);

  // get key colours
  var colors = getSearchParamOr(false, 'colors', url);

  // get synth options
  var waveform = getSearchParamOr(false, 'waveform', url);
  var ampenv = getSearchParamOr(false, 'ampenv', url);

  // bail if there is no data
  if ( !data ) {
    return false;
  }

  // decodes HTML entities
  function decodeHTML(input) {
    var doc = new DOMParser().parseFromString(input, "text/html");
    return doc.documentElement.textContent;
  }

  // parses Scala entries from the Xenharmonic Wiki
  function parseWiki(str) {
    var s = decodeHTML(str);
    s = s.replace(/[_ ]+/g, ''); // remove underscores and spaces
    var a = s.split(newlineTest); // split by line into an array
    a = a.filter(line => !line.startsWith('<') && !line.startsWith('{') && !isEmpty(line)); // remove <nowiki> tag, wiki templates and blank lines
    a = a.map(line => line.split('!')[0]); // remove .scl comments
    a = a.slice(2); // remove .scl metadata
    return a.join(unix_newline);
  }

  // specially parse inputs from the Xenharmonic Wiki
  if (source === "wiki") {
    data = parseWiki(data);
  }

  // enter the data from url in to the on-page form
  jQuery( "#txt_name" ).val(name);
  jQuery( "#txt_tuning_data" ).val(data);
  jQuery( "#txt_base_frequency" ).val(freq);
  jQuery( "#txt_base_midi_note" ).val(midi);
  jQuery( "#input_number_isomorphicmapping_vert" ).val(vertical);
  jQuery( "#input_number_isomorphicmapping_horiz" ).val(horizontal);

  // if there is isomorphic keyboard mapping data, apply it
  if ( vertical !== false ) synth.isomorphicMapping.vertical = vertical;
  if ( horizontal !== false ) synth.isomorphicMapping.horizontal = horizontal;

  // parse the tuning data
  if ( parse_tuning_data() ) {

    // if there are key colorings, apply them
    if ( colors !== false ) {
      jQuery( "#input_key_colors" ).val( colors );
      set_key_colors( colors );
    }

    // if there are synth options, apply them
    if ( waveform !== false ) {
      jQuery( '#input_select_synth_waveform' ).val( waveform );
      synth.waveform = waveform;

    }
    if ( ampenv !== false ) jQuery( '#input_select_synth_amp_env' ).val( ampenv );

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

  tuning_table['base_midi_note'] = parseInt ( jQuery( "#txt_base_midi_note" ).val() );
  tuning_table['base_frequency'] = parseFloat ( jQuery( "#txt_base_frequency" ).val() );
  tuning_table['description'] = jQuery( "#txt_name" ).val();
  tuning_table['filename'] = sanitize_filename( tuning_table['description'] );

  var user_tuning_data = document.getElementById("txt_tuning_data");

  // check if user pasted a scala file
  // we check if the first character is !
  if ( user_tuning_data.value.startsWith("!") ) {
    alert('Hello, trying to paste a Scala file into this app?' + unix_newline + 'Please use the \'Import .scl\' function instead or remove the first few lines (description) from the text box');
    jQuery("#txt_tuning_data").parent().addClass("has-error");
    return false;
  }

  // split user data into individual lines
  var lines = user_tuning_data.value.split(newlineTest);

  // strip out the unusable lines, assemble an array of usable tuning data
  tuning_table['tuning_data'] = ['1']; // when initialised the array contains only '1' (unison)
  tuning_table['note_count'] = 1;
  var empty = true;
  for ( let i = 0; i < lines.length; i++ ) {

    // check that line is not empty
    if ( !isEmpty(lines[i]) ) {

      if ( getLineType( lines[i] ) === LINE_TYPE.INVALID ) {
        jQuery("#txt_tuning_data").parent().addClass("has-error");
        return false;
      }

      // so far so good - store the line in tuning array
      tuning_table['scale_data'][ tuning_table['note_count'] ] = lines[i]; // 'scale_data' is the scale in the original format input in the text box
      tuning_table['tuning_data'][ tuning_table['note_count'] ] = line_to_decimal( lines[i] ); // 'tuning_data' is the same as before but all input is converted to decimal format to make the maths easier later
      tuning_table['note_count']++;

      // if we got to this point, then the tuning must not be empty
      empty = false;

    }

  }

  if ( empty ) {
    // if the input tuning is totally empty
    debug("no tuning data");
    jQuery("#txt_tuning_data").parent().addClass("has-error");
    return false;
  }

  // finally, generate the frequency table
  generate_tuning_table( tuning_table['tuning_data'] );

  // display generated tuning in a table on the page
  jQuery( "#tuning-table" ).empty();
  jQuery( "#tuning-table" ).append("<tbody><tr><th class='key-color'></th><th>#</th><th>Freq.</th><th>Cents</th><th>Ratio</th></tr>");

  for ( let i = 0; i < TUNING_MAX_SIZE; i++ ) {

    // highlight the row which corresponds to the base MIDI note
    var table_class = "";
    if ( i === tuning_table['base_midi_note'] ) {
      table_class = "info";
    }
    else {
      if ( ( tuning_table['base_midi_note'] - i ) % (tuning_table['note_count']-1) === 0 ) {
        table_class = "warning";
      }
    }

    // assemble the HTML for the table row
    jQuery( "#tuning-table" ).append("<tr id='tuning-table-row-" + i + "' class='" + table_class + "'><td class='key-color'></td><td>" + i + "</td><td>" + parseFloat( tuning_table['freq'][i] ).toFixed(3) + " Hz</td><td>" + tuning_table['cents'][i].toFixed(3) + "</td><td>" + tuning_table['decimal'][i].toFixed(3) + "</td></tr>");

  }

  jQuery( "#tuning-table" ).append("</tbody>");

  set_key_colors( jQuery( "#input_key_colors" ).val() );

  // scroll to reference note on the table
  jQuery('#col-tuning-table').animate({
    scrollTop: jQuery( "#tuning-table-row-" + tuning_table['base_midi_note'] ).position().top + jQuery('#col-tuning-table').scrollTop()
  }, 600); // 600ms scroll to reference note

  jQuery("#txt_tuning_data").parent().removeClass("has-error");

  // if has changed, convert the scale into a URL then add that URL to the browser's Back/Forward navigation
  var url = get_scale_url();
  if ( url !== window.location.href ) {
    update_page_url( url );
  }

  // success
  return true;

}

/**
 * TUNING IMPORT RELATED FUNCTIONS
 */

function is_file_api_supported() {
  // Check for the various File API support.
  if (window.File && window.FileReader && window.FileList && window.Blob) {
    return true;
  } else {
    // File API not supported
    alert('Trying to load a file? Sorry, your browser doesn\'t support the HTML5 File API. Please try using a different browser.');
    return false;
  }
}

function import_scala_scl() {
  // check File API is supported
  if ( is_file_api_supported() ) {
    // trigger load file dialog
    jQuery( "#scala-file" ).trigger('click');
  }
}

function import_anamark_tun() {
  // check File API is supported
  if ( is_file_api_supported() ) {
    // trigger load file dialog
    jQuery( "#anamark-tun-file" ).trigger('click');
  }
}

// after a scala file is loaded, this function will be called
function parse_imported_scala_scl( event ) {

  var input = event.target;

  // bail if user didn't actually load a file
  if ( isNil(input.files[0]) ) {
    return false;
  }

  // read the file
  var reader = new FileReader();
  var scala_file = reader.readAsText(input.files[0]);

  reader.onload = function(){

    // get filename
    jQuery( "#txt_name" ).val( input.files[0].name.slice(0, -4) );

    scala_file = reader.result;

    // split scala_file data into individual lines
    var lines = scala_file.split(newlineTest);

    // determine the first line of scala file that contains tuning data
    let first_line = lines.lastIndexOf('!') + 1;

    jQuery( "#txt_tuning_data" ).val(lines.slice(first_line).map(line => line.trim()).join(unix_newline))

    parse_tuning_data();

  };

}

// after a tun file is loaded, this function will be called
function parse_imported_anamark_tun( event ) {

  // Note: this is not an AnaMark TUN v2.00 compliant parser! It is incomplete!
  // At the very least, this parser should support cents-based TUN files generated by Scale Workshop & Scala.
  // If anybody wants full TUN v2.00 support, send a pull request
  // Have you read the TUN spec recently?
  // https://www.mark-henning.de/files/am/Tuning_File_V2_Doc.pdf

  var input = event.target;

  // bail if user didn't actually load a file
  if ( isNil(input.files[0]) ) {
    return false;
  }

  // read the file
  var reader = new FileReader();
  var tun_file = reader.readAsText(input.files[0]);

  reader.onload = function(){

    tun_file = reader.result;

    // split tun_file data into individual lines
    var lines = tun_file.split(newlineTest);

    // get tuning name
    var name = false;
    for ( let i = 0; i < lines.length; i++ ) {
      // Check if line is start of [Info] section
      if ( !name && lines[i].includes("[Info]") ) {
        // file has [Info] section so we expect to see a name too
        name = true;
      }
      // We saw an [Info] section during a previous loop so now we're looking for the name
      else {
        if ( lines[i].trim().startsWith("Name") ) {
          // the current line contains the name
          var regex = /"(.*?)"/g;
          name = lines[i].match(regex)[0].replace(/"/g, "").replace(/\.tun/g, "");
          break;
        }
      }
    }
    // If a name couldn't be found within the file, then just grab it from the filename
    if ( name === true || name === false ) {
      debug("this shouldn't be happening right now");
      name = input.files[0].name.slice(0, -4);
    }

    // determine if tun file contains 'Functional Tuning' block and get line number where tuning starts
    var has_functional_tuning = false;
    var first_line = lines.findIndex(line => line.includes("[Functional Tuning]") || line.includes("[Functional tuning]"))
    if (first_line === -1) {
      first_line = 0
    } else {
      first_line += 1
      has_functional_tuning = true
    }

    // it's best to work from the Functional Tuning if available, since it works much like a Scala scale
    if ( has_functional_tuning ) {

      jQuery( "#txt_name" ).val( name );
      var tuning = [];

      // get note values
      for ( let i = first_line; i < lines.length; i++ ) {
        var n = i - first_line; // note number
        if ( lines[i].includes("#=0") ) {
          tuning[n] = lines[i].substring( lines[i].indexOf("#=0") + 6, lines[i].length - 2 ).trim();
        }
        if ( lines[i].includes("#>") ) {
          var m = (n + 1).toString();
          var prefix = "note " + m + "=\"#>-" + m;
          tuning[n] = lines[i].replace( prefix, "" );
          tuning[n] = tuning[n].substring( 3, tuning[n].indexOf("~") ).trim();
        }
      }

      jQuery( "#txt_tuning_data" ).val(tuning.join(unix_newline))

      // get base MIDI note and base frequency
      for ( let i = first_line + 1; i < lines.length; i++ ) {
        if ( lines[i].includes("!") ) {
          jQuery( "#txt_base_frequency" ).val( lines[i].substring( lines[i].indexOf("!") + 2, lines[i].length - 2 ) );
          jQuery( "#txt_base_midi_note" ).val( lines[i].substring( 0, lines[i].indexOf("!") - 2 ).replace( "note ", "" ) );
        }
      }
      parse_tuning_data();
      return true;
    }

    // if there's no functional tuning
    else {
      alert("This looks like a v0 or v1 tun file, which is not currently supported.");
      return false;
      // RIP my willpower
      /*
      alert("Warning: You have imported an older v0 or v1 .TUN file with no [Functional Tuning] data. Scale Workshop will attempt to pull in all 128 notes.");

      var first_line = 0;

      // determine on which line of the tun file that tuning data starts, with preference for 'Exact Tuning' block, followed by 'Tuning' block.
      for ( let i = 0; i < lines.length; i++ ) {
        if ( lines[i].includes("[Exact Tuning]") ) {
          has_functional_tuning = true;
          first_line = i + 1;
          break;
        }
      }
      if ( first_line === 0 ) {
        for ( let i = 0; i < lines.length; i++ ) {
          if ( lines[i].includes("[Tuning]") ) {
            has_functional_tuning = true;
            first_line = i + 1;
            break;
          }
        }
      }

      // this is where things get messy

      // enter tuning data
      var offset = parseFloat( lines[first_line].replace("note 0=", "") ).toFixed(6); // offset will ensure that note 0 is 1/1
      let tuning_data_str;
      for ( let i = first_line; i < first_line+128; i++ ) {

        var n = i - first_line; // n = note number
        var line = lines[i].replace( "note " + n.toString() + "=", "" ).trim();
        line = parseFloat( line ).toFixed(6);
        line = (parseFloat(line) + parseFloat(offset)).toFixed(6);

        if ( n === 0 ) {
          // clear scale field
          tuning_data_str = ''
        }
        else if ( n === 1 ) {
          tuning_data_str += line ;
        }
        else {
          tuning_data_str += unix_newline + line;
        }
      }
      jQuery( "#txt_tuning_data" ).val(tuning_data_str)

      jQuery( "#txt_base_frequency" ).val( 440 / cents_to_decimal(offset) );
      jQuery( "#txt_base_midi_note" ).val( 0 );
      */

    }

  };

}

jQuery('#export-buttons').on('click', 'a', e => {
  e.preventDefault()

  const link = e.target.getAttribute('href').replace(/^#/, '')

  switch(link) {
    case 'anamark-tun':
      export_anamark_tun()
      break
    case 'scala-scl':
      export_scala_scl()
      break
    case 'scala-kbm':
      export_scala_kbm()
      break
    case 'maxmsp-coll':
      export_maxmsp_coll()
      break
    case 'pd-text':
      export_pd_text()
      break
    case 'kontakt-script':
      export_kontakt_script()
      break
    case 'deflemask-reference':
      export_reference_deflemask()
      break
    case 'url':
      export_url()
      break
  }
})

jQuery('#scala-file').on('change', parse_imported_scala_scl)
jQuery('#anamark-tun-file').on('change', parse_imported_anamark_tun)

jQuery('#show-mos').on('click', () => {
  show_mos_cf(
    jQuery('#input_rank-2_period').val(),
    jQuery('#input_rank-2_generator').val(),
    jQuery('#input_rank-2_size').val(),
    jQuery('#input_rank-2_mos_threshold').val()
  )
})

const resetTuningTable = () => {
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
  }
}

export {
  key_colors,
  tuning_table,
  unix_newline,
  newlineTest,
  parse_tuning_data,
  newline,
  debug_enabled,
  stagedRank2Structure,
  currentRatioStructure,
  currentRatioPrimeLimits,
  approximationFilterPrimeCount,
  set_key_colors,
  parse_url,
  import_scala_scl,
  import_anamark_tun,
  resetTuningTable
}
