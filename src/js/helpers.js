/**
 * HELPER FUNCTIONS
 */

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
  if (n === 0 || d <= 1) return NaN
  const powers = Math.log2(n) / Math.log2(d)
  let powerMod = Math.floor(powers)
  return n * Math.pow(d, -powerMod)
}

// convert a cents value to decimal
function cents_to_decimal(input) {
  return Math.pow(2, parseFloat(input) / 1200.0)
}

// convert a ratio (string 'x/y') to decimal
function ratio_to_decimal(input) {
  if (isRatio(input)) {
    const [val1, val2] = input.split('/')
    return val1 / val2
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
  input = parseFloat(input)
  if (input === 0 || isNaN(input)) {
    return false
  } else {
    return 1200.0 * Math.log2(input)
  }
}

// convert a ratio to cents
function ratio_to_cents(input) {
  return decimal_to_cents(ratio_to_decimal(input))
}

// convert an n-of-m-edo (string 'x\y') to decimal
function n_of_edo_to_decimal(input) {
  if (isNOfEdo(input)) {
    const [val1, val2] = input.split('\\').map((x) => parseInt(x))
    return Math.pow(2, val1 / val2)
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
  // true if ratio or decimal is below 1, or
  //   if cents or N of EDO evaluates to a negative number
  // LINE_TYPE.INVALID if invalid type or if ratio, decimal,
  //   or N of EDO denominator is negative
  // false otherwise

  if (typeof input !== 'string') return LINE_TYPE.INVALID

  const hasNegation = input.match('-') !== null
  const strippedInput = input.replace('-', '')
  const type = getLineType(strippedInput)
  switch (type) {
    case LINE_TYPE.RATIO:
      if (hasNegation) return LINE_TYPE.INVALID
      else
        return input
          .split('/')
          .map((x) => parseInt(x))
          .reduce((n, d) => n < d)

    case LINE_TYPE.DECIMAL:
      if (hasNegation) return LINE_TYPE.INVALID
      else return input.startsWith('0')

    case LINE_TYPE.CENTS:
      return hasNegation

    case LINE_TYPE.N_OF_EDO:
      if (
        input
          .split('\\')
          .slice(1)
          .map((x) => parseInt(x))[0] > 0
      )
        return hasNegation

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
  num = parseFloat(num)

  if (num === 0 || maxiterations < 1) return [0]
  else if (!num) return NaN

  var cf = [] // the continued fraction
  var digit

  var roundinv = Math.pow(0.1, roundf)

  var iterations = 0
  while (iterations < maxiterations) {
    digit = Math.floor(num)
    cf.push(digit)

    num -= digit

    if (num == 0 || num <= roundinv) {
      break
    }

    num = 1.0 / num
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

  input = parseFloat(input)

  if (input === 0 || isNaN(input)) {
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

  var genlog = Math.log(gen) / Math.log(per) // the logarithmic ratio to generate MOS info

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

  for (var i = 1; i < cf.length; i++) {
    L -= c * cf[i]
    s = c
    c = L - s

    // break if g is some equal division of period
    if (c < 1 / roundf && cf.length < maxcfsize) {
      // add size-1
      // not sure if flaw in the algorithm or weird edge case

      if (dd[dd.length - 2] != dd[dd.length - 1] - 1)
        dd.splice(dd.length - 1, 0, dd[dd.length - 1] - 1)

      break
    }

    if (c < threshold) {
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
  // Check types
  let areNums = [num1, num2].reduce((result, num) => result && typeof num === 'number', true)
  if (!areNums) return NaN

  num1 = Math.abs(num1)
  num2 = Math.abs(num2)

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

// returns array of the numerator and denominator of the reduced form of given ratio
function simplifyRatio(numerator, denominator) {
  if (denominator === 0) return NaN

  const gcdScalar = 1.0 / getGCD(numerator, denominator)
  if (!gcdScalar) return NaN

  numerator *= Math.abs(denominator) / denominator
  denominator = Math.abs(denominator)
  return [numerator, denominator].map((x) => Math.round(x * gcdScalar))
}

function simplifyRatioString(ratio) {
  const [n, d] = ratio.split('/').map((x) => parseInt(x))
  if (!d || isNaN(n)) return NaN
  return simplifyRatio(n, d).join('/')
}

function transposeRatios(ratio, transposerRatio) {
  if (typeof ratio !== 'string' || typeof transposerRatio !== 'string') return NaN

  const [n1, d1] = ratio.split('/').map((x) => parseInt(x))
  const [n2, d2] = transposerRatio.split('/').map((x) => parseInt(x))

  if (!d1 || !d2 || isNaN(n1) || isNaN(n2)) return NaN

  return simplifyRatio(n1 * n2, d1 * d2).join('/')
}

// Return a ratio between 1 and the period, where the period cannot be less than 1
function periodReduceRatio(ratio, period) {
  let periodType = getLineType(period)
  let periodDecimal = line_to_decimal(period)
  if (periodType !== LINE_TYPE.RATIO || periodDecimal <= 1) return NaN

  const [ratioNum, ratioDen] = ratio.split('/').map((x) => parseInt(x))
  const ratioDecimal = ratioNum / ratioDen
  if (!ratioDecimal || !isFinite(ratioDecimal)) return NaN

  const [modNum, modDen] = period.split('/').map((x) => parseInt(x))
  const modDecimal = modNum / modDen
  if (!modDecimal || modDecimal === Infinity || modDecimal === 1) return NaN

  const pow = Math.log2(ratioDecimal) / Math.log2(modDecimal)
  const powFloor = Math.floor(pow)

  // This is a bit convoluted due to avoiding division

  // Make ratios from both numerator and denominator of period ratio
  const [powerFactorNum, powerFactorDen] = [modDen, 1]
    .map((x) => Math.pow(x, Math.abs(powFloor))) // Raise by the absolute value of the floored exponent
    .map((x, i, a) => (powFloor < 0 ? a[a.length - i - 1] : x)) // Swap num & den if exponent is negative

  const [powerDivisorNum, powerDivisorDen] = [modNum, 1]
    .map((x) => Math.pow(x, Math.abs(powFloor)))
    .map((x, i, a) => (powFloor < 0 ? a[a.length - i - 1] : x))

  // Combine the resulting numerators with the original ratio
  const ratioFactorNum = ratioNum * powerFactorNum
  const ratioDivisorNum = ratioDen * powerDivisorNum

  // Divide the resulting ratios to get our interval, which may not be fully simplified
  const [ratioModPowerNum, ratioModPowerDen] = [
    ratioFactorNum * powerDivisorDen,
    ratioDivisorNum * powerFactorDen
  ]

  return simplifyRatio(ratioModPowerNum, ratioModPowerDen).join('/')
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
  // If necessary strip negative symbol before checking type
  const transposerIsNegative = isNegativeInterval(transposer)

  let positiveTransposer = transposer

  if (transposerIsNegative === LINE_TYPE.INVALID) return NaN
  else if (transposerIsNegative) positiveTransposer = transposer.replace('-', '')

  const lineType = getLineType(line)
  const transposerType = getLineType(positiveTransposer)

  if (lineType === LINE_TYPE.INVALID || transposerType === LINE_TYPE.INVALID) return NaN

  let transposerNeedsNegation =
    transposerIsNegative &&
    (transposerType === LINE_TYPE.CENTS || transposerType === LINE_TYPE.N_OF_EDO)

  // If both are ratios, preserve ratio notation
  if (lineType === LINE_TYPE.RATIO) {
    if (transposerType === LINE_TYPE.RATIO) return transposeRatios(line, transposer)
    else if (transposerType === LINE_TYPE.DECIMAL) {
      let ratio2 = decimal_to_ratio(transposer)
      return transposeRatios(line, ratio2)
    }

    // see if cents or N of EDO is an octave
    else {
      let octs = Math.log2(line_to_decimal(positiveTransposer))
      if (octs === Math.trunc(octs)) {
        const octDecimal = Math.pow(2, octs)
        const octTransposer = transposerIsNegative ? '1/' + octDecimal : octDecimal + '/1'
        return transposeRatios(line, octTransposer)
      }
    }
  } else if (lineType === LINE_TYPE.N_OF_EDO) {
    // If both are N of EDOs, preserve N of EDO notation
    if (transposerType === LINE_TYPE.N_OF_EDO) return transposeNOfEdos(line, transposer)

    // See if second type is a power of two
    const line2Ratio = roundToNDecimals(6, line_to_decimal(positiveTransposer))
    let octs = Math.log2(line2Ratio)
    if (transposerNeedsNegation) octs *= -1
    if (octs === Math.trunc(octs)) return transposeNOfEdos(line, `${octs}\\1`)

    // Return result as commadecimal type
    if (transposerType === LINE_TYPE.DECIMAL)
      return decimal_to_commadecimal(n_of_edo_to_decimal(line) * line2Ratio)
  }

  // If the first line is a decimal type, keep decimals
  else if (lineType === LINE_TYPE.DECIMAL) {
    const lineDecimal = line_to_decimal(line)
    let transposerDecimal = line_to_decimal(positiveTransposer)
    if (transposerIsNegative) transposerDecimal = 1 / transposerDecimal
    return decimal_to_commadecimal(lineDecimal * transposerDecimal)
  }

  // All other cases convert to cents, allow negative values
  let lineCents = line_to_cents(line)
  let transposerCents = line_to_cents(positiveTransposer)
  if (transposerNeedsNegation) transposerCents *= -1

  const valueOut = lineCents + transposerCents
  return roundToNDecimals(6, valueOut).toFixed(6)
}

// stacks an interval on itself, like a power function.
// if transposeAmt=0, this returns unison.
// if transposeAmt=1, this returns the line unchanged.
function transposeSelf(line, transposeAmt) {
  // If necessary strip negative symbol before checking type
  const lineIsNegative = isNegativeInterval(line)

  let positiveLine = line

  if (lineIsNegative === LINE_TYPE.INVALID) return NaN
  else if (lineIsNegative) positiveLine = line.replace('-', '')

  const lineType = getLineType(positiveLine)

  if (lineType === LINE_TYPE.INVALID || typeof transposeAmt !== 'number') return NaN

  let lineNeedsNegation =
    lineIsNegative && (lineType === LINE_TYPE.CENTS || lineType === LINE_TYPE.N_OF_EDO)

  const wholeExp = transposeAmt === Math.trunc(transposeAmt)

  // power function
  if (lineType === LINE_TYPE.DECIMAL)
    return decimal_to_commadecimal(Math.pow(line_to_decimal(line), transposeAmt))
  // power function on numerator and denominator
  else if (wholeExp && lineType === LINE_TYPE.RATIO) {
    let ratio = '1/1'

    if (transposeAmt > 0) ratio = line.split('/')
    else if (transposeAmt < 0) ratio = line.split('/').reverse()
    else return ratio

    return ratio.map((x) => Math.trunc(Math.pow(x, Math.abs(transposeAmt)))).join('/')
  }

  // multiply degree by transpose amount
  else if (wholeExp && lineType === LINE_TYPE.N_OF_EDO) {
    let [deg, edo] = positiveLine.split('\\')
    deg *= lineNeedsNegation ? -transposeAmt : transposeAmt
    return `${deg}\\${edo}`
  }

  let value = line_to_cents(positiveLine)
  value *= lineNeedsNegation ? -transposeAmt : transposeAmt
  return value.toFixed(6)
}

function moduloLine(line, modLine) {
  const modType = getLineType(modLine)
  if (modType === LINE_TYPE.INVALID) return NaN

  // If necessary strip negative symbol before checking type
  const lineIsNegative = isNegativeInterval(line)
  let positiveLine = line

  if (lineIsNegative === LINE_TYPE.INVALID) return NaN
  else if (lineIsNegative) positiveLine = line.replace('-', '')

  const lineType = getLineType(positiveLine)
  if (lineType === LINE_TYPE.INVALID) return NaN

  let lineNeedsNegation =
    lineIsNegative && (lineType === LINE_TYPE.CENTS || lineType === LINE_TYPE.N_OF_EDO)

  if (lineType !== LINE_TYPE.CENTS) {
    // Preserve N of EDO notation
    if (lineType === LINE_TYPE.N_OF_EDO) {
      let [numDeg, numEdo] = positiveLine.split('\\').map((x) => parseInt(x))
      numDeg *= lineNeedsNegation ? -1 : 1

      // If both are N of EDOs, get LCM edo
      if (modType === LINE_TYPE.N_OF_EDO) {
        const [modDeg, modEdo] = modLine.split('\\').map((x) => parseInt(x))
        const lcmEdo = getLCM(numEdo, modEdo)
        return `${((numDeg * lcmEdo) / numEdo) % ((modDeg * lcmEdo) / modEdo)}\\${lcmEdo}`
      }

      // See if mod is a power of 2
      const modDecimal = line_to_decimal(modLine)
      const modLog2 = roundToNDecimals(6, Math.log2(modDecimal))
      if (modLog2 === Math.trunc(modLog2)) {
        return `${mathModulo(numDeg, numEdo)}\\${numEdo}`
      }
    }

    // Preserve ratio type if possible
    if (lineType === LINE_TYPE.RATIO) {
      if (modType === LINE_TYPE.RATIO) {
        return periodReduceRatio(line, modLine)
      }

      // See if mod type is a reasonable whole number ratio
      const modDecimal = line_to_decimal(modLine)
      const mod_cf = get_cf(modDecimal)
      if (mod_cf.length < 12) {
        // Maybe less than 15 is sufficient
        const lineDecimal = ratio_to_decimal(line)
        return get_convergent(get_cf(logModulo(lineDecimal, modDecimal)))
      }
    }

    // Preserve decimal type
    else if (lineType === LINE_TYPE.DECIMAL || modType === LINE_TYPE.DECIMAL) {
      return decimal_to_commadecimal([line, modLine].map(line_to_decimal).reduce(logModulo))
    }
  }

  // All other cases convert to cents
  return [positiveLine, modLine]
    .map((x) => roundToNDecimals(6, line_to_cents(x)))
    .map((x, i) => (lineNeedsNegation && i === 0 ? -x : x))
    .reduce(mathModulo)
    .toFixed(6)
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

const isVirtualKeyboardVisible = () => jQuery('#virtual-keyboard').is(':visible')

const isSimpleKeypress = (event) => {
  return !(event.ctrlKey || event.shiftKey || event.altKey || event.metaKey || event.repeat)
}
