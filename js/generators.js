/**
 * TUNING DATA GENERATORS
 */

function generate_equal_temperament() {

  var divider = parseFloat(jQuery("#input_number_of_divisions").val());

  // check for null input
  if (isNaN(divider) || divider == 0) {
    alert('Warning: no divider');
    return false;
  }

  var period = jQuery("#input_interval_to_divide").val();

  if (period === "" || period == null) {
    alert('Warning: no interval to divide');
    return false;
  }

  // convert period to cents
  var period_cents = line_to_cents(period);

  // bail if period is invalid
  if (!period_cents) {
    return false;
  }

  $("#txt_name").val(divider + " equal divisions of " + period);

  jQuery("#txt_tuning_data").val(generate_equal_temperament_data(divider, period_cents));

  parse_tuning_data();

  $("#modal_generate_equal_temperament").dialog("close");

  // success
  return true;
}

function generate_equal_temperament_data(divider, period) {

  var tuning_data = ''

  // calculate the size of a single step in this tuning
  var step = period / divider;

  for (i = 1; i <= divider; i++) {

    var note = i * step;

    // if returned value is an integer, append a . just to make sure the parser will see it as a cents value later
    if (note.toString().indexOf('.') == -1) {
      note = note.toString() + ".";
    }

    // add cents value to text box
    tuning_data += note;

    // add a newline after each note except the last one
    if (i !== divider) {
      tuning_data += "\n";
    }

  }

  return tuning_data
}

function generate_rank_2_temperament() {

  var generator = jQuery("#input_rank-2_generator").val();

  // check for null input
  if (generator === "" || generator <= 0 || generator == null || line_type(generator) == false) {
    alert('Warning: no generator');
    return false;
  }

  // save original user input for later
  var original_generator = generator;

  generator = line_to_cents(generator);

  // bail if generator is invalid
  if (!generator) {
    return false;
  }

  generator = parseFloat(generator);

  var period = jQuery("#input_rank-2_period").val();

  // check for null input
  if (period === "" || parseFloat(period) <= 0 || period == null || line_type(period) == false) {
    alert('Warning: no period');
    return false;
  }

  // save original user input for later
  var original_period = period;

  period = line_to_cents(period);

  // bail if period is invalid
  if (!period) {
    return false;
  }

  period = parseFloat(period);

  var size = parseInt(jQuery("#input_rank-2_size").val());
  var up = parseInt(jQuery("#input_rank-2_up").val());

  if (isNaN(size) || size < 2) {
    alert('Warning: scale size must be a number greater than 1');
    return false;
  }
  if (isNaN(up) || up < 0 || up >= size) {
    alert('Warning: generators up must be a number greater than -1 and less than the scale size');
    return false;
  }

  // empty existing tuning data
  var tuning_data = jQuery("#txt_tuning_data");
  tuning_data.val("");

  // array aa stores the scale data, starting from 1/1 (0.0 cents)
  var aa = [0.0];
  for (i = 1; i < size; i++) {

    // calculate generators up
    if (i <= up) {

      aa[i] = (aa[i - 1] + generator).mod(period);
      debug('up: ' + i + ': ' + aa[i]);

    }

    else {

      // first down generator
      if (i == up + 1) {
        aa[i] = (aa[0] - generator).mod(period);
      }

      // subsequent down generators
      else {
        aa[i] = (aa[i - 1] - generator).mod(period);
      }
      debug('down: ' + i + ': ' + aa[i]);
    }

  }

  // sort the scale ascending
  aa.sort(function (a, b) { return a - b });

  // add the period to the scale
  aa.push(period);

  for (i = 1; i <= size; i++) {
    tuning_data.val(tuning_data.val() + aa[i].toFixed(6));

    if (i < size) {
      tuning_data.val(tuning_data.val() + '\n');
    }
  }

  // update name of scale
  $("#txt_name").val("Rank 2 scale (" + original_generator + ", " + original_period + ")");

  parse_tuning_data();

  $("#modal_generate_rank_2_temperament").dialog("close");

  // success
  return true;

}

function generate_harmonic_series_segment() {

  // user input and validation
  var lo = parseInt(jQuery("#input_lowest_harmonic").val());
  if (isNaN(lo) || lo == 0) {
    alert("Warning: lowest harmonic should be a positive integer");
    return false;
  }
  var hi = parseInt(jQuery("#input_highest_harmonic").val());
  if (isNaN(hi) || hi == 0) {
    alert("Warning: highest harmonic should be a positive integer");
    return false;
  }

  // bail if lo = hi
  if (lo == hi) {
    alert("Warning: Lowest and highest harmonics are the same. Can't generate a scale based on only one harmonic.");
    return false;
  }

  // ensure that lo if lower than hi
  if (lo > hi) {
    var tmp = lo;
    lo = hi;
    hi = tmp;
  }

  // empty existing tuning data
  var tuning_data = jQuery("#txt_tuning_data");
  tuning_data.val("");

  for (i = lo + 1; i <= hi; i++) {

    // add ratio to text box
    tuning_data.val(tuning_data.val() + i + "/" + lo);

    // add newlines
    if (i < hi) {
      tuning_data.val(tuning_data.val() + "\n");
    }

  }

  $("#txt_name").val("Harmonics " + lo + "-" + hi);

  parse_tuning_data();

  $("#modal_generate_harmonic_series_segment").dialog("close");

  // success
  return true;

}

function generate_subharmonic_series_segment() {

  // user input and validation
  var lo = parseInt(jQuery("#input_lowest_subharmonic").val());
  if (isNaN(lo) || lo == 0) {
    alert("Warning: lowest subharmonic should be a positive integer");
    return false;
  }
  var hi = parseInt(jQuery("#input_highest_subharmonic").val());
  if (isNaN(hi) || hi == 0) {
    alert("Warning: highest subharmonic should be a positive integer");
    return false;
  }

  // bail if lo = hi
  if (lo == hi) {
    alert("Warning: Lowest and highest harmonics are the same. Can't generate a scale based on only one harmonic.");
    return false;
  }

  // ensure that lo if lower than hi
  if (lo > hi) {
    var tmp = lo;
    lo = hi;
    hi = tmp;
  }

  // empty existing tuning data
  var tuning_data = jQuery("#txt_tuning_data");
  tuning_data.val("");

  for (i = hi - 1; i >= lo; i--) {

    // add ratio to text box
    tuning_data.val(tuning_data.val() + hi + "/" + i);

    // add newlines
    if (i > lo) {
      tuning_data.val(tuning_data.val() + "\n");
    }

  }

  $("#txt_name").val("Subharmonics " + lo + "-" + hi);

  parse_tuning_data();

  $("#modal_generate_subharmonic_series_segment").dialog("close");

  // success
  return true;

}
