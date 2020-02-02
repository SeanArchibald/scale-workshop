/**
 * NUMBER OPERATIONS
 */

/* global alert, location, jQuery, localStorage, navigator */
import { PRIMES } from '../constants.js'
import { get_prime_factors } from './sequences.js'

// modulo function
Number.prototype.mod = function (n) {
  return ((this % n) + n) % n;
};

// calculate the sum of the values in a given array given a stopping index
function sum_array(array, index) {
  var sum = 0;

  if (array.length <= index)
    index = array.length - 1;

  for (let i = 0; i < index; i ++) {
    sum += array[i];
  }

   return sum;
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

  var np = nextPrime(number);
  var pp = prevPrime(number);

  if (Math.abs(np - number) < Math.abs(pp - number))
    return np;
  else
    return pp;
}

function get_prime_limit(number) {
  var factors = get_prime_factors(number);
  return PRIMES[factors.length - 1];
}

/*
function get_prime_limit_of_ratio(numerator, denominator) {
  return Math.max(get_prime_limit(numerator), get_prime_limit(denominator));
}
*/

 // returns array of the numerator and denominator of the reduced form of given ratio
 function reduce_ratio(numerator, denominator) { 
  var num_pf = get_prime_factors(numerator);
  var den_pf = get_prime_factors(denominator);
  let r_pf = [];
  var maxlength = Math.max(num_pf.length, den_pf.length);
  for(var i = 0; i < maxlength; i++) {
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

  for (let i = 0; i < maxlength; i++) {
    if (r_pf[i] > 0)
      nn *= Math.pow(PRIMES[i], r_pf[i]);
    else
      dd *= Math.pow(PRIMES[i], r_pf[i] * -1);
  }

  return [nn, dd];
 }

 function get_lcm(array) {
   let primecounts = [];
   let primefactors = [];
   var f;
   array.forEach(function(item, index, array) {
     f = get_prime_factors(item);
     primefactors.push(f);
   } );

   var maxlength = 0;
   primefactors.forEach(function(item, index, array) {
    if (item.length > maxlength)
      maxlength = item.length;
   } );

   // find the min power of each primes in numbers' factorization
   for (let p = 0; p < maxlength; p++) {
     primecounts.push(0);
     for (let n = 0; n < primefactors.length; n++) {
       f = primefactors[n];
       if (p < f.length) {
         if (primecounts[p] < f[p])
           primecounts[p] = f[p];
       }
     }	 
   }

   let lcm = 1;
   primecounts.forEach(function(item, index) {
     lcm *= Math.pow(PRIMES[index], item);
   } );

   return lcm;
}

 function invert_chord(chord) {
   if (!/^(\d+:)+\d+$/.test(chord)) {
     alert("Warning: invalid chord " + chord);
     return false;
   }

   let inverted = chord;
   let intervals = chord.split(":").map(x => parseInt(x));
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
     var reduced_interval = reduce_ratio(item[0] * intervals[index][0], item[1] * intervals[index][1]);
     intervals.push(reduced_interval);
     denominators.push(reduced_interval[1]);
   } );

   var lcm = get_lcm(denominators);

   chord = [];
   intervals.forEach(function(x) {
     chord.push(x[0] * lcm / x[1]);
   } );

   return chord.join(":");
 }

export {
  sum_array,
  rotate,
  isPrime,
  nextPrime,
  prevPrime,
  closestPrime,
  get_prime_limit,
  reduce_ratio,
  get_lcm,
  invert_chord
}
