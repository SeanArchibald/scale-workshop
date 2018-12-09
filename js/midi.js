/**
 * midi.js
 * Capture MIDI input for synth
 */

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

const getNameFromPort = port => `${port.name} (version ${port.version}) ${port.manufacturer}`

// --------------------------

class MIDI extends EventEmitter {
  constructor () {
    super()

    this._ = {
      inited: false,
      status: {
        supported: false,
        devices: {
          inputs: {}
        }
      }
    }
  }

  init () {
    if (!this._.inited) {
      this._.inited = true

      const ready = () => {
        const { status } = this._
        this.emit('ready', clone(status))
      }

      const enableMidiSupport = midiAccess => {
        this._.status.supported = true

        midiAccess.onstatechange = event => {
          initPort(event.port)
        }

        const inputs = midiAccess.inputs.values()
        for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
          initPort(input.value)
        }
      }

      const initPort = port => {
        const { status } = this._

        const name = getNameFromPort(port)

        if (port.type === 'input') {
          if (!status.devices.inputs[name]) {
            status.devices.inputs[name] = Object.assign({ port }, defaultInputData)
          }

          status.devices.inputs[name].connected = false
          if (port.state === 'connected') {
            if (port.connection === 'closed') {
              port.open()
            } else if (port.connection === 'open') {
              port.onmidimessage = onMidiMessage(status.devices.inputs[name])
              status.devices.inputs[name].connected = true
            }
          }
        }

        this.emit('update', clone(status))
      }

      const onMidiMessage = device => event => {
        if (device.enabled) {
          const [data, ...params] = event.data
          const cmd = data >> 4
          const channel = data & 0x0f

          if (device.channels[channel] && device.channels[channel].enabled) {
            switch (cmd) {
              case commands.noteOff: {
                const [note, velocity] = params
                // this.emit('note off', note, (velocity / 128) * 100, channel)
                this.emit('note off', note, velocity, channel);
              }
                break
              case commands.noteOn: {
                const [note, velocity] = params
                //this.emit('note on', note, (velocity / 128) * 100, channel)
                this.emit('note on', note, velocity, channel);
              }
                break
              case commands.aftertouch: {
                const [note, pressure] = params
                this.emit('aftertouch', note, (pressure / 128) * 100, channel)
              }
                break
              case commands.pitchbend: {
                const [low, high] = params
                this.emit('pitchbend', ((high << 8 | low) / 0x3FFF - 1) * 100)
              }
                break
              case commands.cc: {
                const [cmd, value] = params

                switch (cmd) {
                  case cc.sustain:
                    this.emit('sustain', value >= 64)
                    break
                }
              }
                break
            }
          }
        }
      }

      if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess({
          sysex: false
        })
          .then(enableMidiSupport)
          .then(ready, ready)
      } else {
        ready()
      }
    }
  }

  toggleDevice (type, name) {
    const { status } = this._

    const device = status.devices[type + 's'][name]
    device.enabled = !device.enabled

    this.emit('update', clone(status))
  }

  toggleChannel (type, name, channelID) {
    const { status } = this._

    const device = status.devices[type + 's'][name]

    if (device.enabled) {
      device.channels.find(channel => {
        return channel.id === parseInt(channelID)
      })
      channel.enabled = !channel.enabled
      this.emit('update', clone(status))
    }
  }
}

function updateStatus(status) {
  console.log('MIDI status changed:', status.supported, status.devices.inputs)
}

const midi = new MIDI()

$(() => {
  midi.on('ready', updateStatus)
  midi.on('update', updateStatus)

  midi.on('note on', (note, velocity, channel) => {
    Synth.noteOn(note, velocity)
  })

  midi.on('note off', (note, velocity, channel) => {
    Synth.noteOff(note, velocity)
  })

  midi.init()
})
