class Synth {
  constructor() {
    this.keymap = Keymap.EN
    this.isomorphicMapping = {
      vertical: 5, // how many scale degrees as you move up/down by rows
      horizontal: 1 // how many scale degrees as you move left/right by cols
    }
    this.voices = []
    this.midinotes_to_voices = {} // polyphonic voice allocation
    this.voices_to_midinotes = {} // polyphonic voice allocation
    this.polyphony = !R.isNil(localStorage.getItem('max_polyphony'))
      ? localStorage.getItem('max_polyphony')
      : 16
    this.nextVoice = 0
    this.waveform = 'semisine'
    this.mainVolume = 0.8
    this.inited = false

    this.delay = new Delay(this)
  }

  init() {
    // only init once
    if (!this.inited) {
      this.inited = true

      // set up Web Audio API context
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)()

      // set up custom waveforms
      this.custom_waveforms = {
        warm1: this.audioCtx.createPeriodicWave(
          new Float32Array([0, 1, 0.2, 0.2, 0.2, 0.1, 0.1, 0.05]),
          new Float32Array([0, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0])
        ),
        warm2: this.audioCtx.createPeriodicWave(
          new Float32Array([0, 1, 0.5, 0.333, 0.2, 0.1]),
          new Float32Array([0, 0, 0.0, 0.0, 0.0, 0.0])
        ),
        warm3: this.audioCtx.createPeriodicWave(
          new Float32Array([0, 1, 0.5, 0.5, 0.3]),
          new Float32Array([0, 0, 0.0, 0.0, 0.0])
        ),
        warm4: this.audioCtx.createPeriodicWave(
          new Float32Array([0, 1, 0.2, 0.2, 0.1]),
          new Float32Array([0, 0, 0.0, 0.0, 0.0])
        ),
        octaver: this.audioCtx.createPeriodicWave(
          new Float32Array([0, 1, 0.5, 0, 0.333, 0, 0, 0, 0.25, 0, 0, 0, 0, 0, 0, 0, 0.166]),
          new Float32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
        ),
        brightness: this.audioCtx.createPeriodicWave(
          new Float32Array([
            0, 1, 0, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.1, 0.1, 0.1, 0.1, 0.1
          ]),
          new Float32Array([
            0, 0, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
          ])
        ),
        harmonicbell: this.audioCtx.createPeriodicWave(
          new Float32Array([0, 1, 0.2, 0.2, 0.2, 0.2, 0, 0, 0, 0, 0, 0.7]),
          new Float32Array([0, 0, 0.0, 0.0, 0.0, 0.0, 0, 0, 0, 0, 0, 0])
        ),
        semisine: this.audioCtx.createPeriodicWave(
          new Float32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
          new Float32Array([
            0, 1, 0.25, 0.111111, 0.0625, 0.04, 0.027777, 0.020408, 0.015625, 0.0123456, 0.01,
            0.008264, 0.0069444, 0.0059171, 0.005102041, 0.0044444, 0.00390625
          ])
        ),
        template: this.audioCtx.createPeriodicWave(
          // first element is DC offset, second element is fundamental, third element is 2nd harmonic, etc.
          new Float32Array([0, 1, 0.5, 0.333, 0.25, 0.2, 0.167]), // sine components
          new Float32Array([0, 0, 0.0, 0.0, 0.0, 0.0, 0.0]) // cosine components
        )
      }

      // set up master gain
      this.masterGain = this.audioCtx.createGain()
      this.masterGain.gain.value = this.mainVolume

      // set up master filter
      this.masterLPfilter = this.audioCtx.createBiquadFilter()
      this.masterLPfilter.frequency.value = 5000
      this.masterLPfilter.Q.value = 1
      this.masterLPfilter.type = 'lowpass'

      // connect master gain control > filter > master output
      this.masterGain.connect(this.masterLPfilter)
      this.masterLPfilter.connect(this.audioCtx.destination)

      // init delay
      this.delay.init(this.audioCtx)

      // init free running oscillators
      for (i = 0; i < this.polyphony; i++) {
        this.voices[i] = new Voice(this.audioCtx)
        this.voices[i].bindDelay(this.delay)
        this.voices[i].bindSynth(this)
        this.voices[i].init()
      }
    }
  }

  setMainVolume(newValue) {
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

  noteOn(midinote, velocity = 127) {
    const frequency = tuning_table.freq[midinote]

    if (!R.isNil(frequency)) {
      // make sure note triggers only on first input (prevent duplicate notes)
      if (R.isNil(this.midinotes_to_voices[midinote])) {
        this.init()

        // round robin voice allocation, but skip voices that are still being held
        for (i = this.nextVoice; i < this.nextVoice + this.polyphony; i++) {
          // if next voice is free, use it
          if (R.isNil(this.voices_to_midinotes[(i + 1) % this.polyphony])) {
            this.nextVoice = (i + 1) % this.polyphony
            break
          }
          // if no free voices are found when the loop ends, voice stealing will result
        }

        // keep track of allocated voices
        this.midinotes_to_voices[midinote] = this.nextVoice
        this.voices_to_midinotes[this.nextVoice] = midinote

        // trigger note start
        this.voices[this.midinotes_to_voices[midinote]].start(frequency, velocity)

        // indicate playing note
        jQuery('#tuning-table-row-' + midinote).addClass('bg-playnote')
        console.log(this.midinotes_to_voices)
        //console.log("Play note " + midinote + " (" + frequency.toFixed(3) + " Hz) velocity " + velocity);
      }
    }
  }
  noteOff(midinote) {
    if (!R.isNil(this.midinotes_to_voices[midinote])) {
      // release the note
      this.voices[this.midinotes_to_voices[midinote]].stop()

      // voice allocation
      delete this.voices_to_midinotes[this.midinotes_to_voices[midinote]]
      delete this.midinotes_to_voices[midinote]

      // indicate stopped note
      jQuery('#tuning-table-row-' + midinote).removeClass('bg-playnote')
    }
  }

  now() {
    return this.audioCtx.currentTime
  }

  // this function stops all active voices and cuts the delay
  panic() {
    // show which voices are active (playing)
    console.log(this.voices)

    // loop through active voices
    for (let i = 0; i < this.polyphony; i++) {
      // turn off voice
      this.noteOff(this.voices_to_midinotes[i])
    }

    // turn down delay gain
    jQuery('#input_range_feedback_gain').val(0)
    this.delay.gain = 0
    const now = this.now()
    this.delay.gainL.gain.setValueAtTime(this.delay.gain, now)
    this.delay.gainR.gain.setValueAtTime(this.delay.gain, now)
  }
}
