/*
 * EVENT HANDLERS AND OTHER DOCUMENT READY STUFF
 */

jQuery( document ).ready( function() {

  // get data encoded in url
  parse_url();

  // base MIDI note changed
  $( "#txt_base_midi_note" ).change( function() {

    // update MIDI note name
    $( "#base_midi_note_name" ).text( midi_note_number_to_name( $( "#txt_base_midi_note" ).val() ) );

  } );

  // parse the tuning data when it has been edited
  $( "#btn_parse" ).click( function( event ) {

    event.preventDefault();

    // parse the tuning data - success case
    if ( parse_tuning_data() ) {
      jQuery("#txt_tuning_data").parent().removeClass("has-error");
    }

    // parse the tuning data - failed case
    else {
      jQuery("#txt_tuning_data").parent().addClass("has-error");
    }

  } );

  // clear button clicked
  $( "#btn_clear" ).click( function( event ) {

    event.preventDefault();

    var r = confirm( "Are you sure you want to clear the current tuning data?" );

    if ( r ) {
      clear_all();
    }

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

  // General Settings
  // Save
  $( "#btn_settings_general_save" ).click( function( event ) {
    debug = $( '#input_checkbox_debug_output' ).is( ':checked' );
    console.log( "debug = " + debug );
  } );
  // Revert
  $( "#btn_settings_general_revert" ).click( function( event ) {
    $( '#input_checkbox_debug_output' ).prop( 'checked', debug );
    console.log( "debug = " + debug );
  } );

  // Synth Settings
  // Save
  $( "#btn_settings_synth_save" ).click( function( event ) {
    Synth.waveform = $( '#input_select_synth_waveform' ).val();
  } );
  // Revert
  $( "#btn_settings_synth_revert" ).click( function( event ) {
    $( '#input_select_synth_waveform' ).val( Synth.waveform );
  } );

  // Note Input Settings
  // Save
  $( "#btn_settings_note_input_save" ).click( function( event ) {
    Synth.isomorphicMapping.vertical = $( '#input_number_isomorphicmapping_vert' ).val();
    Synth.isomorphicMapping.horizontal = $( '#input_number_isomorphicmapping_horiz' ).val();
  } );
  // Revert
  $( "#btn_settings_note_input_revert" ).click( function( event ) {
    $( '#input_number_isomorphicmapping_vert' ).val( Synth.isomorphicMapping.vertical );
    $( '#input_number_isomorphicmapping_horiz' ).val( Synth.isomorphicMapping.horizontal );
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

} );
