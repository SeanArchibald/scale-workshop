/**
 * keymap.js
 * International keyboard layouts
 */

import { objectMap } from './helpers/general.js'

const Layouts = {
  // English QWERTY Layout
  //
  // <\> is placed to the right of <'> because on ISO (EU) variants it's there.
  // The ANSI (US) variant places it to the right of <]>, but it's a less useful
  // position so it can be ignored.
  EN: ['1234567890-=', 'QWERTYUIOP[]', "ASDFGHJKL;'\\", 'ZXCVBNM,./'],

  // Hungarian QWERTZ layout
  HU: ['123456789ñ/=', 'QWERTZUIOP[]', "ASDFGHJKL;'\\", 'YXCVBNM,.-'],

  // Dvorak keyboard
  DK: ['1234567890-=', "',.PYFGCRL/@", 'AOEUIDHTNS-\\', ';QJKXBMWVZ'],

  // Programmer Dvorak keyboard
  PK: ['&7531902468#', ';,.PYFGCRL/@', 'AOEUIDHTNS-\\', "'QJKXBMWVZ"],

  // Colemak keyboard
  CO: ['1234567890-=', 'QWFPGJLUY;[]', "ARSTDHNEIO'\\", 'ZXCVBKM,./']
}

// Map of irregular keycodes
//
// This website can be used to display the 'which' value for a given key:
//
//    https://keycode.info
//
const Keycodes = {
  ';': 186,
  '=': 187,
  ',': 188,
  '-': 189,
  '.': 190,
  '/': 191,
  ñ: 192,
  '[': 219,
  '\\': 220,
  ']': 221,
  "'": 222,
  '&': 166,
  '#': 163
}

function buildKeymapFromLayout(rows) {
  return rows.reduce((acc, row, index) => {
    for (let c = 0; c < row.length; c++) {
      const keycode = Keycodes[row.charAt(c)] || row.charCodeAt(c)
      acc[keycode] = [-index + 2, c]
    }
    return acc
  }, {})
}

// build Keymap from Layouts
const Keymap = objectMap(buildKeymapFromLayout, Layouts)

export { Keymap }
