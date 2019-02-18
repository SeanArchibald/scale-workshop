/**
 * keymap.js
 * International keyboard layouts
 */

var Layouts = {
  // English QWERTY Layout
  //
  // <\> is placed to the right of <'> because on ISO (EU) variants it's there.
  // The ANSI (US) variant places it to the right of <]>, but it's a less useful
  // position so it can be ignored.
  EN: [
    "1234567890-=",
    "QWERTYUIOP[]",
    "ASDFGHJKL;'\\",
    "ZXCVBNM,./",
  ],

  // Hungarian QWERTZ layout
  HU: [
    "123456789ñ/=",
    "QWERTZUIOP[]",
    "ASDFGHJKL;'\\",
    "YXCVBNM,.-",
  ],

  // Dvorak keyboard
  DK: [
    "1234567890-=",
    "',.PYFGCRL/@",
    "AOEUIDHTNS-\\",
    ";QJKXBMWVZ",
  ],

  // Programmer Dvorak keyboard
  PK: [
    "&7531902468#",
    ";,.PYFGCRL/@",
    "AOEUIDHTNS-\\",
    "'QJKXBMWVZ",
  ],
};

// Map of irregular keycodes
//
// This website can be used to display the 'which' value for a given key:
//
//    https://keycode.info
//
var Keycodes = {
  ";": 186,
  "=": 187,
  ",": 188,
  "-": 189,
  ".": 190,
  "/": 191,
  "ñ": 192,
  "[": 219,
  "\\": 220,
  "]": 221,
  "'": 222,
  "&": 166,
  "#": 163,
}

// Build Keymap from Layouts
var Keymap = {}
for (var id in Layouts) {
  Keymap[id] = buildKeymapFromLayout(Layouts[id]);
}

function buildKeymapFromLayout(rows) {
  var map = {}
  for (var r = rows.length - 1; r >= 0; r--) {
    var row = rows[r];
    var rowId = rows.length - r - 2;
    for (var c = 0; c < row.length; c++) {
      var keycode = Keycodes[row.charAt(c)] || row.charCodeAt(c);
      map[keycode] = [rowId, c];
    }
  }
  return map;
}
