/*
 * EVENT HANDLERS AND OTHER DOCUMENT READY STUFF
 */

jQuery( document ).ready( function() {

  // automatically load generatal options saved in localStorage (if available)
  if (!isNil(Storage)) {

    // recall newline format
    if ( !isNil(localStorage.getItem("newline")) ) {
      jQuery( '#input_select_newlines' ).val( localStorage.getItem("newline") );
    } else {
      debug("localStorage: assuming default of windows");
      jQuery( '#input_select_newlines' ).val( "windows" );
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

    var r = confirm( "Are you sure you want to clear the current tuning data?" );

    if ( r ) {
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
    jQuery( "#modal_generate_equal_temperament" ).dialog({
      modal: true,
      buttons: {
        OK: function() {
          generate_equal_temperament();
        },
        Cancel: function() {
          jQuery( this ).dialog( 'close' );
        }
      }
    });

  } );

  // generate_rank_2_temperament option clicked
  jQuery( "#generate_rank_2_temperament" ).click( function( event ) {

    event.preventDefault();
    jQuery( "#input_rank-2_generator" ).select();
    jQuery( "#modal_generate_rank_2_temperament" ).dialog({
      modal: true,
      buttons: {
        OK: function() {
          generate_rank_2_temperament();
        },
        Cancel: function() {
          jQuery( this ).dialog( 'close' );
        }
      }
    });

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
    jQuery( "#modal_generate_harmonic_series_segment" ).dialog({
      modal: true,
      buttons: {
        OK: function() {
          generate_harmonic_series_segment();
        },
        Cancel: function() {
          jQuery( this ).dialog( 'close' );
        }
      }
    });

  } );

  // generate_subharmonic_series_segment option clicked
  jQuery( "#generate_subharmonic_series_segment" ).click( function( event ) {

    event.preventDefault();
    jQuery( "#input_lowest_subharmonic" ).select();
    jQuery( "#modal_generate_subharmonic_series_segment" ).dialog({
      modal: true,
      buttons: {
        OK: function() {
          generate_subharmonic_series_segment();
        },
        Cancel: function() {
          jQuery( this ).dialog( 'close' );
        }
      }
    });

  } );

  // load-preset option clicked
  jQuery( "#load-preset" ).click( function( event ) {

    event.preventDefault();
    jQuery( "#select_preset_scale" ).select();
    jQuery( "#modal_load_preset_scale" ).dialog({
      modal: true,
      buttons: {
        OK: function() {
          load_preset_scale( jQuery('#select_preset_scale')[0].value );
        },
        Cancel: function() {
          jQuery( this ).dialog( 'close' );
        }
      }
    });

  } );

  // modify_mode option clicked
  jQuery( "#modify_mode" ).click( function( event ) {

    event.preventDefault();
    jQuery( "#input_modify_mode" ).select();
    jQuery( "#modal_modify_mode" ).dialog({
      modal: true,
      buttons: {
        OK: function() {
          modify_mode();
        },
        Cancel: function() {
          jQuery( this ).dialog( 'close' );
        }
      }
    });

  } );

  // modify_stretch option clicked
  jQuery( "#modify_stretch" ).click( function( event ) {

    event.preventDefault();
    jQuery( "#input_stretch_ratio" ).select();
    jQuery( "#modal_modify_stretch" ).dialog({
      modal: true,
      buttons: {
        OK: function() {
          modify_stretch();
        },
        Cancel: function() {
          jQuery( this ).dialog( 'close' );
        }
      }
    });

  } );

  // modify_random_variance option clicked
  jQuery( "#modify_random_variance" ).click( function( event ) {

    event.preventDefault();
    jQuery( "#input_cents_max_variance" ).select();
    jQuery( "#modal_modify_random_variance" ).dialog({
      modal: true,
      buttons: {
        OK: function() {
          modify_random_variance();
        },
        Cancel: function() {
          jQuery( this ).dialog( 'close' );
        }
      }
    });

  } );

  // modify_sync_beating option clicked
  jQuery( "#modify_sync_beating" ).click( function( event ) {

    event.preventDefault();
    jQuery( "#modal_modify_sync_beating" ).dialog({
      modal: true,
      buttons: {
        OK: function() {
          modify_sync_beating();
        },
        Cancel: function() {
          jQuery( this ).dialog( 'close' );
        }
      }
    });

  } );

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
  jQuery( "#about_scale_workshop" ).click( function() {

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
    if ( jQuery( '#input_select_newlines' ).val() == "windows" ) {
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



  // Synth Settings - Main Volume
  jQuery(document).on('input', '#input_range_main_vol', function() {
    const gain = jQuery(this).val();
    const now = synth.now();
    synth.masterGain.gain.value = gain;
    synth.masterGain.gain.setValueAtTime(gain, now);
  });



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
    if ($(this).is(':checked')) {
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

      default:
        // assemble a key colouring for any arbitrary scale size
        for ( i = 0; i < size; i++ ) {
          colors += ( i % 2 == 0 ) ? "white " : "black ";
        }
        // trim ending space
        colors = colors.slice(0, -1);
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
