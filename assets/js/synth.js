
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
  isomorphicMapping: {
    vertical: 5, // how many scale degrees as you move up/down by rows
    horizontal: 1  // how many scale degrees as you move left/right by cols
  },
  active_voices: {}, // polyphonic voice management
  waveform: 'triangle',
  noteOn: function( midinote, velocity = 127 ) {

    var frequency = tuning_table.freq[ midinote ];

    if ( frequency !== undefined ) {

      // make sure note triggers only on first input (prevent duplicate notes)
      if ( typeof Synth.active_voices[midinote] === 'undefined' ) {

        this.active_voices[midinote] = new Voice( frequency, velocity );
        this.active_voices[midinote].start(0);
        jQuery( "#tuning-table-row-" + midinote ).addClass( "bg-playnote" );

        debug( "Play note " + keycode_to_midinote( event.which ) + " (" + frequency.toFixed(3) + " Hz) velocity " + velocity);

      }

    }

  },
  noteOff: function( midinote ) {

    if ( typeof Synth.active_voices[midinote] !== 'undefined' ) {
      Synth.active_voices[midinote].stop();
      delete Synth.active_voices[midinote];
      jQuery( "#tuning-table-row-" + midinote ).removeClass( "bg-playnote" );

      debug( "Stop note " + keycode_to_midinote( midinote ) );
    }

  },
  panic: function() {

    // TODO - this function stops all active voices

    // show which voices are active (playing)
    debug( Synth.active_voices );

    // loop through active voices
    for ( i=0; i<127; i++ ) {

      // turn off voice
      Synth.noteOff( i );

    }

  }
};

// create an audiocontext
var audioCtx = new ( window.AudioContext || window.webkitAudioContext )();

var Voice = ( function( audioCtx ) {
  function Voice( frequency, velocity ) {
    this.frequency = frequency;
    this.velocity = velocity;
    this.attackTime = 0.1; // TODO
    this.decayTime = 0.1; // TODO
    this.sustain = 0.7; // TODO
    this.releaseTime = 0.1; // TODO
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

    /*
    now = audioCtx.currentTime;
    this.param.cancelScheduledValues(now);
    this.param.setValueAtTime(0, now);
    this.param.linearRampToValueAtTime(1, now + this.attackTime);
    this.param.linearRampToValueAtTime(0, now + this.attackTime + this.releaseTime);
    */

    /* routing */
    vco.connect( vca );
    vca.connect( Delay.channelL );
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
    var midinote = (row * Synth.isomorphicMapping.vertical) + (col * Synth.isomorphicMapping.horizontal) + tuning_table['base_midi_note'];
    return midinote;
  }
  // return false if there is no note assigned to this key
  return false;
}

// is_qwerty_active()
// check if qwerty key playing should be active
// returns true if focus is in safe area for typing
// returns false if focus is on an input or textarea element
function is_qwerty_active() {
  var focus = document.activeElement.tagName;
  if ( focus == 'TEXTAREA' || focus == 'INPUT' ) {
    jQuery( "div#qwerty-indicator" ).empty();
    jQuery( "div#qwerty-indicator" ).html('<img src="" style="float:right" /><h4><span class="glyphicon glyphicon glyphicon-volume-off" aria-hidden="true" style="color:#d9534f"></span> Keyboard disabled</h4><p>Click here to enable QWERTY keyboard playing.</p>');
    return false;
  }
  else {
    jQuery( "div#qwerty-indicator" ).empty();
    jQuery( "div#qwerty-indicator" ).html('<img src="" style="float:right" /><h4><span class="glyphicon glyphicon glyphicon-volume-down" aria-hidden="true"></span> Keyboard enabled</h4><p>Press QWERTY keys to play current tuning.</p>');
    return true;
  }
}

// KEYDOWN -- capture keyboard input
document.addEventListener( "keydown", function(event) {

  // bail if focus is on an input or textarea element
  if ( !is_qwerty_active() ) {
    return false;
  }

  event.preventDefault();
  Synth.noteOn(
    keycode_to_midinote( event.which ), // midi note number 0-127
    100 // note velocity 0-127
  );
});

// KEYUP -- capture keyboard input
document.addEventListener( "keyup", function(event) {
  event.preventDefault();
  Synth.noteOff( keycode_to_midinote( event.which ) );
});





// DELAY EFFECT
var Delay = {
  on: false,
  channelL: audioCtx.createDelay(5.0),
  channelR: audioCtx.createDelay(5.0),
  gainL: audioCtx.createGain(0.8),
  gainR: audioCtx.createGain(0.8),
  panL: audioCtx.createPanner(),
  panR: audioCtx.createPanner(),
  time: 0.3,
  gain: 0.4
};
// feedback loop with gain stage
Delay.channelL.connect( Delay.gainL );
Delay.gainL.connect( Delay.channelR );
Delay.channelR.connect( Delay.gainR );
Delay.gainR.connect( Delay.channelL );
// panning
Delay.gainL.connect( Delay.panL );
Delay.gainR.connect( Delay.panR );
Delay.panL.setPosition( -1, 0, 0 );
Delay.panR.setPosition( 1, 0, 0 );
// setup delay time and gain for delay lines
Delay.channelL.delayTime.setValueAtTime( Delay.time, audioCtx.currentTime );
Delay.channelR.delayTime.setValueAtTime( Delay.time, audioCtx.currentTime );
Delay.gainL.gain.setValueAtTime(Delay.gain, audioCtx.currentTime);
Delay.gainR.gain.setValueAtTime(Delay.gain, audioCtx.currentTime);
