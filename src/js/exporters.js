function export_error() {

  // no tuning data to export
  if (R.isNil(tuning_table['freq'][tuning_table['base_midi_note']])) {
    alert("No tuning data to export.");
    return true;
  }
}

function save_file(filename, contents, mimeType = 'application/octet-stream,') {
  const link = document.createElement('a')
  link.download = filename
  link.href = 'data:' + mimeType + encodeURIComponent(contents)
  console.log(link.href)
  link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window })) // opens save dialog
}

function export_anamark_tun() {

  if (export_error()) {
    return;
  }

  // TUN format spec:
  // http://www.mark-henning.de/files/am/Tuning_File_V2_Doc.pdf

  // assemble the .tun file contents
  var file = "; VAZ Plus/AnaMark softsynth tuning file" + newline;
  file += "; " + jQuery("#txt_name").val() + newline;
  file += ";" + newline;
  file += "; VAZ Plus section" + newline;
  file += "[Tuning]" + newline;

  for (let i = 0; i < TUNING_MAX_SIZE; i++) {
    file += "note " + i + "=" + parseInt(decimal_to_cents(parseFloat(tuning_table['freq'][i]) / mtof(0))) + newline;
  }

  file += newline + "; AnaMark section" + newline;
  file += "[Scale Begin]" + newline;
  file += 'Format= "AnaMark-TUN"' + newline;
  file += "FormatVersion= 200" + newline;
  file += 'FormatSpecs= "http://www.mark-henning.de/eternity/tuningspecs.html"' + newline + newline;
  file += "[Info]" + newline;
  file += 'Name= "' + tuning_table['filename'] + '.tun"' + newline;
  file += 'ID= "' + tuning_table['filename'].replace(/ /g, '') + '.tun"' + newline; // this line strips whitespace from filename, as per .tun spec
  file += 'Filename= "' + tuning_table['filename'] + '.tun"' + newline;
  file += 'Description= "' + tuning_table['description'] + '"' + newline;
  var date = new Date().toISOString().slice(0, 10);
  file += 'Date= "' + date + '"' + newline;
  file += 'Editor= "' + APP_TITLE + '"' + newline + newline;
  file += "[Exact Tuning]" + newline;

  for (let i = 0; i < TUNING_MAX_SIZE; i++) {
    file += "note " + i + "= " + decimal_to_cents(parseFloat(tuning_table['freq'][i]) / mtof(0)).toFixed(6) + newline;
  }

  file += newline + "[Functional Tuning]" + newline;

  for (let i = 1; i < tuning_table['note_count']; i++) {

    if (i == tuning_table['note_count'] - 1) {
      file += "note " + i + '="#>-' + i + ' % ' + decimal_to_cents(tuning_table['tuning_data'][i]).toFixed(6) + ' ~999"' + newline;
    }
    else {
      file += "note " + i + '="#=0 % ' + decimal_to_cents(tuning_table['tuning_data'][i]).toFixed(6) + '"' + newline;
    }

  }

  file += newline + "; Set reference key to absolute frequency (not scale note but midi key)" + newline;
  file += "note " + tuning_table['base_midi_note'] + '="! ' + tuning_table['base_frequency'].toFixed(6) + '"' + newline;
  file += "[Scale End]" + newline;

  save_file(tuning_table['filename'] + '.tun', file);

  // success
  return true;

}

function export_scala_scl() {

  if (export_error()) {
    return;
  }

  // assemble the .scl file contents
  var file = "! " + tuning_table['filename'] + ".scl" + newline;
  file += "! Created using " + APP_TITLE + newline;
  file += "!" + newline;
  if (R.isEmpty(jQuery("#txt_name").val())) {
    file += "Untitled tuning";
  }
  else {
    file += jQuery("#txt_name").val();
  }
  file += newline + " "

  file += tuning_table['note_count'] - 1 + newline;
  file += "!" + newline;

  for (let i = 1; i < tuning_table['note_count']; i++) {
    file += " "

    // if the current interval is n-of-m edo or commadecimal linetype, output as cents instead
    if (getLineType(tuning_table['scale_data'][i]) === LINE_TYPE.N_OF_EDO || getLineType(tuning_table['scale_data'][i]) === LINE_TYPE.DECIMAL) {
      file += decimal_to_cents(tuning_table['tuning_data'][i]).toFixed(6);
    }
    else {
      file += tuning_table['scale_data'][i];
    }

    file += newline
  }

  save_file(tuning_table['filename'] + '.scl', file);

  // success
  return true;

}

function export_scala_kbm() {

  if (export_error()) {
    return;
  }

  // assemble the .kbm file contents
  var file = "! Template for a keyboard mapping" + newline;
  file += "!" + newline;
  file += "! Size of map. The pattern repeats every so many keys:" + newline;
  file += parseInt(tuning_table['note_count'] - 1) + newline;
  file += "! First MIDI note number to retune:" + newline;
  file += "0" + newline;
  file += "! Last MIDI note number to retune:" + newline;
  file += "127" + newline;
  file += "! Middle note where the first entry of the mapping is mapped to:" + newline;
  file += parseInt(tuning_table['base_midi_note']) + newline;
  file += "! Reference note for which frequency is given:" + newline;
  file += parseInt(tuning_table['base_midi_note']) + newline;
  file += "! Frequency to tune the above note to" + newline;
  file += parseFloat(tuning_table['base_frequency']) + newline;
  file += "! Scale degree to consider as formal octave (determines difference in pitch" + newline;
  file += "! between adjacent mapping patterns):" + newline;
  file += parseInt(tuning_table['note_count'] - 1) + newline;
  file += "! Mapping." + newline;
  file += "! The numbers represent scale degrees mapped to keys. The first entry is for" + newline;
  file += "! the given middle note, the next for subsequent higher keys." + newline;
  file += "! For an unmapped key, put in an \"x\". At the end, unmapped keys may be left out." + newline;

  for (let i = 0; i < parseInt(tuning_table['note_count'] - 1); i++) {
    file += i + newline;
  }

  save_file(tuning_table['filename'] + '.kbm', file);

  // success
  return true;

}

function export_maxmsp_coll() {

  if (export_error()) {
    return;
  }

  // assemble the coll file contents
  var file = "# Tuning file for Max/MSP coll objects. - Created using " + APP_TITLE + newline;
  file += "# " + jQuery("#txt_name").val() + newline;
  file += "#" + newline;

  for (let i = 0; i < TUNING_MAX_SIZE; i++) {
    file += i + ", " + tuning_table['freq'][i].toFixed(7) + ";" + newline;
  }

  save_file(tuning_table['filename'] + '.txt', file);

  // success
  return true;

}

function export_pd_text() {

  if (export_error()) {
    return;
  }

  // assemble the text file contents
  var file = "";
  for (let i = 0; i < TUNING_MAX_SIZE; i++) {
    file += tuning_table['freq'][i].toFixed(7) + ";" + newline;
  }

  save_file(tuning_table['filename'] + '.txt', file);

  // success
  return true;

}

function export_kontakt_script() {

  if (export_error()) {
    return;
  }

  // assemble the kontakt script contents
  var file = "{**************************************" + newline;
  file += jQuery("#txt_name").val() + newline;
  file += "MIDI note " + tuning_table['base_midi_note'] + " (" + midi_note_number_to_name(tuning_table['base_midi_note']) + ") = " + parseFloat(tuning_table['base_frequency']) + " Hz" + newline;
  file += "Created using " + APP_TITLE + newline;
  file += "****************************************}" + newline + newline;

  file += "on init" + newline;
  file += "declare %keynum[" + TUNING_MAX_SIZE + "]" + newline;
  file += "declare %tune[" + TUNING_MAX_SIZE + "]" + newline;
  file += "declare $bend" + newline;
  file += "declare $key" + newline + newline;

  for (let i = 0; i < TUNING_MAX_SIZE; i++) {

    var this_note = ftom(tuning_table['freq'][i]);

    // if we're out of range of the default Kontakt tuning, leave note as default tuning
    if (this_note[0] < 0 || this_note[0] >= TUNING_MAX_SIZE) {

      file += "%keynum[" + i + "] := " + i + newline;
      file += "%tune[" + i + "] := 0" + newline;

    }

    // success, we're in range of another note, so we'll change the tuning +/- 50c
    else {

      file += "%keynum[" + i + "] := " + this_note[0] + newline;
      file += "%tune[" + i + "] := " + parseInt(this_note[1] * 1000) + newline;

    }

  }

  file += "end on" + newline + newline;

  file += "on note" + newline;
  file += "$key := %keynum[$EVENT_NOTE]" + newline;
  file += "$bend := %tune[$EVENT_NOTE]" + newline;
  file += "change_note ($EVENT_ID, $key)" + newline;
  file += "change_tune ($EVENT_ID, $bend, 0)" + newline;
  file += "end on" + newline;

  save_file(tuning_table['filename'] + '.txt', file);

  // success
  return true;

}

function exportImageLinePitchMap(range) {
  const { clamp } = R

  if (export_error()) {
    return
  }
  const NB_NOTES = 121 // IL products can only retune from C0 to C10
  const HEADER_BYTES = Uint8Array.from([3, 0, 0, 0, 3, 0, 0, 0, NB_NOTES, 0, 0, 0])
  const ENDING_BYTES = Uint8Array.from([0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255])
  const X_STRIDE = 1 / NB_NOTES // constant x offset from one point to the next
  const CURVE_DATA = 33554432 // curve data for straight line, observed experimentally

  const baseFreqOffset = Math.log2(tuning_table.base_frequency / 440) // in number of octaves

  // construct point data
  let points = new ArrayBuffer(121 * 24)
  let pointsDoubles = new Float64Array(points)
  let pointsUint32 = new Uint32Array(points)
  for (let i = 0; i < NB_NOTES; i++) {
    const edo12cents = (i - 69) * 100
    const offset = tuning_table.cents[i] - edo12cents
    const normalizedOffset = ((offset / 1200 + baseFreqOffset) / range) * 0.5 + 0.5
    const yCoord = clamp(0, 1, normalizedOffset)
    pointsDoubles[i * 3 + 1] = yCoord
    if (i !== 0) { // no x offset and no curve data for first point
      pointsDoubles[i * 3] = X_STRIDE
      pointsUint32[i * 6 + 4] = 0
      pointsUint32[i * 6 + 5] = CURVE_DATA
    }
  }

  // assemble .fnv file
  let file = new Uint8Array(HEADER_BYTES.length + points.byteLength + ENDING_BYTES.length)
  let offset = 0
  file.set(HEADER_BYTES, offset)
  offset += HEADER_BYTES.length
  file.set(new Uint8Array(points), offset)
  offset += points.byteLength
  file.set(ENDING_BYTES, offset)

  save_file(tuning_table.filename + '.fnv', file, true)

  // success
  return true
}

function exportHarmorPitchMap() {
  exportImageLinePitchMap(5)
}

function exportSytrusPitchMap() {
  exportImageLinePitchMap(4)
}

function getMnlgtunTuningInfoXML(useScaleFormat, programmer, comment) {
  // Builds an XML file necessary for the .mnlgtun file format
  const rootName = useScaleFormat ? 'minilogue_TuneScaleInformation' : 'minilogue_TuneOctInformation'
  const xml = document.implementation.createDocument(null, rootName)

  const Programmer = xml.createElement('Programmer')
  Programmer.textContent = programmer
  xml.documentElement.appendChild(Programmer)

  const Comment = xml.createElement('Comment')
  Comment.textContent = comment
  xml.documentElement.appendChild(Comment)

  return xml
}

function getMnlgtunFileInfoXML(useScaleFormat, product = 'minilogue') {
  // Builds an XML file necessary for the .mnlgtun file format
  const rootName = 'KorgMSLibrarian_Data'
  const xml = document.implementation.createDocument(null, rootName)

  const Product = xml.createElement('Product')
  Product.textContent = product
  xml.documentElement.appendChild(Product)

  const Contents = xml.createElement('Contents')
  Contents.setAttribute('NumProgramData', 0)
  Contents.setAttribute('NumPresetInformation', 0)
  Contents.setAttribute('NumTuneScaleData', 1 * useScaleFormat)
  Contents.setAttribute('NumTuneOctData', 1 * !useScaleFormat)

  const [fileNameHeader, dataName, binName] = useScaleFormat
    ? ['TunS_000.TunS_', 'TuneScaleData', 'TuneScaleBinary']
    : ['TunO_000.TunO_', 'TuneOctData', 'TuneOctBinary']

  const TuneData = xml.createElement(dataName)

  const Information = xml.createElement('Information')
  Information.textContent = fileNameHeader + 'info'
  TuneData.appendChild(Information)

  const BinData = xml.createElement(binName)
  BinData.textContent = fileNameHeader + 'bin'
  TuneData.appendChild(BinData)

  Contents.appendChild(TuneData)
  xml.documentElement.appendChild(Contents)

  return xml
}

function exportMnlgtun(useScaleFormat) {
  // This exporter converts tuning data into a zip-compressed file for use with Korg's
  // 'logue Sound Librarian software, supporting their 'logue series of synthesizers.
  // While this exporter preserves accuracy as much as possible, the Sound Librarian software
  // unforunately truncates cent values to 1 cent precision. It's unknown whether the tuning accuracy
  // from this exporter is written to the synthesizer and used in the synthesis.

  if (export_error()) {
    return
  }

  // the index of the table that's equal to the baseNote should have the following value
  const refOffsetCents = MNLG_A_REF.val + decimal_to_cents(tuning_table.base_frequency / MNLG_A_REF.freq)

  // offset cents array for binary conversion
  let centsTable = tuning_table.cents.map(c => roundToNDecimals(3, c + refOffsetCents))

  if (useScaleFormat) {
    // ensure table length is exactly 128
    centsTable = centsTable.slice(0, MNLG_SCALESIZE)

    // this shouldn't happen unless something goes really wrong
    if (centsTable.length !== MNLG_SCALESIZE) {
      console.log('Somehow the mnlgtun table was less than 128 values, the end will be padded with 0s.')
      const padding = new Array(MNLG_SCALESIZE - centsTable.length).fill(0)
      centsTable = [...centsTable, ...padding]
    }
    
  } else {
    // normalize around root, truncate to 12 notes, and wrap flattened Cs
    let cNote = parseInt(tuning_table.base_midi_note / MNLG_OCTAVESIZE) * MNLG_OCTAVESIZE
    centsTable = centsTable.slice(cNote, cNote + MNLG_OCTAVESIZE)
                           .map(cents => mathModulo(cents - MNLG_C_REF.val, MNLG_MAXCENTS))
  }

  // convert to binary
  const binaryData = centsTableToMnlgBinary(centsTable)

  // prepare files for zipping
  const tuningInfo = getMnlgtunTuningInfoXML(useScaleFormat, 'ScaleWorkshop', tuning_table.filename)
  const fileInfo = getMnlgtunFileInfoXML(useScaleFormat)
  const [fileNameHeader, fileType] = useScaleFormat ? ['TunS_000.TunS_', '.mnlgtuns'] : ['TunO_000.TunO_', '.mnlgtuno']

  // build zip
  const zip = new JSZip()
  zip.file(fileNameHeader + 'bin', binaryData)
  zip.file(fileNameHeader + 'info', tuningInfo.documentElement.outerHTML)
  zip.file('FileInformation.xml', fileInfo.documentElement.outerHTML)
  zip.generateAsync({ type: 'base64' }).then(
    base64 => {
      save_file(tuning_table.filename + fileType, base64, 'application/zip;base64,')
    },
    err => alert(err)
  )

  // success
  return true
}

function export_reference_deflemask() {

  // This exporter converts your tuning data into a readable format you can easily input manually into Deflemask.
  // For example if you have a note 50 cents below A4, you would input that into Deflemask as A-4 -- - E5 40
  // Deflemask manual: http://www.deflemask.com/manual.pdf

  if (export_error()) {
    return;
  }

  // assemble the text file contents
  var file = tuning_table['description'] + newline + "Reference for Deflemask note input - generated by " + APP_TITLE + newline + newline;
  for (let i = 0; i < TUNING_MAX_SIZE; i++) {

    // convert frequency into midi note number + cents offset
    var data = ftom(tuning_table['freq'][i]);

    // acceptable range is C#0 to B7 (MIDI notes 1-95). skip this note if it's out of range
    if (data[0] < 1 || data[0] > 95) continue;

    // convert note number to note name
    data[0] = midi_note_number_to_name(data[0]);
    data[0] = (data[0].length == 2) ? data[0].slice(0, 1) + "-" + data[0].slice(1) : data[0];

    // convert cents offset to hex where -100c=00, 0c=80, 100c=FF
    data[1] = Math.round(128 + (data[1] * 1.28)).toString(16).toUpperCase();

    // add data to text file
    data = "[" + data[0] + " xx] [xx E5 " + data[1] + "]";
    file += data + " ..... " + i + ": " + tuning_table['freq'][i].toFixed(2) + " Hz / " + tuning_table['cents'][i].toFixed(2) + " cents" + newline;
  }

  save_file(tuning_table['filename'] + '.txt', file);

  // success
  return true;

}

// TODO: improve with currying?
function exportReaperNamedNotes(
  pitchFormat = 'scale data',
  showPeriodNumbers = true,
  calculatePeriodInPitch = false,
  rootPeriod = 0,
  centsRoot = 0,
  degreeRoot = 0
) {
  // This exporter enumerates the scale data to 128 MIDI notes in a readable format
  // that can be loaded into Reaper's piano roll in "Named Note" mode.
  //  - 'pitchFormat' can either be 'scale data', 'cents', 'freq', 'decimal', or 'degree'
  //  - 'showPeriodNumbers' if true will put the period (or octave) number by each pitch
  //  - 'calculatePeriodInPitch' if true will preserve the period value in the pitch value
  //  - 'rootPeriod' is for if the root should start on a certain period number
  //  - 'centsRoot' is the cent value used for the root note of the scale

  if (export_error()) {
    return false
  }

  // general properties
  const period = tuning_table.scale_data.slice(-1)[0]
  const tuningSize = tuning_table.note_count - 1

  // line building functions
  const prepend = (num, line) => num + ' ' + line
  const rootOffset = num => num - tuning_table.base_midi_note
  const circularIndex = num => mathModulo(rootOffset(num), tuningSize)
  const periodNumber = num => Math.floor(rootOffset(num) / tuningSize + rootPeriod)
  const appendPeriodNum = (line, num) => line + ' (' + periodNumber(num) + ')'
  const calcPeriod = (line, ind) => stackLines(line, stackSelf(period, periodNumber(ind) + rootPeriod))
  const addCentsRoot = cents => parseFloat(cents) + centsRoot

  let fileFunction, pitchTable

  // start file
  let file = '# MIDI note / CC name map' + newline

  let pitchLine = (line, ind) => line
  if (showPeriodNumbers) pitchLine = (line, ind) => appendPeriodNum(line, ind)

  if (pitchFormat === 'scale data') {
    const unison = stackSelf(period, 0) // use a 1/1 in the line type of the period
    pitchTable = [unison, ...tuning_table.scale_data.slice(1, -1)]

    let scalePitch = (line, ind) => pitchLine(line, ind)
    if (calculatePeriodInPitch) scalePitch = (line, ind) => pitchLine(calcPeriod(line, ind), ind)

    // Iterate over scale data, applying periods if chosen
    const scaleData = (num, array, table) => {
      const ind = array.length - num - 1
      return prepend(ind, scalePitch(table[circularIndex(ind)], ind))
    }

    fileFunction = table => tuning_table.cents.map((x, i, a) => scaleData(i, a, table)).join(newline)
  } else if (pitchFormat !== 'degree') {
    let pitchOffset = (line, ind) => pitchLine(roundToNDecimals(6, parseFloat(line)), ind)

    // assign proper pitch table
    // will have 6 decimal places of precision, except for cents which is 3
    switch (pitchFormat) {
      case 'freq':
        pitchTable = tuning_table.freq
        break
      case 'decimal':
        pitchTable = tuning_table.decimal
        break
      default:
        pitchTable = tuning_table.cents
        pitchOffset = (line, ind) => pitchLine(roundToNDecimals(3, addCentsRoot(line)), ind)
        break
    }

    // iterate over the first period of the table
    if (!calculatePeriodInPitch) {
      const pitchValue = (i, table) => {
        const ind = table.length - i - 1
        return prepend(ind, pitchOffset(table[circularIndex(ind) + tuning_table.base_midi_note], ind))
      }

      fileFunction = table => table.map((x, i, a) => pitchValue(i, a)).join(newline)

      // iterate over the whole table
    } else {
      const pitchValue = (i, table) => {
        const ind = table.length - i - 1
        return prepend(ind, pitchOffset(table[ind], ind))
      }

      fileFunction = table => table.map((x, i) => pitchValue(i, table)).join(newline)
    }

    // enumerate scale degrees
  } else {
    pitchTable = tuning_table.cents
    const degreeLine = (num, table) => {
      const ind = table.length - num - 1
      let deg = rootOffset(ind) + degreeRoot + tuningSize * rootPeriod
      
      if (!calculatePeriodInPitch) 
        deg = mathModulo(deg, tuningSize)

      return prepend(ind, pitchLine(deg + '\\' + tuningSize, ind))
    }

    fileFunction = table => table.map((x, i) => degreeLine(i, table)).join(newline)
  }

  file += fileFunction(pitchTable)

  save_file(tuning_table.filename + '.txt', file)

  // success
  return true
}

/**
 * get_export_url()
 */

function get_scale_url() {

  var url = new URL(window.location.href);
  var protocol = !R.isEmpty(url.protocol) ? url.protocol + '//' : 'http://';
  var host = url.host;
  var pathname = !R.isEmpty(url.pathname) ? url.pathname : '/scaleworkshop/';
  // var domain = !R.isNil(window.location.href) ? window.location.href : 'http://sevish.com/scaleworkshop';
  var name = encodeURIComponent(jQuery("#txt_name").val());
  var data = encodeURIComponent(jQuery("#txt_tuning_data").val());
  var freq = encodeURIComponent(jQuery("#txt_base_frequency").val());
  var midi = encodeURIComponent(jQuery("#txt_base_midi_note").val());
  var vert = encodeURIComponent(synth.isomorphicMapping.vertical);
  var horiz = encodeURIComponent(synth.isomorphicMapping.horizontal);
  var colors = encodeURIComponent(jQuery("#input_key_colors").val());
  var waveform = encodeURIComponent(jQuery('#input_select_synth_waveform').val());
  var ampenv = encodeURIComponent(jQuery('#input_select_synth_amp_env').val());

  return protocol + host + pathname + '?name=' + name + '&data=' + data + '&freq=' + freq + '&midi=' + midi + '&vert=' + vert + '&horiz=' + horiz + '&colors=' + colors + '&waveform=' + waveform + '&ampenv=' + ampenv;

}

/**
 * update_page_url()
 */

function update_page_url(url = get_scale_url()) {
  // update this change in the browser's Back/Forward navigation
  history.pushState({}, tuning_table['description'], url);
}

/**
 * export_url()
 */

function export_url() {

  var export_url = window.location.href;

  if (export_error()) {
    export_url = "http://sevish.com/scaleworkshop/";
  }

  // copy url in to url field
  jQuery("#input_share_url").val(export_url);
  console.log("export_url = " + export_url);

  jQuery("#input_share_url").select();
  jQuery("#modal_share_url").dialog({
    modal: true,
    buttons: {
      "Copy URL": function () {
        jQuery("#input_share_url").select();
        document.execCommand("Copy");
        jQuery(this).dialog('close');
      }
    }
  });


  // url field clicked
  jQuery("#input_share_url").click(function (event) {
    jQuery(this).select();
  });

  // success
  return true;

}
