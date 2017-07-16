function export_anamark_tun() {

  // TUN format spec:
  // http://www.mark-henning.de/files/am/Tuning_File_V2_Doc.pdf

  // assemble the .tun file contents
  var file = "; VAZ Plus/AnaMark softsynth tuning file" + newline;
  file += "; " + $( "#txt_name" ).val() + newline;
  file += ";" + newline;
  file += "; VAZ Plus section" + newline;
  file += "[Tuning]" + newline;

  for ( i = 0; i < TUNING_MAX_SIZE; i++ ) {
    file += "note " + i + "=" + parseInt( ratio_to_cents( parseFloat( tuning_table['freq'][i] ) / mtof(0) ) ) + newline;
  }

  file += newline + "; AnaMark section" + newline;
  file += "[Scale Begin]" + newline;
  file += 'Format= "AnaMark-TUN"' + newline;
  file += "FormatVersion= 200" + newline;
  file += 'FormatSpecs= "http://www.mark-henning.de/eternity/tuningspecs.html"' + newline + newline;
  file += "[Info]" + newline;
  file += 'Name= "' + tuning_table['filename'] + '.tun"' + newline;
  file += 'ID= "' + tuning_table['filename'].replace(/ /g,'') + '.tun"' + newline; // this line strips whitespace from filename, as per .tun spec
  file += 'Filename= "' + tuning_table['filename'] + '.tun"' + newline;
  file += 'Description= "' + tuning_table['description'] + '"' + newline;
  var date = new Date().toISOString().slice(0,10);
  file += 'Date= "' + date + '"' + newline;
  file += 'Editor= "' + APP_TITLE + '"' + newline + newline;
  file += "[Exact Tuning]" + newline;

  for ( i = 0; i < TUNING_MAX_SIZE; i++ ) {
    file += "note " + i + "= " + ratio_to_cents( parseFloat( tuning_table['freq'][i] ) / mtof(0) ).toFixed(6) + newline;
  }

  file += newline + "[Functional tuning]" + newline;

  for ( i = 1; i < tuning_table['note_count']; i++ ) {

    if ( i == tuning_table['note_count']-1 ) {
      file += "note " + i + '="#>-' + i + ' * ' + decimal_to_cents( tuning_table['tuning_data'][i] ).toFixed(6) + ' ~999"' + newline;
    }
    else {
      file += "note " + i + '="#=0 % ' + decimal_to_cents( tuning_table['tuning_data'][i] ).toFixed(6) + '"' + newline;
    }

  }

  file += newline + "; Set reference key to absolute frequency (not scale note but midi key)" + newline;
  file += "note " + tuning_table['base_midi_note'] + '="! ' + tuning_table['base_frequency'].toFixed(6) + '"' + newline;
  file += "[Scale End]" + newline;

  // convert file to data URI
  var uriContent = "data:application/octet-stream," + encodeURIComponent( file );

  // add button to export tuning
  $( "#export-buttons" ).append('<li><a download="' + tuning_table['filename'] + '.tun" href="' + uriContent + '" id="btn-dl-anamark-tun"><span class="glyphicon glyphicon-download" aria-hidden="true"></span> Download AnaMark Tuning (.tun)</a></li>');

  // success
  return true;

}

function export_maxmsp_coll() {

  // assemble the coll file contents
  var file = "# Tuning file for Max/MSP coll objects. - Created using " + APP_TITLE + newline;
  file += "# " + $( "#txt_name" ).val() + newline;
  file += "#" + newline;

  for ( i = 0; i < TUNING_MAX_SIZE; i++ ) {
    file += i + ", " + tuning_table['freq'][i].toFixed(7) + ";" + newline;
  }

  // convert file to data URI
  var uriContent = "data:application/octet-stream," + encodeURIComponent( file );

  // add button to export tuning
  $( "#export-buttons" ).append('<li><a download="' + tuning_table['filename'] + '.txt" href="' + uriContent + '" id="btn-dl-maxmsp-coll"><span class="glyphicon glyphicon-download" aria-hidden="true"></span> Download Max/MSP coll Tuning (.txt)</a></li>');

  // success
  return true;

}

function export_scala_scl() {

  // assemble the .scl file contents
  var file = "! " + tuning_table['filename'] + ".scl" + newline;
  file += "! Created using " + APP_TITLE + newline;
  file += "!" + newline;
  file += $( "#txt_name" ).val() + newline + " ";

  file += tuning_table['note_count']-1 + newline;
  file += "!" + newline;

  for ( i = 1; i < tuning_table['note_count']; i++ ) {

    file += " " + decimal_to_cents( tuning_table['tuning_data'][i] ).toFixed(6) + newline;

  }

  // convert file to data URI
  var uriContent = "data:application/octet-stream," + encodeURIComponent( file );

  // add button to export tuning
  $( "#export-buttons" ).append('<li><a download="' + tuning_table['filename'] + '.scl" href="' + uriContent + '" id="btn-dl-scala-scl"><span class="glyphicon glyphicon-download" aria-hidden="true"></span> Download Scala Tuning (.scl)</a></li>');

  // success
  return true;

}

function export_scala_kbm() {

  // assemble the .kbm file contents
  var file = "! Template for a keyboard mapping" + newline;
  file += "!" + newline;
  file += "! Size of map. The pattern repeats every so many keys:" + newline;
  file += parseInt( tuning_table['note_count']-1 ) + newline;
  file += "! First MIDI note number to retune:" + newline;
  file += "0" + newline;
  file += "! Last MIDI note number to retune:" + newline;
  file += "127" + newline;
  file += "! Middle note where the first entry of the mapping is mapped to:" + newline;
  file += parseInt( tuning_table['base_midi_note'] ) + newline;
  file += "! Reference note for which frequency is given:" + newline;
  file += parseInt( tuning_table['base_midi_note'] ) + newline;
  file += "! Frequency to tune the above note to" + newline;
  file += parseFloat( tuning_table['base_frequency'] ) + newline;
  file += "! Scale degree to consider as formal octave (determines difference in pitch" + newline;
  file += "! between adjacent mapping patterns):" + newline;
  file += parseInt( tuning_table['note_count']-1 ) + newline;
  file += "! Mapping." + newline;
  file += "! The numbers represent scale degrees mapped to keys. The first entry is for" + newline;
  file += "! the given middle note, the next for subsequent higher keys." + newline;
  file += "! For an unmapped key, put in an \"x\". At the end, unmapped keys may be left out." + newline;

  for ( i = 0; i < parseInt( tuning_table['note_count']-1 ); i++ ) {
    file += i + newline;
  }

  // convert file to data URI
  var uriContent = "data:application/octet-stream," + encodeURIComponent( file );

  // add button to export tuning
  $( "#export-buttons" ).append('<li><a download="Linear mapping - note ' + tuning_table['base_midi_note'] + " at " + tuning_table['base_frequency'] + ' Hz.kbm" href="' + uriContent + '" id="btn-dl-scala-kbm"><span class="glyphicon glyphicon-download" aria-hidden="true"></span> Download Scala Mapping (.kbm)</a></li>');

  return true;

}

function export_kontakt_script() {

  // assemble the kontakt script contents
  var file = "{**************************************" + newline;
  file += $( "#txt_name" ).val() + newline;
  file += "MIDI note " + tuning_table['base_midi_note'] + " (" + midi_note_number_to_name( tuning_table['base_midi_note'] ) + ") = " + parseFloat(tuning_table['base_frequency']) + " Hz" + newline;
  file += "Created using " + APP_TITLE + newline;
  file += "****************************************}" + newline + newline;

  file += "on init" + newline;
  file += "declare %keynum[" + TUNING_MAX_SIZE + "]" + newline;
  file += "declare %tune[" + TUNING_MAX_SIZE + "]" + newline;
  file += "declare $bend" + newline;
  file += "declare $key" + newline + newline;

  for ( i = 0; i < TUNING_MAX_SIZE; i++ ) {

    var this_note = ftom( tuning_table['freq'][i] );

    // if we're out of range of the default Kontakt tuning, leave note as default tuning
    if ( this_note[0] < 0 || this_note[0] >= TUNING_MAX_SIZE ) {

      file += "%keynum[" + i + "] := " + i + newline;
      file += "%tune[" + i + "] := 0" + newline;

    }

    // success, we're in range of another note, so we'll change the tuning +/- 50c
    else {

      file += "%keynum[" + i + "] := " + this_note[0] + newline;
      file += "%tune[" + i + "] := " + parseInt( this_note[1]*1000 ) + newline;

    }

  }

  file += "end on" + newline + newline;

  file += "on note" + newline;
  file += "$key := %keynum[$EVENT_NOTE]" + newline;
  file += "$bend := %tune[$EVENT_NOTE]" + newline;
  file += "change_note ($EVENT_ID, $key)" + newline;
  file += "change_tune ($EVENT_ID, $bend, 0)" + newline;
  file += "end on" + newline;

  // convert file to data URI
  var uriContent = "data:application/octet-stream," + encodeURIComponent( file );

  // add button to export tuning
  $( "#export-buttons" ).append('<li><a download="' + tuning_table['filename'] + '.txt" href="' + uriContent + '" id="btn-dl-kontakt-script"><span class="glyphicon glyphicon-download" aria-hidden="true"></span> Download Kontakt Tuning Script (.txt)</a></li>');

  // success
  return true;

}
