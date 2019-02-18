
/**
 * synth.js
 * Web audio synth
 */

const synth = new Synth()

const audioCtx = new ( window.AudioContext || window.webkitAudioContext )();
synth.init(audioCtx)

var Voice = ( function( audioCtx ) {

  function Voice( frequency, velocity ) {

    this.frequency = frequency;
    this.velocity = 0.2 * velocity / 127;
    this.velocity = ( this.velocity == 0 ) ? 0.001 : this.velocity; // prevent 0 value for velocity - safe for using exponential ramp


    this.vco = audioCtx.createOscillator();
    this.vca = audioCtx.createGain();

    switch ( jQuery( '#input_select_synth_amp_env' ).val() ) {
      case 'organ' :
        this.attackTime = 0.008; this.decayTime = 0.1; this.sustain = 0.8; this.releaseTime = 0.008; break;
      case 'pad' :
        this.attackTime = 1; this.decayTime = 3; this.sustain = 0.5; this.releaseTime = 3; break;
      case 'perc-short' :
        this.attackTime = 0.001; this.decayTime = 0.2; this.sustain = 0.001; this.releaseTime = 0.2; break;
      case 'perc-medium' :
        this.attackTime = 0.001; this.decayTime = 1; this.sustain = 0.001; this.releaseTime = 1; break;
      case 'perc-long' :
        this.attackTime = 0.001; this.decayTime = 5; this.sustain = 0.001; this.releaseTime = 5; break;
    }
    // debug("attack " + this.attackTime); debug("decay " + this.decayTime); debug("sustain " + this.sustain); debug("release " + this.releaseTime);

    this.oscillators = [];

  };

  // oscillator start
  Voice.prototype.start = function() {

    const now = synth.now();

    /* VCO */
    this.vco.type = synth.waveform;
    this.vco.frequency.value = this.frequency;

    /* VCA */
    this.vca.gain.value = 0;
    this.vca.gain.setValueAtTime(this.vca.gain.value, now); // initial gain
    this.vca.gain.linearRampToValueAtTime(this.velocity, now + this.attackTime); // attack
    this.vca.gain.exponentialRampToValueAtTime(this.velocity * this.sustain, now + this.attackTime + this.decayTime); // decay & sustain

    /* routing */
    this.vco.connect( this.vca );
    this.vca.connect( Delay.channelL );
    this.vca.connect( synth.masterGain );

    this.vco.start(0);

    /* keep track of oscillators used */
    this.oscillators.push(this.vco);
  };

  // oscillator stop
  Voice.prototype.stop = function() {
    const now = synth.now();
    const vcaGain = this.vca.gain
    this.oscillators.forEach(oscillator => {
      // Firefox doesn't support cancelAndHoldAtTime.. shame!!
      if (isFunction(vcaGain.cancelAndHoldAtTime)) {
        vcaGain.cancelAndHoldAtTime(now);
      } else {
        vcaGain.cancelScheduledValues(now);
      }
      vcaGain.exponentialRampToValueAtTime( 0.001, now + this.releaseTime ); // release
      oscillator.stop( now + this.releaseTime );
    });
  };

  return Voice;
})(audioCtx);


// DELAY EFFECT
var Delay = {
  on: false,
  channelL: audioCtx.createDelay(5.0),
  channelR: audioCtx.createDelay(5.0),
  gainL: audioCtx.createGain(0.8),
  gainR: audioCtx.createGain(0.8),
  //lowpassL: audioCtx.createBiquadFilter(),
  //lowpassR: audioCtx.createBiquadFilter(),
  //highpassL: audioCtx.createBiquadFilter(),
  //highpassR: audioCtx.createBiquadFilter(),
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
// filters
//Delay.gainL.connect( Delay.lowpassL );
//Delay.gainR.connect( Delay.lowpassR );
//Delay.lowpassL.frequency.value = 6500;
//Delay.lowpassR.frequency.value = 7000;
//Delay.lowpassL.Q.value = 0.7;
//Delay.lowpassR.Q.value = 0.7;
//Delay.lowpassL.type = 'lowpass';
//Delay.lowpassR.type = 'lowpass';
//Delay.lowpassL.connect( Delay.highpassL );
//Delay.lowpassR.connect( Delay.highpassR );
//Delay.highpassL.frequency.value = 130;
//Delay.highpassR.frequency.value = 140;
//Delay.highpassL.Q.value = 0.7;
//Delay.highpassR.Q.value = 0.7;
//Delay.highpassL.type = 'highpass';
//Delay.highpassR.type = 'highpass';
//Delay.highpassL.connect( Delay.panL );
//Delay.highpassR.connect( Delay.panR );
// panning
Delay.gainL.connect( Delay.panL ); // if you uncomment the above filters lines, then comment out this line
Delay.gainR.connect( Delay.panR ); // if you uncomment the above filters lines, then comment out this line
Delay.panL.setPosition( -1, 0, 0 );
Delay.panR.setPosition( 1, 0, 0 );
// setup delay time and gain for delay lines
const now = synth.now()
Delay.channelL.delayTime.setValueAtTime(Delay.time, now);
Delay.channelR.delayTime.setValueAtTime(Delay.time, now);
Delay.gainL.gain.setValueAtTime(Delay.gain, now);
Delay.gainR.gain.setValueAtTime(Delay.gain, now);


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
  var key = synth.keymap[keycode];

  if ( isNil(key) ) {
    // return false if there is no note assigned to this key
    return false;
  } else {
    var [row, col] = key;
    return (row * synth.isomorphicMapping.vertical) + (col * synth.isomorphicMapping.horizontal) + tuning_table['base_midi_note'];
  }
}

function touch_to_midinote( row, col ) {
  return (row * synth.isomorphicMapping.vertical) + (col * synth.isomorphicMapping.horizontal) + tuning_table['base_midi_note'];
}

// is_qwerty_active()
// check if qwerty key playing should be active
// returns true if focus is in safe area for typing
// returns false if focus is on an input or textarea element
function is_qwerty_active() {
  jQuery( "div#qwerty-indicator" ).empty();
  var focus = document.activeElement.tagName;
  if ( focus == 'TEXTAREA' || focus == 'INPUT' ) {
    jQuery( "div#qwerty-indicator" ).html('<img src="" style="float:right" /><h4><span class="glyphicon glyphicon glyphicon-volume-off" aria-hidden="true" style="color:#d9534f"></span> Keyboard disabled</h4><p>Click here to enable QWERTY keyboard playing.</p>');
    return false;
  }
  else {
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

  // bail, if a modifier is pressed alongside the key
  if (event.ctrlKey || event.shiftKey || event.altKey || event.metaKey) {
    return false;
  }

  const midiNote = keycode_to_midinote( event.which ); // midi note number 0-127
  const velocity = 100

  if (midiNote !== false)  {
    event.preventDefault();
    synth.noteOn( midiNote, velocity );
  }
});

// KEYUP -- capture keyboard input
document.addEventListener( "keyup", function(event) {
  // bail, if a modifier is pressed alongside the key
  if (event.ctrlKey || event.shiftKey || event.altKey || event.metaKey) {
    return false;
  }
  const midiNote = keycode_to_midinote( event.which )
  if (midiNote !== false) {
    event.preventDefault();
    synth.noteOff( midiNote );
  }
});

// TOUCHSTART -- virtual keyboard
jQuery( '#virtual-keyboard' ).on('touchstart', 'td', function (event) {
  event.preventDefault();
  jQuery(event.originalEvent.targetTouches[0].target).addClass('active');
  var coord = jQuery( event.target ).data('coord');
  debug( coord );
  synth.noteOn( touch_to_midinote( coord[0], coord[1] ) );
});

// TOUCHEND -- virtual keyboard
jQuery( '#virtual-keyboard' ).on('touchend', 'td', function (event) {
  event.preventDefault();
  jQuery(event.originalEvent.changedTouches[0].target).removeClass('active');
  var coord = jQuery( event.target ).data('coord');
  debug( coord );
  synth.noteOff( touch_to_midinote( coord[0], coord[1] ) );
});
