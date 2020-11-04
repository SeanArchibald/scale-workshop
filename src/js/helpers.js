/**
 * HELPER FUNCTIONS
 */

// modulo function
Number.prototype.mod = function (n) {
  return ((this % n) + n) % n;
};

// modulo function (forward compatibility)
function mathModulo(n, d) {
  return ((n % d) + d) % d
}

// convert a cents value to decimal
function cents_to_decimal(input) {
  return Math.pow(2, (parseFloat(input) / 1200.0));
}

// convert a ratio (string 'x/y') to decimal
function ratio_to_decimal(input) {
  if (isRatio(input)) {
    const [val1, val2] = input.split('/')
    return val1 / val2
  } else {
    alert("Invalid input: " + input);
    return false
  }
}

// convert a comma decimal (1,25) to decimal
function commadecimal_to_decimal(input) {
  if (isCommaDecimal(input)) {
    input = parseFloat(input.toString().replace(',', '.'));
    if (input === 0 || isNaN(input)) {
      return false;
    } else {
      return input;
    }
  } else {
    alert("Invalid input: " + input);
    return false;
  }
}

// convert a decimal (1.25) into commadecimal (1,25)
function decimal_to_commadecimal(input) {
  if (isCents(input)) { // a bit misleading
    return input.toString().replace('.', ',');
  } else {
    alert("Invalid input: " + input);
    return false;
  }
}

// convert a decimal into cents
function decimal_to_cents(input) {
  if (input === false) {
    return false
  }
  input = parseFloat(input);
  if (input === 0 || isNaN(input)) {
    return false;
  } else {
    return 1200.0 * Math.log2(input);
  }
}

// convert a ratio to cents
function ratio_to_cents(input) {
  return decimal_to_cents(ratio_to_decimal(input));
}

// convert an n-of-m-edo (string 'x\y') to decimal
function n_of_edo_to_decimal(input) {
  if (isNOfEdo(input)) {
    const [val1, val2] = input.split('\\').map(x => parseInt(x))
    return Math.pow(2, val1 / val2);
  } else {
    alert("Invalid input: " + input);
    return false
  }
}

// convert an n-of-m-edo (string 'x\y') to cents
function n_of_edo_to_cents(input) {
  return decimal_to_cents(n_of_edo_to_decimal(input));
}

function isCent(input) {
  // true, when the input has numbers at the beginning, followed by a dot, ending with any number of numbers
  // for example: 700.00
  return /^\d+\.\d*$/.test(input)
}

function isCommaDecimal(input) {
  // true, when the input has numbers at the beginning, followed by a comma, ending with any number of numbers
  // for example: 1,25
  return /^\d+\,\d*$/.test(input);
}

function isNOfEdo(input) {
  // true, when the input has numbers at the beginning and the end, separated by a single backslash
  // for example: 7\12
  return /^\d+\\\d+$/.test(input)
}

function isRatio(input) {
  // true, when the input has numbers at the beginning and the end, separated by a single slash
  // for example: 3/2
  return /^\d+\/\d+$/.test(input)
}

function getLineType(input) {
  if (isCent(input)) {
    return LINE_TYPE.CENTS
  }
  if (isCommaDecimal(input)) {
    return LINE_TYPE.DECIMAL
  }
  if (isNOfEdo(input)) {
    return LINE_TYPE.N_OF_EDO
  }
  if (isRatio(input)) {
    return LINE_TYPE.RATIO
  }

  return LINE_TYPE.INVALID
}

// convert any input 'line' to decimal
function line_to_decimal(input) {
  let converterFn = () => false

  switch (getLineType(input)) {
    case LINE_TYPE.CENTS:
      converterFn = cents_to_decimal
      break
    case LINE_TYPE.DECIMAL:
      converterFn = commadecimal_to_decimal
      break
    case LINE_TYPE.N_OF_EDO:
      converterFn = n_of_edo_to_decimal
      break
    case LINE_TYPE.RATIO:
      converterFn = ratio_to_decimal
      break
  }

  return converterFn(input)
}

// convert any input 'line' to a cents value
function line_to_cents(input) {
  return decimal_to_cents(line_to_decimal(input));
}

// convert a midi note number to a frequency in Hertz
// assuming 12-edo at 440Hz
function mtof(input) {
  const frequencyOfC0 = 8.17579891564
  return frequencyOfC0 * Math.pow(SEMITONE_RATIO_IN_12_EDO, parseInt(input));
}

// convert a frequency to a midi note number and cents offset
// assuming 12-edo at 440Hz
// returns an array [midi_note_number, cents_offset]
function ftom(input) {
  const midiNoteNumberOfA4 = 69
  var midi_note_number = midiNoteNumberOfA4 + (12 * Math.log2(parseFloat(input) / 440));
  var cents_offset = (midi_note_number - Math.round(midi_note_number)) * 100;
  midi_note_number = Math.round(midi_note_number);
  return [midi_note_number, cents_offset];
}

// convert an input string into a filename-sanitized version
// if input is empty, returns "tuning" as a fallback
function sanitize_filename(input) {
  if (R.isEmpty(input.trim())) {
    return "tuning";
  }
  return input.replace(/[|&;$%@"<>()+,?]/g, "").replace(/\//g, "_");
}

// clear all inputted scale data
function clear_all() {
  const midiNoteNumberOfA4 = 69
  // empty text fields
  jQuery("#txt_tuning_data").val("");
  jQuery("#txt_name").val("");

  // empty any information displayed on page
  jQuery("#tuning-table").empty();

  // restore default base tuning
  jQuery("#txt_base_frequency").val(440);
  jQuery("#txt_base_midi_note").val(midiNoteNumberOfA4);

  // re-init tuning_table
  tuning_table = {
    scale_data: [], // an array containing list of intervals input by the user
    tuning_data: [], // an array containing the same list above converted to decimal format
    note_count: 0, // number of values stored in tuning_data
    freq: [], // an array containing the frequency for each MIDI note
    cents: [], // an array containing the cents value for each MIDI note
    decimal: [], // an array containing the frequency ratio expressed as decimal for each MIDI note
    base_frequency: 440, // init val
    base_midi_note: midiNoteNumberOfA4, // init val
    description: "",
    filename: ""
  };

}

// find MIDI note name from MIDI note number
function midi_note_number_to_name(input) {
  var n = parseInt(input);
  var quotient = Math.floor(n / 12);
  var remainder = n % 12;
  var name = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  return name[remainder] + quotient;
}

// calculate the sum of the values in a given array given a stopping index
function sum_array(array, index) {
  return array.reduce((sum, x) => sum + x, 0)
}

// rotates the array by given steps
function rotate(array, steps) {
  var i = Math.abs(steps);
  while (i > 0) {
    var x;
    if (steps < 0) {
      x = array.shift();
      array.push(x);
    } else if (steps > 0) {
      x = array.pop();
      array.unshift(x);
    }
    i--;
  }
}

// calculate a continued fraction for the given number
function get_cf(num, maxiterations, roundf) {
  var cf = [] // the continued fraction
  var digit;

  var roundinv = 1.0 / roundf;

  var iterations = 0;
  while (iterations < maxiterations) {
    digit = Math.floor(num);
    cf.push(digit);

    num -= digit;

    if (num == 0 || num <= roundinv) {
      break;
    }

    num = 1.0 / num;
    iterations++;
  }

  return cf;
}

// calculate a single convergent for a given continued fraction
function get_convergent(cf, depth = 0) {

  var cfdigit; // the continued fraction digit
  var num; // the convergent numerator
  var den; // the convergent denominator
  var tmp; // for easy reciprocation

  if (depth >= cf.length || depth == 0)
    depth = cf.length;

  for (var d = 0; d < depth; d++) {
    cfdigit = cf[d];
    num = cfdigit;
    den = 1;

    // calculate the convergent
    for (var i = d; i > 0; i--) {
      tmp = den;
      den = num;
      num = tmp;
      num += den * cf[i - 1];
    }
  }

  return num + '/' + den;
}

// convert a decimal to ratio (string 'x/y'), may have rounding errors for irrationals
function decimal_to_ratio(input, iterations = 15, depth = 0) {

  if (input === false)
    return false;

  input = parseFloat(input);

  if (input === 0 || isNaN(input)) {
    return false;
  }
  else {
    var inputcf = get_cf(input, iterations, 100000);
    return get_convergent(inputcf, depth);
  }
}

function cents_to_ratio(input, iterations = 15, depth = 0) {
  return decimal_to_ratio(cents_to_decimal(input), iterations, depth);
}

function n_of_edo_to_ratio(input, iterations = 15, depth = 0) {
  return decimal_to_ratio(n_of_edo_to_decimal(input), iterations, depth);
}

// calculate all best rational approximations given a continued fraction
function get_convergents(cf, numarray, denarray, perlimit, cindOut = null) {
  var cfdigit; // the continued fraction digit
  var num; // the convergent numerator
  var den; // the convergent denominator
  var scnum; // the semiconvergent numerator
  var scden; // the semiconvergen denominator
  var cind = []; // tracks indicies of convergents

  for (var d = 0; d < cf.length; d++) {
    cfdigit = cf[d];
    num = cfdigit;
    den = 1;

    // calculate the convergent
    for (var i = d; i > 0; i--) {
      [den, num] = [num, den]
      num += den * cf[i - 1];
    }

    if (d > 0) {
      for (var i = 1; i < cfdigit; i++) {
        scnum = num - (cfdigit - i) * numarray[cind[d - 1]];
        scden = den - (cfdigit - i) * denarray[cind[d - 1]];

        if (scden > perlimit)
          break;

        numarray.push(scnum);
        denarray.push(scden);
      }
    }

    if (den > perlimit)
      break;

    cind.push(numarray.length);
    numarray.push(num);
    denarray.push(den);
  }

  if (!(cindOut === null)) {
    for (var i = 0; i < cind.length; i++) {
      cindOut.push(cind[i]);
    }
  }

  //for (var i = 0; i < denarray.length; i++)
  //  console.log(numarray[i]+"/"+denarray[i]);
}

// generate and display MOS list
function show_mos_cf(per, gen, ssz, threshold) {
  var maxsize = 400; // maximum period size
  var maxcfsize = 12; // maximum continued fraction length
  var roundf = 1000; // rounding factor in case continued fraction blows up

  per = line_to_decimal(per);
  if (per <= 0 || isNaN(per)) {
    jQuery("#info_rank_2_mos").text("invalid period");
    return false;
  }

  gen = line_to_decimal(gen);
  if (gen <= 0 || isNaN(gen)) {
    jQuery("#info_rank_2_mos").text("invalid generator");
    return false;
  }

  var genlog = Math.log(gen) / Math.log(per); // the logarithmic ratio to generate MOS info

  var cf = []; // continued fraction
  var nn = []; // MOS generators
  var dd = []; // MOS periods

  cf = get_cf(genlog, maxcfsize, roundf);
  get_convergents(cf, nn, dd, maxsize);

  // filter by step size threshold
  var gc = decimal_to_cents(gen);
  var pc = decimal_to_cents(per);
  var L = pc + gc; // Large step
  var s = pc; // small step
  var c = gc; // chroma (L - s)

  for (var i = 1; i < cf.length; i++) {
    L -= c * cf[i];
    s = c;
    c = L - s;

    // break if g is some equal division of period
    if (c < (1 / roundf) && cf.length < maxcfsize) {
      // add size-1 
      // not sure if flaw in the algorithm or weird edge case

      if (dd[dd.length - 2] != dd[dd.length - 1] - 1)
        dd.splice(dd.length - 1, 0, dd[dd.length - 1] - 1);

      break;
    }

    if (c < threshold) {
      var ind = sum_array(cf, i + 1);
      dd.splice(ind + 1, dd.length - ind);
      break;
    }
  }

  // the first two periods are trivial
  dd.shift();
  dd.shift();

  jQuery("#info_rank_2_mos").text(dd.join(", "));
}

// helper function to simply pass in an interval and get an array of ratios returned
function get_rational_approximations(intervalIn, numerators, denominators, roundf = 999999,
  cidxOut = null, ratiosOut = null, numlimits = null, denlimits = null, ratiolimits = null) {

  var cf = []; // continued fraction

  cf = get_cf(intervalIn, 15, roundf);
  get_convergents(cf, numerators, denominators, roundf, cidxOut);

  var doRatios = !(ratiosOut === null);
  var doNumLim = !(numlimits === null);
  var doDenLim = !(denlimits === null);
  var doRatioLim = !(ratiolimits === null);

  if (doRatios || doNumLim || doDenLim || doRatioLim) {
    var nlim;
    var dlim;
    var rlim;

    for (var i = 0; i < numerators.length; i++) {
      numerators[i] == 1 ? nlim = 1 : nlim = get_prime_limit(numerators[i]);
      denominators[i] == 1 ? dlim = 1 : dlim = get_prime_limit(denominators[i]);

      if (doRatios)
        ratiosOut.push(numerators[i] + "/" + denominators[i]);
      if (doNumLim)
        numlimits.push(nlim);
      if (doDenLim)
        denlimits.push(dlim);
      if (doRatioLim)
        ratiolimits.push(Math.max(nlim, dlim));
    }
  }
}

// rank2 scale algorithm intended for integers, in ET contexts
// for example, period = 12, gen = 7 : [ 2 2 1 2 2 2 1 ]
function get_rank2_mode(period, generator, size, numdown = 0) {
  let degrees = [];
  let modeOut = [];
  var interval;

  interval = generator * -numdown;
  for (var n = 0; n < size; n++) {
    while (interval < 0) {
      interval += period;
    }
    if (interval >= period) {
      interval %= period;
    }
    degrees.push(interval);
    interval += generator;
  }

  degrees.sort(function (a, b) { return a - b });
  for (var n = 1; n < degrees.length; n++) {
    modeOut.push(degrees[n] - degrees[n - 1]);
  }

  modeOut.push(period - degrees[degrees.length - 1]);

  return modeOut;
}

// returns an array representing the prime factorization
// indicies are the 'nth' prime, the value is the powers of each prime
function get_prime_factors(number) {
  number = Math.floor(number);
  if (number == 1) {
    //alert("Warning: 1 has no prime factorization.");
    return 1;
  }
  var factorsout = [];
  var n = number;
  var q = number;
  var loop;

  for (var i = 0; i < PRIMES.length; i++) {
    if (PRIMES[i] > n)
      break;

    factorsout.push(0);

    if (PRIMES[i] == n) {
      factorsout[i]++;
      break;
    }

    loop = true;

    while (loop) {
      q = n / PRIMES[i];

      if (q == Math.floor(q)) {
        n = q;
        factorsout[i]++;
        continue;
      }
      loop = false;
    }
  }

  return factorsout;
}

function get_prime_factors_string(number) {
  var factors = get_prime_factors(number);
  var str_out = "";

  for (var i = 0; i < factors.length; i++) {

    if (factors[i] != 0) {
      str_out += PRIMES[i] + "^" + factors[i];

      if (i < factors.length - 1)
        str_out += " * ";
    }
  }
  return str_out;
}

function isPrime(number) {
  var sqrtnum = Math.floor(Math.sqrt(number));

  for (var i = 0; i < PRIMES.length; i++) {
    if (PRIMES[i] >= sqrtnum)
      break;

    if (number % PRIMES[i] == 0) {
      return false;
    }
  }
  return true;
}

function prevPrime(number) {
  if (number < 2)
    return 2;
  var i = 0;
  while (i < PRIMES.length && PRIMES[i++] <= number);
  return PRIMES[i - 2];
}

function nextPrime(number) {
  if (number < 2)
    return 2;
  var i = 0;
  while (i < PRIMES.length && PRIMES[i++] <= number);
  return PRIMES[i - 1];
}

function closestPrime(number) {
  var thisPrime = isPrime(number);

  if (number < 2)
    return 2;
  else if (thisPrime)
    return number;

  var np = nextPrime(number);
  var pp = prevPrime(number);

  if (Math.abs(np - number) < Math.abs(pp - number))
    return np;
  else
    return pp;
}

function scrollToPrime(number, scrollDown) {
  if (scrollDown)
    return prevPrime(number);
  else
    return nextPrime(number);
}

function get_prime_limit(number) {
  var factors = get_prime_factors(number);
  return PRIMES[factors.length - 1];
}

function get_prime_limit_of_ratio(numerator, denominator) {
  return Math.max(get_prime_limit(numerator), get_prime_limit(denominator));
}

// returns an array of integers that share no common factors to the given integer
function get_coprimes(number) {
  let coprimes = [1];
  var m, d, t;
  for (var i = 2; i < number - 1; i++) {
    m = number;
    d = i;
    while (d > 1) {
      m = m % d;
      t = d;
      d = m;
      m = t;
    }
    if (d > 0) {
      coprimes.push(i);
    }
  }
  coprimes.push(number - 1);
  return coprimes;
}

// returns an array of integers that can divide evenly into given number
function get_factors(number) {
  let factors = [];
  var nsqrt = Math.floor(Math.sqrt(number));

  for (var n = 2; n <= nsqrt; n++) {
    var q = number / n;
    if (Math.floor(q) == q) {
      factors.push(n);
      if (n != q)
        factors.push(q);
    }
  }

  return factors.sort(function (a, b) { return a - b });;
}

// returns array of the numerator and denominator of the reduced form of given ratio
function reduce_ratio(numerator, denominator) {
  var num_pf = get_prime_factors(numerator);
  var den_pf = get_prime_factors(denominator);
  let r_pf = [];
  var maxlength = Math.max(num_pf.length, den_pf.length);
  for (var i = 0; i < maxlength; i++) {
    var sum = 0;

    if (i < num_pf.length) {
      sum = num_pf[i];
    }

    if (i < den_pf.length) {
      sum -= den_pf[i];
    }

    r_pf.push(sum);
  }

  var nn = 1;
  var dd = 1;

  for (var i = 0; i < maxlength; i++) {
    if (r_pf[i] > 0)
      nn *= Math.pow(PRIMES[i], r_pf[i]);
    else
      dd *= Math.pow(PRIMES[i], r_pf[i] * -1);
  }

  return [nn, dd];
}

function getGCD(num1, num2) {
  if (num1 === 0 || num2 === 0) return num1 + num2
  else if (num1 === 1 || num2 === 1) return 1
  else if (num1 === num2) return num1

  return getGCD(num2, num1 % num2)
}

// TODO: GCD of an array

function getLCM(num1, num2) {
  if (num1 === 0 || num2 === 0) return 0

  const gcd = getGCD(num1, num2)
  return Math.trunc((Math.max(num1, num2) / gcd) * Math.min(num1, num2))
}

function getLCMArray(array) {
  let primecounts = [];
  let primefactors = [];
  var f;
  array.forEach(function (item, index, array) {
    f = get_prime_factors(item);
    primefactors.push(f);
  });

  var maxlength = 0;
  primefactors.forEach(function (item, index, array) {
    if (item.length > maxlength)
      maxlength = item.length;
  });

  // find the min power of each primes in numbers' factorization
  for (var p = 0; p < maxlength; p++) {
    primecounts.push(0);
    for (var n = 0; n < primefactors.length; n++) {
      f = primefactors[n];
      if (p < f.length) {
        if (primecounts[p] < f[p])
          primecounts[p] = f[p];
      }
    }
  }

  let lcm = 1;
  primecounts.forEach(function (item, index) {
    lcm *= Math.pow(PRIMES[index], item);
  });

  return lcm;
}

// returns array of the numerator and denominator of the reduced form of given ratio
function simplifyRatio(numerator, denominator) {
  const gcd = getGCD(numerator, denominator)
  return [numerator, denominator].map(x => x / gcd)
}

function simplifyRatioString(ratio) {
  const [n, d] = ratio.split('/').map(x => parseInt(x))
  return simplifyRatio(n, d).join('/')
}

function stackRatios(ratioStr1, ratioStr2) {
  const [n1, d1] = ratioStr1.split('/').map(x => parseInt(x))
  const [n2, d2] = ratioStr2.split('/').map(x => parseInt(x))
  return simplifyRatio(n1 * n2, d1 * d2).join('/')
}

function stackNOfEDOs(nOfEdo1Str, nOfEdo2Str) {
  const [deg1, edo1] = nOfEdo1Str.split('\\').map(x => parseInt(x))
  const [deg2, edo2] = nOfEdo2Str.split('\\').map(x => parseInt(x))
  const newEdo = getLCM(edo1, edo2)
  const newDegree = (newEdo / edo1) * deg1 + (newEdo / edo2) * deg2
  return simplifyRatio(newDegree, newEdo).join('\\')
}

function stackLines(line1, line2) {
  const line1Type = getLineType(line1)
  const line2Type = getLineType(line2)

  // If both are ratios, preserve ratio notation
  if (line1Type === LINE_TYPE.RATIO && line2Type === LINE_TYPE.RATIO) {
    return stackRatios(line1, line2)

    // If both are N of EDOs, preserve N of EDO notation
  } else if (line1Type === LINE_TYPE.N_OF_EDO && line2Type === LINE_TYPE.N_OF_EDO) {
    return stackNOfEDOs(line1, line2)

    // If the first line is a decimal type, keep decimals
  } else if (line1Type === LINE_TYPE.DECIMAL) {
    return decimal_to_commadecimal(line_to_decimal(line1) * line_to_decimal(line2))

    // All other cases convert to cents
  } else {
    const value = line_to_cents(line1) + line_to_cents(line2)
    return value.toFixed(6)
  }
}

// stacks an interval on itself. for ratios and decimals, it is a power function
function stackSelf(line, numStacks) {
  const lineType = getLineType(line)
  const wholeExp = numStacks === Math.trunc(numStacks)

  if (lineType === LINE_TYPE.DECIMAL) {
    return decimal_to_commadecimal(Math.pow(line_to_decimal(line), numStacks))
  } else if (wholeExp && lineType === LINE_TYPE.RATIO) {
    let ratio = '1/1'
    if (numStacks > 0) ratio = line.split('/')
    else if (numStacks < 0) ratio = line.split('/').reverse()
    else return ratio
    return ratio.map(x => parseInt(Math.pow(x, Math.abs(numStacks)))).join('/')
  } else if (wholeExp && lineType === LINE_TYPE.N_OF_EDO) {
    const [deg, edo] = line.split('\\')
    return deg * numStacks + '\\' + edo
  } else {
    const value = line_to_cents(line) * (1 + numStacks)
    return value.toFixed(6)
  }
}

function moduloLine(line, modLine) {
  const numType = getLineType(line)
  const modType = getLineType(modLine)

  if (numType === LINE_TYPE.RATIO && modType === LINE_TYPE.RATIO) {
    const periods = Math.floor([line, modLine].map(ratioToDecimal).reduce((a, b) => Math.log(a) / Math.log(b)))
    return stackRatios(line, stackSelf(modLine, -periods))
  } else if (numType === LINE_TYPE.N_OF_EDO && modType === LINE_TYPE.N_OF_EDO) {
    const [numDeg, numEdo] = line.split('\\').map(x => parseInt(x))
    const [modDeg, modEdo] = modLine.slip('\\').map(x => parseInt(x))
    const lcmEdo = getLCM(numEdo, modEdo)
    return (((numDeg * lcmEdo) / numEdo) % ((modDeg * lcmEdo) / modEdo)) + '\\' + lcmEdo
  } else if (numType === LINE_TYPE.DECIMAL) {
    const num = commadecimal_to_decimal(line)
    const mod = line_to_decimal(modLine)
    const periods = Math.floor(num / mod)
    return decimal_to_commadecimal(num / Math.pow(mod, -periods))
  } else if (numType === LINE_TYPE.N_OF_EDO && line_to_decimal(modLine) === 2) {
    const [num, mod] = line.split('\\').map(x => parseInt(x))
    return parseInt(mathModulo(num, mod)) + '\\' + mod
  } else {
    return [line, modLine]
      .map(line_to_cents)
      .reduce(mathModulo)
      .toFixed(6)
  }
}

// TODO: functional improvements
function invert_chord(chord) {
  if (!/^(\d+:)+\d+$/.test(chord)) {
    alert("Warning: invalid chord " + chord);
    return false;
  }

  let inverted = chord;
  let intervals = chord.split(":").map(x => parseInt(x));
  let steps = [];
  intervals.forEach(function (item, index, array) {
    if (index > 0) {
      steps.push([item, array[index - 1]]);
    }
  })
  steps.reverse();
  intervals = [[1, 1]];

  let denominators = [];
  steps.forEach(function (item, index) {
    var reduced_interval = reduce_ratio(item[0] * intervals[index][0], item[1] * intervals[index][1]);
    intervals.push(reduced_interval);
    denominators.push(reduced_interval[1]);
  });

  var lcm = getLCMArray(denominators);

  chord = [];
  intervals.forEach(function (x) {
    chord.push(x[0] * lcm / x[1]);
  });

  return chord.join(":");
}

const roundToNDecimals = (decimals, number) => {
  return Math.round(number * 10 ** decimals) / 10 ** decimals
}

function getFloat(id, errorMessage) {
  var value = parseFloat(jQuery(id).val());

  if (isNaN(value) || value === 0) {
    alert(errorMessage);
    return false;
  }

  return value
}

function getString(id, errorMessage) {
  var value = jQuery(id).val();

  if (R.isEmpty(value) || R.isNil(value)) {
    alert(errorMessage);
    return false;
  }

  return value
}

function getLine(id, errorMessage) {
  var value = jQuery(id).val();

  if (R.isEmpty(value) || parseFloat(value) <= 0 || R.isNil(value) || getLineType(value) === LINE_TYPE.INVALID) {
    alert(errorMessage);
    return false;
  }

  return value
}

function setScaleName(title) {
  jQuery("#txt_name").val(title);
}

function closePopup(id) {
  jQuery(id).dialog("close");
}

function setTuningData(tuning) {
  jQuery("#txt_tuning_data").val(tuning)
}

const isFunction = x => typeof x === 'function'

function getCoordsFromKey(tdOfKeyboard) {
  try {
    return JSON.parse(tdOfKeyboard.getAttribute('data-coord'))
  } catch (e) {
    return []
  }
}

function getSearchParamOr(valueIfMissing, key, url) {
  return url.searchParams.has(key) ? url.searchParams.get(key) : valueIfMissing
}

function getSearchParamAsNumberOr(valueIfMissingOrNan, key, url) {
  return (url.searchParams.has(key) && !isNaN(url.searchParams.get(key))) ? parseFloat(url.searchParams.get(key)) : valueIfMissingOrNan;
}

function trimSelf(el) {
  jQuery(el).val(function (idx, val) {
    return val.trim()
  })
}

function openDialog(el, onOK) {
  jQuery(el).dialog({
    modal: true,
    buttons: {
      OK: onOK,
      Cancel: function () {
        jQuery(this).dialog('close');
      }
    }
  })
}

// redirect all traffic to https, if not there already
// source: https://stackoverflow.com/a/4723302/1806628
function redirectToHTTPS() {
  if (location.protocol !== 'https:') {
    location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
  }
}
