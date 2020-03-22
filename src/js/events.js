/*
 * EVENT HANDLERS AND OTHER DOCUMENT READY STUFF
 */

/* global alert, localStorage, jQuery, confirm */

import { isEmpty } from './helpers/strings.js'
import {
  isNil,
  openDialog,
  trimSelf,
  isTuningDataAvailable,
  isLocalStorageAvailable,
  closePopup
} from './helpers/general.js'
import {
  mtof,
  midiNoteNumberToName,
  degreesToSteps,
  stepsToDegrees,
  getString,
  lineToDecimal
} from './helpers/converters.js'
import { rotateArrayLeft, rotateArrayRight, getCoprimes } from './helpers/sequences.js'
import { setKeyColors, parseTuningData, parseUrl, clearAll, model, synth } from './scaleworkshop.js'
import { importScalaScl, importAnamarkTun } from './helpers/importers.js'
import { closestPrime } from './helpers/numbers.js'
import { touchKbdOpen, touchKbdClose } from './ui.js'
import { isQueryActive } from './synth.js'
import { PRIMES, APP_TITLE, WINDOWS_NEWLINE, UNIX_NEWLINE, LOCALSTORAGE_PREFIX } from './constants.js'
import {
  modifyRandomVariance,
  modifyMode,
  modifySyncBeating,
  modifyStretch,
  modifyReplaceWithApproximation
} from './modifiers.js'
import { updatePageUrl } from './exporters.js'
import { Keymap } from './keymap.js'
import { runUserScriptsOnDocumentReady } from './user.js'
import {
  generateEnumerateChord,
  generateEqualTemperament,
  generateHarmonicSeriesSegment,
  generateRank2Temperament,
  generateSubharmonicSeriesSegment,
  loadPresetScale
} from './generators.js'

/*
// shows or hides MOS mode selection boxes
function showModifyModeMosOptions(showOptions) {
  document.getElementById('mos_mode_options').style.display = showOptions === 'mos' ? 'block' : 'none'
}

// repopulates the available degrees for selection
function update_modifyModeMosGenerators() {
  const tuningTable = model.get('tuning table')
  // showModifyModeMosOptions(document.querySelector('input[name="mode_type"]:checked').value)
  const coprimes = get_coprimes(tuningTable.noteCount - 1)
  // jQuery('#modal_modify_mos_degree').empty();
  for (let d = 1; d < coprimes.length - 1; d++) {
    const num = coprimes[d]
    const cents = Math.round(decimalToCents(tuningTable.tuningData[num]) * 10e6) / 10.0e6
    const text = num + ' (' + cents + 'c)'
    // jQuery('#modal_modify_mos_degree').append('<option value="'+num+'">'+text+'</option>');
  }
}

// calculate the MOS mode and insert it in the mode input box
function modifyModeUpdateMosScale() {
  const tuningTable = model.get('tuning table')
  const p = tuningTable.noteCount - 1
  const g = parseInt(jQuery('#modal_modify_mos_degree').val())
  const s = parseInt(jQuery('#modal_modify_mos_size').val())
  const mode = getRank2Mode(p, g, s)
  // jQuery('#input_modify_mode').val(mode.join(" "));
}
*/

function initEvents() {
  // automatically load generatal options saved in localStorage (if available)
  if (isLocalStorageAvailable()) {
    // recall night mode
    if (localStorage.getItem(`${LOCALSTORAGE_PREFIX}night mode`) === 'true') {
      jQuery('#input_checkbox_night_mode').trigger('click')
      document.body.addClass('dark')
    }

    // recall computer keyboard layout
    if (!isNil(localStorage.getItem(`${LOCALSTORAGE_PREFIX}keyboard region`))) {
      jQuery('#input_select_keyboard_layout').val(localStorage.getItem(`${LOCALSTORAGE_PREFIX}keyboard region`))
      synth.keymap = Keymap[localStorage.getItem(`${LOCALSTORAGE_PREFIX}keyboard region`)]
    }
  } else {
    console.log(
      'localStorage not supported in your browser. Please check your browser settings. If using Safari, you may need to disable private browsing mode.'
    )
  }

  // get data encoded in url
  parseUrl()

  // base MIDI note changed
  jQuery('#txt_base_midi_note').on('change', function() {
    // update MIDI note name
    jQuery('#base_midi_note_name').text(midiNoteNumberToName(jQuery('#txt_base_midi_note').val()))
  })

  // clear button clicked
  jQuery('#btn_clear').on('click', function(event) {
    event.preventDefault()

    const response = confirm('Are you sure you want to clear the current tuning data?')

    if (response) {
      clearAll()
    }
  })

  // auto frequency button clicked
  jQuery('#btn_frequency_auto').on('click', function(event) {
    event.preventDefault()
    jQuery('#txt_base_frequency').val(mtof(jQuery('#txt_base_midi_note').val()).toFixed(6))
    parseTuningData()
  })

  // import scala option clicked
  jQuery('#import-scala-scl').on('click', function(event) {
    event.preventDefault()
    importScalaScl()
  })

  // import anamark tun option clicked
  jQuery('#import-anamark-tun').on('click', function(event) {
    event.preventDefault()
    importAnamarkTun()
  })

  // generateEqualTemperament option clicked
  jQuery('#generate_equal_temperament').on('click', function(event) {
    event.preventDefault()
    jQuery('#input_number_of_divisions').trigger('select')
    openDialog('#modal_generate_equal_temperament', generateEqualTemperament)
  })

  // generateRank2Temperament option clicked
  jQuery('#generate_rank_2_temperament').on('click', function(event) {
    event.preventDefault()
    jQuery('#input_rank-2_generator').trigger('select')
    openDialog('#modal_generate_rank_2_temperament', generateRank2Temperament)
  })

  // rank-2 temperament generator - generators up changed
  jQuery('#input_rank-2_up').on('change', function() {
    jQuery('#input_rank-2_down').val(jQuery('#input_rank-2_size').val() - jQuery('#input_rank-2_up').val() - 1)
  })

  // rank-2 temperament generator - scale size changed
  jQuery('#input_rank-2_size').on('change', function() {
    const size = parseInt(jQuery('#input_rank-2_size').val())
    // set generators up to be one less than scale size
    jQuery('#input_rank-2_up').val(size - 1)
    // set generators up input maximum
    jQuery('#input_rank-2_up').attr({ max: size - 1 })
    // zero generators down
    jQuery('#input_rank-2_down').val(0)
  })

  // generateHarmonicSeriesSegment option clicked
  jQuery('#generate_harmonic_series_segment').on('click', function(event) {
    event.preventDefault()
    jQuery('#input_lowest_harmonic').trigger('select')
    openDialog('#modal_generate_harmonic_series_segment', generateHarmonicSeriesSegment)
  })

  // generateSubharmonicSeriesSegment option clicked
  jQuery('#generate_subharmonic_series_segment').on('click', function(event) {
    event.preventDefault()
    jQuery('#input_lowest_subharmonic').trigger('select')
    openDialog('#modal_generate_subharmonic_series_segment', generateSubharmonicSeriesSegment)
  })

  // enumerate_chord option clicked
  jQuery('#enumerate_chord').on('click', function(event) {
    event.preventDefault()
    jQuery('#input_chord').trigger('select')
    jQuery('#modal_enumerate_chord').dialog({
      modal: true,
      buttons: {
        OK: function() {
          try {
            generateEnumerateChord({
              rawChord: getString('#input_chord', 'Warning: bad input'),
              convertToRatios: document.getElementById('input_convert_to_ratios').checked,
              isInversion: document.getElementById('input_invert_chord').checked
            })

            closePopup('#modal_enumerate_chord')
          } catch (e) {
            alert(e.message)
          }
        },
        Cancel: function() {
          jQuery(this).dialog('close')
        }
      }
    })
  })

  // load-preset option clicked
  jQuery('#load-preset').on('click', function(event) {
    event.preventDefault()
    jQuery('#select_preset_scale').trigger('select')
    openDialog('#modal_load_preset_scale', function() {
      loadPresetScale(jQuery('#select_preset_scale')[0].value)
    })
  })

  // modifyMode option clicked
  jQuery('#modify_mode').on('click', function(event) {
    event.preventDefault()
    if (isTuningDataAvailable(true, 'No tuning data to modify.')) {
      // setup MOS options
      model.set('modify mode mos degree selected', 0) // reset values
      model.set('modify mode mos degrees', getCoprimes(model.get('tuning table').noteCount - 1).slice(1))
      model.set('modify mode type', document.querySelector('input[name="mode_type"]:checked').value)
      jQuery('#input_modify_mode').trigger('select')
      openDialog('#modal_modify_mode', modifyMode)
    }
  })

  // modifyStretch option clicked
  jQuery('#modify_stretch').on('click', function(event) {
    event.preventDefault()
    jQuery('#input_stretch_ratio').trigger('select')
    openDialog('#modal_modify_stretch', modifyStretch)
  })

  // modifyRandomVariance option clicked
  jQuery('#modify_random_variance').on('click', function(event) {
    event.preventDefault()
    jQuery('#input_cents_max_variance').trigger('select')
    openDialog('#modal_modify_random_variance', modifyRandomVariance)
  })

  // modifySyncBeating option clicked
  jQuery('#modify_sync_beating').on('click', function(event) {
    event.preventDefault()
    openDialog('#modal_modify_sync_beating', modifySyncBeating)
  })

  // approximate option clicked
  jQuery('#modify_approximate').on('click', function(event) {
    event.preventDefault()
    trimSelf('#txt_tuning_data')

    const inputScaleDegree = jQuery('#input_scale_degree')
    model.set('modify approx degree', 0) // force update
    inputScaleDegree.attr({ min: 1, max: model.get('tuning table').noteCount - 1 })
    model.set('modify approx degree', 1)
    inputScaleDegree.select()
    openDialog('#modal_approximate_intervals', modifyReplaceWithApproximation)
  })

  // calculate and list rational approximations within user parameters
  jQuery('#input_interval_to_approximate').change(function() {
    model.set('modify approx interval', lineToDecimal(jQuery('#input_interval_to_approximate').val()))
  })

  // recalculate approximations when scale degree changes
  jQuery('#input_scale_degree').on('change', function() {
    const index = parseInt(jQuery('#input_scale_degree').val())
    model.set('modify approx degree', index)
  })

  jQuery('#approximation_selection').change(function(element) {
    model.set('modify approx approximation', element.target.options[element.target.selectedIndex].value)
  })

  // refilter approximations when fields change
  jQuery('#input_min_error').change(function() {
    model.set('modify approx min error', jQuery('#input_min_error').val())
  })

  jQuery('#input_max_error').change(function() {
    model.set('modify approx max error', jQuery('#input_max_error').val())
  })

  jQuery('#input_show_convergents').change(function() {
    model.set('modify approx convergents', jQuery('#input_show_convergents')[0].checked)
  })

  // refilter approximations when prime limit changes
  // can be improved, but it's a bit tricky!
  jQuery('#input_approx_min_prime').on('change', function() {
    const numInput = parseInt(jQuery('#input_approx_min_prime').val())
    let primeIndex = model.get('modify approx min prime')
    const numPrevious = PRIMES[primeIndex]

    // Find difference between last number and next number
    const dif = numInput - numPrevious
    if (Math.abs(dif) === 1) {
      if (numInput < numPrevious && primeIndex > 0) {
        primeIndex--
      } else if (numInput > numPrevious) {
        primeIndex++
      }
    } else {
      primeIndex = PRIMES.indexOf(closestPrime(numInput))
    }

    model.set('modify approx min prime', primeIndex)
  })

  // refilter approximations when prime limit changes
  jQuery('#input_approx_max_prime').on('change', function() {
    const numInput = parseInt(jQuery('#input_approx_max_prime').val())
    let primeIndex = model.get('modify approx max prime')
    const numPrevious = PRIMES[primeIndex]

    // Find difference between last number and next number
    const dif = numInput - numPrevious
    if (Math.abs(dif) === 1) {
      if (numInput < numPrevious && primeIndex > 0) {
        primeIndex--
      } else if (numInput > numPrevious) {
        primeIndex++
      }
    } else {
      primeIndex = PRIMES.indexOf(closestPrime(numInput))
    }

    model.set('modify approx max prime', primeIndex)
  })

  jQuery('#modal_modify_mode').on('change', function() {
    model.set('modify mode type', document.querySelector('input[name="mode_type"]:checked').value)
    // showModifyModeMosOptions(document.querySelector('input[name="mode_type"]:checked').value)
  })

  jQuery('#input_modify_mode').on('change', function(element) {
    model.set('modify mode input', element.target.value.split(' '))
  })

  jQuery('#modal_modify_mos_degree').on('change', function(element) {
    model.set('modify mode mos degree selected', parseInt(element.target.options[element.target.selectedIndex].text))
  })

  // update mode when size is selected
  jQuery('#modal_modify_mos_size').on('change', function(element) {
    model.set('modify mode mos size selected', parseInt(element.target.options[element.target.selectedIndex].text))
  })

  // move the mode steps back one
  jQuery('#input_mode_step_left').on('click', function() {
    let mode = jQuery('#input_modify_mode')
      .val()
      .split(' ')
    if (model.get('modify mode type') === 'frombase') {
      mode = stepsToDegrees(rotateArrayLeft(1, degreesToSteps(mode)))
    } else {
      mode = rotateArrayLeft(1, mode)
    }
    model.set('modify mode input', mode)
  })

  // move the mode steps forward one
  jQuery('#input_mode_step_right').on('click', function() {
    let mode = jQuery('#input_modify_mode')
      .val()
      .split(' ')
    if (model.get('modify mode type') === 'frombase') {
      mode = stepsToDegrees(rotateArrayRight(1, degreesToSteps(mode)))
    } else {
      mode = rotateArrayRight(1, mode)
    }
    model.set('modify mode input', mode)
  })

  /*
  // rank-2 temperament generator - scale size changed
jQuery( '#input_rank-2_size' ).on('change',  function() {

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
  jQuery('#nav_play, #launch-kbd').on('click', function(event) {
    event.preventDefault()
    // close or open the touch keyboard depending on if it is already visible
    jQuery('#virtual-keyboard').is(':visible') ? touchKbdClose() : touchKbdOpen()
  })

  // hide virtual keyboard when mobile hamburger menu button is clicked
  jQuery('button.navbar-toggle').on('click', function(event) {
    if (jQuery('#virtual-keyboard').is(':visible')) {
      jQuery('#virtual-keyboard').slideUp()
    }
  })

  // Touch keyboard clicked with mouse
  jQuery('#virtual-keyboard').on('click', function() {
    touchKbdClose()
  })

  // About Scale Workshop option clicked
  jQuery('#about_scale_workshop').on('click', function(event) {
    event.preventDefault()
    jQuery('#about_version').text(APP_TITLE)
    jQuery('#modal_about_scale_workshop').dialog({
      modal: true,
      width: 500,
      buttons: {
        OK: function() {
          jQuery(this).dialog('close')
        }
      }
    })
  })

  // Panic button
  jQuery('#btn_panic').on('click', function(event) {
    event.preventDefault()
    synth.panic() // turns off all playing synth notes
  })

  // General Settings - Line ending format (newlines)
  jQuery('#input_select_newlines').on('input', function(event) {
    const newValue = event.target.value
    if (newValue === 'windows' || newValue === 'unix') {
      model.set('newline', newValue)
    }
  })

  // General Settings - Night mode
  jQuery('#input_checkbox_night_mode').on('change', function(event) {
    if (jQuery('#input_checkbox_night_mode').is(':checked')) {
      document.body.addClass('dark')
      localStorage.setItem(`${LOCALSTORAGE_PREFIX}night mode`, true)
    } else {
      document.body.removeClass('dark')
      localStorage.setItem(`${LOCALSTORAGE_PREFIX}night mode`, false)
    }
  })

  // Synth Settings - Waveform
  jQuery('#input_select_synth_waveform').on('change', function(event) {
    synth.waveform = jQuery('#input_select_synth_waveform').val()
    updatePageUrl()
  })

  // Synth Settings - Amplitude Envelope
  jQuery('#input_select_synth_amp_env').on('change', function(event) {
    updatePageUrl()
  })

  // Synth Settings - Delay
  jQuery('#input_checkbox_delay_on').on('change', function() {
    if (jQuery(this).is(':checked')) {
      synth.delay.enable()
    } else {
      synth.delay.disable()
    }
  })

  jQuery(document).on('input', '#input_range_feedback_gain', function() {
    synth.delay.gain = jQuery(this).val()
    console.log(synth.delay.gain)
    const now = synth.now()
    synth.delay.gainL.gain.setValueAtTime(synth.delay.gain, now)
    synth.delay.gainR.gain.setValueAtTime(synth.delay.gain, now)
  })

  jQuery(document).on('change', '#input_range_delay_time', function() {
    synth.delay.time = jQuery(this).val() * 0.001
    const now = synth.now()
    synth.delay.channelL.delayTime.setValueAtTime(synth.delay.time, now)
    synth.delay.channelR.delayTime.setValueAtTime(synth.delay.time, now)
  })
  jQuery(document).on('input', '#input_range_delay_time', function() {
    jQuery('#delay_time_ms').text(jQuery(this).val())
  })

  // Isomorphic Settings - Keyboard Layout
  jQuery('#input_select_keyboard_layout').on('change', function(event) {
    const id = jQuery('#input_select_keyboard_layout').val()
    synth.keymap = Keymap[id]
    localStorage.setItem(`${LOCALSTORAGE_PREFIX}keyboard region`, id)
  })

  // Isomorphic Settings - Isomorphic Mapping
  jQuery('#input_number_isomorphicmapping_vert').on('change', function(event) {
    synth.isomorphicMapping.vertical = jQuery('#input_number_isomorphicmapping_vert').val()
  })
  jQuery('#input_number_isomorphicmapping_horiz').on('change', function(event) {
    synth.isomorphicMapping.horizontal = jQuery('#input_number_isomorphicmapping_horiz').val()
  })

  // Isomorphic Settings - Key colors
  jQuery('#input_key_colors').on('change', function(event) {
    setKeyColors(jQuery('#input_key_colors').val())
    // update this change in the browser's Back/Forward navigation
    updatePageUrl()
  })

  // initialise key colors. defaults to Halberstadt layout on A
  setKeyColors(jQuery('#input_key_colors').val())

  // Isomorphic Settings - Key colors Auto button clicked
  jQuery('#btn_key_colors').on('click', function(event) {
    event.preventDefault()
    const tuningTable = model.get('tuning table')
    const size = tuningTable.noteCount - 1
    let colors = ''

    // fall back in some situations
    if (size < 2) {
      if (isEmpty(jQuery('#input_key_colors').val())) {
        // field is empty so we'll apply a sensible default key colouring
        jQuery('#input_key_colors').val('white black white white black white black white white black white black')
        setKeyColors(jQuery('#input_key_colors').val())
        return true
      }

      // field already has content so we'll do nothing
      return false
    }

    switch (size.toString()) {
      case '9':
        colors = 'white white black black white white black black white'
        break

      case '10':
        colors = 'white black white white white black white white black white'
        break

      case '11':
        colors = 'white black white black white black white black white black white'
        break

      case '12':
        colors = 'white black white white black white black white white black white black'
        break

      case '13':
        colors = 'antiquewhite white black white black white white black white white black white black'
        break

      case '14':
        colors = 'white black white black white black white white black white black white black white'
        break

      case '15':
        colors = 'white black white black white black white black white black white black white black white'
        break

      case '16':
        colors = 'white black white black white black white white black white black white black white black white'
        break

      case '17':
        colors = 'white black black white white black black white black black white white black black white black black'
        break

      case '18':
        colors =
          'white black black white black white black black white black white black black white black black white black'
        break

      case '19':
        colors =
          'white black grey white black grey white black white black grey white black grey white black grey white black white'
        break

      case '20':
        colors =
          'white white black black white white black black white white black black white white black black white white black black'
        break

      case '21':
        colors =
          'white black black white black black white black black white black black white black black white black black white black black'
        break

      case '22':
        colors =
          'white black white black white black white black white black white white black white black white black white black white black white'
        break

      case '23':
        colors =
          'white black black black white black black white black black white black black white black black white black black black white black black black'
        break

      case '24':
        colors =
          'white lightgrey black dimgrey white lightgrey white lightgrey black dimgrey white lightgrey black dimgrey white lightgrey white lightgrey black dimgrey white lightgrey black dimgrey'
        break

      default:
        {
          // assemble a key colouring for any arbitrary scale size
          const sequenceOfColors = []
          for (let i = 0; i < Math.floor(size / 2); i++) {
            sequenceOfColors.push('white', 'black')
          }
          if (size % 2 === 1) {
            sequenceOfColors.push('white')
          }
          colors = sequenceOfColors.join(' ')
        }
        break
    }

    jQuery('#input_key_colors').val(colors)
    setKeyColors(colors)
    // update this change in the browser's Back/Forward navigation
    updatePageUrl()
    return true
  })

  // Social Icons
  // Email
  jQuery('a.social-icons-email').on('click', function(event) {
    event.preventDefault()
    const newline = model.get('newline') === 'windows' ? WINDOWS_NEWLINE : UNIX_NEWLINE
    const email = ''
    const subject = encodeURIComponent('Scale Workshop - ' + jQuery('#txt_name').val())
    const emailBody = encodeURIComponent(
      'Sending you this musical scale:' +
        newline +
        jQuery('#txt_name').val() +
        newline +
        newline +
        'The link below has more info:' +
        newline +
        newline +
        jQuery('#input_share_url').val()
    )
    window.location = 'mailto:' + email + '?subject=' + subject + '&body=' + emailBody
  })
  // Twitter
  jQuery('a.social-icons-twitter').on('click', function(event) {
    event.preventDefault()
    const text = encodeURIComponent(jQuery('#txt_name').val() + ' ♫ ')
    const url = encodeURIComponent(jQuery('#input_share_url').val())
    window.open('https://twitter.com/intent/tweet?text=' + text + url)
  })

  // TODO: need debouncing for these fields before using
  // parse tuning data when changes are made
  // jQuery( "#txt_name, #txt_tuningData, #txt_baseFrequency, #txt_baseMidiNote, #input_select_newlines" ).on('change',  function() {
  //   parseTuningData();
  // } );

  // handle QWERTY key active indicator
  isQueryActive()
  jQuery('input,textarea').focusin(isQueryActive)
  jQuery('input,textarea').focusout(isQueryActive)

  // Remove splash screen
  jQuery('div#splash').fadeOut()

  // now everything is initialised we finally run any custom user scripts
  runUserScriptsOnDocumentReady()
}

export { initEvents }
