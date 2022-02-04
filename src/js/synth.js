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
  var key = synth.keymap[keycode]

  if (R.isNil(key)) {
    // return false if there is no note assigned to this key
    return false
  }

  var [row, col] = key
  return (
    row * synth.isomorphicMapping.vertical +
    col * synth.isomorphicMapping.horizontal +
    tuning_table['base_midi_note']
  )
}

function touch_to_midinote([row, col]) {
  if (R.isNil(row) || R.isNil(col)) {
    return false
  }

  return (
    row * synth.isomorphicMapping.vertical +
    col * synth.isomorphicMapping.horizontal +
    tuning_table['base_midi_note']
  )
}

// is_qwerty_active()
// check if qwerty key playing should be active
// returns true if focus is in safe area for typing
// returns false if focus is on an input or textarea element
function is_qwerty_active() {
  jQuery('div#qwerty-indicator').empty()
  var focus = document.activeElement.tagName
  if (focus == 'TEXTAREA' || focus == 'INPUT') {
    jQuery('div#qwerty-indicator').html(
      '<img src="" style="float:right" /><h4><span class="glyphicon glyphicon glyphicon-volume-off" aria-hidden="true" style="color:#d9534f"></span> Keyboard disabled</h4><p>Click here to enable QWERTY keyboard playing.</p>'
    )
    return false
  } else {
    jQuery('div#qwerty-indicator').html(
      '<img src="" style="float:right" /><h4><span class="glyphicon glyphicon glyphicon-volume-down" aria-hidden="true"></span> Keyboard enabled</h4><p>Press QWERTY keys to play current tuning.</p>'
    )
    return true
  }
}

// KEYDOWN -- capture keyboard input
document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') {
    if (isVirtualKeyboardVisible()) {
      touch_kbd_close()
      return
    }
  }

  // bail if focus is on an input or textarea element
  if (!is_qwerty_active()) {
    return false
  }

  // bail, if a modifier is pressed alongside the key
  if (event.ctrlKey || event.shiftKey || event.altKey || event.metaKey) {
    return false
  }

  const midiNote = keycode_to_midinote(event.which) // midi note number 0-127
  const velocity = 100

  if (midiNote !== false) {
    event.preventDefault()
    synth.noteOn(midiNote, velocity)
  }
})

// KEYUP -- capture keyboard input
document.addEventListener('keyup', function (event) {
  // bail, if a modifier is pressed alongside the key
  if (event.ctrlKey || event.shiftKey || event.altKey || event.metaKey) {
    return false
  }
  const midiNote = keycode_to_midinote(event.which)
  if (midiNote !== false) {
    event.preventDefault()
    synth.noteOff(midiNote)
  }
})

// -[virtual keyboard mobile]-----------------------------------------------

// TODO: multi-touch support; https://stackoverflow.com/a/7236327/1806628

jQuery('#virtual-keyboard')
  .on('touchstart', (e) => {
    e.preventDefault()
    synth.noteOn(touch_to_midinote(getCoordsFromKey(e.target)))
  })
  .on('touchend', (e) => {
    e.preventDefault()
    synth.noteOff(touch_to_midinote(getCoordsFromKey(e.target)))
  })
  .on('touchcancel', (e) => {
    e.preventDefault()
    synth.noteOff(touch_to_midinote(getCoordsFromKey(e.target)))
  })
// .on('touchmove', (e) => {
//   e.preventDefault()
//   console.log('touchmove', e.target)
// })

// -[virtual keyboard desktop]----------------------------------------------

const LEFT_MOUSE_BTN = 0

let isMousePressed = false

jQuery('#virtual-keyboard')
  .on('mousedown', 'td', (e) => {
    if (e.button !== LEFT_MOUSE_BTN) {
      return
    }

    isMousePressed = true
    synth.noteOn(touch_to_midinote(getCoordsFromKey(e.target)))
  })
  .on('mouseup', 'td', (e) => {
    if (e.button !== LEFT_MOUSE_BTN) {
      return
    }

    isMousePressed = false
    synth.noteOff(touch_to_midinote(getCoordsFromKey(e.target)))
  })
  .on('mouseenter', 'td', (e) => {
    if (!isMousePressed) {
      return
    }

    synth.noteOn(touch_to_midinote(getCoordsFromKey(e.target)))
  })
  .on('mouseleave', 'td', (e) => {
    if (!isMousePressed) {
      return
    }

    synth.noteOff(touch_to_midinote(getCoordsFromKey(e.target)))
  })
