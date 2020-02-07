/*
 * EVENT HANDLERS AND OTHER DOCUMENT READY STUFF
 */

/* global localStorage, jQuery, alert, confirm */
import {
  debug,
  isEmpty,
  isNil,
  openDialog,
  clear_all,
  trimSelf,
  isLocalStorageAvailable,
  isRunningOnWindows
} from './helpers/general.js'
import {
  decimal_to_cents,
  line_to_decimal,
  mtof,
  midi_note_number_to_name
} from './helpers/converters.js'
import {
  getCF,
  getConvergents,
  getCoprimes,
  get_rank2_mode,
  get_rational_approximations,
  load_approximations
} from './helpers/sequences.js'
import {
  tuning_table,
  newline,
  approx_filter_prime_counter,
  set_key_colors,
  parse_tuning_data,
  parse_url,
  import_scala_scl,
  import_anamark_tun,
  current_approximations,
  newlineTest
} from './scaleworkshop.js'
import { rotate,  closestPrime } from './helpers/numbers.js'
import { touch_kbd_open, touch_kbd_close } from './ui.js'
import { synth, is_qwerty_active } from './synth.js'
import { model } from './model.js'
import { PRIMES, APP_TITLE } from './constants.js'
import {
  modify_update_approximations,
  modify_random_variance,
  modify_mode,
  modify_sync_beating,
  modify_stretch,
  modify_replace_with_approximation
} from './modifiers.js'
import { update_page_url } from './exporters.js'
import { Keymap } from './keymap.js'
import { run_user_scripts_on_document_ready } from './user.js'
import {
  generate_enumerate_chord,
  generate_equal_temperament,
  generate_harmonic_series_segment,
  generate_rank_2_temperament,
  generate_subharmonic_series_segment,
  load_preset_scale
} from './generators.js'

// generate and display MOS list
// TODO: revise and improve algorithm, refactor
function show_mos_cf(per, gen, ssz, threshold) {
  var maxsize = 400; // maximum period size
  var maxcfsize = 12; // maximum continued fraction length

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

  cf = getCF(genlog, maxcfsize);
  getConvergents(cf, nn, dd, maxsize);

  // filter by step size threshold
  var gc = decimal_to_cents(gen);
  var pc = decimal_to_cents(per);
  var L = pc + gc; // Large step
  var s = pc; // small step
  var c = gc; // chroma (L - s)

  for (let i = 1; i < cf.length; i++) {
    L -= c * cf[i];
    s = c;
    c = L - s;

    // break if g is some equal division of period
    if (c < (1e-6) && cf.length < maxcfsize) {
      // add size-1 
      // not sure if flaw in the algorithm or weird edge case

      if (dd[dd.length-2] !== dd[dd.length-1]-1)
        dd.splice(dd.length-1, 0, dd[dd.length-1]-1);

      break;
    }

    if (c < threshold) {
      var ind = sum_array(cf, i+1);
      dd.splice(ind+1, dd.length - ind);
      break;
    }
  }

  // the first two periods are trivial
  dd.shift();
  dd.shift();

  jQuery("#info_rank_2_mos").text(dd.join(", "));
}

jQuery( document ).ready( function() {

  // automatically load generatal options saved in localStorage (if available)
  if (isLocalStorageAvailable()) {

    // recall newline format
    if ( isNil(localStorage.getItem("newline")) ) {
      jQuery( '#input_select_newlines' ).val( localStorage.getItem("newline") )
    } else {
      jQuery( '#input_select_newlines' ).val( isRunningOnWindows() ? 'windows' : 'unix' )
    }

    // recall night mode
    if ( localStorage.getItem( 'night_mode' ) === "true" ) {
      jQuery( "#input_checkbox_night_mode" ).trigger( "click" );
      jQuery('body').addClass('dark');
    }

    // recall computer keyboard layout
    if ( !isNil(localStorage.getItem( 'keybd_region' )) ) {
      jQuery( "#input_select_keyboard_layout" ).val( localStorage.getItem( 'keybd_region' ) );
      synth.keymap = Keymap[localStorage.getItem( 'keybd_region' )];
    }

  } else {
      debug( 'localStorage not supported in your browser. Please check your browser settings. If using Safari, you may need to disable private browsing mode.' );
  }

  // get data encoded in url
  parse_url();

  // base MIDI note changed
  jQuery( "#txt_base_midi_note" ).change( function() {

    // update MIDI note name
    jQuery( "#base_midi_note_name" ).text( midi_note_number_to_name( jQuery( "#txt_base_midi_note" ).val() ) );

  } );

  // clear button clicked
  jQuery( "#btn_clear" ).click( function( event ) {

    event.preventDefault();

    var response = confirm( "Are you sure you want to clear the current tuning data?" );

    if ( response ) {
      clear_all();
    }

  } );

  // auto frequency button clicked
  jQuery( "#btn_frequency_auto" ).click( function( event ) {

    event.preventDefault();
    jQuery("#txt_base_frequency").val( mtof( jQuery("#txt_base_midi_note").val() ).toFixed(6) );
    parse_tuning_data();

  } );

  // import scala option clicked
  jQuery( "#import-scala-scl" ).click( function( event ) {
    event.preventDefault();
    import_scala_scl();
  } );

  // import anamark tun option clicked
  jQuery( "#import-anamark-tun" ).click( function( event ) {
    event.preventDefault();
    import_anamark_tun();
  } );

  // generate_equal_temperament option clicked
  jQuery( "#generate_equal_temperament" ).click( function( event ) {
    event.preventDefault();
    jQuery( "#input_number_of_divisions" ).select();
    openDialog("#modal_generate_equal_temperament", generate_equal_temperament)
  } );

  // generate_rank_2_temperament option clicked
  jQuery( "#generate_rank_2_temperament" ).click( function( event ) {
    event.preventDefault();
    jQuery( "#input_rank-2_generator" ).select();
    openDialog("#modal_generate_rank_2_temperament", generate_rank_2_temperament)
  } );

  // rank-2 temperament generator - generators up changed
  jQuery( '#input_rank-2_up' ).change( function() {
    jQuery( '#input_rank-2_down' ).val( jQuery( '#input_rank-2_size' ).val() - jQuery( '#input_rank-2_up' ).val() - 1 );
  } );

  // rank-2 temperament generator - scale size changed
  jQuery( '#input_rank-2_size' ).change( function() {

    var size = parseInt( jQuery( '#input_rank-2_size' ).val() );
    // set generators up to be one less than scale size
    jQuery( '#input_rank-2_up' ).val( size - 1 );
    // set generators up input maximum
    jQuery( '#input_rank-2_up' ).attr({ "max" : size - 1 });
    // zero generators down
    jQuery( '#input_rank-2_down' ).val( 0 );
  } );

  // generate_harmonic_series_segment option clicked
  jQuery( "#generate_harmonic_series_segment" ).click( function( event ) {
    event.preventDefault();
    jQuery( "#input_lowest_harmonic" ).select();
    openDialog("#modal_generate_harmonic_series_segment", generate_harmonic_series_segment)
  } );

  // generate_subharmonic_series_segment option clicked
  jQuery( "#generate_subharmonic_series_segment" ).click( function( event ) {
    event.preventDefault();
    jQuery( "#input_lowest_subharmonic" ).select();
    openDialog("#modal_generate_subharmonic_series_segment", generate_subharmonic_series_segment)
  } );

// enumerate_chord option clicked
  jQuery( "#enumerate_chord" ).click( function( event ) {
    event.preventDefault();
    jQuery( "#input_chord" ).select();
    jQuery( "#modal_enumerate_chord" ).dialog({
      modal: true,
      buttons: {
        OK: function() {
          generate_enumerate_chord();
        },
        Cancel: function() {
          jQuery( this ).dialog( 'close' );
        }
      }
    } );
  } );

  // load-preset option clicked
  jQuery( "#load-preset" ).click( function( event ) {
    event.preventDefault();
    jQuery( "#select_preset_scale" ).select();
    openDialog("#modal_load_preset_scale", function() {
      load_preset_scale( jQuery('#select_preset_scale')[0].value );
    })
  } );

  // modify_mode option clicked
  jQuery( "#modify_mode" ).click( function( event ) {
    event.preventDefault();
    // setup MOS options, and hide
    update_modify_mode_mos_generators();
    show_modify_mode_mos_options(document.querySelector('input[name="mode_type"]:checked').value);
    jQuery( "#modal_modify_mos_degree").change(); // make sizes available
    jQuery( "#input_modify_mode" ).select();
    openDialog("#modal_modify_mode", modify_mode)
  } );

  // modify_stretch option clicked
  jQuery( "#modify_stretch" ).click( function( event ) {
    event.preventDefault();
    jQuery( "#input_stretch_ratio" ).select();
    openDialog("#modal_modify_stretch", modify_stretch)
  } );

  // modify_random_variance option clicked
  jQuery( "#modify_random_variance" ).click( function( event ) {
    event.preventDefault();
    jQuery( "#input_cents_max_variance" ).select();
    openDialog("#modal_modify_random_variance", modify_random_variance)
  } );

  // modify_sync_beating option clicked
  jQuery( "#modify_sync_beating" ).click( function( event ) {
    event.preventDefault();
    openDialog("#modal_modify_sync_beating", modify_sync_beating)
  } );


  // approximate option clicked
  jQuery( "#modify_approximate" ).click( function( event ) {
    event.preventDefault();
    trimSelf("#txt_tuning_data");

    jQuery( "#input_scale_degree" ).val(1);
    jQuery( "#input_scale_degree" ).attr( { "min" : 1, "max" : tuning_table.note_count - 1 });

    jQuery( "#input_scale_degree" ).select();
    jQuery( "#input_scale_degree" ).trigger("change");

    jQuery( "#modal_approximate_intervals" ).dialog({
      modal: true,
      buttons: {
        Apply: function() {
          modify_replace_with_approximation();
        },
        Close: function() {
          jQuery( this ).dialog( 'close' );
        }
      }
    } );
  } );

  // calculate and list rational approximations within user parameters
  jQuery( "#input_interval_to_approximate" ).change( function() {
    var interval = line_to_decimal( jQuery ( "#input_interval_to_approximate" ).val() );
    current_approximations.convergent_indicies = [];
    current_approximations.numerators = [];
    current_approximations.denominators = [];
    current_approximations.ratios = [];
    current_approximations.numerator_limits = [];
    current_approximations.denominator_limits = [];
    current_approximations.ratio_limits = [];

    load_approximations(interval);

    modify_update_approximations();
  } );

  // recalculate approximations when scale degree changes
  jQuery( "#input_scale_degree").change( function() {
    trimSelf();
    var index = parseInt( jQuery( '#input_scale_degree' ).val() ) - 1;
    var lines = document.getElementById("txt_tuning_data").value.split(newlineTest);
    jQuery ( "#input_interval_to_approximate" ).val(lines[index]).trigger("change");
  } );

  // refilter approximations when fields change
  jQuery( "#input_min_error, #input_max_error, #input_show_convergents" ).change(modify_update_approximations);

  // refilter approximations when prime limit changes
  // can be improved, but it's a bit tricky!
  jQuery( "#input_approx_min_prime" ).change( function() {
    var num = parseInt(jQuery( "#input_approx_min_prime").val());
    var dif = num - PRIMES[approx_filter_prime_counter[0]];
    if (Math.abs(dif) === 1) {
      if (num < PRIMES[approx_filter_prime_counter[0]]) {
        approx_filter_prime_counter[0]--;
      } else {
        approx_filter_prime_counter[0]++;
      }
    } else {
      approx_filter_prime_counter[0] = PRIMES.indexOf(closestPrime(num));
    }

    jQuery( "#input_approx_min_prime").val(PRIMES[approx_filter_prime_counter[0]]);
    modify_update_approximations();
  } );

  // refilter approximations when prime limit changes
  jQuery( "#input_approx_max_prime" ).change( function() {
    var num = parseInt(jQuery( "#input_approx_max_prime").val());
    var dif = num - PRIMES[approx_filter_prime_counter[1]];
    if (Math.abs(dif) === 1) {
      if (num < PRIMES[approx_filter_prime_counter[1]]) {
        approx_filter_prime_counter[1]--;
      } else {
        approx_filter_prime_counter[1]++;
      }
    } else {
      approx_filter_prime_counter[1] = PRIMES.indexOf(closestPrime(num));
    }

    jQuery( "#input_approx_max_prime").val(PRIMES[approx_filter_prime_counter[1]]);
    modify_update_approximations();
  } );

  // shows or hides MOS mode selection boxes
  function show_modify_mode_mos_options(showOptions) {
    document.getElementById("mos_mode_options").style.display = showOptions === "mos" ?  'block' : 'none';
  }

  jQuery( "#modal_modify_mode").change( function() {
    show_modify_mode_mos_options(document.querySelector('input[name="mode_type"]:checked').value)
  } );

  // repopulates the available degrees for selection
  function update_modify_mode_mos_generators() {
    show_modify_mode_mos_options(document.querySelector('input[name="mode_type"]:checked').value)
    let coprimes = get_coprimes(tuning_table.note_count-1);
    jQuery("#modal_modify_mos_degree").empty();
    for (let d=1; d < coprimes.length-1; d++) {
    var num = coprimes[d];
    var cents = Math.round(decimal_to_cents(tuning_table.tuning_data[num]) * 10e6) / 10.0e6;
    var text = num + " (" + cents + "c)";
    jQuery("#modal_modify_mos_degree").append('<option value="'+num+'">'+text+'</option>');
    }
  }

   // calculate the MOS mode and insert it in the mode input box
  function modify_mode_update_mos_scale() {
    var p = tuning_table.note_count-1;
    var g = parseInt(jQuery("#modal_modify_mos_degree").val());
    var s = parseInt(jQuery("#modal_modify_mos_size").val());
    let mode = get_rank2_mode(p, g, s);
    jQuery("#input_modify_mode").val(mode.join(" "));
  }

  // update the available sizes for selection
  jQuery( "#modal_modify_mos_degree").change( function() {
    let nn = [];
    let dd = [];
    var gp = jQuery("#modal_modify_mos_degree").val() / (tuning_table.note_count-1);
    get_rational_approximations(gp, nn, dd);
    jQuery("#modal_modify_mos_size").empty();
    for (let d=2; d < dd.length-1; d++) {
      var num = dd[d];
      jQuery("#modal_modify_mos_size").append('<option value="'+num+'">'+num+'</option>');
    }
  } );

  // update mode when size is selected
  jQuery( "#modal_modify_mos_size").change( function() {
    modify_mode_update_mos_scale();
  } );

  // move the mode steps back one
  jQuery( "#input_mode_step_left").click( function() {
    var mode = jQuery( "#input_modify_mode" ).val().split(" ");
    rotate(mode, -1);
    jQuery( "#input_modify_mode" ).val(mode.join(" "));
  } );

  // move the mode steps forward one
  jQuery( "#input_mode_step_right").click( function() {
    var mode = jQuery( "#input_modify_mode" ).val().split(" ");
    rotate(mode, 1);
    jQuery( "#input_modify_mode" ).val(mode.join(" "));
  } );

  /*
    // rank-2 temperament generator - scale size changed
  jQuery( '#input_rank-2_size' ).change( function() {

    var size = parseInt( jQuery( '#input_rank-2_size' ).val() );
    // set generators up to be one less than scale size
    jQuery( '#input_rank-2_up' ).val( size - 1 );
    // set generators up input maximum
    jQuery( '#input_rank-2_up' ).attr({ "max" : size - 1 });
    // zero generators down
    jQuery( '#input_rank-2_down' ).val( 0 );
  } );
  */
  // Touch keyboard (#nav_play) option clicked
  jQuery( "#nav_play, #launch-kbd" ).click( function( event ) {

    event.preventDefault();
    // close or open the touch keyboard depending on if it is already visible
    ( jQuery( "#virtual-keyboard" ).is(":visible") ) ? touch_kbd_close() : touch_kbd_open();

  } );

  // hide virtual keyboard when mobile hamburger menu button is clicked
  jQuery( "button.navbar-toggle" ).click( function( event ) {
    if ( jQuery( "#virtual-keyboard" ).is(":visible") ) {
      jQuery( "#virtual-keyboard" ).slideUp();
    }
  } );

  // Touch keyboard clicked with mouse
  jQuery( "#virtual-keyboard" ).click( function() {
    touch_kbd_close();
  } );

  // About Scale Workshop option clicked
  jQuery( "#about_scale_workshop" ).click( function(event) {

    event.preventDefault();
    jQuery('#about_version').text( APP_TITLE );
    jQuery( "#modal_about_scale_workshop" ).dialog({
      modal: true,
      width: 500,
      buttons: {
        OK: function() {
          jQuery( this ).dialog( 'close' );
        }
      }
    });
  } );

  // Panic button
  jQuery( "#btn_panic" ).click( function( event ) {
    event.preventDefault();
    synth.panic(); // turns off all playing synth notes
  } );

  // General Settings - Line ending format (newlines)
  jQuery( '#input_select_newlines' ).change( function( event ) {
    if ( jQuery( '#input_select_newlines' ).val() === "windows" ) {
      newline = "\r\n"; // windows
      localStorage.setItem( 'newline', 'windows' );
    }
    else {
      newline = "\n"; // unix
      localStorage.setItem( 'newline', 'unix' );
    }
    debug( jQuery( '#input_select_newlines' ).val() + ' line endings selected' );
  } );

  // General Settings - Night mode
  jQuery( "#input_checkbox_night_mode" ).change( function( event ) {
    if ( jQuery( "#input_checkbox_night_mode" ).is(':checked') ) {
      jQuery('body').addClass('dark');
      localStorage.setItem( 'night_mode', true );
    }
    else {
      jQuery('body').removeClass('dark');
      localStorage.setItem( 'night_mode', false );
    }
  } );

  // ------------------------------------
  // old version

  /*
  // Synth Settings - Main Volume
  jQuery(document).on('input', '#input_range_main_vol', function() {
    const gain = jQuery(this).val();
    synth.setMainVolume(gain)
  });
  */

  // ------------------------------------
  // new version

  // data changed, handle programmatic reaction - no jQuery
  model.on('change', (key, newValue) => {
    if (key === 'main volume') {
      synth.setMainVolume(newValue)
    }
  })

  // data changed, sync it with the DOM
  model.on('change', (key, newValue) => {
    if (key === 'main volume') {
      jQuery('#input_range_main_vol').val(newValue)
    }
  })

  // DOM changed, need to sync it with model
  jQuery('#input_range_main_vol').on('input', function() {
    model.set('main volume', parseFloat(jQuery(this).val()))
  });

  // ------------------------------------

  // Synth Settings - Waveform
  jQuery( "#input_select_synth_waveform" ).change( function( event ) {
    synth.waveform = jQuery( '#input_select_synth_waveform' ).val();
    update_page_url();
  } );


  // Synth Settings - Amplitude Envelope
  jQuery( "#input_select_synth_amp_env" ).change( function( event ) {
    update_page_url();
  } );


  // Synth Settings - Delay
  jQuery( "#input_checkbox_delay_on" ).change( function() {
    if (jQuery(this).is(':checked')) {
      synth.delay.enable()
    } else {
      synth.delay.disable()
    }
  } );

  jQuery(document).on('input', '#input_range_feedback_gain', function() {
    synth.delay.gain = jQuery(this).val();
    debug(synth.delay.gain);
    const now = synth.now()
    synth.delay.gainL.gain.setValueAtTime(synth.delay.gain, now);
    synth.delay.gainR.gain.setValueAtTime(synth.delay.gain, now);
  });

  jQuery(document).on('change', '#input_range_delay_time', function() {
    synth.delay.time = jQuery(this).val() * 0.001;
    const now = synth.now()
    synth.delay.channelL.delayTime.setValueAtTime( synth.delay.time, now );
    synth.delay.channelR.delayTime.setValueAtTime( synth.delay.time, now );
  });
  jQuery(document).on('input', '#input_range_delay_time', function() {
    jQuery( "#delay_time_ms" ).text( jQuery(this).val() );
  });



  // Isomorphic Settings - Keyboard Layout
  jQuery( "#input_select_keyboard_layout" ).change( function( event ) {
    var id = jQuery( '#input_select_keyboard_layout' ).val();
    synth.keymap = Keymap[id];
    localStorage.setItem( 'keybd_region', id );
  } );



  // Isomorphic Settings - Isomorphic Mapping
  jQuery( "#input_number_isomorphicmapping_vert" ).change( function( event ) {
    synth.isomorphicMapping.vertical = jQuery( '#input_number_isomorphicmapping_vert' ).val();
  } );
  jQuery( "#input_number_isomorphicmapping_horiz" ).change( function( event ) {
    synth.isomorphicMapping.horizontal = jQuery( '#input_number_isomorphicmapping_horiz' ).val();
  } );



  // Isomorphic Settings - Key colors
  jQuery( "#input_key_colors" ).change( function( event ) {
    set_key_colors( jQuery( "#input_key_colors" ).val() );
    // update this change in the browser's Back/Forward navigation
    update_page_url();

  } );
  // initialise key colors. defaults to Halberstadt layout on A
  set_key_colors( jQuery( "#input_key_colors" ).val() );



  // Isomorphic Settings - Key colors Auto button clicked
  jQuery( "#btn_key_colors_auto" ).click( function( event ) {

    event.preventDefault();
    var size = tuning_table['note_count'] - 1;
    var colors = "";

    // fall back in some situations
    if ( size < 2 ) {

      if ( isEmpty(jQuery( "#input_key_colors" ).val()) ) {
        // field is empty so we'll apply a sensible default key colouring
        jQuery( "#input_key_colors" ).val( "white black white white black white black white white black white black" );
        set_key_colors( jQuery( "#input_key_colors" ).val() );
        return true;
      }

      // field already has content so we'll do nothing
      return false;
    }

    switch ( size.toString() ) {

      case "9":
        colors = "white white black black white white black black white";
        break;

      case "10":
        colors = "white black white white white black white white black white";
        break;

      case "11":
        colors = "white black white black white black white black white black white";
        break;

      case "12":
        colors = "white black white white black white black white white black white black";
        break;

      case "13":
        colors = "antiquewhite white black white black white white black white white black white black";
        break;

      case "14":
        colors = "white black white black white black white white black white black white black white";
        break;

      case "15":
        colors = "white black white black white black white black white black white black white black white";
        break;

      case "16":
        colors = "white black white black white black white white black white black white black white black white";
        break;

      case "17":
        colors = "white black black white white black black white black black white white black black white black black";
        break;

      case "18":
        colors = "white black black white black white black black white black white black black white black black white black";
        break;

      case "19":
        colors = "white black grey white black grey white black white black grey white black grey white black grey white black white";
        break;

      case "20":
        colors = "white white black black white white black black white white black black white white black black white white black black";
        break;

      case "21":
        colors = "white black black white black black white black black white black black white black black white black black white black black";
        break;

      case "22":
        colors = "white black white black white black white black white black white white black white black white black white black white black white";
        break;

      case "23":
        colors = "white black black black white black black white black black white black black white black black white black black black white black black black";
        break;

      case "24":
        colors = "white lightgrey black dimgrey white lightgrey white lightgrey black dimgrey white lightgrey black dimgrey white lightgrey white lightgrey black dimgrey white lightgrey black dimgrey";
        break;

      default: {
        // assemble a key colouring for any arbitrary scale size
        let sequenceOfColors = []
        for (let i = 0; i < Math.floor(size / 2); i++) {
          sequenceOfColors.push("white", "black")
        }
        if (size % 2 === 1) {
          sequenceOfColors.push("white")
        }
        colors = sequenceOfColors.join(' ')
      }
      break;

    }

    jQuery( "#input_key_colors" ).val( colors );
    set_key_colors( colors );
    // update this change in the browser's Back/Forward navigation
    update_page_url();
    return true;

  } );



  // Social Icons
  // Email
  jQuery( "a.social-icons-email" ).click( function( event ) {
    event.preventDefault();
    var email = '';
    var subject = encodeURIComponent( 'Scale Workshop - ' + jQuery( '#txt_name' ).val() );
    var emailBody = encodeURIComponent( "Sending you this musical scale:" + newline + jQuery( '#txt_name' ).val() + newline + newline + "The link below has more info:" + newline + newline + jQuery( '#input_share_url' ).val() );
    window.location = 'mailto:' + email + '?subject=' + subject + '&body=' + emailBody;
  } );
  // Twitter
  jQuery( "a.social-icons-twitter" ).click( function( event ) {
    event.preventDefault();
    var text = encodeURIComponent( jQuery( '#txt_name' ).val() + ' ♫ ' );
    var url = encodeURIComponent( jQuery( '#input_share_url' ).val() );
    window.open( 'https://twitter.com/intent/tweet?text=' + text + url );
  } );

  // parse tuning data when changes are made
  jQuery( "#txt_name, #txt_tuning_data, #txt_base_frequency, #txt_base_midi_note, #input_select_newlines" ).change( function() {
    parse_tuning_data();
  } );

  // handle QWERTY key active indicator
  is_qwerty_active();
  jQuery( "input,textarea" ).focusin( is_qwerty_active );
  jQuery( "input,textarea" ).focusout( is_qwerty_active );

  // Remove splash screen
  jQuery( "div#splash" ).fadeOut();

  // now everything is initialised we finally run any custom user scripts
  run_user_scripts_on_document_ready();
} ); // end of document ready block
