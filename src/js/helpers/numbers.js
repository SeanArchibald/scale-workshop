/**
 * NUMBER OPERATIONS
 */

/* global alert */
import { PRIMES } from '../constants.js'
import { getPrimeFactors } from './sequences.js'

// modulo function
Number.prototype.mod = function (n) {
  return ((this % n) + n) % n;
};

// calculate the sum of the values in a given array given a stopping index
function sumOfArray(array) {
  var sum = 0;
  array.forEach(x => sum += x)
  return sum;
}

 function isPrime(number) {
  var sqrtnum = Math.floor(Math.sqrt(number));
  for (let i = 0; i < PRIMES.length; i++) {
    if (PRIMES[i] >= sqrtnum)
      break;

    if (number % PRIMES[i] === 0) {
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

  var next = nextPrime(number);
  var previous = prevPrime(number);

  if (Math.abs(next - number) < Math.abs(previous - number))
    return next;
  else
    return previous;
}

function getPrimeLimit(number) {
  var factors = getPrimeFactors(number);
  return PRIMES[factors.length - 1];
}

// Returns a single prime, the largest one between the numerator and denominator
function getPrimeLimitOfRatio(numerator, denominator) {
  return Math.max(getPrimeLimit(numerator), getPrimeLimit(denominator));
}

// Returns an array of: [ratioPrimeLimit, numeratorPrimeLimit, denominatorPrimeLimit] 
function getPrimesOfRatio(numerator, denominator) {
  var nlim, dlim;
  numerator === 1 ? nlim = 1 : nlim = getPrimeLimit(numerator);
  denominator === 1 ? dlim = 1 : dlim = getPrimeLimit(denominator);
  return [Math.max(nlim, dlim), nlim, dlim];
}

 // returns array of the numerator and denominator of the reduced form of given ratio
 function reduceRatio(numerator, denominator) { 
  var numeratorPrimes = getPrimeFactors(numerator);
  var denominatorPrimes = getPrimeFactors(denominator);
  let ratioPrimeFactors = [];
  var maxlength = Math.max(numeratorPrimes.length, denominatorPrimes.length);
  for(var i = 0; i < maxlength; i++) {
    var sum = 0;

    if (i < numeratorPrimes.length) {
      sum = numeratorPrimes[i];
    }

    if (i < denominatorPrimes.length) {
      sum -= denominatorPrimes[i];
    }

    ratioPrimeFactors.push(sum);
  }

  var nn = 1;
  var dd = 1;

  for (let i = 0; i < maxlength; i++) {
    if (ratioPrimeFactors[i] > 0)
      nn *= Math.pow(PRIMES[i], ratioPrimeFactors[i]);
    else
      dd *= Math.pow(PRIMES[i], ratioPrimeFactors[i] * -1);
  }

  return [nn, dd];
 }

 function getLCM(array) {
   let primeCounters = [];
   let primeFactors = [];
   var f;
   array.forEach(function(item) {
     f = getPrimeFactors(item);
     primeFactors.push(f);
   } );

   var maxlength = 0;
   primeFactors.forEach(function(item) {
    if (item.length > maxlength)
      maxlength = item.length;
   } );

   // find the min power of each primes in numbers' factorization
   for (let p = 0; p < maxlength; p++) {
     primeCounters.push(0);
     for (let n = 0; n < primeFactors.length; n++) {
       f = primeFactors[n];
       if (p < f.length) {
         if (primeCounters[p] < f[p])
           primeCounters[p] = f[p];
       }
     }	 
   }

   let lcm = 1;
   primeCounters.forEach(function(item, index) {
     lcm *= Math.pow(PRIMES[index], item);
   } );

   return lcm;
}

 function invertChord(chordString) {
   if (!/^(\d+:)+\d+$/.test(chordString)) {
     alert("Warning: invalid chord " + chordString);
     return false;
   }

   let intervals = chordString.split(":").map(x => parseInt(x));
   let steps = [];
   intervals.forEach(function(item, index, array) {
     if (index > 0) {
       steps.push([item, array[index-1]]);
     }
   } );

  steps.reverse();
  intervals = [[1, 1]];

   let denominators = [];
   steps.forEach(function(item, index) {
     var reducedInterval = reduceRatio(item[0] * intervals[index][0], item[1] * intervals[index][1]);
     intervals.push(reducedInterval);
     denominators.push(reducedInterval[1]);
   } );

   var lcm = getLCM(denominators);

   chordString = [];
   intervals.forEach(function(x) {
     chordString.push(x[0] * lcm / x[1]);
   } );

   return chordString.join(":");
 }

export {
  sumOfArray,
  isPrime,
  nextPrime,
  prevPrime,
  closestPrime,
  getPrimeLimit,
  getPrimeLimitOfRatio,
  getPrimesOfRatio,
  reduceRatio,
  getLCM,
  invertChord
}
