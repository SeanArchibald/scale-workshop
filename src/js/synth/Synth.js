/* global jQuery */
import { Keymap } from '../keymap.js'
import Delay from './Delay.js'
import { model } from '../scaleworkshop.js'
import { isNil, debug } from '../helpers/general.js'
import { Voice } from './Voice.js'

class Synth {
  constructor () {
    this.keymap = Keymap.EN
    this.isomorphicMapping = {
      vertical: 5, // how many scale degrees as you move up/down by rows
      horizontal: 1 // how many scale degrees as you move left/right by cols
    }
    this.active_voices = {} // polyphonic voice management
    this.waveform = 'triangle'
    this.mainVolume = 0.8
    this.inited = false

    this.delay = new Delay(this)
  }

  init () {
    if (!this.inited) {
      this.inited = true
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)()

      // master gain
      this.masterGain = this.audioCtx.createGain() // create master gain before output
      this.masterGain.gain.value = this.mainVolume
      // master filter
      this.masterLPfilter = this.audioCtx.createBiquadFilter()
      this.masterLPfilter.frequency.value = 5000
      this.masterLPfilter.Q.value = 1
      this.masterLPfilter.type = 'lowpass'
      // connect master gain control > filter > master output
      this.masterGain.connect(this.masterLPfilter)
      this.masterLPfilter.connect(this.audioCtx.destination)

      this.delay.init(this.audioCtx)
    }
  }

  setMainVolume (newValue) {
    const oldValue = this.mainVolume
    if (newValue !== oldValue) {
      this.mainVolume = newValue
      if (this.inited) {
        const now = this.now()
        this.masterGain.gain.value = newValue
        this.masterGain.gain.setValueAtTime(newValue, now)
      }
    }
  }

  noteOn (midinote, velocity = 127) {
    const tuningTable = model.get('tuning table')
    const frequency = tuningTable.freq[midinote]

    if (!isNil(frequency)) {
      // make sure note triggers only on first input (prevent duplicate notes)
      if (isNil(this.active_voices[midinote])) {
        this.init()

        const voice = new Voice(this.audioCtx, frequency, velocity)
        voice.bindDelay(this.delay)
        voice.bindSynth(this)
        voice.start()
        this.active_voices[midinote] = voice
        jQuery('#tuning-table-row-' + midinote).addClass('bg-playnote')

        debug('Play note ' + midinote + ' (' + frequency.toFixed(3) + ' Hz) velocity ' + velocity)
      }
    }
  }

  noteOff (midinote) {
    if (!isNil(this.active_voices[midinote])) {
      this.active_voices[midinote].stop()
      delete this.active_voices[midinote]
      jQuery('#tuning-table-row-' + midinote).removeClass('bg-playnote')

      debug('Stop note ' + midinote)
    }
  }

  now () {
    return this.audioCtx.currentTime
  }

  // this function stops all active voices and cuts the delay
  panic () {
    // show which voices are active (playing)
    debug(this.active_voices)

    // loop through active voices
    for (let i = 0; i < 127; i++) {
      // turn off voice
      this.noteOff(i)
    }

    // turn down delay gain
    jQuery('#input_range_feedback_gain').val(0)
    this.delay.gain = 0
    const now = this.now()
    this.delay.gainL.gain.setValueAtTime(this.delay.gain, now)
    this.delay.gainR.gain.setValueAtTime(this.delay.gain, now)
  }
}

export default Synth
