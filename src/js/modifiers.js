/**
 * TUNING DATA MODIFIERS
 */

// stretch/compress tuning
function modify_stretch() {

  // remove white space from tuning data field
  trimSelf("#txt_tuning_data")

  if (R.isEmpty(jQuery("#txt_tuning_data").val())) {

    alert("No scale data to modify.");
    return false;

  }

  var stretch_ratio = parseFloat(jQuery("#input_stretch_ratio").val()); // amount of stretching, ratio

  // split user data into individual lines
  var lines = document.getElementById("txt_tuning_data").value.split(newlineTest);

  // strip out the unusable lines, assemble a multi-line string which will later replace the existing tuning data
  let new_tuning_lines = [];
  for (let i = 0; i < lines.length; i++) {
    switch (getLineType(lines[i])) {
      case "invalid":
        alert("Scale data looks invalid: " + lines[i]);
        return false;
      case "cents":
        new_tuning_lines.push((parseFloat(lines[i]) * stretch_ratio).toFixed(5));
        break;
      case "n of edo":
        new_tuning_lines.push((n_of_edo_to_cents(lines[i]) * stretch_ratio).toFixed(5));
        break;
      case "ratio":
        new_tuning_lines.push((ratio_to_cents(lines[i]) * stretch_ratio).toFixed(5));
    }
  }

  // update tuning input field with new tuning
  jQuery("#txt_tuning_data").val(new_tuning_lines.join(unix_newline));

  parse_tuning_data();

  jQuery("#modal_modify_stretch").dialog("close");

  // success
  return true;

}

// random variance
function modify_random_variance() {

  // remove white space from tuning data field
  trimSelf("#txt_tuning_data")

  if (R.isEmpty(jQuery("#txt_tuning_data").val())) {

    alert("No scale data to modify.");
    return false;

  }

  var cents_max_variance = parseFloat(jQuery("#input_cents_max_variance").val()); // maximum amount of variance in cents
  var vary_period = document.getElementById("input_checkbox_vary_period").checked;

  // split user data into individual lines
  var lines = document.getElementById("txt_tuning_data").value.split(newlineTest);

  // strip out the unusable lines, assemble a multi-line string which will later replace the existing tuning data
  let new_tuning_lines = [];
  for (let i = 0; i < lines.length; i++) {

    // only apply random variance if the line is not the period, or vary_period is true
    if (vary_period || i < lines.length - 1) {

      // get a cents offset to add later. ranges from -cents_max_variance to cents_max_variance
      var random_variance = (Math.random() * cents_max_variance * 2) - cents_max_variance;

      // line contains a period, so it should be a value in cents
      if (lines[i].toString().includes('.')) {
        new_tuning_lines.push((parseFloat(lines[i]) + random_variance).toFixed(5));
      }
      // line doesn't contain a period, so it is a ratio
      else {
        new_tuning_lines.push((ratio_to_cents(lines[i]) + random_variance).toFixed(5));
      }
    }
    // last line is a period and we're not applying random variance to it
    else {
      new_tuning_lines.push(lines[i]);
    }

  }

  // update tuning input field with new tuning
  jQuery("#txt_tuning_data").val(new_tuning_lines.join(unix_newline));

  parse_tuning_data();

  jQuery("#modal_modify_random_variance").dialog("close");

  // success
  return true;

}

// mode
function modify_mode() {

  // remove white space from tuning data field
  trimSelf("#txt_tuning_data")

  if (R.isEmpty(jQuery("#txt_tuning_data").val())) {

    alert("No scale data to modify.");
    return false;

  }

  var mode = jQuery("#input_modify_mode").val().split(" ");

  // check user input for invalid items
  for (let i = 0; i < mode.length; i++) {

    mode[i] = parseInt(mode[i]);

    if (isNaN(mode[i]) || mode[i] < 1) {
      alert("Your mode should contain a list of positive integers, seperated by spaces. E.g." + unix_newline + "5 5 1 3 1 2");
      return false;
    }

  }

  // split user's scale data into individual lines
  var lines = document.getElementById("txt_tuning_data").value.split(newlineTest);
  console.log(lines);
  console.log(mode);

  // mode_type will be either intervals (e.g. 2 2 1 2 2 2 1) or from_base (e.g. 2 4 5 7 9 11 12)
  var mode_type = jQuery("#modal_modify_mode input[type='radio']:checked").val();

  if (mode_type == "intervals" || mode_type == "mos") {

    // get the total number of notes in the mode
    var mode_sum = mode.reduce(function (a, b) { return a + b; }, 0);

    // number of notes in the mode should equal the number of lines in the scale data field
    if (mode_sum != lines.length) {
      alert("Your mode doesn't add up to the same size as the current scale." + unix_newline + "E.g. if you have a 5 note scale, mode 2 2 1 is valid because 2+2+1=5. But mode 2 2 2 is invalid because 2+2+2 doesn't equal 5.");
      return false;
    }

    // strip out the unusable lines, assemble a multi-line string which will later replace the existing tuning data
    var new_tuning = "";
    var note_count = 1;
    var mode_index = 0;
    for (let i = 0; i < lines.length; i++) {

      if (mode[mode_index] == note_count) {

        new_tuning = new_tuning + lines[i];

        // add a newline for all lines except the last
        if (i < lines.length - 1) {
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
    if (mode[mode.length - 1] != lines.length) {
      alert("Your mode isn't the same size as the current scale." + unix_newline + "E.g. if you have a 5 note scale, mode 2 4 5 is valid because the final degree is 5. But mode 2 4 6 is invalid because 6 is greater than 5.");
      return false;
    }

    // strip out the unusable lines, assemble a multi-line string which will later replace the existing tuning data
    var new_tuning = "";
    for (let i = 0; i < mode.length; i++) {

      new_tuning += lines[mode[i] - 1];

      // add a newline for all lines except the last
      if (i < mode.length - 1) {
        new_tuning += unix_newline;
      }

    }

  }

  // update tuning input field with new tuning
  jQuery("#txt_tuning_data").val(new_tuning);

  parse_tuning_data();

  jQuery("#modal_modify_mode").dialog("close");

  // success
  return true;

}

// sync beating
function modify_sync_beating() {

  // remove white space from tuning data field
  trimSelf("#txt_tuning_data")

  if (R.isEmpty(jQuery("#txt_tuning_data").val())) {

    alert("No scale data to modify.");
    return false;

  }

  if (R.isEmpty(jQuery("#input_modify_sync_beating_bpm").val())) {

    alert("Please enter a BPM value.");
    return false;

  }

  // get the fundamental frequency of the scale
  var fundamental = jQuery("#input_modify_sync_beating_bpm").val() / 60;
  console.log(fundamental);

  var resolution = jQuery("#select_sync_beating_resolution").val();
  console.log(resolution);

  // loop through all in the scale, convert to ratio, then quantize to fundamental, then convert to cents
  var lines = document.getElementById("txt_tuning_data").value.split(newlineTest);
  console.log(lines);
  var new_tuning = "";

  for (let i = 0; i < lines.length; i++) {

    lines[i] = line_to_decimal(lines[i]);
    new_tuning += R.toString(Math.round(lines[i] * resolution)) + "/" + resolution + unix_newline;

  }
  new_tuning = new_tuning.trim(); // remove final newline

  console.log(new_tuning);

  // set tuning base frequency to some multiple of the fundamental, +/- 1 tritone from the old base frequency
  var basefreq_lowbound = jQuery('#txt_base_frequency').val() * 0.7071067;
  var basefreq = fundamental;
  do {
    basefreq = basefreq * 2;
  } while (basefreq < basefreq_lowbound);

  // update fields and parse
  jQuery("#txt_tuning_data").val(new_tuning);
  jQuery("#txt_base_frequency").val(basefreq);
  parse_tuning_data();

  jQuery("#modal_modify_sync_beating").dialog("close");

  // success
  return true;
}

// key transpose
function modify_key_transpose() {

  // I will come back to this later... it's going to require some thinking with regards to just ratios...
  return false;

  /*
  // remove white space from tuning data field
  trimSelf("#txt_tuning_data")

  if ( R.isEmpty(jQuery( "#txt_tuning_data" ).val()) ) {

    alert( "No scale data to modify." );
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
  for ( let i = 0; i < lines.length; i++ ) {

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
  */
}

// approximate rationals
function modify_replace_with_approximation() {

  var degree_selected = parseInt(jQuery("#input_scale_degree").val());

  if (degree_selected < tuning_table.note_count) {
    var tuning_data = document.getElementById("txt_tuning_data");
    var lines = tuning_data.value.split(newlineTest);

    var aprxs = document.getElementById("approximation_selection");
    var approximation = aprxs.options[aprxs.selectedIndex].text;
    approximation = approximation.slice(0, approximation.indexOf("|")).trim();

    if (degree_selected - 1 < lines.length && line_to_decimal(approximation)) {
      lines[degree_selected - 1] = approximation;
    } else {
      lines.push(approximation);
    }

    var lines_to_text = "";
    lines.forEach(function (item, index, array) {
      lines_to_text += lines[index];
      if (index + 1 < array.length)
        lines_to_text += newline;
    })
    tuning_data.value = lines_to_text;

    parse_tuning_data();

    if (degree_selected < tuning_table.note_count - 1) {
      jQuery("#input_scale_degree").val(degree_selected + 1);
      jQuery("#input_scale_degree").trigger("change");
    }
    // success
    return true;
  }

  // invalid scale degree
  return false;
}

// update list of rationals to choose from
function modify_update_approximations() {

  jQuery("#approximation_selection").empty();

  if (!(R.isEmpty(current_approximations))) {

    var interval = line_to_decimal(jQuery("#input_interval_to_approximate").val());
    var mincentsd = parseFloat(jQuery("#input_min_error").val());
    var maxcentsd = parseFloat(jQuery("#input_max_error").val());
    var minprime = parseInt(jQuery(" #input_approx_min_prime").val());
    var maxprime = parseInt(jQuery(" #input_approx_max_prime").val());
    var semiconvergents = !document.getElementById("input_show_convergents").checked;

    if (minprime < 2) {
      minprime = 2;
      jQuery("#input_approx_min_prime").val(2);
    }

    if (maxprime > 7919) {
      maxprime = 7919;
      jQuery("#input_approx_max_prime").val(7919);
    }

    if (mincentsd < 0)
      mincentsd = 0;

    if (maxcentsd < 0)
      maxcentsd = 0;

    var menulength = (semiconvergents) ? current_approximations.ratios.length : current_approximations.convergent_indicies.length;
    var index;

    for (var i = 0; i < menulength; i++) {
      index = (semiconvergents) ? i : current_approximations.convergent_indicies[i];

      var n = parseInt(current_approximations.numerators[index]);
      var d = parseInt(current_approximations.denominators[index]);
      var prime_limit = current_approximations.ratio_limits[index];

      var fraction_str = current_approximations.ratios[index];
      var fraction = n / d;

      var cents_deviation = decimal_to_cents(fraction) - decimal_to_cents(interval);
      var centsdabs = Math.abs(cents_deviation);
      var cents_rounded = Math.round(10e6 * cents_deviation) / 10e6;

      var centsdsgn;
      if (cents_deviation / centsdabs >= 0)
        centsdsgn = "+";
      else
        centsdsgn = "";

      var description = fraction_str + " | " + centsdsgn + cents_rounded.toString() + "c | " + prime_limit + "-limit";

      if (!interval) {
        jQuery("#approximation_selection").append("<option selected disabled>Error: Invalid interval</option>");
        break;
      } else if (interval == fraction && interval) {  // for cases like 1200.0 == 2/1
        jQuery("#approximation_selection").append("<option>" + description + "</option>");
        break;
      } else if ((centsdabs >= mincentsd && centsdabs <= maxcentsd) && (prime_limit >= minprime && prime_limit <= maxprime)) {
        jQuery("#approximation_selection").append("<option>" + description + "</option>");
      }
    }

    if (document.getElementById("approximation_selection").options.length === 0) {
      semiconvergents ?
        jQuery("#approximation_selection").append("<option selected disabled> None found, try to raise error tolerances.</option>") :
        jQuery("#approximation_selection").append("<option selected disabled> Try to  \"Show next best approximations\" or edit filters.</option>")
    }
  }
}



// approximate by harmonics
function modify_approximate_harmonics() {

  // remove white space from tuning data field
  trimSelf("#txt_tuning_data")

  if (R.isEmpty(jQuery("#txt_tuning_data").val())) {

    alert("No scale data to modify.");
    return false;

  }

  if (R.isEmpty(jQuery("#input_approx_harm_denominator").val())) {

    alert("Please enter a denominator value.");
    return false;

  }

  var denominator = jQuery("#input_approx_harm_denominator").val();

  // loop through all intervals and approximate each with nearest harmonic
  var lines = document.getElementById("txt_tuning_data").value.split(newlineTest);
  console.log(lines);
  var new_tuning = "";

  for (let i = 0; i < lines.length; i++) {

    lines[i] = line_to_decimal(lines[i]);
    new_tuning += R.toString(Math.round(lines[i] * denominator)) + "/" + denominator + unix_newline;

  }
  new_tuning = new_tuning.trim(); // remove final newline

  console.log(new_tuning);

  // update fields and parse
  jQuery("#txt_tuning_data").val(new_tuning);
  parse_tuning_data();

  jQuery("#modal_approximate_harmonics").dialog("close");

  // success
  return true;
}

function modify_approximate_subharmonics() {

  // remove white space from tuning data field
  trimSelf("#txt_tuning_data")

  if (R.isEmpty(jQuery("#txt_tuning_data").val())) {

    alert("No scale data to modify.");
    return false;

  }

  if (R.isEmpty(jQuery("#input_approx_subharm_numerator").val())) {

    alert("Please enter a numerator value.");
    return false;

  }

  var numerator = jQuery("#input_approx_subharm_numerator").val();

  // loop through all intervals and approximate each with nearest harmonic
  var lines = document.getElementById("txt_tuning_data").value.split(newlineTest);
  console.log(lines);
  var new_tuning = "";

  for (let i = 0; i < lines.length; i++) {

    lines[i] = line_to_decimal(lines[i]);
    new_tuning += numerator + "/" + R.toString(Math.round(numerator / lines[i])) + unix_newline;

  }
  new_tuning = new_tuning.trim(); // remove final newline

  console.log(new_tuning);

  // update fields and parse
  jQuery("#txt_tuning_data").val(new_tuning);
  parse_tuning_data();

  jQuery("#modal_approximate_subharmonics").dialog("close");

  // success
  return true;
}

function modify_equalize() {

  // remove white space from tuning data field
  trimSelf("#txt_tuning_data")

  if (R.isEmpty(jQuery("#txt_tuning_data").val())) {

    alert("No scale data to modify.");
    return false;

  }

  if (R.isEmpty(jQuery("#input_equalize_divisions").val())) {

    alert("Please enter the number of divisions.");
    return false;

  }

  // loop through all intervals and approximate each with nearest harmonic
  var lines = document.getElementById("txt_tuning_data").value.split(newlineTest);
  console.log(lines);
  var new_tuning = "";

  var divisions = jQuery("#input_equalize_divisions").val();
  var step_size = line_to_cents(lines[lines.length-1]) / divisions;

  for (let i = 0; i < lines.length-1; i++) {

    // round to nearest step_size
    lines[i] = Math.round(line_to_cents(lines[i]) / step_size) * step_size;

    // ensure that line result has a . at the end
    if ( R.toString(lines[i]).indexOf(".") == -1 ) {
      lines[i] = R.toString(lines[i]) + ".";
    }
    new_tuning += lines[i] + unix_newline;

  }
  new_tuning += lines[lines.length-1]; // leave last line unchanged

  console.log(new_tuning);

  // update fields and parse
  jQuery("#txt_tuning_data").val(new_tuning);
  parse_tuning_data();

  jQuery("#modal_equalize").dialog("close");

  // success
  return true;
}

function modify_octave_reduce() {

  // remove white space from tuning data field
  trimSelf("#txt_tuning_data")

  // get current scale as array
  var scale = jQuery("#txt_tuning_data").val();
  var octave = jQuery("#input_reduce_octave").val();

  // bail if input invalid
  if (R.isEmpty(scale)) {
    alert("No scale data to modify.");
    return false;
  }
  if ( getLineType(octave) === LINE_TYPE.INVALID ) {
    alert("Warning: Interval to reduce to is invalid. Input must be ratio (e.g. 2/1), cents (e.g. 1200.0), n\\m (e.g. 12\\12) or decimal (e.g. 2,0)");
    return false;
  }

  scale = scale.split(unix_newline)

  // each line modulo with the octave
  for (let i=0; i<scale.length; i++) {
    if (scale[i] !== octave) {
      scale[i] = moduloLine(scale[i], octave);
    }
  }

  // sort resulting scale in ascending order
  if (document.getElementById("input_reduce_also_sort").checked) {
    scale = scaleSort(scale);
  }

  // update fields and parse
  jQuery("#txt_tuning_data").val(scale.join(unix_newline));
  parse_tuning_data();

  jQuery("#modal_modify_octave_reduce").dialog("close");

  // success
  return true;
}
