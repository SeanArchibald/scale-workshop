const whiteOnlyMap = {
  0: 25,
  2: 26,
  4: 27,
  5: 28,
  7: 29,
  9: 30,
  11: 31,
  12: 32,
  14: 33,
  16: 34,
  17: 35,
  19: 36,
  21: 37,
  23: 38,
  24: 39,
  26: 40,
  28: 41,
  29: 42,
  31: 43,
  33: 44,
  35: 45,
  36: 46,
  38: 47,
  40: 48,
  41: 49,
  43: 50,
  45: 51,
  47: 52,
  48: 53,
  50: 54,
  52: 55,
  53: 56,
  55: 57,
  57: 58,
  59: 59,
  60: 60,
  62: 61,
  64: 62,
  65: 63,
  67: 64,
  69: 65,
  71: 66,
  72: 67,
  74: 68,
  76: 69,
  77: 70,
  79: 71,
  81: 72,
  83: 73,
  84: 74,
  86: 75,
  88: 76,
  89: 77,
  91: 78,
  93: 79,
  95: 80,
  96: 81,
  98: 82,
  100: 83,
  101: 84,
  103: 85,
  105: 86,
  107: 87,
  108: 88,
  110: 89,
  112: 90,
  113: 91,
  115: 92,
  117: 93,
  119: 94,
  120: 95,
  122: 96,
  124: 97,
  125: 98,
  127: 99
}

// https://www.midi.org/specifications/item/table-1-summary-of-midi-message
const commands = {
  noteOn: 0b1001,
  noteOff: 0b1000,
  aftertouch: 0b1010,
  pitchbend: 0b1110,
  cc: 0b1011
}

// https://www.midi.org/specifications/item/table-3-control-change-messages-data-bytes-2
// http://www.nortonmusic.com/midi_cc.html
const cc = {
  dataEntry: 6,
  sustain: 64,
  registeredParameterLSB: 100,
  registeredParameterMSB: 101
}

/// 440Hz A4
const referenceNote = {
  frequency: 440,
  id: 69
}

const pitchBendMin = 1 - (1 << 14) / 2 // -8191
const pitchBendMax = (1 << 14) / 2 // 8192

// settings for MIDI OUT ports
const defaultInputData = {
  enabled: true,
  channels: [
    { id: 1, enabled: true, pitchBendAmount: 0 },
    { id: 2, enabled: true, pitchBendAmount: 0 },
    { id: 3, enabled: true, pitchBendAmount: 0 },
    { id: 4, enabled: true, pitchBendAmount: 0 },
    { id: 5, enabled: true, pitchBendAmount: 0 },
    { id: 6, enabled: true, pitchBendAmount: 0 },
    { id: 7, enabled: true, pitchBendAmount: 0 },
    { id: 8, enabled: true, pitchBendAmount: 0 },
    { id: 9, enabled: true, pitchBendAmount: 0 },
    { id: 10, enabled: false, pitchBendAmount: 0 }, // drum channel
    { id: 11, enabled: true, pitchBendAmount: 0 },
    { id: 12, enabled: true, pitchBendAmount: 0 },
    { id: 13, enabled: true, pitchBendAmount: 0 },
    { id: 14, enabled: true, pitchBendAmount: 0 },
    { id: 15, enabled: true, pitchBendAmount: 0 },
    { id: 16, enabled: true, pitchBendAmount: 0 }
  ]
}

// settings for MIDI IN ports
const defaultOutputData = {
  enabled: false,
  channels: [
    { id: 1, enabled: true, pitchBendAmount: 0 },
    { id: 2, enabled: false, pitchBendAmount: 0 },
    { id: 3, enabled: false, pitchBendAmount: 0 },
    { id: 4, enabled: false, pitchBendAmount: 0 },
    { id: 5, enabled: false, pitchBendAmount: 0 },
    { id: 6, enabled: false, pitchBendAmount: 0 },
    { id: 7, enabled: false, pitchBendAmount: 0 },
    { id: 8, enabled: false, pitchBendAmount: 0 },
    { id: 9, enabled: false, pitchBendAmount: 0 },
    { id: 10, enabled: false, pitchBendAmount: 0 },
    { id: 11, enabled: false, pitchBendAmount: 0 },
    { id: 12, enabled: false, pitchBendAmount: 0 },
    { id: 13, enabled: false, pitchBendAmount: 0 },
    { id: 14, enabled: false, pitchBendAmount: 0 },
    { id: 15, enabled: false, pitchBendAmount: 0 },
    { id: 16, enabled: false, pitchBendAmount: 0 }
  ]
}

const octaveRatio = 2
const semitonesPerOctave = 12
const maxBendingDistanceInSemitones = 12
const centsPerOctave = 1200

// semitones = 1..12
// channel = 1..16

const middleC = 60
const drumChannel = 10 // when counting from 1
