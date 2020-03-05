/*
 * EVENT HANDLERS AND OTHER DOCUMENT READY STUFF
 */

/* global localStorage, jQuery, confirm */
import { debug, isEmpty, isNil, openDialog, trimSelf, isLocalStorageAvailable } from './helpers/general.js'
import { mtof, midiNoteNumberToName, degreesToSteps, stepsToDegrees } from './helpers/converters.js'
import { rotateArrayLeft, rotateArrayRight, getCoprimes } from './helpers/sequences.js'
import { setKeyColors, parseTuningData, parseUrl, clearAll, model, synth } from './scaleworkshop.js'
import { importScalaScl, importAnamarkTun } from './helpers/importers.js'
import { closestPrime } from './helpers/numbers.js'
import { touchKbdOpen, touchKbdClose } from './ui.js'
import { isQueryActive } from './synth.js'
import { PRIMES, APP_TITLE, WINDOWS_NEWLINE, UNIX_NEWLINE, NEWLINE_REGEX, LOCALSTORAGE_PREFIX } from './constants.js'
import {
  modifyUpdateApproximations,
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
  // showModifyModeMosOptions(document.querySelector('input[name="modeType"]:checked').value)
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
      jQuery('body').addClass('dark')
    }

    // recall computer keyboard layout
    if (!isNil(localStorage.getItem(`${LOCALSTORAGE_PREFIX}keyboard region`))) {
      jQuery('#input_select_keyboard_layout').val(localStorage.getItem(`${LOCALSTORAGE_PREFIX}keyboard region`))
      synth.keymap = Keymap[localStorage.getItem(`${LOCALSTORAGE_PREFIX}keyboard region`)]
    }
  } else {
    debug(
      'localStorage not supported in your browser. Please check your browser settings. If using Safari, you may need to disable private browsing mode.'
    )
  }

  // get data encoded in url
  parseUrl()

  // base MIDI note changed
  jQuery('#txt_base_midi_note').change(function () {
    // update MIDI note name
    jQuery('#base_midi_note_name').text(midiNoteNumberToName(jQuery('#txt_base_midi_note').val()))
  })

  // clear button clicked
  jQuery('#btn_clear').click(function (event) {
    event.preventDefault()

    const response = confirm('Are you sure you want to clear the current tuning data?')

    if (response) {
      clearAll()
    }
  })

  // auto frequency button clicked
  jQuery('#btn_frequency_auto').click(function (event) {
    event.preventDefault()
    jQuery('#txt_base_frequency').val(mtof(jQuery('#txt_base_midi_note').val()).toFixed(6))
    parseTuningData()
  })

  // import scala option clicked
  jQuery('#import-scala-scl').click(function (event) {
    event.preventDefault()
    importScalaScl()
  })

  // import anamark tun option clicked
  jQuery('#import-anamark-tun').click(function (event) {
    event.preventDefault()
    importAnamarkTun()
  })

  // generateEqualTemperament option clicked
  jQuery('#generate_equal_temperament').click(function (event) {
    event.preventDefault()
    jQuery('#input_number_of_divisions').select()
    openDialog('#modal_generate_equal_temperament', generateEqualTemperament)
  })

  // generateRank2Temperament option clicked
  jQuery('#generate_rank_2_temperament').click(function (event) {
    event.preventDefault()
    jQuery('#input_rank-2_generator').select()
    openDialog('#modal_generate_rank_2_temperament', generateRank2Temperament)
  })

  // rank-2 temperament generator - generators up changed
  jQuery('#input_rank-2_up').change(function () {
    jQuery('#input_rank-2_down').val(jQuery('#input_rank-2_size').val() - jQuery('#input_rank-2_up').val() - 1)
  })

  // rank-2 temperament generator - scale size changed
  jQuery('#input_rank-2_size').change(function () {
    const size = parseInt(jQuery('#input_rank-2_size').val())
    // set generators up to be one less than scale size
    jQuery('#input_rank-2_up').val(size - 1)
    // set generators up input maximum
    jQuery('#input_rank-2_up').attr({ max: size - 1 })
    // zero generators down
    jQuery('#input_rank-2_down').val(0)
  })

  // generateHarmonicSeriesSegment option clicked
  jQuery('#generate_harmonic_series_segment').click(function (event) {
    event.preventDefault()
    jQuery('#input_lowest_harmonic').select()
    openDialog('#modal_generate_harmonic_series_segment', generateHarmonicSeriesSegment)
  })

  // generateSubharmonicSeriesSegment option clicked
  jQuery('#generate_subharmonic_series_segment').click(function (event) {
    event.preventDefault()
    jQuery('#input_lowest_subharmonic').select()
    openDialog('#modal_generate_subharmonic_series_segment', generateSubharmonicSeriesSegment)
  })

  // enumerate_chord option clicked
  jQuery('#enumerate_chord').click(function (event) {
    event.preventDefault()
    jQuery('#input_chord').select()
    jQuery('#modal_enumerate_chord').dialog({
      modal: true,
      buttons: {
        OK: function () {
          generateEnumerateChord()
        },
        Cancel: function () {
          jQuery(this).dialog('close')
        }
      }
    })
  })

  // load-preset option clicked
  jQuery('#load-preset').click(function (event) {
    event.preventDefault()
    jQuery('#select_preset_scale').select()
    openDialog('#modal_load_preset_scale', function () {
      loadPresetScale(jQuery('#select_preset_scale')[0].value)
    })
  })

  // modifyMode option clicked
  jQuery('#modify_mode').click(function (event) {
    event.preventDefault()
    // setup MOS options, and hide
    model.set('modify mode mos degrees', getCoprimes(model.get('tuning table').noteCount - 1).slice(1))
    // showModifyModeMosOptions(document.querySelector('input[name="modeType"]:checked').value);
    jQuery('#modal_modify_mos_degree').change() // make sizes available
    jQuery('#input_modify_mode').select()
    openDialog('#modal_modify_mode', modifyMode)
  })

  // modifyStretch option clicked
  jQuery('#modify_stretch').click(function (event) {
    event.preventDefault()
    jQuery('#input_stretch_ratio').select()
    openDialog('#modal_modify_stretch', modifyStretch)
  })

  // modifyRandomVariance option clicked
  jQuery('#modify_random_variance').click(function (event) {
    event.preventDefault()
    jQuery('#input_cents_max_variance').select()
    openDialog('#modal_modify_random_variance', modifyRandomVariance)
  })

  // modifySyncBeating option clicked
  jQuery('#modify_sync_beating').click(function (event) {
    event.preventDefault()
    openDialog('#modal_modify_sync_beating', modifySyncBeating)
  })

  // approximate option clicked
  jQuery('#modify_approximate').click(function (event) {
    event.preventDefault()
    const tuningTable = model.get('tuning table')
    trimSelf('#txt_tuning_data')

    jQuery('#input_scale_degree').val(1)
    jQuery('#input_scale_degree').attr({ min: 1, max: tuningTable.noteCount - 1 })

    jQuery('#input_scale_degree').select()
    jQuery('#input_scale_degree').trigger('change')

    jQuery('#modal_approximate_intervals').dialog({
      modal: true,
      buttons: {
        Apply: function () {
          modifyReplaceWithApproximation()
        },
        Close: function () {
          jQuery(this).dialog('close')
        }
      }
    })
  })

  // recalculate approximations when scale degree changes
  jQuery('#input_scale_degree').change(function () {
    trimSelf() // TODO: trim self requires a parameter to apply trim to, otherwise this is just a NOP
    const index = parseInt(jQuery('#input_scale_degree').val()) - 1
    const lines = document.getElementById('txt_tuning_data').value.split(NEWLINE_REGEX)
    jQuery('#input_interval_to_approximate')
      .val(lines[index])
      .trigger('change')
  })

  // refilter approximations when fields change
  jQuery('#input_min_error, #input_max_error, #input_show_convergents').change(modifyUpdateApproximations)

  // refilter approximations when prime limit changes
  // can be improved, but it's a bit tricky!
  jQuery('#input_approx_min_prime').change(function () {
    const num = parseInt(jQuery('#input_approx_min_prime').val())
    const approximationFilterPrimeCount = model.get('modify approx prime counters')
    const dif = num - PRIMES[approximationFilterPrimeCount[0]]
    if (Math.abs(dif) === 1) {
      if (num < PRIMES[approximationFilterPrimeCount[0]]) {
        approximationFilterPrimeCount[0]--
      } else {
        approximationFilterPrimeCount[0]++
      }
    } else {
      approximationFilterPrimeCount[0] = PRIMES.indexOf(closestPrime(num))
    }

    jQuery('#input_approx_min_prime').val(PRIMES[approximationFilterPrimeCount[0]])
    modifyUpdateApproximations()
  })

  // refilter approximations when prime limit changes
  jQuery('#input_approx_max_prime').change(function () {
    const num = parseInt(jQuery('#input_approx_max_prime').val())
    const approximationFilterPrimeCount = model.get('modify approx prime counters')
    const dif = num - PRIMES[approximationFilterPrimeCount[1]]
    if (Math.abs(dif) === 1) {
      if (num < PRIMES[approximationFilterPrimeCount[1]]) {
        approximationFilterPrimeCount[1]--
      } else {
        approximationFilterPrimeCount[1]++
      }
    } else {
      approximationFilterPrimeCount[1] = PRIMES.indexOf(closestPrime(num))
    }

    jQuery('#input_approx_max_prime').val(PRIMES[approximationFilterPrimeCount[1]])
    modifyUpdateApproximations()
  })

  jQuery('#modal_modify_mode').change(function (newValue) {
    model.set('modify mode type', document.querySelector('input[name="modeType"]:checked').value)
    // showModifyModeMosOptions(document.querySelector('input[name="modeType"]:checked').value)
  })

  jQuery('#input_modify_mode').change(function (element) {
    model.set('modify mode input', element.target.value.split(' '))
  })

  jQuery('#modal_modify_mos_degree').change(function (element) {
    model.set('modify mode mos degree selected', parseInt(element.target.options[element.target.selectedIndex].text))
  })

  // update mode when size is selected
  jQuery('#modal_modify_mos_size').change(function (element) {
    model.set('modify mode mos size selected', parseInt(element.target.options[element.target.selectedIndex].text))
  })

  // move the mode steps back one
  jQuery('#input_mode_step_left').click(function () {
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
  jQuery('#input_mode_step_right').click(function () {
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
  jQuery('#nav_play, #launch-kbd').click(function (event) {
    event.preventDefault()
    // close or open the touch keyboard depending on if it is already visible
    jQuery('#virtual-keyboard').is(':visible') ? touchKbdClose() : touchKbdOpen()
  })

  // hide virtual keyboard when mobile hamburger menu button is clicked
  jQuery('button.navbar-toggle').click(function (event) {
    if (jQuery('#virtual-keyboard').is(':visible')) {
      jQuery('#virtual-keyboard').slideUp()
    }
  })

  // Touch keyboard clicked with mouse
  jQuery('#virtual-keyboard').click(function () {
    touchKbdClose()
  })

  // About Scale Workshop option clicked
  jQuery('#about_scale_workshop').click(function (event) {
    event.preventDefault()
    jQuery('#about_version').text(APP_TITLE)
    jQuery('#modal_about_scale_workshop').dialog({
      modal: true,
      width: 500,
      buttons: {
        OK: function () {
          jQuery(this).dialog('close')
        }
      }
    })
  })

  // Panic button
  jQuery('#btn_panic').click(function (event) {
    event.preventDefault()
    synth.panic() // turns off all playing synth notes
  })

  // General Settings - Line ending format (newlines)
  jQuery('#input_select_newlines').on('input', function (event) {
    const newValue = event.target.value
    if (newValue === 'windows' || newValue === 'unix') {
      model.set('newline', newValue)
    }
  })

  // General Settings - Night mode
  jQuery('#input_checkbox_night_mode').change(function (event) {
    if (jQuery('#input_checkbox_night_mode').is(':checked')) {
      jQuery('body').addClass('dark')
      localStorage.setItem(`${LOCALSTORAGE_PREFIX}night mode`, true)
    } else {
      jQuery('body').removeClass('dark')
      localStorage.setItem(`${LOCALSTORAGE_PREFIX}night mode`, false)
    }
  })

  // Synth Settings - Waveform
  jQuery('#input_select_synth_waveform').change(function (event) {
    synth.waveform = jQuery('#input_select_synth_waveform').val()
    updatePageUrl()
  })

  // Synth Settings - Amplitude Envelope
  jQuery('#input_select_synth_amp_env').change(function (event) {
    updatePageUrl()
  })

  // Synth Settings - Delay
  jQuery('#input_checkbox_delay_on').change(function () {
    if (jQuery(this).is(':checked')) {
      synth.delay.enable()
    } else {
      synth.delay.disable()
    }
  })

  jQuery(document).on('input', '#input_range_feedback_gain', function () {
    synth.delay.gain = jQuery(this).val()
    debug(synth.delay.gain)
    const now = synth.now()
    synth.delay.gainL.gain.setValueAtTime(synth.delay.gain, now)
    synth.delay.gainR.gain.setValueAtTime(synth.delay.gain, now)
  })

  jQuery(document).on('change', '#input_range_delay_time', function () {
    synth.delay.time = jQuery(this).val() * 0.001
    const now = synth.now()
    synth.delay.channelL.delayTime.setValueAtTime(synth.delay.time, now)
    synth.delay.channelR.delayTime.setValueAtTime(synth.delay.time, now)
  })
  jQuery(document).on('input', '#input_range_delay_time', function () {
    jQuery('#delay_time_ms').text(jQuery(this).val())
  })

  // Isomorphic Settings - Keyboard Layout
  jQuery('#input_select_keyboard_layout').change(function (event) {
    const id = jQuery('#input_select_keyboard_layout').val()
    synth.keymap = Keymap[id]
    localStorage.setItem(`${LOCALSTORAGE_PREFIX}keyboard region`, id)
  })

  // Isomorphic Settings - Isomorphic Mapping
  jQuery('#input_number_isomorphicmapping_vert').change(function (event) {
    synth.isomorphicMapping.vertical = jQuery('#input_number_isomorphicmapping_vert').val()
  })
  jQuery('#input_number_isomorphicmapping_horiz').change(function (event) {
    synth.isomorphicMapping.horizontal = jQuery('#input_number_isomorphicmapping_horiz').val()
  })

  // Isomorphic Settings - Key colors
  jQuery('#input_key_colors').change(function (event) {
    setKeyColors(jQuery('#input_key_colors').val())
    // update this change in the browser's Back/Forward navigation
    updatePageUrl()
  })

  // initialise key colors. defaults to Halberstadt layout on A
  setKeyColors(jQuery('#input_key_colors').val())

  // Isomorphic Settings - Key colors Auto button clicked
  jQuery('#btn_key_colors').click(function (event) {
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
  jQuery('a.social-icons-email').click(function (event) {
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
  jQuery('a.social-icons-twitter').click(function (event) {
    event.preventDefault()
    const text = encodeURIComponent(jQuery('#txt_name').val() + ' ♫ ')
    const url = encodeURIComponent(jQuery('#input_share_url').val())
    window.open('https://twitter.com/intent/tweet?text=' + text + url)
  })

  // TODO: need debouncing for these fields before using
  // parse tuning data when changes are made
  // jQuery( "#txt_name, #txt_tuningData, #txt_baseFrequency, #txt_baseMidiNote, #input_select_newlines" ).change( function() {
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
