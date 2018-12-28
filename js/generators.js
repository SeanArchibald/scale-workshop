/**
 * TUNING DATA GENERATORS
 */

function generate_equal_temperament() {

  var divider = getFloat('#input_number_of_divisions', 'Warning: no divider')
  var period = getString('#input_interval_to_divide', 'Warning: no interval to divide')

  // convert period to cents
  var period_cents = line_to_cents(period);

  // bail if period is invalid
  if (!period_cents) {
    return false;
  }

  setScaleName(divider + " equal divisions of " + period)

  setTuningData(generate_equal_temperament_data(divider, parseFloat(period_cents)));

  parse_tuning_data();

  closePopup('#modal_generate_equal_temperament')

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

  var generator = getLine('#input_rank-2_generator', 'Warning: no generator')

  var generator_cents = line_to_cents(generator);

  // bail if generator is invalid
  if (!generator_cents) {
    return false;
  }

  var period = getLine('#input_rank-2_period', 'Warning: no period')

  var period_cents = line_to_cents(period);

  // bail if period is invalid
  if (!period_cents) {
    return false;
  }

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

  setTuningData(generate_rank_2_temperament_data(parseFloat(generator_cents), parseFloat(period_cents), size, up))

  setScaleName("Rank 2 scale (" + generator + ", " + period + ")");

  parse_tuning_data();

  closePopup('#modal_generate_rank_2_temperament');

  // success
  return true;
}

function generate_rank_2_temperament_data(generator, period, size, up) {

  // empty existing tuning data
  var tuning_data = "";

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
    tuning_data += aa[i].toFixed(6);

    if (i < size) {
      tuning_data += '\n';
    }
  }

  return tuning_data
}

function generate_harmonic_series_segment() {

  var lo = getFloat('#input_lowest_harmonic', 'Warning: lowest harmonic should be a positive integer')
  var hi = getFloat('#input_highest_harmonic', 'Warning: highest harmonic should be a positive integer')

  // bail if lo = hi
  if (lo == hi) {
    alert("Warning: Lowest and highest harmonics are the same. Can't generate a scale based on only one harmonic.");
    return false;
  }

  // ensure that lo is lower than hi
  if (lo > hi) {
    var tmp = lo;
    lo = hi;
    hi = tmp;
  }

  setScaleName("Harmonics " + lo + "-" + hi);

  setTuningData(generate_harmonic_series_segment_data(lo, hi));

  parse_tuning_data();

  closePopup("#modal_generate_harmonic_series_segment");

  // success
  return true;

}

function generate_harmonic_series_segment_data(lo, hi) {
  var tuning_data = '';

  for (i = lo + 1; i <= hi; i++) {

    // add ratio to text box
    tuning_data += i + "/" + lo;

    // add newlines
    if (i < hi) {
      tuning_data += "\n";
    }

  }

  return tuning_data
}

function generate_subharmonic_series_segment() {

  var lo = getFloat('#input_lowest_subharmonic', 'Warning: lowest subharmonic should be a positive integer')
  var hi = getFloat('#input_highest_subharmonic', 'Warning: highest subharmonic should be a positive integer')

  // bail if lo = hi
  if (lo == hi) {
    alert("Warning: Lowest and highest subharmonics are the same. Can't generate a scale based on only one subharmonic.");
    return false;
  }

  // ensure that lo is lower than hi
  if (lo > hi) {
    var tmp = lo;
    lo = hi;
    hi = tmp;
  }

  setTuningData(generate_subharmonic_series_segment_data(lo, hi));

  setScaleName("Subharmonics " + lo + "-" + hi);

  parse_tuning_data();

  closePopup("#modal_generate_subharmonic_series_segment");

  // success
  return true;

}

function generate_subharmonic_series_segment_data(lo, hi) {
  var tuning_data = ''

  for (i = hi - 1; i >= lo; i--) {

    // add ratio to text box
    tuning_data += hi + "/" + i;

    // add newlines
    if (i > lo) {
      tuning_data += "\n";
    }

  }

  return tuning_data
}
