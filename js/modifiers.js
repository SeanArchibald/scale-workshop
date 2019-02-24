/**
 * TUNING DATA MODIFIERS
 */

// stretch/compress tuning
function modify_stretch() {

  // remove white space from tuning data field
  jQuery( "#txt_tuning_data" ).val( jQuery( "#txt_tuning_data" ).val().trim() );

  if ( isEmpty(jQuery( "#txt_tuning_data" ).val()) ) {

    alert( "No tuning data to modify." );
    return false;

  }

  var octave_size; // (pseudo)octave size in cents
  var stretch_size; // size of new pseudo-octave after stretching
  var stretch_ratio = parseFloat( jQuery( "#input_stretch_ratio" ).val() ); // amount of stretching, ratio

  // split user data into individual lines
  var lines = document.getElementById("txt_tuning_data").value.split(newlineTest);

  // strip out the unusable lines, assemble a multi-line string which will later replace the existing tuning data
  let new_tuning_lines = [];
  for ( var i = 0; i < lines.length; i++ ) {

    // check that line is not empty
    if ( !isEmpty(lines[i]) ) {

      // evaluate the line first
      try {
        eval( lines[i] );
      }
      // if line doesn't evaluate then bail
      catch(err) {
        console.log(err);
        return false;
      }
      // so far so good!

      // line contains a period, so it should be a value in cents
      if ( lines[i].toString().includes('.')) {
        new_tuning_lines.push(( parseFloat( lines[i] ) * stretch_ratio ).toFixed(5));
      }
      // line doesn't contain a period, so it is a ratio
      else {
        new_tuning_lines.push(( ratio_to_cents( lines[i] ) * stretch_ratio ).toFixed(5));
      }

    }

  }

  // update tuning input field with new tuning
  jQuery( "#txt_tuning_data" ).val( new_tuning_lines.join(unix_newline) );

  parse_tuning_data();

  jQuery( "#modal_modify_stretch" ).dialog( "close" );

  // success
  return true;

}

// random variance
function modify_random_variance() {

  // remove white space from tuning data field
  jQuery( "#txt_tuning_data" ).val( jQuery( "#txt_tuning_data" ).val().trim() );

  if ( isEmpty(jQuery( "#txt_tuning_data" ).val()) ) {

    alert( "No tuning data to modify." );
    return false;

  }

  var cents_max_variance = parseFloat( jQuery( "#input_cents_max_variance" ).val() ); // maximum amount of variance in cents
  var vary_period = document.getElementById( "input_checkbox_vary_period" ).checked;

  // split user data into individual lines
  var lines = document.getElementById("txt_tuning_data").value.split(newlineTest);

  // strip out the unusable lines, assemble a multi-line string which will later replace the existing tuning data
  let new_tuning_lines = [];
  for ( var i = 0; i < lines.length; i++ ) {

    // only apply random variance if the line is not the period, or vary_period is true
    if ( vary_period || i < lines.length-1 ) {

      // get a cents offset to add later. ranges from -cents_max_variance to cents_max_variance
      var random_variance = ( Math.random() * cents_max_variance * 2 ) - cents_max_variance;

      // line contains a period, so it should be a value in cents
      if ( lines[i].toString().includes('.') ) {
        new_tuning_lines.push(( parseFloat( lines[i] ) + random_variance ).toFixed(5));
      }
      // line doesn't contain a period, so it is a ratio
      else {
        new_tuning_lines.push(( ratio_to_cents( lines[i] ) + random_variance ).toFixed(5));
      }
    }
    // last line is a period and we're not applying random variance to it
    else {
      new_tuning_lines.push(lines[i]);
    }

  }

  // update tuning input field with new tuning
  jQuery( "#txt_tuning_data" ).val( new_tuning_lines.join(unix_newline) );

  parse_tuning_data();

  jQuery( "#modal_modify_random_variance" ).dialog( "close" );

  // success
  return true;

}

// mode
function modify_mode() {

  // remove white space from tuning data field
  jQuery( "#txt_tuning_data" ).val( jQuery( "#txt_tuning_data" ).val().trim() );

  if ( isEmpty(jQuery( "#txt_tuning_data" ).val()) ) {

    alert( "No tuning data to modify." );
    return false;

  }

  var mode = jQuery( "#input_modify_mode" ).val().split(" ");

  // check user input for invalid items
  for ( i = 0; i < mode.length; i++ ) {

    mode[i] = parseInt( mode[i] );

    if ( isNaN( mode[i] ) || mode[i] < 1 ) {
      alert( "Your mode should contain a list of positive integers, seperated by spaces. E.g." + unix_newline + "5 5 1 3 1 2" );
      return false;
    }

  }

  // split user's scale data into individual lines
  var lines = document.getElementById("txt_tuning_data").value.split(newlineTest);
  debug(lines);
  debug(mode);

  // mode_type will be either intervals (e.g. 2 2 1 2 2 2 1) or from_base (e.g. 2 4 5 7 9 11 12)
  var mode_type = jQuery("#modal_modify_mode input[type='radio']:checked").val();

  if ( mode_type == "intervals" ) {

    // get the total number of notes in the mode
    var mode_sum = mode.reduce(function(a, b) { return a + b; }, 0);

    // number of notes in the mode should equal the number of lines in the scale data field
    if ( mode_sum != lines.length ) {
      alert( "Your mode doesn't add up to the same size as the current scale." + unix_newline + "E.g. if you have a 5 note scale, mode 2 2 1 is valid because 2+2+1=5. But mode 2 2 2 is invalid because 2+2+2 doesn't equal 5." );
      return false;
    }

    // strip out the unusable lines, assemble a multi-line string which will later replace the existing tuning data
    var new_tuning = "";
    var note_count = 1;
    var mode_index = 0;
    for ( var i = 0; i < lines.length; i++ ) {

      if ( mode[mode_index] == note_count ) {

        new_tuning = new_tuning + lines[i];

        // add a newline for all lines except the last
        if ( i < lines.length-1 ) {
          new_tuning += newline;
        }

        mode_index++;
        note_count = 0;

      }
      note_count++;

    }

  }

  // if ( mode_type == "from_base" ) {
  else {

    // number of notes in the mode should equal the number of lines in the scale data field
    if ( mode[mode.length - 1] != lines.length ) {
      alert( "Your mode isn't the same size as the current scale." + unix_newline + "E.g. if you have a 5 note scale, mode 2 4 5 is valid because the final degree is 5. But mode 2 4 6 is invalid because 6 is greater than 5." );
      return false;
    }

    // strip out the unusable lines, assemble a multi-line string which will later replace the existing tuning data
    var new_tuning = "";
    for ( var i = 0; i < lines.length; i++ ) {

      debug( jQuery.inArray(i, mode) );

      if ( jQuery.inArray(i + 1, mode) != -1 ) {

        new_tuning += lines[i];

        // add a newline for all lines except the last
        if ( i < lines.length-1 ) {
          new_tuning += newline;
        }

      }

    }

    debug(new_tuning);

  }

  // update tuning input field with new tuning
  jQuery( "#txt_tuning_data" ).val( new_tuning );

  parse_tuning_data();

  jQuery( "#modal_modify_mode" ).dialog( "close" );

  // success
  return true;

}

// key transpose
function modify_key_transpose() {

  // I will come back to this later... it's going to require some thinking with regards to just ratios...
  return false;

  // remove white space from tuning data field
  jQuery( "#txt_tuning_data" ).val( jQuery( "#txt_tuning_data" ).val().trim() );

  if ( isEmpty(jQuery( "#txt_tuning_data" ).val()) ) {

    alert( "No tuning data to modify." );
    return false;

  }

  // split user data into individual lines
  var lines = document.getElementById("txt_tuning_data").value.split(newlineTest);

  // key to transpose to
  var key = parseInt( jQuery( "#input_modify_key_transpose" ).val() );

  // warn user when their input is unusable
  if ( isNaN( key ) || key < 0 ) {
    alert( "Could not transpose, input error" );
    return false;
  }

  // if key number is larger than the scale, wrap it around
  key = key % lines.length;

  // warn on using 0
  if ( key == 0 ) {
    alert( "1/1 is already on key 0, so no change." );
  }

  // strip out the unusable lines, assemble a multi-line string which will later replace the existing tuning data
  var new_tuning = "";
  for ( var i = 0; i < lines.length; i++ ) {

    // TODO

    new_tuning = new_tuning + lines[i];

    // add a newline for all lines except the last
    if ( i < lines.length-1 ) {
      new_tuning += unix_newline;
    }

  }

  // update tuning input field with new tuning
  jQuery( "#txt_tuning_data" ).val( new_tuning );

  parse_tuning_data();

  jQuery( "#modal_modify_mode" ).dialog( "close" );

  // success
  return true;

}
