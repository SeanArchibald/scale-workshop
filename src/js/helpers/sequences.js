/**
 * SEQUENCING GENERATING FUNCTIONS
 */

/* global jQuery */
import { PRIMES } from '../constants.js'
import { getPrimesOfRatio } from './numbers.js'
import { stepsToDegrees } from './converters.js'

// returns a rotation of the given array
function rotated(array, steps) {
  let out = []
  var x;
  var i = Math.abs(steps);
  if (steps > 0) {
    while (i > 0) {
      x = array.pop();
      out.unshift(x);
      i--;
    }
  } else if (steps < 0) {
    while (i > 0) {
      x = array.shift();
      out.push(x);
      i--;
    }
  }
  return out;
} 

// mutates the array by rotating by given amount
function rotate(array, steps) {
  var x;
  var i = Math.abs(steps);
  if (steps > 0) {
    while (i > 0) {
      x = array.pop();
      array.unshift(x);
      i--;
    }
  } else if (steps < 0) {
    while (i > 0) {
      x = array.shift();
      array.push(x);
      i--;
    }
  }
} 

// calculate a continued fraction for the given number
function getCF(num, maxdepth=20, roundErr=1e-6) {
  let cf = [] // the continued fraction
  let i = 0

  while (i < maxdepth) {
    var integer = Math.floor(num)
    cf.push(integer)

    num -= integer
    if (num <= roundErr)
      break

    num = 1.0 / num
    i++
  }

  return cf
}

// calculate a single convergent for a given continued fraction
function getConvergent(cf, depth=-1) {
  var num; // the convergent numerator
  var den; // the convergent denominator

  if (depth >= cf.length || depth < 0)
    depth = cf.length - 1;

  [num, den] = [1, cf[depth]]

  for (let d = depth; d > 0; d--) {
    num += cf[d - 1] * den;
    [num, den] = [den, num];
  }
  return den + "/" + num
}

// calculate all best rational approximations given a continued fraction
function getConvergents(cf, numArray, denArray, maxPeriod, cnvgtIdxOut=null) {
  var digit; // the continued fraction digit
  var num; // the convergent numerator
  var den; // the convergent denominator
  var scnum; // the semiconvergent numerator
  var scden; // the semiconvergent denominator
  var cind = []; // tracks indicies of convergents

  for (let d = 0; d < cf.length; d++) {
    digit = cf[d]
    num = digit
    den = 1

    // calculate the convergent
    for (let i = d; i > 0; i--) {
      [den, num] = [num, den]
      num += den * cf[i - 1];
    }

    if (d > 0) {
      for (let i = 1; i < digit; i++) {
        scnum = num - (digit - i) * numArray[cind[d-1]]
        scden = den - (digit - i) * denArray[cind[d-1]]

        if (scden > maxPeriod)
          break

        numArray.push(scnum)
        denArray.push(scden)
      }
    }

    if (den > maxPeriod)
      break

    cind.push(numArray.length)
    numArray.push(num)
    denArray.push(den)
  }

  if (!(cnvgtIdxOut===null)) {
    for (let i = 0; i < cind.length; i++) {
      cnvgtIdxOut.push(cind[i])
    }
  }
}

// pass in a number, can represent the logarithmic ratio of the generator / period
// recieve an object with rational approximation properties
function getRatioStructure(numIn, maxPeriod=1e6) {
  if (isNaN(numIn))
    alert("Error in getRatioStructure(): num is " + numIn)
  
  var ratioStructure = {
    number: numIn,
  	numerators: [], // the numerator of the approximation, degree of generator in MOS size
	  denominators: [], // the denominator of the approximation, MOS sizes
	  rationals: [], // the decimal of the approximation
    ratioStrings: [], // the ratio of the approximation
	  xVectors: [], // x and y vectors are an array of number pairs that add up to the rational of the same index,
	  yVectors: [], // can describe vectors of generator & period, such that [xV[0],yV[0]] = g(x, y), [xV[1],yV[1]] = p(x, y)
	  cf: [], // the continued fraction of the number
    convergentIndicies: [], // indicies of convergents
    length: 0 // the length of most of the properties (except for 'cf' and 'convergentIndicies')
  };

  numIn = Math.abs(parseFloat(numIn))
  ratioStructure.cf = getCF(numIn)
  cf = ratioStructure.cf

  let structureLegend = [
    ratioStructure.x_vectors,
    ratioStructure.y_vectors,
    ratioStructure.numerators,
    ratioStructure.denominators,
    ratioStructure.rationals,
    ratioStructure.ratio_strings
  ]

  // pushes each elements of a packet its respective structure property
  function pushPack(pack) {
    pack.forEach(function(item, index) {
      structureLegend[index].push(item)
    } )
  }

  // calculates the next packet based off of previous packet and cf index eveness
  function zigzag(lastPacket, cfidx) {
    [x, y, numIn, den, ratio] = lastPacket;
    cfidx % 2 ? y = [numIn, den] : x = [numIn, den];
    numIn =  x[0] + y[0];
    den = x[1] + y[1];
    ratio = numIn / den;
    p = [ x, y, numIn, den, ratio, numIn+"/"+den ];
    return p
  }

  // the seed of the sequence
  let packet = [[-1 + cf[0], 1], [1,0], cf[0], 1, cf[0], cf[0] + "/" + 1 ];
  pushPack(packet);
  packet = zigzag(packet)

  for (let depth = 1; depth < cf.length; depth++) {
    for (let i = 0; i < cf[depth]; i++) {
      pushPack(packet);
      packet = zigzag(packet, depth);
      if (packet[3] > maxPeriod) {
        depth = cf.length
        break;
      } 
    }
  }

  ratioStructure.convergents = stepsToDegrees(ratioStructure.cf);
  ratioStructure.length = ratioStructure.denominators.length;

  return ratioStructure;
}

// calculates all possible rational numbers, not sorted. until stack overflow.
// if "underOne" true calculates all, if false only [0 .. 1]
function ratioGenerate(array, maxPeriod=500, underOne=false, seed=[1,1]){
  if (seed[0] > maxPeriod || seed[1] > maxPeriod)
    return seed;

  let r0 = [seed[0], seed[0] + seed[1]]
  let r1 = [seed[0] + seed[1], seed[1]];

  if (seed[0] - seed[1] != 0 || !underOne) {
    r = ratioGenerate(array, maxPeriod, underOne, r1);
    if (r[0] / r[1] > 1) {
      r = [r[1], r[0]];
    }
    array.push(r);
  }

  r = ratioGenerate(array, maxPeriod, underOne, r0);
  if (r[0] / r[1] > 1 && underOne) {
    r = [r[1], r[0]];
  }
  array.push(r);

  return seed
}

// pass in a ratio_structure in get a 2D array of the prime limits of each approximation
function getRatioStructurePrimeLimits(structIn) {
  let primeLimitsOut = []; // [ [limitOfRatio], [limitOfNumerator], [limitOfDenominator] ], ...
  var nlim, dlim;

    for (let i = 0; i < structIn.length; i++) {
      ratiolimits.push(getPrimesOfRatio(structIn.numerators[i], structIn.denominators[i]));
    }

  return primeLimitsOut;
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
function getPrimeFactors(number) {
  number = Math.floor(number);
  if (number === 1) {
    return 1;
   }
  var factorsOut = [];
  var n = number;
  var q = number;
  var loop;

  for (let i = 0; i < PRIMES.length; i++) {
    if (PRIMES[i] > n)
      break;

      factorsOut.push(0);

    if (PRIMES[i] === n) {
      factorsOut[i]++;
      break;
    }

    loop = true;

    while (loop) {
      q = n / PRIMES[i];

      if (q === Math.floor(q)) {
        n = q;
        factorsOut[i]++;
        continue;
      }
      loop = false;
    }
  }

  return factorsOut;
}

 // returns an array of integers that share no common factors to the given integer
 function getCoprimes(number) {
  let coprimes = [1];
  var num, mod
  for (let i = 2; i < number - 1; i++) {
    num = number;
    mod = i;
    while (mod > 1) {
      num = num % mod;
      [num, mod] = [mod, num];
    }
    if (mod > 0) {
      coprimes.push(i);
    }
  }
  coprimes.push(number-1);
  return coprimes;
 }

export {
  rotated,
  rotate,
  getCF,
  getConvergent,
  getConvergents,
  getRatioStructure,
  getRatioStructurePrimeLimits,
  get_rank2_mode,
  getPrimeFactors,
  getCoprimes
}
