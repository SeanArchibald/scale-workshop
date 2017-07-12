function export_anamark_tun() {

  // TUN format spec:
  // http://www.mark-henning.de/files/am/Tuning_File_V2_Doc.pdf

  // assemble the .tun file contents
  var file = "; VAZ Plus/AnaMark softsynth tuning file\n";
  file += "; " + $( "#txt_name" ).val() + "\n";
  file += ";\n";
  file += "; VAZ Plus section\n";
  file += "[Tuning]\n";

  for ( i = 0; i < TUNING_MAX_SIZE; i++ ) {
    file += "note " + i + "=" + parseInt( ratio_to_cents( parseFloat( tuning_table['freq'][i] ) / mtof(0) ) ) + "\n";
  }

  file += "\n; AnaMark section\n";
  file += "[Scale Begin]\n";
  file += 'Format= "AnaMark-TUN"\n';
  file += "FormatVersion= 200\n";
  file += 'FormatSpecs= "http://www.mark-henning.de/eternity/tuningspecs.html"\n\n';
  file += "[Info]\n";
  file += 'Name= "' + tuning_table['filename'] + '.tun"\n';
  file += 'ID= "' + tuning_table['filename'].replace(/ /g,'') + '.tun"\n'; // this line strips whitespace from filename, as per .tun spec
  file += 'Filename= "' + tuning_table['filename'] + '.tun"\n';
  file += 'Description= "' + tuning_table['description'] + '"\n';
  var date = new Date().toISOString().slice(0,10);
  file += 'Date= "' + date + '"\n';
  file += 'Editor= "' + APP_TITLE + '"\n\n';
  file += "[Exact Tuning]\n";

  for ( i = 0; i < TUNING_MAX_SIZE; i++ ) {
    file += "note " + i + "= " + ratio_to_cents( parseFloat( tuning_table['freq'][i] ) / mtof(0) ).toFixed(6) + "\n";
  }

  file += "\n[Functional tuning]\n";

  for ( i = 1; i < tuning_table['note_count']; i++ ) {

    if ( i == tuning_table['note_count']-1 ) {
      file += "note " + i + '="#>-' + i + ' * ' + decimal_to_cents( tuning_table['tuning_data'][i] ).toFixed(6) + ' ~999"\n';
    }
    else {
      file += "note " + i + '="#=0 % ' + decimal_to_cents( tuning_table['tuning_data'][i] ).toFixed(6) + '"\n';
    }

  }

  file += "\n; Set reference key to absolute frequency (not scale note but midi key)\n";
  file += "note " + tuning_table['base_midi_note'] + '="! ' + tuning_table['base_frequency'].toFixed(6) + '"\n';
  file += "[Scale End]\n";

  // convert file to data URI
  var uriContent = "data:application/octet-stream," + encodeURIComponent( file );

  // add button to export tuning
  $( "#export-buttons" ).append('<li><a download="' + tuning_table['filename'] + '.tun" href="' + uriContent + '" id="btn-dl-anamark-tun"><span class="glyphicon glyphicon-download" aria-hidden="true"></span> Download AnaMark Tuning (.tun)</a></li>');

  // success
  return true;

}

function export_maxmsp_coll() {

  // assemble the coll file contents
  var file = "# Tuning file for Max/MSP coll objects. - Created using " + APP_TITLE + "\n";
  file += "# " + $( "#txt_name" ).val() + "\n";
  file += "#\n";

  for ( i = 0; i < TUNING_MAX_SIZE; i++ ) {
    file += i + ", " + tuning_table['freq'][i].toFixed(7) + ";\n";
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
  var file = "! " + tuning_table['filename'] + ".scl\n";
  file += "! Created using " + APP_TITLE + "\n";
  file += "!\n";
  file += $( "#txt_name" ).val() + "\n ";

  file += tuning_table['note_count']-1 + "\n";
  file += "!\n";

  for ( i = 1; i < tuning_table['note_count']; i++ ) {

    file += " " + decimal_to_cents( tuning_table['tuning_data'][i] ).toFixed(6) + '\n';

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
  var file = "! Template for a keyboard mapping\n";
  file += "!\n";
  file += "! Size of map. The pattern repeats every so many keys:\n";
  file += parseInt( tuning_table['note_count']-1 ) + "\n";
  file += "! First MIDI note number to retune:\n";
  file += "0\n";
  file += "! Last MIDI note number to retune:\n";
  file += "127\n";
  file += "! Middle note where the first entry of the mapping is mapped to:\n";
  file += parseInt( tuning_table['base_midi_note'] ) + "\n";
  file += "! Reference note for which frequency is given:\n";
  file += parseInt( tuning_table['base_midi_note'] ) + "\n";
  file += "! Frequency to tune the above note to\n";
  file += parseFloat( tuning_table['base_frequency'] ) + "\n";
  file += "! Scale degree to consider as formal octave (determines difference in pitch\n";
  file += "! between adjacent mapping patterns):\n";
  file += parseInt( tuning_table['note_count']-1 ) + "\n";
  file += "! Mapping.\n";
  file += "! The numbers represent scale degrees mapped to keys. The first entry is for\n";
  file += "! the given middle note, the next for subsequent higher keys.\n";
  file += "! For an unmapped key, put in an \"x\". At the end, unmapped keys may be left out.\n";

  for ( i = 0; i < parseInt( tuning_table['note_count']-1 ); i++ ) {
    file += i + "\n";
  }

  // convert file to data URI
  var uriContent = "data:application/octet-stream," + encodeURIComponent( file );

  // add button to export tuning
  $( "#export-buttons" ).append('<li><a download="Linear mapping - note ' + tuning_table['base_midi_note'] + " at " + tuning_table['base_frequency'] + ' Hz.kbm" href="' + uriContent + '" id="btn-dl-scala-kbm"><span class="glyphicon glyphicon-download" aria-hidden="true"></span> Download Scala Mapping (.kbm)</a></li>');

  return true;

}

function export_kontakt_script() {

  // assemble the kontakt script contents
  var file = "{**************************************\n";
  file += $( "#txt_name" ).val() + "\n";
  file += "MIDI note " + tuning_table['base_midi_note'] + " (" + midi_note_number_to_name( tuning_table['base_midi_note'] ) + ") = " + parseFloat(tuning_table['base_frequency']) + " Hz\n";
  file += "Created using " + APP_TITLE + "\n";
  file += "****************************************}\n\n";

  file += "on init\n";
  file += "declare %keynum[" + TUNING_MAX_SIZE + "]\n";
  file += "declare %tune[" + TUNING_MAX_SIZE + "]\n";
  file += "declare $bend\n";
  file += "declare $key\n\n";

  for ( i = 0; i < TUNING_MAX_SIZE; i++ ) {

    var this_note = ftom( tuning_table['freq'][i] );

    // if we're out of range of the default Kontakt tuning, leave note as default tuning
    if ( this_note[0] < 0 || this_note[0] >= TUNING_MAX_SIZE ) {

      file += "%keynum[" + i + "] := " + i + "\n";
      file += "%tune[" + i + "] := 0\n";

    }

    // success, we're in range of another note, so we'll change the tuning +/- 50c
    else {

      file += "%keynum[" + i + "] := " + this_note[0] + "\n";
      file += "%tune[" + i + "] := " + parseInt( this_note[1]*1000 ) + "\n";

    }

  }

  file += "end on\n\n";

  file += "on note\n";
  file += "$key := %keynum[$EVENT_NOTE]\n";
  file += "$bend := %tune[$EVENT_NOTE]\n";
  file += "change_note ($EVENT_ID, $key)\n";
  file += "change_tune ($EVENT_ID, $bend, 0)\n";
  file += "end on\n";

  // convert file to data URI
  var uriContent = "data:application/octet-stream," + encodeURIComponent( file );

  // add button to export tuning
  $( "#export-buttons" ).append('<li><a download="' + tuning_table['filename'] + '.txt" href="' + uriContent + '" id="btn-dl-kontakt-script"><span class="glyphicon glyphicon-download" aria-hidden="true"></span> Download Kontakt Tuning Script (.txt)</a></li>');

  // success
  return true;

}
