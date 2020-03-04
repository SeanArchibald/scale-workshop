/**
 * midi.js
 * Capture MIDI input for synth
 */

/* global EventEmitter */

// https://www.midi.org/specifications/item/table-1-summary-of-midi-message
const commands = {
  noteOn: 0b1001,
  noteOff: 0b1000,
  cc: 0b1011
}

// https://www.midi.org/specifications/item/table-3-control-change-messages-data-bytes-2
// http://www.nortonmusic.com/midi_cc.html
// const cc = {
//   sustain: 64
// }

class MIDI extends EventEmitter {
  onMidiMessage(event) {
    const [data, ...params] = event.data
    const cmd = data >> 4
    const channel = data & 0x0f

    switch (cmd) {
      case commands.noteOff:
        {
          const [note, velocity] = params
          this.emit('note off', note, velocity, channel)
        }
        break
      case commands.noteOn:
        {
          const [note, velocity] = params
          if (velocity > 0) {
            this.emit('note on', note, velocity, channel)
          } else {
            this.emit('note off', note, velocity, channel)
          }
        }
        break
    }
  }

  initPort(port) {
    if (port.type === 'input' && port.state === 'connected') {
      if (port.connection === 'closed') {
        port.open()
      } else if (port.connection === 'open') {
        port.onmidimessage = this.onMidiMessage.bind(this)
      }
    }
  }

  enableMidiSupport(midiAccess) {
    midiAccess.onstatechange = event => {
      this.initPort(event.port)
    }

    Array.from(midiAccess.inputs.values()).forEach(port => {
      this.initPort(port)
    })
  }

  init() {
    navigator
      .requestMIDIAccess()
      .then(this.enableMidiSupport.bind(this))
      .catch(() => this.emit('blocked'))
  }

  isSupported() {
    return !!navigator.requestMIDIAccess
  }
}

export default MIDI
