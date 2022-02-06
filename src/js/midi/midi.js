/**
 * midi.js
 * Capture MIDI input for synth
 */

/*
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
            this.emit('note on', note, state.get('midi velocity sensing') ? velocity : 127, channel)
          } else {
            this.emit('note off', note, velocity, channel)
          }
        }
        break
    }
  }

  initPort(port) {
    if (port.state === 'connected') {
      if (port.type === 'input') {
        if (port.connection === 'closed') {
          port.open()
        } else if (port.connection === 'open') {
          port.onmidimessage = this.onMidiMessage.bind(this)
        }
      }
      if (port.type === 'output') {
        // TODO
      }
    }
  }

  enableMidiSupport(midiAccess) {
    midiAccess.onstatechange = (event) => {
      this.initPort(event.port)
    }

    Array.from(midiAccess.inputs.values()).forEach((port) => {
      this.initPort(port)
    })

    Array.from(midiAccess.outputs.values()).forEach((port) => {
      this.initPort(port)
    })
  }

  init() {
    navigator
      .requestMIDIAccess({ sysex: false })
      .then(this.enableMidiSupport.bind(this))
      .catch(() => this.emit('blocked'))
  }

  isSupported() {
    return !!navigator.requestMIDIAccess
  }
}
*/

// --------------------------------------------

// TODO: rename this variable
const demoData = {}

class MIDI extends EventEmitter {
  constructor() {
    super()

    this._ = {
      inited: false,
      status: {
        supported: false,
        devices: {
          inputs: {},
          outputs: {}
        }
      },
      whiteOnly: false
    }
  }

  set mode(value) {
    this._.whiteOnly = value
    R.forEach((note) => {
      for (let channel = 1; channel <= 16; channel++) {
        this.emit('note off', note, 1, channel)
      }
    }, getAllKeys())
  }

  async init() {
    if (!this._.inited) {
      this._.inited = true

      const ready = () => {
        const { status } = this._
        this.emit('ready', R.clone(status))
      }

      const enableMidiSupport = (midiAccess) => {
        this._.status.supported = true

        midiAccess.onstatechange = (event) => {
          initPort(event.port)
        }

        const inputs = midiAccess.inputs.values()
        for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
          initPort(input.value)
        }

        const outputs = midiAccess.outputs.values()
        for (let output = outputs.next(); output && !output.done; output = outputs.next()) {
          initPort(output.value)
        }
      }

      const initPort = (port) => {
        const { status } = this._

        const name = getNameFromPort(port)

        if (port.type === 'input') {
          if (!status.devices.inputs[name]) {
            status.devices.inputs[name] = R.merge({ port }, defaultInputData)
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
        } else if (port.type === 'output') {
          if (!status.devices.outputs[name]) {
            status.devices.outputs[name] = R.merge({ port }, defaultOutputData)
          }

          if (port.state === 'connected') {
            if (port.connection === 'closed') {
              port.open()
            } else if (port.connection === 'open') {
              status.devices.outputs[name].connected = true
            }
          }
        }

        this.emit('update', R.clone(status))
      }

      const onMidiMessage = R.curry((device, event) => {
        if (device.enabled) {
          const { whiteOnly } = this._
          const [data, ...params] = event.data
          const cmd = data >> 4
          const channel = data & 0x0f

          if (device.channels[channel] && device.channels[channel].enabled) {
            switch (cmd) {
              case commands.noteOff:
                {
                  const [note, velocity] = params
                  if (whiteOnly) {
                    if (R.includes(note, getWhiteKeys())) {
                      this.emit('note off', whiteOnlyMap[note], velocity, channel)
                    }
                  } else {
                    this.emit('note off', note, velocity, channel)
                  }
                }
                break
              case commands.noteOn:
                {
                  const [note, velocity] = params
                  if (whiteOnly) {
                    if (R.includes(note, getWhiteKeys())) {
                      this.emit(
                        'note on',
                        whiteOnlyMap[note],
                        state.get('midi velocity sensing') ? velocity : 127,
                        channel
                      )
                    }
                  } else {
                    this.emit(
                      'note on',
                      note,
                      state.get('midi velocity sensing') ? velocity : 127,
                      channel
                    )
                  }
                }
                break
              case commands.aftertouch:
                {
                  const [note, pressure] = params
                  if (whiteOnly) {
                    if (R.includes(note, getWhiteKeys())) {
                      this.emit('aftertouch', whiteOnlyMap[note], (pressure / 128) * 100, channel)
                    }
                  } else {
                    this.emit('aftertouch', note, (pressure / 128) * 100, channel)
                  }
                }
                break
              case commands.pitchbend:
                {
                  const [low, high] = params
                  this.emit('pitchbend', (((high << 8) | low) / 0x3fff - 1) * 100)
                }
                break
              case commands.cc:
                {
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
      })

      if (navigator.requestMIDIAccess) {
        const midiAccess = await navigator.requestMIDIAccess({ sysex: false })
        enableMidiSupport(midiAccess)
        ready()
        // .catch -> error = 'SecurityError', when user blocked at sysex:true
      } else {
        ready()
      }
    }
  }

  toggleDevice(type, name) {
    const { status } = this._

    const device = status.devices[`${type}s`][name]
    device.enabled = !device.enabled

    if (type === 'output') {
      if (device.enabled) {
        R.forEach((channel) => {
          device.port.send(setPitchBendLimit(channel, maxBendingDistanceInSemitones))
        })(device.channels)
      } else {
        R.forEach((channel) => {
          device.port.send(bendPitch(channel, 0))
        })(device.channels)
      }
    }

    this.emit('update', R.clone(status))
  }

  toggleChannel(type, name, channelID) {
    const { status } = this._

    const device = status.devices[`${type}s`][name]

    if (device.enabled) {
      const channel = R.find(R.propEq('id', parseInt(channelID)))(device.channels)
      channel.enabled = !channel.enabled
      this.emit('update', R.clone(status))
    }
  }

  getEnabledOutputs() {
    return R.compose(
      R.filter((device) => device.enabled && R.any((channel) => channel.enabled)(device.channels)),
      R.values
    )(this._.status.devices.outputs)
  }

  getLowestEnabledChannel(channels) {
    return R.find((channel) => channel.enabled, channels)
  }

  // -------------------------------------------

  playFrequency(frequency = 0, noteLength = Infinity) {
    // find midi devices, which are enabled and contain at least one open channel
    const devices = R.compose(
      R.filter((device) => device.enabled && R.any((channel) => channel.enabled)(device.channels)),
      R.values
    )(this._.status.devices.outputs)

    if (devices.length) {
      R.forEach(({ port, channels }) => {
        const channel = R.compose(R.head, R.filter(R.propEq('enabled', true)))(channels)
        const portName = getNameFromPort(port)
        if (!demoData[portName]) {
          demoData[portName] = {}
        }
        if (!demoData[portName][channel]) {
          demoData[portName][channel] = {
            pressedNoteIds: []
          }
        }

        if (frequency === 0) {
          if (demoData[portName][channel].pressedNoteIds.length) {
            port.send(
              R.compose(
                R.flatten,
                R.map((noteId) => noteOff(channel, noteId))
              )(demoData[portName][channel].pressedNoteIds)
            )

            demoData[portName][channel].pressedNoteIds = []
          }
        } else {
          const noteId = parseInt(getNoteId(frequency).toString())
          const pitchbendAmount = parseFloat(
            getBendingDistance(frequency, getNoteFrequency(noteId)).toString()
          )

          port.send(noteOn(channel, noteId, pitchbendAmount))
          demoData[portName][channel].pressedNoteIds.push(noteId)
          if (noteLength !== Infinity) {
            setTimeout(() => {
              this.playFrequency(0)
            }, noteLength)
          }
        }
      })(devices)
    }
  }

  stopFrequency() {
    this.playFrequency(0)
  }

  isSupported() {
    return !!navigator.requestMIDIAccess
  }
}

// -------------------------------------------

const midi = new MIDI()

jQuery(() => {
  const midiEnablerBtn = jQuery('#midi-enabler')

  midi
    .on('blocked', () => {
      midiEnablerBtn
        .prop('disabled', false)
        .removeClass('btn-success')
        .addClass('btn-danger')
        .text('off (blocked)')
    })
    .on('note on', (note, velocity, channel) => {
      synth.noteOn(note, velocity, true)
    })
    .on('note off', (note, velocity, channel) => {
      synth.noteOff(note, true)
    })

  midiEnablerBtn.on('click', () => {
    if (midi.isSupported()) {
      midiEnablerBtn
        .prop('disabled', true)
        .removeClass('btn-danger')
        .addClass('btn-success')
        .text('on')

      midi.init().then(() => {
        // temporary code until a proper UI is created to handle MIDI devices and channels
        Object.keys(midi._.status.devices.outputs).forEach((outputName) => {
          midi.toggleDevice('output', outputName)
          // the device, which takes the MIDI OUTPUT should have it's INPUT part disabled, or else there will be feedback
          midi._.status.devices.inputs[outputName].enabled = false
        })
      })
    }
  })
})
