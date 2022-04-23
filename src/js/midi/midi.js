/**
 * midi.js
 * Capture MIDI input for synth
 */

const demoData = {} // TODO: rename this variable

class MIDI extends EventEmitter {
  constructor() {
    super()

    this._ = {
      inited: false,
      supported: false,
      devices: {
        inputs: {},
        outputs: {}
      },
      whiteOnly: false
    }
  }

  set whiteOnly(value) {
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

      const enableMidiSupport = (midiAccess) => {
        this._.supported = true

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
        const { devices } = this._

        const name = getNameFromPort(port)

        if (port.type === 'input') {
          if (!devices.inputs[name]) {
            devices.inputs[name] = { port, ...R.clone(defaultInputData) }
          }

          devices.inputs[name].connected = false
          if (port.state === 'connected') {
            if (port.connection === 'closed') {
              port.open()
            } else if (port.connection === 'open') {
              port.onmidimessage = onMidiMessage(devices.inputs[name])
              devices.inputs[name].connected = true
            }
          }
        } else if (port.type === 'output') {
          if (!devices.outputs[name]) {
            devices.outputs[name] = { port, ...R.clone(defaultOutputData) }
          }

          if (port.state === 'connected') {
            if (port.connection === 'closed') {
              port.open()
            } else if (port.connection === 'open') {
              devices.outputs[name].connected = true
            }
          }
        }

        this.emit('update')
      }

      const onMidiMessage = R.curry((device, event) => {
        if (device.enabled) {
          const { whiteOnly } = this._
          const [data, ...params] = event.data
          const cmd = data >> 4
          const channel = data & 0x0f

          if (device.channels[channel]?.enabled === true) {
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
                  this.emit('pitchbend', (((high << 7) | low) / 0x3fff - 1) * 100)
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
        this.emit('ready')
      } else {
        this.emit('blocked')
      }
    }
  }

  toggleDevice(type, name, newValue = null) {
    const { devices } = this._

    const device = devices[`${type}s`][name]
    device.enabled = newValue === null ? !device.enabled : newValue

    if (type === 'output') {
      if (device.enabled) {
        device.channels.forEach((channel) => {
          device.port.send(setPitchBendLimit(channel, maxBendingDistanceInSemitones))
        })
      } else {
        device.channels.forEach((channel) => {
          device.port.send(bendPitch(channel, 0))
        })
      }
    }

    this.emit('update')
  }

  toggleChannel(type, name, channelID, newValue = null) {
    const { devices } = this._

    const device = devices[`${type}s`][name]
    const channel = device.channels.find(({ id }) => id === channelID)

    newValue = newValue === null ? !channel.enabled : newValue
    if (channel.enabled !== newValue) {
      channel.enabled = newValue
      this.emit('update')
    }
  }

  setChannel(type, name, channelID, newValue) {
    this.toggleChannel(type, name, channelID, newValue)
  }

  getEnabledOutputs() {
    return Object.values(this._.devices.outputs).filter(({ enabled, channels }) => {
      return enabled === true && channels.find(({ enabled }) => enabled === true) !== undefined
    })
  }

  getLowestEnabledChannel(channels) {
    return channels.find(({ enabled }) => enabled === true)
  }

  // -------------------------------------------

  playFrequency(frequency = 0, noteLength = Infinity) {
    const devices = this.getEnabledOutputs()

    if (devices.length) {
      devices.forEach(({ port, channels }) => {
        const channel = channels.find(({ enabled }) => enabled === true)
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
      })
    }
  }

  stopFrequency() {
    this.playFrequency(0)
  }

  isSupported() {
    return this._.supported
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
      synth.noteOn(note, velocity)
    })
    .on('note off', (note, velocity, channel) => {
      synth.noteOff(note)
    })
    .on('update', () => {
      state.set('midi modal visible', true, true)
    })

  midiEnablerBtn.on('click', async () => {
    await midi.init()

    if (midi.isSupported()) {
      midiEnablerBtn
        .prop('disabled', true)
        .removeClass('btn-danger')
        .addClass('btn-success')
        .text('on')
    }
  })
})
