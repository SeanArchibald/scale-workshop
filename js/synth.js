
/**
 * synth.js
 * Web audio synth
 */

const synth = new Synth()

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

function touch_to_midinote([ row, col ]) {
  if (isNil(row) || isNil(col)) {
    return false
  } else {
    return (row * synth.isomorphicMapping.vertical) + (col * synth.isomorphicMapping.horizontal) + tuning_table['base_midi_note'];
  }
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
  // debug( coord );
  synth.noteOn(touch_to_midinote(getCoordsFromKey(event.target)));
});

// TOUCHEND -- virtual keyboard
jQuery( '#virtual-keyboard' ).on('touchend', 'td', function (event) {
  event.preventDefault();
  jQuery(event.originalEvent.changedTouches[0].target).removeClass('active');
  // debug( coord );
  synth.noteOff(touch_to_midinote(getCoordsFromKey(event.target)));
});
