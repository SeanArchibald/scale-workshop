/**
 * HELPER FUNCTIONS
 */

// Set precision to cover possible integers before scientific notation
Decimal.precision = 21

// modulo function
Number.prototype.mod = function (n) {
  return ((this % n) + n) % n
}

// modulo function (forward compatibility)
function mathModulo(n, d) {
  return ((n % d) + d) % d
}

// logarithm-based modulo function, only supporting modulus > 1
function logModulo(n, d) {
  const [floatn, floatd] = [n, d].map(parseFloat);
  if ( floatn === 0 
    || floatd <= 1 
    || Number.isNaN(floatn) 
    || Number.isNaN(floatd)
    )
    return NaN;

  const [nlog, dlog] = [Decimal.log2(n), Decimal.log2(d)];
  const modPower = nlog.div(dlog).floor();
  return Decimal(n).div(Decimal(d).pow(modPower)).toNumber();
}

// convert a cents value to decimal
function cents_to_decimal(input) {
  const inputfloat = parseFloat(input);
  if (Number.isNaN(inputfloat)) return NaN;
  return Decimal.pow(2, Decimal(input).div(1200)).toNumber();
}

// convert a ratio (string 'x/y') to decimal
function ratio_to_decimal(input) {
  if (isRatio(input)) {
    const [val1, val2] = input.split('/').map(Decimal);
    return val1.div(val2).toNumber();
  } else {
    alert('Invalid input: ' + input)
    return false
  }
}

// convert a comma decimal (1,25) to decimal
function commadecimal_to_decimal(input) {
  if (isCommaDecimal(input)) {
    input = parseFloat(input.toString().replace(',', '.'))
    if (input === 0 || isNaN(input)) {
      return false
    } else {
      return input
    }
  } else {
    alert('Invalid input: ' + input)
    return false
  }
}

// convert a decimal (1.25) into commadecimal (1,25)
function decimal_to_commadecimal(input) {
  if (/^\d+\.?\d*$/.test(input)) {
    return input.toFixed(6).replace('.', ',')
  } else {
    alert('Invalid input: ' + input)
    return false
  }
}

// convert a decimal into cents
function decimal_to_cents(input) {
  if (input === false) {
    return false
  }
  const inputfloat = parseFloat(input);
  if (Number.isNaN(inputfloat) || inputfloat === 0) {
    return false
  } else {
    input = Decimal(input)
    return Decimal.log2(input).mul(1200).toNumber();
  }
}

// convert a ratio to cents
function ratio_to_cents(input) {
  return decimal_to_cents(ratio_to_decimal(input))
}

// convert an n-of-m-edo (string 'x\y') to decimal
function n_of_edo_to_decimal(input) {
  if (isNOfEdo(input)) {
    const [val1, val2] = input.split('\\').map(Decimal)
    return Decimal(2).pow(val1.div(val2)).toNumber();
  } else {
    alert('Invalid input: ' + input)
    return false
  }
}

// convert an n-of-m-edo (string 'x\y') to cents
function n_of_edo_to_cents(input) {
  return decimal_to_cents(n_of_edo_to_decimal(input))
}

function isCent(input) {
  // true, when the input has numbers at the beginning, followed by a dot, ending with any number of numbers
  // for example: 700.00, -700.00
  if (typeof input !== 'string') {
    return false
  }
  return /^-?\d+\.\d*$/.test(input.trim())
}

function isCommaDecimal(input) {
  // true, when the input has numbers at the beginning, followed by a comma, ending with any number of numbers
  // for example: 1,25
  if (typeof input !== 'string') {
    return false
  }
  return /^\d+\,\d*$/.test(input.trim())
}

function isNOfEdo(input) {
  // true, when the input has numbers at the beginning and the end, separated by a single backslash
  // for example: 7\12, -7\12
  return /^-?\d+\\\d+$/.test(input)
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

// convert any input 'line' to commadecimal, with a padding options for display
function line_to_commadecimal(input, padDecimals = 0, truncateDecimalsPastPad = false) {
  let decimal = line_to_decimal(input)
  if (decimal === false) return decimal

  let decimalStr = String(decimal)

  // Padding stuff
  if (padDecimals > 0) {
    if (decimalStr.includes('.')) {
      const decLength = decimalStr.split('.')[1].length

      if (padDecimals > decLength)
        for (var i = 0; i < padDecimals - decLength; i++) decimalStr += '0'
      else if (truncateDecimalsPastPad && decLength > padDecimals)
        decimalStr = decimalStr.slice(0, decimalStr.indexOf('.') + padDecimals + 1)
    } else decimalStr += '.000000'
  }

  decimalStr = decimalStr.replace('.', ',')

  return decimalStr
}


function isNegativeInterval(input) {
  // true if cents or N of EDO evaluates to a negative number
  // LINE_TYPE.INVALID if invalid type or if ratio, decimal, 
  //   or N of EDO denominator is negative
  // false otherwise

  if (typeof input !== 'string') return LINE_TYPE.INVALID

  const hasNegation = input.match('-') !== null;
  const type = getLineType(input);
  switch(type) {
    // Zero is nonnegative
    case LINE_TYPE.CENTS:
      return (/^0+\.0*$/.test(input)) ? false : hasNegation;

    case LINE_TYPE.N_OF_EDO:
        return (input.trim()[0] === '0') ? false : hasNegation;

    case LINE_TYPE.RATIO:
    case LINE_TYPE.DECIMAL:
      return (hasNegation) ? LINE_TYPE.INVALID : false;

    default:
      return LINE_TYPE.INVALID
  }
}


// convert any input 'line' to a cents value
function line_to_cents(input) {
  return decimal_to_cents(line_to_decimal(input))
}

// convert a midi note number to a frequency in Hertz
// assuming 12-edo at 440Hz
function mtof(input) {
  const frequencyOfC0 = 8.17579891564
  return frequencyOfC0 * Math.pow(SEMITONE_RATIO_IN_12_EDO, parseInt(input))
}

// convert a frequency to a midi note number and cents offset
// assuming 12-edo at 440Hz
// returns an array [midi_note_number, cents_offset]
function ftom(input) {
  const midiNoteNumberOfA4 = 69
  var midi_note_number = midiNoteNumberOfA4 + 12 * Math.log2(parseFloat(input) / 440)
  var cents_offset = (midi_note_number - Math.round(midi_note_number)) * 100
  midi_note_number = Math.round(midi_note_number)
  return [midi_note_number, cents_offset]
}

// convert an input string into a filename-sanitized version
// if input is empty, returns "tuning" as a fallback
function sanitize_filename(input) {
  if (R.isEmpty(input.trim())) {
    return 'untitled scale'
  }
  return input.replace(/[|&;$%@"<>()+,?]/g, '').replace(/\//g, '_')
}

// clear all inputted scale data
function clear_all() {
  const midiNoteNumberOfA4 = 69
  // empty text fields
  jQuery('#txt_tuning_data').val('')
  jQuery('#txt_name').val('')

  // empty any information displayed on page
  jQuery('#tuning-table').empty()

  // restore default base tuning
  jQuery('#txt_base_frequency').val(440)
  jQuery('#txt_base_midi_note').val(midiNoteNumberOfA4)

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
    description: '',
    filename: ''
  }

  // re-draw graphics
  render_graphic_scale_rule()
}

// find MIDI note name from MIDI note number
function midi_note_number_to_name(input) {
  var n = parseInt(input)
  var quotient = Math.floor(n / 12)
  var remainder = n % 12
  var name = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  return name[remainder] + quotient
}

// calculate the sum of the values in a given array given a stopping index
function sum_array(array, endIndex) {
  return array.slice(0, endIndex).reduce((sum, x) => sum + parseInt(x), 0)
}

// rotates the array by given steps
function rotate(array, steps) {
  let startInd = array.length - mathModulo(steps, array.length)
  return [...array.slice(startInd), ...array.slice(0, startInd)]
}

// calculate a continued fraction for the given number
function get_cf(num, maxiterations = 15, roundf = 10) {
  const numfloat = parseFloat(num);
  if (numfloat === 0 || maxiterations < 1) return [0]
  else if (Number.isNaN(numfloat)) return NaN

  num = Decimal(num)

  var cf = [] // the continued fraction
  var digit

  var roundInv = Decimal(0.1).pow(roundf);

  var iterations = 0
  while (iterations < maxiterations) {
    digit = num.floor().toNumber();
    cf.push(digit)

    num = num.sub(digit)

    if (num.eq(0) || num.lte(roundInv))
      break

    num = Decimal(1).div(num);

    iterations++
  }

  return cf
}

// calculate a single convergent for a given continued fraction
function get_convergent(cf, depth = 0) {
  // Return whole number if cf is a number
  if (typeof cf === 'number') {
    let cfNum = parseInt(cf)
    if (cfNum === 0) return '0/1'
    else if (!cfNum) return NaN
    else return `${cfNum}/1`
  }

  // Make sure indicies are valid
  let parsedCf = []
  for (let num of cf) {
    num = parseInt(num)
    if (isNaN(num)) return NaN
    parsedCf.push(num)
  }

  var cfdigit // the continued fraction digit
  var num // the convergent numerator
  var den // the convergent denominator
  var tmp // for easy reciprocation

  if (depth >= parsedCf.length || depth == 0) depth = parsedCf.length

  for (var d = 0; d < depth; d++) {
    cfdigit = parsedCf[d]
    num = cfdigit
    den = 1

    // calculate the convergent
    for (var i = d; i > 0; i--) {
      tmp = den
      den = num
      num = tmp
      num += den * parsedCf[i - 1]
    }
  }

  return `${num}/${den}`
}

// convert a decimal or commadecimal to ratio (string 'x/y'), may have rounding errors for irrationals
function decimal_to_ratio(input, iterations = 15, depth = 0) {
  if (isCommaDecimal(input)) input = commadecimal_to_decimal(input)
  if (input === false) return false

  const inputfloat = parseFloat(input)

  if (inputfloat === 0 || Number.isNaN(inputfloat)) {
    return false
  } else {
    var inputcf = get_cf(input, iterations, 6)
    return get_convergent(inputcf, depth)
  }
}

function cents_to_ratio(input, iterations = 15, depth = 0) {
  return decimal_to_ratio(cents_to_decimal(input), iterations, depth)
}

function n_of_edo_to_ratio(input, iterations = 15, depth = 0) {
  return decimal_to_ratio(n_of_edo_to_decimal(input), iterations, depth)
}

// calculate all best rational approximations given a continued fraction
function get_convergents(cf, numarray, denarray, perlimit, cindOut = null) {
  var cfdigit // the continued fraction digit
  var num // the convergent numerator
  var den // the convergent denominator
  var scnum // the semiconvergent numerator
  var scden // the semiconvergen denominator
  var cind = [] // tracks indicies of convergents

  for (var d = 0; d < cf.length; d++) {
    cfdigit = cf[d]
    num = cfdigit
    den = 1

    // calculate the convergent
    for (var i = d; i > 0; i--) {
      ;[den, num] = [num, den]
      num += den * cf[i - 1]
    }

    if (d > 0) {
      for (var i = 1; i < cfdigit; i++) {
        scnum = num - (cfdigit - i) * numarray[cind[d - 1]]
        scden = den - (cfdigit - i) * denarray[cind[d - 1]]

        if (scden > perlimit) break

        numarray.push(scnum)
        denarray.push(scden)
      }
    }

    if (den > perlimit) break

    cind.push(numarray.length)
    numarray.push(num)
    denarray.push(den)
  }

  if (!(cindOut === null)) {
    for (var i = 0; i < cind.length; i++) {
      cindOut.push(cind[i])
    }
  }

  //for (var i = 0; i < denarray.length; i++)
  //  console.log(numarray[i]+"/"+denarray[i]);
}

// generate and display MOS list
function show_mos_cf(per, gen, ssz, threshold) {
  var maxsize = 400 // maximum period size
  var maxcfsize = 12 // maximum continued fraction length
  var roundf = 4 // rounding factor in case continued fraction blows up

  threshold = Decimal(threshold);

  per = line_to_decimal(per)
  if (per <= 0 || isNaN(per)) {
    jQuery('#info_rank_2_mos').text('invalid period')
    return false
  }

  gen = line_to_decimal(gen)
  if (gen <= 0 || isNaN(gen)) {
    jQuery('#info_rank_2_mos').text('invalid generator')
    return false
  }

  var genlog = Decimal.log(gen).div(Decimal.log(per)).toNumber(); // the logarithmic ratio to generate MOS info

  var cf = [] // continued fraction
  var nn = [] // MOS generators
  var dd = [] // MOS periods

  cf = get_cf(genlog, maxcfsize, roundf)
  get_convergents(cf, nn, dd, maxsize)

  // filter by step size threshold
  var gc = decimal_to_cents(gen)
  var pc = decimal_to_cents(per)
  var L = pc + gc // Large step
  var s = pc // small step
  var c = gc // chroma (L - s)

  let roundInv = Decimal(1).div(roundf);

  for (var i = 1; i < cf.length; i++) {
    L -= c * cf[i]
    s = c
    c = L - s

    // break if g is some equal division of period
    if (roundInv.gte(c) && cf.length < maxcfsize) {
      // add size-1
      // not sure if flaw in the algorithm or weird edge case

      if (dd[dd.length - 2] != dd[dd.length - 1] - 1)
        dd.splice(dd.length - 1, 0, dd[dd.length - 1] - 1)

      break
    }

    if (threshold.gte(c)) {
      var ind = sum_array(cf, i + 1)
      dd.splice(ind + 1, dd.length - ind)
      break
    }
  }

  // the first two periods are trivial
  dd.shift()
  dd.shift()

  jQuery('#info_rank_2_mos').text(dd.join(', '))
}

// helper function to simply pass in an interval and get an array of ratios returned
function get_rational_approximations(
  intervalIn,
  numerators,
  denominators,
  roundf = 999999,
  cidxOut = null,
  ratiosOut = null,
  numlimits = null,
  denlimits = null,
  ratiolimits = null
) {
  var cf = [] // continued fraction

  cf = get_cf(intervalIn, 15, roundf)
  get_convergents(cf, numerators, denominators, roundf, cidxOut)

  var doRatios = !(ratiosOut === null)
  var doNumLim = !(numlimits === null)
  var doDenLim = !(denlimits === null)
  var doRatioLim = !(ratiolimits === null)

  if (doRatios || doNumLim || doDenLim || doRatioLim) {
    var nlim
    var dlim
    var rlim

    for (var i = 0; i < numerators.length; i++) {
      numerators[i] == 1 ? (nlim = 1) : (nlim = get_prime_limit(numerators[i]))
      denominators[i] == 1 ? (dlim = 1) : (dlim = get_prime_limit(denominators[i]))

      if (doRatios) ratiosOut.push(numerators[i] + '/' + denominators[i])
      if (doNumLim) numlimits.push(nlim)
      if (doDenLim) denlimits.push(dlim)
      if (doRatioLim) ratiolimits.push(Math.max(nlim, dlim))
    }
  }
}

// rank2 scale algorithm intended for integers, in ET contexts
// for example, period = 12, gen = 7 : [ 2 2 1 2 2 2 1 ]
function get_rank2_mode(period, generator, size, numdown = 0) {
  let degrees = []
  let modeOut = []
  var interval

  interval = generator * -numdown
  for (var n = 0; n < size; n++) {
    while (interval < 0) {
      interval += period
    }
    if (interval >= period) {
      interval %= period
    }
    degrees.push(interval)
    interval += generator
  }

  degrees.sort(function (a, b) {
    return a - b
  })
  for (var n = 1; n < degrees.length; n++) {
    modeOut.push(degrees[n] - degrees[n - 1])
  }

  modeOut.push(period - degrees[degrees.length - 1])

  return modeOut
}

// returns an array representing the prime factorization
// indicies are the 'nth' prime, the value is the powers of each prime
function get_prime_factors(number) {
  number = Math.floor(number)
  if (number == 1) {
    //alert("Warning: 1 has no prime factorization.");
    return 1
  }
  var factorsout = []
  var n = number
  var q = number
  var loop

  for (var i = 0; i < PRIMES.length; i++) {
    if (PRIMES[i] > n) break

    factorsout.push(0)

    if (PRIMES[i] == n) {
      factorsout[i]++
      break
    }

    loop = true

    while (loop) {
      q = n / PRIMES[i]

      if (q == Math.floor(q)) {
        n = q
        factorsout[i]++
        continue
      }
      loop = false
    }
  }

  return factorsout
}

function get_prime_factors_string(number) {
  var factors = get_prime_factors(number)
  var str_out = ''

  for (var i = 0; i < factors.length; i++) {
    if (factors[i] != 0) {
      str_out += PRIMES[i] + '^' + factors[i]

      if (i < factors.length - 1) str_out += ' * '
    }
  }
  return str_out
}

function isPrime(number) {
  var sqrtnum = Math.floor(Math.sqrt(number))

  for (var i = 0; i < PRIMES.length; i++) {
    if (PRIMES[i] >= sqrtnum) break

    if (number % PRIMES[i] == 0) {
      return false
    }
  }
  return true
}

function prevPrime(number) {
  if (number < 2) return 2
  var i = 0
  while (i < PRIMES.length && PRIMES[i++] <= number);
  return PRIMES[i - 2]
}

function nextPrime(number) {
  if (number < 2) return 2
  var i = 0
  while (i < PRIMES.length && PRIMES[i++] <= number);
  return PRIMES[i - 1]
}

function closestPrime(number) {
  var thisPrime = isPrime(number)

  if (number < 2) return 2
  else if (thisPrime) return number

  var np = nextPrime(number)
  var pp = prevPrime(number)

  if (Math.abs(np - number) < Math.abs(pp - number)) return np
  else return pp
}

function scrollToPrime(number, scrollDown) {
  if (scrollDown) return prevPrime(number)
  else return nextPrime(number)
}

function get_prime_limit(number) {
  var factors = get_prime_factors(number)
  return PRIMES[factors.length - 1]
}

function get_prime_limit_of_ratio(numerator, denominator) {
  return Math.max(get_prime_limit(numerator), get_prime_limit(denominator))
}

// returns an array of integers that share no common factors to the given integer
function get_coprimes(number) {
  let coprimes = [1]
  var m, d, t
  for (var i = 2; i < number - 1; i++) {
    m = number
    d = i
    while (d > 1) {
      m = m % d
      t = d
      d = m
      m = t
    }
    if (d > 0) {
      coprimes.push(i)
    }
  }
  coprimes.push(number - 1)
  return coprimes
}

// returns an array of integers that can divide evenly into given number
function get_factors(number) {
  let factors = []
  var nsqrt = Math.floor(Math.sqrt(number))

  for (var n = 2; n <= nsqrt; n++) {
    var q = number / n
    if (Math.floor(q) == q) {
      factors.push(n)
      if (n != q) factors.push(q)
    }
  }

  return factors.sort(function (a, b) {
    return a - b
  })
}

function getGCD(num1, num2) {
  const floats = [num1, num2].map(parseFloat);
  for (const float of floats) if (!Number.isInteger(float) || Number.isNaN(float)) return NaN;

  const n1 = Decimal.abs(num1);
  const n2 = Decimal.abs(num2);

  if (n1.eq(0) || n2.eq(0)) 
    return n1.add(n2).valueOf();
  
  if (n1.eq(1) || n2.eq(1)) 
    return "1";

  if (n1.eq(n2)) 
    return n1.valueOf();

  return getGCD(n2.valueOf(), n1.mod(n2).valueOf());
}

// TODO: GCD of an array

function getLCM(num1, num2) {
  if (num1 === 0 || num2 === 0) return 0

  const gcd = getGCD(num1, num2)
  return Math.trunc((Math.max(num1, num2) / gcd) * Math.min(num1, num2))
}

function getLCMArray(array) {
  let primecounts = []
  let primefactors = []
  var f
  array.forEach(function (item, index, array) {
    f = get_prime_factors(item)
    primefactors.push(f)
  })

  var maxlength = 0
  primefactors.forEach(function (item, index, array) {
    if (item.length > maxlength) maxlength = item.length
  })

  // find the min power of each primes in numbers' factorization
  for (var p = 0; p < maxlength; p++) {
    primecounts.push(0)
    for (var n = 0; n < primefactors.length; n++) {
      f = primefactors[n]
      if (p < f.length) {
        if (primecounts[p] < f[p]) primecounts[p] = f[p]
      }
    }
  }

  let lcm = 1
  primecounts.forEach(function (item, index) {
    lcm *= Math.pow(PRIMES[index], item)
  })

  return lcm
}

// returns false if a ratio divides by 0 or contains NaN
function ratioIsValid(ratio) {
  if (typeof ratio !== 'string') 
    return false;
  // allow negatives
  if (isNegativeInterval(ratio))
    ratio = Array.from(ratio).filter(char => char !== '-').join('');
  if (getLineType(ratio) !== LINE_TYPE.RATIO)
    return false;
  const [num, den] = ratio.split('/').map(parseFloat);
  if (Number.isNaN(num) || Number.isNaN(den) || den === 0)
    return false;
  return true;
}

// returns false is a ratio contains an integer with more than 20 digits
function ratioIsSafe(ratio) {
  const [num, den] = ratio.split('/').map(Decimal);
  if (num.e > 20 || den.e > 20)
    return false;
  return true;
}

// returns a reduced form of given ratio
// returns NaN if the ratio is invalid or unsafe
function simplifyRatio(ratio) {  
  if (!ratioIsValid(ratio) || !ratioIsSafe(ratio))
    return NaN;
  
  const [numerator, denominator] = ratio.split('/');
  const gcd = getGCD(numerator, denominator);
  if (gcd == 0 || Number.isNaN(parseFloat(gcd)))
    return NaN;

  const gcdScalar = Decimal(1).div(gcd);

  let numSigned = Decimal(numerator).mul(Decimal.sign(denominator));
  let denAbs = Decimal.abs(denominator);

  const [numOut, denOut] = [numSigned, denAbs].map(x => x.mul(gcdScalar).round());
  return `${numOut}/${denOut}`;
}

function transposeRatios(ratio, transposerRatio) {
  if (!ratioIsValid(ratio) || !ratioIsValid(transposerRatio))
    return NaN;

  let bailToCents = () => `${roundToNDecimals(6, ratio_to_cents(ratio) + ratio_to_cents(transposerRatio))}`;
  
  if (!ratioIsSafe(ratio) || !ratioIsSafe(transposerRatio))
    return bailToCents();

  const [n1, d1] = ratio.split('/').map(Decimal);
  const [n2, d2] = transposerRatio.split('/').map(Decimal);

  // TODO simplification in place
  const numProduct = n1.mul(n2).valueOf();
  const denProduct = d1.mul(d2).valueOf();
  
  const product = `${numProduct}/${denProduct}`;
  if (!ratioIsSafe(product))
    return bailToCents();
    
  return simplifyRatio(product);
}

function powRatio(ratio, power) {
  if (!ratioIsValid(ratio) || Number.isNaN(parseFloat(power)))
    return NaN;
    
  power = Decimal(power);
  const bailToCents = () => `${roundToNDecimals(6, power.mul(line_to_cents(ratio)).valueOf())}`;

  if (!ratioIsSafe(ratio) || !ratioIsSafe(`${power}/1`))
    return bailToCents();

  const simplified = simplifyRatio(ratio);
  if (Number.isNaN(simplified))
    return NaN;
  if (!ratioIsSafe(simplified))
    return bailToCents();

  let ratioStrings = simplified.split('/');
  if (Decimal.sign(power) < 0)
    ratioStrings = ratioStrings.reverse();

  const result = ratioStrings.map(x => Decimal.pow(x, power.abs())).join('/');
  if (!ratioIsSafe(result))
    return bailToCents();

  return result;
}

// Return a ratio between 1 and the period, where the period cannot be less than 1
function periodReduceRatio(ratio, period) {
  if (!ratioIsValid(ratio) || !ratioIsValid(period))
    return NaN;

  const [ratioNum, ratioDen] = ratio.split('/').map(Decimal);
  const ratioDecimal = Decimal(ratioNum).div(ratioDen);
  
  const [periodNum, periodDen] = period.split('/').map(Decimal);
  const periodDecimal = Decimal(periodNum).div(periodDen);

  if (periodDecimal.lt(1))
    return NaN;

  // See if period is a perfect root of ratio
  const root = ratioDecimal.ln().div(periodDecimal.ln());
  if (root.isInteger())
    {
    const reducedNum = ratioNum.div(periodNum.pow(root)).round();
    const reducedDen = ratioDen.div(periodDen.pow(root)).round();
    return `${reducedNum}/${reducedDen}`;
    }

  const bailToCents = () => `${roundToNDecimals(6, mathModulo(line_to_cents(ratio), line_to_cents(period)))}`;

  if (!ratioIsSafe(ratio) || !ratioIsSafe(period))
    return bailToCents();


  const power = ratioDecimal.ln().div(periodDecimal.ln()).floor();

  // Make scalars from both numerator and denominator of the period ratio to keep integers
  // The reciprocal of the period ratio is used, and if the 'power' is negative, the scalars are also reciprocated
  const periodNumPower = Decimal.pow(periodDen, power.abs());
  const periodDenPower = Decimal.pow(periodNum, power.abs());
  const periodNumScalar = (Decimal.sign(power) > 0) ? [ periodNumPower, 1 ] : [ 1, periodNumPower ];
  const periodDenScalar = (Decimal.sign(power) > 0) ? [ periodDenPower, 1 ] : [ 1, periodDenPower ];

  // Cross multiply with period's numerator & denominator scalars
  const ratioReducedNum = Decimal(ratioNum).mul(periodNumScalar[0]).mul(periodDenScalar[1]);
  const ratioReducedDen = Decimal(ratioDen).mul(periodNumScalar[1]).mul(periodDenScalar[0]);

  // TODO simplify in place

  const result = `${ratioReducedNum}/${ratioReducedDen}`;
  if (!ratioIsSafe(ratio))
    return bailToCents();

  return simplifyRatio(result);
}

function transposeNOfEdos(nOfEdo, transposerNOfEdo) {
  if (typeof nOfEdo !== 'string' || typeof transposerNOfEdo !== 'string') return NaN

  const [deg1, edo1] = nOfEdo.split('\\').map((x) => parseInt(x))
  const [deg2, edo2] = transposerNOfEdo.split('\\').map((x) => parseInt(x))

  if (!edo1 || !edo2 || isNaN(deg1) || isNaN(deg2)) return NaN

  const newEdo = getLCM(edo1, edo2)
  const newDegree = (newEdo / edo1) * deg1 + (newEdo / edo2) * deg2
  return [newDegree, newEdo].join('\\')
}

// transpose an interval by another interval,
// retaining their types when possible
function transposeLine(line, transposer) {
  const lineType = getLineType(line);
  const transposerType = getLineType(transposer);
  if (lineType === LINE_TYPE.INVALID || transposerType === LINE_TYPE.INVALID)
    return NaN;

  // If both are ratios, preserve ratio notation
  if (lineType === LINE_TYPE.RATIO) {
    if (transposerType === LINE_TYPE.RATIO) return transposeRatios(line, transposer)
    else if (transposerType === LINE_TYPE.DECIMAL) {
      let ratio2 = decimal_to_ratio(transposer);
      return transposeRatios(line, ratio2);
    }

    // see if cents or N of EDO is an octave
    else {
      let octs = Decimal.log2(line_to_decimal(transposer));
      if (octs.isInteger()) { // TODO - work with other harmonics?
        const octRatio = Decimal.pow(2, octs.abs());
        const octTransposer = (octs.lt(0)) ? "1/" + octRatio
                                           : octRatio + "/1";
        return transposeRatios(line, octTransposer);
      }
    }
  } else if (lineType === LINE_TYPE.N_OF_EDO) {
    // If both are N of EDOs, preserve N of EDO notation
    if (transposerType === LINE_TYPE.N_OF_EDO) return transposeNOfEdos(line, transposer)

    // See if second type is a power of two
    const line2Ratio = roundToNDecimals(6, line_to_decimal(transposer));
    let octs = Decimal.log2(line2Ratio);
    if (octs.isInteger())
      return transposeNOfEdos(line, `${octs}\\1`);

    // Return result as commadecimal type
    if (transposerType === LINE_TYPE.DECIMAL)
      return decimal_to_commadecimal(n_of_edo_to_decimal(line) * line2Ratio)
  }

  // If the first line is a decimal type, keep decimals
  else if (lineType === LINE_TYPE.DECIMAL) {
    const lineDecimal = line_to_decimal(line);
    let transposerDecimal = line_to_decimal(transposer);
    return decimal_to_commadecimal(lineDecimal * transposerDecimal);
  }

  // All other cases convert to cents, allow negative values
  let lineCents = line_to_cents(line);
  let transposerCents = line_to_cents(transposer);

  const valueOut = lineCents + transposerCents
  return roundToNDecimals(6, valueOut).toFixed(6)
}

// stacks an interval on itself, like a power function.
// if transposeAmt=0, this returns unison.
// if transposeAmt=1, this returns the line unchanged.
function transposeSelf(line, transposeAmt) {
  const lineType = getLineType(line);
  const lineIsNegative = isNegativeInterval(line);
  if (lineIsNegative === LINE_TYPE.INVALID || lineType === LINE_TYPE.INVALID || typeof transposeAmt !== "number")
    return NaN;

  const wholeExp = Number.isInteger(transposeAmt);

  // power function
  if (lineType === LINE_TYPE.DECIMAL)
    return decimal_to_commadecimal(Math.pow(line_to_decimal(line), transposeAmt))
  else if (wholeExp && lineType === LINE_TYPE.RATIO) {
    return powRatio(line, transposeAmt);
  }

  // multiply degree by transpose amount
  else if (wholeExp && lineType === LINE_TYPE.N_OF_EDO) {
    let [deg, edo] = line.split("\\");
    deg *= transposeAmt;
    return `${deg}\\${edo}`;
  }
    
  let value = transposeAmt * line_to_cents(line);
  return value.toFixed(6);
}

function moduloLine(line, modLine) {
  const modType = getLineType(modLine);
  const modIsNegative = isNegativeInterval(modLine);
  if (modType === LINE_TYPE.INVALID || modIsNegative)
    return NaN;

  const lineIsNegative = isNegativeInterval(line);
  const lineType = getLineType(line);
  if (lineIsNegative === LINE_TYPE.INVALID || lineType === LINE_TYPE.INVALID)
    return NaN;

  if (lineType !== LINE_TYPE.CENTS) {
    // Preserve N of EDO notation
    if (lineType === LINE_TYPE.N_OF_EDO) {
      let [numDeg, numEdo] = line.split("\\").map((x) => parseInt(x));

      // If both are N of EDOs, get LCM edo
      if (modType === LINE_TYPE.N_OF_EDO) {
        const [modDeg, modEdo] = modLine.split('\\').map((x) => parseInt(x))
        const lcmEdo = getLCM(numEdo, modEdo)
        return `${((numDeg * lcmEdo) / numEdo) % ((modDeg * lcmEdo) / modEdo)}\\${lcmEdo}`
      }

      // See if mod is a power of 2
      const modDecimal = line_to_decimal(modLine)
      const modLog2 = Decimal.log2(modDecimal)
      if (modLog2.isInteger()) {
        return `${mathModulo(numDeg, numEdo)}\\${numEdo}`
      }
    }

    // Preserve ratio type if possible
    if (lineType === LINE_TYPE.RATIO) {
      if (modType === LINE_TYPE.RATIO) {
        const modDecimal = line_to_decimal(modLine);
        if (modDecimal < 1) return NaN;
        return periodReduceRatio(line, modLine)
      }

      // See if mod type is a reasonable whole number ratio
      const modDecimal = line_to_decimal(modLine);
      if (modDecimal < 1) return NaN;

      const mod_cf = get_cf(modDecimal);
      if (mod_cf.length < 12) {
        const modRatio = get_convergent(mod_cf);  
        return periodReduceRatio(line, modRatio);
      }
    }

    // Preserve decimal type
    else if (lineType === LINE_TYPE.DECIMAL || modType === LINE_TYPE.DECIMAL) {
      return decimal_to_commadecimal([line, modLine].map(line_to_decimal).reduce(logModulo))
    }
  }

  // All other cases convert to cents
  const [lineCents, modCents] = [line, modLine].map(x => roundToNDecimals(12, line_to_cents(x)));
  const centsMod = mathModulo(lineCents, modCents);
  return roundToNDecimals(6, centsMod).toFixed(6);
}

// inverts a line into its negative form, while preserving line-type
function negateLine(line) {
  switch (getLineType(line)) {
    case LINE_TYPE.RATIO:
      let [num, den] = line.split('/')
      return den + '/' + num
    case LINE_TYPE.DECIMAL:
      return decimal_to_commadecimal(1 / commadecimal_to_decimal(line))
    case LINE_TYPE.CENTS:
      if (!isNegativeInterval(line)) {
        return '-' + line
      } else {
        return line.replace('-', '')
      }
    case LINE_TYPE.N_OF_EDO:
      if (!isNegativeInterval(line)) {
        return '-' + line
      } else {
        return line.replace('-', '')
      }
    default:
      return NaN
  }
}

// TODO: functional improvements
function invert_chord(chord) {
  if (!/^(\d+:)+\d+$/.test(chord)) {
    alert('Warning: invalid chord ' + chord)
    return false
  }

  let inverted = chord
  let intervals = chord.split(':').map((x) => parseInt(x))
  let steps = []
  intervals.forEach(function (item, index, array) {
    if (index > 0) {
      steps.push([item, array[index - 1]])
    }
  })
  steps.reverse()
  intervals = [[1, 1]]

  let denominators = []
  steps.forEach(function (item, index) {
    var reduced_interval = simplifyRatio(
      item[0] * intervals[index][0],
      item[1] * intervals[index][1]
    )
    intervals.push(reduced_interval)
    denominators.push(reduced_interval[1])
  })

  var lcm = getLCMArray(denominators)

  chord = []
  intervals.forEach(function (x) {
    chord.push((x[0] * lcm) / x[1])
  })

  return chord.join(':')
}

const roundToNDecimals = (decimals, number) => {
  return Math.round(number * 10 ** decimals) / 10 ** decimals
}

const findIndexClosestTo = (value, array) => {
  return array.map((x) => Math.abs(value - x)).reduce((ci, d, i, a) => (d < a[ci] ? i : ci), 0)
}

function getFloat(id, errorMessage) {
  var value = parseFloat(jQuery(id).val())

  if (isNaN(value) || value === 0) {
    alert(errorMessage)
    return false
  }

  return value
}

function getString(id, errorMessage) {
  var value = jQuery(id).val()

  if (R.isEmpty(value) || R.isNil(value)) {
    alert(errorMessage)
    return false
  }

  return value
}

function getLine(id, errorMessage) {
  var value = jQuery(id).val()

  if (
    R.isEmpty(value) ||
    parseFloat(value) <= 0 ||
    R.isNil(value) ||
    getLineType(value) === LINE_TYPE.INVALID
  ) {
    alert(errorMessage)
    return false
  }

  return value
}

function setScaleName(title) {
  jQuery('#txt_name').val(title)
}

function closePopup(id) {
  jQuery(id).dialog('close')
}

function setTuningData(tuning) {
  jQuery('#txt_tuning_data').val(tuning)
}

const isFunction = (x) => typeof x === 'function'

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
  return url.searchParams.has(key) && !isNaN(url.searchParams.get(key))
    ? parseFloat(url.searchParams.get(key))
    : valueIfMissingOrNan
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
        jQuery(this).dialog('close')
      }
    }
  })
}

// redirect all traffic to https, if not there already
// source: https://stackoverflow.com/a/4723302/1806628
function redirectToHTTPS() {
  if (location.protocol !== 'https:') {
    location.href = 'https:' + window.location.href.substring(window.location.protocol.length)
  }
}

// converts a cents array into a uint8 array for the mnlgtun exporter
function centsTableToMnlgBinary(centsTableIn) {
  const dataSize = centsTableIn.length * 3
  const data = new Uint8Array(dataSize)
  let dataIndex = 0
  centsTableIn.forEach((c) => {
    // restrict to valid values
    let cents = c
    if (cents < 0) cents = 0
    else if (cents >= MNLG_MAXCENTS) cents = MNLG_MAXCENTS

    const semitones = cents / 100.0
    const microtones = Math.trunc(semitones)

    const u16a = new Uint16Array([Math.round(0x8000 * (semitones - microtones))])
    const u8a = new Uint8Array(u16a.buffer)

    data[dataIndex] = microtones
    data[dataIndex + 1] = u8a[1]
    data[dataIndex + 2] = u8a[0]
    dataIndex += 3
  })
  return data
}

// converts a mnlgtun binary string into an array of cents
function mnlgBinaryToCents(binaryData) {
  const centsOut = []
  const tuningSize = binaryData.length / 3
  for (let i = 0; i < tuningSize; i++) {
    const str = binaryData.slice(i * 3, i * 3 + 3)
    const hundreds = str.charCodeAt(0) * 100
    let tens = new Uint8Array([str.charCodeAt(2), str.charCodeAt(1)])
    tens = Math.round((parseInt(new Uint16Array(tens.buffer)) / 0x8000) * 100)
    centsOut.push(hundreds + tens)
  }
  return centsOut
}

// cps_combinations()
// adapted from https://www.geeksforgeeks.org/print-all-possible-combinations-of-r-elements-in-a-given-array-of-size-n/
function cps_combinations(factors, data, start, end, index, cc, products) {
  // Current combination is ready to be printed, print it
  if (index == cc) {
    var combination = []
    for (let j = 0; j < cc; j++) {
      combination.push(data[j])
    }
    products.push(
      combination.reduce(function (accumulator, currentValue) {
        return accumulator * currentValue
      })
    )
  }
  // replace index with all possible elements. The condition "end-i+1 >= cc-index" makes sure that including one element at index will make a combination with remaining elements at remaining positions
  for (let i = start; i <= end && end - i + 1 >= cc - index; i++) {
    data[index] = factors[i]
    cps_combinations(factors, data, i + 1, end, index + 1, cc, products)
  }
}
// Combination Product Set function
// returns all combination products of size cc from factors array
function cps(factors, cc) {
  let products = []
  // store all combinations one by one
  let data = new Array(cc)
  // Print all combination using temporary array 'data[]'
  cps_combinations(factors, data, 0, factors.length - 1, 0, cc, products)
  return products
}

// scaleSort()
// takes an array of lines and returns it in ascending order
function scaleSort(scale = []) {
  return scale.sort(function (a, b) {
    return line_to_decimal(a) - line_to_decimal(b)
  })
}

const isSimpleKeypress = (event) => {
  return !(event.ctrlKey || event.shiftKey || event.altKey || event.metaKey || event.repeat)
}
