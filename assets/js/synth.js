
/**
 * synth.js
 * Web audio synth
 */

 var synth = {
   keymap: {
     // keycode: [row, col]
     90: [-1,0], // z
     88: [-1,1], // x
     67: [-1,2], // c
     86: [-1,3], // v
     66: [-1,4], // b
     78: [-1,5], // n
     77: [-1,6], // m
     188: [-1,7], // ,
     190: [-1,8], // .
     191: [-1,9], // /
     65: [0,0], // a
     83: [0,1], // s
     68: [0,2], // d
     70: [0,3], // f
     71: [0,4], // g
     72: [0,5], // h
     74: [0,6], // j
     75: [0,7], // k
     76: [0,8], // l
     186: [0,9], // ;
     222: [0,10], // '
     220: [0,11], // \
     81: [1,0], // q
     87: [1,1], // w
     69: [1,2], // e
     82: [1,3], // r
     84: [1,4], // t
     89: [1,5], // y
     85: [1,6], // u
     73: [1,7], // i
     79: [1,8], // o
     80: [1,9], // p
     219: [1,10], // [
     221: [1,11], // ]
     49: [2,0], // 1
     50: [2,1], // 2
     51: [2,2], // 3
     52: [2,3], // 4
     53: [2,4], // 5
     54: [2,5], // 6
     55: [2,6], // 7
     56: [2,7], // 8
     57: [2,8], // 9
     48: [2,9], // 0
     189: [2,10], // -
     187: [2,11] // =
   },
   row_tuning: 5 // how many scale degrees as you move up/down by rows
 };

// create an audiocontext
var audioCtx = new ( window.AudioContext || window.webkitAudioContext )();

// polyphonic voice management
var active_voices = {};

var Voice = (function(audioCtx) {
  function Voice(frequency){
    this.frequency = frequency;
    this.oscillators = [];
  };

  Voice.prototype.start = function() {

    /* VCO */
    var vco = audioCtx.createOscillator();
    vco.type = 'triangle';
    vco.frequency.value = this.frequency;

    /* VCA */
    var vca = audioCtx.createGain();
    vca.gain.value = 0.2;

    /* routing */
    vco.connect( vca );
    vca.connect( audioCtx.destination );

    vco.start(0);

    /* keep track of oscillators used */
    this.oscillators.push(vco);
  };

  Voice.prototype.stop = function() {
    this.oscillators.forEach(function(oscillator, _) {
      oscillator.stop();
    });
  };

  return Voice;
})(audioCtx);


// keycode_to_midinote()
// it turns a keycode to a MIDI note based on this reference layout:
//
//   1  2  3  4  5  6  7  8  9  0  -  =
//    Q  W  E  R  T  Y  U  I  O  P  [  ]
//     A  S  D  F  G  H  J  K  L  ;  '  \
//      Z  X  C  V  B  N  M  ,  .  /
//
function keycode_to_midinote(keycode) {

  // get row/col vals from the keymap
  var key = synth['keymap'][keycode];

  if ( key != undefined ) {
    var row = key[0];
    var col = key[1];
    var midinote = (row * synth["row_tuning"]) + col + tuning_table['base_midi_note'];
    return midinote;
  }
  // return false if there is no note assigned to this key
  return false;
}

// KEYDOWN -- capture keyboard input
document.addEventListener("keydown", function(event) {

  // check that the keydown event corresponds to a midi note
  var midinote = keycode_to_midinote( event.which );
  if ( midinote ) {

    var frequency = tuning_table.freq[ midinote ];

    // make sure this triggers only on first input
    if ( typeof active_voices[event.which] === 'undefined' ) {

      active_voices[event.which] = new Voice( frequency );
      active_voices[event.which].start(0);
      // console.log( "PLAY NOTE:- keycode: " + event.which + " note: " + keycode_to_midinote( event.which ) + " freq: " + frequency );

    }

  }

});

// KEYUP -- capture keyboard input
document.addEventListener("keyup", function(event) {

  if ( typeof active_voices[event.which] !== 'undefined' ) {
    active_voices[event.which].stop();
    delete active_voices[event.which];
  }

  // console.log( "keyup event.which = " + keycode_to_midinote( event.which ) );
});
