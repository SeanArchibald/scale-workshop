/*
 * EVENT HANDLERS AND OTHER DOCUMENT READY STUFF
 */

jQuery( document ).ready( function() {

  // automatically load generatal options saved in localStorage (if available)
  if (typeof(Storage) !== "undefined") {

    // recall newline format
    if ( localStorage.getItem("newline") !== null ) {
      $( '#input_select_newlines' ).val( localStorage.getItem("newline") );
    } else {
      debug("localStorage: assuming default of windows");
      $( '#input_select_newlines' ).val( "windows" );
    }

    // recall night mode
    if ( localStorage.getItem( 'night_mode' ) === "true" ) {
      $( "#input_checkbox_night_mode" ).trigger( "click" );
      $('body').addClass('dark');
    }

  } else {
      debug( 'localStorage not supported in your browser. Please check your browser settings. If using Safari, you may need to disable private browsing mode.' );
  }

  // get data encoded in url
  parse_url();

  // base MIDI note changed
  $( "#txt_base_midi_note" ).change( function() {

    // update MIDI note name
    $( "#base_midi_note_name" ).text( midi_note_number_to_name( $( "#txt_base_midi_note" ).val() ) );

  } );

  // clear button clicked
  $( "#btn_clear" ).click( function( event ) {

    event.preventDefault();

    var r = confirm( "Are you sure you want to clear the current tuning data?" );

    if ( r ) {
      clear_all();
    }

  } );

  // auto frequency button clicked
  $( "#btn_frequency_auto" ).click( function( event ) {

    event.preventDefault();
    jQuery("#txt_base_frequency").val( mtof( jQuery("#txt_base_midi_note").val() ).toFixed(6) );
    parse_tuning_data();

  } );

  // import scala option clicked
  $( "#import-scala-scl" ).click( function( event ) {

    event.preventDefault();
    import_scala_scl();

  } );

  // generate_equal_temperament option clicked
  $( "#generate_equal_temperament" ).click( function( event ) {

    event.preventDefault();
    jQuery( "#modal_generate_equal_temperament" ).dialog({
      modal: true,
      buttons: {
        OK: function() {
          generate_equal_temperament();
        },
        Cancel: function() {
          $( this ).dialog( 'close' );
        }
      }
    });

  } );

  // generate_rank_2_temperament option clicked
  $( "#generate_rank_2_temperament" ).click( function( event ) {

    event.preventDefault();
    jQuery( "#modal_generate_rank_2_temperament" ).dialog({
      modal: true,
      buttons: {
        OK: function() {
          generate_rank_2_temperament();
        },
        Cancel: function() {
          $( this ).dialog( 'close' );
        }
      }
    });

  } );

  // generate_harmonic_series_segment option clicked
  $( "#generate_harmonic_series_segment" ).click( function( event ) {

    event.preventDefault();
    jQuery( "#modal_generate_harmonic_series_segment" ).dialog({
      modal: true,
      buttons: {
        OK: function() {
          generate_harmonic_series_segment();
        },
        Cancel: function() {
          $( this ).dialog( 'close' );
        }
      }
    });

  } );

  // generate_subharmonic_series_segment option clicked
  $( "#generate_subharmonic_series_segment" ).click( function( event ) {

    event.preventDefault();
    jQuery( "#modal_generate_subharmonic_series_segment" ).dialog({
      modal: true,
      buttons: {
        OK: function() {
          generate_subharmonic_series_segment();
        },
        Cancel: function() {
          $( this ).dialog( 'close' );
        }
      }
    });

  } );

  // nav_play option clicked
  $( "#nav_play" ).click( function( event ) {

    event.preventDefault();
    jQuery( "#play_screen" ).show();

  } );
  $( "#play_screen_close" ).click( function( event ) {

    event.preventDefault();
    jQuery( "#play_screen" ).hide();

  } );

  // modify_stretch option clicked
  $( "#modify_stretch" ).click( function( event ) {

    event.preventDefault();
    jQuery( "#modal_modify_stretch" ).dialog({
      modal: true,
      buttons: {
        OK: function() {
          modify_stretch();
        },
        Cancel: function() {
          $( this ).dialog( 'close' );
        }
      }
    });

  } );

  // modify_random_variance option clicked
  $( "#modify_random_variance" ).click( function( event ) {

    event.preventDefault();
    jQuery( "#modal_modify_random_variance" ).dialog({
      modal: true,
      buttons: {
        OK: function() {
          modify_random_variance();
        },
        Cancel: function() {
          $( this ).dialog( 'close' );
        }
      }
    });

  } );

  // modify_mode option clicked
  $( "#modify_mode" ).click( function( event ) {

    event.preventDefault();
    jQuery( "#modal_modify_mode" ).dialog({
      modal: true,
      buttons: {
        OK: function() {
          modify_mode();
        },
        Cancel: function() {
          $( this ).dialog( 'close' );
        }
      }
    });

  } );

  // modify_mode option clicked
  $( "#modify_key_transpose" ).click( function( event ) {

    event.preventDefault();
    jQuery( "#modal_modify_key_transpose" ).dialog({
      modal: true,
      buttons: {
        OK: function() {
          modify_key_transpose();
        },
        Cancel: function() {
          $( this ).dialog( 'close' );
        }
      }
    });

  } );

  // Panic button
  $( "#btn_panic" ).click( function( event ) {
    event.preventDefault();
    Synth.panic(); // turns off all playing synth notes
  } );

  // General Settings - Line ending format (newlines)
  $( '#input_select_newlines' ).change( function( event ) {
    if ( $( '#input_select_newlines' ).val() == "windows" ) {
      newline = "\r\n"; // windows
      localStorage.setItem( 'newline', 'windows' );
    }
    else {
      newline = "\n"; // unix
      localStorage.setItem( 'newline', 'unix' );
    }
    debug( $( '#input_select_newlines' ).val() + ' line endings selected' );
  } );

  // General Settings - Night mode
  $( "#input_checkbox_night_mode" ).change( function( event ) {
    if ( $( "#input_checkbox_night_mode" ).is(':checked') ) {
      $('body').addClass('dark');
      localStorage.setItem( 'night_mode', true );
    }
    else {
      $('body').removeClass('dark');
      localStorage.setItem( 'night_mode', false );
    }
  } );



  // Synth Settings - Main Volume
  $(document).on('input', '#input_range_main_vol', function() {
    gain = $(this).val();
    now = audioCtx.currentTime;
    Synth.masterGain.gain.value = gain;
    Synth.masterGain.gain.setValueAtTime(gain, now);
  });



  // Synth Settings - Waveform
  $( "#input_select_synth_waveform" ).change( function( event ) {
    Synth.waveform = $( '#input_select_synth_waveform' ).val();
  } );



  // Synth Settings - Delay
  $( "#input_checkbox_delay_on" ).change( function( event ) {
    Delay.on = $( "#input_checkbox_delay_on" ).is(':checked');
    if ( Delay.on ) {
      // turn delay on
      debug("delay ON");
      Delay.panL.connect( Synth.masterGain );
      Delay.panR.connect( Synth.masterGain );
    }
    else {
      // turn delay off
      debug("delay OFF");
      Delay.panL.disconnect( Synth.masterGain );
      Delay.panR.disconnect( Synth.masterGain );
    }
  } );

  $(document).on('input', '#input_range_feedback_gain', function() {
    Delay.gain = $(this).val();
    debug(Delay.gain);
    Delay.gainL.gain.setValueAtTime(Delay.gain, audioCtx.currentTime);
    Delay.gainR.gain.setValueAtTime(Delay.gain, audioCtx.currentTime);
  });

  $(document).on('change', '#input_range_delay_time', function() {
    Delay.time = $(this).val() * 0.001;
    Delay.channelL.delayTime.setValueAtTime( Delay.time, audioCtx.currentTime );
    Delay.channelR.delayTime.setValueAtTime( Delay.time, audioCtx.currentTime );
  });



  // Note Input Settings - Keyboard Layout
  $( "#input_select_keyboard_layout" ).change( function( event ) {
    switch( $( '#input_select_keyboard_layout' ).val() ) {
      case 'EN':
        Synth.keymap = Keymap.EN;
        break;
      case 'HU':
        Synth.keymap = Keymap.HU;
        break;
    }
  } );



  // Note Input Settings - Isomorphic Mapping
  $( "#input_number_isomorphicmapping_vert" ).change( function( event ) {
    Synth.isomorphicMapping.vertical = $( '#input_number_isomorphicmapping_vert' ).val();
  } );
  $( "#input_number_isomorphicmapping_horiz" ).change( function( event ) {
    Synth.isomorphicMapping.horizontal = $( '#input_number_isomorphicmapping_horiz' ).val();
  } );



  // set "accordion" settings UI
  $( function() {
    $( "#settings-accordion" )
      .accordion({
        collapsible: true, // allow all tabs to be closed
        active: false, // start all tabs closed
        heightStyle: "content", // size each section to content
        icons: null, // turn off triangle icons
        header: "> div > h3"
      });
  } );

  // Social Icons
  // Email
  $( "a.social-icons-email" ).click( function( event ) {
    event.preventDefault();
    var email = '';
    var subject = encodeURIComponent( 'Scale Workshop - ' + jQuery( '#txt_name' ).val() );
    var emailBody = encodeURIComponent( "Sending you this musical scale:" + newline + jQuery( '#txt_name' ).val() + newline + newline + "The link below has more info:" + newline + newline + jQuery( '#input_share_url' ).val() );
    window.location = 'mailto:' + email + '?subject=' + subject + '&body=' + emailBody;
  } );
  // Twitter
  $( "a.social-icons-twitter" ).click( function( event ) {
    event.preventDefault();
    var text = encodeURIComponent( 'Check this tuning ♫ ' + jQuery( '#txt_name' ).val() + ' ' );
    var url = encodeURIComponent( jQuery( '#input_share_url' ).val() );
    window.open( 'https://twitter.com/intent/tweet?text=' + text + url );
  } );

  // parse tuning data when changes are made
  $( "#txt_name, #txt_tuning_data, #txt_base_frequency, #txt_base_midi_note, #input_select_newlines" ).change( function() {
    parse_tuning_data();
  } );

  // handle QWERTY key active indicator
  is_qwerty_active();
  $( "input,textarea" ).focusin( function() { is_qwerty_active(); } );
  $( "input,textarea" ).focusout( function() { is_qwerty_active(); } );

  // Remove splash screen
  $( "div#splash" ).fadeOut();

  // now everything is initialised we finally run any custom user scripts
  run_user_scripts_on_document_ready();
} ); // end of document ready block
