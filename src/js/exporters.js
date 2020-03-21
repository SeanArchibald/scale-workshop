/* global alert, MouseEvent, history, jQuery */

import { model, synth } from './scaleworkshop.js'
import { isNil } from './helpers/general.js'
import { decimalToCents, mtof, midiNoteNumberToName, ftom } from './helpers/converters.js'
import { LINE_TYPE, APP_TITLE, TUNING_MAX_SIZE, UNIX_NEWLINE, WINDOWS_NEWLINE } from './constants.js'
import { isEmpty } from './helpers/strings.js'
import { getLineType } from './helpers/types.js'

function exportError() {
  const tuningTable = model.get('tuning table')
  // no tuning data to export
  if (isNil(tuningTable.freq[tuningTable.baseMidiNote])) {
    alert('No tuning data to export.')
    return true
  }
}

function saveFile(filename, contents) {
  const link = document.createElement('a')
  link.download = filename
  link.href = 'data:application/octet-stream,' + encodeURIComponent(contents)
  console.log(link.href)
  link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window })) // opens save dialog
}

function exportAnamarkTun() {
  if (exportError()) {
    return
  }

  const tuningTable = model.get('tuning table')
  const newline = model.get('newline') === 'windows' ? WINDOWS_NEWLINE : UNIX_NEWLINE

  // TUN format spec:
  // http://www.mark-henning.de/files/am/Tuning_File_V2_Doc.pdf

  // assemble the .tun file contents
  let file = '; VAZ Plus/AnaMark softsynth tuning file' + newline
  file += '; ' + jQuery('#txt_name').val() + newline
  file += ';' + newline
  file += '; VAZ Plus section' + newline
  file += '[Tuning]' + newline

  for (let i = 0; i < TUNING_MAX_SIZE; i++) {
    file += 'note ' + i + '=' + parseInt(decimalToCents(parseFloat(tuningTable.freq[i]) / mtof(0))) + newline
  }

  file += newline + '; AnaMark section' + newline
  file += '[Scale Begin]' + newline
  file += 'Format= "AnaMark-TUN"' + newline
  file += 'FormatVersion= 200' + newline
  file += 'FormatSpecs= "http://www.mark-henning.de/eternity/tuningspecs.html"' + newline + newline
  file += '[Info]' + newline
  file += 'Name= "' + tuningTable.filename + '.tun"' + newline
  file += 'ID= "' + tuningTable.filename.replace(/ /g, '') + '.tun"' + newline // this line strips whitespace from filename, as per .tun spec
  file += 'Filename= "' + tuningTable.filename + '.tun"' + newline
  file += 'Description= "' + tuningTable.description + '"' + newline
  const date = new Date().toISOString().slice(0, 10)
  file += 'Date= "' + date + '"' + newline
  file += 'Editor= "' + APP_TITLE + '"' + newline + newline
  file += '[Exact Tuning]' + newline

  for (let i = 0; i < TUNING_MAX_SIZE; i++) {
    file += 'note ' + i + '= ' + decimalToCents(parseFloat(tuningTable.freq[i]) / mtof(0)).toFixed(6) + newline
  }

  file += newline + '[Functional Tuning]' + newline

  for (let i = 1; i < tuningTable.noteCount; i++) {
    if (i === tuningTable.noteCount - 1) {
      file +=
        'note ' + i + '="#>-' + i + ' % ' + decimalToCents(tuningTable.tuningData[i]).toFixed(6) + ' ~999"' + newline
    } else {
      file += 'note ' + i + '="#=0 % ' + decimalToCents(tuningTable.tuningData[i]).toFixed(6) + '"' + newline
    }
  }

  file += newline + '; Set reference key to absolute frequency (not scale note but midi key)' + newline
  file += 'note ' + tuningTable.baseMidiNote + '="! ' + tuningTable.baseFrequency.toFixed(6) + '"' + newline
  file += '[Scale End]' + newline

  saveFile(tuningTable.filename + '.tun', file)

  // success
  return true
}

function exportScalaScl() {
  if (exportError()) {
    return
  }

  const tuningTable = model.get('tuning table')
  const newline = model.get('newline') === 'windows' ? WINDOWS_NEWLINE : UNIX_NEWLINE

  // assemble the .scl file contents
  let file = '! ' + tuningTable.filename + '.scl' + newline
  file += '! Created using ' + APP_TITLE + newline
  file += '!' + newline
  if (isEmpty(jQuery('#txt_name').val())) {
    file += 'Untitled tuning'
  } else {
    file += jQuery('#txt_name').val()
  }
  file += newline + ' '

  file += tuningTable.noteCount - 1 + newline
  file += '!' + newline

  for (let i = 1; i < tuningTable.noteCount; i++) {
    file += ' '

    // if the current interval is n-of-m edo or commadecimal linetype, output as cents instead
    if (
      getLineType(tuningTable.scale_data[i]) === LINE_TYPE.N_OF_EDO ||
      getLineType(tuningTable.scale_data[i]) === LINE_TYPE.DECIMAL
    ) {
      file += decimalToCents(tuningTable.tuningData[i]).toFixed(6)
    } else {
      file += tuningTable.scale_data[i]
    }

    file += newline
  }

  saveFile(tuningTable.filename + '.scl', file)

  // success
  return true
}

function exportScalaKbm() {
  if (exportError()) {
    return
  }

  const tuningTable = model.get('tuning table')
  const newline = model.get('newline') === 'windows' ? WINDOWS_NEWLINE : UNIX_NEWLINE

  // assemble the .kbm file contents
  let file = '! Template for a keyboard mapping' + newline
  file += '!' + newline
  file += '! Size of map. The pattern repeats every so many keys:' + newline
  file += parseInt(tuningTable.noteCount - 1) + newline
  file += '! First MIDI note number to retune:' + newline
  file += '0' + newline
  file += '! Last MIDI note number to retune:' + newline
  file += '127' + newline
  file += '! Middle note where the first entry of the mapping is mapped to:' + newline
  file += parseInt(tuningTable.baseMidiNote) + newline
  file += '! Reference note for which frequency is given:' + newline
  file += parseInt(tuningTable.baseMidiNote) + newline
  file += '! Frequency to tune the above note to' + newline
  file += parseFloat(tuningTable.baseFrequency) + newline
  file += '! Scale degree to consider as formal octave (determines difference in pitch' + newline
  file += '! between adjacent mapping patterns):' + newline
  file += parseInt(tuningTable.noteCount - 1) + newline
  file += '! Mapping.' + newline
  file += '! The numbers represent scale degrees mapped to keys. The first entry is for' + newline
  file += '! the given middle note, the next for subsequent higher keys.' + newline
  file += '! For an unmapped key, put in an "x". At the end, unmapped keys may be left out.' + newline

  for (let i = 0; i < parseInt(tuningTable.noteCount - 1); i++) {
    file += i + newline
  }

  saveFile(tuningTable.filename + '.kbm', file)

  // success
  return true
}

function exportMaxMspColl() {
  if (exportError()) {
    return
  }

  const tuningTable = model.get('tuning table')
  const newline = model.get('newline') === 'windows' ? WINDOWS_NEWLINE : UNIX_NEWLINE

  // assemble the coll file contents
  let file = '# Tuning file for Max/MSP coll objects. - Created using ' + APP_TITLE + newline
  file += '# ' + jQuery('#txt_name').val() + newline
  file += '#' + newline

  for (let i = 0; i < TUNING_MAX_SIZE; i++) {
    file += i + ', ' + tuningTable.freq[i].toFixed(7) + ';' + newline
  }

  saveFile(tuningTable.filename + '.txt', file)

  // success
  return true
}

function exportPdText() {
  if (exportError()) {
    return
  }

  const tuningTable = model.get('tuning table')
  const newline = model.get('newline') === 'windows' ? WINDOWS_NEWLINE : UNIX_NEWLINE

  // assemble the text file contents
  let file = ''
  for (let i = 0; i < TUNING_MAX_SIZE; i++) {
    file += tuningTable.freq[i].toFixed(7) + ';' + newline
  }

  saveFile(tuningTable.filename + '.txt', file)

  // success
  return true
}

function exportKontaktScript() {
  if (exportError()) {
    return
  }

  const tuningTable = model.get('tuning table')
  const newline = model.get('newline') === 'windows' ? WINDOWS_NEWLINE : UNIX_NEWLINE

  // assemble the kontakt script contents
  let file = '{**************************************' + newline
  file += jQuery('#txt_name').val() + newline
  file +=
    'MIDI note ' +
    tuningTable.baseMidiNote +
    ' (' +
    midiNoteNumberToName(tuningTable.baseMidiNote) +
    ') = ' +
    parseFloat(tuningTable.baseFrequency) +
    ' Hz' +
    newline
  file += 'Created using ' + APP_TITLE + newline
  file += '****************************************}' + newline + newline

  file += 'on init' + newline
  file += 'declare %keynum[' + TUNING_MAX_SIZE + ']' + newline
  file += 'declare %tune[' + TUNING_MAX_SIZE + ']' + newline
  file += 'declare $bend' + newline
  file += 'declare $key' + newline + newline

  for (let i = 0; i < TUNING_MAX_SIZE; i++) {
    const thisNote = ftom(tuningTable.freq[i])

    if (thisNote[0] < 0 || thisNote[0] >= TUNING_MAX_SIZE) {
      // if we're out of range of the default Kontakt tuning, leave note as default tuning
      file += '%keynum[' + i + '] := ' + i + newline
      file += '%tune[' + i + '] := 0' + newline
    } else {
      // success, we're in range of another note, so we'll change the tuning +/- 50c
      file += '%keynum[' + i + '] := ' + thisNote[0] + newline
      file += '%tune[' + i + '] := ' + parseInt(thisNote[1] * 1000) + newline
    }
  }

  file += 'end on' + newline + newline

  file += 'on note' + newline
  file += '$key := %keynum[$EVENT_NOTE]' + newline
  file += '$bend := %tune[$EVENT_NOTE]' + newline
  file += 'change_note ($EVENT_ID, $key)' + newline
  file += 'change_tune ($EVENT_ID, $bend, 0)' + newline
  file += 'end on' + newline

  saveFile(tuningTable.filename + '.txt', file)

  // success
  return true
}

function exportReferenceDeflemask() {
  // This exporter converts your tuning data into a readable format you can easily input manually into Deflemask.
  // For example if you have a note 50 cents below A4, you would input that into Deflemask as A-4 -- - E5 40
  // Deflemask manual: http://www.deflemask.com/manual.pdf

  if (exportError()) {
    return
  }

  const tuningTable = model.get('tuning table')
  const newline = model.get('newline') === 'windows' ? WINDOWS_NEWLINE : UNIX_NEWLINE

  // assemble the text file contents
  let file =
    tuningTable.description +
    newline +
    'Reference for Deflemask note input - generated by ' +
    APP_TITLE +
    newline +
    newline
  for (let i = 0; i < TUNING_MAX_SIZE; i++) {
    // convert frequency into midi note number + cents offset
    let data = ftom(tuningTable.freq[i])

    // acceptable range is C#0 to B7 (MIDI notes 1-95). skip this note if it's out of range
    if (data[0] < 1 || data[0] > 95) continue

    // convert note number to note name
    data[0] = midiNoteNumberToName(data[0])
    data[0] = data[0].length === 2 ? data[0].slice(0, 1) + '-' + data[0].slice(1) : data[0]

    // convert cents offset to hex where -100c=00, 0c=80, 100c=FF
    data[1] = Math.round(128 + data[1] * 1.28)
      .toString(16)
      .toUpperCase()

    // add data to text file
    data = '[' + data[0] + ' xx] [xx E5 ' + data[1] + ']'
    file +=
      data +
      ' ..... ' +
      i +
      ': ' +
      tuningTable.freq[i].toFixed(2) +
      ' Hz / ' +
      tuningTable.cents[i].toFixed(2) +
      ' cents' +
      newline
  }

  saveFile(tuningTable.filename + '.txt', file)

  // success
  return true
}

function getScaleUrl() {
  const url = new URL(window.location.href)
  const protocol = !isEmpty(url.protocol) ? url.protocol + '//' : 'http://'
  const host = url.host
  const pathname = !isEmpty(url.pathname) ? url.pathname : '/scaleworkshop/'
  // var domain = !isNil(window.location.href) ? window.location.href : 'http://sevish.com/scaleworkshop';
  const name = encodeURIComponent(jQuery('#txt_name').val())
  const data = encodeURIComponent(jQuery('#txt_tuning_data').val())
  const freq = encodeURIComponent(jQuery('#txt_base_frequency').val())
  const midi = encodeURIComponent(jQuery('#txt_base_midi_note').val())
  const vert = encodeURIComponent(synth.isomorphicMapping.vertical)
  const horiz = encodeURIComponent(synth.isomorphicMapping.horizontal)
  const colors = encodeURIComponent(jQuery('#input_key_colors').val())
  const waveform = encodeURIComponent(jQuery('#input_select_synth_waveform').val())
  const ampenv = encodeURIComponent(jQuery('#input_select_synth_amp_env').val())

  return (
    protocol +
    host +
    pathname +
    '?name=' +
    name +
    '&data=' +
    data +
    '&freq=' +
    freq +
    '&midi=' +
    midi +
    '&vert=' +
    vert +
    '&horiz=' +
    horiz +
    '&colors=' +
    colors +
    '&waveform=' +
    waveform +
    '&ampenv=' +
    ampenv
  )
}

function updatePageUrl(url = getScaleUrl()) {
  const tuningTable = model.get('tuning table')
  // update this change in the browser's Back/Forward navigation
  history.pushState({}, tuningTable.description, url)
}

function exportUrl() {
  let exportUrl = window.location.href

  if (exportError()) {
    exportUrl = 'http://sevish.com/scaleworkshop/'
  }

  // copy url in to url field
  jQuery('#input_share_url').val(exportUrl)
  console.log('exportUrl = ' + exportUrl)

  jQuery('#input_share_url').trigger('select')
  jQuery('#modal_share_url').dialog({
    modal: true,
    buttons: {
      'Copy URL': function() {
        jQuery('#input_share_url').trigger('select')
        document.execCommand('Copy')
        jQuery(this).dialog('close')
      }
    }
  })

  // url field clicked
  jQuery('#input_share_url').on('click', function(event) {
    jQuery(this).trigger('select')
  })

  // success
  return true
}

export {
  getScaleUrl,
  updatePageUrl,
  exportAnamarkTun,
  exportScalaScl,
  exportScalaKbm,
  exportMaxMspColl,
  exportPdText,
  exportKontaktScript,
  exportReferenceDeflemask,
  exportUrl
}
