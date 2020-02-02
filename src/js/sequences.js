/**
 * SEQUENCING GENERATING FUNCTIONS
 */

/* global alert, location, jQuery, localStorage, navigator */
import { PRIMES } from './constants.js'
import { line_to_decimal, decimal_to_cents } from './helpers.js'

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

    if (num === 0 || num <= roundinv) {
      break;
    }

    num = 1.0 / num;
    iterations++;
  }

  return cf;
}

// calculate a single convergent for a given continued fraction
function get_convergent(cf, depth=0) {
  var cfdigit; // the continued fraction digit
  var num; // the convergent numerator
  var den; // the convergent denominator
  var tmp; // for easy reciprocation

  if (depth >= cf.length || depth === 0)
    depth = cf.length;

  for (let d = 0; d < depth; d++) {
    cfdigit = cf[d];
    num = cfdigit;
    den = 1;

    // calculate the convergent
    for (let i = d; i > 0; i--) {
    tmp = den;
    den = num;
    num = tmp;
    num += den * cf[i - 1];
    }
  }
  return num + '/' + den;
}

// calculate all best rational approximations given a continued fraction
function get_convergents(cf, numarray, denarray, perlimit, cindOut=null) {
  var cfdigit; // the continued fraction digit
  var num; // the convergent numerator
  var den; // the convergent denominator
  var scnum; // the semiconvergent numerator
  var scden; // the semiconvergen denominator
  var cind = []; // tracks indicies of convergents

  for (let d = 0; d < cf.length; d++) {
    cfdigit = cf[d];
    num = cfdigit;
    den = 1;

    // calculate the convergent
    for (let i = d; i > 0; i--) {
      [den, num] = [num, den]
      num += den * cf[i - 1];
    }

    if (d > 0) {
      for (let i = 1; i < cfdigit; i++) {
        scnum = num - (cfdigit - i) * numarray[cind[d-1]];
        scden = den - (cfdigit - i) * denarray[cind[d-1]];

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

  if (!(cindOut===null)) {
    for (let i = 0; i < cind.length; i++) {
      cindOut.push(cind[i]);
    }
  }
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

  for (let i = 1; i < cf.length; i++) {
    L -= c * cf[i];
    s = c;
    c = L - s;

    // break if g is some equal division of period
    if (c < (1 / roundf) && cf.length < maxcfsize) {
      // add size-1 
      // not sure if flaw in the algorithm or weird edge case

      if (dd[dd.length-2] !== dd[dd.length-1]-1)
        dd.splice(dd.length-1, 0, dd[dd.length-1]-1);

      break;
    }

    if (c < threshold) {
      var ind = sum_array(cf, i+1);
      dd.splice(ind+1, dd.length - ind);
      break;
    }
  }

  // the first two periods are trivial
  dd.shift();
  dd.shift();

  jQuery("#info_rank_2_mos").text(dd.join(", "));
}

// helper function to simply pass in an interval and get an array of ratios returned
function get_rational_approximations(intervalIn, numerators, denominators, roundf=999999,
cidxOut=null, ratiosOut=null, numlimits=null, denlimits=null, ratiolimits=null) {
  var cf = []; // continued fraction

  cf = get_cf(intervalIn, 15, roundf);
  get_convergents(cf, numerators, denominators, roundf, cidxOut);

  var doRatios = !(ratiosOut===null);
  var doNumLim = !(numlimits===null);
  var doDenLim = !(denlimits===null);
  var doRatioLim = !(ratiolimits===null);

  if (doRatios|| doNumLim || doDenLim || doRatioLim) {
    var nlim;
    var dlim;

    for (let i = 0; i < numerators.length; i++) {
      numerators[i] === 1 ? nlim = 1 : nlim = get_prime_limit(numerators[i]);
      denominators[i] === 1 ? dlim = 1 : dlim = get_prime_limit(denominators[i]);

      if (doRatios)
        ratiosOut.push(numerators[i]+"/"+denominators[i]);
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
function get_rank2_mode(period, generator, size, numdown=0) {
  let degrees = [];
  let modeOut = [];
  var interval;

  interval = generator * -numdown;
  for (let n = 0; n < size; n++) {
    while (interval < 0) {
      interval += period;
    }
    if (interval >= period) {
      interval %= period;
    }
    degrees.push(interval);
    interval += generator;
  }

  degrees.sort(function(a, b) { return a-b });
  for (let n = 1; n < degrees.length; n++) {
    modeOut.push(degrees[n] - degrees[n-1]);
  }

  modeOut.push(period - degrees[degrees.length-1]);

  return modeOut;
}

// returns an array representing the prime factorization
// indicies are the 'nth' prime, the value is the powers of each prime
function get_prime_factors(number) {
  number = Math.floor(number);
  if (number === 1) {
    //alert("Warning: 1 has no prime factorization.");
    return 1;
   }
  var factorsout = [];
  var n = number;
  var q = number;
  var loop;

  for (let i = 0; i < PRIMES.length; i++) {
    if (PRIMES[i] > n)
      break;

    factorsout.push(0);

    if (PRIMES[i] === n) {
      factorsout[i]++;
      break;
    }

    loop = true;

    while (loop) {
      q = n / PRIMES[i];

      if (q === Math.floor(q)) {
        n = q;
        factorsout[i]++;
        continue;
      }
      loop = false;
    }
  }

  return factorsout;
}

 // returns an array of integers that share no common factors to the given integer
 function get_coprimes(number) {
  let coprimes = [1];
  var m, d, t;
  for (let i = 2; i < number - 1; i++) {
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
  coprimes.push(number-1);
  return coprimes;
 }

export {
  get_cf,
  get_convergent,
  get_convergents,
  show_mos_cf,
  get_rational_approximations,
  get_rank2_mode,
  get_prime_factors,
  get_coprimes
}
