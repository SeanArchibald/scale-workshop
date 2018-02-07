
/**
 * synth.js
 * Web audio synth
 */

var Synth = {
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
  row_tuning: 5, // how many scale degrees as you move up/down by rows
  active_voices: {}, // polyphonic voice management
  waveform: 'triangle',
  noteOn: function( midinote, velocity = 127 ) {

    var frequency = tuning_table.freq[ midinote ];

    if ( frequency !== undefined ) {

      // make sure note triggers only on first input (prevent duplicate notes)
      if ( typeof Synth.active_voices[midinote] === 'undefined' ) {

        this.active_voices[midinote] = new Voice( frequency, velocity );
        this.active_voices[midinote].start(0);

        if ( debug )
          console.log( "PLAY NOTE:- note: " + keycode_to_midinote( event.which ) + " freq: " + frequency + " velocity: " + velocity);

      }

    }

  },
  noteOff: function( midinote ) {

    if ( typeof Synth.active_voices[midinote] !== 'undefined' ) {
      Synth.active_voices[midinote].stop();
      delete Synth.active_voices[midinote];

      if ( debug )
        console.log( "keyup event.which = " + keycode_to_midinote( event.which ) );
    }

  },
  panic: function() {

    // TODO - this function stops all active voices

  }
};

// create an audiocontext
var audioCtx = new ( window.AudioContext || window.webkitAudioContext )();

var Voice = ( function( audioCtx ) {
  function Voice( frequency, velocity ) {
    this.frequency = frequency;
    this.velocity = velocity;
    this.oscillators = [];
  };

  Voice.prototype.start = function() {

    /* VCO */
    var vco = audioCtx.createOscillator();
    vco.type = Synth.waveform;
    vco.frequency.value = this.frequency;

    /* VCA */
    var vca = audioCtx.createGain();
    this.velocity = 0.2; // TODO: velocity sensitivity
    vca.gain.value = this.velocity;

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
  var key = Synth['keymap'][keycode];

  if ( key != undefined ) {
    var row = key[0];
    var col = key[1];
    var midinote = (row * Synth["row_tuning"]) + col + tuning_table['base_midi_note'];
    return midinote;
  }
  // return false if there is no note assigned to this key
  return false;
}

// KEYDOWN -- capture keyboard input
document.addEventListener( "keydown", function(event) {

  // bail if focus is on an input or textarea element
  var focus = document.activeElement.tagName;
  if ( focus == 'TEXTAREA' || focus == 'INPUT' ) {
    return false;
  }

  Synth.noteOn(
    keycode_to_midinote( event.which ), // midi note number 0-127
    100 // note velocity 0-127
  );
});

// KEYUP -- capture keyboard input
document.addEventListener( "keyup", function(event) {
  Synth.noteOff( keycode_to_midinote( event.which ) );
});
